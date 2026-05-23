import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Expenses from './pages/Expenses';
import Attendance from './pages/Attendance';
import Recruitment from './pages/Recruitment';
import Performance from './pages/Performance';
import Resumes from './pages/Resumes';
import Chatbot from './pages/Chatbot';
import {
  LayoutDashboard, Users, CalendarDays, DollarSign,
  Receipt, Bot, LogOut, Bell, Search, CalendarCheck,
  Briefcase, TrendingUp, FileSearch, ChevronDown
} from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',        icon: LayoutDashboard, section: 'MAIN' },
  { id: 'employees', label: 'Employees',         icon: Users,           section: 'MAIN' },
  { id: 'attendance', label: 'Attendance',      icon: CalendarCheck,  section: 'MAIN' },
  { id: 'leaves',    label: 'Leave Management',  icon: CalendarDays,    section: 'MAIN',    badge: 2 },
  { id: 'payroll',   label: 'Payroll',           icon: DollarSign,      section: 'FINANCE' },
  { id: 'expenses',  label: 'Expense Claims',    icon: Receipt,         section: 'FINANCE', badge: 2 },
  { id: 'recruitment', label: 'Recruitment',      icon: Briefcase,       section: 'PEOPLE' },
  { id: 'performance', label: 'Performance',      icon: TrendingUp,      section: 'PEOPLE' },
  { id: 'resumes',    label: 'Resume Screening',  icon: FileSearch,      section: 'AI' },
  { id: 'chatbot',   label: 'AI Assistant',      icon: Bot,             section: 'AI' },
];

const PAGE_TITLES = {
  dashboard: 'Dashboard', employees: 'Employees', attendance: 'Attendance Management',
  leaves: 'Leave Management', payroll: 'Payroll', expenses: 'Expense Claims',
  recruitment: 'Recruitment System', performance: 'Performance Analysis', resumes: 'AI Resume Screening',
  chatbot: 'AI Assistant',
};

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoggedIn(true);
      } else {
        setUser(null);
        setLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setLoggedIn(false);
    setShowUserMenu(false);
  };

  if (!loggedIn) return <Login onLogin={() => {}} />;

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  const sections = [...new Set(NAV.map(n => n.section))];

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'employees': return <Employees />;
      case 'attendance': return <Attendance />;
      case 'leaves':    return <Leaves />;
      case 'payroll':   return <Payroll />;
      case 'expenses':  return <Expenses />;
      case 'recruitment': return <Recruitment />;
      case 'performance': return <Performance />;
      case 'resumes': return <Resumes />;
      case 'chatbot':   return <Chatbot />;
      default:          return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">
              <span style={{ fontSize: 20, fontWeight: 800 }}>AI</span>
            </div>
            <div>
              <div className="logo-text">AI<span>-HRM</span></div>
              <div className="logo-sub">AMBE AI TECHNOLOGIES</div>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section}>
              <div className="nav-section-label">{section}</div>
              {NAV.filter(n => n.section === section).map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => setPage(item.id)}>
                    <Icon size={18} className="nav-icon" />
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
        {/* Sidebar footer now only contains logout (optional) – no user card */}
        <div className="sidebar-footer">
          <div className="nav-item" style={{ color: 'var(--danger)' }} onClick={handleLogout}>
            <LogOut size={16} /><span>Sign Out</span>
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbar-title">{PAGE_TITLES[page]}</div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search size={14} color="var(--text-3)" />
              <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="icon-btn"><Bell size={16} /></div>
            
            {/* User Avatar with Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  background: 'var(--bg-card)',
                  padding: '5px 12px 5px 8px',
                  borderRadius: 30,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
                  fontWeight: 700, fontSize: 14, color: '#fff'
                }}>
                  {userInitial}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{displayName}</span>
                <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />
              </div>
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--bg-card2)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '8px 0',
                  minWidth: 160,
                  zIndex: 100,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{displayName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{user?.email}</div>
                  </div>
                  <div className="nav-item" style={{ margin: '4px 8px' }} onClick={handleLogout}>
                    <LogOut size={14} /><span>Sign Out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {renderPage()}
      </main>
    </div>
  );
}