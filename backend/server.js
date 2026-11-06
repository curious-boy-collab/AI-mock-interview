const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');
const resumeRoutes = require('./routes/resume');

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/resume', resumeRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Interview AI Backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Interview AI Backend running on http://localhost:${PORT}`);
  console.log(`🤖 Groq AI: ${process.env.GROQ_API_KEY ? 'Connected' : '⚠️  No API key found!'}`);
  console.log(`📁 Database: ${path.join(__dirname, 'data', 'db.json')}\n`);
});
