import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractResume, generateQuestionFromTopic } from '../api';

export default function ResumeUpload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [skills, setSkills] = useState([]);
  const [candidateName, setCandidateName] = useState('');
  const [selectedTopics, setSelectedTopics] = useState({});
  const [difficulty, setDifficulty] = useState('Medium');
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1=upload, 2=select topics, 3=generating

  const handleUpload = async () => {
    if (!file) return setError('PDF file select karo');
    setExtracting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await extractResume(formData);
      setSkills(res.data.skills);
      setCandidateName(res.data.name);
      // Default — saare topics select karo
      const defaultSelected = {};
      res.data.skills.forEach(s => {
        defaultSelected[s.skill] = [...s.topics];
      });
      setSelectedTopics(defaultSelected);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Resume extract nahi hua');
    }
    setExtracting(false);
  };

  const toggleTopic = (skill, topic) => {
    setSelectedTopics(prev => {
      const current = prev[skill] || [];
      if (current.includes(topic)) {
        return { ...prev, [skill]: current.filter(t => t !== topic) };
      } else {
        return { ...prev, [skill]: [...current, topic] };
      }
    });
  };

  const getTotalSelected = () => {
    return Object.values(selectedTopics).reduce((sum, topics) => sum + topics.length, 0);
  };

const startInterview = async () => {
  const total = getTotalSelected();
  if (total < 5) return setError('Kam se kam 5 topics select karo');

  setStep(3);
  setLoading(true);

  try {
    // Har skill ke liye saare selected topics se questions banao
    const skillGroups = [];

    for (const [skill, topics] of Object.entries(selectedTopics)) {
      if (topics.length === 0) continue;

      const questionPromises = topics.map(topic =>
        generateQuestionFromTopic({ skill, topic, difficulty })
          .then(res => ({
            q: res.data.question,
            topic: topic,
            skill: skill,
            a: ''
          }))
          .catch(() => ({
            q: `Explain ${topic} in ${skill}`,
            topic: topic,
            skill: skill,
            a: ''
          }))
      );

      const questions = await Promise.all(questionPromises);
      skillGroups.push({ skill, questions });
    }

    navigate('/interview', {
      state: {
        skillGroups,           // naya format
        interviewType: 'Resume Based',
        difficulty
      }
    });
  } catch (err) {
    setError('Questions generate nahi hue');
    setStep(2);
  }
  setLoading(false);
};

  return (
    <div style={styles.page}>
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      <div style={styles.header}>
        <div style={styles.logo}>⚡ InterviewAI</div>
        <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>← Dashboard</button>
      </div>

      <div style={styles.content}>

        {/* Step 1 — Upload */}
        {step === 1 && (
          <div style={styles.card}>
            <h1 style={styles.title}>📄 Resume Upload</h1>
            <p style={styles.sub}>Apna resume upload karo — AI skills extract karke personalized interview lega</p>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div
              style={{
                ...styles.dropZone,
                borderColor: file ? '#ff8c00' : 'rgba(255,140,0,0.3)',
                background: file ? 'rgba(255,140,0,0.05)' : 'transparent'
              }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
            >
              {file ? (
                <div style={styles.fileInfo}>
                  <div style={styles.fileIcon}>📄</div>
                  <p style={styles.fileName}>{file.name}</p>
                  <p style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
                  <button style={styles.removeBtn} onClick={() => setFile(null)}>Remove</button>
                </div>
              ) : (
                <div style={styles.dropContent}>
                  <div style={styles.uploadIcon}>☁️</div>
                  <p style={styles.dropText}>PDF drag karo ya click karo</p>
                  <p style={styles.dropSub}>Only PDF supported</p>
                </div>
              )}
              <input
                type="file" accept=".pdf"
                style={styles.fileInput}
                onChange={e => setFile(e.target.files[0])}
              />
            </div>

            <div style={styles.diffRow}>
              <label style={styles.diffLabel}>Difficulty:</label>
              {['Easy', 'Medium', 'Hard'].map(d => (
                <button key={d} style={{
                  ...styles.diffBtn,
                  background: difficulty === d ? 'rgba(255,140,0,0.2)' : 'transparent',
                  borderColor: difficulty === d ? '#ff8c00' : 'rgba(255,255,255,0.1)',
                  color: difficulty === d ? '#ff8c00' : 'rgba(255,255,255,0.4)',
                }} onClick={() => setDifficulty(d)}>{d}</button>
              ))}
            </div>

            <button
              style={{ ...styles.uploadBtn, opacity: extracting ? 0.7 : 1 }}
              onClick={handleUpload}
              disabled={extracting || !file}
            >
              {extracting ? '🤖 AI Extracting Skills...' : '🚀 Extract Skills & Continue'}
            </button>
          </div>
        )}

        {/* Step 2 — Topics Select */}
        {step === 2 && (
          <div style={styles.skillsContainer}>
            <div style={styles.skillsHeader}>
              <div>
                <h1 style={styles.title}>
                  {candidateName ? `${candidateName} ke Skills` : 'Extracted Skills'} 🎯
                </h1>
                <p style={styles.sub}>Topics select/deselect karo — interview mein yahi aayenge</p>
              </div>
              <div style={styles.statsBox}>
                <div style={styles.statNum}>{getTotalSelected()}</div>
                <div style={styles.statLabel}>Topics Selected</div>
              </div>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            {skills.map((skillObj, si) => (
              <div key={si} style={styles.skillCard}>
                <div style={styles.skillCardHeader}>
                  <span style={styles.skillName}>{skillObj.skill}</span>
                  <span style={styles.skillLevel}>{skillObj.level}</span>
                  <span style={styles.topicCount}>
                    {(selectedTopics[skillObj.skill] || []).length}/10 selected
                  </span>
                </div>
                <div style={styles.topicsGrid}>
                  {skillObj.topics.map((topic, ti) => {
                    const isSelected = (selectedTopics[skillObj.skill] || []).includes(topic);
                    return (
                      <button key={ti} style={{
                        ...styles.topicChip,
                        background: isSelected ? 'rgba(255,140,0,0.15)' : 'rgba(255,255,255,0.03)',
                        borderColor: isSelected ? '#ff8c00' : 'rgba(255,255,255,0.08)',
                        color: isSelected ? '#ff8c00' : 'rgba(255,255,255,0.5)',
                      }} onClick={() => toggleTopic(skillObj.skill, topic)}>
                        {isSelected ? '✓ ' : ''}{topic}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={styles.startRow}>
              <p style={styles.startInfo}>
                5 random topics se questions generate honge (total {getTotalSelected()} selected mein se)
              </p>
              <button
                style={{ ...styles.startBtn, opacity: getTotalSelected() < 5 ? 0.5 : 1 }}
                onClick={startInterview}
                disabled={getTotalSelected() < 5}
              >
                🎯 Interview Start Karo ({getTotalSelected()} topics)
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Generating */}
        {step === 3 && (
          <div style={styles.generatingCard}>
            <div style={styles.genOrb}>🤖</div>
            <h2 style={styles.genTitle}>Questions Generate Ho Rahe Hain...</h2>
            <p style={styles.genSub}>Claude tumhare resume ke topics se personalized questions bana raha hai</p>
            <div style={styles.loadingBar}>
              <div style={styles.loadingFill} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'sans-serif', position: 'relative' },
  glowOrb1: { position: 'fixed', top: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,0,0.08), transparent)', pointerEvents: 'none' },
  glowOrb2: { position: 'fixed', bottom: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.06), transparent)', pointerEvents: 'none' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 36px', borderBottom: '1px solid rgba(255,140,0,0.1)', position: 'sticky', top: 0, background: 'rgba(10,10,15,0.9)', zIndex: 10 },
  logo: { fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 16px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 },
  card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.15)', borderRadius: '24px', padding: '40px' },
  title: { fontSize: '28px', fontWeight: '900', margin: '0 0 8px' },
  sub: { fontSize: '15px', color: 'rgba(255,255,255,0.4)', marginBottom: '32px' },
  errorBox: { background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#f44336', marginBottom: '20px' },
  dropZone: { border: '2px dashed', borderRadius: '16px', padding: '48px', textAlign: 'center', cursor: 'pointer', position: 'relative', marginBottom: '24px', transition: 'all 0.3s' },
  dropContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  uploadIcon: { fontSize: '48px', marginBottom: '8px' },
  dropText: { fontSize: '16px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  dropSub: { fontSize: '13px', color: 'rgba(255,255,255,0.3)' },
  fileInput: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' },
  fileInfo: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  fileIcon: { fontSize: '48px' },
  fileName: { fontSize: '16px', fontWeight: '600', color: '#ff8c00', margin: 0 },
  fileSize: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 },
  removeBtn: { background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: '8px', padding: '6px 14px', color: '#f44336', cursor: 'pointer', fontSize: '13px' },
  diffRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' },
  diffLabel: { fontSize: '14px', color: 'rgba(255,255,255,0.5)' },
  diffBtn: { border: '1px solid', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' },
  uploadBtn: { width: '100%', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', border: 'none', borderRadius: '14px', padding: '16px', color: '#000', fontWeight: '800', fontSize: '16px', cursor: 'pointer' },
  skillsContainer: { display: 'flex', flexDirection: 'column', gap: '20px' },
  skillsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  statsBox: { background: 'rgba(255,140,0,0.1)', border: '1px solid rgba(255,140,0,0.3)', borderRadius: '16px', padding: '16px 24px', textAlign: 'center', flexShrink: 0 },
  statNum: { fontSize: '32px', fontWeight: '900', color: '#ff8c00' },
  statLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
  skillCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' },
  skillCardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  skillName: { fontSize: '18px', fontWeight: '800', color: '#ffd700' },
  skillLevel: { fontSize: '12px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: '20px', padding: '3px 10px', color: '#ffd700' },
  topicCount: { fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' },
  topicsGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  topicChip: { border: '1px solid', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' },
  startRow: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.15)', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
  startInfo: { fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 },
  startBtn: { background: 'linear-gradient(135deg, #ff8c00, #ffd700)', border: 'none', borderRadius: '12px', padding: '14px 28px', color: '#000', fontWeight: '800', fontSize: '15px', cursor: 'pointer', whiteSpace: 'nowrap' },
  generatingCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '80px 40px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.15)', borderRadius: '24px' },
  genOrb: { fontSize: '64px', animation: 'spin 2s linear infinite' },
  genTitle: { fontSize: '24px', fontWeight: '800', margin: 0 },
  genSub: { fontSize: '15px', color: 'rgba(255,255,255,0.4)', margin: 0, textAlign: 'center' },
  loadingBar: { width: '300px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' },
  loadingFill: { height: '100%', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', animation: 'loadbar 2.5s ease-in-out infinite' },
};