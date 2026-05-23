const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// ========== GEMINI AI SETUP ==========
const GEMINI_API_KEY = "AIzaSyDdvi1nFN9U_KBFDDdLWRxn9JXXPugv4is";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use a model that we know works from the list
const MODEL_NAME = 'gemini-2.5-flash';
let aiModel = null;

async function initAI() {
  try {
    aiModel = genAI.getGenerativeModel({ model: MODEL_NAME });
    // Test the model
    await aiModel.generateContent('test');
    console.log(`✅ Gemini AI ready (model: ${MODEL_NAME})`);
  } catch (err) {
    console.warn(`⚠️ Failed to init ${MODEL_NAME}:`, err.message);
    aiModel = null;
  }
}
initAI();

// ========== DATA FOLDER ==========
const dataDir = path.join(__dirname, 'data');
function readJSON(name) {
  const p = path.join(dataDir, name);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJSON(name, obj) {
  const p = path.join(dataDir, name);
  fs.writeFileSync(p, JSON.stringify(obj, null, 2), 'utf8');
}

// ========== REST ENDPOINTS (unchanged) ==========
app.get('/api/employees', (req, res) => {
  const data = readJSON('employees.json') || [];
  res.json(data);
});
app.post('/api/employees', (req, res) => {
  const employees = readJSON('employees.json') || [];
  const newEmp = req.body;
  newEmp.id = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
  newEmp.joined = newEmp.joined || new Date().toISOString().split('T')[0];
  employees.push(newEmp);
  writeJSON('employees.json', employees);
  res.status(201).json(newEmp);
});
const writable = new Set(['employees', 'leaves', 'attendance', 'expenses', 'recruitment', 'resumes', 'performance']);
app.post('/api/:resource', (req, res) => {
  const { resource } = req.params;
  if (!writable.has(resource)) return res.status(404).json({ error: 'Resource not writable' });
  const arr = readJSON(`${resource}.json`) || [];
  const item = req.body;
  item.id = arr.length ? Math.max(...arr.map(x => x.id || 0)) + 1 : 1;
  arr.push(item);
  writeJSON(`${resource}.json`, arr);
  res.status(201).json(item);
});
app.put('/api/:resource/:id', (req, res) => {
  const { resource, id } = req.params;
  if (!writable.has(resource)) return res.status(404).json({ error: 'Resource not writable' });
  const arr = readJSON(`${resource}.json`) || [];
  const idx = arr.findIndex(x => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  arr[idx] = { ...arr[idx], ...req.body };
  writeJSON(`${resource}.json`, arr);
  res.json(arr[idx]);
});
app.delete('/api/:resource/:id', (req, res) => {
  const { resource, id } = req.params;
  if (!writable.has(resource)) return res.status(404).json({ error: 'Resource not writable' });
  const arr = readJSON(`${resource}.json`) || [];
  const idx = arr.findIndex(x => String(x.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = arr.splice(idx, 1)[0];
  writeJSON(`${resource}.json`, arr);
  res.json(removed);
});
const simpleLists = ['leaves', 'payroll', 'expenses', 'departments', 'announcements', 'resumes', 'attendance', 'recruitment', 'performance', 'chatbot'];
simpleLists.forEach(name => {
  app.get(`/api/${name}`, (req, res) => {
    const data = readJSON(`${name}.json`);
    res.json(data === null ? [] : data);
  });
});

// ========== CHATBOT (AI + fallback) ==========
app.post('/api/chatbot/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  if (aiModel) {
    try {
      const prompt = `You are HRBot, an AI HR assistant for AMBE AI TECHNOLOGIES (Singapore). 
Answer the following HR question concisely and helpfully. Use Singapore HR practices.
Question: ${question}`;
      const result = await aiModel.generateContent(prompt);
      const reply = result.response.text();
      return res.json({ reply });
    } catch (err) {
      console.error('Chatbot AI error:', err.message);
    }
  }
  // Fallback
  const employees = readJSON('employees.json') || [];
  const leaves = readJSON('leaves.json') || [];
  const reply = `I have ${employees.length} employees and ${leaves.filter(l => l.status === 'Pending').length} pending leaves. Ask me about HR policies.`;
  res.json({ reply });
});

// ========== RESUME SCREENING (AI + fallback) ==========
app.post('/api/analyzer/analyze', async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: 'Missing resumeText or jobDescription' });
  }

  if (aiModel) {
    try {
      const prompt = `You are an expert HR screener. Analyze this resume against the job description.
Return **only** a valid JSON object with keys: "keyStrengths" (array of strings), "gaps" (array of strings), "score" (integer 0-100), "recommendation" (one of: "Strong Hire", "Interview", "Maybe", "Reject").
Job Description: ${jobDescription}
Resume Text: ${resumeText.substring(0, 3000)}`;
      const result = await aiModel.generateContent(prompt);
      let raw = result.response.text();
      // Clean up markdown code fences
      raw = raw.replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
      const parsed = JSON.parse(raw);
      // Validate structure
      if (!parsed.keyStrengths || !parsed.gaps || typeof parsed.score !== 'number') {
        throw new Error('Invalid JSON structure');
      }
      return res.json(parsed);
    } catch (err) {
      console.error('Resume AI error, using fallback:', err.message);
    }
  }

  // ---------- FALLBACK: keyword-based ----------
  const text = (resumeText + ' ' + jobDescription).toLowerCase();
  const keywords = { python:10, react:10, javascript:8, aws:8, lead:7, cloud:6, docker:6, phd:8 };
  let score = 50;
  let matched = [];
  for (const [kw, pts] of Object.entries(keywords)) {
    if (text.includes(kw)) { score += pts; matched.push(kw); }
  }
  score = Math.min(100, score);
  const strengths = matched.slice(0,3).length ? matched.slice(0,3) : ["Relevant experience appears"];
  const gaps = [];
  if (!text.includes('lead')) gaps.push("Leadership experience not evident");
  if (!text.includes('cloud')) gaps.push("Cloud skills missing");
  let recommendation = 'Maybe';
  if (score >= 85) recommendation = 'Strong Hire';
  else if (score >= 70) recommendation = 'Interview';
  else if (score >= 50) recommendation = 'Maybe';
  else recommendation = 'Reject';
  res.json({ keyStrengths: strengths, gaps, score, recommendation });
});

// ========== DIAGNOSTIC (optional) ==========
app.get('/api/list-models', async (req, res) => {
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`);
    const data = await r.json();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));