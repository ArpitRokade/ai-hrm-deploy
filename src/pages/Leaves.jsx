import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, X, Calendar, Sparkles, TrendingUp, 
  PieChart as PieChartIcon, Loader2, RefreshCw, 
  AlertCircle, Users, Clock, Ban, BarChart3
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';

const leaveTypes = ['Annual', 'Medical', 'Childcare', 'Maternity', 'Paternity', 'Unpaid'];
const typeColors = {
  Annual: '#38bdf8',
  Medical: '#34d399',
  Childcare: '#818cf8',
  Maternity: '#f472b6',
  Paternity: '#fbbf24',
  Unpaid: '#94a3b8'
};

const DEFAULT_ANNUAL_ENTITLEMENT = 14;
const DEFAULT_MEDICAL_ENTITLEMENT = 14;

// Custom tooltip for bar chart
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card2)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: 12,
        padding: '10px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
      }}>
        <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 6 }}>{label}</p>
        {payload.map((entry, idx) => (
          <p key={idx} style={{ color: entry.color, fontSize: 14, fontWeight: 500 }}>
            {entry.name}: {entry.value} request{entry.value !== 1 ? 's' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tab, setTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ 
    empId: '', type: 'Annual', from: '', to: '', reason: '' 
  });

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leaveRes, empRes] = await Promise.all([
        fetch('http://localhost:5000/api/leaves'),
        fetch('http://localhost:5000/api/employees')
      ]);
      const leaveData = await leaveRes.json();
      const empData = await empRes.json();
      setLeaves(leaveData);
      setEmployees(empData);
    } catch (err) {
      console.error('Fetch error:', err);
      setLeaves([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const enrichedLeaves = leaves.map(leave => ({
    ...leave,
    empName: employees.find(e => e.id === leave.empId)?.name || `Employee #${leave.empId}`,
    empAvatar: employees.find(e => e.id === leave.empId)?.avatar || leave.empId.toString()
  }));

  const filtered = tab === 'All' ? enrichedLeaves : enrichedLeaves.filter(l => l.status === tab);
  const counts = {
    All: enrichedLeaves.length,
    Pending: enrichedLeaves.filter(l => l.status === 'Pending').length,
    Approved: enrichedLeaves.filter(l => l.status === 'Approved').length,
    Rejected: enrichedLeaves.filter(l => l.status === 'Rejected').length
  };

  const getLeaveBalance = (empId, leaveType) => {
    const approvedLeaves = leaves.filter(l => l.empId === empId && l.status === 'Approved' && l.type === leaveType);
    const usedDays = approvedLeaves.reduce((sum, l) => sum + (l.days || 0), 0);
    let entitlement = 0;
    if (leaveType === 'Annual') entitlement = DEFAULT_ANNUAL_ENTITLEMENT;
    else if (leaveType === 'Medical') entitlement = DEFAULT_MEDICAL_ENTITLEMENT;
    else entitlement = 999;
    return { used: usedDays, remaining: Math.max(0, entitlement - usedDays), entitlement };
  };

  const approve = async (id) => {
    const updated = leaves.map(l => l.id === id ? { ...l, status: 'Approved' } : l);
    setLeaves(updated);
    await fetch(`http://localhost:5000/api/leaves/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved' })
    }).catch(console.error);
  };

  const reject = async (id) => {
    const updated = leaves.map(l => l.id === id ? { ...l, status: 'Rejected' } : l);
    setLeaves(updated);
    await fetch(`http://localhost:5000/api/leaves/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected' })
    }).catch(console.error);
  };

  const calcDays = (from, to) => {
    if (!from || !to) return 0;
    return Math.max(1, Math.round((new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24)) + 1);
  };

  const submitLeave = async () => {
    if (!form.empId || !form.from || !form.to || !form.reason) {
      alert('Please fill all fields');
      return;
    }
    const days = calcDays(form.from, form.to);
    const body = {
      empId: Number(form.empId),
      type: form.type,
      from: form.from,
      to: form.to,
      days,
      status: 'Pending',
      reason: form.reason
    };
    try {
      const res = await fetch('http://localhost:5000/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const created = await res.json();
      setLeaves(prev => [...prev, created]);
      setShowModal(false);
      setForm({ empId: '', type: 'Annual', from: '', to: '', reason: '' });
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit leave request');
    }
  };

  const generateAiInsights = async () => {
    setAiLoading(true);
    try {
      const pendingCount = counts.Pending;
      const approvedDays = leaves.filter(l => l.status === 'Approved').reduce((sum, l) => sum + (l.days || 0), 0);
      const topLeaveType = Object.entries(
        leaves.reduce((acc, l) => {
          acc[l.type] = (acc[l.type] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0];

      const prompt = `You are an HR leave analyst. Based on data:
- Total leave requests: ${leaves.length}
- Pending: ${pendingCount}
- Approved days total: ${approvedDays}
- Most requested leave type: ${topLeaveType ? topLeaveType[0] : 'N/A'}

Return JSON: {"summary":"one sentence overall health","alert":"if any anomaly","recommendation":"actionable step","policyTip":"policy suggestion"}
Only JSON.`;

      const response = await fetch('http://localhost:5000/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      });
      const data = await response.json();
      let parsed;
      try {
        const jsonMatch = data.reply.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch (e) { parsed = null; }
      setAiInsight(parsed || {
        summary: "Leave usage is within normal range.",
        alert: pendingCount > 5 ? "High pending requests" : "No critical alerts",
        recommendation: "Review leave policy for peak periods",
        policyTip: "Consider flexible leave carryover"
      });
    } catch (err) {
      console.error(err);
      setAiInsight({ summary: "AI unavailable", alert: "N/A", recommendation: "Check backend", policyTip: "N/A" });
    } finally {
      setAiLoading(false);
    }
  };

  // Prepare chart data: leave by type (donut)
  const leaveByType = leaveTypes.map(type => ({
    name: type,
    count: leaves.filter(l => l.type === type).length
  })).filter(d => d.count > 0);

  // IMPROVED: Monthly trend data for bar chart (grouped by month, pending vs approved counts)
  const monthlyTrendMap = {};
  leaves.forEach(l => {
    const month = l.from?.slice(0, 7) || 'Unknown';
    if (!monthlyTrendMap[month]) {
      monthlyTrendMap[month] = { month, pending: 0, approved: 0 };
    }
    if (l.status === 'Pending') monthlyTrendMap[month].pending += 1;
    else if (l.status === 'Approved') monthlyTrendMap[month].approved += 1;
  });
  let trendData = Object.values(monthlyTrendMap).sort((a, b) => a.month.localeCompare(b.month));
  // If no data, show a placeholder
  if (trendData.length === 0) {
    trendData = [{ month: 'No data', pending: 0, approved: 0 }];
  }

  const colors = ['#38bdf8', '#34d399', '#818cf8', '#f472b6', '#fbbf24', '#94a3b8'];

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: 16, color: 'var(--text-2)' }}>Loading leave data...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Leave Management</h1>
        <p>Track, approve, and analyze employee leave requests with AI insights.</p>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card blue">
          <div className="stat-label">Total Requests</div>
          <div className="stat-value blue">{counts.All}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Pending</div>
          <div className="stat-value orange">{counts.Pending}</div>
          <div className="stat-sub">Awaiting approval</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Approved</div>
          <div className="stat-value green">{counts.Approved}</div>
          <div className="stat-sub">This period</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Rejected</div>
          <div className="stat-value purple">{counts.Rejected}</div>
          <div className="stat-sub">Declined</div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="card" style={{ marginBottom: 24, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <div>
              <strong>AI Leave Analytics</strong><br />
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {aiInsight?.summary || 'Click "Analyze" for AI-powered recommendations'}
              </span>
            </div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={generateAiInsights} disabled={aiLoading} style={{ gap: 6 }}>
            {aiLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
            {aiLoading ? 'Analyzing...' : 'Generate AI Insights'}
          </button>
        </div>
        {aiInsight && (
          <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div><span style={{ color: 'var(--danger)' }}>⚠️ Alert:</span> {aiInsight.alert}</div>
            <div><span style={{ color: 'var(--accent3)' }}>💡 Recommendation:</span> {aiInsight.recommendation}</div>
            <div><span style={{ color: '#fbbf24' }}>📋 Policy Tip:</span> {aiInsight.policyTip}</div>
          </div>
        )}
      </div>

      {/* Charts Row - Fixed Monthly Trend */}
      <div className="card-grid-2" style={{ marginBottom: 24, gap: 20 }}>
        {/* Donut Chart - Leave by Type */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Leave by Type</div>
            <PieChartIcon size={16} style={{ color: 'var(--text-3)' }} />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={leaveByType}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="count"
                label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}
                labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
              >
                {leaveByType.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-card2)', borderColor: 'var(--border)', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Improved Monthly Trend - Grouped Bar Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Monthly Leave Trend</div>
            <BarChart3 size={16} style={{ color: 'var(--text-3)' }} />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                dy={8}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                allowDecimals={false}
              />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(56,189,248,0.05)' }} />
              <Bar 
                dataKey="pending" 
                name="Pending" 
                fill="#fbbf24" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
              <Bar 
                dataKey="approved" 
                name="Approved" 
                fill="#34d399" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#fbbf24' }}></div>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Pending</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, background: '#34d399' }}></div>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Approved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="tabs">
          {tabs.map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t} {counts[t] > 0 && <span style={{ marginLeft: 4, background: 'var(--bg-hover)', borderRadius: 99, padding: '0 6px', fontSize: 11 }}>{counts[t]}</span>}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Apply Leave</button>
      </div>

      {/* Leave Requests Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id}>
                  <td>
                    <div className="emp-info">
                      <div className="emp-avatar" style={{ fontSize: 11, background: `linear-gradient(135deg, ${typeColors[l.type] || '#6366f1'}, #38bdf8)` }}>
                        {l.empName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{l.empName}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-blue" style={{ background: `${typeColors[l.type]}20`, color: typeColors[l.type], borderColor: `${typeColors[l.type]}40` }}>{l.type}</span></td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{l.from}</td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{l.to}</td>
                  <td style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{l.days}d</td>
                  <td style={{ color: 'var(--text-2)', fontSize: 12, maxWidth: 160 }}>{l.reason}</td>
                  <td><span className={`badge ${l.status === 'Approved' ? 'badge-green' : l.status === 'Pending' ? 'badge-orange' : 'badge-red'}`}>{l.status}</span></td>
                  <td>
                    {l.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-outline" style={{ color: 'var(--accent3)', borderColor: 'var(--accent3)' }} onClick={() => approve(l.id)}><Check size={12} /> Approve</button>
                        <button className="btn btn-sm btn-danger" onClick={() => reject(l.id)}><X size={12} /> Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No leave requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-title">Apply for Leave</div>
            <div className="modal-sub">Submit a new leave request. The system will check balance.</div>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Employee</label>
                <select className="form-select" value={form.empId} onChange={e => setForm({ ...form, empId: e.target.value })}>
                  <option value="">Select employee</option>
                  {employees.map(e => {
                    const balance = getLeaveBalance(e.id, form.type);
                    return (
                      <option key={e.id} value={e.id}>
                        {e.name} - Remaining: {balance.remaining} days
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Leave Type</label><select className="form-select" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{leaveTypes.map(t => <option key={t}>{t}</option>)}</select></div>
              <div className="form-group"><label className="form-label">From</label><input className="form-input" type="date" value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">To</label><input className="form-input" type="date" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Reason</label><input className="form-input" placeholder="Brief reason..." value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
            </div>
            {form.from && form.to && (
              <div style={{ background: 'rgba(56,189,248,0.08)', border: '1px solid var(--border2)', borderRadius: 8, padding: '10px 14px', marginTop: 8, fontSize: 13, color: 'var(--accent)' }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: 6 }} /> Duration: <strong>{calcDays(form.from, form.to)} day(s)</strong>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitLeave}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}