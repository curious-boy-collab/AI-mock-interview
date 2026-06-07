import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateQuestionFromTopic } from '../api';

export default function CustomSyllabus() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([{ skill: '', topics: '' }]);
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addSkill = () => {
    if (skills.length >= 8) return;
    setSkills([...skills, { skill: '', topics: '' }]);
  };

  const removeSkill = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const updateSkill = (idx, field, value) => {
    const updated = [...skills];
    updated[idx][field] = value;
    setSkills(updated);
  };

  const getTotalQuestions = () => {
    return skills.reduce((sum, s) => {
      if (!s.skill.trim() || !s.topics.trim()) return sum;
      const topics = s.topics.split(',').map(t => t.trim()).filter(Boolean);
      return sum + topics.length;
    }, 0);
  };

  const startInterview = async () => {
    const validSkills = skills.filter(s => s.skill.trim() && s.topics.trim());
    if (validSkills.length === 0) return setError('Kam se kam ek skill aur topics daalo');
    if (getTotalQuestions() < 3) return setError('Kam se kam 3 topics daalo total');

    setLoading(true);
    setError('');

    try {
      const skillGroups = [];

      for (const { skill, topics } of validSkills) {
        const topicList = topics.split(',').map(t => t.trim()).filter(Boolean);

        const questionPromises = topicList.map(topic =>
          generateQuestionFromTopic({ skill, topic, difficulty })
            .then(res => ({
              q: res.data.question,
              topic,
              skill,
              a: ''
            }))
            .catch(() => ({
              q: `Explain ${topic} in ${skill}`,
              topic,
              skill,
              a: ''
            }))
        );

        const questions = await Promise.all(questionPromises);
        skillGroups.push({ skill, questions });
      }

      navigate('/interview', {
        state: {
          skillGroups,
          interviewType: 'Custom Syllabus',
          difficulty
        }
      });
    } catch {
      setError('Questions generate nahi hue, dobara try karo');
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
        <div style={styles.topSection}>
          <h1 style={styles.title}>🎯 Custom Syllabus Interview</h1>
          <p style={styles.sub}>Apni skills aur topics daalo — AI usi pe interview lega</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        {/* Difficulty */}
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
          <span style={styles.totalBadge}>
            Total: <b style={{color:'#ff8c00'}}>{getTotalQuestions()} questions</b>
          </span>
        </div>

        {/* Skills Input */}
        <div style={styles.skillsList}>
          {skills.map((s, idx) => (
            <div key={idx} style={styles.skillRow}>
              <div style={styles.skillNum}>{idx + 1}</div>
              <div style={styles.skillInputs}>
                <input
                  style={styles.skillInput}
                  placeholder="Skill name (e.g. Python, React, SQL)"
                  value={s.skill}
                  onChange={e => updateSkill(idx, 'skill', e.target.value)}
                />
                <input
                  style={styles.topicsInput}
                  placeholder="Topics comma se alag karo (e.g. if else, loops, OOP, functions)"
                  value={s.topics}
                  onChange={e => updateSkill(idx, 'topics', e.target.value)}
                />
                {s.topics && s.skill && (
                  <div style={styles.topicPreview}>
                    {s.topics.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <span key={i} style={styles.topicChip}>{t}</span>
                    ))}
                  </div>
                )}
              </div>
              {skills.length > 1 && (
                <button style={styles.removeBtn} onClick={() => removeSkill(idx)}>✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Add Skill */}
        {skills.length < 8 && (
          <button style={styles.addBtn} onClick={addSkill}>
            + Add Another Skill
          </button>
        )}

        {/* Example */}
        <div style={styles.exampleBox}>
          <p style={styles.exampleTitle}>💡 Example:</p>
          <p style={styles.exampleText}>
            Skill: <b style={{color:'#ffd700'}}>Python</b> &nbsp;|&nbsp;
            Topics: <b style={{color:'#ff8c00'}}>if else, loops, OOP, functions, list, tuple, dictionary</b>
            <br/>→ 7 questions generate honge Python ke liye
          </p>
        </div>

        {/* Start Button */}
        <button
          style={{...styles.startBtn, opacity: loading || getTotalQuestions() < 3 ? 0.6 : 1}}
          onClick={startInterview}
          disabled={loading || getTotalQuestions() < 3}
        >
          {loading ? '🤖 Questions Generate Ho Rahe Hain...' : `🚀 Interview Start Karo (${getTotalQuestions()} questions)`}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#0a0a0f', color: '#fff', fontFamily: 'sans-serif', position: 'relative' },
  glowOrb1: { position: 'fixed', top: '-150px', left: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,140,0,0.08), transparent)', pointerEvents: 'none' },
  glowOrb2: { position: 'fixed', bottom: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.06), transparent)', pointerEvents: 'none' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 36px', borderBottom: '1px solid rgba(255,140,0,0.1)', background: 'rgba(10,10,15,0.9)', position: 'sticky', top: 0, zIndex: 10 },
  logo: { fontSize: '20px', fontWeight: '800', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  backBtn: { background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 16px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' },
  content: { maxWidth: '800px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 },
  topSection: { textAlign: 'center', marginBottom: '36px' },
  title: { fontSize: '32px', fontWeight: '900', margin: '0 0 8px' },
  sub: { fontSize: '16px', color: 'rgba(255,255,255,0.4)' },
  errorBox: { background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.3)', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', color: '#f44336', marginBottom: '20px' },
  diffRow: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' },
  diffLabel: { fontSize: '14px', color: 'rgba(255,255,255,0.5)' },
  diffBtn: { border: '1px solid', borderRadius: '8px', padding: '8px 18px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' },
  totalBadge: { marginLeft: 'auto', fontSize: '14px', color: 'rgba(255,255,255,0.5)' },
  skillsList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' },
  skillRow: { display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.12)', borderRadius: '16px', padding: '20px' },
  skillNum: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,140,0,0.15)', border: '1px solid rgba(255,140,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff8c00', fontWeight: '800', fontSize: '14px', flexShrink: 0, marginTop: '4px' },
  skillInputs: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  skillInput: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '15px', outline: 'none', fontWeight: '600' },
  topicsInput: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '12px 16px', color: '#fff', fontSize: '14px', outline: 'none' },
  topicPreview: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  topicChip: { background: 'rgba(255,140,0,0.12)', border: '1px solid rgba(255,140,0,0.25)', borderRadius: '6px', padding: '3px 10px', fontSize: '12px', color: '#ff8c00' },
  removeBtn: { background: 'rgba(244,67,54,0.1)', border: '1px solid rgba(244,67,54,0.2)', borderRadius: '8px', padding: '8px 10px', color: '#f44336', cursor: 'pointer', fontSize: '14px', flexShrink: 0 },
  addBtn: { width: '100%', background: 'transparent', border: '2px dashed rgba(255,140,0,0.25)', borderRadius: '12px', padding: '14px', color: 'rgba(255,140,0,0.6)', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '24px', transition: 'all 0.2s' },
  exampleBox: { background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '12px', padding: '16px 20px', marginBottom: '28px' },
  exampleTitle: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: '0 0 6px' },
  exampleText: { fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.7 },
  startBtn: { width: '100%', background: 'linear-gradient(135deg, #ff8c00, #ffd700)', border: 'none', borderRadius: '14px', padding: '18px', color: '#000', fontWeight: '800', fontSize: '17px', cursor: 'pointer', transition: 'opacity 0.2s' },
};