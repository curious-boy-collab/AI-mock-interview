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
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
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
        <div style={styles.logo}>INTERVIEW<span style={styles.logoAccent}>AI</span></div>
        <div style={styles.navLinks}>
          <span style={styles.navLink}>FEATURES</span>
          <span style={styles.navLink}>HOW IT WORKS</span>
          <button style={styles.navBtn} onClick={() => navigate('/login')}>
            GET STARTED
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.badge}>
          <span style={styles.badgeDot}></span>
          AI POWERED INTERVIEW PLATFORM — ACTIVE
        </div>

        <h1 style={styles.heading}>
          CRACK YOUR<br />
          DREAM<br />
          <span style={styles.outlineText}>INTERVIEW</span><br />
          <span style={styles.accentText}>WITH AI</span>
        </h1>

        <p style={styles.subText}>
          Upload your syllabus — AI will conduct your real interview
          with Voice, Video, and instant feedback.
        </p>

        <div style={styles.btnGroup}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate('/login')}
            onMouseEnter={e => e.currentTarget.style.background = '#00bfdd'}
            onMouseLeave={e => e.currentTarget.style.background = '#00D4FF'}
          >
            START FOR FREE ▶
          </button>
          <button
            style={styles.secondaryBtn}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
          >
            WATCH DEMO
          </button>
        </div>

        {/* Stats */}
        <div style={styles.statsRow}>
          {[
            { num: '10K+', label: 'INTERVIEWS DONE' },
            { num: '95%', label: 'SUCCESS RATE' },
            { num: '500+', label: 'COMPANIES' },
            { num: '100%', label: 'FREE' },
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
        <div style={styles.sectionBadge}>RESUME UPLOAD</div>
        <h2 style={styles.sectionTitle}>UPLOAD RESUME —<br />START INTERVIEW</h2>
        <p style={styles.uploadDesc}>
          Upload your resume → AI detects your syllabus → Video interview starts instantly.
        </p>
        <div
          style={styles.uploadBox}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#00D4FF'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'}
          onClick={() => navigate('/login')}
        >
          <div style={styles.uploadIcon}>📄</div>
          <p style={styles.uploadText}>CLICK OR DROP YOUR PDF HERE</p>
          <p style={styles.uploadSubText}>Video Interview starts immediately after upload</p>
          <button style={styles.uploadBtn}>UPLOAD RESUME</button>
        </div>

        {/* Custom Syllabus Section */}
        <div style={styles.customSyllabusSection}>
          <div style={styles.sectionBadge}>CUSTOM SYLLABUS</div>
          <h2 style={styles.sectionTitle}>BUILD YOUR OWN<br />INTERVIEW</h2>
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
                <div style={styles.syllabusResultLabel}>QUESTIONS</div>
                <div style={styles.syllabusResultSub}>3 skills × avg 5 topics</div>
              </div>
            </div>
          </div>

          <button style={styles.syllabusBtn} onClick={() => navigate('/login')}>
            CREATE CUSTOM INTERVIEW ▶
          </button>
        </div>

        {/* Flow Steps */}
        <div style={styles.flowRow}>
          {[
            { icon: '📄', label: 'Resume Upload' },
            { icon: '→', label: '' },
            { icon: '🤖', label: 'AI Detect' },
            { icon: '→', label: '' },
            { icon: '🎥', label: 'Video Interview' },
            { icon: '→', label: '' },
            { icon: '📊', label: 'AI Feedback' },
          ].map((f, i) => (
            f.icon === '→'
              ? <div key={i} style={styles.arrow}>→</div>
              : <div key={i} style={styles.flowStep}>
                  <div style={styles.flowIcon}>{f.icon}</div>
                  <div style={styles.flowLabel}>{f.label.toUpperCase()}</div>
                </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.featuresSection}>
        <div style={styles.sectionBadge}>FEATURES</div>
        <h2 style={styles.sectionTitle}>WHAT YOU GET</h2>
        <div style={styles.featuresGrid}>
          {[
            { icon: '🤖', title: 'AI QUESTIONS', desc: 'Personalized questions generated from your own syllabus' },
            { icon: '🎤', title: 'VOICE ANSWER', desc: 'Speak your answers — no typing required' },
            { icon: '📹', title: 'VIDEO INTERVIEW', desc: 'Feel like a real interview — practice with camera on' },
            { icon: '📄', title: 'RESUME UPLOAD', desc: 'Upload your resume — AI auto-detects your syllabus' },
            { icon: '🏆', title: 'LEADERBOARD', desc: 'Compete with friends and climb to the top' },
            { icon: '📊', title: 'AI FEEDBACK', desc: 'Detailed feedback and improvement tips for every answer' },
          ].map((f, i) => (
            <div
              key={i}
              style={styles.featureCard}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.borderColor = '#00D4FF';
                e.currentTarget.style.borderLeftColor = '#FF0040';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)';
                e.currentTarget.style.borderLeftColor = 'rgba(0,212,255,0.15)';
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
        <div style={styles.sectionBadge}>GET STARTED</div>
        <h2 style={styles.ctaTitle}>READY TO<br /><span style={styles.accentText}>BEGIN?</span></h2>
        <p style={styles.ctaDesc}>Start practicing today — completely free.</p>
        <button
          style={styles.primaryBtn}
          onClick={() => navigate('/login')}
          onMouseEnter={e => e.currentTarget.style.background = '#00bfdd'}
          onMouseLeave={e => e.currentTarget.style.background = '#00D4FF'}
        >
          GET STARTED NOW ▶
        </button>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLogo}>INTERVIEW<span style={styles.logoAccent}>AI</span></div>
        <p style={styles.footerText}>Made with ❤️ by InterviewAI Team</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0d0d12',
    color: '#fff',
    position: 'relative',
    overflowX: 'hidden',
    fontFamily: "'Inter', sans-serif",
  },
  canvas: {
    position: 'fixed',
    top: 0, left: 0,
    width: '100%', height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  navbar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 60px',
    background: 'rgba(13,13,18,0.92)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0,212,255,0.15)',
    zIndex: 100,
  },
  logo: { fontSize: '20px', fontWeight: '900', color: '#fff', letterSpacing: '3px' },
  logoAccent: { color: '#00D4FF' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '32px' },
  navLink: { color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: '11px', letterSpacing: '2px', fontWeight: '700' },
  navBtn: {
    background: '#00D4FF', border: 'none', padding: '8px 20px',
    color: '#000', fontWeight: '800', cursor: 'pointer', fontSize: '11px',
    letterSpacing: '2px', clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)',
    transition: 'background 0.2s',
  },

  // Hero — CENTERED
  hero: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center',
    paddingTop: '160px', paddingBottom: '80px',
    paddingLeft: '20px', paddingRight: '20px',
  },
  badge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '10px', color: '#00D4FF', letterSpacing: '2px', fontWeight: '700',
    border: '1px solid rgba(0,212,255,0.3)', padding: '6px 14px', marginBottom: '32px',
  },
  badgeDot: {
    width: '7px', height: '7px', background: '#00D4FF',
    borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #00D4FF',
  },
  heading: {
    fontSize: '88px', fontWeight: '900', lineHeight: 0.92,
    marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '-2px',
  },
  outlineText: { color: 'transparent', WebkitTextStroke: '2px #00D4FF', display: 'block' },
  accentText: { color: '#FF0040', display: 'block' },
  subText: {
    fontSize: '18px', color: 'rgba(255,255,255,0.5)', maxWidth: '560px',
    lineHeight: 1.7, marginBottom: '44px', fontWeight: '500', letterSpacing: '0.3px',
  },
  btnGroup: { display: 'flex', gap: '14px', marginBottom: '64px', flexWrap: 'wrap', justifyContent: 'center' },
  primaryBtn: {
    background: '#00D4FF', border: 'none', padding: '16px 36px',
    color: '#000', fontWeight: '900', fontSize: '13px', cursor: 'pointer',
    letterSpacing: '2px', clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
    transition: 'background 0.2s',
  },
  secondaryBtn: {
    background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
    padding: '16px 36px', color: '#fff', fontWeight: '700', fontSize: '13px',
    cursor: 'pointer', letterSpacing: '2px', transition: 'border-color 0.2s',
  },
  statsRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' },
  statCard: {
    background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)',
    padding: '20px 32px', textAlign: 'center',
  },
  statNum: { fontSize: '32px', fontWeight: '900', color: '#00D4FF', letterSpacing: '-0.5px' },
  statLabel: { fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginTop: '4px', letterSpacing: '1.5px', fontWeight: '700' },

  // Upload Section — CENTERED
  uploadSection: {
    position: 'relative', zIndex: 1, padding: '80px 40px',
    borderTop: '1px solid rgba(0,212,255,0.1)', background: 'rgba(0,212,255,0.02)',
    textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  sectionBadge: {
    display: 'inline-block', fontSize: '10px', color: '#00D4FF',
    letterSpacing: '3px', fontWeight: '800', borderLeft: '3px solid #FF0040',
    paddingLeft: '12px', marginBottom: '16px', alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: '52px', fontWeight: '900', marginBottom: '18px',
    textTransform: 'uppercase', letterSpacing: '-1px', lineHeight: 1, textAlign: 'center',
  },
  uploadDesc: {
    fontSize: '16px', color: 'rgba(255,255,255,0.45)', marginBottom: '36px',
    letterSpacing: '0.3px', fontWeight: '500', maxWidth: '600px', textAlign: 'center',
  },
  uploadBox: {
    border: '1px solid rgba(0,212,255,0.2)', padding: '60px 40px',
    maxWidth: '600px', width: '100%', cursor: 'pointer',
    transition: 'border-color 0.3s', background: 'rgba(0,212,255,0.03)',
    textAlign: 'center', marginBottom: '64px',
  },
  uploadIcon: { fontSize: '52px', marginBottom: '18px' },
  uploadText: { fontSize: '15px', fontWeight: '800', letterSpacing: '2px', marginBottom: '8px' },
  uploadSubText: { fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px', letterSpacing: '0.3px' },
  uploadBtn: {
    background: '#00D4FF', border: 'none', padding: '11px 28px',
    color: '#000', fontWeight: '900', fontSize: '12px', cursor: 'pointer',
    letterSpacing: '2px', clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)',
  },

  // Custom Syllabus — CENTERED
  customSyllabusSection: {
    position: 'relative', zIndex: 1, padding: '60px 0',
    borderTop: '1px solid rgba(0,212,255,0.08)',
    width: '100%', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  syllabusDemo: {
    display: 'flex', gap: '32px', maxWidth: '800px', width: '100%',
    margin: '0 auto 40px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center',
  },
  syllabusDemoLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' },
  syllabusRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.1)',
    padding: '12px 16px', textAlign: 'left',
  },
  syllabusSkill: { fontSize: '13px', fontWeight: '900', color: '#00D4FF', minWidth: '60px', letterSpacing: '1px' },
  syllabusArrow: { color: '#FF0040', fontSize: '16px' },
  syllabusTopics: { fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
  syllabusDemoRight: { flexShrink: 0 },
  syllabusResult: {
    background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)',
    padding: '32px 40px', textAlign: 'center',
  },
  syllabusResultNum: { fontSize: '56px', fontWeight: '900', color: '#00D4FF' },
  syllabusResultLabel: { fontSize: '12px', fontWeight: '800', color: '#fff', letterSpacing: '3px', marginBottom: '4px' },
  syllabusResultSub: { fontSize: '11px', color: 'rgba(255,255,255,0.3)' },
  syllabusBtn: {
    background: '#00D4FF', border: 'none', padding: '15px 40px',
    color: '#000', fontWeight: '900', fontSize: '13px', cursor: 'pointer',
    letterSpacing: '2px', clipPath: 'polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%)',
    transition: 'background 0.2s',
  },

  // Flow — CENTERED
  flowRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    flexWrap: 'wrap', marginTop: '64px', justifyContent: 'center',
  },
  flowStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  flowIcon: {
    fontSize: '28px', background: 'rgba(0,212,255,0.08)',
    border: '1px solid rgba(0,212,255,0.25)',
    width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  flowLabel: { fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', fontWeight: '700' },
  arrow: { fontSize: '20px', color: '#FF0040', marginBottom: '20px', fontWeight: '900' },

  // Features — CENTERED
  featuresSection: {
    position: 'relative', zIndex: 1, padding: '80px 60px',
    borderTop: '1px solid rgba(0,212,255,0.1)',
    textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  featuresGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px', maxWidth: '1100px', width: '100%', marginTop: '36px',
  },
  featureCard: {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,212,255,0.15)',
    borderLeft: '3px solid rgba(0,212,255,0.15)', padding: '28px 24px',
    textAlign: 'left', transition: 'transform 0.3s, border-color 0.3s', cursor: 'default',
  },
  featureIcon: { fontSize: '36px', marginBottom: '14px' },
  featureTitle: { fontSize: '14px', fontWeight: '900', letterSpacing: '2px', marginBottom: '10px', color: '#fff' },
  featureDesc: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, fontWeight: '500' },

  // CTA — CENTERED
  ctaSection: {
    position: 'relative', zIndex: 1, padding: '100px 20px',
    borderTop: '1px solid rgba(0,212,255,0.1)', background: 'rgba(255,0,64,0.03)',
    textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  ctaTitle: {
    fontSize: '80px', fontWeight: '900', marginBottom: '18px',
    lineHeight: 0.92, textTransform: 'uppercase', letterSpacing: '-2px',
  },
  ctaDesc: { fontSize: '16px', color: 'rgba(255,255,255,0.4)', marginBottom: '40px', letterSpacing: '0.3px', fontWeight: '500' },

  // Footer
  footer: {
    position: 'relative', zIndex: 1, padding: '40px 60px',
    borderTop: '1px solid rgba(0,212,255,0.1)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  footerLogo: { fontSize: '16px', fontWeight: '900', color: '#fff', letterSpacing: '3px' },
  footerText: { color: 'rgba(255,255,255,0.2)', fontSize: '13px' },
};