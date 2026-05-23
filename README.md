# AI HRM - Local JSON Backend

This workspace contains a React frontend and a small Express server that uses JSON files as a lightweight backend datastore.

Quick start:

1. Install frontend deps and run React app:

```bash
cd c:\Users\HP\OneDrive\Desktop\ai-hrm
npm install
npm start
```

2. Install and run the server (in a separate terminal):

```bash
cd c:\Users\HP\OneDrive\Desktop\ai-hrm\server
npm install
npm run dev
```

The frontend is configured to proxy `/api` to `http://localhost:5000` during development.

What I added:
- `server/` Express server with endpoints that read/write JSON files in `server/data/`.
- JSON datasets for employees, leaves, payroll, expenses, departments, announcements, and empty stores for resumes, attendance, recruitment, performance, and chatbot.
- `src/pages/Employees.jsx` now fetches `/api/employees` and posts new employees to the server.

Next steps I can take if you want:
- Wire remaining pages (`Leaves`, `Payroll`, `Chatbot`, etc.) to use the API.
- Add POST/PUT/DELETE endpoints for other resources.
- Implement a simple AI resume-screening mock and recruitment flows.

```
ai-hrm
├─ build
│  ├─ asset-manifest.json
│  ├─ index.html
│  └─ static
│     ├─ css
│     │  ├─ main.abbbb2a4.css
│     │  └─ main.abbbb2a4.css.map
│     └─ js
│        ├─ main.86ef1b0e.js
│        ├─ main.86ef1b0e.js.LICENSE.txt
│        └─ main.86ef1b0e.js.map
├─ package-lock.json
├─ package.json
├─ public
│  └─ index.html
├─ README.md
├─ run-dev.bat
├─ run-prod.bat
├─ server
│  ├─ data
│  │  ├─ announcements.json
│  │  ├─ attendance.json
│  │  ├─ chatbot.json
│  │  ├─ departments.json
│  │  ├─ employees.json
│  │  ├─ expenses.json
│  │  ├─ leaves.json
│  │  ├─ payroll.json
│  │  ├─ performance.json
│  │  ├─ recruitment.json
│  │  └─ resumes.json
│  ├─ index.js
│  ├─ package-lock.json
│  └─ package.json
└─ src
   ├─ App.css
   ├─ App.js
   ├─ data
   │  └─ mockData.js
   ├─ index.js
   ├─ package.json
   └─ pages
      ├─ Attendance.jsx
      ├─ Chatbot.jsx
      ├─ Dashboard.jsx
      ├─ Employees.jsx
      ├─ Expenses.jsx
      ├─ Leaves.jsx
      ├─ Login.jsx
      ├─ Payroll.jsx
      ├─ Performance.jsx
      ├─ Recruitment.jsx
      └─ Resumes.jsx

```