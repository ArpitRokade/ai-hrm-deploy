import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Zap } from 'lucide-react';

const QUICK_PROMPTS = [
  "How many employees do we have?",
  "Who is on leave this week?",
  "What are Singapore CPF rates?",
  "Summarize pending approvals",
  "How many days annual leave?",
  "Show me payroll summary",
  "What is the notice period in Singapore?",
];

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm **HRBot** 👋, your AI-powered HR assistant for AMBE AI TECHNOLOGIES.\n\nI can answer questions about employees, leave, payroll, expenses, recruitment, Singapore HR policies, and more. What can I help you with today?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // Returned to your exact original UI formatting logic
  const formatMsg = text =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>');

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    
    // FIXED: Changed from loading(true) to the correct state setter function
    setLoading(true);

    try {
      // Call your Gemini-powered backend
      const response = await fetch('http://localhost:5000/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userText })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const reply = data.reply || "Sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'ai', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'ai', content: "⚠️ I'm having trouble connecting. Make sure your backend server is running on port 5000." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ padding: 0, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '24px 32px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#818cf8,#38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>HRBot AI Assistant</h1>
          <p style={{ color: 'var(--text-2)', fontSize: 13 }}>Powered by Google Gemini AI</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 99, padding: '4px 12px', fontSize: 12, color: 'var(--accent3)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent3)', animation: 'pulse 2s infinite' }} />Online
        </div>
      </div>

      <div style={{ padding: '10px 32px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => sendMessage(p)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 99, padding: '5px 14px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
            <Zap size={11} style={{ display: 'inline', marginRight: 5 }} />{p}
          </button>
        ))}
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="chat-avatar">
              {msg.role === 'ai' ? <Bot size={16} color="#fff" /> : <User size={16} color="var(--text-2)" />}
            </div>
            <div className="chat-bubble" dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }} />
          </div>
        ))}
        {loading && (
          <div className="chat-msg ai">
            <div className="chat-avatar"><Bot size={16} color="#fff" /></div>
            <div className="chat-bubble"><div className="typing-indicator"><div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" /></div></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <textarea 
          className="chat-input" 
          placeholder="Ask me anything about HR, leave, payroll, recruitment, or Singapore employment law…" 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} 
          rows={1} 
        />
        <button className="chat-send-btn" onClick={() => sendMessage()} disabled={loading || !input.trim()}>
          <Send size={18} />
        </button>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}`}</style>
    </div>
  );
}