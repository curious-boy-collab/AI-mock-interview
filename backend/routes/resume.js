const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const { chatWithGroq } = require('../groq');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// POST /api/resume/extract
router.post('/extract', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    let fileContent = '';
    if (req.file) {
      try {
        fileContent = fs.readFileSync(req.file.path, 'utf-8');
        fileContent = fileContent.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
        fileContent = fileContent.substring(0, 3000);
      } catch { fileContent = ''; }
    }

    if (fileContent.length > 50) {
      const prompt = `Extract technical skills and topics from this resume text. Group them by skill category.

Resume text: "${fileContent}"

Return ONLY valid JSON with this exact format, no other text:
{
  "name": "<candidate name if found, otherwise 'Candidate'>",
  "skills": [
    { "skill": "<skill category>", "topics": ["<topic1>", "<topic2>", "<topic3>"] }
  ]
}

Include at least 3-5 skill categories with 3-5 topics each. Focus on technical skills like programming languages, frameworks, databases, tools, etc.`;

      const response = await chatWithGroq([
        { role: 'system', content: 'You are an expert resume parser. Always respond with valid JSON only, no markdown or extra text.' },
        { role: 'user', content: prompt }
      ]);

      const parsed = JSON.parse(response.trim());
      return res.json({
        name: parsed.name || 'Candidate',
        skills: parsed.skills || []
      });
    }

    res.json({
      name: 'Candidate',
      skills: [
        { skill: 'JavaScript', topics: ['Variables & Scope', 'Closures', 'Promises & Async/Await', 'Event Loop', 'Prototypes'] },
        { skill: 'React', topics: ['Components & JSX', 'State & Props', 'Hooks', 'Virtual DOM', 'Context API'] },
        { skill: 'Node.js', topics: ['Express.js', 'Middleware', 'REST APIs', 'File System', 'Error Handling'] },
        { skill: 'Python', topics: ['Data Types', 'OOP', 'List Comprehensions', 'Decorators', 'Exception Handling'] },
        { skill: 'SQL', topics: ['Joins', 'Indexing', 'Normalization', 'Subqueries', 'Aggregation'] },
      ]
    });
  } catch (err) {
    console.error('Resume extract error:', err.message);
    res.json({
      name: 'Candidate',
      skills: [
        { skill: 'JavaScript', topics: ['Variables & Scope', 'Closures', 'Promises', 'Event Loop', 'Prototypes'] },
        { skill: 'React', topics: ['Components', 'State & Props', 'Hooks', 'Virtual DOM', 'Context API'] },
        { skill: 'Node.js', topics: ['Express.js', 'Middleware', 'REST APIs', 'Authentication', 'Error Handling'] },
      ]
    });
  }
});

// POST /api/resume/generate-questions
router.post('/generate-questions', authMiddleware, async (req, res) => {
  const { skill, topic, difficulty } = req.body;

  try {
    const prompt = `Generate ONE interview question about "${topic}" in the context of "${skill}" at ${difficulty || 'Medium'} difficulty.

The question should be specific, thought-provoking, and suitable for a technical interview.

Return ONLY valid JSON with this exact format, no other text:
{ "question": "<your interview question here>" }`;

    const response = await chatWithGroq([
      { role: 'system', content: 'You are an expert technical interviewer. Always respond with valid JSON only, no markdown or extra text.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.9 });

    const parsed = JSON.parse(response.trim());
    res.json({ question: parsed.question });
  } catch (err) {
    console.error('Generate question error:', err.message);
    res.json({ question: `Explain ${topic} in ${skill} with a real-world example.` });
  }
});

module.exports = router;
