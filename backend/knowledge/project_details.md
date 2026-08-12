# Aaron Toolkit

Problem:

Small online utilities are often scattered across unrelated websites with inconsistent interfaces, unclear data handling, and duplicated implementation. Aaron Toolkit was built as one extensible application where focused tools can share a catalog, interface, API, job infrastructure, and deployment model.

Repository:

https://github.com/AaronArada11/aaron-toolkit

Role:

Personal Project / Full-stack Developer

Architecture:

* Frontend: React, TypeScript, and Vite
* Backend: FastAPI Python ASGI application served with Uvicorn
* Media Processing: FFmpeg
* Background Jobs: Separate Python worker process
* Production Queue: Redis
* Production Artifact Storage: S3-compatible object storage
* Abuse Protection: Cloudflare Turnstile
* Browser OCR and persistence: Tesseract.js and IndexedDB
* Packaging and Deployment: Docker / OCI image

Current Tools:

1. Link QR Generator
   * Accepts an HTTP or HTTPS link.
   * Generates a customized PNG QR code.

2. YouTube Downloader
   * Processes permitted single-video URLs.
   * Supports MP4, MP3, and MOV output.
   * Includes an explicit requirement to follow platform terms, copyright law, and permission requirements.

3. TikTok Downloader
   * Processes permitted individual public-video URLs.
   * Supports MP4, MP3, and MOV output.
   * Validates direct TikTok video links and requires permission confirmation.

4. Image Format Converter
   * Accepts JPG, PNG, WebP, GIF, BMP, TIFF, HEIC, and AVIF.
   * Converts supported images to JPG, PNG, or WebP.

5. PDF to Word
   * Converts text-based PDF files into editable DOCX files.
   * Uses bounded background processing and does not include OCR.

6. Schedule Comparator
   * Accepts PNG, JPEG, and WebP screenshots of class schedules.
   * Uses browser-side Tesseract.js OCR to extract course, time, room, instructor, day, and unit data.
   * Lets users review and correct extracted sections before comparison.
   * Compares conflicts, school days, class time, campus time, free time, gaps, and schedule fit against preferences.
   * Exports schedule comparisons as CSV, iCalendar, or PDF files.
   * Persists projects and source screenshots in IndexedDB with an in-memory fallback.

Registry-Driven Catalog:

Aaron Toolkit is designed so a tool can be added through a manifest and feature module. The catalog then exposes that tool through search, navigation, and routing without requiring a manual homepage update.

This design keeps the homepage independent from individual tool implementations and makes the application easier to extend as more utilities are added.

Development Architecture:

* Requires Node.js 22 or newer, Python 3.11 or newer, and FFmpeg.
* The Vite frontend proxies `/api` requests to the local FastAPI application.
* Without Redis, development uses an in-process queue.
* Without production object storage, development uses local expiring artifact storage.
* The Schedule Comparator runs in the browser and stores its working data locally.

Production Architecture:

The same container image supports two process types:

* Web process: serves the Python application through Uvicorn.
* Worker process: executes background jobs.

Production deployments require Redis, S3-compatible object storage, and Cloudflare Turnstile.

Production media and PDF jobs use bounded execution, private artifact storage, short-lived pre-signed download URLs, and cleanup of temporary inputs. The Schedule Comparator does not use the server job queue because its OCR and comparison workflow runs client-side.

Testing:

* Backend tests run with pytest.
* Frontend tests run with Vitest.
* The frontend includes TypeScript and production-build checks.
* Optional real-media and local PDF conversion smoke tests are disabled by default and enabled explicitly.

Technical Decisions:

Why a registry-driven catalog?

* New tools can join search, navigation, and routing through a consistent contract.
* Individual features remain modular.
* The homepage does not need to know about every tool implementation.

Why separate web and worker processes?

* Long-running media and document tasks do not need to block API request handling.
* The same application image can be deployed in different process roles.
* Redis provides a shared queue for production workloads.

Why S3-compatible storage?

* Generated artifacts can be shared between web and worker processes.
* Artifact storage can scale independently from the application containers.
* The architecture is portable across S3-compatible providers.

Why a client-side Schedule Comparator?

* OCR and comparison can happen in the browser without sending schedule screenshots to the backend.
* IndexedDB preserves projects and source images between sessions when browser storage is available.
* Exporting CSV, iCalendar, and PDF makes the comparison useful beyond the web interface.

Key Learnings:

* Designing extensible, registry-driven applications
* Separating request handling from background processing
* Media conversion with FFmpeg
* Browser OCR and client-side data workflows
* Schedule comparison and calendar export
* Redis-backed job queues
* S3-compatible artifact storage
* Docker and multi-process production deployment
* Development fallbacks that reduce local infrastructure requirements
* Safety and permission boundaries for media-processing tools
* TypeScript frontend architecture and local browser persistence

