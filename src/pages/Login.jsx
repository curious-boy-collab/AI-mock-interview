import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = isLogin
        ? await loginUser({ email, password })
        : await registerUser({ name, email, password });

      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } else {
        setError(res.data?.message || 'Something went wrong');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.glowOrb1} />
      <div style={styles.glowOrb2} />

      <div style={styles.card}>
        <div style={styles.logo}>⚡ InterviewAI</div>
        <h2 style={styles.title}>{isLogin ? 'Welcome Back 👋' : 'Create Account 🚀'}</h2>
        <p style={styles.sub}>{isLogin ? 'Login to continue your practice' : 'Start your interview journey'}</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Nitin Jaiswal"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="nitin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? '⏳ Please wait...' : isLogin ? '🔑 Login' : '🚀 Register'}
          </button>
        </form>

        <p style={styles.switchText}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span style={styles.switchLink} onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', background: '#0a0a0f',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
  },
  glowOrb1: {
    position: 'fixed', top: '-150px', left: '-150px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,140,0,0.08), transparent)',
    pointerEvents: 'none',
  },
  glowOrb2: {
    position: 'fixed', bottom: '-150px', right: '-150px',
    width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,215,0,0.06), transparent)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,140,0,0.15)',
    borderRadius: '24px', padding: '48px 40px',
    width: '100%', maxWidth: '420px',
    position: 'relative', zIndex: 1,
  },
  logo: {
    fontSize: '22px', fontWeight: '800', marginBottom: '24px',
    background: 'linear-gradient(135deg, #ff8c00, #ffd700)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  title: { fontSize: '26px', fontWeight: '900', margin: '0 0 8px' },
  sub: { fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '28px' },
  errorBox: {
    background: 'rgba(244,67,54,0.1)',
    border: '1px solid rgba(244,67,54,0.3)',
    borderRadius: '10px', padding: '12px 16px',
    fontSize: '14px', color: '#f44336', marginBottom: '20px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', color: 'rgba(255,255,255,0.5)' },
  input: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,140,0,0.2)',
    borderRadius: '12px', padding: '14px 16px',
    color: '#fff', fontSize: '15px', outline: 'none',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #ff8c00, #ffd700)',
    border: 'none', borderRadius: '14px',
    padding: '16px', color: '#000',
    fontWeight: '800', fontSize: '16px',
    cursor: 'pointer', marginTop: '8px',
  },
  switchText: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'rgba(255,255,255,0.4)' },
  switchLink: { color: '#ff8c00', cursor: 'pointer', fontWeight: '600' },
};