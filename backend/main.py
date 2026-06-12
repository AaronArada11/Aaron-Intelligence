from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
import os
from retriever import retrieve

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

app = FastAPI()


class ChatRequest(BaseModel):
    message: str


@app.get("/")
def root():
    return {"message": "Aaron Intelligence is running"}


@app.post("/chat")
def chat(request: ChatRequest):

    retrieved_docs = retrieve(
        request.message
    )
    context = "\n\n".join(
        doc["content"]
        for doc in retrieved_docs
    )

    prompt = f"""
    You are Aaron Intelligence.

    You are the AI representative of Aaron Randolph S.D. Arada.

    Rules:
    - Use ONLY the provided context.
    - Do not invent information.
    - If the answer is not in the context, say you do not know.
    - Be concise and professional.

    Context:
    {context}

    Question:
    {request.message}
    """

    response = model.generate_content(prompt)

    return {
        "answer": response.text
    }