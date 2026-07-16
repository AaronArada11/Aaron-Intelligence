from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass
from pathlib import Path


TARGET_MIN_WORDS = 250
TARGET_MAX_WORDS = 350
MAX_WORDS = 450
OVERLAP_WORDS = 50

HEADING_PATTERN = re.compile(r"^(#{1,6})\s+(.+?)\s*$")
LIST_ITEM_PATTERN = re.compile(r"^\s*(?:[-*+] |\d+[.)] )")
SENSITIVE_PATTERNS = {
    "phone number": re.compile(r"(?<!\d)(?:\+?63|0)9\d{9}(?!\d)"),
    "exact birthday": re.compile(r"\b(?:birthday|date of birth|born on)\b", re.I),
    "relationship information": re.compile(
        r"\b(?:girlfriend|boyfriend|relationship status|romantic partner)\b",
        re.I,
    ),
    "street address": re.compile(
        r"\b\d{1,5}\s+[A-Za-z0-9 .'-]+\s(?:street|st|road|rd|avenue|ave)\b",
        re.I,
    ),
}


@dataclass(frozen=True, slots=True)
class MarkdownChunk:
    source: str
    title: str
    section: str
    heading_path: tuple[str, ...]
    chunk_ordinal: int
    content: str
    embedded_content: str
    content_hash: str
    word_count: int

    def database_row(self, *, index_version_id: str, embedding: list[float]) -> dict:
        return {
            "index_version_id": index_version_id,
            "source_id": self.source,
            "source_title": self.title,
            "section": self.section,
            "heading_path": list(self.heading_path),
            "chunk_ordinal": self.chunk_ordinal,
            "content": self.content,
            "embedded_content": self.embedded_content,
            "content_hash": self.content_hash,
            "word_count": self.word_count,
            "embedding": embedding,
        }


def word_count(value: str) -> int:
    return len(re.findall(r"\S+", value))


def normalize_text(value: str) -> str:
    return " ".join(value.split()).casefold()


def content_hash(value: str) -> str:
    return hashlib.sha256(normalize_text(value).encode("utf-8")).hexdigest()


def corpus_hash(files: list[Path]) -> str:
    digest = hashlib.sha256()
    for path in sorted(files, key=lambda item: item.as_posix()):
        digest.update(path.name.encode("utf-8"))
        digest.update(b"\0")
        digest.update(path.read_bytes())
        digest.update(b"\0")
    return digest.hexdigest()


def chunk_markdown(
    text: str,
    *,
    source: str,
    target_min_words: int = TARGET_MIN_WORDS,
    target_max_words: int = TARGET_MAX_WORDS,
    max_words: int = MAX_WORDS,
    overlap_words: int = OVERLAP_WORDS,
) -> list[MarkdownChunk]:
    sections = _parse_sections(text, source)
    chunks: list[MarkdownChunk] = []
    ordinal = 0

    for heading_path, section_text in sections:
        blocks = _content_blocks(section_text)
        packed = _pack_blocks(
            blocks,
            target_min_words=target_min_words,
            target_max_words=target_max_words,
            max_words=max_words,
            overlap_words=overlap_words,
        )
        for content in packed:
            content = content.strip()
            if not content:
                continue
            path = heading_path or (_friendly_title(source),)
            title = path[0]
            section = path[-1]
            embedded_content = f"{' > '.join(path)}\n\n{content}"
            chunks.append(
                MarkdownChunk(
                    source=source,
                    title=title,
                    section=section,
                    heading_path=path,
                    chunk_ordinal=ordinal,
                    content=content,
                    embedded_content=embedded_content,
                    content_hash=content_hash(content),
                    word_count=word_count(content),
                )
            )
            ordinal += 1

    return chunks


def _friendly_title(source: str) -> str:
    return Path(source).stem.replace("_", " ").replace("-", " ").title()


