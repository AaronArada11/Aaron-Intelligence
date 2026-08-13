import { BarChart2, Bot, Languages, MirrorRectangular, Wrench } from "lucide-react";

const PROJECT_IMAGE_WIDTHS = [640, 960, 1280, 1800];

function projectImage(name, width, height) {
  const variantWidths = PROJECT_IMAGE_WIDTHS.filter((variant) => variant < width);

  if (width <= 1800) {
    variantWidths.push(width);
  }

  return {
    image: `/images/projects/${name}.png`,
    imageAvifSrcSet: [...new Set(variantWidths)]
      .sort((left, right) => left - right)
      .map(
        (variant) =>
          `/images/projects/optimized/v1/${name}-${variant}.avif ${variant}w`,
      )
      .join(", "),
    imageWidth: width,
    imageHeight: height,
  };
}

export const projects = [
  {
    ...projectImage("kumpas", 1800, 1045),
    name: "KUMPAS",
    year: "2026",
    shortDescription:
      "Real-time FSL recognition across 29 gesture classes, with six-language translation from 30-frame landmark sequences.",
    description:
      "Accessibility-focused Filipino Sign Language translator built during ACM TechSprint: Asteria 2026. As the ML Developer, I helped build and deploy a webcam recognition pipeline covering 29 gesture classes, 30-frame sequences, and 126 hand-landmark features per frame, with output across six Philippine languages.",
    tags: ["React", "Vite", "TensorFlow", "MediaPipe", "OpenCV", "Railway", "Vercel"],
    role: "ML Developer",
    context: "ACM TechSprint: Asteria 2026",
    category: "Machine learning",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-accent)",
    imageAlt:
      "KUMPAS homepage presenting its Filipino Sign Language translator and six-step workflow.",
    highlights: [
      "An accessibility-focused web app that recognizes Filipino Sign Language from webcam input and translates signs into readable Philippine languages.",
      "Built the recognition pipeline for 29 FSL gesture classes, representing each sample as a 30-frame sequence with 126 MediaPipe landmark features per frame.",
      "Connected live webcam inference to readable translations across six Philippine languages and helped deploy the Vercel frontend and Railway backend.",
      "Authored 14 of the team repository's 42 commits while contributing as the project's ML Developer.",
    ],
    icon: Languages,
    github: "https://github.com/Praybeyt-Benjamin-Techsprint/Kumpas",
    liveDemo: "https://kumpas-translator.vercel.app/",
  },
  {
    ...projectImage("aaron-intelligence", 870, 840),
    name: "Aaron Intelligence",
    year: "2026",
    shortDescription:
      "RAG portfolio assistant evaluated with 65 questions; the current partial run returned successful responses for 93.8% of requests with a 2.63-second p50.",
    description:
      "Personalized portfolio assistant grounded in more than 30 knowledge documents about my projects, skills, education, and experience. Its three-run evaluation plan covers 195 requests, with 64 completed as of August 9, 2026.",
    tags: ["React", "Vite", "FastAPI", "Supabase", "pgvector", "Gemini"],
    role: "Full-stack Developer",
    context: "Personal project",
    category: "AI engineering",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-accent)",
    imageAlt:
      "Aaron Intelligence chat interface introducing the AI portfolio representative.",
    imageFit: "contain",
    highlights: [
      "A RAG-powered portfolio assistant that answers questions about my projects, skills, education, and experience from a curated knowledge base.",
      "Grounds Gemini responses in a Supabase and pgvector knowledge base containing more than 30 curated documents.",
      "Created a 65-question evaluation suite with three planned runs; the partial run completed 64 requests with 93.8% successful responses, a 2.63-second p50, and a 15.36-second p95.",
      "Ships as a responsive React portfolio with a FastAPI retrieval layer, optional Langfuse tracing, and a theme-aware chat interface.",
    ],
    icon: Bot,
    github: "https://github.com/AaronArada11/Aaron-Intelligence",
    liveDemo: "/",
  },
  {
    ...projectImage("mirror-mentor", 1800, 1045),
    name: "Mirror Mentor",
    year: "2026",
    shortDescription:
      "Socratic coding mentor with 17 endpoints and four-phase feedback, tested by five students and awarded fourth place.",
    description:
      "AI-powered educational platform built during ACM Developers Week to teach programming through guided questions instead of direct answers. As Project Lead, I led backend development across 17 REST endpoints and a four-phase Socratic feedback workflow.",
    tags: ["Gemini", "Supabase", "FastAPI", "Vercel"],
    role: "Project Lead",
    context: "ACM Developers Week · 4th place",
    category: "AI education",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-blue)",
    imageAlt:
      "Mirror Mentor interface with side-by-side code editor and AI Professor panels.",
    highlights: [
      "An AI coding mentor that helps students solve programming problems through Socratic questions instead of direct answers.",
      "Designed 17 REST endpoints for authentication, conversations, monitoring, and Gemini-assisted code analysis.",
      "Structured feedback into four Socratic phases and tested conversation flow, authentication, feedback quality, and usability with five students.",
      "Authored 18 of the team repository's 28 commits while leading the project to fourth place at ACM Developers Week.",
    ],
    icon: MirrorRectangular,
    github: "https://github.com/Goodness-Gracious-GG/demo",
  },
  {
    ...projectImage("aaron-toolkit", 1800, 1044),
    name: "Aaron Toolkit",
    year: "2026",
    shortDescription:
      "Registry-driven utility platform with six tools, queued workers, object storage, container deployment, and 24 test files.",
    description:
      "Extensible utility platform with six registered tools spanning media downloads, document and image conversion, QR generation, and schedule comparison. The production architecture separates web and worker processes through Redis queues and S3-compatible artifact storage.",
    tags: ["Vite", "Python", "FastAPI", "FFmpeg", "Redis", "S3"],
    role: "Full-stack Developer",
    context: "Personal project",
    category: "Developer utilities",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-green)",
    imageAlt:
      "Aaron Toolkit interface showing its searchable utility catalog.",
    highlights: [
      "An extensible web utility platform for media downloads, file conversion, QR generation, and schedule comparison.",
      "Built a manifest-driven catalog where each tool automatically joins search, navigation, and routing without a manual homepage update.",
      "Ships six registered utilities across media, document, image, QR, and schedule-comparison workflows.",
      "Separated web and worker processes with Redis-backed queues, S3-compatible storage, Docker deployment, and 24 backend, frontend, and end-to-end test files.",
    ],
    icon: Wrench,
    github: "https://github.com/AaronArada11/aaron-toolkit",
  },
  {
    ...projectImage("algo-visualizer", 3420, 1914),
    name: "AlgoVisualizer",
    year: "2026",
    shortDescription:
      "Interactive lessons for 11 algorithms: seven sorting methods and four pathfinding strategies.",
    description:
      "Interactive learning tool that turns 11 algorithms into step-by-step visual lessons. Learners can compare seven sorting methods and four pathfinding strategies while changing speed, array data, and traversal conditions.",
    tags: ["React", "JavaScript", "CSS"],
    role: "Frontend Developer",
    context: "Educational project",
    category: "Interactive systems",
    accentColor: "var(--ctp-accent)",
    previewColor: "var(--ctp-mauve)",
    imageAlt:
      "AlgoVisualizer sorting interface with algorithm controls and an array of green bars.",
    highlights: [
      "An interactive learning tool that visualizes sorting and pathfinding algorithms step by step.",
      "Visualizes seven sorting algorithms, including merge, quick, heap, bubble, selection, radix, and insertion sort.",
      "Demonstrates A*, Dijkstra, depth-first search, and breadth-first search with weighted grids and reconstructed paths.",
      "Exposes comparisons, swaps, visits, and traversal order through configurable real-time animation controls.",
    ],
    icon: BarChart2,
    github: "https://github.com/AaronArada11/AlgoVisualizer",
  },
];
