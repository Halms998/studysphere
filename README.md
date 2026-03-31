# StudySphere

A student-focused productivity platform built with Next.js, TypeScript, Supabase, and Tailwind CSS.
Forked from 
<img width="1600" height="812" alt="image" src="https://github.com/user-attachments/assets/95d086a3-c8f2-4844-b25e-cd728a657795" />

## Features

- 📖 **Study Sessions** – Create and manage collaborative study sessions
- 🃏 **Flashcards** – Flip-card decks with SM-2 spaced-repetition scheduling
- 📝 **Quizzes** – Multiple-choice quizzes with attempt tracking and scoring
- ⏱️ **Pomodoro Timer** – Built-in focus timer to structure study blocks
- 💬 **Discussions** – Post questions and answers with other students
- 🎮 **Minigames** – Reaction time, bubble, and quiz-based mini-games for breaks
- 🏆 **Leaderboard** – Points-based ranking across all students
- 👤 **Profiles** – Personal stats and progress tracking

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend/DB | Supabase (PostgreSQL) |
| Auth | JWT + bcryptjs |
| Animation | Framer Motion |

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project

### Setup
```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Apply the database schema
# Run supabase/schema.sql against your Supabase project

# Start the dev server
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Lint TypeScript/TSX files |