def _parse_sections(text: str, source: str) -> list[tuple[tuple[str, ...], str]]:
    sections: list[tuple[tuple[str, ...], str]] = []
    heading_stack: list[str] = []
    current_path: tuple[str, ...] = (_friendly_title(source),)
    current_lines: list[str] = []

    def flush() -> None:
        content = "\n".join(current_lines).strip()
        if content:
            sections.append((current_path, content))

    for line in text.splitlines():
        match = HEADING_PATTERN.match(line)
        if not match:
            current_lines.append(line)
            continue

        flush()
        current_lines = []
        level = len(match.group(1))
        heading = match.group(2).strip()
        heading_stack = heading_stack[: level - 1]
        while len(heading_stack) < level - 1:
            heading_stack.append(_friendly_title(source))
        heading_stack.append(heading)
        current_path = tuple(heading_stack)

    flush()
    return sections


def _content_blocks(value: str) -> list[str]:
    raw_blocks = re.split(r"\n\s*\n", value.strip())
    blocks: list[str] = []
    for raw in raw_blocks:
        lines = [line.rstrip() for line in raw.splitlines() if line.strip()]
        if not lines:
            continue
        current: list[str] = []
        current_is_list: bool | None = None
        for line in lines:
            is_list = bool(LIST_ITEM_PATTERN.match(line))
            if current and current_is_list is not None and is_list != current_is_list:
                blocks.append("\n".join(current))
                current = []
            current.append(line)
            current_is_list = is_list
        if current:
            blocks.append("\n".join(current))
    return blocks


def _pack_blocks(
    blocks: list[str],
    *,
    target_min_words: int,
    target_max_words: int,
    max_words: int,
    overlap_words: int,
) -> list[str]:
    expanded: list[str] = []
    for block in blocks:
        if word_count(block) <= max_words:
            expanded.append(block)
        else:
            expanded.extend(
                _split_long_block(
                    block,
                    target_words=target_max_words,
                    max_words=max_words,
                    overlap_words=overlap_words,
                )
            )

    packed: list[str] = []
    current: list[str] = []
    current_words = 0
    for block in expanded:
        block_words = word_count(block)
        proposed = current_words + block_words
        separator_words = 0 if not current else 1
        proposed += separator_words

        if current and (
            current_words >= target_min_words
            and proposed > target_max_words
        ):
            packed.append("\n\n".join(current))
            current = [block]
            current_words = block_words
            continue
        if current and proposed > max_words:
            packed.append("\n\n".join(current))
            current = [block]
            current_words = block_words
            continue

        current.append(block)
        current_words = proposed

    if current:
        packed.append("\n\n".join(current))
    return packed


def _split_long_block(
    block: str,
    *,
    target_words: int,
    max_words: int,
    overlap_words: int,
) -> list[str]:
    words = block.split()
    if len(words) <= max_words:
        return [block]

    size = min(target_words, max_words)
    overlap = min(max(0, overlap_words), size - 1)
    step = size - overlap
    parts = []
    start = 0
    while start < len(words):
        end = min(start + size, len(words))
        parts.append(" ".join(words[start:end]))
        if end >= len(words):
            break
        start += step
    return parts


def validate_chunks(chunks: list[MarkdownChunk]) -> dict[str, int]:
    if not chunks:
        raise ValueError("No chunks were produced")

    hashes: set[str] = set()
    sources: set[str] = set()
    for chunk in chunks:
        if not 1 <= chunk.word_count <= MAX_WORDS:
            raise ValueError(
                f"Chunk {chunk.source}:{chunk.chunk_ordinal} has {chunk.word_count} words"
            )
        if chunk.content_hash in hashes:
            raise ValueError(f"Duplicate chunk content hash: {chunk.content_hash}")
        for label, pattern in SENSITIVE_PATTERNS.items():
            if pattern.search(chunk.content):
                raise ValueError(
                    f"Public index contains disallowed {label} in {chunk.source}"
                )
        hashes.add(chunk.content_hash)
        sources.add(chunk.source)

    return {
        "chunk_count": len(chunks),
        "source_count": len(sources),
        "unique_hash_count": len(hashes),
        "min_words": min(chunk.word_count for chunk in chunks),
        "max_words": max(chunk.word_count for chunk in chunks),
    }
