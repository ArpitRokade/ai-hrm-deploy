// src/pages/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);  // toggle between login and sign up
  const [email, setEmail] = useState('nayan@ambe.ai');
  const [password, setPassword] = useState('Nayan123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();  // proceed to main app
    } catch (err) {
      let message = err.message;
      if (err.code === 'auth/email-already-in-use') message = 'Email already registered. Try logging in.';
      else if (err.code === 'auth/weak-password') message = 'Password should be at least 6 characters.';
      else if (err.code === 'auth/invalid-credential') message = 'Invalid email or password.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle between Login and Sign Up – resets form fields
  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setPassword('');
    setConfirmPassword('');
    if (!isSignUp) setEmail('');
  };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-deep)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'var(--font-body)', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'20%', left:'30%', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'10%', right:'20%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(129,140,248,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:64, height:64, background:'linear-gradient(135deg, #38bdf8, #818cf8)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:24, fontFamily:'var(--font-display)', fontWeight:800, color:'#fff', boxShadow:'0 12px 32px rgba(56,189,248,0.25)' }}>
            <img src="/ambe-logo.png" alt="AMBE" style={{ width:40, height:40, borderRadius:8 }} />
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:28, fontWeight:800, marginBottom:6 }}>AI<span style={{ color:'var(--accent)' }}>-HRM</span></h1>
          <p style={{ color:'var(--text-3)', fontSize:14 }}>AMBE AI TECHNOLOGIES Pte Ltd</p>
        </div>

        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:20, padding:36 }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:20, fontWeight:700, marginBottom:4 }}>{isSignUp ? 'Create account' : 'Welcome back'}</h2>
          <p style={{ color:'var(--text-2)', fontSize:13, marginBottom:28 }}>{isSignUp ? 'Sign up to start using AI-HRM' : 'Sign in to your HR dashboard'}</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@ambe.ai" required />
            </div>
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            {isSignUp && (
              <div className="form-group" style={{ marginBottom:24 }}>
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            )}
            {!isSignUp && (
              <div className="form-group" style={{ marginBottom:24 }}>
                {/* empty spacer to align buttons */}
              </div>
            )}
            {error && <div style={{ background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:16 }}>{error}</div>}
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'12px', fontSize:14 }} disabled={loading}>
              {loading ? (isSignUp ? 'Creating account…' : 'Signing in…') : (isSignUp ? 'Sign Up →' : 'Sign In →')}
            </button>
          </form>

          {/* Toggle link */}
          <div style={{ textAlign:'center', marginTop:20 }}>
            <button onClick={toggleMode} style={{ background:'none', border:'none', color:'var(--accent)', fontSize:13, cursor:'pointer', textDecoration:'underline' }}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

          {!isSignUp && (
            <div style={{ marginTop:20, padding:14, background:'rgba(56,189,248,0.06)', borderRadius:8, border:'1px solid rgba(56,189,248,0.1)' }}>
              <p style={{ fontSize:11, color:'var(--text-3)', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.08em' }}>Demo Credentials</p>
              <p style={{ fontSize:12, color:'var(--text-2)' }}>Email: <strong style={{ color:'var(--accent)' }}>nayan@ambe.ai</strong></p>
              <p style={{ fontSize:12, color:'var(--text-2)' }}>Password: <strong style={{ color:'var(--accent)' }}>Nayan123</strong></p>
            </div>
          )}
        </div>
        <p style={{ textAlign:'center', color:'var(--text-3)', fontSize:12, marginTop:24 }}>© 2025 AMBE AI TECHNOLOGIES Pte Ltd</p>
      </div>
    </div>
  );
}