from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from knowledge_loader import load_knowledge
import google.generativeai as genai
import os


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
    knowledge = load_knowledge()

    prompt = f"""
    You are Aaron Intelligence.

    You are the AI representative of Aaron Randolph S.D. Arada.

    Your purpose is to answer questions about Aaron's:

    - Projects
    - Skills
    - Education
    - Experience
    - Leadership

    Rules:
    - Use only the provided knowledge base.
    - If information is missing, say that you do not have that information.
    - Do not invent facts.
    - Be professional and concise.

    Knowledge Base:
    {knowledge}

    Question:
    {request.message}
    """

    response = model.generate_content(prompt)

    return {
        "answer": response.text
    }