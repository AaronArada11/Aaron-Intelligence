# Aaron Intelligence

## Overview

Aaron Intelligence is Aaron's personalized AI-powered portfolio chatbot. It lets visitors, recruiters, and collaborators ask natural-language questions about his projects, skills, education, experience, leadership, and career goals instead of browsing a static portfolio manually.

The application uses React and Vite on the frontend, FastAPI on the backend, Supabase PostgreSQL with pgvector for storage and retrieval, Gemini Embedding 001 for embeddings, Gemini 2.5 Flash for grounded generation, and Vercel for deployment. Aaron designed and implemented the end-to-end system.

## Problem and Architecture

The project solves the navigation problem of traditional portfolios by turning a curated knowledge base into a conversational interface. A user question is embedded, relevant chunks are retrieved, labeled context is passed to Gemini, and the response is constrained to supported facts. Out-of-scope questions are rejected through an evidence threshold.

Aaron chose Supabase because it combines managed PostgreSQL with pgvector, reduced infrastructure complexity, supported vector search in the database, and matched experience from earlier projects. He chose Gemini because it supports both embeddings and generation, simplified provider integration, and offered a useful balance of quality, latency, and cost.

## Motivation and Learnings

The first version loaded all Markdown into each prompt. Aaron moved to Retrieval-Augmented Generation to reduce prompt size, improve scalability and retrieval precision, and reduce hallucinations as the corpus grew. The project developed his skills in semantic and hybrid retrieval, vector databases, chunking, prompt design, FastAPI services, frontend integration, observability, evaluation, and production deployment.

Aaron Intelligence differs from a normal portfolio because it is interactive, conversational, and grounded in a maintainable personal knowledge base.

