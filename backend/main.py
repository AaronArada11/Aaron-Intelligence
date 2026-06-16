from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from retriever import retrieve

load_dotenv()

app = FastAPI()


@app.get("/favicon.ico")
@app.get("/favicon.png")
def favicon():
    return Response(status_code=204)


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def root():
    return {"message": "Aaron Intelligence is running"}


@app.post("/chat")
def chat(request: ChatRequest):

    try:
        retrieved_docs = retrieve(
            request.message
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    
    print("\nRetrieved Documents:")
    for doc in retrieved_docs:
        print(
            f"{doc['source']} | Similarity: {doc['similarity']:.4f}"
        )

    if (
    not retrieved_docs
    or retrieved_docs[0]["similarity"] < 0.25
    ):
        return {
        "answer": (
            "Sorry, I can't help with that. "
            "I'm Aaron Intelligence, a portfolio chatbot focused "
            "exclusively on Aaron Randolph S.D. Arada."
        )
        }

    context = "\n\n".join(
        doc["content"]
        for doc in retrieved_docs
    )

    model = genai.GenerativeModel("gemini-2.5-flash")

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

    If a user refers to Aaron using pronouns such as he, him, his, the student, the developer, the creator, or the candidate, treat those references as Aaron Randolph S.D. Arada.

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

    response = model.generate_content(prompt)

    return {
        "answer": response.text
    }