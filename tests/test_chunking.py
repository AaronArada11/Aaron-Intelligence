from backend.chunking import MAX_WORDS, chunk_markdown, validate_chunks


def test_heading_only_section_is_merged_into_child_hierarchy():
    chunks = chunk_markdown(
        "# Profile\n\n## Education\n\n### FEU Tech\n\nAaron studies computer science.",
        source="profile.md",
    )
    assert chunks[0].heading_path == ("Profile", "Education", "FEU Tech")
    assert "Education > FEU Tech" in chunks[0].embedded_content


def test_oversized_prose_is_split_with_overlap_and_bound():
    text = "# Project\n\n" + " ".join(f"word{index}" for index in range(800))
    chunks = chunk_markdown(text, source="project.md")
    assert len(chunks) == 3
    assert all(chunk.word_count <= MAX_WORDS for chunk in chunks)
    first_words = chunks[0].content.split()
    second_words = chunks[1].content.split()
    assert first_words[-50:] == second_words[:50]


def test_lists_stay_in_one_block_when_within_limit():
    chunks = chunk_markdown(
        "# Skills\n\n- Python\n- JavaScript\n- SQL",
        source="skills.md",
    )
    assert chunks[0].content == "- Python\n- JavaScript\n- SQL"


def test_hashes_are_deterministic_and_metadata_is_inherited():
    source = "# Projects\n\n## KUMPAS\n\nA sign language project."
    left = chunk_markdown(source, source="projects/kumpas.md")
    right = chunk_markdown(source, source="projects/kumpas.md")
    assert left[0].content_hash == right[0].content_hash
    assert left[0].title == "Projects"
    assert left[0].section == "KUMPAS"
    assert validate_chunks(left)["unique_hash_count"] == 1


def test_sensitive_personal_data_is_rejected():
    chunks = chunk_markdown(
        "# Profile\n\nAaron's phone is +639123456789.",
        source="profile.md",
    )
    try:
        validate_chunks(chunks)
    except ValueError as exc:
        assert "phone number" in str(exc)
    else:
        raise AssertionError("sensitive content should have been rejected")
