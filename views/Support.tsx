import React, { useState, useRef, useEffect } from 'react';
import { generateSupportResponse } from '../services/geminiService';
import { Send, Bot, User as UserIcon, Mail } from 'lucide-react';
import { SUPPORT_EMAIL, SUPPORT_LINKS } from '../constants';

const Support: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{text: string, sender: 'user'|'bot'}[]>([
    { text: "مرحباً بك في مركز الدعم. أنا مساعد الذكاء الاصطناعي الخاص بتطبيق needs. كيف يمكنني مساعدتك اليوم؟", sender: 'bot' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setLoading(true);

    const botResponse = await generateSupportResponse(userMsg);
    
    setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-4 shadow-inner">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-primary-600 text-white' : 'bg-green-500 text-white'}`}>
                {msg.sender === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${
                msg.sender === 'user' 
                  ? 'bg-primary-600 text-white rounded-tl-none' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tr-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-xs animate-pulse">
              جاري الكتابة...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="اكتب مشكلتك هنا..."
          className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full disabled:opacity-50 transition-colors"
        >
          <Send size={20} />
        </button>
      </div>

      {/* Fallback Info */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500 mb-2">لم تجد حلاً؟</p>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 text-sm text-primary-600 font-bold bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-lg">
          <Mail size={16} />
          {SUPPORT_EMAIL}
        </a>
        <div className="mt-2 flex justify-center gap-4 text-xs text-gray-400">
          {SUPPORT_LINKS.map((link, i) => (
             <a key={i} href={link} target="_blank" rel="noreferrer" className="hover:underline">المدونة {i+1}</a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Support;
