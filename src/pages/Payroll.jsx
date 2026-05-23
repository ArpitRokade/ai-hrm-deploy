import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Calculator, Download } from 'lucide-react';
import { calcCPF } from '../data/mockData';

// Format Indian Rupee
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{background:'var(--bg-card2)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px'}}>
        <p style={{color:'var(--text-2)',fontSize:12,marginBottom:4}}>{label}</p>
        <p style={{color:'var(--accent)',fontWeight:600}}>{formatINR(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function Payroll() {
  const [tab, setTab] = useState('payslips');
  const [employees, setEmployees] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [calcSalary, setCalcSalary] = useState('6800');
  const [calcAge, setCalcAge] = useState('30');

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(setEmployees)
      .catch(() => setEmployees([]));
    fetch('/api/payroll')
      .then(res => res.json())
      .then(setPayrollData)
      .catch(() => setPayrollData([]));
  }, []);

  const cpf = calcCPF(Number(calcSalary) || 0, Number(calcAge) || 30);
  const totalGross = employees.reduce((s, e) => s + (e.salary || 0), 0);
  const totalCPF = employees.reduce((s, e) => s + calcCPF(e.salary || 0).employerContrib, 0);

  const exportCSV = () => {
    const rows = [
      ['Name', 'Role', 'Gross (₹)', 'Emp Contribution', 'Employer Contribution', 'Net (₹)'],
      ...employees.map(e => {
        const c = calcCPF(e.salary);
        return [e.name, e.role, formatINR(c.grossSalary), c.employeeContrib, c.employerContrib, formatINR(c.netSalary)];
      })
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'payroll.csv';
    a.click();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Payroll Processing</h1>
        <p>Employee payroll with contributions (Indian Rupee).</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card blue">
          <div className="stat-label">Total Gross</div>
          <div className="stat-value blue">{formatINR(totalGross)}</div>
          <div className="stat-sub">June 2025</div>
          <DollarSign size={20} className="stat-icon" />
        </div>
        <div className="stat-card orange">
          <div className="stat-label">Employer Contribution</div>
          <div className="stat-value orange">{formatINR(totalCPF)}</div>
          <div className="stat-sub">Based on capped wages</div>
        </div>
        <div className="stat-card green">
          <div className="stat-label">Total Cost</div>
          <div className="stat-value green">{formatINR(totalGross + totalCPF)}</div>
          <div className="stat-sub">Gross + employer contribution</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-label">On Payroll</div>
          <div className="stat-value purple">{employees.length}</div>
          <div className="stat-sub">All eligible</div>
        </div>
      </div>

      <div className="card-grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Monthly Payroll (2025)</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={payrollData}>
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => formatINR(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="totalPayout" radius={[6, 6, 0, 0]}>
                {payrollData.map((e, i) => <Cell key={i} fill={e.month === 'Jun' ? '#38bdf8' : '#1e3a5f'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title"><Calculator size={16} style={{ display: 'inline', marginRight: 8 }} />Contribution Calculator</div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Gross Salary (₹)</label>
              <input className="form-input" type="number" value={calcSalary} onChange={e => setCalcSalary(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Employee Age</label>
              <input className="form-input" type="number" value={calcAge} onChange={e => setCalcAge(e.target.value)} />
            </div>
          </div>
          {cpf.grossSalary > 0 && (
            <div className="cpf-result">
              <div className="cpf-row"><span>Gross Salary</span><span>{formatINR(cpf.grossSalary)}</span></div>
              <div className="cpf-row"><span>Employee Contribution ({(cpf.empRate * 100).toFixed(0)}%)</span><span style={{ color: 'var(--danger)' }}>-{formatINR(cpf.employeeContrib)}</span></div>
              <div className="cpf-row"><span>Employer Contribution ({(cpf.erRate * 100).toFixed(0)}%)</span><span style={{ color: 'var(--accent-warm)' }}>+{formatINR(cpf.employerContrib)}</span></div>
              <div className="cpf-row"><span>Net Take-Home</span><span>{formatINR(cpf.netSalary)}</span></div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="tabs">
          <button className={`tab ${tab === 'payslips' ? 'active' : ''}`} onClick={() => setTab('payslips')}>Payslips</button>
          <button className={`tab ${tab === 'summary' ? 'active' : ''}`} onClick={() => setTab('summary')}>Summary</button>
        </div>
        <button className="btn btn-outline" onClick={exportCSV}><Download size={14} /> Export CSV</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th><th>Gross</th><th>Emp. Contribution</th><th>Employer Contribution</th><th>Total Contribution</th><th>Net Salary</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const c = calcCPF(emp.salary);
                return (
                  <tr key={emp.id}>
                    <td>
                      <div className="emp-info">
                        <div className="emp-avatar">{emp.avatar}</div>
                        <div>
                          <div className="emp-name">{emp.name}</div>
                          <div className="emp-role">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>{formatINR(c.grossSalary)}</td>
                    <td style={{ color: 'var(--danger)' }}>-{formatINR(c.employeeContrib)}</td>
                    <td style={{ color: 'var(--accent-warm)' }}>+{formatINR(c.employerContrib)}</td>
                    <td>{formatINR(c.totalCPF)}</td>
                    <td style={{ color: 'var(--accent3)', fontWeight: 600 }}>{formatINR(c.netSalary)}</td>
                    <td><span className="badge badge-green">Processed</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}