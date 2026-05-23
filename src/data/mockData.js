// ── EMPLOYEES ──────────────────────────────────────────────────────────────
export const employees = [
  { id: 1, name: "Arjun Mehta",       role: "Senior Developer",    dept: "Engineering",     salary: 8500, status: "Active",   avatar: "AM", joined: "2021-03-15", email: "arjun@ambe.ai",    phone: "+65 9123 4567", cpf: true },
  { id: 2, name: "Priya Rajan",       role: "HR Manager",          dept: "Human Resources", salary: 7200, status: "Active",   avatar: "PR", joined: "2020-07-01", email: "priya@ambe.ai",    phone: "+65 9234 5678", cpf: true },
  { id: 3, name: "Wei Liang Tan",     role: "Data Analyst",        dept: "Analytics",       salary: 6800, status: "Active",   avatar: "WT", joined: "2022-01-10", email: "weiliang@ambe.ai", phone: "+65 9345 6789", cpf: true },
  { id: 4, name: "Fatimah Binte Yusof", role: "UI/UX Designer",   dept: "Design",          salary: 6200, status: "Active",   avatar: "FY", joined: "2022-06-20", email: "fatimah@ambe.ai",  phone: "+65 9456 7890", cpf: true },
  { id: 5, name: "Samuel Chia",       role: "DevOps Engineer",     dept: "Engineering",     salary: 9000, status: "Active",   avatar: "SC", joined: "2019-11-05", email: "samuel@ambe.ai",   phone: "+65 9567 8901", cpf: true },
  { id: 6, name: "Mei Lin Chen",      role: "Product Manager",     dept: "Product",         salary: 9500, status: "On Leave", avatar: "MC", joined: "2020-02-14", email: "meiling@ambe.ai",  phone: "+65 9678 9012", cpf: true },
  { id: 7, name: "Rajesh Kumar",      role: "Backend Developer",   dept: "Engineering",     salary: 7800, status: "Active",   avatar: "RK", joined: "2021-09-01", email: "rajesh@ambe.ai",   phone: "+65 9789 0123", cpf: true },
  { id: 8, name: "Lena Tan",          role: "Marketing Executive", dept: "Marketing",       salary: 5800, status: "Active",   avatar: "LT", joined: "2023-01-15", email: "lena@ambe.ai",     phone: "+65 9890 1234", cpf: true },
  // Additional employees for richer data
  { id: 9, name: "Vikram Singh",      role: "Frontend Developer",  dept: "Engineering",     salary: 7000, status: "Active",   avatar: "VS", joined: "2023-03-01", email: "vikram@ambe.ai",   phone: "+65 9001 2345", cpf: true },
  { id: 10, name: "Sophia Wong",      role: "QA Engineer",         dept: "Engineering",     salary: 6500, status: "Active",   avatar: "SW", joined: "2023-05-10", email: "sophia@ambe.ai",   phone: "+65 9112 3456", cpf: true },
  { id: 11, name: "Ramesh Iyer",      role: "Finance Manager",     dept: "Finance",         salary: 8800, status: "Active",   avatar: "RI", joined: "2021-08-20", email: "ramesh@ambe.ai",   phone: "+65 9223 4567", cpf: true },
  { id: 12, name: "Clara Lim",        role: "Sales Director",      dept: "Sales",           salary: 10200, status: "Active",  avatar: "CL", joined: "2020-11-11", email: "clara@ambe.ai",    phone: "+65 9334 5678", cpf: true },
  { id: 13, name: "Zainal Abidin",    role: "IT Support",          dept: "Engineering",     salary: 5500, status: "Active",   avatar: "ZA", joined: "2023-07-04", email: "zainal@ambe.ai",   phone: "+65 9445 6789", cpf: true },
  { id: 14, name: "Nurul Huda",       role: "Recruitment",         dept: "Human Resources", salary: 6000, status: "Active",   avatar: "NH", joined: "2022-09-18", email: "nurul@ambe.ai",    phone: "+65 9556 7890", cpf: true },
  { id: 15, name: "Ethan Lee",        role: "Data Engineer",       dept: "Analytics",       salary: 7300, status: "Active",   avatar: "EL", joined: "2023-02-27", email: "ethan@ambe.ai",    phone: "+65 9667 8901", cpf: true },
];

