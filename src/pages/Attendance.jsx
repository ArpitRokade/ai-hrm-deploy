import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';


const statusColors = {
  Present: '#34d399', Late: '#fb923c', 'On Leave': '#818cf8', Absent: '#f87171',
};

export default function Attendance() {
  const [filter, setFilter] = useState('All');
  const [records, setRecords] = useState([]);
  useEffect(()=>{ fetch('/api/attendance').then(r=>r.json()).then(setRecords).catch(()=>setRecords([])); },[]);
  const filtered = useMemo(() => {
    return filter === 'All' ? records : records.filter(r => r.status === filter);
  }, [filter, records]);

  const totals = useMemo(() => ({
    present: records.filter(r => r.status === 'Present').length,
    late: records.filter(r => r.status === 'Late').length,
    leave: records.filter(r => r.status === 'On Leave').length,
    absent: records.filter(r => r.status === 'Absent').length,
  }), [records]);

  return (
    <div className="page">
      <div className="page-header"><h1>Attendance Management</h1><p>Monitor check-in/out records and attendance status for everyone.</p></div>
      <div className="stat-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
        <div className="stat-card blue"><div className="stat-label">Present</div><div className="stat-value blue">{totals.present}</div></div>
        <div className="stat-card orange"><div className="stat-label">Late</div><div className="stat-value orange">{totals.late}</div></div>
        <div className="stat-card purple"><div className="stat-label">On Leave</div><div className="stat-value purple">{totals.leave}</div></div>
        <div className="stat-card red"><div className="stat-label">Absent</div><div className="stat-value red">{totals.absent}</div></div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div className="tabs">
          {['All','Present','Late','On Leave','Absent'].map(item => (
            <button key={item} className={`tab ${filter===item?'active':''}`} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
        <div style={{ color:'var(--text-2)', fontSize:13 }}>Updated today</div>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Date</th><th>Check-in</th><th>Check-out</th><th>Status</th><th>Trend</th></tr></thead>
            <tbody>
              {filtered.map(record => (
                <tr key={record.id}>
                  <td>{record.name}</td>
                  <td>{record.date}</td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                  <td><span style={{ color: statusColors[record.status], fontWeight: 600 }}>{record.status}</span></td>
                  <td>{record.status === 'Late' ? <ArrowDownRight size={16} color="#f97316" /> : <ArrowUpRight size={16} color="#10b981" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-3)' }}>No records found.</div>}
        </div>
      </div>
    </div>
  );
}
