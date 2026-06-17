from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from backend.retriever import retrieve
from pathlib import Path
import os
import traceback

load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY not found")

genai.configure(api_key=GEMINI_API_KEY)

fastapi_app = FastAPI()

FRONTEND_DIST = Path(__file__).resolve().parents[1] / "frontend" / "dist"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"


@fastapi_app.get("/favicon.ico")
@fastapi_app.get("/favicon.png")
def favicon():
    return Response(status_code=204)


class ChatRequest(BaseModel):
    message: str


@fastapi_app.post("/chat")
@fastapi_app.post("/api/chat")
def chat(request: ChatRequest):

    print("\n====================")
    print("NEW CHAT REQUEST")
    print("====================")
    print("Question:", request.message)

    # -------------------------
    # Retrieval
    # -------------------------
    try:
        print("Running retriever...")

        retrieved_docs = retrieve(request.message)

        print(f"Retriever returned {len(retrieved_docs)} documents")

        for doc in retrieved_docs:
            print(
                f"{doc['source']} | Similarity: {doc['similarity']:.4f}"
            )

    except Exception as exc:
        print("RETRIEVER ERROR")
        print(repr(exc))
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Retriever error: {str(exc)}"
        )

    # -------------------------
    # Out of scope
    # -------------------------
    if (
        not retrieved_docs
        or retrieved_docs[0]["similarity"] < 0.25
    ):
        print("Question classified as out-of-scope")

        return {
            "answer": (
                "Sorry, I can't help with that. "
                "I'm Aaron Intelligence, a portfolio chatbot focused "
                "exclusively on Aaron Randolph S.D. Arada."
            )
        }

    # -------------------------
    # Context Creation
    # -------------------------
    try:
        context = "\n\n".join(
            doc["content"]
            for doc in retrieved_docs
        )

        print("Context built successfully")

    except Exception as exc:
        print("CONTEXT BUILD ERROR")
        print(repr(exc))
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Context error: {str(exc)}"
        )

    # -------------------------
    # Gemini
    # -------------------------
    try:
        print("Creating Gemini model...")

        model = genai.GenerativeModel(
            "gemini-2.5-flash"
        )

        prompt = f"""
You are Aaron Intelligence.

You are the AI representative of Aaron Randolph S.D. Arada.

Your purpose is to help visitors, recruiters, and collaborators
learn about Aaron through conversation.

You may only answer questions related to:

- Aaron's projects
- Aaron's skills
- Aaron's education
- Aaron's experience
- Aaron's achievements
- Aaron's interests
- Aaron's leadership experience
- Aaron's career goals

If a user refers to Aaron using pronouns such as he, him, his,
the student, the developer, the creator, or the candidate,
treat those references as Aaron Randolph S.D. Arada.

Rules:
- Use ONLY the provided context.
- Do not invent facts.
- Do not make assumptions.
- If the answer cannot be found in the context, say that you do not have that information.
- Keep responses professional, concise, and accurate.
- Do not answer general knowledge questions.
- Do not answer questions unrelated to Aaron.

Context:
{context}

Question:
{request.message}
"""

        print("Calling Gemini...")

        response = model.generate_content(prompt)

        print("Gemini response received successfully")

        return {
            "answer": response.text
        }

    except Exception as exc:
        print("GEMINI ERROR")
        print(repr(exc))
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Gemini error: {str(exc)}"
        )


# Explicit assets mount
if FRONTEND_ASSETS.exists():
    fastapi_app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_ASSETS),
        name="frontend-assets",
    )


# Frontend mount
if FRONTEND_DIST.exists():
    fastapi_app.mount(
        "/",
        StaticFiles(
            directory=FRONTEND_DIST,
            html=True
        ),
        name="frontend",
    )


# Vercel entrypoint
app = fastapi_app