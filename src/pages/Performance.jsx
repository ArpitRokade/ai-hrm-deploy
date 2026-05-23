import React, { useState, useEffect } from 'react';
import {
  Star, TrendingUp, Users, Sparkles, AlertCircle, Target,
  BarChart3, PieChart as PieChartIcon, ChevronRight, Loader2,
  Award, Calendar, Download, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f87171'];

// Custom tooltip for all charts
const CustomTooltip = ({ active, payload, label, type = 'default' }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card2)',
        border: '1px solid rgba(56,189,248,0.2)',
        borderRadius: 12,
        padding: '10px 16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)'
      }}>
        <p style={{ color: 'var(--text-2)', fontSize: 11, marginBottom: 4 }}>{label}</p>
        {type === 'rating' && (
          <p style={{ color: '#38bdf8', fontSize: 18, fontWeight: 700 }}>
            {payload[0].value} / 5
          </p>
        )}
        {type === 'count' && (
          <p style={{ color: '#34d399', fontSize: 18, fontWeight: 700 }}>
            {payload[0].value} employees
          </p>
        )}
        {type === 'percent' && (
          <p style={{ color: '#fbbf24', fontSize: 18, fontWeight: 700 }}>
            {payload[0].value}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function Performance() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [coachingTip, setCoachingTip] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [perfRes, empRes] = await Promise.all([
        fetch('http://localhost:5000/api/performance'),
        fetch('http://localhost:5000/api/employees')
      ]);
      const perfData = await perfRes.json();
      const empData = await empRes.json();
      setReviews(perfData);
      setEmployees(empData);
    } catch (err) {
      console.error('Fetch error:', err);
      // Fallback mock
      setReviews([
        { id: 1, name: 'Alice Tan', rating: 4.7, review: 'Excellent problem solver.', trend: '+0.3', quarter: 'Q1' },
        { id: 2, name: 'Bob Lee', rating: 3.9, review: 'Solid but needs communication.', trend: '-0.1', quarter: 'Q2' },
        { id: 3, name: 'Carol Lim', rating: 4.9, review: 'Outstanding leadership.', trend: '+0.5', quarter: 'Q3' },
        { id: 4, name: 'David Koh', rating: 3.5, review: 'Meets expectations.', trend: '-0.2', quarter: 'Q4' }
      ]);
      setEmployees([
        { id: 1, name: 'Alice Tan', dept: 'Engineering' },
        { id: 2, name: 'Bob Lee', dept: 'Product' },
        { id: 3, name: 'Carol Lim', dept: 'Data Science' },
        { id: 4, name: 'David Koh', dept: 'Marketing' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateAiInsights = async () => {
    setAiLoading(true);
    try {
      const avgRating = (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / Math.max(1, reviews.length)).toFixed(1);
      const highPerformers = reviews.filter(r => r.rating >= 4.5).length;
      const lowPerformers = reviews.filter(r => r.rating < 3.8).length;
      const departments = [...new Set(employees.map(e => e.dept))];
      const deptPerformance = departments.map(dept => {
        const empsInDept = employees.filter(e => e.dept === dept).map(e => e.name);
        const deptReviews = reviews.filter(r => empsInDept.includes(r.name));
        const avg = deptReviews.length ? (deptReviews.reduce((s, r) => s + r.rating, 0) / deptReviews.length).toFixed(1) : 0;
        return { dept, avg: parseFloat(avg) };
      });

      const prompt = `You are an HR performance analyst. Based on this data:
- Total reviews: ${reviews.length}
- Average rating: ${avgRating}
- High performers (≥4.5): ${highPerformers}
- Low performers (<3.8): ${lowPerformers}
- Department average ratings: ${JSON.stringify(deptPerformance)}

Provide JSON: 
{"summary":"one sentence overall health","topDepartment":"dept with highest avg","improvementFocus":"specific skill","recommendation":"actionable step"}
Only output valid JSON.`;

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
        summary: "Performance stable, focus on collaboration.",
        topDepartment: "Engineering",
        improvementFocus: "Cross-functional communication",
        recommendation: "Implement quarterly 360 reviews"
      });
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const generateCoachingTip = async (employeeName, rating, reviewText) => {
    setCoachingTip('Generating...');
    try {
      const prompt = `Employee: ${employeeName}, Rating: ${rating}/5, Review: "${reviewText}". Provide one actionable coaching tip (max 20 words). Return only the tip.`;
      const response = await fetch('http://localhost:5000/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt })
      });
      const data = await response.json();
      setCoachingTip(data.reply || 'Focus on goal setting and feedback.');
    } catch (err) {
      setCoachingTip('Unable to generate tip.');
    }
  };

  // Prepare professional chart data
  const ratingDistribution = reviews.reduce((acc, r) => {
    const bucket = Math.floor(r.rating);
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});
  const distData = Object.entries(ratingDistribution).map(([range, count]) => {
    let label = '';
    if (range === '3') label = '3 - 3.9';
    else if (range === '4') label = '4 - 4.4';
    else if (range === '5') label = '4.5 - 5.0';
    else label = `${range} - ${parseInt(range)+0.9}`;
    return { range: label, count, percentage: (count / reviews.length * 100).toFixed(0) };
  });

  const quarterlyTrends = reviews.reduce((acc, r) => {
    const q = r.quarter || 'Q4';
    if (!acc[q]) acc[q] = { total: 0, count: 0 };
    acc[q].total += r.rating;
    acc[q].count += 1;
    return acc;
  }, {});
  const trendData = Object.entries(quarterlyTrends).map(([q, data]) => ({
    quarter: q,
    avgRating: parseFloat((data.total / data.count).toFixed(1))
  })).sort((a,b) => a.quarter.localeCompare(b.quarter));

  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1) : 0;
  const flagged = reviews.filter(r => r.rating < 4.0);
  const highPerformers = reviews.filter(r => r.rating >= 4.5);
  const departments = [...new Set(employees.map(e => e.dept))];
  const deptPerformanceData = departments.map(dept => {
    const empNames = employees.filter(e => e.dept === dept).map(e => e.name);
    const deptReviews = reviews.filter(r => empNames.includes(r.name));
    const avg = deptReviews.length ? deptReviews.reduce((s, r) => s + r.rating, 0) / deptReviews.length : 0;
    return { name: dept, avg: parseFloat(avg.toFixed(1)) };
  }).filter(d => d.avg > 0).sort((a,b) => b.avg - a.avg);

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: 16, color: 'var(--text-2)' }}>Loading performance data...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Performance Analysis</h1>
        <p>AI-driven insights, trend analysis, and coaching recommendations.</p>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card blue"><div className="stat-label">Avg Rating</div><div className="stat-value blue">{avgRating}</div><div className="stat-sub">/5.0</div><Star size={20} className="stat-icon" /></div>
        <div className="stat-card green"><div className="stat-label">Reviews</div><div className="stat-value green">{reviews.length}</div><div className="stat-sub">Total</div><Users size={20} className="stat-icon" /></div>
        <div className="stat-card purple"><div className="stat-label">High Performers</div><div className="stat-value purple">{highPerformers.length}</div><div className="stat-sub">Rating ≥4.5</div><Award size={20} className="stat-icon" /></div>
        <div className="stat-card orange"><div className="stat-label">Coaching Need</div><div className="stat-value orange">{flagged.length}</div><div className="stat-sub">Rating {'<'}4.0</div><Target size={20} className="stat-icon" /></div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
          <div className="stat-label">Dept Leader</div>
          <div className="stat-value" style={{ fontSize: 22, color: '#38bdf8' }}>{aiInsight?.topDepartment || '—'}</div>
          <div className="stat-sub">Highest avg rating</div>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="card" style={{ marginBottom: 24, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
            <div><strong>AI Performance Summary</strong><br /><span style={{ fontSize: 13, color: 'var(--text-2)' }}>{aiInsight?.summary || 'Click "Analyze" for insights'}</span></div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={generateAiInsights} disabled={aiLoading} style={{ gap: 6 }}>
            {aiLoading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
            {aiLoading ? 'Analyzing...' : 'Generate AI Insights'}
          </button>
        </div>
        {aiInsight && (
          <div style={{ marginTop: 16, display: 'flex', gap: 20, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div><span style={{ color: 'var(--accent2)' }}>🎯 Improvement Focus:</span> {aiInsight.improvementFocus}</div>
            <div><span style={{ color: 'var(--accent3)' }}>💡 Recommendation:</span> {aiInsight.recommendation}</div>
          </div>
        )}
      </div>

      {/* Professional Charts Row */}
      <div className="card-grid-3" style={{ marginBottom: 24, gap: 20 }}>
        {/* Rating Distribution - Donut Chart with Center Text */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Rating Distribution</div>
            <PieChartIcon size={16} style={{ color: 'var(--text-3)' }} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={distData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                label={({ range, percentage }) => `${range} (${percentage}%)`}
                labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
              >
                {distData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip type="count" />} />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={12}>
                Total<br/> <tspan fill="#38bdf8" fontSize={20} fontWeight="bold">{reviews.length}</tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Quarterly Trend - Smooth Area with Gradient */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Quarterly Performance Trend</div>
            <TrendingUp size={16} style={{ color: 'var(--text-3)' }} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} dy={8} />
              <YAxis domain={[3, 5]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(val) => `${val.toFixed(1)}`} />
              <Tooltip content={<CustomTooltip type="rating" />} cursor={{ stroke: '#38bdf8', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="avgRating" stroke="#38bdf8" strokeWidth={2} fill="url(#trendGradient)" />
              <Line type="monotone" dataKey="avgRating" stroke="#38bdf8" strokeWidth={2} dot={{ fill: '#38bdf8', r: 4, strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 6, fill: '#38bdf8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Performance - Horizontal Bar with Custom Tooltip */}
        <div className="card" style={{ padding: '20px' }}>
          <div className="card-header" style={{ marginBottom: 12 }}>
            <div className="card-title">Department Performance</div>
            <BarChart3 size={16} style={{ color: 'var(--text-3)' }} />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptPerformanceData} layout="vertical" margin={{ left: 20, right: 10 }}>
              <XAxis type="number" domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => `${val.toFixed(1)}`} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} width={80} />
              <Tooltip content={<CustomTooltip type="rating" />} cursor={{ fill: 'rgba(56,189,248,0.05)' }} />
              <Bar dataKey="avg" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Reviews Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div className="card-header" style={{ padding: '16px 20px', marginBottom: 0, borderBottom: '1px solid var(--border)' }}>
          <div className="card-title">Employee Performance Reviews</div>
          <span className="badge badge-blue">{reviews.length} reviews</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Employee</th><th>Rating</th><th>Review Summary</th><th>Trend</th><th>Action</th></tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id}>
                  <td><strong>{review.name}</strong></td>
                  <td style={{ fontWeight: 700, color: review.rating >= 4.5 ? '#34d399' : review.rating >= 3.8 ? '#fbbf24' : '#f87171' }}>{review.rating} / 5</td>
                  <td style={{ maxWidth: 300, color: 'var(--text-2)' }}>{review.review}</td>
                  <td><TrendingUp size={16} color={review.trend?.startsWith('+') ? '#34d399' : '#f97316'} /></td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => { setSelectedEmployee(review); generateCoachingTip(review.name, review.rating, review.review); }}>
                      Coaching Tip
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No performance reviews found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Panels */}
      <div className="card-grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title"><Star size={16} style={{ marginRight: 8 }} />Performance Spotlight</div></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {highPerformers.slice(0, 3).map(r => (
              <div key={r.id} style={{ padding: 12, background: 'var(--bg-deep)', borderRadius: 10, borderLeft: `3px solid #34d399` }}>
                <div style={{ fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                  {r.name}<span style={{ color: '#34d399' }}>{r.rating}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.review}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title"><Target size={16} style={{ marginRight: 8 }} />Coaching & Development</div></div>
          {selectedEmployee ? (
            <div>
              <div style={{ marginBottom: 12 }}>
                <strong>{selectedEmployee.name}</strong> ({selectedEmployee.rating}/5)
              </div>
              <div style={{ padding: 12, background: 'var(--bg-deep)', borderRadius: 10, color: 'var(--text-2)' }}>
                {coachingTip || 'Click "Coaching Tip" to generate AI advice.'}
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={() => setSelectedEmployee(null)}>Clear</button>
            </div>
          ) : (
            <div style={{ color: 'var(--text-3)', textAlign: 'center', padding: 20 }}>
              Select an employee from the table to get AI-generated coaching tips.
            </div>
          )}
          {flagged.length > 0 && !selectedEmployee && (
            <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 8 }}>Employees needing coaching:</div>
              <ul style={{ paddingLeft: 20, color: 'var(--text-2)' }}>
                {flagged.map(r => <li key={r.id}>{r.name} ({r.rating})</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}