// ── LEAVE REQUESTS (more entries, spread over 2025) ─────────────────────────
export const leaveRequests = [
  { id: 1, empId: 1, empName: "Arjun Mehta",          type: "Annual",    from: "2025-01-15", to: "2025-01-17", days: 3, status: "Approved", reason: "Family vacation" },
  { id: 2, empId: 3, empName: "Wei Liang Tan",         type: "Medical",   from: "2025-02-05", to: "2025-02-05", days: 1, status: "Approved", reason: "Doctor appointment" },
  { id: 3, empId: 6, empName: "Mei Lin Chen",          type: "Annual",    from: "2025-03-01", to: "2025-03-07", days: 5, status: "Approved", reason: "Holiday trip" },
  { id: 4, empId: 4, empName: "Fatimah Binte Yusof",   type: "Childcare", from: "2025-04-10", to: "2025-04-10", days: 1, status: "Approved", reason: "Child school event" },
  { id: 5, empId: 7, empName: "Rajesh Kumar",          type: "Annual",    from: "2025-05-20", to: "2025-05-22", days: 3, status: "Approved", reason: "Personal" },
  { id: 6, empId: 8, empName: "Lena Tan",              type: "Medical",   from: "2025-05-03", to: "2025-05-04", days: 2, status: "Rejected", reason: "Unwell" },
  { id: 7, empId: 2, empName: "Priya Rajan",           type: "Annual",    from: "2025-06-10", to: "2025-06-12", days: 3, status: "Pending",  reason: "Wedding leave" },
  { id: 8, empId: 5, empName: "Samuel Chia",           type: "Medical",   from: "2025-06-15", to: "2025-06-16", days: 2, status: "Approved", reason: "Sick leave" },
  { id: 9, empId: 9, empName: "Vikram Singh",          type: "Annual",    from: "2025-06-20", to: "2025-06-24", days: 5, status: "Pending",  reason: "Travel abroad" },
  { id: 10, empId: 10, empName: "Sophia Wong",         type: "Unpaid",    from: "2025-07-01", to: "2025-07-03", days: 3, status: "Approved", reason: "Personal" },
  { id: 11, empId: 11, empName: "Ramesh Iyer",         type: "Annual",    from: "2025-07-10", to: "2025-07-14", days: 5, status: "Approved", reason: "Family reunion" },
  { id: 12, empId: 12, empName: "Clara Lim",           type: "Medical",   from: "2025-07-15", to: "2025-07-16", days: 2, status: "Pending",  reason: "Check-up" },
  { id: 13, empId: 13, empName: "Zainal Abidin",       type: "Childcare", from: "2025-08-01", to: "2025-08-01", days: 1, status: "Approved", reason: "Parent-teacher meeting" },
  { id: 14, empId: 14, empName: "Nurul Huda",          type: "Annual",    from: "2025-08-05", to: "2025-08-09", days: 5, status: "Approved", reason: "Holiday" },
  { id: 15, empId: 15, empName: "Ethan Lee",           type: "Medical",   from: "2025-08-12", to: "2025-08-12", days: 1, status: "Pending",  reason: "Dental appointment" },
];

// ── PAYROLL (expanded months, with realistic increments) ────────────────────
export const payrollData = [
  { month: "Jan", totalPayout: 165400, employees: 8 },
  { month: "Feb", totalPayout: 166200, employees: 8 },
  { month: "Mar", totalPayout: 168200, employees: 9 },
  { month: "Apr", totalPayout: 175400, employees: 10 },
  { month: "May", totalPayout: 182800, employees: 12 },
  { month: "Jun", totalPayout: 188500, employees: 13 },
  { month: "Jul", totalPayout: 194200, employees: 14 },
  { month: "Aug", totalPayout: 198000, employees: 15 },
];

