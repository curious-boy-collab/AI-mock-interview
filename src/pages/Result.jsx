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

  const evaluateWithGroq = async () => {
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
        totalScore >= 85 ? 'Exceptional performance. You are interview-ready.' :
        totalScore >= 70 ? 'Strong performance. Minor improvements needed.' :
        totalScore >= 50 ? 'Average performance. Keep practicing consistently.' :
        'Needs improvement. Focus on fundamentals.'
      );
      setLoading(false);

      try {
        await saveInterview({
          interviewType, difficulty, overallScore: totalScore,
          answers: answers.map((a, i) => ({
            question: a.q, topic: a.topic, answer: a.a,
            score: evals[i]?.score || 0,
            feedback: evals[i]?.feedback || '',
            tip: evals[i]?.tip || '',
          })),
        });
      } catch (saveErr) { console.log('Save failed:', saveErr); }

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
  useEffect(() => { evaluateWithGroq(); }, []);

  const getBadge = (score) => {
    if (score >= 85) return { label: '🏆 EXCEPTIONAL', color: '#D4AF37' };
    if (score >= 70) return { label: '✅ STRONG', color: '#c8a84b' };
    if (score >= 50) return { label: '📈 AVERAGE', color: '#a08030' };
    return { label: '💪 NEEDS WORK', color: '#7a6020' };
  };

  const getStatusColor = (status) => {
    const map = { Strong: '#D4AF37', Good: '#c8a84b', Average: '#a08030', Weak: '#7a6020' };
    return map[status] || '#D4AF37';
  };

  const badge = getBadge(overallScore);
  const circumference = 2 * Math.PI * 54;
  const strokeDash = circumference - (animateScore / 100) * circumference;

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingCrown}>👑</div>
          <div style={styles.loadingBadge}>EVALUATING</div>
          <h2 style={styles.loadingTitle}>Analysing Your Performance</h2>
          <p style={styles.loadingSub}>AI is reviewing your {answers.length} responses</p>
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

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>INTERVIEW<span style={styles.logoAccent}>AI</span></div>
          <div style={styles.headerDivider} />
          <div style={styles.headerMeta}>{interviewType} · {difficulty}</div>
        </div>
        <button style={styles.dashBtn}
          onClick={() => navigate('/dashboard')}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#D4AF37'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'}
        >
          DASHBOARD
        </button>
      </div>

      <div style={styles.content}>

        {/* Score Card */}
        <div style={styles.scoreSection}>
          <div style={styles.scoreLeft}>
            <div style={styles.trophyIcon}>🏆</div>
            <div style={styles.scoreLabelTop}>PERFORMANCE SCORE</div>
            <div style={styles.scoreBig}>{animateScore}</div>
            <div style={styles.scoreOutOf}>out of 100</div>

            {/* SVG Ring */}
            <svg width="140" height="140" style={styles.scoreRing}>
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="6" />
              <circle cx="70" cy="70" r="54" fill="none" stroke="url(#goldGrad)" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDash}
                transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1.5s ease' }}
              />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="100%" stopColor="#f5d060" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div style={styles.scoreRight}>
            <div style={{ ...styles.badgeChip, color: badge.color, borderColor: badge.color }}>
              {badge.label}
            </div>
            <p style={styles.overallFeedback}>{overallFeedback}</p>

            <div style={styles.dividerRow}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>SESSION INFO</span>
              <div style={styles.dividerLine} />
            </div>

            <div style={styles.metaGrid}>
              {[
                { label: 'TYPE', val: interviewType },
                { label: 'LEVEL', val: difficulty },
                { label: 'QUESTIONS', val: answers.length },
                { label: 'SCORE', val: `${animateScore}/100` },
              ].map((m, i) => (
                <div key={i} style={styles.metaItem}>
                  <div style={styles.metaLabel}>{m.label}</div>
                  <div style={styles.metaVal}>{m.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Question Breakdown */}
        <div style={styles.breakdownSection}>
          <div style={styles.breakdownHeader}>
            <div style={styles.sectionRule} />
            <span style={styles.sectionTitle}>QUESTION BREAKDOWN</span>
            <div style={styles.sectionRule} />
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {answers.map((a, i) => (
              <button key={i}
                style={{
                  ...styles.tab,
                  background: activeTab === i ? 'rgba(212,175,55,0.1)' : 'transparent',
                  borderColor: activeTab === i ? '#D4AF37' : 'rgba(212,175,55,0.12)',
                  color: activeTab === i ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                }}
                onClick={() => setActiveTab(i)}
              >
                Q{i + 1}
                {evaluations[i] && (
                  <span style={{
                    ...styles.tabScore,
                    color: getStatusColor(evaluations[i].status),
                  }}>{evaluations[i].score}/10</span>
                )}
              </button>
            ))}
          </div>

          {/* Active Question Card */}
          {evaluations[activeTab] && (
            <div style={styles.questionCard}>
              <div style={styles.qCardTop}>
                <div style={styles.qCardLeft}>
                  <span style={styles.topicBadge}>{answers[activeTab].topic}</span>
                  <span style={{
                    ...styles.statusBadge,
                    color: getStatusColor(evaluations[activeTab].status),
                    borderColor: getStatusColor(evaluations[activeTab].status),
                  }}>
                    {evaluations[activeTab].status.toUpperCase()}
                  </span>
                </div>
                <div style={{ ...styles.qScore, color: getStatusColor(evaluations[activeTab].status) }}>
                  {evaluations[activeTab].score}<span style={styles.qScoreMax}>/10</span>
                </div>
              </div>

              {/* Score Bar */}
              <div style={styles.scoreBarRow}>
                <div style={styles.scoreBarTrack}>
                  <div style={{
                    ...styles.scoreBarFill,
                    width: `${evaluations[activeTab].score * 10}%`,
                    background: getStatusColor(evaluations[activeTab].status),
                  }} />
                </div>
              </div>

              {/* Question */}
              <div style={styles.qBox}>
                <div style={styles.qLabel}>QUESTION {activeTab + 1}</div>
                <p style={styles.qText}>{answers[activeTab].q}</p>
              </div>

              {/* Answer */}
              <div style={styles.answerBox}>
                <div style={styles.answerLabel}>YOUR ANSWER</div>
                <p style={styles.answerText}>
                  {answers[activeTab].a?.trim() || '⚠️ No answer provided'}
                </p>
              </div>

              {/* Feedback + Tip */}
              <div style={styles.feedbackGrid}>
                <div style={styles.feedbackBox}>
                  <div style={styles.feedbackLabel}>AI FEEDBACK</div>
                  <p style={styles.feedbackText}>{evaluations[activeTab].feedback}</p>
                </div>
                <div style={styles.tipBox}>
                  <div style={styles.tipLabel}>IMPROVEMENT TIP</div>
                  <p style={styles.tipText}>{evaluations[activeTab].tip}</p>
                </div>
              </div>

              {/* Nav */}
              <div style={styles.navRow}>
                <button style={{ ...styles.navBtn, opacity: activeTab === 0 ? 0.3 : 1 }}
                  onClick={() => setActiveTab(p => Math.max(0, p - 1))} disabled={activeTab === 0}>
                  ← PREV
                </button>
                <span style={styles.navCount}>{activeTab + 1} / {answers.length}</span>
                <button style={{ ...styles.navBtn, opacity: activeTab === answers.length - 1 ? 0.3 : 1 }}
                  onClick={() => setActiveTab(p => Math.min(answers.length - 1, p + 1))} disabled={activeTab === answers.length - 1}>
                  NEXT →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.retryBtn}
            onClick={() => navigate('/interview')}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            RETRY INTERVIEW ▶
          </button>
          <button style={styles.homeBtn}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            BACK TO DASHBOARD
          </button>
        </div>

      </div>

      <style>{`
        @keyframes loadbar {
          0% { width: 0%; } 70% { width: 85%; } 100% { width: 95%; }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.2; } 50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
  },

  // Loading
  loadingScreen: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    background: 'rgba(212,175,55,0.04)',
    border: '1px solid rgba(212,175,55,0.15)',
    padding: '56px 48px',
    textAlign: 'center',
    maxWidth: '420px',
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  loadingCrown: { fontSize: '48px' },
  loadingBadge: {
    fontSize: '9px',
    color: '#D4AF37',
    letterSpacing: '4px',
    fontWeight: '700',
    border: '1px solid rgba(212,175,55,0.3)',
    padding: '3px 14px',
  },
  loadingTitle: { fontSize: '22px', fontWeight: '800', color: '#fff', margin: 0 },
  loadingSub: { fontSize: '13px', color: 'rgba(255,255,255,0.3)', margin: 0 },
  loadingBar: {
    width: '240px',
    height: '1px',
    background: 'rgba(212,175,55,0.1)',
  },
  loadingFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #D4AF37, #f5d060)',
    animation: 'loadbar 2.5s ease-in-out infinite',
  },
  loadingSteps: { display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' },
  loadingStep: {
    fontSize: '11px',
    color: 'rgba(212,175,55,0.4)',
    letterSpacing: '0.5px',
    animation: 'fadeInOut 2.4s ease infinite',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 48px',
    borderBottom: '1px solid rgba(212,175,55,0.1)',
    background: 'rgba(10,10,10,0.95)',
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { fontSize: '16px', fontWeight: '900', color: '#fff', letterSpacing: '4px' },
  logoAccent: { color: '#D4AF37' },
  headerDivider: { width: '1px', height: '16px', background: 'rgba(212,175,55,0.2)' },
  headerMeta: { fontSize: '11px', color: 'rgba(212,175,55,0.5)', letterSpacing: '1px' },
  dashBtn: {
    background: 'transparent',
    border: '1px solid rgba(212,175,55,0.25)',
    padding: '7px 18px',
    color: '#D4AF37',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '2px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s',
  },

  // Content
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },

  // Score Section
  scoreSection: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '48px',
    alignItems: 'center',
    background: 'rgba(212,175,55,0.03)',
    border: '1px solid rgba(212,175,55,0.12)',
    padding: '40px',
  },
  scoreLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    position: 'relative',
  },
  trophyIcon: { fontSize: '36px', marginBottom: '4px' },
  scoreLabelTop: {
    fontSize: '8px',
    color: 'rgba(212,175,55,0.4)',
    letterSpacing: '3px',
    fontWeight: '700',
  },
  scoreBig: {
    fontSize: '64px',
    fontWeight: '900',
    color: '#D4AF37',
    lineHeight: 1,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -10%)',
  },
  scoreOutOf: {
    fontSize: '9px',
    color: 'rgba(212,175,55,0.3)',
    letterSpacing: '1px',
    position: 'absolute',
    top: '65%',
    left: '50%',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
  },
  scoreRing: { marginTop: '8px' },
  scoreRight: { display: 'flex', flexDirection: 'column', gap: '16px' },
  badgeChip: {
    display: 'inline-block',
    border: '1px solid',
    padding: '6px 18px',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '2px',
    alignSelf: 'flex-start',
  },
  overallFeedback: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.7,
    margin: 0,
  },
  dividerRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  dividerLine: { flex: 1, height: '1px', background: 'rgba(212,175,55,0.1)' },
  dividerText: { fontSize: '8px', color: 'rgba(212,175,55,0.3)', letterSpacing: '3px', fontWeight: '700' },
  metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  metaItem: {
    background: 'rgba(212,175,55,0.04)',
    border: '1px solid rgba(212,175,55,0.1)',
    padding: '10px 14px',
  },
  metaLabel: { fontSize: '8px', color: 'rgba(212,175,55,0.4)', letterSpacing: '2px', marginBottom: '4px', fontWeight: '700' },
  metaVal: { fontSize: '14px', fontWeight: '700', color: '#fff' },

  // Breakdown
  breakdownSection: {},
  breakdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  sectionRule: { flex: 1, height: '1px', background: 'rgba(212,175,55,0.1)' },
  sectionTitle: {
    fontSize: '9px',
    color: 'rgba(212,175,55,0.5)',
    letterSpacing: '4px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: {
    border: '1px solid',
    padding: '7px 16px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    letterSpacing: '1px',
    background: 'transparent',
    fontFamily: "'Inter', sans-serif",
  },
  tabScore: { fontSize: '10px', fontWeight: '800' },

  // Question Card
  questionCard: {
    background: 'rgba(212,175,55,0.03)',
    border: '1px solid rgba(212,175,55,0.1)',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  qCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qCardLeft: { display: 'flex', gap: '10px', alignItems: 'center' },
  topicBadge: {
    background: 'rgba(212,175,55,0.08)',
    border: '1px solid rgba(212,175,55,0.2)',
    padding: '4px 12px',
    fontSize: '10px',
    color: '#D4AF37',
    letterSpacing: '1px',
    fontWeight: '700',
  },
  statusBadge: {
    border: '1px solid',
    padding: '4px 12px',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1px',
  },
  qScore: { fontSize: '28px', fontWeight: '900', lineHeight: 1 },
  qScoreMax: { fontSize: '14px', color: 'rgba(255,255,255,0.2)', fontWeight: '400' },
  scoreBarRow: {},
  scoreBarTrack: {
    height: '2px',
    background: 'rgba(212,175,55,0.08)',
  },
  scoreBarFill: {
    height: '100%',
    transition: 'width 1s ease',
  },
  qBox: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(212,175,55,0.08)',
    borderLeft: '2px solid #D4AF37',
    padding: '16px 18px',
  },
  qLabel: {
    fontSize: '8px',
    color: 'rgba(212,175,55,0.4)',
    letterSpacing: '3px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  qText: { fontSize: '16px', fontWeight: '600', lineHeight: 1.6, margin: 0, color: '#fff' },
  answerBox: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '16px 18px',
  },
  answerLabel: {
    fontSize: '8px',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: '3px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  answerText: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.7,
    margin: 0,
  },
  feedbackGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  feedbackBox: {
    background: 'rgba(212,175,55,0.04)',
    border: '1px solid rgba(212,175,55,0.12)',
    padding: '14px 16px',
  },
  feedbackLabel: {
    fontSize: '8px',
    color: 'rgba(212,175,55,0.5)',
    letterSpacing: '2px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  feedbackText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 1.6,
    margin: 0,
  },
  tipBox: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    padding: '14px 16px',
  },
  tipLabel: {
    fontSize: '8px',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: '2px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  tipText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 1.6,
    margin: 0,
  },
  navRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid rgba(212,175,55,0.08)',
  },
  navBtn: {
    background: 'transparent',
    border: '1px solid rgba(212,175,55,0.15)',
    padding: '8px 18px',
    color: '#D4AF37',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '2px',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
  },
  navCount: { fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px' },

  // Actions
  actions: {
    display: 'flex',
    gap: '14px',
    justifyContent: 'center',
    paddingBottom: '48px',
  },
  retryBtn: {
    background: 'transparent',
    border: '1px solid #D4AF37',
    padding: '14px 36px',
    color: '#D4AF37',
    fontWeight: '800',
    fontSize: '12px',
    letterSpacing: '2px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'background 0.2s',
  },
  homeBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.07)',
    padding: '14px 36px',
    color: 'rgba(255,255,255,0.35)',
    fontWeight: '600',
    fontSize: '12px',
    letterSpacing: '2px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'border-color 0.2s',
  },
};