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

    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    let animId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        // Purple violet glow particles
        ctx.fillStyle = `rgba(197, 160, 89, ${p.opacity})`;
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
      {/* Background Glow Orbs */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
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
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(224, 122, 95, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            START FOR FREE ▶
          </button>
          <button
            style={styles.secondaryBtn}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.background = 'rgba(197, 160, 89, 0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.background = 'transparent';
            }}
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
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(197, 160, 89, 0.1)';
            e.currentTarget.style.background = 'rgba(197, 160, 89, 0.03)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
          }}
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
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(197, 160, 89, 0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = 'none';
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
        <h2 style={styles.ctaTitle}>READY TO<br /><span style={styles.ctaAccent}>BEGIN?</span></h2>
        <p style={styles.ctaDesc}>Start practicing today — completely free.</p>
        <button
          style={styles.primaryBtn}
          onClick={() => navigate('/login')}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.color = '#000';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(224, 122, 95, 0.45)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.boxShadow = 'none';
          }}
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
    background: 'var(--bg-dark)',
    color: 'var(--text-primary)',
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
  navbar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 60px',
    background: 'rgba(4, 2, 9, 0.85)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--border-color)',
    zIndex: 100,
  },
  logo: { fontSize: '20px', fontWeight: '900', color: '#fff', letterSpacing: '3px' },
  logoAccent: { color: 'var(--text-secondary)' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '32px' },
  navLink: { color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', letterSpacing: '2px', fontWeight: '700', transition: 'color 0.2s' },
  navBtn: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    border: 'none',
    padding: '10px 24px',
    color: '#fff',
    fontWeight: '800',
    cursor: 'pointer',
    fontSize: '11px',
    letterSpacing: '2px',
    borderRadius: '30px',
    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.25)',
    transition: 'all 0.2s ease',
  },

  // Hero
  hero: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center',
    paddingTop: '180px', paddingBottom: '90px',
    paddingLeft: '20px', paddingRight: '20px',
  },
  badge: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '2px', fontWeight: '700',
    border: '1px solid var(--border-hover)', padding: '6px 16px', marginBottom: '32px',
    borderRadius: '30px', background: 'rgba(197, 160, 89, 0.05)',
  },
  badgeDot: {
    width: '7px', height: '7px', background: 'var(--text-secondary)',
    borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px var(--text-secondary)',
  },
  heading: {
    fontSize: '84px', fontWeight: '900', lineHeight: 0.95,
    marginBottom: '28px', textTransform: 'uppercase', letterSpacing: '-2px',
  },
  outlineText: { color: 'transparent', WebkitTextStroke: '2px var(--primary)', display: 'block' },
  accentText: { color: 'var(--accent)', display: 'block', textShadow: '0 0 40px rgba(217, 70, 239, 0.2)' },
  subText: {
    fontSize: '18px', color: 'var(--text-muted)', maxWidth: '580px',
    lineHeight: 1.7, marginBottom: '44px', fontWeight: '500',
  },
  btnGroup: { display: 'flex', gap: '16px', marginBottom: '64px', flexWrap: 'wrap', justifyContent: 'center' },
  primaryBtn: {
    background: 'transparent',
    border: '1.5px solid var(--accent)',
    padding: '16px 36px',
    color: 'var(--accent)',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    letterSpacing: '2px',
    borderRadius: '30px',
    transition: 'all 0.3s ease',
  },
  secondaryBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '30px',
    padding: '16px 36px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.2s ease',
  },
  statsRow: { display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' },
  statCard: {
    background: 'rgba(20, 16, 36, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px 36px',
    textAlign: 'center',
    backdropFilter: 'blur(8px)',
  },
  statNum: { fontSize: '32px', fontWeight: '900', color: 'var(--text-secondary)', letterSpacing: '-0.5px' },
  statLabel: { fontSize: '9px', color: 'var(--text-muted)', marginTop: '6px', letterSpacing: '1.5px', fontWeight: '700' },

  // Upload Section
  uploadSection: {
    position: 'relative', zIndex: 1, padding: '90px 40px',
    borderTop: '1px solid var(--border-color)', background: 'rgba(197, 160, 89, 0.01)',
    textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  sectionBadge: {
    display: 'inline-block', fontSize: '10px', color: 'var(--text-secondary)',
    letterSpacing: '3px', fontWeight: '800', borderLeft: '3px solid var(--accent)',
    paddingLeft: '12px', marginBottom: '20px', alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: '48px', fontWeight: '900', marginBottom: '20px',
    textTransform: 'uppercase', letterSpacing: '-1px', lineHeight: 1.05, textAlign: 'center',
  },
  uploadDesc: {
    fontSize: '16px', color: 'var(--text-muted)', marginBottom: '40px',
    lineHeight: 1.7, maxWidth: '600px', textAlign: 'center',
  },
  uploadBox: {
    border: '1px dashed var(--border-color)',
    borderRadius: '24px',
    padding: '60px 40px',
    maxWidth: '600px',
    width: '100%',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.01)',
    textAlign: 'center',
    marginBottom: '64px',
  },
  uploadIcon: { fontSize: '52px', marginBottom: '18px' },
  uploadText: { fontSize: '15px', fontWeight: '800', letterSpacing: '2px', marginBottom: '8px' },
  uploadSubText: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' },
  uploadBtn: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    border: 'none',
    padding: '12px 32px',
    color: '#fff',
    fontWeight: '800',
    fontSize: '12px',
    letterSpacing: '2px',
    borderRadius: '30px',
  },

  // Custom Syllabus
  customSyllabusSection: {
    position: 'relative', zIndex: 1, padding: '60px 0',
    borderTop: '1px solid var(--border-color)',
    width: '100%', textAlign: 'center',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  syllabusDemo: {
    display: 'flex', gap: '24px', maxWidth: '800px', width: '100%',
    margin: '0 auto 44px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center',
  },
  syllabusDemoLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '300px' },
  syllabusRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
    background: 'rgba(20, 16, 36, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 20px',
    textAlign: 'left',
  },
  syllabusSkill: { fontSize: '13px', fontWeight: '900', color: 'var(--text-secondary)', minWidth: '70px', letterSpacing: '1px' },
  syllabusArrow: { color: 'var(--accent)', fontSize: '16px' },
  syllabusTopics: { fontSize: '12px', color: 'var(--text-muted)' },
  syllabusDemoRight: { flexShrink: 0 },
  syllabusResult: {
    background: 'rgba(197, 160, 89, 0.03)',
    border: '1px solid var(--border-hover)',
    borderRadius: '16px',
    padding: '36px 48px',
    textAlign: 'center',
  },
  syllabusResultNum: { fontSize: '56px', fontWeight: '900', color: 'var(--primary)' },
  syllabusResultLabel: { fontSize: '12px', fontWeight: '800', color: '#fff', letterSpacing: '3px', marginBottom: '6px' },
  syllabusResultSub: { fontSize: '11px', color: 'var(--text-muted)' },
  syllabusBtn: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    border: 'none',
    padding: '16px 40px',
    color: '#fff',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    letterSpacing: '2px',
    borderRadius: '30px',
    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.3)',
    transition: 'all 0.2s ease',
  },

  // Flow
  flowRow: {
    display: 'flex', alignItems: 'center', gap: '16px',
    flexWrap: 'wrap', marginTop: '72px', justifyContent: 'center',
  },
  flowStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  flowIcon: {
    fontSize: '28px', background: 'rgba(197, 160, 89, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  flowLabel: { fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: '700' },
  arrow: { fontSize: '20px', color: 'var(--accent)', marginBottom: '22px', fontWeight: '900' },

  // Features
  featuresSection: {
    position: 'relative', zIndex: 1, padding: '90px 40px',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  featuresGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
    gap: '20px', maxWidth: '1100px', width: '100%', marginTop: '40px',
  },
  featureCard: {
    background: 'rgba(20, 16, 36, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '32px 28px',
    textAlign: 'left',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
  },
  featureIcon: { fontSize: '36px', marginBottom: '16px' },
  featureTitle: { fontSize: '14px', fontWeight: '900', letterSpacing: '2px', marginBottom: '12px', color: '#fff' },
  featureDesc: { fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, fontWeight: '500' },

  // CTA
  ctaSection: {
    position: 'relative', zIndex: 1, padding: '110px 20px',
    borderTop: '1px solid var(--border-color)',
    background: 'rgba(217, 70, 239, 0.02)',
    textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  ctaTitle: {
    fontSize: '72px', fontWeight: '900', marginBottom: '20px',
    lineHeight: 0.95, textTransform: 'uppercase', letterSpacing: '-2px',
  },
  ctaAccent: { color: 'var(--text-secondary)' },
  ctaDesc: { fontSize: '16px', color: 'var(--text-muted)', marginBottom: '44px', fontWeight: '500' },

  // Footer
  footer: {
    position: 'relative', zIndex: 1, padding: '40px 60px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg-dark)',
  },
  footerLogo: { fontSize: '16px', fontWeight: '900', color: '#fff', letterSpacing: '3px' },
  footerText: { color: 'var(--text-muted)', fontSize: '13px' },
};