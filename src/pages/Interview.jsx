import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const DEFAULT_QUESTIONS = [
  { q: 'Tell me about yourself and your technical background.', topic: 'Introduction', skill: 'General' },
  { q: 'What is the difference between var, let, and const in JavaScript?', topic: 'Variables', skill: 'JavaScript' },
  { q: 'Explain what REST API is and how it works.', topic: 'API', skill: 'Backend' },
  { q: 'What is the difference between SQL and NoSQL databases?', topic: 'Database', skill: 'Database' },
  { q: 'Explain Object Oriented Programming with an example.', topic: 'OOP', skill: 'General' },
];

export default function Interview() {
  const navigate = useNavigate();
  const location = useLocation();

  const { skillGroups, interviewType: passedType, difficulty: passedDiff } = location.state || {};
  const isSkillMode = !!skillGroups;
  const QUESTIONS = DEFAULT_QUESTIONS;

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const isSpeakingRef = useRef(false);

  const [step, setStep] = useState('setup');
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [timer, setTimer] = useState(90);
  const [interviewType, setInterviewType] = useState(passedType || 'Technical');
  const [difficulty, setDifficulty] = useState(passedDiff || 'Medium');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [currentSkillIdx, setCurrentSkillIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [allAnswers, setAllAnswers] = useState([]);
  const [skillAnswers, setSkillAnswers] = useState([]);
  const [showSkillComplete, setShowSkillComplete] = useState(false);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);

  const currentSkill = isSkillMode ? skillGroups[currentSkillIdx] : null;
  const currentQuestions = isSkillMode ? currentSkill?.questions : QUESTIONS;
  const totalSkills = isSkillMode ? skillGroups.length : 0;
  const totalQuestionsInSkill = currentQuestions?.length || 0;

  const speakQuestion = useCallback((text, onDone) => {
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes('Google US English') || v.name.includes('Samantha') ||
        v.name.includes('Daniel') || v.name.includes('Alex')
      );
      if (preferred) utterance.voice = preferred;
    };
    if (window.speechSynthesis.getVoices().length > 0) loadVoices();
    else window.speechSynthesis.onvoiceschanged = loadVoices;
    utterance.onend = () => { setIsSpeaking(false); isSpeakingRef.current = false; if (onDone) onDone(); };
    utterance.onerror = () => { setIsSpeaking(false); isSpeakingRef.current = false; };
    window.speechSynthesis.speak(utterance);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      setCameraOn(true); setMicOn(true);
    } catch { alert('Camera/Mic access denied.'); }
  };

  const stopCamera = () => {
    window.speechSynthesis.cancel();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOn(false); setMicOn(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for speech recognition.'); return; }
    const recognition = new SR();
    recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US';
    recognition.onresult = (e) => { setTranscript(Array.from(e.results).map(r => r[0].transcript).join('')); };
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const handleSkillNext = useCallback(() => {
    stopListening(); clearInterval(timerRef.current); window.speechSynthesis.cancel();
    const answer = { q: currentQuestions[currentQIdx].q, topic: currentQuestions[currentQIdx].topic, skill: currentSkill.skill, a: transcript || '' };
    const updatedSkillAnswers = [...skillAnswers, answer];
    setSkillAnswers(updatedSkillAnswers); setTranscript('');
    if (currentQIdx + 1 >= totalQuestionsInSkill) {
      setAllAnswers(prev => [...prev, ...updatedSkillAnswers]); setSkillAnswers([]); setShowSkillComplete(true);
      speakQuestion(`Excellent! You have completed the ${currentSkill.skill} section!`);
    } else {
      const nextIdx = currentQIdx + 1; setCurrentQIdx(nextIdx);
      setTimeout(() => { speakQuestion(currentQuestions[nextIdx].q, () => startListening()); }, 400);
    }
  }, [currentQIdx, transcript, skillAnswers, currentQuestions, currentSkill, totalQuestionsInSkill, speakQuestion]);

  const handleNextSkill = () => {
    window.speechSynthesis.cancel();
    if (currentSkillIdx + 1 >= totalSkills) {
      stopCamera(); setStep('finished');
      setTimeout(() => { navigate('/result', { state: { answers: allAnswers, interviewType, difficulty } }); }, 1500);
    } else {
      const nextSkillIdx = currentSkillIdx + 1;
      setCurrentSkillIdx(nextSkillIdx); setCurrentQIdx(0); setShowSkillComplete(false);
      setTimeout(() => { speakQuestion(`Moving to ${skillGroups[nextSkillIdx].skill}. ${skillGroups[nextSkillIdx].questions[0].q}`, () => startListening()); }, 500);
    }
  };

  const handleNormalNext = useCallback(() => {
    stopListening(); window.speechSynthesis.cancel();
    const ans = [...answers, { q: QUESTIONS[currentQ].q, topic: QUESTIONS[currentQ].topic, a: transcript || '' }];
    setAnswers(ans); setTranscript(''); clearInterval(timerRef.current);
    if (currentQ + 1 >= QUESTIONS.length) {
      stopCamera(); setStep('finished');
      setTimeout(() => navigate('/result', { state: { answers: ans, interviewType, difficulty } }), 1500);
    } else {
      const nextIdx = currentQ + 1; setCurrentQ(nextIdx);
      setTimeout(() => { speakQuestion(QUESTIONS[nextIdx].q, () => startListening()); }, 400);
    }
  }, [currentQ, transcript, answers, interviewType, difficulty, navigate, QUESTIONS, speakQuestion]);

  const handleNext = isSkillMode ? handleSkillNext : handleNormalNext;

  useEffect(() => {
    if (step === 'interview' && !showSkillComplete) {
      setTimer(90);
      timerRef.current = setInterval(() => {
        if (isSpeakingRef.current) return;
        setTimer(prev => { if (prev <= 1) { clearInterval(timerRef.current); handleNext(); return 90; } return prev - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, currentQIdx, currentSkillIdx, showSkillComplete, handleNext]);

  const startInterview = () => {
    startCamera(); setStep('interview');
    setTimeout(() => {
      const firstQ = isSkillMode
        ? `Welcome to your interview. Let's start with ${skillGroups[0].skill}. ${skillGroups[0].questions[0].q}`
        : `Welcome to your interview. ${QUESTIONS[0].q}`;
      speakQuestion(firstQ, () => startListening());
    }, 1000);
  };

  const timerColor = timer > 50 ? 'var(--primary)' : timer > 20 ? 'var(--warning)' : 'var(--error)';
  const totalQuestions = isSkillMode ? skillGroups.reduce((s, g) => s + g.questions.length, 0) : QUESTIONS.length;
  const doneQuestions = isSkillMode
    ? skillGroups.slice(0, currentSkillIdx).reduce((s, g) => s + g.questions.length, 0) + currentQIdx
    : currentQ;
  const progressPct = ((doneQuestions + 1) / totalQuestions) * 100;

  return (
    <div style={styles.container}>
      {/* Background Glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.logo}>Interview<span style={styles.logoAccent}>AI</span></div>
          {step === 'interview' && !showSkillComplete && isSkillMode && (
            <div style={styles.skillTag}>
              {currentSkill.skill} — Q{currentQIdx + 1}/{totalQuestionsInSkill}
            </div>
          )}
        </div>
        {step === 'interview' && !showSkillComplete && (
          <div style={styles.headerCenter}>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
            </div>
            <span style={styles.progressText}>{doneQuestions + 1} / {totalQuestions} Questions</span>
          </div>
        )}
        <button style={styles.exitBtn}
          onClick={() => { stopCamera(); navigate('/dashboard'); }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
            e.currentTarget.style.borderColor = 'var(--error)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.3)';
          }}
        >
          ✕ Exit
        </button>
      </div>

      {/* SETUP */}
      {step === 'setup' && (
        <div style={styles.setupContainer}>
          <div style={styles.setupCard}>
            <div style={styles.setupBadge}>INTERVIEW SETUP</div>
            <h1 style={styles.setupTitle}>Configure Your Session</h1>
            <p style={styles.setupSub}>
              {isSkillMode ? `${totalSkills} skills · ${totalQuestions} total questions` : 'Set up your interview preferences'}
            </p>

            <div style={styles.cameraBox}>
              <video ref={videoRef} autoPlay muted style={styles.videoPreview} />
              {!cameraOn && (
                <div style={styles.cameraOff}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>📷</div>
                  <p style={styles.cameraOffText}>Camera is off</p>
                </div>
              )}
              {cameraOn && <div style={styles.liveTag}><span style={styles.liveDot} />Live Preview</div>}
            </div>

            <div style={styles.voiceInfoBox}>
              <span style={{ fontSize: '24px' }}>🎙️</span>
              <div>
                <p style={styles.voiceInfoTitle}>AI Voice Interviewer Active</p>
                <p style={styles.voiceInfoDesc}>AI will read each question aloud — speak your answer after it finishes</p>
              </div>
            </div>

            {isSkillMode ? (
              <div style={styles.badgeRow}>
                {[
                  { icon: '📄', text: interviewType },
                  { icon: '⚡', text: difficulty },
                  { icon: '🎯', text: `${totalSkills} Skills` },
                  { icon: '📋', text: `${totalQuestions} Questions` },
                ].map((b, i) => (
                  <div key={i} style={styles.infoBadge}>{b.icon} {b.text}</div>
                ))}
              </div>
            ) : (
              <div style={styles.setupGrid}>
                <div style={styles.setupField}>
                  <label style={styles.setupLabel}>Interview Type</label>
                  <select style={styles.select} value={interviewType} onChange={e => setInterviewType(e.target.value)}>
                    <option>Technical</option><option>HR Round</option><option>Company Specific</option>
                  </select>
                </div>
                <div style={styles.setupField}>
                  <label style={styles.setupLabel}>Difficulty</label>
                  <select style={styles.select} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
              </div>
            )}

            <div style={styles.setupActions}>
              <button style={styles.cameraToggleBtn}
                onClick={cameraOn ? stopCamera : startCamera}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(197, 160, 89, 0.3)'}
              >
                {cameraOn ? '📷 Camera On' : '📷 Turn On Camera'}
              </button>
              <button style={styles.startBtn}
                onClick={startInterview}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(197, 160, 89, 0.4)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(197, 160, 89, 0.25)';
                }}
              >
                Start Interview →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SKILL COMPLETE */}
      {step === 'interview' && showSkillComplete && (
        <div style={styles.skillCompleteContainer}>
          <div style={styles.skillCompleteCard}>
            <div style={styles.skillCompleteIcon}>✅</div>
            <div style={styles.skillCompleteBadge}>SECTION COMPLETE</div>
            <h2 style={styles.skillCompleteTitle}>{currentSkill.skill}</h2>
            <p style={styles.skillCompleteSub}>{totalQuestionsInSkill} questions answered successfully</p>

            <div style={styles.skillStats}>
              {[
                { num: currentSkillIdx + 1, label: 'Sections Done' },
                { num: totalSkills - currentSkillIdx - 1, label: 'Remaining' },
                { num: doneQuestions + totalQuestionsInSkill, label: 'Total Done' },
              ].map((s, i) => (
                <div key={i} style={styles.skillStat}>
                  <div style={styles.skillStatNum}>{s.num}</div>
                  <div style={styles.skillStatLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {currentSkillIdx + 1 < totalSkills ? (
              <>
                <div style={styles.nextSkillBox}>
                  <span style={styles.nextSkillLabel}>Next Section</span>
                  <span style={styles.nextSkillName}>{skillGroups[currentSkillIdx + 1].skill}</span>
                  <span style={styles.nextSkillCount}>{skillGroups[currentSkillIdx + 1].questions.length} questions</span>
                </div>
                <div style={styles.skillBtnRow}>
                  <button style={styles.continueBtn} onClick={handleNextSkill}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(197, 160, 89, 0.4)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(197, 160, 89, 0.25)';
                    }}
                  >
                    Continue → {skillGroups[currentSkillIdx + 1].skill}
                  </button>
                  <button style={styles.endBtn}
                    onClick={() => { stopCamera(); navigate('/result', { state: { answers: allAnswers, interviewType, difficulty } }); }}
                  >
                    End & See Results
                  </button>
                </div>
              </>
            ) : (
              <button style={styles.continueBtn} onClick={handleNextSkill}>View Results →</button>
            )}
          </div>
        </div>
      )}

      {/* INTERVIEW */}
      {step === 'interview' && !showSkillComplete && (
        <div style={styles.interviewLayout}>

          {/* LEFT — Video */}
          <div style={styles.leftPanel}>
            <div style={styles.videoBox}>
              <video ref={videoRef} autoPlay muted style={styles.video} />
              {!cameraOn && <div style={styles.videoOff}><span style={{ fontSize: '32px' }}>📷</span></div>}
              <div style={styles.videoOverlayTop}>
                <div style={styles.liveIndicator}><span style={styles.liveDot} />Live</div>
              </div>
              {isSpeaking && <div style={styles.aiSpeakingOverlay}>🔊 AI Speaking...</div>}
              {isListening && !isSpeaking && <div style={styles.listeningOverlay}>🎤 Listening...</div>}
            </div>

            {/* Controls */}
            <div style={styles.controlsRow}>
              <div style={{ ...styles.controlCard, borderColor: isSpeaking ? 'var(--primary)' : 'var(--border-color)' }}>
                <span style={styles.controlIcon}>{isSpeaking ? '🔊' : micOn ? '🎤' : '🔇'}</span>
                <span style={styles.controlLabel}>{isSpeaking ? 'AI Speaking' : micOn ? 'Mic Active' : 'Mic Off'}</span>
              </div>
              <div style={{ ...styles.controlCard, cursor: 'pointer', borderColor: isListening ? 'var(--primary)' : 'var(--border-color)' }}
                onClick={isListening ? stopListening : startListening}>
                <span style={styles.controlIcon}>{isListening ? '⏹' : '▶'}</span>
                <span style={styles.controlLabel}>{isListening ? 'Stop' : 'Speak'}</span>
              </div>
              <div style={{ ...styles.controlCard, cursor: 'pointer', borderColor: 'rgba(244,63,94,0.3)' }}
                onClick={() => { stopCamera(); navigate('/dashboard'); }}>
                <span style={styles.controlIcon}>📵</span>
                <span style={styles.controlLabel}>End</span>
              </div>
            </div>

            {/* AI Speaking wave */}
            {isSpeaking && (
              <div style={styles.waveBox}>
                <div style={styles.waveInner}>
                  {[1,2,3,4,5,6,7].map(i => (
                    <div key={i} style={{ ...styles.waveBar, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
                <span style={styles.waveText}>AI Interviewer is speaking</span>
              </div>
            )}
          </div>

          {/* RIGHT — Question Panel */}
          <div style={styles.rightPanel}>

            {/* Timer + Topic */}
            <div style={styles.timerTopicRow}>
              <div style={styles.timerBox}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(197, 160, 89,0.08)" strokeWidth="3" />
                  <circle cx="28" cy="28" r="24" fill="none" stroke={timerColor} strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 24}`}
                    strokeDashoffset={`${2 * Math.PI * 24 * (1 - timer / 90)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                  />
                </svg>
                <div style={styles.timerInner}>
                  <span style={{ ...styles.timerNum, color: timerColor }}>{timer}</span>
                  <span style={styles.timerSec}>sec</span>
                </div>
              </div>
              <div style={styles.timerInfo}>
                <div style={styles.timerLabel}>Time Remaining</div>
                {isSpeaking && <div style={styles.timerPaused}>Paused while AI speaks</div>}
                <div style={styles.topicBadge}>
                  {isSkillMode ? `${currentSkill.skill} → ${currentQuestions[currentQIdx].topic}` : currentQuestions[currentQIdx].topic}
                </div>
              </div>
            </div>

            {/* Question Box */}
            <div style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <span style={styles.qNumber}>
                  {isSkillMode ? `${currentSkill.skill} · Q${currentQIdx + 1} of ${totalQuestionsInSkill}` : `Question ${currentQ + 1} of ${QUESTIONS.length}`}
                </span>
                <button style={styles.replayBtn}
                  onClick={() => speakQuestion(currentQuestions[currentQIdx].q)}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(197, 160, 89,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(197, 160, 89,0.06)'}
                >
                  🔊 Replay
                </button>
              </div>
              <p style={styles.questionText}>{currentQuestions[currentQIdx].q}</p>
            </div>

            {/* Transcript */}
            <div style={styles.transcriptCard}>
              <div style={styles.transcriptHeader}>
                <span style={styles.transcriptLabel}>Your Answer</span>
                {isListening && <span style={styles.recordingDot}>● Recording</span>}
              </div>
              <p style={styles.transcriptText}>
                {transcript || (isSpeaking ? 'Waiting for AI to finish...' : 'Click "Speak" and start answering...')}
              </p>
            </div>

            {/* Next Button */}
            <button
              style={{ ...styles.nextBtn, opacity: isSpeaking ? 0.5 : 1 }}
              onClick={handleNext}
              disabled={isSpeaking}
              onMouseEnter={e => {
                if (!isSpeaking) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(197, 160, 89, 0.4)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(197, 160, 89, 0.25)';
              }}
            >
              {isSkillMode
                ? currentQIdx + 1 === totalQuestionsInSkill
                  ? `Complete ${currentSkill.skill} →`
                  : `Next Question → (${currentQIdx + 1}/${totalQuestionsInSkill})`
                : currentQ + 1 === QUESTIONS.length ? 'Finish Interview →' : 'Next Question →'}
            </button>
            <p style={styles.tipText}>Wait for AI to finish speaking before answering</p>
          </div>
        </div>
      )}

      {/* FINISHED */}
      {step === 'finished' && (
        <div style={styles.finishedContainer}>
          <div style={styles.finishedCard}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
            <div style={styles.finishedBadge}>SESSION COMPLETE</div>
            <h1 style={styles.finishedTitle}>Interview Complete</h1>
            <p style={styles.finishedSub}>Analyzing your responses...</p>
            <div style={styles.loadingRow}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ ...styles.loadingDot, animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes waveBar {
          0%, 100% { height: 6px; }
          50% { height: 24px; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
    color: '#fff',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 32px',
    borderBottom: '1px solid var(--border-color)',
    background: 'rgba(4, 2, 9, 0.85)',
    backdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  logo: { fontSize: '18px', fontWeight: '900', color: '#fff', letterSpacing: '1px' },
  logoAccent: { color: 'var(--text-secondary)' },
  skillTag: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    background: 'rgba(197, 160, 89, 0.08)',
    border: '1px solid rgba(197, 160, 89, 0.2)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontWeight: '600',
  },
  headerCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  progressTrack: {
    width: '240px',
    height: '4px',
    background: 'rgba(197, 160, 89, 0.1)',
    borderRadius: '4px',
  },
  progressFill: {
    height: '100%',
    background: 'var(--primary)',
    borderRadius: '4px',
    transition: 'width 0.5s ease',
  },
  progressText: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.5px' },
  exitBtn: {
    background: 'transparent',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    borderRadius: '20px',
    padding: '7px 16px',
    color: 'var(--error)',
    fontSize: '12px',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.2s ease',
  },

  // Setup
  setupContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    position: 'relative',
    zIndex: 1,
  },
  setupCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    backdropFilter: 'blur(16px)',
    padding: '40px',
    width: '100%',
    maxWidth: '520px',
  },
  setupBadge: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    letterSpacing: '3px',
    fontWeight: '800',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  setupTitle: { fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '6px' },
  setupSub: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' },
  cameraBox: {
    width: '100%',
    aspectRatio: '16/9',
    background: 'rgba(197, 160, 89, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPreview: { width: '100%', height: '100%', objectFit: 'cover' },
  cameraOff: { position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  cameraOffText: { fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' },
  liveTag: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '10px',
    color: 'var(--text-secondary)',
    background: 'rgba(4, 2, 9, 0.8)',
    padding: '4px 10px',
    borderRadius: '8px',
    fontWeight: '600',
  },
  liveDot: {
    width: '6px', height: '6px',
    background: 'var(--success)',
    borderRadius: '50%',
    display: 'inline-block',
  },
  voiceInfoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: 'rgba(197, 160, 89, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 18px',
    marginBottom: '20px',
  },
  voiceInfoTitle: { fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '3px' },
  voiceInfoDesc: { fontSize: '11px', color: 'var(--text-muted)', margin: 0 },
  badgeRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  infoBadge: {
    background: 'rgba(197, 160, 89, 0.08)',
    border: '1px solid rgba(197, 160, 89, 0.15)',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  setupGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' },
  setupField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  setupLabel: { fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '0.5px' },
  select: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  setupActions: { display: 'flex', gap: '12px', marginTop: '8px' },
  cameraToggleBtn: {
    flex: 1,
    background: 'transparent',
    border: '1px solid rgba(197, 160, 89, 0.3)',
    borderRadius: '12px',
    padding: '12px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.2s ease',
  },
  startBtn: {
    flex: 2,
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    border: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.25)',
    transition: 'all 0.2s ease',
  },

  // Skill Complete
  skillCompleteContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    position: 'relative',
    zIndex: 1,
  },
  skillCompleteCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    backdropFilter: 'blur(16px)',
    padding: '48px',
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
  },
  skillCompleteIcon: { fontSize: '48px', marginBottom: '12px' },
  skillCompleteBadge: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    letterSpacing: '3px',
    fontWeight: '700',
    marginBottom: '10px',
  },
  skillCompleteTitle: { fontSize: '28px', fontWeight: '800', marginBottom: '6px' },
  skillCompleteSub: { fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' },
  skillStats: { display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' },
  skillStat: { textAlign: 'center' },
  skillStatNum: { fontSize: '32px', fontWeight: '900', color: 'var(--primary)' },
  skillStatLabel: { fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' },
  nextSkillBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(197, 160, 89, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  nextSkillLabel: { fontSize: '11px', color: 'var(--text-muted)' },
  nextSkillName: { fontSize: '14px', fontWeight: '700', color: 'var(--primary)' },
  nextSkillCount: { fontSize: '11px', color: 'var(--text-muted)' },
  skillBtnRow: { display: 'flex', flexDirection: 'column', gap: '10px' },
  continueBtn: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    border: 'none',
    borderRadius: '12px',
    padding: '14px 28px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.25)',
    transition: 'all 0.2s ease',
  },
  endBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 28px',
    color: 'var(--text-muted)',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.2s ease',
  },

  // Interview Layout
  interviewLayout: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1.3fr',
    gap: '24px',
    padding: '24px 32px',
    height: 'calc(100vh - 65px)',
    position: 'relative',
    zIndex: 1,
  },

  // Left Panel
  leftPanel: { display: 'flex', flexDirection: 'column', gap: '14px' },
  videoBox: {
    flex: 1,
    background: 'rgba(197, 160, 89, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative',
    minHeight: '240px',
  },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  videoOff: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'rgba(255,255,255,0.15)',
  },
  videoOverlayTop: {
    position: 'absolute', top: '10px', left: '10px',
  },
  liveIndicator: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '10px', color: 'rgba(255,255,255,0.6)',
    background: 'rgba(4, 2, 9, 0.8)',
    padding: '4px 10px', borderRadius: '8px',
  },
  aiSpeakingOverlay: {
    position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
    background: 'var(--primary)',
    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.35)',
    fontSize: '11px', fontWeight: '600', color: '#fff',
    padding: '6px 16px', borderRadius: '20px',
    whiteSpace: 'nowrap',
  },
  listeningOverlay: {
    position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
    background: 'var(--success)',
    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
    fontSize: '11px', fontWeight: '600', color: '#fff',
    padding: '6px 16px', borderRadius: '20px',
    whiteSpace: 'nowrap',
  },
  controlsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' },
  controlCard: {
    background: 'rgba(20, 16, 36, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.2s ease',
  },
  controlIcon: { fontSize: '20px' },
  controlLabel: { fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' },
  waveBox: {
    background: 'rgba(197, 160, 89, 0.05)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  waveInner: { display: 'flex', alignItems: 'center', gap: '3px', height: '28px' },
  waveBar: {
    width: '3px',
    background: 'var(--primary)',
    borderRadius: '2px',
    height: '6px',
    animation: 'waveBar 0.8s ease-in-out infinite',
  },
  waveText: { fontSize: '11px', color: 'var(--primary)', fontWeight: '600' },

  // Right Panel
  rightPanel: { display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' },
  timerTopicRow: { display: 'flex', alignItems: 'center', gap: '16px' },
  timerBox: { position: 'relative', flexShrink: 0 },
  timerInner: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  timerNum: { fontSize: '16px', fontWeight: '900', lineHeight: 1 },
  timerSec: { fontSize: '9px', color: 'var(--text-muted)' },
  timerInfo: { flex: 1 },
  timerLabel: { fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' },
  timerPaused: { fontSize: '11px', color: 'var(--warning)', marginBottom: '6px', fontWeight: '600' },
  topicBadge: {
    display: 'inline-block',
    background: 'rgba(197, 160, 89, 0.08)',
    border: '1px solid rgba(197, 160, 89, 0.2)',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  questionCard: {
    background: 'rgba(20, 16, 36, 0.4)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '20px',
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  qNumber: { fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.5px' },
  replayBtn: {
    background: 'rgba(197, 160, 89, 0.06)',
    border: '1px solid rgba(197, 160, 89, 0.2)',
    borderRadius: '8px',
    padding: '5px 12px',
    color: 'var(--text-secondary)',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'background 0.2s',
  },
  questionText: { fontSize: '18px', fontWeight: '600', lineHeight: 1.6, color: '#fff' },
  transcriptCard: {
    background: 'rgba(20, 16, 36, 0.3)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '16px 20px',
    minHeight: '100px',
  },
  transcriptHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  transcriptLabel: { fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.5px' },
  recordingDot: {
    fontSize: '10px',
    color: 'var(--error)',
    fontWeight: '700',
    animation: 'blink 1s ease-in-out infinite',
  },
  transcriptText: { fontSize: '14px', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' },
  nextBtn: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    border: 'none',
    borderRadius: '12px',
    padding: '14px',
    color: '#fff',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.25)',
    transition: 'all 0.2s ease',
  },
  tipText: { fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' },

  // Finished
  finishedContainer: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px',
    position: 'relative', zIndex: 1,
  },
  finishedCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    padding: '56px',
    textAlign: 'center',
    maxWidth: '440px',
    width: '100%',
  },
  finishedBadge: { fontSize: '10px', color: 'var(--text-secondary)', letterSpacing: '3px', fontWeight: '800', marginBottom: '12px' },
  finishedTitle: { fontSize: '32px', fontWeight: '800', marginBottom: '8px' },
  finishedSub: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' },
  loadingRow: { display: 'flex', gap: '8px', justifyContent: 'center' },
  loadingDot: {
    width: '10px', height: '10px',
    background: 'var(--primary)',
    borderRadius: '50%',
    animation: 'dotPulse 1s ease-in-out infinite',
  },
};