// ── EXPENSE CLAIMS (more items, more categories) ────────────────────────────
export const expenseClaims = [
  { id: 1, empId: 2, empName: "Priya Rajan",   category: "Transport", amount: 45.60,  date: "2025-05-02", status: "Approved", desc: "Grab to client site" },
  { id: 2, empId: 5, empName: "Samuel Chia",    category: "Equipment", amount: 320.00, date: "2025-05-03", status: "Approved", desc: "USB-C hub for WFH" },
  { id: 3, empId: 1, empName: "Arjun Mehta",    category: "Meals",     amount: 78.40,  date: "2025-05-04", status: "Approved", desc: "Team lunch meeting" },
  { id: 4, empId: 3, empName: "Wei Liang Tan",  category: "Training",  amount: 550.00, date: "2025-05-05", status: "Approved", desc: "Python bootcamp fee" },
  { id: 5, empId: 7, empName: "Rajesh Kumar",   category: "Transport", amount: 32.80,  date: "2025-06-01", status: "Approved", desc: "MRT travel claims" },
  { id: 6, empId: 8, empName: "Lena Tan",       category: "Meals",     amount: 22.00,  date: "2025-06-02", status: "Rejected", desc: "Personal dinner" },
  { id: 7, empId: 9, empName: "Vikram Singh",   category: "Equipment", amount: 129.99, date: "2025-06-03", status: "Pending",  desc: "Mechanical keyboard" },
  { id: 8, empId: 10, empName: "Sophia Wong",   category: "Transport", amount: 18.50,  date: "2025-06-04", status: "Approved", desc: "Taxi to airport" },
  { id: 9, empId: 11, empName: "Ramesh Iyer",   category: "Meals",     amount: 95.20,  date: "2025-06-05", status: "Pending",  desc: "Client dinner" },
  { id: 10, empId: 12, empName: "Clara Lim",    category: "Entertainment", amount: 230.00, date: "2025-06-06", status: "Approved", desc: "Team outing" },
  { id: 11, empId: 13, empName: "Zainal Abidin", category: "Training",  amount: 75.00,  date: "2025-06-07", status: "Pending",  desc: "Online course" },
  { id: 12, empId: 14, empName: "Nurul Huda",   category: "Transport", amount: 42.30,  date: "2025-06-08", status: "Approved", desc: "Grab to interview venue" },
];

// ── DEPARTMENTS (updated headcount to match new employees) ───────────────────
export const departments = [
  { name: "Engineering",     headcount: 7, budget: 580000, color: "#6366f1" },
  { name: "Human Resources", headcount: 2, budget: 150000, color: "#22d3ee" },
  { name: "Analytics",       headcount: 2, budget: 160000, color: "#f472b6" },
  { name: "Design",          headcount: 1, budget: 90000,  color: "#34d399" },
  { name: "Product",         headcount: 1, budget: 140000, color: "#fb923c" },
  { name: "Marketing",       headcount: 1, budget: 80000,  color: "#a78bfa" },
  { name: "Finance",         headcount: 1, budget: 130000, color: "#f97316" },
  { name: "Sales",           headcount: 1, budget: 160000, color: "#14b8a6" },
];

// ── ANNOUNCEMENTS (more items) ──────────────────────────────────────────────
export const announcements = [
  { id: 1, title: "Q3 Performance Reviews Starting", date: "2025-06-10", priority: "high",   body: "Annual performance reviews for Q3 will commence on 16 June. Please prepare self-assessment forms." },
  { id: 2, title: "New CPF Contribution Rates 2025", date: "2025-06-05", priority: "high",   body: "Updated CPF rates effective 1 July 2025. Finance team will brief all staff on 12 June." },
  { id: 3, title: "Team Building Event — 28 June",   date: "2025-06-01", priority: "medium", body: "Join us for a fun team building day at Sentosa! Details sent via email." },
  { id: 4, title: "Office Closure — Hari Raya Haji", date: "2025-05-28", priority: "low",    body: "The office will be closed on 7 June for Hari Raya Haji. Enjoy the long weekend!" },
  { id: 5, title: "New Hire Orientation — July 2025", date: "2025-06-15", priority: "medium", body: "Welcome our new colleagues! Orientation session on 3 July at 10am." },
  { id: 6, title: "Updated Work From Home Policy",   date: "2025-06-12", priority: "high",   body: "Please review the updated WFH guidelines on the intranet." },
];

