"use client";
import { useState, useEffect, useRef } from 'react';

const LawBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Namaste! I am LawBot. How can I help you with Indian legal or tax queries today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [docContext, setDocContext] = useState(null);
  const [fileName, setFileName] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/lawbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input, 
          history: messages,
          doc_context: docContext
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm having trouble connecting to my legal database. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    setMessages(prev => [...prev, { role: 'user', text: `Uploaded: ${file.name}` }]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/upload-document', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      setDocContext(data.extracted_text);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: `I've analyzed the document: ${file.name}. Here is a summary:\n\n${data.summary}\n\nYou can now ask me questions about this document.` 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error uploading document. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearDoc = () => {
    setDocContext(null);
    setFileName('');
    setMessages(prev => [...prev, { role: 'bot', text: "Document context cleared. We are back to general legal queries." }]);
  };

  return (
    <div style={containerStyle}>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} style={bubbleStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </button>
      )}

      {isOpen && (
        <div style={windowStyle} className="animate-fade">
          <div style={chatHeader}>
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
              <div style={botAvatar}>L</div>
              <div>
                <strong style={{fontSize:'1rem'}}>LawBot</strong>
                <p style={{fontSize:'0.7rem', opacity:0.8}}>Legal Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={closeBtn}>&times;</button>
          </div>

          <div style={chatBody} ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} style={m.role === 'bot' ? botMsgContainer : userMsgContainer}>
                <div style={m.role === 'bot' ? botMsgStyle : userMsgStyle}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div style={botMsgStyle}>Typing...</div>}
          </div>

          <div style={chatFooter}>
            <label style={uploadBtn}>
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileUpload} 
                style={{display:'none'}}
              />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v10.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-1.5z"/></svg>
            </label>
            <input 
              type="text" 
              placeholder={docContext ? "Ask about doc..." : "Ask anything..."} 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={chatInput}
            />
            <button onClick={sendMessage} style={sendBtn}>&rarr;</button>
          </div>
          {fileName && (
            <div style={fileIndicator}>
              📄 {fileName} <span onClick={clearDoc} style={{cursor:'pointer', marginLeft:'5px'}}>✕</span>
            </div>
          )}
          <div style={disclaimer}>
            LawBot provides general information, not legal advice.
          </div>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle = { position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 };
const bubbleStyle = {
  width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-blue)',
  border: 'none', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
};
const windowStyle = {
  width: '350px', height: '500px', backgroundColor: 'white', borderRadius: '15px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
};
const chatHeader = {
  backgroundColor: 'var(--primary-blue)', color: 'white', padding: '15px 20px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
};
const botAvatar = {
  width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--saffron)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
};
const closeBtn = { background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' };
const chatBody = { flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#f9f9f9' };
const botMsgContainer = { alignSelf: 'flex-start', maxWidth: '85%' };
const userMsgContainer = { alignSelf: 'flex-end', maxWidth: '85%' };
const botMsgStyle = { backgroundColor: 'white', padding: '10px 15px', borderRadius: '15px 15px 15px 2px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', fontSize: '0.9rem', border: '1px solid #eee' };
const userMsgStyle = { backgroundColor: 'var(--primary-blue)', color: 'white', padding: '10px 15px', borderRadius: '15px 15px 2px 15px', fontSize: '0.9rem' };
const chatFooter = { padding: '15px', borderTop: '1px solid #eee', display: 'flex', gap: '10px' };
const chatInput = { flex: 1, border: '1px solid #ddd', borderRadius: '20px', padding: '8px 15px', outline: 'none' };
const sendBtn = { backgroundColor: 'var(--primary-blue)', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const uploadBtn = { color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' };
const fileIndicator = { fontSize: '0.75rem', color: 'var(--primary-blue)', padding: '5px 15px', backgroundColor: '#eef2f6', display: 'flex', justifyContent: 'space-between' };
const disclaimer = { fontSize: '0.65rem', color: '#999', textAlign: 'center', padding: '5px', backgroundColor: '#fff' };

export default LawBot;
