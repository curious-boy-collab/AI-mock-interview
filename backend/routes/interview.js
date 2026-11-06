const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { chatWithGroq } = require('../groq');

const router = express.Router();

// POST /api/interview/generate-questions
router.post('/generate-questions', authMiddleware, async (req, res) => {
  const { topic, difficulty, count } = req.body;
  const numQuestions = count || 5;

  try {
    const prompt = `Generate exactly ${numQuestions} interview questions about "${topic || 'general programming'}" at ${difficulty || 'Medium'} difficulty level.

Return ONLY a valid JSON array of objects with this exact format, no other text:
[
  { "q": "question text", "topic": "${topic || 'General'}", "skill": "${topic || 'General'}" }
]`;

    const response = await chatWithGroq([
      { role: 'system', content: 'You are an expert technical interviewer. Always respond with valid JSON only, no markdown or extra text.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.8 });

    const questions = JSON.parse(response.trim());
    res.json(questions);
  } catch (err) {
    console.error('Generate questions error:', err.message);
    const fallback = [];
    for (let i = 0; i < numQuestions; i++) {
      fallback.push({ q: `Explain concept ${i + 1} of ${topic || 'programming'} in detail.`, topic: topic || 'General', skill: topic || 'General' });
    }
    res.json(fallback);
  }
});

// POST /api/interview/evaluate
router.post('/evaluate', authMiddleware, async (req, res) => {
  const { question, answer } = req.body;

  if (!answer || !answer.trim()) {
    return res.json({
      score: 0,
      feedback: 'You did not answer this question.',
      tip: 'Try to attempt every question, even a brief answer is better than skipping.'
    });
  }

  try {
    const prompt = `You are an expert interview evaluator. Evaluate this interview answer.

Question: "${question}"
Answer: "${answer}"

Rate the answer on a scale of 0-10 and provide feedback.

Return ONLY valid JSON with this exact format, no other text:
{
  "score": <number 0-10>,
  "feedback": "<detailed feedback about the answer quality, what was good and what was missing>",
  "tip": "<specific actionable tip to improve the answer>"
}`;

    const response = await chatWithGroq([
      { role: 'system', content: 'You are an expert interview evaluator. Always respond with valid JSON only, no markdown or extra text.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3 });

    const evaluation = JSON.parse(response.trim());
    res.json({
      score: Math.min(10, Math.max(0, evaluation.score || 0)),
      feedback: evaluation.feedback || 'No feedback available.',
      tip: evaluation.tip || 'Keep practicing.'
    });
  } catch (err) {
    console.error('Evaluate error:', err.message);
    const wordCount = answer.split(/\s+/).filter(Boolean).length;
    const score = wordCount < 10 ? 3 : wordCount < 25 ? 5 : wordCount < 50 ? 7 : 8;
    res.json({
      score,
      feedback: 'AI evaluation was unavailable. Basic assessment based on answer length.',
      tip: 'Try again when the AI service is available for detailed feedback.'
    });
  }
});

// POST /api/interview/save
router.post('/save', authMiddleware, (req, res) => {
  const { interviewType, difficulty, overallScore, questions, answers, scores, date } = req.body;

  const db = readDB();

  const interview = {
    id: uuidv4(),
    userId: req.user.id,
    interviewType: interviewType || 'Technical',
    difficulty: difficulty || 'Medium',
    overallScore: overallScore || 0,
    questions: questions || [],
    answers: answers || [],
    scores: scores || [],
    date: date || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  if (!db.interviews) db.interviews = [];
  db.interviews.push(interview);
  writeDB(db);

  res.json({ message: 'Interview saved successfully', interview });
});

// GET /api/interview/history
router.get('/history', authMiddleware, (req, res) => {
  const db = readDB();
  const userInterviews = (db.interviews || []).filter(i => i.userId === req.user.id);
  res.json(userInterviews);
});

module.exports = router;
