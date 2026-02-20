# 🚀 YouTube Analyzer (AI-Powered Full-Stack Application)

An AI-powered full-stack web application that analyzes YouTube videos and channels to help users decide whether content is worth watching or following.

Users can paste any YouTube video or channel URL and receive:

- Key statistics
- Upload behavior insights
- AI-generated summaries
- Comment sentiment analysis (with interactive charts)
- A clear “Worth Watching” or “Worth Following” verdict

---

## 🌟 Live Demo

> *(Add deployment link here once deployed)*

---

## ✨ Core Features

### 🎬 Video Analysis

- Video metadata (title, views, upload date, channel)
- AI-generated summary
- Comment sentiment analysis
- Interactive Bar & Pie charts (Recharts)
- “Worth Watching” recommendation
- Improvement suggestions
- Graceful handling when comments are disabled

---

### 📺 Channel Analysis

- Channel metadata (subscribers, total videos, creation date)
- Upload frequency detection (daily / weekly / bi-weekly / irregular)
- AI-generated channel summary
- Quality score (0–100)
- “Worth Following” recommendation

---

## 🧠 Engineering Highlights

This project was designed with production-like considerations.

### 🔹 Custom React Hook Architecture

`useYouTubeAnalysis` centralizes:

- API communication
- Loading state
- Error handling
- Caching
- History management

This keeps UI components clean and reusable.

---

### 🔹 Smart Caching Strategy

- Results stored in localStorage
- 24-hour cache expiration
- Prevents redundant API calls
- History sorted by timestamp
- Remove individual entries or clear all

---

### 🔹 Resilient Backend

Handles real-world API edge cases:

- Invalid URLs
- Private or unavailable videos
- Disabled comments (YouTube 403 handling)
- AI JSON parsing failures
- Network failures
- Graceful degradation instead of crashing

---

### 🔹 Performance Optimizations

- `useCallback` for stable handler references
- `React.memo` to prevent unnecessary re-renders
- Controlled state-driven UI rendering
- Separation of chart logic into reusable components

---

### 🔹 Interactive Data Visualization

- Recharts integration
- Toggle between Bar and Pie sentiment charts
- Responsive container layout
- Clean UX-focused design

---

## 🛠 Tech Stack

### Frontend

- React (Vite)
- Tailwind CSS
- Recharts
- Custom Hooks
- Fetch API

### Backend

- Node.js
- Express
- YouTube Data API v3
- OpenAI API (GPT-4o-mini)
- Axios

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/youtube-analyzer.git
cd youtube-analyzer
```

### 2️⃣ Backend Setup
- cd src/backend
- npm install

### Create a .env file:

- YOUTUBE_API_KEY=your_youtube_api_key
- OPENAI_API_KEY=your_openai_api_key

### Run backend:
- node index.js

### 3️⃣ Frontend Setup
- npm install
- npm run dev

### 🧩 Architecture Overview
```bash
-Frontend (React)
    ↓
-Custom Hook (useYouTubeAnalysis)
    ↓
-Backend (Express API)
    ↓
-YouTube Data API + OpenAI API
```

### 📌 Real-World Problems Solved

- Handling YouTube comment 403 errors

- Preventing backend crashes on partial API failure

- Ensuring AI always returns safe structured JSON

- Avoiding duplicate API calls with caching

- Designing flexible UI for different result types (video vs channel)

### 🚀 Future Improvements

- TypeScript migration

- Request cancellation (AbortController)

- Transcript-based AI analysis

- Rate limiting middleware

- Authentication & saved accounts

- Deployment (Vercel + Render)