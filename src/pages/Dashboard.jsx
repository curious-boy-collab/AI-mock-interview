import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, getHistory } from '../api';

const PRACTICE_QUESTIONS = [
  { q: 'Tell me about yourself — your name, where you are from, and your background.', topic: 'Introduction', skill: 'Introduction' },
  { q: 'Where are you from and how has your journey been so far?', topic: 'Personal', skill: 'Introduction' },
  { q: 'What are your hobbies and interests outside of work or studies?', topic: 'Hobbies', skill: 'Introduction' },
  { q: 'Where do you see yourself in the next 5 years? What is your long-term career goal?', topic: 'Goals', skill: 'Introduction' },
  { q: 'What is your biggest strength and one weakness you are actively working on?', topic: 'Strengths', skill: 'Introduction' },
  { q: 'Why did you choose this field? When did you develop a passion for it?', topic: 'Motivation', skill: 'Introduction' },
  { q: 'Walk me through your technical background — what have you learned and where did you learn it from?', topic: 'Technical Background', skill: 'Introduction' },
  { q: 'Tell me about a project or achievement you are most proud of and what was your role in it.', topic: 'Achievement', skill: 'Introduction' },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    Promise.all([getMe(), getHistory()])
      .then(([meRes, histRes]) => { setUser(meRes.data); setHistory(histRes.data); })
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); })
      .finally(() => setLoading(false));
  }, [navigate]);

  const logout = () => { localStorage.removeItem('token'); navigate('/login'); };

  const startPracticeInterview = () => {
    navigate('/interview', {
      state: {
        skillGroups: [{ skill: 'Introduction', questions: PRACTICE_QUESTIONS }],
        interviewType: 'Practice Interview',
        difficulty: 'Easy'
      }
    });
  };

  if (loading) return <div style={styles.center}><p style={{ color: '#ffd700' }}>Loading...</p></div>;

  return (
    <div style={styles.page}>
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Namaste, {user?.name} 👋</h1>
        <button style={styles.logoutBtn} onClick={logout}>Logout</button>
      </div>

      {/* Interview Options */}
      <div style={styles.optionsGrid}>

        {/* Practice Interview */}
        <div style={styles.optionCard} onClick={startPracticeInterview}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#ff8c00'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,140,0,0.2)'}>
          <div style={styles.optionIcon}>🎤</div>
          <div style={styles.optionContent}>
            <h3 style={styles.optionTitle}>Practice Interview</h3>
            <p style={styles.optionDesc}>Introduction round — naam, hobby, aim, background. Companies yahi se shuru karti hain!</p>
            <span style={styles.optionBadge}>8 Questions • Easy</span>
          </div>
          <div style={styles.optionArrow}>→</div>
        </div>

        {/* Resume Based */}
        <div style={styles.optionCard} onClick={() => navigate('/resume')}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#ff8c00'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,140,0,0.2)'}>
          <div style={styles.optionIcon}>📄</div>
          <div style={styles.optionContent}>
            <h3 style={styles.optionTitle}>Resume Based Interview</h3>
            <p style={styles.optionDesc}>Resume upload karo — AI tumhari skills detect karke personalized interview lega!</p>
            <span style={styles.optionBadge}>Auto Skills • Custom</span>
          </div>
          <div style={styles.optionArrow}>→</div>
        </div>

      </div>

      {/* Custom Syllabus Section */}
      <div style={styles.customSection}>
        <div style={styles.customHeader}>
          <div>
            <h2 style={styles.customTitle}>🎯 Custom Syllabus Interview</h2>
            <p style={styles.customDesc}>Apni skills aur topics khud type karo — AI usi pe interview lega</p>
          </div>
          <button style={styles.customBtn} onClick={() => navigate('/custom-syllabus')}>
            Start →
          </button>
        </div>

        {/* Preview chips */}
        <div style={styles.previewRow}>
          {[
            { skill: 'Python', topics: ['if else', 'loops', 'OOP', 'functions', 'list'] },
            { skill: 'React', topics: ['hooks', 'useState', 'useEffect', 'props'] },
            { skill: 'SQL', topics: ['joins', 'indexing', 'queries'] },
          ].map((ex, i) => (
            <div key={i} style={styles.previewCard}>
              <span style={styles.previewSkill}>{ex.skill}</span>
              <div style={styles.previewTopics}>
                {ex.topics.map((t, j) => (
                  <span key={j} style={styles.previewChip}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={styles.customHint}>
          💡 Jitne topics, utne questions — Python ke 7 topics = 7 questions Python ke!
        </p>
      </div>

      {/* Past Interviews */}
      <div style={styles.historySection}>
        <h2 style={styles.sectionTitle}>Past Interviews 📊</h2>
        {history.length === 0 ? (
          <p style={{ color: '#888' }}>Abhi tak koi interview nahi diya. Shuru karo!</p>
        ) : (
          <div style={styles.grid}>
            {history.map((item, i) => (
              <div key={i} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.type}>{item.interviewType}</span>
                  <span style={styles.score}>{item.overallScore}/10</span>
                </div>
                <p style={styles.meta}>{item.difficulty} • {new Date(item.createdAt).toLocaleDateString('hi-IN')}</p>
                <p style={styles.meta}>{item.answers?.length || 0} questions</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0f', padding: '2rem', fontFamily: 'sans-serif', position: 'relative' },
  glowOrb1: { position: 'fixed', top: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,0,0.06), transparent)', pointerEvents: 'none', zIndex: 0 },
  glowOrb2: { position: 'fixed', bottom: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.04), transparent)', pointerEvents: 'none', zIndex: 0 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0f' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 },
  title: { color: '#ffd700', fontSize: '1.8rem', margin: 0 },
  logoutBtn: { background: 'transparent', border: '1px solid #ff8c00', color: '#ff8c00', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' },

  // Options Grid
  optionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '28px', position: 'relative', zIndex: 1 },
  optionCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', transition: 'border-color 0.2s', },
  optionIcon: { fontSize: '40px', flexShrink: 0 },
  optionContent: { flex: 1 },
  optionTitle: { fontSize: '18px', fontWeight: '800', color: '#fff', margin: '0 0 6px' },
  optionDesc: { fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: '0 0 10px', lineHeight: 1.5 },
  optionBadge: { background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.25)', borderRadius: '20px', padding: '4px 12px', fontSize: '12px', color: '#ff8c00', fontWeight: '600' },
  optionArrow: { fontSize: '24px', color: '#ff8c00', flexShrink: 0 },

  // Custom Syllabus
  customSection: { background: 'rgba(255,140,0,0.04)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '20px', padding: '28px', marginBottom: '32px', position: 'relative', zIndex: 1 },
  customHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '16px' },
  customTitle: { fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 6px' },
  customDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.45)', margin: 0 },
  customBtn: { background: 'linear-gradient(135deg, #ff8c00, #ffd700)', border: 'none', borderRadius: '12px', padding: '12px 24px', color: '#000', fontWeight: '800', fontSize: '15px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  previewRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' },
  previewCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  previewSkill: { fontSize: '14px', fontWeight: '800', color: '#ffd700' },
  previewTopics: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  previewChip: { background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: '#ff8c00' },
  customHint: { fontSize: '13px', color: 'rgba(255,255,255,0.35)', margin: 0 },

  // History
  historySection: { position: 'relative', zIndex: 1 },
  sectionTitle: { color: '#ccc', fontSize: '1.2rem', marginBottom: '1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  card: { background: '#1a1a2e', border: '1px solid #333', borderRadius: '12px', padding: '1rem' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  type: { color: '#ffd700', fontWeight: 600 },
  score: { color: '#ff8c00', fontWeight: 700, fontSize: '1.1rem' },
  meta: { color: '#888', fontSize: '0.85rem', margin: '4px 0' },
};