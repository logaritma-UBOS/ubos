"use client"

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function TeamAgentChat() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi asisten');
      }

      // Handle plain text response to avoid streaming complexity crashes
      const text = await response.text();
      
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: text }
      ]);

      // Refresh the page data invisibly so any checklist/table updates instantly
      router.refresh();
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Maaf, sistem AI sedang sibuk. Coba lagi nanti ya Bos!' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-32 right-4 lg:bottom-6 lg:right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-[350px] max-w-[calc(100vw-32px)] h-[500px] max-h-[60vh] rounded-3xl shadow-2xl border border-gray-100 mb-4 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-bold text-sm leading-tight tracking-wide">UBOS AI</h3>
                <p className="text-[10px] text-emerald-100 font-medium opacity-90">Asisten Cerdas Anda</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors active:scale-95">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 space-y-3 opacity-70">
                <span className="text-5xl">👋</span>
                <p className="text-xs max-w-[200px] leading-relaxed font-medium">Halo! Ketik sesuatu di bawah untuk mulai berdiskusi dengan asisten Anda.</p>
              </div>
            )}
            
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm leading-relaxed'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-4 text-gray-500 flex gap-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-gray-100 z-10">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanya asisten AI..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium placeholder:text-gray-400"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className="bg-emerald-600 text-white p-2 w-10 h-10 flex items-center justify-center rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md active:scale-95"
              >
                <svg className="w-4 h-4 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-4 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border-4 border-white group relative"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 3.104l2.583-.984a.75.75 0 011.026.541l.84 3.738 3.738.84a.75.75 0 01.54 1.026l-.984 2.583 2.583.984a.75.75 0 01.54 1.026l-.84 3.738-3.738.84a.75.75 0 01-1.026.54l-.984 2.583-2.583-.984a.75.75 0 01-1.026-.54l-.84-3.738-3.738-.84a.75.75 0 01-.54-1.026l.984-2.583-2.583-.984a.75.75 0 01-.54-1.026l.84-3.738 3.738-.84a.75.75 0 011.026-.54l.984-2.583z" />
          </svg>
          {/* Notification dot */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
        </button>
      )}
    </div>
  );
}
