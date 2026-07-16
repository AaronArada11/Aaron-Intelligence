begin;

create extension if not exists vector with schema extensions;
create extension if not exists pgcrypto with schema extensions;

-- Existing Supabase projects may already have extensions installed in public.
-- Resolve extension-owned types and functions from either supported schema.
set local search_path = public, extensions, pg_catalog;

do $$
begin
    if not exists (
        select 1
        from pg_type
        where typname = 'halfvec'
    ) then
        raise exception 'pgvector 0.7.0 or newer is required for 3072-dimensional HNSW indexing';
    end if;
end;
$$;

create table if not exists public.knowledge_index_versions (
    id uuid primary key default gen_random_uuid(),
    status text not null default 'staging'
        check (status in ('staging', 'active', 'retired', 'failed')),
    embedding_model text not null,
    corpus_hash text not null,
    chunk_count integer not null default 0 check (chunk_count >= 0),
    created_at timestamptz not null default now(),
    activated_at timestamptz,
    retired_at timestamptz,
    metadata jsonb not null default '{}'::jsonb
);

create unique index if not exists knowledge_index_versions_one_active
    on public.knowledge_index_versions ((status))
    where status = 'active';

create index if not exists knowledge_index_versions_corpus_hash_idx
    on public.knowledge_index_versions (corpus_hash);

create table if not exists public.knowledge_chunks (
    id uuid primary key default gen_random_uuid(),
    index_version_id uuid not null
        references public.knowledge_index_versions(id) on delete cascade,
    source_id text not null,
    source_title text not null,
    section text not null,
    heading_path text[] not null default '{}',
    chunk_ordinal integer not null check (chunk_ordinal >= 0),
    content text not null,
    embedded_content text not null,
    content_hash text not null,
    word_count integer not null check (word_count between 1 and 450),
    embedding vector(3072) not null,
    search_vector tsvector generated always as (
        to_tsvector(
            'english'::regconfig,
            source_title || ' ' || section || ' ' || content
        )
    ) stored,
    created_at timestamptz not null default now(),
    unique (index_version_id, source_id, chunk_ordinal),
    unique (index_version_id, content_hash)
);

create index if not exists knowledge_chunks_version_idx
    on public.knowledge_chunks (index_version_id);

create index if not exists knowledge_chunks_source_idx
    on public.knowledge_chunks (index_version_id, source_id);

create index if not exists knowledge_chunks_embedding_hnsw_idx
    on public.knowledge_chunks
    using hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops)
    with (m = 16, ef_construction = 64);

create index if not exists knowledge_chunks_search_gin_idx
    on public.knowledge_chunks using gin (search_vector);

alter table public.knowledge_index_versions enable row level security;
alter table public.knowledge_chunks enable row level security;

revoke all on public.knowledge_index_versions from anon, authenticated;
revoke all on public.knowledge_chunks from anon, authenticated;
grant all on public.knowledge_index_versions to service_role;
grant all on public.knowledge_chunks to service_role;

create or replace function public.match_knowledge_hybrid(
    query_text text,
    query_embedding vector(3072),
    target_version uuid default null,
    candidate_count integer default 20
)
returns table (
    id uuid,
    source text,
    title text,
    section text,
    heading_path text[],
    chunk_id integer,
    content text,
    content_hash text,
    vector_similarity double precision,
    lexical_score real,
    vector_rank bigint,
    lexical_rank bigint,
    fused_score double precision
)
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
declare
    resolved_version uuid;
    bounded_count integer := greatest(1, least(coalesce(candidate_count, 20), 100));
begin
    if target_version is null then
        select version.id
        into resolved_version
        from public.knowledge_index_versions as version
        where version.status = 'active'
        order by version.activated_at desc nulls last
        limit 1;
    else
        select version.id
        into resolved_version
        from public.knowledge_index_versions as version
        where version.id = target_version
          and version.status in ('staging', 'active');
    end if;

    if resolved_version is null then
        return;
    end if;

    return query
    with vector_candidates as (
        select
            chunk.id,
            1 - (
                chunk.embedding::halfvec(3072)
                <=> query_embedding::halfvec(3072)
            ) as similarity,
            row_number() over (
                order by
                    chunk.embedding::halfvec(3072)
                    <=> query_embedding::halfvec(3072)
            ) as rank
        from public.knowledge_chunks as chunk
        where chunk.index_version_id = resolved_version
        order by
            chunk.embedding::halfvec(3072)
            <=> query_embedding::halfvec(3072)
        limit bounded_count
    ),
    lexical_query as (
        select websearch_to_tsquery('english', coalesce(query_text, '')) as value
    ),
    lexical_candidates as (
        select
            chunk.id,
            ts_rank_cd(chunk.search_vector, lexical_query.value) as score,
            row_number() over (
                order by ts_rank_cd(chunk.search_vector, lexical_query.value) desc,
                         chunk.id
            ) as rank
        from public.knowledge_chunks as chunk
        cross join lexical_query
        where chunk.index_version_id = resolved_version
          and lexical_query.value <> ''::tsquery
          and chunk.search_vector @@ lexical_query.value
        order by score desc, chunk.id
        limit bounded_count
    ),
    fused as (
        select
            coalesce(vector_candidates.id, lexical_candidates.id) as id,
            vector_candidates.similarity,
            lexical_candidates.score as lexical_score,
            vector_candidates.rank as vector_rank,
            lexical_candidates.rank as lexical_rank,
            coalesce(0.7 / (60 + vector_candidates.rank), 0.0)
                + coalesce(0.3 / (60 + lexical_candidates.rank), 0.0) as fused_score
        from vector_candidates
        full outer join lexical_candidates using (id)
    )
    select
        chunk.id,
        chunk.source_id,
        chunk.source_title,
        chunk.section,
        chunk.heading_path,
        chunk.chunk_ordinal,
        chunk.content,
        chunk.content_hash,
        fused.similarity::double precision,
        fused.lexical_score::real,
        fused.vector_rank,
        fused.lexical_rank,
        fused.fused_score::double precision
    from fused
    join public.knowledge_chunks as chunk on chunk.id = fused.id
    order by fused.fused_score desc, fused.similarity desc nulls last, chunk.id
    limit 10;