Impact:

Aaron Toolkit demonstrates Aaron's ability to turn several practical utilities into a coherent product rather than a collection of disconnected scripts. It highlights full-stack architecture, modular feature design, browser OCR, background processing, media and document workflows, testing, and production infrastructure.


# Aaron Intelligence

Problem:

Traditional portfolio websites require visitors to manually browse multiple pages to learn about a candidate's projects, skills, and experiences. Aaron Intelligence was built to create a more interactive and conversational way for visitors, recruiters, and collaborators to learn about Aaron through natural conversation.

Architecture:

* Frontend: React, Vite
* Backend: FastAPI
* Database: Supabase PostgreSQL
* Vector Search: pgvector
* Embeddings: Gemini Embedding 001
* AI Model: Gemini 2.5 Flash
* Deployment: Vercel

Technical Decisions:

Why FastAPI?

* FastAPI provides a lightweight and high-performance backend framework for building REST APIs.
* It integrates naturally with Python-based AI workflows.
* Its simplicity allowed rapid development and iteration of the chatbot backend.

Why Supabase?

* Aaron was already familiar with Supabase from previous projects.
* Supabase provides PostgreSQL and pgvector support within a single platform.
* Using Supabase reduced infrastructure complexity and simplified development.
* Vector search could be implemented directly inside PostgreSQL through pgvector.

Why Gemini?

* Gemini provides both embedding generation and response generation capabilities.
* Using a single AI platform simplified the architecture.
* Aaron had prior experience integrating Gemini into multiple projects.
* Gemini 2.5 Flash offers a strong balance between performance, speed, and cost.

Why Gemini Embeddings?

* Gemini Embedding 001 enables semantic search through vector representations.
* Documents are retrieved based on meaning rather than exact keyword matches.
* Using Gemini for both embeddings and generation reduces dependency complexity.

Challenges:

* Designing a chatbot that only answers questions related to Aaron.
* Improving retrieval accuracy as the knowledge base expanded.
* Preventing hallucinations and unsupported responses.
* Reducing token consumption while maintaining response quality.
* Building a scalable architecture that could continue growing alongside Aaron's portfolio.

Solutions:

* Implemented semantic search using vector embeddings.
* Stored embeddings inside Supabase using pgvector.
* Added chunk-based document retrieval instead of loading entire documents.
* Implemented similarity threshold filtering to detect out-of-scope questions.
* Added prompt-level guardrails to restrict responses to Aaron-related topics.
* Migrated from direct markdown loading to a Retrieval-Augmented Generation (RAG) architecture.

Why RAG?

The first version of Aaron Intelligence loaded the entire knowledge base into every prompt. While functional, this approach became inefficient as more information was added.

Aaron migrated the project to a Retrieval-Augmented Generation (RAG) architecture to:

* Improve retrieval accuracy
* Reduce prompt size
* Lower token consumption
* Improve scalability
* Reduce hallucinations
* Support a growing knowledge base without increasing context size

How It Works:

1. The user submits a question.
2. Gemini generates an embedding for the query.
3. Supabase performs semantic similarity search using pgvector.
4. The most relevant knowledge chunks are retrieved.
5. Retrieved context is injected into the prompt.
6. Gemini 2.5 Flash generates a response grounded in the retrieved information.
7. Out-of-scope questions are filtered using similarity thresholds.

Key Learnings:

* Retrieval-Augmented Generation (RAG)
* Vector databases and semantic search
* Embedding models
* Prompt engineering
* FastAPI backend development
* Supabase and pgvector
* AI application architecture
* Production deployment workflows
* Full-stack AI systems

Future Improvements:

* Resume download integration to allow recruiters to quickly access Aaron's latest resume.
* Email capabilities that enable visitors to contact Aaron directly through the chatbot interface.
* Multi-language support to make the portfolio more accessible to a wider audience.
* Conversation memory to provide more natural and context-aware interactions.
* Source citations to improve transparency and allow users to see where responses originate from.
* Improved retrieval ranking for more accurate and relevant responses.
* Expansion of the knowledge base as Aaron gains new experiences, projects, certifications, and leadership roles.

Impact:

Aaron Intelligence serves as both a portfolio project and a demonstration of practical AI engineering skills. The project combines frontend development, backend engineering, vector databases, semantic retrieval, large language models, and production deployment into a single end-to-end application. Beyond showcasing Aaron's background, the project demonstrates his ability to design, build, and deploy modern AI-powered software systems using industry-relevant technologies and architectures.


