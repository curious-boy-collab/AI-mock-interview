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
      <div style={styles.loadingOrb} />
      <div style={styles.loadingText}>LOADING PANEL DATA...</div>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Background Glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.logo}>INTERVIEW<span style={styles.logoAccent}>AI</span></div>
          <div style={styles.navBadge}>{"// STUDENT PANEL"}</div>
        </div>
        <button style={styles.logoutBtn} onClick={logout}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
            e.currentTarget.style.borderColor = 'var(--error)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
          }}
        >
          LOGOUT
        </button>
      </nav>

      <div style={styles.body}>

        {/* Greeting */}
        <div style={styles.greetingSection}>
          <div style={styles.greetingBadge}>{"// WELCOME BACK"}</div>
          <h1 style={styles.greetingName}>
            {user?.name?.split(' ')[0].toUpperCase()}
            <span style={styles.greetingNameAccent}>
              {user?.name?.split(' ').slice(1).join(' ').toUpperCase()}
            </span>
          </h1>
          <div style={styles.greetingRule} />
        </div>

        {/* Interview Option Cards */}
        <div style={styles.sectionLabel}>SELECT MISSION</div>
        <div style={styles.optionsGrid}>

          <div style={styles.optionCard}
            onClick={startPracticeInterview}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(197, 160, 89, 0.06)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(197, 160, 89, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = 'rgba(20, 16, 36, 0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.optionLeft}>
              <div style={styles.optionPurpleBar} />
              <div style={styles.optionContent}>
                <div style={styles.optionCode}>MISSION-01</div>
                <div style={styles.optionTitle}>PRACTICE INTERVIEW</div>
                <div style={styles.optionDesc}>Introduction round — name, hobby, aim, background. Companies start here!</div>
                <div style={styles.optionBadge}>8 QUESTIONS • EASY</div>
              </div>
            </div>
            <div style={styles.optionIcon}>🎤</div>
            <div style={styles.optionArrow}>▶</div>
          </div>

          <div style={styles.optionCard}
            onClick={() => navigate('/resume')}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(197, 160, 89, 0.06)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(197, 160, 89, 0.08)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = 'rgba(20, 16, 36, 0.4)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={styles.optionLeft}>
              <div style={styles.optionPurpleBar} />
              <div style={styles.optionContent}>
                <div style={styles.optionCode}>MISSION-02</div>
                <div style={styles.optionTitle}>RESUME BASED INTERVIEW</div>
                <div style={styles.optionDesc}>Upload resume — AI detects your skills & details to take personalized interviews!</div>
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
            <div style={styles.customPurpleBar} />
            <div>
              <div style={{...styles.sectionLabel, marginBottom: '6px', borderLeft: 'none', paddingLeft: 0}}>MISSION-03</div>
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
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(197, 160, 89, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(197, 160, 89, 0.3)';
            }}
          >
            START ▶
          </button>
        </div>

        {/* Past Interviews */}
        <div style={styles.historySection}>
          <div style={styles.sectionLabel}>MISSION HISTORY</div>
          {history.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyText}>NO MISSIONS COMPLETED YET</div>
              <div style={styles.emptySubText}>Start your first interview to see history here</div>
            </div>
          ) : (
            <div style={styles.historyGrid}>
              {history.map((item, i) => (
                <div key={i} style={styles.histCard}>
                  <div style={styles.histPurpleBar} />
                  <div style={styles.histContent}>
                    <div style={styles.histTop}>
                      <span style={styles.histType}>{item.interviewType?.toUpperCase()}</span>
                      <span style={styles.histScore}>{item.overallScore}/100</span>
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
    background: 'var(--bg-dark)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOrb: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '3px solid rgba(197, 160, 89, 0.15)',
    borderTopColor: 'var(--primary)',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontSize: '13px',
    letterSpacing: '2px',
    fontWeight: '700',
  },

  page: {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
    color: '#fff',
    position: 'relative',
    overflowX: 'hidden',
  },

  // Navbar
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 40px',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(4, 2, 9, 0.8)',
    backdropFilter: 'blur(16px)',
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
  logoAccent: { color: 'var(--text-secondary)' },
  navBadge: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    letterSpacing: '2px',
    fontWeight: '700',
    borderLeft: '1px solid var(--border-color)',
    paddingLeft: '16px',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid rgba(244, 63, 94, 0.4)',
    color: 'var(--error)',
    borderRadius: '20px',
    padding: '7px 18px',
    fontSize: '10px',
    fontWeight: '800',
    letterSpacing: '2px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  body: {
    padding: '40px 40px 80px',
    maxWidth: '1100px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },

  // Greeting
  greetingSection: { marginBottom: '36px' },
  greetingBadge: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
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
    lineHeight: 1.05,
    marginBottom: '16px',
  },
  greetingNameAccent: {
    color: 'var(--primary)',
    display: 'block',
  },
  greetingRule: {
    width: '60px',
    height: '4px',
    background: 'var(--primary)',
    borderRadius: '2px',
  },

  // Section label
  sectionLabel: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    letterSpacing: '3px',
    fontWeight: '800',
    marginBottom: '14px',
    borderLeft: '3px solid var(--primary)',
    paddingLeft: '10px',
  },

  // Options
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '16px',
    marginBottom: '28px',
  },
  optionCard: {
    background: 'rgba(20, 16, 36, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  optionLeft: {
    display: 'flex',
    gap: '14px',
    flex: 1,
    alignItems: 'flex-start',
  },
  optionPurpleBar: {
    width: '3px',
    background: 'var(--primary)',
    alignSelf: 'stretch',
    borderRadius: '4px',
    flexShrink: 0,
  },
  optionContent: { flex: 1 },
  optionCode: {
    fontSize: '9px',
    color: 'var(--text-muted)',
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
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    marginBottom: '10px',
  },
  optionBadge: {
    display: 'inline-block',
    fontSize: '9px',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    padding: '4px 10px',
    borderRadius: '4px',
    letterSpacing: '1px',
    fontWeight: '700',
  },
  optionIcon: { fontSize: '32px', flexShrink: 0 },
  optionArrow: {
    fontSize: '16px',
    color: 'var(--primary)',
    fontWeight: '900',
    flexShrink: 0,
  },

  // Custom Section
  customSection: {
    background: 'rgba(20, 16, 36, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    backdropFilter: 'blur(8px)',
    marginBottom: '36px',
  },
  customLeft: {
    display: 'flex',
    gap: '14px',
    flex: 1,
    alignItems: 'flex-start',
  },
  customPurpleBar: {
    width: '3px',
    background: 'var(--primary)',
    alignSelf: 'stretch',
    borderRadius: '4px',
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
    color: 'var(--text-muted)',
    marginBottom: '14px',
    lineHeight: 1.5,
  },
  previewRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  previewCard: {
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  previewSkill: {
    fontSize: '11px',
    fontWeight: '900',
    color: 'var(--text-secondary)',
    letterSpacing: '1px',
  },
  previewTopics: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  previewChip: {
    background: 'rgba(197, 160, 89, 0.05)',
    border: '1px solid rgba(197, 160, 89, 0.15)',
    borderRadius: '4px',
    padding: '2px 7px',
    fontSize: '10px',
    color: 'var(--text-muted)',
  },
  customBtn: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    border: 'none',
    padding: '14px 28px',
    color: '#fff',
    fontWeight: '900',
    fontSize: '12px',
    letterSpacing: '2px',
    cursor: 'pointer',
    flexShrink: 0,
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)',
    transition: 'all 0.2s ease',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },

  // History
  historySection: { },
  emptyState: {
    border: '1px dashed var(--border-color)',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.01)',
  },
  emptyText: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-muted)',
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
    background: 'rgba(20, 16, 36, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    display: 'flex',
    overflow: 'hidden',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
  },
  histPurpleBar: {
    width: '3px',
    background: 'var(--primary)',
    flexShrink: 0,
  },
  histContent: { padding: '14px 14px', flex: 1 },
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
    color: 'var(--text-secondary)',
  },
  histMeta: {
    fontSize: '10px',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px',
    marginTop: '3px',
  },
};