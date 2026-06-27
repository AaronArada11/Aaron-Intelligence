# Aaron Intelligence (AI)

Aaron Intelligence is a personalized AI-powered portfolio chatbot designed to act as an interactive digital representation of Aaron Randolph S.D. Arada.

Instead of navigating through multiple portfolio pages or reading a static resume, visitors can ask questions about Aaron's projects, skills, education, experience, and achievements through natural conversation.

The chatbot uses Google's Gemini model and a custom knowledge base built from structured Markdown files containing information about Aaron's professional and academic journey.

---

## Features

* AI-powered conversational interface
* Personalized responses based on Aaron's knowledge base
* Answers questions about:

  * Projects
  * Skills
  * Education
  * Experience
  * Leadership roles
  * Achievements
* FastAPI backend
* React frontend
* Gemini AI integration
* Easily maintainable Markdown-based knowledge system

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* FastAPI
* Python
* Uvicorn

### AI

* Google Gemini

### Knowledge Base

* Markdown Documents

---

## Project Structure

```
Aaron Intelligence (AI)
├──backend
│   ├──knowledge
│   │   ├──about.md
│   │   ├──achievements.md
│   │   ├──education.md
│   │   ├──experience.md
│   │   ├──faq.md
│   │   ├──projects.md
│   │   └──skills.md
│   ├──knowledge_loader.py
│   └──main.py
├──frontend
│   ├──public
│   ├──src
│   │   ├──assets
│   │   ├──components
│   │   │   ├──ChatInput.jsx
│   │   │   ├──ChatWindow.jsx
│   │   │   └──MessageBubble.jsx
│   │   ├──App.css
│   │   ├──App.jsx
│   │   ├──index.css
│   │   └──main.jsx
│   ├──eslint.config.js
│   ├──index.html
│   ├──package-lock.json
│   ├──package.json
│   ├──README.md
│   ├──vite.config.js
│   └──.gitignore
├──README.md
├──requirements.txt
└──.gitignore
```

---

## How It Works

1. A user submits a question through the React frontend.
2. FastAPI receives the request.
3. Aaron Intelligence loads the knowledge base from Markdown files.
4. The knowledge base and user question are sent to Gemini.
5. Gemini generates a response using only the provided information.
6. The response is returned to the user.

### Current Architecture (Version 1)

```text
User
 ↓
React Frontend
 ↓
FastAPI Backend
 ↓
Knowledge Base (.md files)
 ↓
Gemini
 ↓
Response
```

---

## Knowledge Base

Aaron Intelligence currently uses a file-based knowledge system.

Knowledge is organized into the following documents:

* about.md
* projects.md
* skills.md
* education.md
* experience.md
* achievements.md
* faq.md

Updating the chatbot's knowledge only requires editing these files.

---

## Setup

### Clone Repository

```bash
git clone <repository-url>
cd "Aaron Intelligence (AI)"
```

### Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Configure Environment Variables

Create:

```text
backend/.env
```

Add:

```env
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

Optional Langfuse tracing:

```env
LANGFUSE_PUBLIC_KEY=YOUR_LANGFUSE_PUBLIC_KEY
LANGFUSE_SECRET_KEY=YOUR_LANGFUSE_SECRET_KEY
LANGFUSE_BASE_URL=https://jp.cloud.langfuse.com
```

Langfuse tracing is server-side only. If these variables are missing, the
chatbot still runs without sending traces.

---

## Run Backend

From the project root:

```bash
uvicorn backend.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Example Questions

* Who is Aaron Randolph S.D. Arada?
* What projects has Aaron built?
* Tell me about Mirror Mentor.
* What technologies does Aaron use?
* What leadership experience does Aaron have?
* What makes Aaron Intelligence different from other chatbot projects?
* What is Aaron currently studying?

---

## Future Improvements

### Version 2

* Conversation memory
* Improved prompt engineering
* Better chat UI
* Typing indicators
* Message streaming

### Version 3

* Retrieval-Augmented Generation (RAG)
* Embeddings
* Vector search
* Supabase integration
* Source citations
* Analytics dashboard

---

## Author

**Aaron Randolph S.D. Arada**

Computer Science Student

Interested in:

* Artificial Intelligence
* Software Engineering
* Full-Stack Development
* Cloud Computing

---

## License

This project is intended for educational, portfolio, and professional showcase purposes.
