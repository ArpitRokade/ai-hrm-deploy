import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Users, TrendingUp, DollarSign, Clock, Bell, Sparkles,
  AlertCircle, CheckCircle, BarChart3, Calendar,
  Award, Target, Activity, Loader2, PieChart as PieChartIcon,
  TrendingDown, Heart, Gift, Sun
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-2)', fontSize: 12, marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--accent)', fontWeight: 600 }}>${payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa'];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // AI Insights State
  const [aiInsights, setAiInsights] = useState({
    summary: "Click 'Generate AI Insights' to get intelligent HR recommendations.",
    alerts: [],
    recommendations: [],
    trends: []
  });

  // Generate mock trend data (in real app, fetch from API)
  const [headcountTrend] = useState([
    { month: 'Jan', count: 42 }, { month: 'Feb', count: 44 }, { month: 'Mar', count: 46 },
    { month: 'Apr', count: 48 }, { month: 'May', count: 49 }, { month: 'Jun', count: 52 }
  ]);

  const [leaveTrend] = useState([
    { month: 'Jan', leaves: 4 }, { month: 'Feb', leaves: 3 }, { month: 'Mar', leaves: 6 },
    { month: 'Apr', leaves: 5 }, { month: 'May', leaves: 7 }, { month: 'Jun', leaves: 4 }
  ]);

  const [expenseTrend] = useState([
    { month: 'Jan', amount: 3200 }, { month: 'Feb', amount: 2800 }, { month: 'Mar', amount: 4100 },
    { month: 'Apr', amount: 3900 }, { month: 'May', amount: 4500 }, { month: 'Jun', amount: 3800 }
  ]);

  const upcomingHolidays = [
    { name: "National Day", date: "Aug 9", type: "Public" },
    { name: "Deepavali", date: "Oct 20", type: "Public" },
    { name: "Christmas", date: "Dec 25", type: "Public" }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [empRes, leaveRes, expenseRes, payrollRes, deptRes, annRes, attendRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/leaves'),
        fetch('/api/expenses'),
        fetch('/api/payroll'),
        fetch('/api/departments'),
        fetch('/api/announcements'),
        fetch('/api/attendance').catch(() => ({ json: () => [] }))
      ]);

      setEmployees(await empRes.json());
      setLeaves(await leaveRes.json());
      setExpenses(await expenseRes.json());
      setPayrollData((await payrollRes.json()).length ? await payrollRes.json() : generateMockPayrollData());
      setDepartments(await deptRes.json());
      setAnnouncements(await annRes.json());
      setAttendance(await attendRes.json());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockPayrollData = () => {
    return [
      { month: 'Jan', totalPayout: 185000 }, { month: 'Feb', totalPayout: 188000 },
      { month: 'Mar', totalPayout: 192000 }, { month: 'Apr', totalPayout: 195000 },
      { month: 'May', totalPayout: 198000 }, { month: 'Jun', totalPayout: 202000 }
    ];
  };

  const generateAiInsights = async () => {
    setAiLoading(true);
    try {
      const activeCount = employees.filter(e => e.status === 'Active' || e.status === 'active').length;
      const pendingLeaves = leaves.filter(l => l.status === 'Pending' || l.status === 'pending').length;
      const totalPayroll = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
      const pendingExpenses = expenses.filter(e => e.status === 'Pending' || e.status === 'pending').length;

      const prompt = `You are an AI HR Analyst. Analyze this data and return JSON:
{
  "summary": "One powerful sentence overall health",
  "alerts": ["critical issues"],
  "recommendations": ["actionable steps"],
  "trends": ["positive observations"]
}
Data: Employees:${employees.length}, Active:${activeCount}, Pending Leaves:${pendingLeaves}, Pending Expenses:${pendingExpenses}, Payroll:$${totalPayroll}.`;

      const response = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      });
      const data = await response.json();
      let parsed;
      try {
        const jsonMatch = data.reply.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch { parsed = null; }
      setAiInsights({
        summary: parsed?.summary || "HR metrics analyzed.",
        alerts: parsed?.alerts || (pendingLeaves ? [`${pendingLeaves} pending leave requests`] : []),
        recommendations: parsed?.recommendations || ["Review pending approvals", "Optimize department workloads"],
        trends: parsed?.trends || ["Stable workforce"]
      });
    } catch (error) {
      console.error('AI Insights error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Metrics
  const activeEmp = employees.filter(e => e.status === 'Active' || e.status === 'active').length;
  const pendingLeave = leaves.filter(l => l.status === 'Pending' || l.status === 'pending').length;
  const totalPayroll = employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  const attendanceRate = attendance.length ? (attendance.filter(a => a.status === 'Present').length / attendance.length * 100).toFixed(1) : 96.2;
  const healthScore = Math.min(100, Math.round((activeEmp / (employees.length || 1)) * 50 + (100 - (pendingLeave / (leaves.length || 1)) * 30) + 20));

  // Department distribution for pie chart
  const deptDistribution = {};
  employees.forEach(emp => {
    const dept = emp.dept || emp.department || 'Unassigned';
    deptDistribution[dept] = (deptDistribution[dept] || 0) + 1;
  });
  const pieData = Object.entries(deptDistribution).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: 16, color: 'var(--text-2)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Good morning, Admin 👋</h1>
        <p>Strategic HR Dashboard • Real-time insights & analytics</p>
      </div>

      {/* AI Insights Card */}
      <div className="ai-insight-card" style={{
        background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.05))',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 24
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>AI-Powered Insights</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Intelligent HR Analytics</div>
              </div>
            </div>
            <div style={{ background: 'rgba(56,189,248,0.1)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, borderLeft: `3px solid var(--accent)` }}>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>📊 EXECUTIVE SUMMARY</div>
              <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{aiInsights.summary}</div>
            </div>
            {aiInsights.alerts.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><AlertCircle size={14} /> ALERTS</div>
                {aiInsights.alerts.map((alert, idx) => <div key={idx} style={{ fontSize: 13, color: 'var(--text-2)' }}>⚠️ {alert}</div>)}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {aiInsights.recommendations.length > 0 && (
                <div><div style={{ fontSize: 12, color: 'var(--accent3)', marginBottom: 8 }}><Target size={14} /> RECOMMENDATIONS</div>
                  {aiInsights.recommendations.map((rec, idx) => <div key={idx} style={{ fontSize: 13, color: 'var(--text-2)' }}>✓ {rec}</div>)}
                </div>
              )}
              {aiInsights.trends.length > 0 && (
                <div><div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 8 }}><TrendingUp size={14} /> TRENDS</div>
                  {aiInsights.trends.map((trend, idx) => <div key={idx} style={{ fontSize: 13, color: 'var(--text-2)' }}>📈 {trend}</div>)}
                </div>
              )}
            </div>
          </div>
          <button onClick={generateAiInsights} disabled={aiLoading} style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            border: 'none', borderRadius: 12, padding: '12px 28px', color: '#fff',
            fontSize: 14, fontWeight: 600, cursor: aiLoading ? 'not-allowed' : 'pointer',
            opacity: aiLoading ? 0.6 : 1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8
          }}>{aiLoading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing...</> : <><Sparkles size={18} /> Generate AI Insights</>}</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="stat-card blue"><div className="stat-label">Total Employees</div><div className="stat-value blue">{employees.length}</div><div className="stat-sub">Active: {activeEmp}</div><Users size={20} className="stat-icon" /></div>
        <div className="stat-card green"><div className="stat-label">Attendance Rate</div><div className="stat-value green">{attendanceRate}%</div><div className="stat-sub">This month</div><Activity size={20} className="stat-icon" /></div>
        <div className="stat-card orange"><div className="stat-label">Monthly Payroll</div><div className="stat-value orange">${totalPayroll.toLocaleString()}</div><div className="stat-sub">Avg: ${Math.round(totalPayroll/employees.length || 0).toLocaleString()}</div><DollarSign size={20} className="stat-icon" /></div>
        <div className="stat-card purple"><div className="stat-label">Pending Leaves</div><div className="stat-value purple">{pendingLeave}</div><div className="stat-sub">Awaiting approval</div><Clock size={20} className="stat-icon" /></div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}><div className="stat-label">HR Health Score</div><div className="stat-value" style={{ color: healthScore > 80 ? '#34d399' : healthScore > 60 ? '#fbbf24' : '#f87171' }}>{healthScore}<span style={{ fontSize: 14 }}>/100</span></div><div className="stat-sub">{healthScore > 80 ? 'Excellent' : healthScore > 60 ? 'Good' : 'Needs attention'}</div><Heart size={20} className="stat-icon" /></div>
      </div>

      {/* First Row Charts */}
      <div className="card-grid-3" style={{ marginBottom: 20 }}>
        <div className="card"><div className="card-header"><div className="card-title">Payroll Trend</div><BarChart3 size={16} style={{ color: 'var(--text-3)' }} /></div><ResponsiveContainer width="100%" height={180}><AreaChart data={payrollData}><defs><linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} /><stop offset="95%" stopColor="#38bdf8" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="month" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} /><Tooltip content={<CustomTooltip />} /><Area type="monotone" dataKey="totalPayout" stroke="#38bdf8" strokeWidth={2} fill="url(#payGrad)" /></AreaChart></ResponsiveContainer></div>
        <div className="card"><div className="card-header"><div className="card-title">Headcount Growth</div><TrendingUp size={16} style={{ color: 'var(--text-3)' }} /></div><ResponsiveContainer width="100%" height={180}><LineChart data={headcountTrend}><XAxis dataKey="month" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} /><Tooltip /><Line type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} /></LineChart></ResponsiveContainer></div>
        <div className="card"><div className="card-header"><div className="card-title">Department Distribution</div><PieChartIcon size={16} style={{ color: 'var(--text-3)' }} /></div><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}><Cell key="cell-0" fill={COLORS[0]} /><Cell key="cell-1" fill={COLORS[1]} /><Cell key="cell-2" fill={COLORS[2]} /><Cell key="cell-3" fill={COLORS[3]} /></Pie><Tooltip /></PieChart></ResponsiveContainer></div>
      </div>

      {/* Second Row Charts */}
      <div className="card-grid-2" style={{ marginBottom: 20 }}>
        <div className="card"><div className="card-header"><div className="card-title">Leave Trend (Monthly)</div><Calendar size={16} style={{ color: 'var(--text-3)' }} /></div><ResponsiveContainer width="100%" height={200}><BarChart data={leaveTrend}><XAxis dataKey="month" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'var(--bg-card2)', border: 'none', borderRadius: 8 }} /><Bar dataKey="leaves" fill="#34d399" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div>
        <div className="card"><div className="card-header"><div className="card-title">Expense Claims Trend</div><DollarSign size={16} style={{ color: 'var(--text-3)' }} /></div><ResponsiveContainer width="100%" height={200}><AreaChart data={expenseTrend}><defs><linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} /><stop offset="95%" stopColor="#fbbf24" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="month" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} /><Tooltip /><Area type="monotone" dataKey="amount" stroke="#fbbf24" strokeWidth={2} fill="url(#expGrad)" /></AreaChart></ResponsiveContainer></div>
      </div>

      {/* Bottom Row: Recent hires, Upcoming holidays, Announcements */}
      <div className="card-grid-3" style={{ marginBottom: 0 }}>
        <div className="card"><div className="card-header"><div className="card-title">Recent Hires</div><Award size={16} style={{ color: 'var(--text-3)' }} /></div>{employees.slice(0, 4).map(emp => (<div key={emp.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><div className="emp-info"><div className="emp-avatar">{emp.avatar || '👤'}</div><div><div className="emp-name">{emp.name}</div><div className="emp-role">{emp.dept || '—'}</div></div></div><span className={`badge ${(emp.status === 'Active') ? 'badge-green' : 'badge-orange'}`}>{emp.status || 'Active'}</span></div>))}{employees.length === 0 && <p style={{ color: 'var(--text-3)', textAlign: 'center' }}>No data</p>}</div>
        <div className="card"><div className="card-header"><div className="card-title">Upcoming Holidays</div><Gift size={16} style={{ color: 'var(--text-3)' }} /></div>{upcomingHolidays.map((h, idx) => (<div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}><span style={{ fontWeight: 500 }}>{h.name}</span><span style={{ color: 'var(--accent3)' }}>{h.date}</span></div>))}</div>
        <div className="card"><div className="card-header"><div className="card-title">Announcements</div><Bell size={16} style={{ color: 'var(--text-3)' }} /></div>{announcements.length > 0 ? announcements.slice(0, 3).map(a => (<div key={a.id} className={`announcement ${a.priority || 'low'}`}><div className="ann-title">{a.title}</div><div className="ann-date">{a.date}</div><div className="ann-body">{a.body}</div></div>)) : <p style={{ color: 'var(--text-3)', textAlign: 'center' }}>No announcements</p>}</div>
      </div>
    </div>
  );
}