import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Calculator, Download } from 'lucide-react';
import { calcCPF } from '../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{background:'var(--bg-card2)',border:'1px solid var(--border)',borderRadius:8,padding:'10px 14px'}}>
        <p style={{color:'var(--text-2)',fontSize:12,marginBottom:4}}>{label}</p>
        <p style={{color:'var(--accent)',fontWeight:600}}>${payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function Payroll() {
  const [tab, setTab]           = useState('payslips');
  const [employees, setEmployees] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [calcSalary, setCalcSalary] = useState('6800');
  const [calcAge, setCalcAge]   = useState('30');

  useEffect(()=>{
    fetch('/api/employees').then(r=>r.json()).then(setEmployees).catch(()=>setEmployees([]));
    fetch('/api/payroll').then(r=>r.json()).then(setPayrollData).catch(()=>setPayrollData([]));
  },[]);

  const cpf        = calcCPF(Number(calcSalary)||0, Number(calcAge)||30);
  const totalGross = employees.reduce((s,e)=>s+ (e.salary||0),0);
  const totalCPF   = employees.reduce((s,e)=>s+calcCPF(e.salary||0).employerContrib,0);

  const exportCSV = () => {
    const rows = [
      ['Name','Role','Gross','Emp CPF','Employer CPF','Net'],
      ...employees.map(e=>{ const c=calcCPF(e.salary); return [e.name,e.role,e.salary,c.employeeContrib,c.employerContrib,c.netSalary]; }),
    ];
    const blob = new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'});
    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='payroll-jun-2025.csv'; a.click();
  };

  return (
    <div className="page">
      <div className="page-header"><h1>Payroll Processing</h1><p>Singapore CPF-compliant payroll management.</p></div>

      <div className="stat-grid">
        <div className="stat-card blue"><div className="stat-label">Total Gross</div><div className="stat-value blue">${totalGross.toLocaleString()}</div><div className="stat-sub">June 2025</div><DollarSign size={20} className="stat-icon"/></div>
        <div className="stat-card orange"><div className="stat-label">Employer CPF</div><div className="stat-value orange">${totalCPF.toLocaleString()}</div><div className="stat-sub">17% of capped wages</div></div>
        <div className="stat-card green"><div className="stat-label">Total Cost</div><div className="stat-value green">${(totalGross+totalCPF).toLocaleString()}</div><div className="stat-sub">Gross + employer CPF</div></div>
        <div className="stat-card purple"><div className="stat-label">On Payroll</div><div className="stat-value purple">{employees.length}</div><div className="stat-sub">All CPF eligible</div></div>
      </div>

      <div className="card-grid-2" style={{marginBottom:20}}>
        <div className="card" style={{marginBottom:0}}>
          <div className="card-header"><div className="card-title">Monthly Payroll (2025)</div></div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={payrollData}>
              <XAxis dataKey="month" tick={{fill:'#475569',fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#475569',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`$${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="totalPayout" radius={[6,6,0,0]}>
                {payrollData.map((e,i)=><Cell key={i} fill={e.month==='Jun'?'#38bdf8':'#1e3a5f'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{marginBottom:0}}>
          <div className="card-header"><div className="card-title"><Calculator size={16} style={{display:'inline',marginRight:8}}/>CPF Calculator</div></div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Gross Salary (SGD)</label><input className="form-input" type="number" value={calcSalary} onChange={e=>setCalcSalary(e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Employee Age</label><input className="form-input" type="number" value={calcAge} onChange={e=>setCalcAge(e.target.value)}/></div>
          </div>
          {cpf.grossSalary>0&&(
            <div className="cpf-result">
              <div className="cpf-row"><span style={{color:'var(--text-2)'}}>Gross Salary</span><span>${cpf.grossSalary.toLocaleString()}</span></div>
              <div className="cpf-row"><span style={{color:'var(--text-2)'}}>Employee CPF ({(cpf.empRate*100).toFixed(0)}%)</span><span style={{color:'var(--danger)'}}>-${cpf.employeeContrib.toLocaleString()}</span></div>
              <div className="cpf-row"><span style={{color:'var(--text-2)'}}>Employer CPF ({(cpf.erRate*100).toFixed(0)}%)</span><span style={{color:'var(--accent-warm)'}}>+${cpf.employerContrib.toLocaleString()}</span></div>
              <div className="cpf-row"><span>Net Take-Home</span><span>${cpf.netSalary.toLocaleString()}</span></div>
            </div>
          )}
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <div className="tabs">
          <button className={`tab ${tab==='payslips'?'active':''}`} onClick={()=>setTab('payslips')}>Payslips</button>
          <button className={`tab ${tab==='summary'?'active':''}`} onClick={()=>setTab('summary')}>Summary</button>
        </div>
        <button className="btn btn-outline" onClick={exportCSV}><Download size={14}/> Export CSV</button>
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Gross</th><th>Emp. CPF (20%)</th><th>Employer CPF (17%)</th><th>Total CPF</th><th>Net Salary</th><th>Status</th></tr></thead>
            <tbody>
              {employees.map(emp=>{
                const c = calcCPF(emp.salary);
                return (
                  <tr key={emp.id}>
                    <td><div className="emp-info"><div className="emp-avatar">{emp.avatar}</div><div><div className="emp-name">{emp.name}</div><div className="emp-role">{emp.role}</div></div></div></td>
                    <td style={{fontFamily:'var(--font-display)',fontWeight:600}}>${c.grossSalary.toLocaleString()}</td>
                    <td style={{color:'var(--danger)'}}>-${c.employeeContrib.toLocaleString()}</td>
                    <td style={{color:'var(--accent-warm)'}}>+${c.employerContrib.toLocaleString()}</td>
                    <td>${c.totalCPF.toLocaleString()}</td>
                    <td style={{color:'var(--accent3)',fontWeight:600,fontFamily:'var(--font-display)'}}>${c.netSalary.toLocaleString()}</td>
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