end;
$$;

revoke all on function public.match_knowledge_hybrid(
    text,
    vector,
    uuid,
    integer
) from public, anon, authenticated;
grant execute on function public.match_knowledge_hybrid(
    text,
    vector,
    uuid,
    integer
) to service_role;

create or replace function public.activate_knowledge_index(target_version uuid)
returns table (activated_version uuid, previous_version uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
    old_version uuid;
    staged_count integer;
    expected_count integer;
begin
    perform pg_advisory_xact_lock(hashtext('knowledge-index-activation'));

    select version.chunk_count
    into expected_count
    from public.knowledge_index_versions as version
    where version.id = target_version
      and version.status in ('staging', 'retired')
    for update;

    if expected_count is null then
        raise exception 'Target index must exist and be staging or retired';
    end if;

    select count(*)::integer
    into staged_count
    from public.knowledge_chunks
    where index_version_id = target_version;

    if staged_count = 0 or staged_count <> expected_count then
        raise exception 'Chunk count mismatch: expected %, found %', expected_count, staged_count;
    end if;

    select id
    into old_version
    from public.knowledge_index_versions
    where status = 'active'
    for update;

    update public.knowledge_index_versions
    set status = 'retired', retired_at = now()
    where id = old_version;

    update public.knowledge_index_versions
    set status = 'active', activated_at = now(), retired_at = null
    where id = target_version;

    return query select target_version, old_version;
end;
$$;

revoke all on function public.activate_knowledge_index(uuid)
    from public, anon, authenticated;
grant execute on function public.activate_knowledge_index(uuid) to service_role;

create table if not exists public.chat_rate_limits (
    ip_hash text primary key,
    window_started_at timestamptz not null,
    request_count integer not null check (request_count >= 0),
    updated_at timestamptz not null default now()
);

alter table public.chat_rate_limits enable row level security;
revoke all on public.chat_rate_limits from anon, authenticated;
grant all on public.chat_rate_limits to service_role;

create or replace function public.check_chat_rate_limit(
    p_ip_hash text,
    p_limit integer default 20,
    p_window_seconds integer default 600
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
    current_row public.chat_rate_limits%rowtype;
    now_value timestamptz := clock_timestamp();
    window_interval interval := make_interval(secs => greatest(1, p_window_seconds));
    bounded_limit integer := greatest(1, p_limit);
    allowed_value boolean;
    retry_after_value integer;
begin
    if p_ip_hash is null or length(p_ip_hash) <> 64 then
        raise exception 'Invalid hashed IP';
    end if;

    insert into public.chat_rate_limits (ip_hash, window_started_at, request_count, updated_at)
    values (p_ip_hash, now_value, 1, now_value)
    on conflict (ip_hash) do update
    set
        window_started_at = case
            when public.chat_rate_limits.window_started_at + window_interval <= now_value
                then now_value
            else public.chat_rate_limits.window_started_at
        end,
        request_count = case
            when public.chat_rate_limits.window_started_at + window_interval <= now_value
                then 1
            else public.chat_rate_limits.request_count + 1
        end,
        updated_at = now_value
    returning * into current_row;

    allowed_value := current_row.request_count <= bounded_limit;
    retry_after_value := case
        when allowed_value then 0
        else greatest(
            1,
            ceil(extract(epoch from (
                current_row.window_started_at + window_interval - now_value
            )))::integer
        )
    end;

    return jsonb_build_object(
        'allowed', allowed_value,
        'remaining', greatest(0, bounded_limit - current_row.request_count),
        'retry_after', retry_after_value
    );
end;
$$;

revoke all on function public.check_chat_rate_limit(text, integer, integer)
    from public, anon, authenticated;
grant execute on function public.check_chat_rate_limit(text, integer, integer)
    to service_role;

commit;
