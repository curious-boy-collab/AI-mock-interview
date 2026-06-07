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

  // Skill mode state
  const [currentSkillIdx, setCurrentSkillIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [allAnswers, setAllAnswers] = useState([]);
  const [skillAnswers, setSkillAnswers] = useState([]);
  const [showSkillComplete, setShowSkillComplete] = useState(false);

  // Normal mode state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);

  const currentSkill = isSkillMode ? skillGroups[currentSkillIdx] : null;
  const currentQuestions = isSkillMode ? currentSkill?.questions : QUESTIONS;
  const totalSkills = isSkillMode ? skillGroups.length : 0;
  const totalQuestionsInSkill = currentQuestions?.length || 0;

  // ✅ VOICE AI — Question bolega
  const speakQuestion = useCallback((text, onDone) => {
    window.speechSynthesis.cancel();
    setIsSpeaking(true);
    isSpeakingRef.current = true;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    utterance.pitch = 1.05;
    utterance.volume = 1;

    // Best voice select karo
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v =>
        v.name.includes('Google US English') ||
        v.name.includes('Samantha') ||
        v.name.includes('Daniel') ||
        v.name.includes('Alex')
      );
      if (preferred) utterance.voice = preferred;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      loadVoices();
    } else {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      if (onDone) onDone();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      setCameraOn(true);
      setMicOn(true);
    } catch {
      alert('Camera/Mic access denied.');
    }
  };

  const stopCamera = () => {
    window.speechSynthesis.cancel();
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
    setMicOn(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Use Chrome for speech recognition.'); return; }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      setTranscript(Array.from(e.results).map(r => r[0].transcript).join(''));
    };
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // ✅ SKILL MODE — Next
  const handleSkillNext = useCallback(() => {
    stopListening();
    clearInterval(timerRef.current);
    window.speechSynthesis.cancel();

    const answer = {
      q: currentQuestions[currentQIdx].q,
      topic: currentQuestions[currentQIdx].topic,
      skill: currentSkill.skill,
      a: transcript || '',
    };

    const updatedSkillAnswers = [...skillAnswers, answer];
    setSkillAnswers(updatedSkillAnswers);
    setTranscript('');

    if (currentQIdx + 1 >= totalQuestionsInSkill) {
      setAllAnswers(prev => [...prev, ...updatedSkillAnswers]);
      setSkillAnswers([]);
      setShowSkillComplete(true);
      speakQuestion(`Excellent! You have completed the ${currentSkill.skill} section!`);
    } else {
      const nextIdx = currentQIdx + 1;
      setCurrentQIdx(nextIdx);
      setTimeout(() => {
        speakQuestion(currentQuestions[nextIdx].q, () => startListening());
      }, 400);
    }
  }, [currentQIdx, transcript, skillAnswers, currentQuestions, currentSkill, totalQuestionsInSkill, speakQuestion]);

  // ✅ Next Skill
  const handleNextSkill = () => {
    window.speechSynthesis.cancel();
    if (currentSkillIdx + 1 >= totalSkills) {
      stopCamera();
      setStep('finished');
      setTimeout(() => {
        navigate('/result', { state: { answers: allAnswers, interviewType, difficulty } });
      }, 1500);
    } else {
      const nextSkillIdx = currentSkillIdx + 1;
      setCurrentSkillIdx(nextSkillIdx);
      setCurrentQIdx(0);
      setShowSkillComplete(false);
      setTimeout(() => {
        speakQuestion(
          `Moving to ${skillGroups[nextSkillIdx].skill}. ${skillGroups[nextSkillIdx].questions[0].q}`,
          () => startListening()
        );
      }, 500);
    }
  };

  // ✅ NORMAL MODE — Next
  const handleNormalNext = useCallback(() => {
    stopListening();
    window.speechSynthesis.cancel();
    const ans = [...answers, {
      q: QUESTIONS[currentQ].q,
      topic: QUESTIONS[currentQ].topic,
      a: transcript || '',
    }];
    setAnswers(ans);
    setTranscript('');
    clearInterval(timerRef.current);

    if (currentQ + 1 >= QUESTIONS.length) {
      stopCamera();
      setStep('finished');
      setTimeout(() => navigate('/result', { state: { answers: ans, interviewType, difficulty } }), 1500);
    } else {
      const nextIdx = currentQ + 1;
      setCurrentQ(nextIdx);
      setTimeout(() => {
        speakQuestion(QUESTIONS[nextIdx].q, () => startListening());
      }, 400);
    }
  }, [currentQ, transcript, answers, interviewType, difficulty, navigate, QUESTIONS, speakQuestion]);

  const handleNext = isSkillMode ? handleSkillNext : handleNormalNext;

  // Timer — speaking ke dauran ruka rahega
  useEffect(() => {
    if (step === 'interview' && !showSkillComplete) {
      setTimer(90);
      timerRef.current = setInterval(() => {
        if (isSpeakingRef.current) return; // AI bol rahi hai toh timer ruko
        setTimer(prev => {
          if (prev <= 1) { clearInterval(timerRef.current); handleNext(); return 90; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [step, currentQIdx, currentSkillIdx, showSkillComplete, handleNext]);

  // ✅ Interview start — pehla question bolega
  const startInterview = () => {
    startCamera();
    setStep('interview');
    setTimeout(() => {
      const firstQ = isSkillMode
        ? `Welcome to your interview. Let's start with ${skillGroups[0].skill}. ${skillGroups[0].questions[0].q}`
        : `Welcome to your interview. ${QUESTIONS[0].q}`;
      speakQuestion(firstQ, () => startListening());
    }, 1000);
  };

  const timerColor = timer > 50 ? '#4caf50' : timer > 20 ? '#ff8c00' : '#f44336';
  const totalQuestions = isSkillMode ? skillGroups.reduce((s, g) => s + g.questions.length, 0) : QUESTIONS.length;
  const doneQuestions = isSkillMode
    ? skillGroups.slice(0, currentSkillIdx).reduce((s, g) => s + g.questions.length, 0) + currentQIdx
    : currentQ;

  return (
    <div style={styles.container}>
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.logo}>⚡ InterviewAI</div>
        {step === 'interview' && !showSkillComplete && (
          <div style={styles.headerCenter}>
            {isSkillMode && (
              <span style={styles.skillProgress}>
                Skill {currentSkillIdx + 1}/{totalSkills}: <b style={{color:'#ffd700'}}>{currentSkill.skill}</b>
                &nbsp;— Q{currentQIdx + 1}/{totalQuestionsInSkill}
              </span>
            )}
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${((doneQuestions + 1) / totalQuestions) * 100}%` }} />
            </div>
            <span style={styles.qCounter}>{doneQuestions + 1} / {totalQuestions} total</span>
          </div>
        )}
        <button style={styles.exitBtn} onClick={() => { stopCamera(); navigate('/dashboard'); }}>✕ Exit</button>
      </div>

      {/* SETUP */}
      {step === 'setup' && (
        <div style={styles.setupContainer}>
          <h1 style={styles.setupTitle}>Interview Setup 🎯</h1>
          <p style={styles.setupSub}>
            {isSkillMode
              ? `${totalSkills} skills — ${totalQuestions} total questions`
              : 'Configure your interview'}
          </p>
          <div style={styles.cameraPreviewBox}>
            <video ref={videoRef} autoPlay muted style={styles.videoPreview} />
            {!cameraOn && <div style={styles.cameraOff}><div style={{fontSize:'48px'}}>📷</div><p>Camera is off</p></div>}
          </div>

          {/* Voice AI info box */}
          <div style={styles.voiceInfoBox}>
            <span style={styles.voiceInfoIcon}>🎙️</span>
            <div>
              <p style={styles.voiceInfoTitle}>AI Voice Interviewer Active</p>
              <p style={styles.voiceInfoDesc}>AI will read each question aloud — answer by speaking after the question ends</p>
            </div>
          </div>

          {isSkillMode ? (
            <div style={styles.resumeBadgeRow}>
              <span style={styles.resumeBadge}>📄 {interviewType}</span>
              <span style={styles.resumeBadge}>⚡ {difficulty}</span>
              <span style={styles.resumeBadge}>🎯 {totalSkills} Skills</span>
              <span style={styles.resumeBadge}>📋 {totalQuestions} Questions</span>
            </div>
          ) : (
            <div style={styles.setupGrid}>
              <div style={styles.setupCard}>
                <label style={styles.setupLabel}>Interview Type</label>
                <select style={styles.select} value={interviewType} onChange={e => setInterviewType(e.target.value)}>
                  <option>Technical</option><option>HR Round</option><option>Company Specific</option>
                </select>
              </div>
              <div style={styles.setupCard}>
                <label style={styles.setupLabel}>Difficulty</label>
                <select style={styles.select} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
              </div>
            </div>
          )}

          <div style={styles.toggleRow}>
            <button style={{...styles.toggleBtn, borderColor: cameraOn ? '#4caf50' : 'rgba(255,140,0,0.3)'}}
              onClick={cameraOn ? stopCamera : startCamera}>
              {cameraOn ? '📷 Camera On' : '📷 Turn On Camera'}
            </button>
          </div>
          <button style={styles.startBtn} onClick={startInterview}>🚀 Start Interview</button>
        </div>
      )}

      {/* SKILL COMPLETE */}
      {step === 'interview' && showSkillComplete && (
        <div style={styles.skillCompleteContainer}>
          <div style={styles.skillCompleteCard}>
            <div style={{fontSize:'64px', marginBottom:'16px'}}>✅</div>
            <h2 style={styles.skillCompleteTitle}>{currentSkill.skill} Complete!</h2>
            <p style={styles.skillCompleteSub}>{totalQuestionsInSkill} questions answered</p>
            <div style={styles.skillStats}>
              <div style={styles.skillStat}>
                <div style={styles.skillStatNum}>{currentSkillIdx + 1}</div>
                <div style={styles.skillStatLabel}>Skills Done</div>
              </div>
              <div style={styles.skillStat}>
                <div style={styles.skillStatNum}>{totalSkills - currentSkillIdx - 1}</div>
                <div style={styles.skillStatLabel}>Skills Left</div>
              </div>
              <div style={styles.skillStat}>
                <div style={styles.skillStatNum}>{doneQuestions + totalQuestionsInSkill}</div>
                <div style={styles.skillStatLabel}>Total Done</div>
              </div>
            </div>
            {currentSkillIdx + 1 < totalSkills ? (
              <>
                <p style={styles.nextSkillPreview}>
                  Next: <b style={{color:'#ffd700'}}>{skillGroups[currentSkillIdx + 1].skill}</b>
                  &nbsp;({skillGroups[currentSkillIdx + 1].questions.length} questions)
                </p>
                <div style={styles.skillBtnRow}>
                  <button style={styles.continueBtn} onClick={handleNextSkill}>
                    Next Skill → {skillGroups[currentSkillIdx + 1].skill}
                  </button>
                  <button style={styles.endBtn} onClick={() => {
                    stopCamera();
                    navigate('/result', { state: { answers: allAnswers, interviewType, difficulty } });
                  }}>End Interview Here</button>
                </div>
              </>
            ) : (
              <button style={styles.continueBtn} onClick={handleNextSkill}>🎉 Finish & See Results</button>
            )}
          </div>
        </div>
      )}

      {/* INTERVIEW */}
      {step === 'interview' && !showSkillComplete && (
        <div style={styles.interviewContainer}>
          <div style={styles.leftPanel}>
            <div style={styles.videoBox}>
              <video ref={videoRef} autoPlay muted style={styles.video} />
              <div style={styles.videoLabel}><span style={styles.liveDot} />Live</div>
              {isSpeaking && (
                <div style={styles.speakingBadge}>🔊 AI Speaking...</div>
              )}
              {isListening && !isSpeaking && (
                <div style={styles.listeningBadge}>🎤 Listening...</div>
              )}
            </div>
            <div style={styles.controls}>
              <button style={{...styles.controlBtn, background: isSpeaking ? 'rgba(255,140,0,0.15)' : micOn ? 'rgba(76,175,80,0.15)':'rgba(244,67,54,0.15)', borderColor: isSpeaking ? '#ff8c00' : micOn?'#4caf50':'#f44336'}}>
                {isSpeaking ? '🔊' : micOn ? '🎤' : '🔇'}
                <span style={{fontSize:'11px'}}>{isSpeaking ? 'AI Speaking' : micOn ? 'Mic On' : 'Mic Off'}</span>
              </button>
              <button style={{...styles.controlBtn, background: isListening?'rgba(255,140,0,0.15)':'rgba(255,255,255,0.05)', borderColor: isListening?'#ff8c00':'rgba(255,255,255,0.1)'}}
                onClick={isListening ? stopListening : startListening}>
                {isListening ? '⏹':'▶'}<span style={{fontSize:'11px'}}>{isListening?'Stop':'Speak'}</span>
              </button>
              <button style={{...styles.controlBtn, background:'rgba(244,67,54,0.15)', borderColor:'#f44336'}}
                onClick={() => { stopCamera(); navigate('/dashboard'); }}>
                📵<span style={{fontSize:'11px'}}>End</span>
              </button>
            </div>
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.timerBox}>
              <div style={{...styles.timerCircle, borderColor: timerColor}}>
                <span style={{...styles.timerNum, color: timerColor}}>{timer}</span>
                <span style={styles.timerSec}>sec</span>
              </div>
              <div>
                <div style={styles.timerLabel}>Time Remaining</div>
                {isSpeaking && <div style={{fontSize:'11px', color:'#ff8c00'}}>⏸ Paused while AI speaks</div>}
              </div>
            </div>

            <div style={styles.topicBadge}>
              {isSkillMode ? `${currentSkill.skill} → ${currentQuestions[currentQIdx].topic}` : currentQuestions[currentQIdx].topic}
            </div>

            {/* AI Speaking indicator */}
            {isSpeaking && (
              <div style={styles.aiSpeakingBox}>
                <div style={styles.soundWave}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{...styles.soundBar, animationDelay: `${i * 0.1}s`}} />
                  ))}
                </div>
                <p style={styles.aiSpeakingText}>AI Interviewer is asking the question...</p>
              </div>
            )}

            <div style={styles.questionBox}>
              <div style={styles.qLabel}>
                {isSkillMode
                  ? `${currentSkill.skill} — Q${currentQIdx + 1} of ${totalQuestionsInSkill}`
                  : `Question ${currentQ + 1}`}
              </div>
              <p style={styles.questionText}>{currentQuestions[currentQIdx].q}</p>
              <button style={styles.replayBtn} onClick={() => speakQuestion(currentQuestions[currentQIdx].q)}>
                🔊 Replay Question
              </button>
            </div>

            <div style={styles.transcriptBox}>
              <div style={styles.transcriptLabel}>
                🎤 Your Answer {isListening && <span style={styles.pulse}>●</span>}
              </div>
              <p style={styles.transcriptText}>{transcript || (isSpeaking ? 'Wait for AI to finish...' : 'Click "Speak" and start answering...')}</p>
            </div>

            <button
              style={{...styles.nextBtn, opacity: isSpeaking ? 0.6 : 1}}
              onClick={handleNext}
              disabled={isSpeaking}
            >
              {isSkillMode
                ? currentQIdx + 1 === totalQuestionsInSkill
                  ? `✅ ${currentSkill.skill} Complete`
                  : `Next Question → (${currentQIdx + 1}/${totalQuestionsInSkill})`
                : currentQ + 1 === QUESTIONS.length ? '✅ Finish' : 'Next →'}
            </button>
            <p style={styles.tip}>💡 Wait for AI to finish speaking, then answer</p>
          </div>
        </div>
      )}

      {/* FINISHED */}
      {step === 'finished' && (
        <div style={styles.finishedContainer}>
          <div style={{fontSize:'72px', marginBottom:'20px'}}>🎉</div>
          <h1 style={styles.finishedTitle}>Interview Complete!</h1>
          <p style={styles.finishedSub}>Calculating your results...</p>
          <div style={styles.loadingDots}><span>●</span><span>●</span><span>●</span></div>
        </div>
      )}

      <style>{`
        @keyframes soundBar {
          0%, 100% { height: 8px; }
          50% { height: 28px; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0a0a0f', color: '#fff', position: 'relative', overflow: 'hidden' },
  glowOrb1: { position: 'fixed', top: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,0,0.08), transparent)', pointerEvents: 'none' },
  glowOrb2: { position: 'fixed', bottom: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.06), transparent)', pointerEvents: 'none' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 36px', borderBottom: '1px solid rgba(255,140,0,0.1)', background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 10 },
  logo: { fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  headerCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  skillProgress: { fontSize: '13px', color: 'rgba(255,255,255,0.6)' },
  qCounter: { fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
  progressBar: { width: '300px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' },
  progressFill: { height: '100%', borderRadius: '2px', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', transition: 'width 0.5s ease' },
  exitBtn: { background: 'rgba(244,67,54,0.15)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: '10px', padding: '8px 18px', color: '#f44336', cursor: 'pointer', fontSize: '14px' },
  setupContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', position: 'relative', zIndex: 1 },
  setupTitle: { fontSize: '36px', fontWeight: '900', marginBottom: '8px' },
  setupSub: { fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px', textAlign: 'center' },
  cameraPreviewBox: { width: '360px', height: '220px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '20px', overflow: 'hidden', position: 'relative', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  videoPreview: { width: '100%', height: '100%', objectFit: 'cover' },
  cameraOff: { position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'rgba(255,255,255,0.3)', gap: '8px', fontSize: '14px' },
  voiceInfoBox: { display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(255,140,0,0.08)', border: '1px solid rgba(255,140,0,0.25)', borderRadius: '14px', padding: '14px 20px', marginBottom: '20px', maxWidth: '460px', width: '100%' },
  voiceInfoIcon: { fontSize: '28px', flexShrink: 0 },
  voiceInfoTitle: { fontSize: '14px', fontWeight: '700', color: '#ffb347', margin: '0 0 4px' },
  voiceInfoDesc: { fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 },
  resumeBadgeRow: { display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', justifyContent: 'center' },
  resumeBadge: { background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '20px', padding: '8px 18px', fontSize: '14px', color: '#ffb347', fontWeight: '600' },
  setupGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', maxWidth: '500px', marginBottom: '20px' },
  setupCard: { display: 'flex', flexDirection: 'column', gap: '8px' },
  setupLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.5)' },
  select: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' },
  toggleRow: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '24px' },
  toggleBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid', borderRadius: '12px', padding: '12px 28px', color: '#fff', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  startBtn: { background: 'linear-gradient(135deg, #ff8c00, #ffd700)', border: 'none', borderRadius: '30px', padding: '16px 48px', color: '#000', fontWeight: '800', fontSize: '18px', cursor: 'pointer' },
  skillCompleteContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', position: 'relative', zIndex: 1 },
  skillCompleteCard: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '28px', padding: '48px', textAlign: 'center', maxWidth: '500px', width: '90%' },
  skillCompleteTitle: { fontSize: '32px', fontWeight: '900', marginBottom: '8px' },
  skillCompleteSub: { fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' },
  skillStats: { display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '28px' },
  skillStat: { textAlign: 'center' },
  skillStatNum: { fontSize: '36px', fontWeight: '900', color: '#ff8c00' },
  skillStatLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
  nextSkillPreview: { fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' },
  skillBtnRow: { display: 'flex', flexDirection: 'column', gap: '12px' },
  continueBtn: { background: 'linear-gradient(135deg, #ff8c00, #ffd700)', border: 'none', borderRadius: '14px', padding: '16px 32px', color: '#000', fontWeight: '800', fontSize: '16px', cursor: 'pointer' },
  endBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '14px', padding: '14px 32px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer' },
  interviewContainer: { display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '28px', padding: '28px 36px', height: 'calc(100vh - 80px)', position: 'relative', zIndex: 1 },
  leftPanel: { display: 'flex', flexDirection: 'column', gap: '16px' },
  videoBox: { flex: 1, borderRadius: '20px', overflow: 'hidden', background: '#111', position: 'relative', border: '1px solid rgba(255,140,0,0.2)', minHeight: '300px' },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  videoLabel: { position: 'absolute', top: '12px', left: '12px', background: 'rgba(0,0,0,0.6)', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' },
  liveDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#f44336', display: 'inline-block' },
  speakingBadge: { position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,140,0,0.95)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', color: '#000', whiteSpace: 'nowrap' },
  listeningBadge: { position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(76,175,80,0.95)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', fontWeight: '600', color: '#000', whiteSpace: 'nowrap' },
  controls: { display: 'flex', gap: '12px', justifyContent: 'center' },
  controlBtn: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', border: '1px solid', borderRadius: '14px', padding: '14px 8px', cursor: 'pointer', fontSize: '22px', color: '#fff', transition: 'all 0.2s' },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' },
  timerBox: { display: 'flex', alignItems: 'center', gap: '16px' },
  timerCircle: { width: '70px', height: '70px', borderRadius: '50%', border: '3px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  timerNum: { fontSize: '24px', fontWeight: '900', lineHeight: 1 },
  timerSec: { fontSize: '11px', color: 'rgba(255,255,255,0.4)' },
  timerLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.4)' },
  aiSpeakingBox: { display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(255,140,0,0.08)', border: '1px solid rgba(255,140,0,0.25)', borderRadius: '14px', padding: '14px 20px' },
  soundWave: { display: 'flex', alignItems: 'center', gap: '3px', height: '32px' },
  soundBar: { width: '4px', background: '#ff8c00', borderRadius: '2px', height: '8px', animation: 'soundBar 0.8s ease-in-out infinite' },
  aiSpeakingText: { fontSize: '14px', color: '#ffb347', margin: 0 },
  topicBadge: { display: 'inline-block', background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '13px', color: '#ffb347', alignSelf: 'flex-start' },
  questionBox: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,140,0,0.15)', borderRadius: '18px', padding: '24px' },
  qLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' },
  questionText: { fontSize: '20px', fontWeight: '700', lineHeight: 1.5, marginBottom: '16px' },
  replayBtn: { background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.25)', borderRadius: '8px', padding: '6px 14px', color: '#ff8c00', fontSize: '13px', cursor: 'pointer' },
  transcriptBox: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', minHeight: '100px' },
  transcriptLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' },
  pulse: { color: '#ff8c00' },
  transcriptText: { fontSize: '15px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' },
  nextBtn: { background: 'linear-gradient(135deg, #ff8c00, #ffd700)', border: 'none', borderRadius: '14px', padding: '16px', color: '#000', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'opacity 0.2s' },
  tip: { fontSize: '13px', color: 'rgba(255,255,255,0.3)', textAlign: 'center' },
  finishedContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', position: 'relative', zIndex: 1 },
  finishedTitle: { fontSize: '42px', fontWeight: '900', marginBottom: '12px' },
  finishedSub: { fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' },
  loadingDots: { display: 'flex', gap: '8px', fontSize: '24px', color: '#ff8c00' },
};