// ── ATTENDANCE RECORDS (latest date, more entries) ───────────────────────────
export const attendanceRecords = [
  { id: 1, empId: 1, name: "Arjun Mehta", date: "2025-06-10", checkIn: "09:12", checkOut: "18:05", status: "Present" },
  { id: 2, empId: 2, name: "Priya Rajan", date: "2025-06-10", checkIn: "08:58", checkOut: "17:50", status: "Present" },
  { id: 3, empId: 3, name: "Wei Liang Tan", date: "2025-06-10", checkIn: "09:05", checkOut: "17:40", status: "Present" },
  { id: 4, empId: 4, name: "Fatimah Binte Yusof", date: "2025-06-10", checkIn: "09:30", checkOut: "18:10", status: "Late" },
  { id: 5, empId: 5, name: "Samuel Chia", date: "2025-06-10", checkIn: "09:00", checkOut: "18:00", status: "Present" },
  { id: 6, empId: 6, name: "Mei Lin Chen", date: "2025-06-10", checkIn: "-", checkOut: "-", status: "On Leave" },
  { id: 7, empId: 7, name: "Rajesh Kumar", date: "2025-06-10", checkIn: "09:05", checkOut: "18:02", status: "Present" },
  { id: 8, empId: 8, name: "Lena Tan", date: "2025-06-10", checkIn: "09:10", checkOut: "18:08", status: "Present" },
  { id: 9, empId: 9, name: "Vikram Singh", date: "2025-06-10", checkIn: "09:02", checkOut: "18:15", status: "Present" },
  { id: 10, empId: 10, name: "Sophia Wong", date: "2025-06-10", checkIn: "09:20", checkOut: "18:00", status: "Late" },
  { id: 11, empId: 11, name: "Ramesh Iyer", date: "2025-06-10", checkIn: "08:55", checkOut: "18:30", status: "Present" },
  { id: 12, empId: 12, name: "Clara Lim", date: "2025-06-10", checkIn: "09:08", checkOut: "19:00", status: "Present" },
  { id: 13, empId: 13, name: "Zainal Abidin", date: "2025-06-10", checkIn: "09:00", checkOut: "17:45", status: "Present" },
  { id: 14, empId: 14, name: "Nurul Huda", date: "2025-06-10", checkIn: "09:15", checkOut: "18:10", status: "Present" },
  { id: 15, empId: 15, name: "Ethan Lee", date: "2025-06-10", checkIn: "09:07", checkOut: "17:55", status: "Present" },
];

// ── RECRUITMENT ──────────────────────────────────────────────────────────────
export const recruitmentData = [
  { id: 1, role: "Frontend Developer", openPositions: 2, candidates: 12, stage: "Interviewing" },
  { id: 2, role: "Data Scientist", openPositions: 2, candidates: 9, stage: "Screening" },
  { id: 3, role: "HR Executive", openPositions: 1, candidates: 4, stage: "Offer" },
  { id: 4, role: "DevOps Engineer", openPositions: 1, candidates: 5, stage: "Shortlisting" },
  { id: 5, role: "Sales Manager", openPositions: 1, candidates: 6, stage: "Interviewing" },
  { id: 6, role: "QA Engineer", openPositions: 1, candidates: 3, stage: "Screening" },
];

