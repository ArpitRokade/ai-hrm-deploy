// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

admin.initializeApp();
const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ========== MIDDLEWARE: Verify Firebase Auth Token ==========
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Apply authentication to all API routes
app.use('/api/*', authenticate);

// ========== HELPER: Get all documents from a collection ==========
async function getCollection(name) {
  const snapshot = await db.collection(name).get();
  return snapshot.docs.map(doc => ({ id: parseInt(doc.id) || doc.id, ...doc.data() }));
}

// ========== EMPLOYEES ENDPOINTS ==========
app.get('/api/employees', async (req, res) => {
  const employees = await getCollection('employees');
  res.json(employees);
});

app.post('/api/employees', async (req, res) => {
  const employees = await getCollection('employees');
  const newId = employees.length ? Math.max(...employees.map(e => e.id || 0)) + 1 : 1;
  const newEmp = { ...req.body, id: newId, joined: req.body.joined || new Date().toISOString().split('T')[0] };
  await db.collection('employees').doc(String(newId)).set(newEmp);
  res.status(201).json(newEmp);
});

// ========== GENERIC CRUD FOR WRITABLE RESOURCES ==========
const writable = ['employees', 'leaves', 'attendance', 'expenses', 'recruitment', 'resumes', 'performance'];

app.post('/api/:resource', async (req, res) => {
  const { resource } = req.params;
  if (!writable.includes(resource)) return res.status(404).json({ error: 'Resource not writable' });
  const items = await getCollection(resource);
  const newId = items.length ? Math.max(...items.map(x => x.id || 0)) + 1 : 1;
  const newItem = { ...req.body, id: newId };
  await db.collection(resource).doc(String(newId)).set(newItem);
  res.status(201).json(newItem);
});

app.put('/api/:resource/:id', async (req, res) => {
  const { resource, id } = req.params;
  if (!writable.includes(resource)) return res.status(404).json({ error: 'Resource not writable' });
  const docRef = db.collection(resource).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  await docRef.update(req.body);
  const updated = (await docRef.get()).data();
  res.json(updated);
});

app.delete('/api/:resource/:id', async (req, res) => {
  const { resource, id } = req.params;
  if (!writable.includes(resource)) return res.status(404).json({ error: 'Resource not writable' });
  const docRef = db.collection(resource).doc(id);
  const doc = await docRef.get();
  if (!doc.exists) return res.status(404).json({ error: 'Not found' });
  await docRef.delete();
  res.json(doc.data());
});

// ========== SIMPLE GET ENDPOINTS ==========
const simpleLists = ['leaves', 'payroll', 'expenses', 'departments', 'announcements', 'resumes', 'attendance', 'recruitment', 'performance', 'chatbot'];
simpleLists.forEach(name => {
  app.get(`/api/${name}`, async (req, res) => {
    const data = await getCollection(name);
    res.json(data);
  });
});

// ========== GEMINI AI CHATBOT ENDPOINT ==========
app.post('/api/chatbot/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing question' });

  try {
    // Get real-time data from Firestore to give context to AI
    const leaves = await getCollection('leaves');
    const employees = await getCollection('employees');
    const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
    const totalEmployees = employees.length;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are HRBot, an AI HR assistant for AMBE AI TECHNOLOGIES Pte Ltd (Singapore).
    
Current live data:
- Total employees: ${totalEmployees}
- Pending leave requests: ${pendingLeaves}

Answer the following HR question concisely and helpfully. Use Singapore HR practices where relevant.
If asked about specific data not in the context, say you need to check the system.
Be friendly and professional.

Question: ${question}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    res.json({ reply });
  } catch (err) {
    console.error('Gemini error:', err);
    res.status(500).json({ error: 'AI service temporarily unavailable' });
  }
});

// ========== HEALTH CHECK ==========
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========== EXPORT THE FUNCTION ==========
exports.api = functions.https.onRequest(app);