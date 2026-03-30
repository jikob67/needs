
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, MapPin, Video, Loader, Map, Play, CheckCircle, Trash2 } from 'lucide-react';

interface ChatProps {
    initialTarget?: {id: string, name: string} | null;
}

// Extended local message type for the view state
interface LocalMessage {
    id: string;
    text: string;
    sender: 'me' | 'other';
    type: 'TEXT' | 'LOCATION' | 'VIDEO';
    mediaUrl?: string;
    timestamp: number;
}

const Chat: React.FC<ChatProps> = ({ initialTarget }) => {
  const [activeChat, setActiveChat] = useState<{id: string, name: string} | null>(initialTarget || null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CHAT_STORAGE_KEY = activeChat ? `chat_history_${activeChat.id}` : null;

  useEffect(() => {
      if (initialTarget) {
          setActiveChat(initialTarget);
          const saved = localStorage.getItem(`chat_history_${initialTarget.id}`);
          if (saved) {
              setMessages(JSON.parse(saved));
          } else {
              setMessages([]);
          }
      }
  }, [initialTarget]);

  useEffect(() => {
      if (activeChat) {
          const saved = localStorage.getItem(`chat_history_${activeChat.id}`);
          if (saved) {
              setMessages(JSON.parse(saved));
          }
      }
  }, [activeChat]);

  useEffect(() => {
      if (activeChat && messages.length > 0) {
          localStorage.setItem(`chat_history_${activeChat.id}`, JSON.stringify(messages));
      }
  }, [messages, activeChat]);

  // Scroll to bottom on new message
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
      if (!input.trim()) return;
      
      const newMessage: LocalMessage = {
          id: Date.now().toString(),
          text: input,
          sender: 'me',
          type: 'TEXT',
          timestamp: Date.now()
      };

      setMessages(prev => [...prev, newMessage]);
      setInput('');
      
      // Simulate reply
      simulateReply();
  };

  const handleDeleteMessage = (id: string) => {
      if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
      setMessages(prev => prev.filter(m => m.id !== id));
  };

  const handleSendLocation = () => {
      if (!navigator.geolocation) {
          alert("المتصفح لا يدعم تحديد الموقع الجغرافي");
          return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
          (position) => {
              const { latitude, longitude } = position.coords;
              const locationMsg: LocalMessage = {
                  id: Date.now().toString(),
                  text: `${latitude},${longitude}`,
                  sender: 'me',
                  type: 'LOCATION',
                  timestamp: Date.now()
              };
              setMessages(prev => [...prev, locationMsg]);
              setIsLocating(false);
              simulateReply();
          },
          (error) => {
              console.error(error);
              alert("تعذر الحصول على الموقع. تأكد من تفعيل الـ GPS.");
              setIsLocating(false);
          }
      );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Basic size check (e.g., 20MB limit for short videos)
      if (file.size > 20 * 1024 * 1024) {
          alert("حجم الفيديو كبير جداً. يرجى اختيار فيديو قصير (أقل من 20 ميجابايت) لإثبات حالة المنتج.");
          return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
          const videoMsg: LocalMessage = {
              id: Date.now().toString(),
              text: "فيديو إثبات حالة المنتج",
              sender: 'me',
              type: 'VIDEO',
              mediaUrl: reader.result as string,
              timestamp: Date.now()
          };
          setMessages(prev => [...prev, videoMsg]);
          setIsUploading(false);
          // Clear input
          if(fileInputRef.current) fileInputRef.current.value = '';
          simulateReply();
      };
      reader.readAsDataURL(file);
  };

  const simulateReply = () => {
      setTimeout(() => {
          const reply: LocalMessage = {
              id: (Date.now() + 1).toString(),
              text: 'شكراً لك! سأراجع التفاصيل وأرد عليك قريباً.',
              sender: 'other',
              type: 'TEXT',
              timestamp: Date.now()
          };
          setMessages(prev => [...prev, reply]);
      }, 2500);
  };

  if (activeChat) {
      return (
          <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in">
              {/* Chat Header */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-600">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-gray-600 flex items-center justify-center text-primary-600 dark:text-white relative">
                      <User size={20} />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-700 rounded-full"></span>
                  </div>
                  <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{activeChat.name}</h3>
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">متصل الآن</span>
                      </div>
                  </div>
              </div>
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                  {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm opacity-60">
                          <MessageSquare size={48} className="mb-2" />
                          <p className="font-bold">بداية المحادثة مع {activeChat.name}</p>
                          <p className="text-xs mt-1">يمكنك مشاركة فيديو قصير للمنتج أو موقعك للاستلام.</p>
                      </div>
                  )}
                  
                  {messages.map((msg) => (
                      <div key={msg.id} className={`flex group ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] rounded-2xl overflow-hidden shadow-sm relative ${
                              msg.sender === 'me' 
                              ? 'bg-primary-600 text-white rounded-tl-none' 
                              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tr-none'
                          }`}>
                              {/* Delete Button - Only for my messages */}
                              {msg.sender === 'me' && (
                                  <button 
                                     onClick={() => handleDeleteMessage(msg.id)}
                                     className="absolute top-1 left-1 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                     title="حذف الرسالة"
                                  >
                                      <Trash2 size={10} />
                                  </button>
                              )}

                              {/* Text Message */}
                              {msg.type === 'TEXT' && (
                                  <div className="p-3 text-sm">{msg.text}</div>
                              )}

                              {/* Video Message */}
                              {msg.type === 'VIDEO' && (
                                  <div className="p-1">
                                      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-[240px]">
                                          <video src={msg.mediaUrl} controls className="w-full h-40 object-cover" />
                                          <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                                              <Play size={10} className="fill-white" />
                                              <span>إثبات حالة</span>
                                          </div>
                                      </div>
                                      <div className="p-2 text-xs opacity-90 flex items-center gap-1">
                                          <CheckCircle size={12} />
                                          <span>تم إرفاق فيديو</span>
                                      </div>
                                  </div>
                              )}

                              {/* Location Message */}
                              {msg.type === 'LOCATION' && (
                                  <div className="p-1 min-w-[200px]">
                                      <a 
                                        href={`https://www.google.com/maps/search/?api=1&query=${msg.text}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="block bg-white/10 rounded-lg p-1 hover:bg-white/20 transition-colors"
                                      >
                                          <div className="bg-gray-200 dark:bg-gray-600 h-24 rounded-lg relative overflow-hidden flex items-center justify-center">
                                               <Map className="text-gray-400" size={32} />
                                               <div className="absolute inset-0 flex items-center justify-center">
                                                   <div className="bg-red-500 text-white p-2 rounded-full shadow-lg animate-bounce">
                                                       <MapPin size={20} className="fill-red-500" />
                                                   </div>
                                               </div>
                                          </div>
                                          <div className="p-2 flex items-center justify-between">
                                              <span className="text-xs font-bold">موقع جغرافي</span>
                                              <span className="text-[10px] opacity-80">اضغط للفتح</span>
                                          </div>
                                      </a>
                                  </div>
                              )}
                              
                              <div className={`text-[10px] px-3 pb-1 text-right ${msg.sender === 'me' ? 'text-primary-100' : 'text-gray-400'}`}>
                                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                          </div>
                      </div>
                  ))}
                  <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-end gap-2">
                      {/* Attachments */}
                      <div className="flex gap-1 pb-2">
                          <button 
                             onClick={() => fileInputRef.current?.click()}
                             disabled={isUploading}
                             className="p-2.5 text-gray-500 hover:text-primary-600 bg-gray-50 dark:bg-gray-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition-all relative group"
                             title="إرفاق فيديو قصير (إثبات حالة)"
                          >
                             {isUploading ? <Loader size={20} className="animate-spin text-primary-600" /> : <Video size={20} />}
                          </button>
                          
                          <button 
                             onClick={handleSendLocation}
                             disabled={isLocating}
                             className="p-2.5 text-gray-500 hover:text-red-500 bg-gray-50 dark:bg-gray-700/50 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                             title="مشاركة موقعي الحالي"
                          >
                             {isLocating ? <Loader size={20} className="animate-spin text-red-500" /> : <MapPin size={20} />}
                          </button>
                      </div>

                      {/* Text Input */}
                      <div className="flex-1 bg-gray-100 dark:bg-gray-900 rounded-2xl flex items-center px-4 py-2 border border-transparent focus-within:border-primary-300 dark:focus-within:border-gray-600 transition-colors">
                          <input 
                              type="text" 
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="اكتب رسالتك..."
                              className="flex-1 bg-transparent border-none focus:ring-0 outline-none max-h-24 py-2 text-sm text-gray-900 dark:text-white"
                          />
                      </div>
                      
                      <button 
                        onClick={handleSendMessage} 
                        disabled={!input.trim()}
                        className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 shadow-md shadow-primary-600/30 disabled:opacity-50 disabled:shadow-none transition-all mb-1"
                      >
                          <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
                      </button>
                  </div>
              </div>
              
              {/* Hidden File Input */}
              <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileSelect}
              />
          </div>
      );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <h2 className="text-xl font-bold px-2 mb-4 text-gray-900 dark:text-white">الرسائل</h2>
      
      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <MessageSquare size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">لا توجد محادثة نشطة</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                اذهب إلى "تواصل مع المالك" في صفحة أي منتج لبدء محادثة ومشاركة الفيديوهات والموقع.
            </p>
      </div>
    </div>
  );
};

export default Chat;
