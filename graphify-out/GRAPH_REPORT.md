# Graph Report - .  (2026-07-12)

## Corpus Check
- 74 files · ~61,638 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 497 nodes · 818 edges · 41 communities (31 shown, 10 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Evaluation Pipeline
- Application and Chat UI
- Pathfinding Algorithms
- Career and Leadership
- Backend AI Services
- Visualizer Animation Controls
- Linting Dependencies
- About Page Content
- Frontend Runtime Dependencies
- Portfolio Assistant Interface
- Sorting Algorithms
- FEU Tech Emblem
- Photo Booth Portrait
- GDG Community Event
- MiniPay Community Event
- Philippine AI Ecosystem
- Beach Portrait
- Celebration Portrait
- AI Events and Learning
- La Salle Education
- Arena Portrait
- Vercel Deployment
- Resume and Education
- AWS Student Tech Day
- FEU Education Leadership
- KUMPAS Sign Language
- Personal Engineering Profile
- Professional Availability
- Frontend Entry Point
- Mirror Mentor
- Contact Channels
- Personal Interests
- Algorithm Visualizer
- Site Favicon
- Python Certification
- Excel Certification
- La Salle Reference
- MiniPay Event Reference
- Project Package Identity

## God Nodes (most connected - your core abstractions)
1. `SortingVisualizer` - 37 edges
2. `run_evaluation()` - 16 edges
3. `ask_with_retries()` - 14 edges
4. `Config` - 10 edges
5. `getNodeId()` - 10 edges
6. `chat()` - 9 edges
7. `build_summary()` - 9 edges
8. `getAStarAnimations()` - 9 edges
9. `getAStarSearchSteps()` - 9 edges
10. `getDijkstraSearchSteps()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Aaron Intelligence` --semantically_similar_to--> `Aaron Intelligence`  [INFERRED] [semantically similar]
  PRODUCT.md → backend/knowledge/projects.md
- `Aaron Intelligence Architecture` --semantically_similar_to--> `Aaron Intelligence Project`  [INFERRED] [semantically similar]
  README.md → backend/knowledge/project_details.md
- `Aaron Intelligence Frontend` --semantically_similar_to--> `Aaron Intelligence AI Portfolio Assistant`  [INFERRED] [semantically similar]
  frontend/README.md → frontend/public/Aaron-Arada-Resume.pdf
- `Python dependency manifest` --conceptually_related_to--> `Aaron Intelligence AI Portfolio Assistant`  [INFERRED]
  requirements.txt → frontend/public/Aaron-Arada-Resume.pdf
- `Python` --semantically_similar_to--> `Python Experience`  [INFERRED] [semantically similar]
  backend/knowledge/skills.md → backend/knowledge/technology_experience.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **KUMPAS recognition and translation system** — frontend_public_aaron_arada_resume_kumpas, frontend_public_aaron_arada_resume_fsl_recognition, frontend_public_aaron_arada_resume_lstm_sequence_model, frontend_public_aaron_arada_resume_multilingual_translation [EXTRACTED 1.00]
- **Aaron Intelligence retrieval-augmented portfolio system** — frontend_public_aaron_arada_resume_aaron_intelligence, frontend_public_aaron_arada_resume_rag_portfolio_assistant, frontend_public_aaron_arada_resume_semantic_search_pipeline [EXTRACTED 1.00]
- **Backend and AI dependency stack** — requirements_fastapi, requirements_google_genai, requirements_supabase, requirements_uvicorn [INFERRED 0.85]

## Communities (41 total, 10 thin omitted)

### Community 0 - "Evaluation Pipeline"
Cohesion: 0.08
Nodes (58): Any, Element, archive_outputs(), ask_with_retries(), average(), backoff_seconds(), build_summary(), ChatClient (+50 more)

### Community 1 - "Application and Chat UI"
Cohesion: 0.08
Nodes (26): App(), getCurrentPath(), AboutPage(), Chat(), isRateLimitDetail(), ChatButton(), Contact(), contactLinks (+18 more)

### Community 2 - "Pathfinding Algorithms"
Cohesion: 0.11
Nodes (40): react, getAStarAnimations(), getAStarSearchSteps(), getBreadthFirstSearchAnimations(), getBreadthFirstSearchSteps(), getDepthFirstSearchAnimations(), getDepthFirstSearchSteps(), getDijkstraAnimations() (+32 more)

### Community 3 - "Career and Leadership"
Cohesion: 0.06
Nodes (43): AI Engineer Career Goal, Production-Ready AI Systems, Personalized RAG Portfolio Chatbot, Aaron's Employability Profile, End-to-End Project Delivery, Philippine Sign Language Translation System, ACM Developers Week Leadership, Hackathon Project Lead (+35 more)

### Community 4 - "Backend AI Services"
Cohesion: 0.12
Nodes (27): get_gemini_client(), embed_chunk(), ingest_knowledge(), main(), flush_langfuse(), get_langfuse_client(), get_runtime_environment(), _has_langfuse_credentials() (+19 more)

### Community 6 - "Linting Dependencies"
Cohesion: 0.07
Nodes (28): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+20 more)

