import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&family=Playfair+Display:ital,wght@0,500;0,700;1,400;1,500&display=swap');

.sb-root { min-height:100vh; background:#000; color:#fff; font-family:'Space Grotesk',sans-serif; overflow-x:hidden; position:relative; }
.sb-grid { position:fixed; inset:0; z-index:0; pointer-events:none;
  background-image:linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px);
  background-size:48px 48px; animation:gridMove 20s linear infinite; }
.sb-mono { font-family:'JetBrains Mono',monospace; }
.sb-section { position:relative; z-index:1; padding:110px 48px; border-top:1px solid rgba(255,255,255,0.1); }
.sb-center { display:flex; flex-direction:column; align-items:center; text-align:center; }

/* reveal */
.sb-reveal { opacity:0; transform:translateY(32px); transition:opacity .7s ease, transform .7s ease; }
.sb-reveal.sb-in { opacity:1; transform:translateY(0); }

/* nav */
.sb-nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; justify-content:space-between; align-items:center;
  padding:18px 48px; background:rgba(0,0,0,0.85); backdrop-filter:blur(14px); border-bottom:1px solid rgba(255,255,255,0.12); animation:fadeDown .7s ease both; }
.sb-logo { font-weight:700; letter-spacing:4px; font-size:16px; display:flex; align-items:center; gap:10px; }
.sb-logo i { width:10px; height:10px; background:#fff; display:inline-block; animation:spinSq 4s linear infinite; }
.sb-navr { display:flex; align-items:center; gap:28px; }
.sb-link { font-size:11px; letter-spacing:2px; color:rgba(255,255,255,0.6); cursor:pointer; transition:color .2s; }
.sb-link:hover { color:#fff; }
.sb-tag { font-size:10px; letter-spacing:2px; border:1px solid rgba(255,255,255,0.4); padding:5px 10px; }

/* buttons */
.sb-btn { background:#fff; color:#000; border:1px solid #fff; padding:15px 32px; font-weight:700; font-size:12px; letter-spacing:2px; cursor:pointer;
  font-family:'Space Grotesk',sans-serif; transition:all .25s ease; position:relative; overflow:hidden; }
.sb-btn:hover { background:#000; color:#fff; transform:translateY(-3px); box-shadow:6px 6px 0 rgba(255,255,255,0.9); }
.sb-btn-o { background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.4); }
.sb-btn-o:hover { background:#fff; color:#000; box-shadow:6px 6px 0 rgba(255,255,255,0.35); }
.sb-btn-sm { padding:9px 20px; font-size:11px; }

/* hero */
.sb-hero { position:relative; z-index:1; padding:170px 48px 90px; display:grid; grid-template-columns:1.1fr 1fr; gap:56px; align-items:center; max-width:1240px; margin:0 auto; }
.sb-badge { display:inline-flex; align-items:center; gap:10px; font-size:11px; letter-spacing:2px; border:1px solid rgba(255,255,255,0.35); padding:8px 16px; margin-bottom:30px; animation:fadeUp .8s .1s ease both; }
.sb-dot { width:8px; height:8px; border-radius:50%; background:#fff; animation:pulse 1.4s ease-in-out infinite; }
.sb-h1 { font-size:84px; line-height:0.94; font-weight:700; letter-spacing:-3px; text-transform:uppercase; margin-bottom:26px; animation:fadeUp .8s .2s ease both; }
.sb-outline { color:transparent; -webkit-text-stroke:2px #fff; display:block; }
.sb-cursor { display:inline-block; width:0.5em; height:0.08em; background:#fff; margin-left:6px; animation:blink 1s steps(2) infinite; }
.sb-sub { font-size:17px; color:rgba(255,255,255,0.65); line-height:1.7; max-width:520px; margin-bottom:38px; animation:fadeUp .8s .3s ease both; }
.sb-btns { display:flex; gap:14px; flex-wrap:wrap; animation:fadeUp .8s .4s ease both; }

/* board */
.sb-board { border:1px solid rgba(255,255,255,0.3); background:#050505; padding:18px; animation:fadeUp .9s .35s ease both; box-shadow:10px 10px 0 rgba(255,255,255,0.08); }
.sb-board-top { display:flex; justify-content:space-between; align-items:center; font-size:11px; letter-spacing:2px; margin-bottom:14px; color:rgba(255,255,255,0.7); }
.sb-bar { height:4px; background:rgba(255,255,255,0.12); margin-bottom:18px; overflow:hidden; }
.sb-bar b { display:block; height:100%; background:#fff; animation:fill 4s ease-in-out infinite alternate; }
.sb-cols { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.sb-col h4 { font-size:10px; letter-spacing:2px; font-weight:700; margin-bottom:10px; color:rgba(255,255,255,0.55); display:flex; justify-content:space-between; }
.sb-card { border:1px solid rgba(255,255,255,0.25); padding:10px; margin-bottom:10px; font-size:11px; line-height:1.4; background:#000; animation:floaty 4s ease-in-out infinite; }
.sb-card small { display:block; font-size:9px; letter-spacing:1px; color:rgba(255,255,255,0.45); margin-bottom:5px; }
.sb-card.done { background:#fff; color:#000; }
.sb-card.done small { color:rgba(0,0,0,0.55); }
.sb-card.d1 { animation-delay:.4s; } .sb-card.d2 { animation-delay:.9s; } .sb-card.d3 { animation-delay:1.4s; } .sb-card.d4 { animation-delay:1.9s; }

/* ticker */
.sb-ticker { position:relative; z-index:1; border-top:1px solid rgba(255,255,255,0.12); border-bottom:1px solid rgba(255,255,255,0.12); overflow:hidden; padding:16px 0; background:#000; }
.sb-ticker-track { display:flex; width:max-content; animation:marquee 26s linear infinite; }
.sb-ticker span { font-size:13px; letter-spacing:4px; font-weight:700; padding:0 28px; white-space:nowrap; }
.sb-ticker span:nth-child(even) { color:transparent; -webkit-text-stroke:1px rgba(255,255,255,0.7); }

/* stats */
.sb-stats { display:grid; grid-template-columns:repeat(4,1fr); max-width:1100px; width:100%; border:1px solid rgba(255,255,255,0.25); }
.sb-stat { padding:34px 16px; border-right:1px solid rgba(255,255,255,0.25); transition:background .25s, color .25s; }
.sb-stat:last-child { border-right:none; }
.sb-stat:hover { background:#fff; color:#000; }
.sb-stat b { display:block; font-size:44px; letter-spacing:-1px; }
.sb-stat span { font-size:10px; letter-spacing:2px; opacity:.65; }

/* section titles */
.sb-eyebrow { font-size:11px; letter-spacing:3px; margin-bottom:18px; border-left:3px solid #fff; padding-left:12px; }
.sb-title { font-size:56px; font-weight:700; letter-spacing:-2px; line-height:1.02; text-transform:uppercase; margin-bottom:14px; }
.sb-title em { font-style:normal; color:transparent; -webkit-text-stroke:1.5px #fff; }
.sb-desc { font-size:15px; color:rgba(255,255,255,0.6); max-width:540px; line-height:1.7; }

/* feature tickets */
.sb-feat { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; max-width:1140px; width:100%; margin-top:52px; text-align:left; }
.sb-ticket { border:1px solid rgba(255,255,255,0.22); padding:26px 24px; background:#030303; transition:all .3s ease; position:relative; }
.sb-ticket:hover { transform:translate(-6px,-6px); box-shadow:8px 8px 0 #fff; border-color:#fff; }
.sb-ticket-top { display:flex; justify-content:space-between; font-size:10px; letter-spacing:2px; color:rgba(255,255,255,0.5); margin-bottom:22px; }
.sb-ticket-top b { border:1px solid rgba(255,255,255,0.4); padding:2px 8px; color:#fff; font-weight:400; }
.sb-ticket h3 { font-size:17px; letter-spacing:2px; margin-bottom:10px; }
.sb-ticket p { font-size:13px; color:rgba(255,255,255,0.6); line-height:1.7; }
.sb-ticket .ic { font-size:28px; margin-bottom:14px; display:block; }

/* sprint steps */
.sb-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:0; max-width:1100px; width:100%; margin-top:60px; position:relative; }
.sb-steps::before { content:''; position:absolute; top:34px; left:12%; right:12%; height:1px; background:repeating-linear-gradient(90deg,#fff 0 8px,transparent 8px 16px); opacity:.5; }
.sb-step { display:flex; flex-direction:column; align-items:center; gap:14px; position:relative; }
.sb-step-ic { width:68px; height:68px; background:#000; border:1px solid #fff; display:flex; align-items:center; justify-content:center; font-size:26px; transition:all .3s; }
.sb-step:hover .sb-step-ic { background:#fff; transform:rotate(45deg) scale(1.05); }
.sb-step:hover .sb-step-ic span { transform:rotate(-45deg); }
.sb-step-ic span { transition:transform .3s; }
.sb-step small { font-size:10px; letter-spacing:2px; color:rgba(255,255,255,0.5); }
.sb-step b { font-size:12px; letter-spacing:2px; }

/* cta */
.sb-cta h2 { font-size:92px; font-weight:700; letter-spacing:-3px; line-height:0.95; text-transform:uppercase; margin-bottom:18px; }
.sb-foot { position:relative; z-index:1; display:flex; justify-content:space-between; align-items:center; padding:34px 48px; border-top:1px solid rgba(255,255,255,0.12); font-size:13px; color:rgba(255,255,255,0.45); }

/* cinematic hero */
.sb-cine { position:relative; z-index:1; min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:130px 24px 90px; overflow:hidden; }
.sb-cine-bg { position:absolute; inset:0; z-index:0; background:#030303; overflow:hidden; }
.sb-code { position:absolute; left:-4%; right:-4%; top:0; font-family:'JetBrains Mono',monospace; font-size:16px; line-height:1.75; color:rgba(255,255,255,0.55);
  white-space:pre; filter:blur(1.2px); transform:rotate(-3deg) scale(1.12); animation:codeScroll 60s linear infinite; text-align:left; }
.sb-code .k { color:rgba(255,255,255,0.95); } .sb-code .c { color:rgba(255,255,255,0.28); } .sb-code .s { color:rgba(255,255,255,0.7); }
.sb-photo { position:absolute; inset:0; background-size:cover; background-position:center; filter:grayscale(1) contrast(1.1) brightness(.7); }
.sb-shade { position:absolute; inset:0; background:radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.78) 55%, rgba(0,0,0,0.97) 100%), linear-gradient(to bottom, rgba(0,0,0,0.55), transparent 30%, transparent 70%, #000 100%); }
.sb-cine-in { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; }
.sb-cap { font-size:36px; letter-spacing:14px; font-weight:500; text-transform:uppercase; color:rgba(255,255,255,0.88); margin-bottom:26px; animation:fadeUp 1s .1s ease both; }
.sb-serif { font-family:'Playfair Display',serif; font-weight:500; text-transform:none; }
.sb-name { font-size:clamp(54px,9vw,124px); line-height:.95; letter-spacing:-2px; animation:fadeUp 1.1s .25s ease both; text-shadow:0 6px 50px rgba(0,0,0,0.7); }
.sb-amp { display:block; font-style:italic; font-weight:400; font-size:.6em; line-height:1; margin:6px 0 4px; color:rgba(255,255,255,0.85); animation:fadeUp 1.1s .4s ease both; }
.sb-rule { width:150px; height:1px; background:rgba(255,255,255,0.7); margin:40px 0 32px; animation:growX 1.2s .7s ease both; transform-origin:center; }
.sb-sub-cap { font-size:15px; letter-spacing:8px; text-transform:uppercase; color:rgba(255,255,255,0.9); margin-bottom:14px; animation:fadeUp 1s .85s ease both; }
.sb-date { font-size:clamp(26px,3.4vw,42px); font-style:italic; font-weight:400; margin-bottom:26px; animation:fadeUp 1s 1s ease both; }
.sb-place { font-size:12px; letter-spacing:6px; text-transform:uppercase; color:rgba(255,255,255,0.65); margin-bottom:40px; animation:fadeUp 1s 1.1s ease both; }
.sb-cine .sb-btns { justify-content:center; animation:fadeUp 1s 1.25s ease both; }
.sb-scroll { position:absolute; bottom:26px; left:50%; transform:translateX(-50%); z-index:2; font-size:10px; letter-spacing:5px; color:rgba(255,255,255,0.5); animation:floaty 2.2s ease-in-out infinite; }
@keyframes codeScroll { from { transform:rotate(-3deg) scale(1.12) translateY(0); } to { transform:rotate(-3deg) scale(1.12) translateY(-45%); } }
@keyframes growX { from { transform:scaleX(0); opacity:0; } to { transform:scaleX(1); opacity:1; } }
@media (max-width:900px) { .sb-cap { letter-spacing:7px; font-size:22px; } .sb-sub-cap { letter-spacing:5px; font-size:11px; } .sb-place { letter-spacing:3px; font-size:10px; } }

@keyframes fadeUp { from { opacity:0; transform:translateY(30px);} to { opacity:1; transform:translateY(0);} }
@keyframes fadeDown { from { opacity:0; transform:translateY(-30px);} to { opacity:1; transform:translateY(0);} }
@keyframes blink { 50% { opacity:0; } }
@keyframes pulse { 0%,100% { box-shadow:0 0 0 0 rgba(255,255,255,0.7);} 50% { box-shadow:0 0 0 8px rgba(255,255,255,0);} }
@keyframes floaty { 0%,100% { transform:translateY(0);} 50% { transform:translateY(-6px);} }
@keyframes fill { from { width:22%; } to { width:88%; } }
@keyframes marquee { from { transform:translateX(0);} to { transform:translateX(-50%);} }
@keyframes gridMove { from { background-position:0 0; } to { background-position:48px 48px; } }
@keyframes spinSq { from { transform:rotate(0);} to { transform:rotate(360deg);} }

@media (max-width:900px) {
  .sb-hero { grid-template-columns:1fr; padding:140px 22px 60px; }
  .sb-h1 { font-size:52px; letter-spacing:-2px; }
  .sb-section { padding:80px 22px; }
  .sb-feat, .sb-steps { grid-template-columns:1fr; gap:30px; }
  .sb-steps::before { display:none; }
  .sb-stats { grid-template-columns:repeat(2,1fr); }
  .sb-title { font-size:36px; }
  .sb-cta h2 { font-size:54px; }
  .sb-nav { padding:16px 20px; }
  .sb-link, .sb-tag { display:none; }
  .sb-foot { flex-direction:column; gap:10px; padding:28px 20px; }
}
`;


// Background photo (optional): put a coding photo in /public/code-bg.jpg then set BG_IMAGE = '/code-bg.jpg'
const BG_IMAGE = '';

const CODE_LINES = [
  "// interview-ai / server.js",
  "const express = require('express');",
  "const mongoose = require('mongoose');",
  "",
  "app.post('/api/interview/evaluate', async (req, res) => {",
  "  const { question, answer } = req.body;",
  "  const result = await groq.chat.completions.create({",
  "    model: 'llama-3.1-8b-instant',",
  "    messages: [{ role: 'user', content: prompt(question, answer) }],",
  "  });",
  "  const { score, feedback, tip } = JSON.parse(result.text);",
  "  res.json({ score, feedback, tip });",
  "});",
  "",
  "function startInterview(skills) {",
  "  const questions = generateQuestions(skills);",
  "  for (const q of questions) {",
  "    speak(q);",
  "    const answer = await listen();",
  "    evaluate(q, answer);",
  "  }",
  "  return showResult();",
  "}",
  "",
  "export default function Interview() {",
  "  const [timer, setTimer] = useState(90);",
  "  useEffect(() => { startCamera(); }, []);",
  "  return <Question onNext={handleNext} />;",
  "}",
  "",
];
const CODE = Array.from({ length: 6 }, () => CODE_LINES.join('\n')).join('\n\n');

const WORDS = ['AI QUESTIONS', 'VOICE ANSWERS', 'VIDEO INTERVIEW', 'RESUME SKILLS', 'INSTANT FEEDBACK', 'FREE FOREVER'];

export default function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const els = document.querySelectorAll('.sb-reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('sb-in'); }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="sb-root">
      <style>{css}</style>
      <div className="sb-grid" />

      {/* Navbar */}
      <nav className="sb-nav">
        <div className="sb-logo"><i /> INTERVIEWAI</div>
        <div className="sb-navr">
          <span className="sb-link">FEATURES</span>
          <span className="sb-link">HOW IT WORKS</span>
          <span className="sb-tag sb-mono">SPRINT 01</span>
          <button className="sb-btn sb-btn-sm" onClick={() => navigate('/login')}>GET STARTED</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="sb-cine">
        <div className="sb-cine-bg">
          {BG_IMAGE ? <div className="sb-photo" style={{ backgroundImage: `url(${BG_IMAGE})` }} /> : <pre className="sb-code">{CODE}</pre>}
          <div className="sb-shade" />
        </div>

        <div className="sb-cine-in">
          <div className="sb-cap">Crack your</div>
          <h1 className="sb-name sb-serif">
            Dream
            <br />
            Interview
          </h1>
          <div className="sb-rule" />
          <div className="sb-sub-cap">Powered by AI</div>
          <div className="sb-date sb-serif">Voice. Video. Instant Feedback.</div>
          <div className="sb-place">Free · Resume Based · Custom Syllabus</div>
          <div className="sb-btns">
            <button className="sb-btn" onClick={() => navigate('/login')}>START FOR FREE →</button>
            <button className="sb-btn sb-btn-o" onClick={() => navigate('/login')}>WATCH DEMO</button>
          </div>
        </div>
        <div className="sb-scroll sb-mono">SCROLL ↓</div>
      </section>

      {/* Ticker */}
      <div className="sb-ticker">
        <div className="sb-ticker-track">
          {[...WORDS, ...WORDS, ...WORDS, ...WORDS].map((w, i) => <span key={i}>{w} ✦</span>)}
        </div>
      </div>

      {/* Stats */}
      <section className="sb-section sb-center">
        <div className="sb-eyebrow sb-mono sb-reveal">SPRINT VELOCITY</div>
        <h2 className="sb-title sb-reveal">Numbers that <em>ship</em></h2>
        <div className="sb-stats sb-reveal" style={{ marginTop: 44 }}>
          {[
            ['10K+', 'INTERVIEWS DONE'],
            ['95%', 'SUCCESS RATE'],
            ['500+', 'COMPANIES'],
            ['100%', 'FREE'],
          ].map(([n, l]) => (
            <div className="sb-stat" key={l}><b>{n}</b><span className="sb-mono">{l}</span></div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="sb-section sb-center">
        <div className="sb-eyebrow sb-mono sb-reveal">BACKLOG</div>
        <h2 className="sb-title sb-reveal">What you <em>get</em></h2>
        <p className="sb-desc sb-reveal">Every feature is a ticket — and every ticket is already shipped.</p>
        <div className="sb-feat">
          {[
            ['🤖', 'AI QUESTIONS', 'Personalized questions generated from your own syllabus in seconds.'],
            ['🎤', 'VOICE ANSWER', 'Speak your answers — no typing, just like a real interview.'],
            ['📹', 'VIDEO INTERVIEW', 'Practice with camera on and feel the real interview pressure.'],
            ['📄', 'RESUME UPLOAD', 'Upload your resume — AI auto-detects your skills and syllabus.'],
            ['🎯', 'CUSTOM SYLLABUS', 'Type your own skills and topics — AI interviews you on those.'],
            ['📊', 'AI FEEDBACK', 'Detailed score, feedback and tips for every single answer.'],
          ].map(([ic, t, d], i) => (
            <div className="sb-ticket sb-reveal" key={t} style={{ transitionDelay: `${(i % 3) * 120}ms` }}>
              <div className="sb-ticket-top sb-mono"><span>IA-{String(201 + i)}</span><b>DONE</b></div>
              <span className="ic">{ic}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="sb-section sb-center">
        <div className="sb-eyebrow sb-mono sb-reveal">SPRINT PLAN</div>
        <h2 className="sb-title sb-reveal">How it <em>works</em></h2>
        <div className="sb-steps sb-reveal">
          {[
            ['📄', 'DAY 1', 'Resume Upload'],
            ['🤖', 'DAY 2', 'AI Detect'],
            ['🎥', 'DAY 3', 'Video Interview'],
            ['📊', 'DAY 4', 'AI Feedback'],
          ].map(([ic, d, l]) => (
            <div className="sb-step" key={l}>
              <div className="sb-step-ic"><span>{ic}</span></div>
              <small className="sb-mono">{d}</small>
              <b>{l.toUpperCase()}</b>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="sb-section sb-center sb-cta">
        <div className="sb-eyebrow sb-mono sb-reveal">NEXT SPRINT</div>
        <h2 className="sb-reveal">Ready to<br /><span className="sb-outline" style={{ display: 'inline' }}>begin?</span></h2>
        <p className="sb-desc sb-reveal" style={{ marginBottom: 36 }}>Start practicing today — completely free.</p>
        <button className="sb-btn sb-reveal" onClick={() => navigate('/login')}>GET STARTED NOW →</button>
      </section>

      <footer className="sb-foot">
        <div className="sb-logo"><i /> INTERVIEWAI</div>
        <span>Made with ❤️ by InterviewAI Team</span>
      </footer>
    </div>
  );
}