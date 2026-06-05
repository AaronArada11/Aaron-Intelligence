from pathlib import Path

def load_knowledge():
    knowledge_dir = Path("knowledge")

    content = ""

    for file in knowledge_dir.glob("*.md"):
        content += file.read_text()
        content += "\n\n"

    return content