import { BarChart2, Bot, Languages, MirrorRectangular, Wrench } from "lucide-react";

export const projects = [
  {
    name: "Aaron Toolkit",
    year: "2026",
    shortDescription:
      "Registry-driven web utility catalog for media, document, image, and QR workflows.",
    description:
      "Extensible web app for focused utilities, including QR generation, permitted-media downloads, image conversion, and PDF-to-DOCX conversion.",
    tags: ["Vite", "Python", "FastAPI", "FFmpeg", "Redis", "S3"],
    role: "Full-stack Developer",
    context: "Personal project",
    category: "Developer utilities",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-green)",
    image: "/images/projects/aaron-toolkit.png",
    imageAlt:
      "Aaron Toolkit interface showing its searchable catalog of four active utilities.",
    highlights: [
      "Built an extensible utility catalog where adding a tool manifest and feature module automatically updates search, navigation, and routing.",
      "Ships four initial tools: a link QR generator, permitted YouTube downloader, image format converter, and PDF-to-Word converter.",
      "Designed a production architecture with a Vite frontend, Python API and worker processes, Redis-backed queues, and S3-compatible artifact storage.",
    ],
    icon: Wrench,
    github: "https://github.com/AaronArada11/aaron-toolkit",
  },
  {
    name: "KUMPAS",
    year: "2026",
    shortDescription:
      "Real-time Filipino Sign Language recognition and translation across multiple Philippine languages.",
    description:
      "Machine learning-powered Filipino Sign Language recognition and translation system that uses webcam input to recognize FSL gestures and translate them into readable text across multiple Philippine dialects. Built during ACM TechSprint: Asteria 2026.",
    tags: ["React", "Vite", "TensorFlow", "MediaPipe", "OpenCV", "Railway", "Vercel"],
    role: "ML Developer",
    context: "ACM TechSprint: Asteria 2026",
    category: "Machine learning",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-yellow)",
    image: "/images/projects/kumpas.png",
    imageAlt:
      "KUMPAS homepage presenting its Filipino Sign Language translator and six-step workflow.",
    highlights: [
      "Recognizes Filipino Sign Language gestures from a live webcam feed using a custom machine learning pipeline.",
      "Translates recognized signs into readable Filipino and multiple Philippine languages in real time.",
      "Built an accessible, responsive interface that makes multilingual communication easier for Deaf and hearing users.",
    ],
    icon: Languages,
    github: "https://github.com/Praybeyt-Benjamin-Techsprint/Kumpas",
    liveDemo: "https://kumpas-translator.vercel.app/",
  },
  {
    name: "Aaron Intelligence",
    year: "2026",
    shortDescription:
      "RAG-powered portfolio assistant grounded in a personal knowledge base.",
    description:
      "Personalized AI portfolio chatbot that answers questions about my projects, skills, education, and experience using a RAG-powered knowledge base.",
    tags: ["React", "Vite", "FastAPI", "Supabase", "pgvector", "Gemini"],
    role: "Full-stack Developer",
    context: "Personal project",
    category: "AI engineering",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-green)",
    image: "/images/projects/aaron-intelligence.png",
    imageAlt:
      "Aaron Intelligence chat interface introducing the AI portfolio representative.",
    imageFit: "contain",
    highlights: [
      "Built a retrieval-augmented assistant that answers questions about my projects, skills, education, and experience.",
      "Grounds Gemini responses in a Supabase and pgvector knowledge base instead of relying on generic model memory.",
      "Ships as a responsive React portfolio with a FastAPI retrieval layer and theme-aware interface.",
    ],
    icon: Bot,
    github: "https://github.com/AaronArada11/Aaron-Intelligence",
    liveDemo: "/",
  },
  {
    name: "AlgoVisualizer",
    year: "2026",
    shortDescription:
      "Interactive visual lessons for sorting and pathfinding algorithms.",
    description:
      "Interactive algorithm visualization tool designed to help students and developers understand fundamental computer science concepts through real-time animations and visual feedback.",
    tags: ["React", "JavaScript", "CSS"],
    role: "Frontend Developer",
    context: "Educational project",
    category: "Interactive systems",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-mauve)",
    image: "/images/projects/algo-visualizer.png",
    imageAlt:
      "AlgoVisualizer sorting interface with algorithm controls and an array of green bars.",
    highlights: [
      "Turns sorting and pathfinding algorithms into step-by-step animations that expose comparisons, swaps, and traversal order.",
      "Lets learners change algorithms and visualization parameters to understand how each approach behaves.",
      "Designed the interface as an interactive learning tool for students building algorithm intuition.",
    ],
    icon: BarChart2,
    github: "https://github.com/AaronArada11/AlgoVisualizer",
  },
  {
    name: "Mirror Mentor",
    year: "2026",
    shortDescription:
      "A Socratic coding mentor that teaches through guided questions.",
    description:
      "AI-powered educational platform that helps students improve programming skills through guided Socratic questioning instead of direct answers. Built during ACM Developers Week.",
    tags: ["Gemini", "Supabase", "FastAPI", "Vercel"],
    role: "Project Lead",
    context: "ACM Developers Week · 4th place",
    category: "AI education",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-blue)",
    image: "/images/projects/mirror-mentor.png",
    imageAlt:
      "Mirror Mentor interface with side-by-side code editor and AI Professor panels.",
    highlights: [
      "Guides students through code problems with Socratic questions rather than giving away direct answers.",
      "Combines Gemini analysis with persistent Supabase conversations and secure authentication workflows.",
      "Led the project from learning concept to a deployed educational platform, earning 4th place at ACM Developers Week.",
    ],
    icon: MirrorRectangular,
    github: "https://github.com/Goodness-Gracious-GG/demo",
    liveDemo: "https://demo-eight-delta-44.vercel.app/",
  },
];
