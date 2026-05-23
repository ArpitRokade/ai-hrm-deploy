const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ========== SERVE REACT BUILD (for production) ==========
const buildPath = path.join(__dirname, '../build');
const isProduction = fs.existsSync(buildPath);

if (isProduction) {
  app.use(express.static(buildPath));
  console.log('✅ Serving React build from:', buildPath);
}

// ========== LOAD API KEYS FROM ENVIRONMENT ==========
// Format in .env: GEMINI_API_KEYS=key1,key2,key3
const API_KEYS = process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()) : [];
if (API_KEYS.length === 0) {
  console.warn('⚠️ No API keys provided. Set GEMINI_API_KEYS in .env. Falling back to keyword analysis only.');
}

let currentKeyIndex = 0;
let aiModel = null;
const MODEL_NAME = 'gemini-2.5-flash'; // Use a stable model from your list

// Helper to create a new GenAI client with a given key
function createGenAI(key) {
  return new GoogleGenerativeAI(key);
}

// Initialize AI with the first working key
async function initAI() {
  if (API_KEYS.length === 0) return;
  for (let i = 0; i < API_KEYS.length; i++) {
    const key = API_KEYS[i];
    try {
      const client = createGenAI(key);
      const model = client.getGenerativeModel({ model: MODEL_NAME });
      await model.generateContent('test');
      // Success – keep this client/model
      aiModel = model;
      currentKeyIndex = (i + 1) % API_KEYS.length; // start next request from next key
      console.log(`✅ Gemini AI ready with key ${i+1} (model: ${MODEL_NAME})`);
      return;
    } catch (err) {
      console.warn(`❌ Key ${i+1} failed:`, err.message);
    }
  }
  console.warn('⚠️ No working Gemini key found – AI will fallback to keyword analysis');
}
initAI();

// Function to call Gemini with automatic key rotation on failure
async function callWithKeyRotation(generateFunc) {
  if (!aiModel || API_KEYS.length === 0) {
    throw new Error('No AI model available');
  }
  let lastError = null;
  const startIndex = currentKeyIndex;
  for (let attempt = 0; attempt < API_KEYS.length; attempt++) {
    const key = API_KEYS[currentKeyIndex];
    const client = createGenAI(key);
    const model = client.getGenerativeModel({ model: MODEL_NAME });
    try {
      const result = await generateFunc(model);
      // Success: move to next key for next request (round‑robin load balancing)
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      return result;
    } catch (err) {
      console.error(`Key ${currentKeyIndex+1} failed:`, err.message);
      lastError = err;
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    }
  }
  throw lastError || new Error('All API keys exhausted');
}

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

// ========== REST ENDPOINTS (your original CRUD) ==========
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

// ========== CHATBOT (AI with rotation + fallback) ==========
app.post('/api/chatbot/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  // Try AI with key rotation
  if (aiModel) {
    try {
      const result = await callWithKeyRotation(async (model) => {
        const prompt = `You are HRBot, an AI HR assistant for AMBE AI TECHNOLOGIES (Singapore). 
Answer the following HR question concisely and helpfully. Use Singapore HR practices.
Question: ${question}`;
        return await model.generateContent(prompt);
      });
      const reply = result.response.text();
      return res.json({ reply });
    } catch (err) {
      console.error('All keys failed for chatbot:', err.message);
      // fall through to fallback
    }
  }

  // Fallback: answer from local JSON data
  const employees = readJSON('employees.json') || [];
  const leaves = readJSON('leaves.json') || [];
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  let reply = `I have ${employees.length} employees and ${pendingLeaves} pending leaves. `;
  const query = question.toLowerCase();
  if (query.includes('cpf')) {
    reply += "Singapore CPF: employee 20%, employer 17% (≤55).";
  } else if (query.includes('payroll')) {
    const total = employees.reduce((s, e) => s + (e.salary || 0), 0);
    reply += `Monthly payroll: SGD ${total.toLocaleString()}.`;
  } else {
    reply += "Ask me about employees, leaves, payroll, or CPF.";
  }
  res.json({ reply });
});

// ========== RESUME SCREENING (AI with rotation + fallback) ==========
app.post('/api/analyzer/analyze', async (req, res) => {
  const { resumeText, jobDescription } = req.body;
  if (!resumeText || !jobDescription) {
    return res.status(400).json({ error: 'Missing resumeText or jobDescription' });
  }

  if (aiModel) {
    try {
      const result = await callWithKeyRotation(async (model) => {
        const prompt = `You are an expert HR screener. Analyze this resume against the job description.
Return **only** a valid JSON object with keys: "keyStrengths" (array of strings), "gaps" (array of strings), "score" (integer 0-100), "recommendation" (one of: "Strong Hire", "Interview", "Maybe", "Reject").
Job Description: ${jobDescription}
Resume Text: ${resumeText.substring(0, 3000)}`;
        return await model.generateContent(prompt);
      });
      let raw = result.response.text();
      raw = raw.replace(/^```json\s*/i, '').replace(/```$/g, '').trim();
      const parsed = JSON.parse(raw);
      if (!parsed.keyStrengths || !parsed.gaps || typeof parsed.score !== 'number') {
        throw new Error('Invalid JSON structure');
      }
      return res.json(parsed);
    } catch (err) {
      console.error('All keys failed for resume screening:', err.message);
      // fall through to fallback
    }
  }

  // ---------- FALLBACK: keyword-based (always works) ----------
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
  if (API_KEYS.length === 0) return res.status(500).json({ error: 'No API keys configured' });
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEYS[0]}`);
    const data = await r.json();
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== CATCH-ALL: Serve React's index.html for non-API routes ==========
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  if (API_KEYS.length === 0) console.warn('⚠️ No Gemini API keys set. AI features will use fallback.');
});