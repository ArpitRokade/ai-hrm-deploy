import React, { useState, useEffect } from 'react';
import { FileSearch, RefreshCw, Sparkles, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';

export default function Resumes() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [screeningResult, setScreeningResult] = useState(null);
  const [role, setRole] = useState('Senior Data Scientist');
  const [resumeText, setResumeText] = useState(`Dr. Elena Vance  
Senior Data Scientist | PhD, Computer Science (Stanford)

Experience:
- 8 years applied ML research; led 12-person team at MIT Media Lab  
- Published 24 peer-reviewed papers on neural architectures  
- Built adaptive learning platform serving 50k students  

Skills:
Python, PyTorch, TensorFlow, distributed training, MLOps, curriculum design.

Education:
PhD Stanford 2017, BSc MIT 2011.`);

  // Load existing candidates from backend
  useEffect(() => {
    fetch('http://localhost:5000/api/resumes')
      .then(res => res.json())
      .then(data => setCandidates(data))
      .catch(() => setCandidates([]));
  }, []);

  // Resume screening using the analyzer endpoint (local keyword-based)
  const screenResume = async () => {
    if (!resumeText.trim()) {
      alert('Please paste a resume text.');
      return;
    }
    if (!role.trim()) {
      alert('Please enter the job role.');
      return;
    }

    setLoading(true);
    setScreeningResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/analyzer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText,
          jobDescription: role
        })
      });
      
      const data = await response.json();
      
      // The backend returns: { keyStrengths, gaps, score, recommendation }
      setScreeningResult({
        strengths: data.keyStrengths || [],
        gaps: data.gaps || [],
        score: data.score || 0,
        recommendation: data.recommendation || 'Review',
        role,
        resumePreview: resumeText.substring(0, 150) + (resumeText.length > 150 ? '…' : '')
      });
    } catch (err) {
      console.error('Screening error:', err);
      setScreeningResult({
        strengths: ['Connection error – check backend'],
        gaps: ['Unable to reach server'],
        score: 0,
        recommendation: 'Error',
        role,
        resumePreview: resumeText.substring(0, 150) + (resumeText.length > 150 ? '…' : '')
      });
    } finally {
      setLoading(false);
    }
  };

  // Add screened candidate to list (POST to backend)
  const addToCandidates = async () => {
    if (!screeningResult) return;

    const newCandidate = {
      name: resumeText.split('\n')[0].substring(0, 50),
      appliedFor: role,
      experience: parseInt(resumeText.match(/(\d+)\s*years?/i)?.[1] || 3),
      skills: screeningResult.strengths.map(s => s.split(' ').slice(0,2).join(' ')).slice(0, 3),
      score: screeningResult.score,
      status: screeningResult.recommendation === 'Strong Hire' ? 'Shortlisted' :
              screeningResult.recommendation === 'Interview' ? 'Interview' : 'Review',
      resumeText: resumeText.substring(0, 500)
    };

    try {
      const res = await fetch('http://localhost:5000/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCandidate)
      });
      if (res.ok) {
        const added = await res.json();
        setCandidates(prev => [added, ...prev]);
        alert('Candidate added to list!');
      } else {
        alert('Failed to save candidate');
      }
    } catch (err) {
      console.error(err);
      alert('Backend error – check connection');
    }
  };

  // Get recommendation badge color
  const getRecoColor = (rec) => {
    if (rec === 'Strong Hire') return '#34d399';
    if (rec === 'Interview') return '#38bdf8';
    if (rec === 'Maybe') return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>AI Resume Screening</h1>
        <p>Paste a candidate's resume and let AI score the fit against any job role.</p>
      </div>

      <div className="card-grid-2" style={{ marginBottom: 20 }}>
        {/* Left: Screening form */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><FileSearch size={16} style={{ marginRight: 8 }} />Screen New Resume</div>
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Job Role *</label>
            <input
              className="form-input"
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder="e.g. Senior Data Scientist, Frontend Engineer"
            />
          </div>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">Resume Text *</label>
            <textarea
              className="form-input"
              rows="8"
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste the candidate's resume here..."
              style={{ fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={screenResume}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={16} />}
            {loading ? ' Screening...' : ' Screen Resume with AI'}
          </button>
        </div>

        {/* Right: Screening Result */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">AI Fit Analysis</div>
          </div>
          {screeningResult ? (
            <div>
              {/* Score gauge */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: `conic-gradient(${getRecoColor(screeningResult.recommendation)} ${screeningResult.score * 3.6}deg, var(--bg-deep) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'var(--bg-card)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexDirection: 'column'
                  }}>
                    <span style={{ fontSize: 32, fontWeight: 700 }}>{screeningResult.score}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Fit Score</span>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600, color: getRecoColor(screeningResult.recommendation) }}>
                  {screeningResult.recommendation}
                </div>
              </div>

              {/* Strengths */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={14} /> Key Strengths
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-2)', fontSize: 13 }}>
                  {screeningResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>

              {/* Gaps */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} /> Gaps / Missing
                </div>
                <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-2)', fontSize: 13 }}>
                  {screeningResult.gaps.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>

              <button
                className="btn btn-outline"
                onClick={addToCandidates}
                style={{ width: '100%', marginTop: 8, gap: 8 }}
              >
                <UserPlus size={14} /> Add to Candidate List
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>
              <FileSearch size={32} style={{ marginBottom: 12 }} />
              <p>Click "Screen Resume" to see AI analysis.</p>
            </div>
          )}
        </div>
      </div>

      {/* Existing Candidates List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '16px 20px', marginBottom: 0, borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Previously Screened Candidates</div>
          <span className="badge badge-blue">{candidates.length} total</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidate</th><th>Role</th><th>Experience</th><th>Skills</th><th>Score</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.appliedFor}</td>
                  <td>{c.experience} yrs</td>
                  <td>{(c.skills || []).slice(0, 2).join(', ')}</td>
                  <td style={{ fontWeight: 700 }}>{c.score}%</td>
                  <td><span className={`badge ${c.status === 'Shortlisted' ? 'badge-green' : c.status === 'Interview' ? 'badge-orange' : 'badge-blue'}`}>{c.status}</span></td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--text-3)' }}>No candidates screened yet. Use the form above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info card */}
      <div className="card" style={{ marginTop: 20, padding: '20px' }}>
        <div className="card-header">
          <div className="card-title"><Sparkles size={16} style={{ marginRight: 8 }} /> How it works</div>
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
          The analyzer uses intelligent keyword matching to evaluate the resume against the job role. 
          It provides a score, strengths, gaps, and a recommendation. You can then add the candidate to your screening list.
        </div>
      </div>
    </div>
  );
}