// ── PERFORMANCE REVIEWS (more employees) ─────────────────────────────────────
export const performanceReviews = [
  { id: 1, empId: 1, name: "Arjun Mehta", rating: 4.7, review: "Exceeded delivery goals, strong team collaboration." },
  { id: 2, empId: 3, name: "Wei Liang Tan", rating: 4.3, review: "Data insights helped improve product performance." },
  { id: 3, empId: 4, name: "Fatimah Binte Yusof", rating: 4.1, review: "Great UX work with strong stakeholder feedback." },
  { id: 4, empId: 7, name: "Rajesh Kumar", rating: 4.5, review: "Solid backend delivery and architecture reviews." },
  { id: 5, empId: 8, name: "Lena Tan", rating: 4.0, review: "Marketing campaigns showed a strong ROI." },
  { id: 6, empId: 9, name: "Vikram Singh", rating: 4.2, review: "Clean frontend code, good React knowledge." },
  { id: 7, empId: 10, name: "Sophia Wong", rating: 3.9, review: "Good testing skills, needs more automation." },
  { id: 8, empId: 11, name: "Ramesh Iyer", rating: 4.6, review: "Excellent financial control and reporting." },
  { id: 9, empId: 12, name: "Clara Lim", rating: 4.8, review: "Sales targets exceeded; great leadership." },
  { id: 10, empId: 13, name: "Zainal Abidin", rating: 4.2, review: "Reliable IT support, improved response times." },
  { id: 11, empId: 14, name: "Nurul Huda", rating: 4.4, review: "Great at sourcing and employer branding." },
  { id: 12, empId: 15, name: "Ethan Lee", rating: 4.0, review: "Solid data pipelines and ETL processes." },
];

// ── RESUMES (more candidates) ────────────────────────────────────────────────
export const resumes = [
  { id: 1, name: "Sofia Lim", appliedFor: "Frontend Developer", skills: ["React","TypeScript","Figma"], experience: 4, score: 88, status: "Shortlisted", notes: "Strong UI experience and good component design." },
  { id: 2, name: "Daniel Ooi", appliedFor: "Data Scientist", skills: ["Python","Machine Learning","SQL"], experience: 3, score: 82, status: "Interview", notes: "Good analytics background with model deployment exposure." },
  { id: 3, name: "Nadia Hassan", appliedFor: "HR Executive", skills: ["Recruitment","Employee Relations","HRIS"], experience: 5, score: 90, status: "Offer", notes: "Excellent people skills and process knowledge." },
  { id: 4, name: "Kevin Tan", appliedFor: "DevOps Engineer", skills: ["AWS","Docker","CI/CD"], experience: 4, score: 85, status: "Shortlisted", notes: "Strong automation and infrastructure experience." },
  { id: 5, name: "Michelle Goh", appliedFor: "Frontend Developer", skills: ["Vue","JavaScript","Tailwind"], experience: 3, score: 80, status: "Review", notes: "Good Vue.js knowledge, willing to learn React." },
  { id: 6, name: "Omar Farouk", appliedFor: "Data Scientist", skills: ["R","Statistics","Power BI"], experience: 2, score: 75, status: "Review", notes: "Academic background, needs industry experience." },
  { id: 7, name: "Siti Aishah", appliedFor: "Sales Manager", skills: ["B2B Sales","CRM","Negotiation"], experience: 6, score: 88, status: "Shortlisted", notes: "Consistently exceeded quotas." },
];

// ── CPF CALCULATION (unchanged) ──────────────────────────────────────────────
export function calcCPF(grossSalary, age = 30) {
  let empRate, erRate;
  if (age <= 55)      { empRate = 0.20; erRate = 0.17; }
  else if (age <= 60) { empRate = 0.13; erRate = 0.13; }
  else if (age <= 65) { empRate = 0.075; erRate = 0.09; }
  else                { empRate = 0.05;  erRate = 0.075; }

  const cpfCeiling = 6800;
  const base = Math.min(grossSalary, cpfCeiling);
  const employeeContrib = Math.round(base * empRate);
  const employerContrib = Math.round(base * erRate);
  const netSalary = grossSalary - employeeContrib;
  const totalCPF = employeeContrib + employerContrib;

  return { grossSalary, employeeContrib, employerContrib, netSalary, totalCPF, empRate, erRate };
}