# Mirror Mentor

Problem:

Many students rely on AI tools that provide direct answers, which can limit learning and critical thinking. Mirror Mentor was designed to encourage deeper understanding by guiding students toward solutions through questioning rather than immediately providing answers.

Architecture:

* Frontend: HTML, CSS, JavaScript
* Backend: FastAPI
* Database: Supabase
* Authentication: Supabase Auth
* AI Components: Gemini API
* Deployment: Vercel

Team:

* 4 team members

Hackathon Result:

* 4th Place
* Developed during ACM Developers Week

Role:

Hackathon Project Lead

Responsibilities:

* Led project planning and technical decision-making
* Built backend architecture
* Developed 17 REST API endpoints
* Implemented authentication and authorization
* Integrated Gemini API
* Designed conversation workflows
* Assisted with deployment

Core Feature: Socratic Questioning

Mirror Mentor uses a professor-style learning approach instead of directly providing answers.

The analysis pipeline consists of:

1. Code Understanding
2. Observation and Issue Detection
3. Socratic Questioning
4. Improvement Suggestions

This approach encourages students to think critically about their code and discover solutions independently.

Technical Decisions:

Why FastAPI?

* Rapid API development
* High performance
* Strong integration with Python AI workflows

Why Supabase?

* Managed PostgreSQL database
* Built-in authentication
* Simplified backend infrastructure

Why Gemini?

* Natural language understanding
* Ability to generate contextual educational feedback
* Easy integration with Python applications

Challenges:

* Designing an authentication system that supported multiple users simultaneously
* Persisting conversation history for individual users
* Implementing rate limiting across the platform
* Coordinating development efforts across team members
* Managing project requirements within hackathon constraints

Solutions:

* Implemented Supabase Auth for user management
* Created conversation workflows tied to user accounts
* Added backend rate limiting mechanisms
* Established clear task ownership across team members
* Focused development on core educational features

Key Learnings:

* Authentication and authorization systems
* Multi-user application design
* Conversation workflow architecture
* AI integration with backend services
* Team leadership and project management
* Rate limiting strategies
* Full-stack AI application development

Future Improvements:

* Expanded programming language support
* More advanced code analysis capabilities
* Personalized learning paths
* Progress tracking for students
* Enhanced educational feedback mechanisms

Impact:

Mirror Mentor demonstrated how AI can be used as a learning companion rather than an answer generator. The project focused on improving student understanding through guided discovery and critical thinking, aligning AI assistance with educational best practices.




# Scriptorium

Status:

In Development

Problem:

Group projects often require teams to switch between multiple platforms for file sharing, communication, document collaboration, and project management. This creates friction when trying to locate files, track project progress, and maintain a shared understanding of project knowledge.

Scriptorium was created to provide a centralized collaborative workspace where team members can upload files, collaborate in real time, and leverage AI to understand project content.

Architecture:

* Frontend: Next.js, TailwindCSS, shadcn/ui
* Backend: Convex
* Authentication: Clerk
* AI Components: Gemini API
* Payments: PayMongo (Planned)

Goals:

* Multi-tenant SaaS architecture based on workspaces and projects
* Role-based permissions (Owner, Editor, Viewer)
* Shared file library for project assets
* AI-powered workspace assistant
* Realtime collaborative document editing
* Activity timeline and audit logs
* Subscription and workspace management

AI Vision:

One of the primary goals of Scriptorium is to create an AI assistant that understands an entire workspace rather than a single conversation.

The planned system will:

* Index uploaded files using embeddings
* Perform contextual retrieval across workspace knowledge
* Generate responses grounded in uploaded documents
* Reference workspace content whenever possible

This approach allows the AI assistant to become a collaborative knowledge partner for teams rather than a generic chatbot.

Technical Areas Being Explored:

* Realtime collaborative editing
* AI document understanding
* Embeddings and retrieval systems
* Multi-tenant SaaS architecture
* Workspace knowledge management
* Role-based access control

Contributions:

* Designed overall product concept
* Implemented user authentication using Clerk
* Implemented backend infrastructure using Convex
* Built frontend components using Next.js and shadcn/ui
* Researched AI-powered document understanding workflows

Key Learnings:

* Next.js application architecture
* Convex backend development
* Authentication and user management with Clerk
* Component-driven UI development
* SaaS product design
* AI-assisted knowledge management systems

Future Improvements:

* Realtime collaborative editing
* Workspace-level RAG implementation
* File embedding pipeline
* Team activity tracking
* Workspace analytics
* Subscription billing integration
* Advanced permission management

Impact:

