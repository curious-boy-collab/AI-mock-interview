# AI Mock Interview Platform

An AI-powered mock interview practice application built with React, Node.js, Express, and Groq AI (Llama/GPT-OSS models).

## Features
- **Practice Interview**: Standard introductory questions (personal background, career goals, etc.)
- **Resume Based Interview**: Upload your resume to extract skills and generate targeted questions.
- **Custom Syllabus Interview**: Enter custom skills and topics for customized practice.
- **AI Answer Evaluation**: Real-time scoring and constructive feedback powered by Groq AI.

## Project Structure
```
AI-mock-interview/
├── backend/          # Node.js & Express API
│   ├── routes/       # Auth, interview, resume routes
│   ├── data/         # db.json database
│   └── server.js     # Server entry point
├── frontend/         # React SPA (CRA)
│   ├── src/          # React components and styling
│   └── package.json
└── package.json      # Root runner scripts
```

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn

### 2. Setup Environment Variables
- In `backend/`: Create `.env` based on `.env.example`:
  ```env
  GROQ_API_KEY=your_groq_api_key
  JWT_SECRET=your_jwt_secret
  PORT=5001
  ```
- In `frontend/`: Create `.env` based on `.env.example`:
  ```env
  REACT_APP_API_URL=http://localhost:5001
  ```

### 3. Run the App

From the root directory:
```bash
# Start Backend (Port 5001)
npm run server

# Start Frontend (Port 3000)
npm start
```
