import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, FileText } from 'lucide-react';


export default function Recruitment() {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(()=>{ fetch('/api/recruitment').then(r=>r.json()).then(d=>{ setData(d); setSelected(d?.[0]?.id||null); }).catch(()=>setData([])); },[]);
  const item = data.find(r => r.id === selected) || data[0] || {};

  return (
    <div className="page">
      <div className="page-header"><h1>Recruitment System</h1><p>Track open roles, candidate progress, and interview pipeline.</p></div>

      <div className="stat-grid">
        <div className="stat-card blue"><div className="stat-label">Open Roles</div><div className="stat-value blue">{data.length}</div></div>
        <div className="stat-card green"><div className="stat-label">Candidates</div><div className="stat-value green">{data.reduce((sum, r) => sum + (r.candidates||0), 0)}</div></div>
        <div className="stat-card orange"><div className="stat-label">Stages Active</div><div className="stat-value orange">{[...new Set(data.map(r => r.stage))].length}</div></div>
        <div className="stat-card purple"><div className="stat-label">Offers Pending</div><div className="stat-value purple">{data.filter(r => r.stage === 'Offer').length}</div></div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:18 }}>
        <div className="card" style={{ padding:'20px' }}>
          <div className="card-header"><div className="card-title">Job Openings</div></div>
          <div style={{ display:'grid', gap:12 }}>
            {data.map(role => (
              <div key={role.id} className="job-card" onClick={() => setSelected(role.id)} style={{ cursor:'pointer', borderColor: role.id === selected ? 'var(--accent)' : 'transparent' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div><strong>{role.role}</strong></div>
                  <Briefcase size={18} />
                </div>
                <div style={{ display:'flex', gap:12, marginTop:8, color:'var(--text-2)', fontSize:13 }}>
                  <span>{role.openPositions} positions</span>
                  <span>{role.candidates} candidates</span>
                  <span>{role.stage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding:'20px' }}>
          <div className="card-header"><div className="card-title">Role Details</div></div>
          <div style={{ display:'grid', gap:12, marginTop:10 }}>
            <div><strong>Role</strong><div>{item.role}</div></div>
            <div><strong>Stage</strong><div>{item.stage}</div></div>
            <div><strong>Open Positions</strong><div>{item.openPositions}</div></div>
            <div><strong>Candidate Pipeline</strong><div>{item.candidates} candidates</div></div>
            <div style={{ display:'flex', gap:10, marginTop:10 }}>
              <button className="btn btn-primary"><CheckCircle size={14} /> Shortlist</button>
              <button className="btn btn-outline"><FileText size={14} /> View Applicants</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