### Community 7 - "About Page Content"
Cohesion: 0.12
Nodes (13): certifications, education, escapeSvgText(), eventPhotos, eventPlaceholder(), EventsSection(), profilePhotos, ProfilePhotoStack() (+5 more)

### Community 8 - "Frontend Runtime Dependencies"
Cohesion: 0.11
Nodes (19): dependencies, gsap, lucide-react, motion, react-dom, react-markdown, remark-gfm, tailwindcss (+11 more)

### Community 9 - "Portfolio Assistant Interface"
Cohesion: 0.12
Nodes (18): Aaron Intelligence AI Portfolio Assistant, RAG-based portfolio assistant, Semantic vector retrieval pipeline, Aaron Intelligence Frontend, /chat endpoint, Frontend development commands, /github-commits endpoint, Local backend at http://localhost:8000 (+10 more)

### Community 10 - "Sorting Algorithms"
Cohesion: 0.20
Nodes (13): countSort(), doMerge(), getBubbleSortAnimations(), getHeapSortAnimations(), getMAX(), getMergeSortAnimations(), getQuickSortAnimations(), getRadixSortAnimations() (+5 more)

### Community 11 - "FEU Tech Emblem"
Cohesion: 0.32
Nodes (8): Academic Emblem, Flame, Gear, FEU Institute of Technology Emblem, FEU Institute of Technology, Open Book, Technology Education, 1992

### Community 12 - "Photo Booth Portrait"
Cohesion: 0.39
Nodes (8): Profile photo showing a laptop displaying a Photo Booth selfie, Pink heart camera effect, Laptop computer, Mirror selfie, Photo Booth application, Red and white track jacket, Smartphone used to take the selfie, Young person making a playful facial expression

### Community 13 - "GDG Community Event"
Cohesion: 0.43
Nodes (7): Conference Networking, Developer Community Event, Event Stage and Presentation Screen, Four Event Attendees, Google Developer Groups, Google Developer Groups Event Group Photo, Make New Friends Theme

### Community 14 - "MiniPay Community Event"
Cohesion: 0.38
Nodes (7): Celo Ecosystem, QR-Based Digital Onboarding, Event Attendee, MiniPay Event Photograph, MiniPay Community Event, Projected Technology Presentation, Presentation QR Code

### Community 15 - "Philippine AI Ecosystem"
Cohesion: 0.52
Nodes (7): Philippine AI Ecosystem Collaboration, Event Attendee, State of the Nation in A.I. Event Photo, Global AI Council Philippines, GSIS Theater, Philippines AI Ecosystem Builders, State of the Nation in A.I.

