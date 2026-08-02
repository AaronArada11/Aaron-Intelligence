# Project Recency

Aaron's most recent listed project is Aaron Toolkit.

Aaron Toolkit is the newest project in Aaron's current portfolio project list.

If asked about Aaron's most recent, latest, or newest project, the answer is Aaron Toolkit.

# Aaron Toolkit

Role:
Full-stack Developer

Project Type:
Personal Project

Repository:
https://github.com/AaronArada11/aaron-toolkit

Tech Stack:
- Vite
- Python
- Uvicorn
- FFmpeg
- Redis
- S3-compatible object storage
- Cloudflare Turnstile
- Docker

Description:
Aaron Toolkit is an extensible public web application for practical, focused utilities. Its catalog is registry-driven: adding a tool manifest and its feature module automatically adds the tool to search, navigation, and routing without requiring homepage changes.

Initial Tools:
- Link QR Generator for customized PNG QR codes
- YouTube Downloader for permitted single-video URLs in MP4, MP3, or MOV
- Image Format Converter for common and modern image formats
- PDF to Word converter for turning text-based PDFs into editable DOCX files

Architecture:
- Vite frontend that proxies `/api` to the Python API during development
- Python web process for API requests
- Separate Python worker process for background jobs
- Redis-backed production queues
- S3-compatible production artifact storage
- In-process development queue and local expiring artifact storage when Redis is unavailable
- Cloudflare Turnstile protection in production

Contributions:
- Designed a registry-driven utility catalog that can grow without homepage changes
- Built media, image, document, and QR workflows behind one consistent interface
- Structured the application for separate web and worker processes
- Added local development fallbacks for queues and artifact storage
- Documented local development, testing, container builds, and production requirements

Key Learnings:
- Extensible product architecture
- Registry-driven frontend design
- Background job processing
- Media processing with FFmpeg
- Redis queues
- S3-compatible object storage
- Docker-based deployment
- Safe handling of permitted media workflows

# Mirror Mentor

Role:
Hackathon Project Lead

Tech Stack:
- FastAPI
- Supabase
- Gemini API
- Vercel

Description:
AI-powered educational platform that helps students improve programming skills through guided Socratic questioning instead of direct answers.

Built during ACM Developers using FastAPI, Supabase, Gemini API, and Vercel.

Contributions:
- Built 17 REST API endpoints
- Implemented authentication and authorization
- Integrated Gemini API
- Designed conversation workflows
- Managed deployment

Key Learnings:
- AI integration
- Backend architecture
- Authentication systems
- Team leadership

# Scriptorium

Tech Stack:
- Next.js
- Convex
- Clerk
- Gemini API
- TailwindCSS
- PayMongo

Description:
AI-powered collaborative study workspace where students can upload files, create shared workspaces, and collaborate with others. Each workspace acts as a shared knowledge environment where an AI assistant can answer questions, summarize content, and explain concepts based on uploaded materials.

Features:
- Real-time collaboration
- Authentication
- Contextual AI search
- Subscription management

Key Learnings:
- Real-time systems
- Payment integration
- Full-stack development


# AlgoVisualizer

Tech Stack:

- React
- JavaScript
- CSS
- Vercel

Description:
Interactive algorithm visualization platform designed to help students and developers understand fundamental computer science concepts through real-time animations and visual feedback.

Features:

- Sorting algorithm visualizations
- Pathfinding algorithm visualizations
- Interactive grid and wall placement
- Adjustable animation speed
- Real-time algorithm execution

Key Learnings:

- Algorithm visualization techniques
- State management in React
- Animation and rendering optimization
- Interactive UI development
- Educational software design


# Aaron Intelligence

Role:

Personal Project

Tech Stack:

* React
* Vite
* FastAPI
* Supabase
* PostgreSQL
* pgvector
* Gemini Embedding 001
* Gemini 2.5 Flash
* Google GenAI SDK

Description:

Personalized AI-powered portfolio chatbot designed to act as an interactive digital representative of Aaron Randolph S.D. Arada.

Built using a Retrieval-Augmented Generation (RAG) architecture that retrieves relevant information from a personal knowledge base and generates context-aware responses about Aaron's projects, skills, education, experience, achievements, and career goals.

The project serves as both an interactive portfolio experience and a demonstration of practical AI engineering concepts including semantic retrieval, vector search, prompt engineering, and large language model integration.

Features:

* Retrieval-Augmented Generation (RAG)
* Semantic search using vector embeddings
* Personalized knowledge base
* Context-aware question answering
* Interactive chat interface
* Out-of-scope question detection
* Similarity threshold filtering
* Vector similarity search using Supabase pgvector
* Document chunking for improved retrieval accuracy
* Scalable knowledge base architecture

Contributions:

* Designed and implemented the complete RAG architecture
* Built FastAPI backend services and API endpoints
* Developed semantic retrieval using Gemini Embeddings
* Integrated Gemini 2.5 Flash for response generation
* Configured Supabase PostgreSQL and pgvector
* Designed vector similarity search workflows
* Created ingestion pipeline for embedding generation and storage
* Implemented document chunking to improve retrieval precision
* Added out-of-scope detection using similarity thresholds
* Developed React-based chatbot interface
* Integrated frontend and backend deployment workflows

Key Learnings:

* Retrieval-Augmented Generation (RAG)
* Vector databases and pgvector
* Semantic search and embeddings
* Prompt engineering
* AI application architecture
* FastAPI backend development
* Supabase integration
* Vector similarity retrieval
* Full-stack AI systems
* LLM integration and orchestration
* Production deployment workflows
* Knowledge base design and management


# KUMPAS

Role:
Hackathon Team Member / ML Developer

Tech Stack:
- React
- Vite
- TypeScript
- Python
- TensorFlow/Keras
- MediaPipe
- OpenCV
- Railway
- Vercel

Description:
Machine learning-powered Filipino Sign Language recognition and translation system that uses webcam input to recognize FSL gestures and translate them into readable text across multiple Philippine languages.

Built during ACM TechSprint: Asteria 2026 using React, Vite, Python, TensorFlow/Keras, MediaPipe, OpenCV, Railway, and Vercel.

Contributions:
- Helped build the Filipino Sign Language recognition workflow
- Trained an LSTM model using MediaPipe hand landmark sequences
- Connected webcam-based gesture input to a Python inference backend
- Integrated real-time prediction results into the React frontend
- Added multilingual translation support for Philippine languages
- Helped deploy the frontend on Vercel and backend on Railway

Key Learnings:
- Machine learning model training
- LSTM sequence classification
- MediaPipe hand landmark extraction
- Real-time computer vision
- Full-stack ML application development
- Frontend and backend deployment
- Hackathon teamwork under time constraints
