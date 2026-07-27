import { BarChart2, Bot, Languages, MirrorRectangular } from "lucide-react";

export const projects = [
  {
    name: "KUMPAS",
    shortDescription:
      "Real-time Filipino Sign Language recognition and translation across multiple Philippine languages.",
    description:
      "Machine learning-powered Filipino Sign Language recognition and translation system that uses webcam input to recognize FSL gestures and translate them into readable text across multiple Philippine languages. Built during ACM TechSprint: Asteria 2026.",
    tags: ["React", "Vite", "TensorFlow", "MediaPipe", "OpenCV", "Railway", "Vercel"],
    role: "ML Developer",
    context: "ACM TechSprint: Asteria 2026",
    category: "Machine learning",
    accentColor: "var(--ctp-accent)",
    icon: Languages,
    github: "https://github.com/Praybeyt-Benjamin-Techsprint/Kumpas",
    liveDemo: "https://kumpas-translator.vercel.app/",
  },
  {
    name: "Aaron Intelligence",
    shortDescription:
      "RAG-powered portfolio assistant grounded in a personal knowledge base.",
    description:
      "Personalized AI portfolio chatbot that answers questions about my projects, skills, education, and experience using a RAG-powered knowledge base.",
    tags: ["React", "Vite", "FastAPI", "Supabase", "pgvector", "Gemini"],
    role: "Full-stack Developer",
    context: "Personal project",
    category: "AI engineering",
    accentColor: "var(--ctp-accent)",
    icon: Bot,
    github: "https://github.com/AaronArada11/Aaron-Intelligence",
    liveDemo: "/",
  },
  {
    name: "AlgoVisualizer",
    shortDescription:
      "Interactive visual lessons for sorting and pathfinding algorithms.",
    description:
      "Interactive algorithm visualization platform designed to help students and developers understand fundamental computer science concepts through real-time animations and visual feedback.",
    tags: ["React", "JavaScript", "CSS", "Vercel"],
    role: "Frontend Developer",
    context: "Educational project",
    category: "Interactive systems",
    accentColor: "var(--ctp-accent)",
    icon: BarChart2,
    github: "https://github.com/AaronArada11/AlgoVisualizer",
  },
  {
    name: "Mirror Mentor",
    shortDescription:
      "A Socratic coding mentor that teaches through guided questions.",
    description:
      "AI-powered educational platform that helps students improve programming skills through guided Socratic questioning instead of direct answers. Built during ACM Developers Week.",
    tags: ["Gemini", "Supabase", "FastAPI", "Vercel"],
    role: "Project Lead",
    context: "ACM Developers Week · 4th place",
    category: "AI education",
    accentColor: "var(--ctp-accent)",
    icon: MirrorRectangular,
    github: "https://github.com/Goodness-Gracious-GG/demo",
  },
];
