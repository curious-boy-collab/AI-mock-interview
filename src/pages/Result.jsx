import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveInterview, evaluateAnswer } from '../api';

const FALLBACK = {
  answers:[
    { q: 'Tell me about yourself.', topic: 'Introduction', a: 'I am a BTech 2nd year student passionate about web development and AI.' },
    { q: 'Difference between var, let, const?', topic: 'JavaScript', a: 'var is function scoped, let and const are block scoped. const cannot be reassigned.' },
    { q: 'What is REST API?', topic: 'API', a: 'REST API uses HTTP methods like GET POST PUT DELETE to communicate between client and server.' },
    { q: 'SQL vs NoSQL?', topic: 'Database', a: 'SQL is structured with tables, NoSQL is flexible like MongoDB with documents.' },
    { q: 'Explain OOP.', topic: 'OOP', a: 'OOP has 4 pillars: encapsulation, inheritance, polymorphism, abstraction.' },
  ],
  interviewType: 'Technical',
  difficulty: 'Medium',
};

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();

  const { answers, interviewType, difficulty } = location.state || FALLBACK;

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [animateScore, setAnimateScore] = useState(0);

  const evaluateWithClaude = async () => {
    try {
      const processedAnswers = answers.map(a => ({
        ...a,
        a: a.a?.trim() || '',
        skipped: !a.a?.trim(),
      }));

      const evalPromises = processedAnswers.map(a =>
        a.skipped
          ? Promise.resolve({ score: 0, status: 'Weak', feedback: 'Aapne is question ka jawab nahi diya.', tip: 'Agla baar zaroor try karo.' })
          : evaluateAnswer({ question: a.q, answer: a.a })
              .then(res => res.data)
              .catch(() => ({ score: 3, status: 'Average', feedback: 'Evaluation nahi ho saka.', tip: 'Dobara try karo.' }))
      );

      const results = await Promise.all(evalPromises);

      const totalScore = Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length * 10);

      const evals = results.map(r => ({
        score: r.score || 0,
        status: r.score >= 8 ? 'Strong' : r.score >= 6 ? 'Good' : r.score >= 4 ? 'Average' : 'Weak',
        feedback: r.feedback || 'No feedback',
        tip: r.tip || 'Keep practicing.',
      }));

      setEvaluations(evals);
      setOverallScore(totalScore);
      setOverallFeedback(
        totalScore >= 85 ? 'Excellent performance! Bahut achha kiya.' :
        totalScore >= 70 ? 'Good performance. Thoda aur practice karo.' :
        totalScore >= 50 ? 'Average performance. Improvement ki zarurat hai.' :
        'Needs improvement. Regular practice karo.'
      );
      setLoading(false);

      try {
        await saveInterview({
          interviewType,
          difficulty,
          overallScore: totalScore,
          answers: answers.map((a, i) => ({
            question: a.q,
            topic: a.topic,
            answer: a.a,
            score: evals[i]?.score || 0,
            feedback: evals[i]?.feedback || '',
            tip: evals[i]?.tip || '',
          })),
        });
      } catch (saveErr) {
        console.log('Save failed:', saveErr);
      }

      let s = 0;
      const interval = setInterval(() => {
        s += 2;
        if (s >= totalScore) { setAnimateScore(totalScore); clearInterval(interval); }
        else setAnimateScore(s);
      }, 20);

    } catch (err) {
      console.error('Evaluation Error:', err);
      const fallbackEvals = answers.map(a => {
        const skipped = !a.a?.trim();
        return {
          score: skipped ? 0 : 5,
          status: skipped ? 'Weak' : 'Average',
          feedback: skipped ? 'Aapne jawab nahi diya.' : 'Evaluation nahi ho saka.',
          tip: skipped ? 'Agla baar zaroor try karo.' : 'Backend check karo.',
        };
      });
      const avg = Math.round(fallbackEvals.reduce((a, e) => a + e.score, 0) / fallbackEvals.length * 10);
      setEvaluations(fallbackEvals);
      setOverallScore(avg);
      setOverallFeedback('Evaluation mein problem aayi.');
      setLoading(false);
      setTimeout(() => setAnimateScore(avg), 100);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { evaluateWithClaude(); }, []);

  const getBadge = (score) => {
    if (score >= 85) return { label: '🏆 Excellent', color: '#ffd700' };
    if (score >= 70) return { label: '✅ Good', color: '#4caf50' };
    if (score >= 50) return { label: '📈 Average', color: '#ff8c00' };
    return { label: '💪 Needs Work', color: '#f44336' };
  };

  const getStatusColor = (status) => {
    const map = { Strong: '#4caf50', Good: '#66bb6a', Average: '#ff8c00', Weak: '#f44336' };
    return map[status] || '#ff8c00';
  };

  const badge = getBadge(overallScore);
  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference - (animateScore / 100) * circumference;

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.glowOrb1} />
        <div style={styles.glowOrb2} />
        <div style={styles.loadingContent}>
          <div style={styles.loadingOrb}>
            <div style={styles.orbInner}>🤖</div>
          </div>
          <h2 style={styles.loadingTitle}>AI Evaluating Your Answers...</h2>
          <p style={styles.loadingSubtitle}>Claude is analysing your {answers.length} responses</p>
          <div style={styles.loadingBar}>
            <div style={styles.loadingFill} />
          </div>
          <div style={styles.loadingSteps}>
            {['Reading answers...', 'Checking accuracy...', 'Generating feedback...'].map((s, i) => (
              <div key={i} style={{ ...styles.loadingStep, animationDelay: `${i * 0.8}s` }}>{s}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      <div style={styles.header}>
        <div style={styles.logo}>⚡ InterviewAI</div>
        <div style={styles.headerBadge}>{interviewType} · {difficulty}</div>
        <button style={styles.dashBtn} onClick={() => navigate('/dashboard')}>🏠 Dashboard</button>
      </div>

      <div style={styles.content}>
        <div style={styles.scoreCard}>
          <svg width="130" height="130" style={styles.scoreSvg}>
            <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle cx="65" cy="65" r="54" fill="none" stroke="url(#grad)" strokeWidth="10"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDash}
              transform="rotate(-90 65 65)" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff8c00" />
                <stop offset="100%" stopColor="#ffd700" />
              </linearGradient>
            </defs>
            <text x="65" y="60" textAnchor="middle" fill="#fff" fontSize="28" fontWeight="900">{animateScore}</text>
            <text x="65" y="78" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">out of 100</text>
          </svg>

          <div style={styles.scoreInfo}>
            <h1 style={styles.scoreTitle}>Interview Complete! 🎉</h1>
            <div style={{ ...styles.badgeChip, color: badge.color, borderColor: badge.color }}>{badge.label}</div>
            <p style={styles.overallFeedback}>{overallFeedback}</p>
            <div style={styles.metaRow}>
              <span style={styles.metaChip}>📋 {answers.length} Questions</span>
              <span style={styles.metaChip}>🎯 {interviewType}</span>
              <span style={styles.metaChip}>⚡ {difficulty}</span>
            </div>
          </div>
        </div>

        <div style={styles.reviewSection}>
          <h2 style={styles.sectionTitle}>📝 Question-wise Breakdown</h2>
          <div style={styles.tabs}>
            {answers.map((a, i) => (
              <button key={i} style={{
                ...styles.tab,
                background: activeTab === i ? 'rgba(255,140,0,0.15)' : 'transparent',
                borderColor: activeTab === i ? '#ff8c00' : 'rgba(255,255,255,0.08)',
                color: activeTab === i ? '#ff8c00' : 'rgba(255,255,255,0.4)',
              }} onClick={() => setActiveTab(i)}>
                Q{i + 1}
                {evaluations[i] && (
                  <span style={{
                    ...styles.tabScore,
                    background: getStatusColor(evaluations[i].status) + '22',
                    color: getStatusColor(evaluations[i].status),
                  }}>{evaluations[i].score}/10</span>
                )}
              </button>
            ))}
          </div>

          {evaluations[activeTab] && (
            <div style={styles.questionCard}>
              <div style={styles.questionCardHeader}>
                <span style={styles.topicBadge}>{answers[activeTab].topic}</span>
                <span style={{
                  ...styles.statusBadge,
                  color: getStatusColor(evaluations[activeTab].status),
                  borderColor: getStatusColor(evaluations[activeTab].status),
                  background: getStatusColor(evaluations[activeTab].status) + '15',
                }}>{evaluations[activeTab].status}</span>
              </div>

              <div style={styles.qBox}>
                <div style={styles.qLabel}>Question {activeTab + 1}</div>
                <p style={styles.qText}>{answers[activeTab].q}</p>
              </div>

              <div style={styles.answerBox}>
                <div style={styles.answerLabel}>🎤 Your Answer</div>
                <p style={styles.answerText}>
                  {answers[activeTab].a?.trim() || '⚠️ Skipped — koi answer nahi diya'}
                </p>
              </div>

              <div style={styles.scoreBarRow}>
                <span style={styles.scoreBarLabel}>Score</span>
                <div style={styles.scoreBarBg}>
                  <div style={{
                    ...styles.scoreBarFill,
                    width: `${evaluations[activeTab].score * 10}%`,
                    background: getStatusColor(evaluations[activeTab].status),
                  }} />
                </div>
                <span style={{ ...styles.scoreBarNum, color: getStatusColor(evaluations[activeTab].status) }}>
                  {evaluations[activeTab].score}/10
                </span>
              </div>

              <div style={styles.feedbackBox}>
                <div style={styles.feedbackLabel}>🤖 AI Feedback</div>
                <p style={styles.feedbackText}>{evaluations[activeTab].feedback}</p>
              </div>

              <div style={styles.tipBox}>
                <div style={styles.tipLabel}>💡 Improvement Tip</div>
                <p style={styles.tipText}>{evaluations[activeTab].tip}</p>
              </div>

              <div style={styles.navRow}>
                <button style={{ ...styles.navBtn, opacity: activeTab === 0 ? 0.3 : 1 }}
                  onClick={() => setActiveTab(p => Math.max(0, p - 1))} disabled={activeTab === 0}>
                  ← Previous
                </button>
                <span style={styles.navCount}>{activeTab + 1} / {answers.length}</span>
                <button style={{ ...styles.navBtn, opacity: activeTab === answers.length - 1 ? 0.3 : 1 }}
                  onClick={() => setActiveTab(p => Math.min(answers.length - 1, p + 1))} disabled={activeTab === answers.length - 1}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.actions}>
          <button style={styles.retryBtn} onClick={() => navigate('/interview')}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            🔄 Retry Interview
          </button>
          <button style={styles.homeBtn} onClick={() => navigate('/dashboard')}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            🏠 Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f', color: '#fff', position: 'relative', overflowX: 'hidden' },
  glowOrb1: { position: 'fixed', top: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,0,0.08), transparent)', pointerEvents: 'none' },
  glowOrb2: { position: 'fixed', bottom: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.06), transparent)', pointerEvents: 'none' },
  loadingScreen: { minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  loadingContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 },
  loadingOrb: { width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,140,0,0.2), rgba(255,215,0,0.1))', border: '2px solid rgba(255,140,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 2s linear infinite' },
  orbInner: { fontSize: '40px' },
  loadingTitle: { fontSize: '24px', fontWeight: '800', margin: 0 },
  loadingSubtitle: { fontSize: '15px', color: 'rgba(255,255,255,0.4)', margin: 0 },
  loadingBar: { width: '300px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' },
  loadingFill: { height: '100%', borderRadius: '2px', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', animation: 'loadbar 2.5s ease-in-out infinite' },
  loadingSteps: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' },
  loadingStep: { fontSize: '13px', color: 'rgba(255,255,255,0.3)', animation: 'fadeInOut 2.4s ease infinite' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 36px', borderBottom: '1px solid rgba(255,140,0,0.1)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  headerBadge: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' },
  dashBtn: { background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '10px', padding: '8px 18px', color: '#ff8c00', cursor: 'pointer', fontSize: '14px' },
  content: { maxWidth: '860px', margin: '0 auto', padding: '36px 24px', display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative', zIndex: 1 },
  scoreCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.15)', borderRadius: '24px', padding: '32px', display: 'flex', gap: '36px', alignItems: 'center' },
  scoreSvg: { flexShrink: 0 },
  scoreInfo: { display: 'flex', flexDirection: 'column', gap: '12px' },
  scoreTitle: { fontSize: '28px', fontWeight: '900', margin: 0 },
  badgeChip: { display: 'inline-block', border: '1px solid', borderRadius: '20px', padding: '6px 16px', fontSize: '15px', fontWeight: '700', alignSelf: 'flex-start' },
  overallFeedback: { fontSize: '15px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0, maxWidth: '480px' },
  metaRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  metaChip: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' },
  reviewSection: {},
  sectionTitle: { fontSize: '20px', fontWeight: '800', marginBottom: '20px' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { border: '1px solid', borderRadius: '10px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' },
  tabScore: { fontSize: '11px', borderRadius: '8px', padding: '2px 6px', fontWeight: '700' },
  questionCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' },
  questionCardHeader: { display: 'flex', gap: '12px', alignItems: 'center' },
  topicBadge: { background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '20px', padding: '5px 14px', fontSize: '13px', color: '#ffb347' },
  statusBadge: { border: '1px solid', borderRadius: '20px', padding: '5px 14px', fontSize: '13px', fontWeight: '700' },
  qBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.1)', borderRadius: '14px', padding: '18px' },
  qLabel: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' },
  qText: { fontSize: '17px', fontWeight: '700', lineHeight: 1.5, margin: 0 },
  answerBox: { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px' },
  answerLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginBottom: '8px' },
  answerText: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 },
  scoreBarRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  scoreBarLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', width: '40px' },
  scoreBarBg: { flex: 1, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' },
  scoreBarFill: { height: '100%', borderRadius: '4px', transition: 'width 1s ease' },
  scoreBarNum: { fontSize: '14px', fontWeight: '800', width: '40px', textAlign: 'right' },
  feedbackBox: { background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '14px', padding: '18px' },
  feedbackLabel: { fontSize: '12px', color: 'rgba(76,175,80,0.7)', marginBottom: '8px', fontWeight: '600' },
  feedbackText: { fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0 },
  tipBox: { background: 'rgba(255,140,0,0.06)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '14px', padding: '18px' },
  tipLabel: { fontSize: '12px', color: 'rgba(255,140,0,0.7)', marginBottom: '8px', fontWeight: '600' },
  tipText: { fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' },
  navBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 20px', color: '#fff', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' },
  navCount: { fontSize: '13px', color: 'rgba(255,255,255,0.3)' },
  actions: { display: 'flex', gap: '16px', justifyContent: 'center', paddingBottom: '40px' },
  retryBtn: { background: 'linear-gradient(135deg, #ff8c00, #ffd700)', border: 'none', borderRadius: '14px', padding: '16px 36px', color: '#000', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.2s' },
  homeBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', padding: '16px 36px', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer', transition: 'transform 0.2s' },
};