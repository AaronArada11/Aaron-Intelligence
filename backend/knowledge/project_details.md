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
* Developed during ACM TechSprint: Asteria

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
