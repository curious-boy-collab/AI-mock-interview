import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 140, 0, ${p.opacity})`;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      animId = requestAnimationFrame(draw);
    }
    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={styles.container}>
      <canvas ref={canvasRef} style={styles.canvas} />

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>⚡ InterviewAI</div>
        <div style={styles.navLinks}>
          <span style={styles.navLink}>Features</span>
          <span style={styles.navLink}>How it works</span>
        <button style={styles.syllabusBtn} onClick={() => navigate('/custom-syllabus')}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.badge}>🎯 AI Powered Interview Platform</div>

        <h1 style={styles.heading}>
          Crack Your Dream
          <span style={styles.gradientText}> Interview </span>
          With AI
        </h1>

        <p style={styles.subText}>
          Upload your syllabus — AI will conduct your real interview
          with Voice, Video, and instant feedback! 🚀
        </p>

        <div style={styles.btnGroup}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate('/login')}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            🚀 Start for Free
          </button>
          <button
            style={styles.secondaryBtn}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ▶ Watch Demo
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { num: '10K+', label: 'Interviews Done' },
            { num: '95%', label: 'Success Rate' },
            { num: '500+', label: 'Companies' },
            { num: '100%', label: 'Free' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={styles.statNum}>{s.num}</div>
              <div style={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resume Upload Section */}
      <div style={styles.uploadSection}>
        <h2 style={styles.sectionTitle}>Upload Resume — Start Interview! 📄</h2>
        <p style={styles.uploadDesc}>
          Upload your resume → AI detects your syllabus → Video interview starts instantly!
        </p>
        <div
          style={styles.uploadBox}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#ff8c00'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,140,0,0.3)'}
          onClick={() => navigate('/login')}
        >
          <div style={styles.uploadIcon}>📄</div>
          <p style={styles.uploadText}>Click or drop your PDF here</p>
          <p style={styles.uploadSubText}>Video Interview starts immediately after upload! 🎥</p>
          <button style={styles.uploadBtn}>Upload Resume</button>
        </div>
        {/* Custom Syllabus Section */}
<div style={styles.customSyllabusSection}>
  <h2 style={styles.sectionTitle}>🎯 Custom Syllabus Interview</h2>
  <p style={styles.uploadDesc}>Apni skills aur topics type karo — AI usi pe interview lega. Resume nahi hai? Koi baat nahi!</p>

  <div style={styles.syllabusDemo}>
    <div style={styles.syllabusDemoLeft}>
      {[
        { skill: 'Python', topics: 'if else, loops, OOP, functions, list, tuple' },
        { skill: 'React', topics: 'hooks, useState, useEffect, props, routing' },
        { skill: 'SQL', topics: 'joins, indexing, subquery, aggregation' },
      ].map((ex, i) => (
        <div key={i} style={styles.syllabusRow}>
          <span style={styles.syllabusSkill}>{ex.skill}</span>
          <span style={styles.syllabusArrow}>→</span>
          <span style={styles.syllabusTopics}>{ex.topics}</span>
        </div>
      ))}
    </div>
    <div style={styles.syllabusDemoRight}>
      <div style={styles.syllabusResult}>
        <div style={styles.syllabusResultNum}>15</div>
        <div style={styles.syllabusResultLabel}>Questions</div>
        <div style={styles.syllabusResultSub}>3 skills × avg 5 topics</div>
      </div>
    </div>
  </div>

  <button style={styles.syllabusBtn} onClick={() => navigate('/login')}>
    🎯 Create Custom Interview
  </button>
</div>

        {/* Flow Steps */}
        <div style={styles.flowRow}>
          {[
            { icon: '📄', step: '1', label: 'Resume Upload' },
            { icon: '→', step: '', label: '' },
            { icon: '🤖', step: '2', label: 'AI Syllabus Detect' },
            { icon: '→', step: '', label: '' },
            { icon: '🎥', step: '3', label: 'Video Interview' },
            { icon: '→', step: '', label: '' },
            { icon: '📊', step: '4', label: 'AI Feedback' },
          ].map((f, i) => (
            f.icon === '→'
              ? <div key={i} style={styles.arrow}>→</div>
              : <div key={i} style={styles.flowStep}>
                  <div style={styles.flowIcon}>{f.icon}</div>
                  <div style={styles.flowLabel}>{f.label}</div>
                </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <h2 style={styles.sectionTitle}>What You Get 🎁</h2>
        <div style={styles.featuresGrid}>
          {[
            { icon: '🤖', title: 'AI Questions', desc: 'Personalized questions generated from your own syllabus' },
            { icon: '🎤', title: 'Voice Answer', desc: 'Speak your answers — no typing required' },
            { icon: '📹', title: 'Video Interview', desc: 'Feel like a real interview — practice with camera on' },
            { icon: '📄', title: 'Resume Upload', desc: 'Upload your resume — AI auto-detects your syllabus' },
            { icon: '🏆', title: 'Leaderboard', desc: 'Compete with friends and climb to the top' },
            { icon: '📊', title: 'AI Feedback', desc: 'Detailed feedback and improvement tips for every answer' },
          ].map((f, i) => (
            <div
              key={i}
              style={styles.featureCard}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.borderColor = '#ff8c00';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,140,0,0.2)';
              }}
            >
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to Begin? 💪</h2>
        <p style={styles.ctaDesc}>Start practicing today — completely free!</p>
        <button
          style={styles.primaryBtn}
          onClick={() => navigate('/login')}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          🚀 Get Started Now
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>Made with ❤️ by InterviewAI Team</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0a0a0f',
    color: '#fff',
    position: 'relative',
    overflowX: 'hidden',
  },
  canvas: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  customSyllabusSection: { position: 'relative', zIndex: 1, padding: '80px 60px', textAlign: 'center', borderTop: '1px solid rgba(255,140,0,0.1)' },
syllabusDemo: { display: 'flex', gap: '32px', maxWidth: '800px', margin: '0 auto 40px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' },
syllabusDemoLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '300px' },
syllabusRow: { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.12)', borderRadius: '12px', padding: '14px 18px', textAlign: 'left' },
syllabusSkill: { fontSize: '15px', fontWeight: '800', color: '#ffd700', minWidth: '60px' },
syllabusArrow: { color: '#ff8c00', fontSize: '18px' },
syllabusTopics: { fontSize: '13px', color: 'rgba(255,255,255,0.5)' },
syllabusDemoRight: { flexShrink: 0 },
syllabusResult: { background: 'rgba(255,140,0,0.08)', border: '2px solid rgba(255,140,0,0.3)', borderRadius: '20px', padding: '32px 40px', textAlign: 'center' },
syllabusResultNum: { fontSize: '56px', fontWeight: '900', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
syllabusResultLabel: { fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '4px' },
syllabusResultSub: { fontSize: '13px', color: 'rgba(255,255,255,0.4)' },
syllabusBtn: { background: 'linear-gradient(135deg, #ff8c00, #ffd700)', border: 'none', borderRadius: '30px', padding: '16px 40px', color: '#000', fontWeight: '800', fontSize: '16px', cursor: 'pointer' },
  navbar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 60px',
    background: 'rgba(10,10,15,0.85)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255,140,0,0.2)',
    zIndex: 100,
  },
  logo: {
    fontSize: '24px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ff8c00, #ffd700)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
  },
  navLink: {
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: '15px',
  },
  navBtn: {
    background: 'linear-gradient(135deg, #ff8c00, #ffd700)',
    border: 'none',
    borderRadius: '25px',
    padding: '10px 24px',
    color: '#000',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '14px',
  },
  hero: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    paddingTop: '160px',
    paddingBottom: '80px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  badge: {
    background: 'rgba(255,140,0,0.15)',
    border: '1px solid rgba(255,140,0,0.4)',
    borderRadius: '20px',
    padding: '8px 20px',
    fontSize: '14px',
    color: '#ffb347',
    marginBottom: '24px',
  },
  heading: {
    fontSize: '64px',
    fontWeight: '900',
    lineHeight: 1.1,
    marginBottom: '24px',
    maxWidth: '800px',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #ff8c00, #ffd700)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subText: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.6)',
    maxWidth: '600px',
    lineHeight: 1.6,
    marginBottom: '40px',
  },
  btnGroup: {
    display: 'flex',
    gap: '16px',
    marginBottom: '60px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #ff8c00, #ffd700)',
    border: 'none',
    borderRadius: '30px',
    padding: '16px 36px',
    color: '#000',
    fontWeight: '800',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  secondaryBtn: {
    background: 'transparent',
    border: '2px solid rgba(255,140,0,0.5)',
    borderRadius: '30px',
    padding: '16px 36px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  statsRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statCard: {
    background: 'rgba(255,140,0,0.08)',
    border: '1px solid rgba(255,140,0,0.2)',
    borderRadius: '16px',
    padding: '20px 32px',
    textAlign: 'center',
  },
  statNum: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #ff8c00, #ffd700)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  statLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.5)',
    marginTop: '4px',
  },
  uploadSection: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 60px',
    textAlign: 'center',
    background: 'rgba(255,140,0,0.03)',
    borderTop: '1px solid rgba(255,140,0,0.1)',
  },
  uploadDesc: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: '32px',
  },
  uploadBox: {
    border: '2px dashed rgba(255,140,0,0.3)',
    borderRadius: '24px',
    padding: '60px 40px',
    maxWidth: '600px',
    margin: '0 auto 48px',
    cursor: 'pointer',
    transition: 'border-color 0.3s',
    background: 'rgba(255,140,0,0.04)',
  },
  uploadIcon: { fontSize: '56px', marginBottom: '16px' },
  uploadText: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  uploadSubText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: '24px',
  },
  uploadBtn: {
    background: 'linear-gradient(135deg, #ff8c00, #ffd700)',
    border: 'none',
    borderRadius: '25px',
    padding: '12px 32px',
    color: '#000',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
  },
  flowRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  flowStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  flowIcon: {
    fontSize: '32px',
    background: 'rgba(255,140,0,0.1)',
    border: '1px solid rgba(255,140,0,0.3)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  arrow: {
    fontSize: '24px',
    color: '#ff8c00',
    marginBottom: '20px',
  },
  featuresSection: {
    position: 'relative',
    zIndex: 1,
    padding: '80px 60px',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: '42px',
    fontWeight: '800',
    marginBottom: '16px',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,140,0,0.2)',
    borderRadius: '20px',
    padding: '32px 24px',
    textAlign: 'left',
    transition: 'transform 0.3s, border-color 0.3s',
    cursor: 'default',
  },
  featureIcon: { fontSize: '40px', marginBottom: '16px' },
  featureTitle: { fontSize: '20px', fontWeight: '700', marginBottom: '10px' },
  featureDesc: { fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 },
  ctaSection: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '80px 20px',
    background: 'rgba(255,140,0,0.05)',
    borderTop: '1px solid rgba(255,140,0,0.15)',
    borderBottom: '1px solid rgba(255,140,0,0.15)',
  },
  ctaTitle: { fontSize: '48px', fontWeight: '900', marginBottom: '16px' },
  ctaDesc: { fontSize: '18px', color: 'rgba(255,255,255,0.6)', marginBottom: '32px' },
  footer: {
    position: 'relative',
    zIndex: 1,
    textAlign: 'center',
    padding: '30px',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '14px',
  },
};