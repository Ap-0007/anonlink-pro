import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Shield, Send, Radio, Globe, Zap, Users, ShieldCheck, Menu, X } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyAwSXMB0FS-O0gmN51eObrIl1c1sc9RkI8",
  authDomain: "anonchat-b239c.firebaseapp.com",
  projectId: "anonchat-b239c",
  storageBucket: "anonchat-b239c.firebasestorage.app",
  messagingSenderId: "118823400855",
  appId: "1:118823400855:web:920d2d8cd118a0f26180d2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const identity = "User_" + Math.floor(Math.random() * 9000);

export default function App() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    signInAnonymously(auth);
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    return onSnapshot(collection(db, 'global_chat'), (s) => {
      const m = s.docs.map(d => ({id: d.id, ...d.data()}));
      m.sort((a,b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0));
      setMessages(m);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, [user]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text; setText('');
    await addDoc(collection(db, 'global_chat'), { 
      text: msg, senderId: user.uid, senderName: identity, createdAt: serverTimestamp() 
    });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-slate-300 font-sans flex flex-col md:flex-row">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#050505] border-r border-white/5 transform ${open ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform flex flex-col`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <ShieldCheck className="text-emerald-500" /> <span className="font-bold text-white">ANONLINK</span>
          <X className="md:hidden cursor-pointer" onClick={() => setOpen(false)} />
        </div>
        <div className="p-6 flex-1">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs">
            <p className="text-slate-500 uppercase mb-1">Your Alias</p>
            <p className="text-white font-bold">{identity}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen">
        <header className="md:hidden p-4 bg-[#050505] border-b border-white/5 flex justify-between">
          <Menu onClick={() => setOpen(true)} className="cursor-pointer" /> <span className="font-bold">ANONLINK</span> <div></div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex flex-col ${m.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-emerald-500 uppercase px-2">{m.senderId === user?.uid ? 'Me' : m.senderName}</span>
              <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${m.senderId === user?.uid ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-slate-100'}`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="p-4 bg-black border-t border-white/5 flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500" />
          <button type="submit" className="bg-emerald-600 p-2 rounded-xl text-white"><Send size={18} /></button>
        </form>
      </main>
    </div>
  );
}
