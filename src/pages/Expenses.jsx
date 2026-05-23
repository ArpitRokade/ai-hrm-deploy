import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, X, Receipt, Sparkles, TrendingUp, 
  DollarSign, PieChart as PieChartIcon, Loader2,
  RefreshCw, AlertCircle, FileText, BarChart3, Award, Clock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from 'recharts';

const categories = ['Transport', 'Meals', 'Equipment', 'Training', 'Entertainment', 'Other'];
const catColors = { 
  Transport: '#38bdf8', 
  Meals: '#34d399', 
  Equipment: '#818cf8', 
  Training: '#fb923c', 
  Entertainment: '#f472b6', 
  Other: '#94a3b8' 
};

// Format Indian Rupee
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Custom tooltip for amount bar chart
const CustomAmountTooltip = ({ active, payload, label }) => {
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
            {entry.name}: {formatINR(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom tooltip for pie chart
const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card2)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: 12,
        padding: '8px 14px',
      }}>
        <p style={{ color: 'var(--text-1)', fontSize: 13, marginBottom: 4 }}>{payload[0].name}</p>
        <p style={{ color: '#fbbf24', fontSize: 16, fontWeight: 700 }}>{formatINR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function Expenses() {
  const [claims, setClaims] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tab, setTab] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [form, setForm] = useState({ empId: '', category: 'Transport', amount: '', date: '', desc: '' });

  const tabs = ['All', 'Pending', 'Approved', 'Rejected'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expRes, empRes] = await Promise.all([
        fetch('http://localhost:5000/api/expenses'),
        fetch('http://localhost:5000/api/employees')
      ]);
      const expenseData = await expRes.json();
      const employeeData = await empRes.json();
      setClaims(expenseData);
      setEmployees(employeeData);
    } catch (err) {
      console.error('Fetch error:', err);
      setClaims([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const enrichedClaims = claims.map(claim => ({
    ...claim,
    empName: employees.find(e => e.id === claim.empId)?.name || `Employee #${claim.empId}`,
    empAvatar: employees.find(e => e.id === claim.empId)?.avatar || claim.empId.toString()
  }));

  const filtered = tab === 'All' ? enrichedClaims : enrichedClaims.filter(c => c.status === tab);

  const approve = async (id) => {
    const updated = claims.map(c => c.id === id ? { ...c, status: 'Approved' } : c);
    setClaims(updated);
    await fetch(`http://localhost:5000/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Approved' })
    }).catch(console.error);
  };

  const reject = async (id) => {
    const updated = claims.map(c => c.id === id ? { ...c, status: 'Rejected' } : c);
    setClaims(updated);
    await fetch(`http://localhost:5000/api/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Rejected' })
    }).catch(console.error);
  };

  const submitClaim = async () => {
    if (!form.empId || !form.amount || !form.date || !form.desc) {
      alert('Please fill all fields');
      return;
    }
    const body = {
      empId: Number(form.empId),
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      status: 'Pending',
      desc: form.desc
    };
    try {
      const res = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const created = await res.json();
      setClaims(prev => [...prev, created]);
      setShowModal(false);
      setForm({ empId: '', category: 'Transport', amount: '', date: '', desc: '' });
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit claim');
    }
  };

  const generateAiInsights = async () => {
    setAiLoading(true);
    try {
      const totalApproved = claims.filter(c => c.status === 'Approved').reduce((s, c) => s + (c.amount || 0), 0);
      const totalPending = claims.filter(c => c.status === 'Pending').reduce((s, c) => s + (c.amount || 0), 0);
      const categoryTotals = {};
      claims.forEach(c => {
        if (c.category) categoryTotals[c.category] = (categoryTotals[c.category] || 0) + (c.amount || 0);
      });
      const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

      const prompt = `You are a finance HR analyst. Based on expense data:
- Total claims: ${claims.length}
- Approved amount: ${totalApproved}
- Pending amount: ${totalPending}
- Top expense category: ${topCategory ? `${topCategory[0]} (${topCategory[1]})` : 'N/A'}

Return JSON: {"summary":"one sentence overall health","alert":"any anomaly","recommendation":"actionable step","savingsTip":"cost saving idea"}
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
        summary: "Expense claims are within normal range.",
        alert: totalPending > 5000 ? "High pending amount requires review" : "No critical alerts",
        recommendation: "Review monthly category limits",
        savingsTip: "Consider pre-approved vendor list"
      });
    } catch (err) {
      console.error(err);
      setAiInsight({ summary: "AI unavailable", alert: "N/A", recommendation: "Check backend", savingsTip: "N/A" });
    } finally {
      setAiLoading(false);
    }
  };

  // Prepare chart data: spending by category (donut)
  const categoryData = categories.map(cat => ({
    name: cat,
    amount: claims.filter(c => c.category === cat).reduce((s, c) => s + (c.amount || 0), 0)
  })).filter(d => d.amount > 0);

  // Calculate spending by employee
  const employeeSpending = {};
  claims.forEach(c => {
    const empName = employees.find(e => e.id === c.empId)?.name || `Employee #${c.empId}`;
    employeeSpending[empName] = (employeeSpending[empName] || 0) + (c.amount || 0);
  });
  const employeeData = Object.entries(employeeSpending)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Monthly trend
  const monthlyTrendMap = {};
  claims.forEach(c => {
    const month = c.date?.slice(0, 7) || 'Unknown';
    if (!monthlyTrendMap[month]) {
      monthlyTrendMap[month] = { month, approved: 0, pending: 0 };
    }
    if (c.status === 'Approved') monthlyTrendMap[month].approved += c.amount || 0;
    else if (c.status === 'Pending') monthlyTrendMap[month].pending += c.amount || 0;
  });
  let trendData = Object.values(monthlyTrendMap).sort((a, b) => a.month.localeCompare(b.month));
  if (trendData.length === 0) {
    trendData = [{ month: 'No data', approved: 0, pending: 0 }];
  }

  // Get top spending employee
  const topSpender = employeeData[0];

  // Get recent claims (last 3)
  const recentClaims = [...enrichedClaims].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  const totalApproved = claims.filter(c => c.status === 'Approved').reduce((s, c) => s + (c.amount || 0), 0);
  const totalPending = claims.filter(c => c.status === 'Pending').reduce((s, c) => s + (c.amount || 0), 0);
  const monthlyBudget = 50000; // Monthly budget in INR (example threshold)

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: 16, color: 'var(--text-2)' }}>Loading expense data...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Expense Claims</h1>
        <p>Submit and manage employee expense reimbursements with AI insights.</p>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Claims</div>
          <div className="stat-value blue">{claims.length}</div>
          <div className="stat-sub">All time</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Approved Amount</div>
          <div className="stat-value green">{formatINR(totalApproved)}</div>
          <div className="stat-sub">Reimbursed</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Pending Amount</div>
          <div className="stat-value orange">{formatINR(totalPending)}</div>
          <div className="stat-sub">Awaiting approval</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value purple">{claims.filter(c => c.status === 'Pending').length}</div>
          <div className="stat-sub">Claims</div>
        </div>
      </div>

      {/* Budget Alert Card */}
      {totalPending > monthlyBudget && (
        <div style={{ 
          background: 'rgba(248,113,113,0.1)', 
          border: '1px solid rgba(248,113,113,0.2)', 
          borderRadius: 12, 
          padding: '12px 16px', 
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <AlertCircle size={20} style={{ color: '#f87171' }} />
          <span style={{ fontSize: 13, color: '#f87171' }}>
            ⚠️ Pending claims ({formatINR(totalPending)}) exceed monthly budget ({formatINR(monthlyBudget)}). Please review pending approvals.
          </span>
        </div>
      )}

      {/* AI Insight Card */}
      <div className="card" style={{ marginBottom: 24, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <div>
              <strong>AI Expense Insight</strong><br />
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
            <div><span style={{ color: '#fbbf24' }}>💰 Savings Tip:</span> {aiInsight.savingsTip}</div>
          </div>
        )}
      </div>

      {/* Charts Row */}
      <div className="card-grid-3" style={{ marginBottom: 24, gap: 20 }}>
        {/* Donut Chart - Spending by Category */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Spending by Category</div>
            <PieChartIcon size={16} style={{ color: 'var(--text-3)' }} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={2}
                dataKey="amount"
                label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`}
                labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
              >
                {categoryData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={catColors[entry.name] || '#94a3b8'} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend - Grouped Bar Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Monthly Expense Trend</div>
            <BarChart3 size={16} style={{ color: 'var(--text-3)' }} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => `₹${val/1000}k`} />
              <Tooltip content={<CustomAmountTooltip />} cursor={{ fill: 'rgba(56,189,248,0.05)' }} />
              <Bar dataKey="pending" name="Pending" fill="#fbbf24" radius={[4, 4, 0, 0]} barSize={28} />
              <Bar dataKey="approved" name="Approved" fill="#34d399" radius={[4, 4, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#fbbf24' }}></div>
              <span style={{ fontSize: 10, color: 'var(--text-2)' }}>Pending</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#34d399' }}></div>
              <span style={{ fontSize: 10, color: 'var(--text-2)' }}>Approved</span>
            </div>
          </div>
        </div>

        {/* Employee Spending Chart */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Top Spending Employees</div>
            <Award size={16} style={{ color: 'var(--text-3)' }} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={employeeData} layout="vertical" margin={{ left: 60, right: 10 }}>
              <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 11 }} width={60} />
              <Tooltip formatter={(value) => formatINR(value)} />
              <Bar dataKey="amount" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Claims Quick View */}
      <div className="card" style={{ marginBottom: 16, padding: '16px 20px' }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div className="card-title"><Clock size={16} style={{ marginRight: 8 }} />Recent Claims</div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {recentClaims.map(claim => (
            <div key={claim.id} style={{ 
              background: 'var(--bg-deep)', 
              borderRadius: 10, 
              padding: '10px 14px', 
              flex: '1 1 200px',
              borderLeft: `3px solid ${catColors[claim.category]}`
            }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{claim.empName}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{claim.category} • {claim.date}</div>
              <div style={{ fontWeight: 700, color: catColors[claim.category] }}>{formatINR(claim.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="tabs">
          {tabs.map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> New Claim
        </button>
      </div>

      {/* Claims Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Category</th><th>Amount</th><th>Date</th><th>Description</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="emp-info">
                      <div className="emp-avatar" style={{ fontSize: 11, background: `linear-gradient(135deg, ${catColors[c.category] || '#6366f1'}, #38bdf8)` }}>
                        {c.empName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{c.empName}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: catColors[c.category] }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: catColors[c.category], display: 'inline-block' }} />
                      {c.category}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{formatINR(c.amount)}</td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{c.date}</td>
                  <td style={{ color: 'var(--text-2)', fontSize: 12, maxWidth: 180 }}>{c.desc}</td>
                  <td>
                    <span className={`badge ${c.status === 'Approved' ? 'badge-green' : c.status === 'Pending' ? 'badge-orange' : 'badge-red'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    {c.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-outline" style={{ color: 'var(--accent3)', borderColor: 'var(--accent3)' }} onClick={() => approve(c.id)}>
                          <Check size={12} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => reject(c.id)}>
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>
                    No claims found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-title">New Expense Claim</div>
            <div className="modal-sub">Submit a claim for reimbursement (₹ Indian Rupee).</div>
            <div className="form-grid">
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Employee</label>
                <select className="form-select" value={form.empId} onChange={e => setForm({ ...form, empId: e.target.value })}>
                  <option value="">Select employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input className="form-input" type="number" step="0.01" placeholder="e.g. 4500" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="Brief description…" value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitClaim}><Receipt size={14} /> Submit Claim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}