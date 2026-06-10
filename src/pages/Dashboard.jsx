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

  if (loading) return (
    <div style={styles.loadingScreen}>
      <div style={styles.loadingText}>// LOADING OPERATOR DATA...</div>
    </div>
  );

  return (
    <div style={styles.page}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.logo}>INTERVIEW<span style={styles.logoAccent}>AI</span></div>
          <div style={styles.navBadge}>// OPERATOR PANEL</div>
        </div>
        <button style={styles.logoutBtn} onClick={logout}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,0,64,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          LOGOUT
        </button>
      </nav>

      <div style={styles.body}>

        {/* Greeting */}
        <div style={styles.greetingSection}>
          <div style={styles.greetingBadge}>// WELCOME BACK SOLDIER</div>
          <h1 style={styles.greetingName}>
            {user?.name?.split(' ')[0].toUpperCase()}
            <span style={styles.greetingNameAccent}>
              {user?.name?.split(' ').slice(1).join(' ').toUpperCase()}
            </span>
          </h1>
          <div style={styles.greetingRule} />
        </div>

        {/* Interview Option Cards */}
        <div style={styles.sectionLabel}>// SELECT MISSION</div>
        <div style={styles.optionsGrid}>

          <div style={styles.optionCard}
            onClick={startPracticeInterview}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#FF0040';
              e.currentTarget.style.background = 'rgba(255,0,64,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,0,64,0.2)';
              e.currentTarget.style.background = 'rgba(255,0,64,0.04)';
            }}
          >
            <div style={styles.optionLeft}>
              <div style={styles.optionRedBar} />
              <div style={styles.optionContent}>
                <div style={styles.optionCode}>MISSION-01</div>
                <div style={styles.optionTitle}>PRACTICE INTERVIEW</div>
                <div style={styles.optionDesc}>Introduction round — naam, hobby, aim, background. Companies yahi se shuru karti hain!</div>
                <div style={styles.optionBadge}>8 QUESTIONS • EASY</div>
              </div>
            </div>
            <div style={styles.optionIcon}>🎤</div>
            <div style={styles.optionArrow}>▶</div>
          </div>

          <div style={styles.optionCard}
            onClick={() => navigate('/resume')}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#FF0040';
              e.currentTarget.style.background = 'rgba(255,0,64,0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,0,64,0.2)';
              e.currentTarget.style.background = 'rgba(255,0,64,0.04)';
            }}
          >
            <div style={styles.optionLeft}>
              <div style={styles.optionRedBar} />
              <div style={styles.optionContent}>
                <div style={styles.optionCode}>MISSION-02</div>
                <div style={styles.optionTitle}>RESUME BASED INTERVIEW</div>
                <div style={styles.optionDesc}>Resume upload karo — AI tumhari skills detect karke personalized interview lega!</div>
                <div style={styles.optionBadge}>AUTO SKILLS • CUSTOM</div>
              </div>
            </div>
            <div style={styles.optionIcon}>📄</div>
            <div style={styles.optionArrow}>▶</div>
          </div>

        </div>

        {/* Custom Syllabus */}
        <div style={styles.customSection}>
          <div style={styles.customLeft}>
            <div style={styles.customRedBar} />
            <div>
            <div style={{...styles.sectionLabel, marginBottom: '6px'}}>MISSION-03</div>
              <div style={styles.customTitle}>CUSTOM SYLLABUS INTERVIEW</div>
              <div style={styles.customDesc}>Apni skills aur topics khud type karo — AI usi pe interview lega</div>
              <div style={styles.previewRow}>
                {[
                  { skill: 'Python', topics: ['if else', 'loops', 'OOP'] },
                  { skill: 'React', topics: ['hooks', 'useState', 'props'] },
                  { skill: 'SQL', topics: ['joins', 'indexing'] },
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
            </div>
          </div>
          <button style={styles.customBtn}
            onClick={() => navigate('/custom-syllabus')}
            onMouseEnter={e => e.currentTarget.style.background = '#cc0033'}
            onMouseLeave={e => e.currentTarget.style.background = '#FF0040'}
          >
            START ▶
          </button>
        </div>

        {/* Past Interviews */}
        <div style={styles.historySection}>
          <div style={styles.sectionLabel}>// MISSION HISTORY</div>
          {history.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyText}>NO MISSIONS COMPLETED YET</div>
              <div style={styles.emptySubText}>Start your first interview to see history here</div>
            </div>
          ) : (
            <div style={styles.historyGrid}>
              {history.map((item, i) => (
                <div key={i} style={styles.histCard}>
                  <div style={styles.histRedBar} />
                  <div style={styles.histContent}>
                    <div style={styles.histTop}>
                      <span style={styles.histType}>{item.interviewType?.toUpperCase()}</span>
                      <span style={styles.histScore}>{item.overallScore}/10</span>
                    </div>
                    <div style={styles.histMeta}>{item.difficulty?.toUpperCase()} • {new Date(item.createdAt).toLocaleDateString('en-IN')}</div>
                    <div style={styles.histMeta}>{item.answers?.length || 0} QUESTIONS</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#FF0040',
    fontSize: '14px',
    letterSpacing: '3px',
    fontFamily: 'monospace',
    fontWeight: '700',
  },

  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
    color: '#fff',
    fontFamily: "'Inter', sans-serif",
  },

  // Navbar
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    borderBottom: '1px solid rgba(255,0,64,0.2)',
    background: '#0d0d0d',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  logo: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '4px',
  },
  logoAccent: { color: '#FF0040' },
  navBadge: {
    fontSize: '9px',
    color: 'rgba(255,0,64,0.6)',
    letterSpacing: '2px',
    fontWeight: '700',
    borderLeft: '1px solid rgba(255,0,64,0.3)',
    paddingLeft: '16px',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,0,64,0.4)',
    color: '#FF0040',
    padding: '7px 18px',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '2px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontFamily: "'Inter', sans-serif",
  },

  body: {
    padding: '40px 40px',
    maxWidth: '1100px',
  },

  // Greeting
  greetingSection: { marginBottom: '36px' },
  greetingBadge: {
    fontSize: '10px',
    color: '#FF0040',
    letterSpacing: '3px',
    fontWeight: '700',
    marginBottom: '8px',
  },
  greetingName: {
    fontSize: '52px',
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '-2px',
    lineHeight: 1,
    marginBottom: '16px',
  },
  greetingNameAccent: {
    color: '#FF0040',
    display: 'block',
  },
  greetingRule: {
    width: '60px',
    height: '4px',
    background: '#FF0040',
  },

  // Section label
  sectionLabel: {
    fontSize: '10px',
    color: '#FF0040',
    letterSpacing: '3px',
    fontWeight: '700',
    marginBottom: '14px',
    borderLeft: '3px solid #FF0040',
    paddingLeft: '10px',
  },

  // Options
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '14px',
    marginBottom: '28px',
  },
  optionCard: {
    background: 'rgba(255,0,64,0.04)',
    border: '1px solid rgba(255,0,64,0.2)',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, background 0.2s',
  },
  optionLeft: {
    display: 'flex',
    gap: '14px',
    flex: 1,
    alignItems: 'flex-start',
  },
  optionRedBar: {
    width: '3px',
    background: '#FF0040',
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  optionContent: { flex: 1 },
  optionCode: {
    fontSize: '9px',
    color: 'rgba(255,0,64,0.6)',
    letterSpacing: '2px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  optionTitle: {
    fontSize: '14px',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '1px',
    marginBottom: '6px',
  },
  optionDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 1.5,
    marginBottom: '10px',
  },
  optionBadge: {
    display: 'inline-block',
    fontSize: '9px',
    color: '#FF0040',
    border: '1px solid rgba(255,0,64,0.3)',
    padding: '3px 10px',
    letterSpacing: '1px',
    fontWeight: '700',
  },
  optionIcon: { fontSize: '32px', flexShrink: 0 },
  optionArrow: {
    fontSize: '16px',
    color: '#FF0040',
    fontWeight: '900',
    flexShrink: 0,
  },

  // Custom Section
  customSection: {
    background: 'rgba(255,0,64,0.03)',
    border: '1px solid rgba(255,0,64,0.18)',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '36px',
  },
  customLeft: {
    display: 'flex',
    gap: '14px',
    flex: 1,
    alignItems: 'flex-start',
  },
  customRedBar: {
    width: '3px',
    background: '#FF0040',
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  customTitle: {
    fontSize: '16px',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '1px',
    marginBottom: '6px',
    textTransform: 'uppercase',
  },
  customDesc: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: '14px',
    lineHeight: 1.5,
  },
  previewRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  previewCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  previewSkill: {
    fontSize: '11px',
    fontWeight: '900',
    color: '#FF0040',
    letterSpacing: '1px',
  },
  previewTopics: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  previewChip: {
    background: 'rgba(255,0,64,0.08)',
    border: '1px solid rgba(255,0,64,0.2)',
    padding: '2px 7px',
    fontSize: '10px',
    color: 'rgba(255,255,255,0.45)',
  },
  customBtn: {
    background: '#FF0040',
    border: 'none',
    padding: '14px 28px',
    color: '#fff',
    fontWeight: '900',
    fontSize: '12px',
    letterSpacing: '2px',
    cursor: 'pointer',
    flexShrink: 0,
    clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
    transition: 'background 0.2s',
    fontFamily: "'Inter', sans-serif",
  },

  // History
  historySection: { },
  emptyState: {
    border: '1px dashed rgba(255,0,64,0.2)',
    padding: '40px',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '2px',
    marginBottom: '8px',
  },
  emptySubText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: '0.5px',
  },
  historyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '12px',
  },
  histCard: {
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,0,64,0.15)',
    display: 'flex',
    overflow: 'hidden',
    transition: 'border-color 0.2s',
  },
  histRedBar: {
    width: '3px',
    background: '#FF0040',
    flexShrink: 0,
  },
  histContent: { padding: '14px 14px' },
  histTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  histType: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '1px',
  },
  histScore: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#FF0040',
  },
  histMeta: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.5px',
    marginTop: '3px',
  },
};