### Community 16 - "Beach Portrait"
Cohesion: 0.38
Nodes (7): Beach Leisure, Beach Portrait, Casual Beachwear, Folding Chair, Sandy Beach, Seated Person, Sunglasses

### Community 17 - "Celebration Portrait"
Cohesion: 0.33
Nodes (7): Profile photograph of a smiling young person holding a flower bouquet at night, Celebratory occasion, Dental braces, Pink-wrapped flower bouquet, Outdoor nighttime setting, Smiling young person, White polo shirt

### Community 18 - "AI Events and Learning"
Cohesion: 0.33
Nodes (6): AWS Academy Generative AI Foundations, AWS Students Tech Day, GDG Cloud Manila Build with AI, Multi-Agent AI Workflows, Responsible AI, State of the Nation in AI

### Community 19 - "La Salle Education"
Cohesion: 0.33
Nodes (6): 1985, La Salle College Antipolo Emblem, Faith, Service, and Commitment, La Salle College Antipolo, Lasallian Education, Fides Servitium Committere

### Community 20 - "Arena Portrait"
Cohesion: 0.47
Nodes (6): Casual Graphic Sweatshirt, Large Indoor Arena, Live Event Attendance, Profile Portrait at an Indoor Event, Smiling Portrait Subject, Spectator Crowd

### Community 21 - "Vercel Deployment"
Cohesion: 0.33
Nodes (5): buildCommand, headers, outputDirectory, rewrites, version

### Community 22 - "Resume and Education"
Cohesion: 0.40
Nodes (5): Aaron Randolph Arada, Professional certifications, BS Computer Science, Software Engineering specialization at FEU Institute of Technology, Aaron Randolph Arada Resume, Technical skills

### Community 23 - "AWS Student Tech Day"
Cohesion: 0.70
Nodes (5): Amazon Web Services, Cloud Technology Education, Event Attendee, AWS Student Tech Day Photo, Student Technology Event

### Community 24 - "FEU Education Leadership"
Cohesion: 0.50
Nodes (4): BS Computer Science in Software Engineering, FEU Institute of Technology, AWS Learning Club FEU Tech, Founding Co-Lead Role

### Community 25 - "KUMPAS Sign Language"
Cohesion: 0.50
Nodes (4): Real-time Filipino Sign Language recognition, KUMPAS Filipino Sign Language Translator, LSTM sequence classification model, Translation across six Philippine languages

### Community 26 - "Personal Engineering Profile"
Cohesion: 0.67
Nodes (3): Aaron Randolph S.D. Arada, AI and Software Engineering Focus, Practical Software Creation

### Community 27 - "Professional Availability"
Cohesion: 0.67
Nodes (3): Preferred Software and AI Opportunities, Aaron's Professional Availability, Remote or Hybrid Work Options

### Community 28 - "Frontend Entry Point"
Cohesion: 0.67
Nodes (3): Aaron Arada HTML entry document, /src/main.jsx module, Root application mount

### Community 29 - "Mirror Mentor"
Cohesion: 0.67
Nodes (3): Mirror Mentor, Secure real-time educational backend, Four-phase Socratic questioning framework

## Knowledge Gaps
- **117 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `SortingVisualizer` connect `Visualizer Animation Controls` to `Application and Chat UI`, `Pathfinding Algorithms`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Frontend Runtime Dependencies` to `Pathfinding Algorithms`, `Linting Dependencies`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `react` connect `Pathfinding Algorithms` to `Frontend Runtime Dependencies`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _117 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Evaluation Pipeline` be split into smaller, more focused modules?**
  _Cohesion score 0.07869742198100407 - nodes in this community are weakly interconnected._
- **Should `Application and Chat UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07575757575757576 - nodes in this community are weakly interconnected._
- **Should `Pathfinding Algorithms` be split into smaller, more focused modules?**
  _Cohesion score 0.11416490486257928 - nodes in this community are weakly interconnected._