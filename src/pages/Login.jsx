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
      {/* Background Glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      <div style={styles.card}>
        <div style={styles.inner}>
          {/* Logo */}
          <div style={styles.logo}>
            INTERVIEW<span style={styles.logoAccent}>AI</span>
          </div>
          <div style={styles.logoUnderline} />

          {/* Badge */}
          <div style={styles.badge}>
            {isLogin ? '// SECURE LOGIN — ACTIVE' : '// CREATE ACCOUNT — ACTIVE'}
          </div>

          {/* Title */}
          <h2 style={styles.title}>
            {isLogin ? (
              <>WELCOME<span style={styles.titleAccent}>BACK</span></>
            ) : (
              <>JOIN<span style={styles.titleAccent}>NOW</span></>
            )}
          </h2>

          <p style={styles.sub}>
            {isLogin ? 'Login to continue your practice' : 'Start your interview journey'}
          </p>

          {/* Error */}
          {error && <div style={styles.errorBox}>{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>FULL NAME</label>
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
              <label style={styles.label}>EMAIL ADDRESS</label>
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
              <label style={styles.label}>PASSWORD</label>
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
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'PLEASE WAIT...' : isLogin ? 'LOGIN ▶' : 'REGISTER ▶'}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>OR</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Switch */}
          <p style={styles.switchText}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <span
              style={styles.switchLink}
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'REGISTER' : 'LOGIN'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--bg-dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    display: 'flex',
    width: '100%',
    maxWidth: '450px',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    position: 'relative',
    zIndex: 1,
  },
  inner: {
    padding: '48px 36px',
    flex: 1,
  },
  logo: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '4px',
    marginBottom: '8px',
  },
  logoAccent: {
    color: 'var(--text-secondary)',
  },
  logoUnderline: {
    width: '36px',
    height: '3px',
    background: 'var(--primary)',
    borderRadius: '2px',
    marginBottom: '20px',
  },
  badge: {
    fontSize: '9px',
    color: 'var(--text-secondary)',
    letterSpacing: '2px',
    fontWeight: '700',
    marginBottom: '16px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
    lineHeight: 0.95,
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  titleAccent: {
    color: 'var(--text-secondary)',
    display: 'block',
  },
  sub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px',
    marginBottom: '28px',
  },
  errorBox: {
    background: 'var(--error-glow)',
    border: '1px solid rgba(244, 63, 94, 0.3)',
    borderLeft: '4px solid var(--error)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--error)',
    marginBottom: '20px',
    letterSpacing: '0.3px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    letterSpacing: '2px',
    fontWeight: '700',
    borderLeft: '2px solid var(--primary)',
    paddingLeft: '8px',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '13px 14px',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'all 0.2s ease',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
    border: 'none',
    padding: '15px',
    color: '#fff',
    fontWeight: '900',
    fontSize: '12px',
    cursor: 'pointer',
    letterSpacing: '3px',
    marginTop: '8px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(197, 160, 89, 0.35)',
    transition: 'all 0.2s ease',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '24px 0 16px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--border-color)',
  },
  dividerText: {
    fontSize: '9px',
    color: 'var(--text-muted)',
    letterSpacing: '2px',
  },
  switchText: {
    textAlign: 'center',
    fontSize: '11px',
    color: 'var(--text-muted)',
    letterSpacing: '0.5px',
  },
  switchLink: {
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: '800',
    letterSpacing: '1px',
    marginLeft: '4px',
  },
};