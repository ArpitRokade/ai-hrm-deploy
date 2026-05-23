import React, { useState, useEffect } from 'react';
import { Search, Plus, Mail, Phone, X, Edit2, Trash2, Loader2, Sparkles } from 'lucide-react';

const deptColors = {
  Engineering: '#6366f1',
  'Human Resources': '#22d3ee',
  Analytics: '#f472b6',
  Design: '#34d399',
  Product: '#fb923c',
  Marketing: '#a78bfa',
  Sales: '#f97316',
  Finance: '#14b8a6',
  Legal: '#8b5cf6',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [newEmp, setNewEmp] = useState({
    name: '', role: '', dept: 'Engineering', salary: '', email: '', phone: ''
  });
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);

  const depts = ['All', ...new Set(employees.map(e => e.dept))];
  const filtered = employees.filter(e =>
    (deptFilter === 'All' || e.dept === deptFilter) &&
    (e.name?.toLowerCase().includes(search.toLowerCase()) || e.role?.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/employees');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Could not load employees. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newEmp.name || !newEmp.role || !newEmp.salary) return;
    const emp = {
      ...newEmp,
      salary: Number(newEmp.salary),
      status: 'Active',
      avatar: newEmp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      cpf: true,
      joined: new Date().toISOString().split('T')[0],
      email: newEmp.email || `${newEmp.name.toLowerCase().replace(/\s/g, '.')}@ambe.ai`,
      phone: newEmp.phone || '+65 9XXX XXXX'
    };
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp)
      });
      if (res.ok) {
        const created = await res.json();
        setEmployees(prev => [...prev, created]);
        setShowModal(false);
        setNewEmp({ name: '', role: '', dept: 'Engineering', salary: '', email: '', phone: '' });
        setAiSuggestion(null);
      } else {
        throw new Error('Add failed');
      }
    } catch (e) {
      console.error('Add employee error:', e);
      alert('Failed to add employee. Check backend connection.');
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    try {
      const res = await fetch(`/api/employees/${editing.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing)
      });
      if (res.ok) {
        const updated = await res.json();
        setEmployees(prev => prev.map(emp => emp.id === updated.id ? updated : emp));
        setEditing(null);
        setSelected(null);
      } else {
        throw new Error('Update failed');
      }
    } catch (e) {
      console.error('Update error:', e);
      alert('Failed to update employee.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        setSelected(null);
      } else {
        throw new Error('Delete failed');
      }
    } catch (e) {
      console.error('Delete error:', e);
      alert('Failed to delete employee.');
    }
  };

  const getAiSuggestion = async () => {
    if (!newEmp.name.trim()) {
      alert('Please enter a name first');
      return;
    }
    setAiSuggesting(true);
    try {
      const res = await fetch('/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Based on the name "${newEmp.name}", suggest a realistic job role and department for an AI/tech company in Singapore. Return only JSON: {"role": "job title", "dept": "department"}. Departments can be from: Engineering, Human Resources, Analytics, Design, Product, Marketing, Sales, Finance.`
        })
      });
      const data = await res.json();
      let suggestion = null;
      try {
        const jsonMatch = data.reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) suggestion = JSON.parse(jsonMatch[0]);
      } catch (e) { console.warn(e); }
      if (suggestion && suggestion.role && suggestion.dept) {
        setAiSuggestion(suggestion);
        setNewEmp(prev => ({ ...prev, role: suggestion.role, dept: suggestion.dept }));
      } else {
        setAiSuggestion(null);
      }
    } catch (err) {
      console.error('AI suggestion error:', err);
    } finally {
      setAiSuggesting(false);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner"></div>
        <p style={{ marginTop: 16, color: 'var(--text-2)' }}>Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--danger)', marginBottom: 16 }}>⚠️ {error}</p>
          <button className="btn btn-primary" onClick={fetchEmployees}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Employee Management</h1>
        <p>Manage your workforce across all departments.</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="topbar-search" style={{ width: 260 }}>
          <Search size={14} color="var(--text-3)" />
          <input placeholder="Search by name or role…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {depts.map(d => (
            <button key={d} className={`tab ${deptFilter === d ? 'active' : ''}`} onClick={() => setDeptFilter(d)} style={{ padding: '6px 14px', fontSize: 12 }}>
              {d}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Employee
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Department</th><th>Salary (SGD)</th><th>Joined</th><th>Status</th><th>Contact</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(emp => (
                <tr key={emp.id} style={{ cursor: 'pointer' }}>
                  <td onClick={() => setSelected(emp)}>
                    <div className="emp-info">
                      <div className="emp-avatar" style={{ background: `linear-gradient(135deg,${deptColors[emp.dept] || '#6366f1'},#38bdf8)` }}>
                        {emp.avatar || emp.name?.charAt(0) || '?'}
                      </div>
                      <div><div className="emp-name">{emp.name}</div><div className="emp-role">{emp.role}</div></div>
                    </div>
                  </td>
                  <td onClick={() => setSelected(emp)}><span style={{ color: deptColors[emp.dept] || '#94a3b8', fontSize: 13, fontWeight: 500 }}>{emp.dept}</span></td>
                  <td onClick={() => setSelected(emp)} style={{ fontWeight: 600, fontFamily: 'var(--font-display)' }}>${emp.salary?.toLocaleString()}</td>
                  <td onClick={() => setSelected(emp)} style={{ color: 'var(--text-2)', fontSize: 13 }}>{emp.joined}</td>
                  <td onClick={() => setSelected(emp)}><span className={`badge ${emp.status === 'Active' ? 'badge-green' : 'badge-orange'}`}>{emp.status}</span></td>
                  <td onClick={() => setSelected(emp)}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={`mailto:${emp.email}`} style={{ color: 'var(--text-3)' }}><Mail size={14} /></a>
                      <a href={`tel:${emp.phone}`} style={{ color: 'var(--text-3)' }}><Phone size={14} /></a>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); setEditing(emp); setSelected(null); }}>
                        <Edit2 size={12} /> Edit
                      </button>
                      <button className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={(e) => { e.stopPropagation(); handleDelete(emp.id); }}>
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-3)' }}>No employees found.</div>}
        </div>
      </div>

      {selected && !editing && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div className="emp-avatar" style={{ width: 56, height: 56, fontSize: 20, borderRadius: 14, background: `linear-gradient(135deg,${deptColors[selected.dept] || '#6366f1'},#38bdf8)` }}>
                {selected.avatar}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>{selected.name}</div>
                <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{selected.role} · {selected.dept}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="icon-btn" onClick={() => { setEditing(selected); setSelected(null); }}><Edit2 size={16} /></button>
                <button className="icon-btn" onClick={() => { handleDelete(selected.id); setSelected(null); }} style={{ color: 'var(--danger)' }}><Trash2 size={16} /></button>
                <button className="icon-btn" onClick={() => setSelected(null)}><X size={20} /></button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Employee ID', `#EMP-00${selected.id}`], ['Status', selected.status], ['Email', selected.email], ['Phone', selected.phone], ['Salary', `$${selected.salary?.toLocaleString()} SGD`], ['Joined', selected.joined], ['CPF Eligible', selected.cpf ? 'Yes' : 'No'], ['Department', selected.dept]].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg-deep)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-title">Edit Employee</div>
            <div className="modal-sub">Update employee information.</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Job Role</label><input className="form-input" value={editing.role} onChange={e => setEditing({ ...editing, role: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-select" value={editing.dept} onChange={e => setEditing({ ...editing, dept: e.target.value })}>
                  {Object.keys(deptColors).map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Salary (SGD)</label><input className="form-input" type="number" value={editing.salary} onChange={e => setEditing({ ...editing, salary: Number(e.target.value) })} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={editing.email} onChange={e => setEditing({ ...editing, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={editing.phone} onChange={e => setEditing({ ...editing, phone: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-select" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className="modal-title">Add New Employee</div>
            <div className="modal-sub">Fill in the details to onboard a new team member. <button className="btn btn-sm" style={{ marginLeft: 8, background: 'none', color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 99, padding: '4px 12px' }} onClick={getAiSuggestion} disabled={aiSuggesting}>
              {aiSuggesting ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={12} />} AI Suggest Role
            </button></div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" placeholder="e.g. Sarah Lim" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Job Role *</label><input className="form-input" placeholder="e.g. Frontend Developer" value={newEmp.role} onChange={e => setNewEmp({ ...newEmp, role: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-select" value={newEmp.dept} onChange={e => setNewEmp({ ...newEmp, dept: e.target.value })}>
                  {Object.keys(deptColors).map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Monthly Salary (SGD) *</label><input className="form-input" type="number" placeholder="e.g. 6500" value={newEmp.salary} onChange={e => setNewEmp({ ...newEmp, salary: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" placeholder="user@ambe.ai" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" placeholder="+65 9XXX XXXX" value={newEmp.phone} onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })} /></div>
            </div>
            {aiSuggestion && <div style={{ background: 'rgba(56,189,248,0.1)', borderRadius: 8, padding: '10px', marginTop: 12, fontSize: 12 }}>✨ AI suggested: <strong>{aiSuggestion.role}</strong> · {aiSuggestion.dept}</div>}
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAdd}><Plus size={14} /> Add Employee</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}