Although still under development, Scriptorium represents Aaron's exploration of SaaS architecture, collaborative systems, and AI-powered knowledge management. The project serves as a learning platform for advanced full-stack development concepts while addressing real challenges encountered during group collaboration.


# KUMPAS

Problem:

Communication barriers can make it difficult for Deaf and hard-of-hearing Filipinos to communicate with people who do not understand Filipino Sign Language. KUMPAS was built during ACM TechSprint: Asteria 2026 to explore how machine learning can recognize Filipino Sign Language gestures through a webcam and translate them into readable text and Philippine regional languages.

Architecture:

* Frontend: React, Vite, TypeScript
* Backend: Python inference server hosted on Railway
* Computer Vision: OpenCV, MediaPipe Holistic
* Machine Learning: TensorFlow, Keras
* Model Architecture: LSTM sequence classifier
* Dataset Format: MediaPipe hand landmark sequences stored as NumPy files
* Translation Layer: Local phrase and language translation tables
* Database: None
* Deployment: Vercel frontend, Railway backend

Technical Decisions:

Why MediaPipe?

* MediaPipe provides reliable hand landmark detection from webcam input.
* It allowed the team to focus on gesture recognition instead of building hand tracking from scratch.
* Hand landmarks reduced the complexity of the model input compared to using raw images or videos.

Why TensorFlow and Keras?

* TensorFlow and Keras are widely used for machine learning model development.
* Keras made it easier to build, train, and iterate on the LSTM model within the short hackathon timeline.
* TensorFlow supported saving trained models for real-time inference.

Why LSTM?

* Filipino Sign Language gestures are movement-based, not just static hand poses.
* LSTM models are designed to learn patterns across sequences of frames.
* This made LSTM a good fit for recognizing gestures based on hand movement over time.

Why React and Vite?

* React made it easier to build an interactive web interface for webcam-based translation.
* Vite provided a fast development workflow during the hackathon.
* The frontend could be deployed quickly through Vercel.

Why Railway?

* Railway allowed the Python inference backend to be hosted separately from the frontend.
* This made it possible to run the machine learning inference server outside the browser.
* Hosting the backend separately helped connect the web interface to the TensorFlow model.

Challenges:

* Training the model within a short hackathon development timeline.
* Collecting enough gesture data for multiple Filipino Sign Language signs.
* Making predictions reliable when hand movement, lighting, or camera visibility changed.
* Connecting real-time browser webcam input to a Python-based ML backend.
* Supporting multiple Philippine language outputs while keeping the system usable.

Solutions:

* Used MediaPipe to extract hand landmarks from webcam frames.
* Trained an LSTM model on sequential landmark data instead of raw video.
* Built a Python inference backend to process frames and return predictions.
* Connected the React frontend to the backend for real-time translation.
* Added translation support for Filipino, Cebuano, Ilocano, Waray, Hiligaynon, and Kapampangan.
* Focused on clear and visible hand movements to improve prediction reliability during testing.

How It Works:

1. The user opens KUMPAS in the browser.
2. The user allows webcam access.
3. The user performs a Filipino Sign Language gesture.
4. MediaPipe extracts hand landmarks from the camera frames.
5. The landmark sequence is sent to the TensorFlow LSTM model.
6. The model predicts the most likely sign.
7. The predicted sign is converted into readable text.
8. The output is translated into the selected Philippine language.

Performance Note:

Formal accuracy metrics were not finalized during the hackathon. However, during testing, the system produced more reliable outputs when the user’s hand movement was clear, visible, and performed in front of the camera with good lighting.

Key Learnings:

* Machine learning model training
* Filipino Sign Language recognition
* MediaPipe hand landmark extraction
* LSTM sequence classification
* TensorFlow and Keras model development
* Real-time computer vision with OpenCV
* React and Vite frontend development
* Connecting a web frontend to a hosted ML backend
* Deploying frontend and backend services separately
* Building AI-powered accessibility tools under time constraints

Future Improvements:

* Add more Filipino Sign Language signs.
* Add an option to recognize ASL.
* Support more Philippine dialects and regional languages.
* Improve the dataset with more samples per gesture.
* Add stronger evaluation metrics for accuracy and reliability.
* Improve recognition under different lighting, camera angles, and signing styles.

Impact:

KUMPAS demonstrates practical machine learning skills through an end-to-end sign language recognition system. The project combines computer vision, sequence modeling, real-time inference, frontend development, backend deployment, and multilingual translation into one working application. Built during ACM TechSprint: Asteria 2026, KUMPAS shows how machine learning can be applied to accessibility-focused software while also highlighting the team’s ability to design, train, deploy, and connect ML systems within a short development timeline.
