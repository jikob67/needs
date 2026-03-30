
import React from 'react';
import { 
  Home, Image, Video, ShoppingBag, MessageCircle, 
  MessageSquare, HelpCircle, User, QrCode, Bell, 
  Search, Moon, Sun, Languages, Sparkles, Camera, Film
} from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: 'ar' | 'en';
  toggleLanguage: () => void;
  notificationsCount: number;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  darkMode, 
  toggleDarkMode,
  language,
  toggleLanguage,
  notificationsCount
}) => {

  const navItems = [
    { id: ViewState.HOME, label: language === 'ar' ? 'الرئيسية' : 'Home', icon: Home },
    { id: ViewState.PHOTOS, label: language === 'ar' ? 'صوري' : 'Photos', icon: Camera },
    { id: ViewState.VIDEOS, label: language === 'ar' ? 'فيديوهاتي' : 'Videos', icon: Film },
    { id: ViewState.ADVISOR, label: language === 'ar' ? 'المستشار' : 'Advisor', icon: Sparkles },
    { id: ViewState.STORE, label: language === 'ar' ? 'المتجر' : 'Store', icon: ShoppingBag },
    { id: ViewState.CHAT, label: language === 'ar' ? 'الدردشة' : 'Chat', icon: MessageCircle },
    { id: ViewState.COMMENTS, label: language === 'ar' ? 'المجتمع' : 'Community', icon: MessageSquare },
    { id: ViewState.PROFILE, label: language === 'ar' ? 'الملف' : 'Profile', icon: User },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      <header className="sticky top-0 z-50 w-full bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onChangeView(ViewState.HOME)}>
            <span className="text-3xl font-black tracking-tighter text-primary-600 dark:text-white">needs</span>
          </div>

          <div className="flex items-center space-x-3 space-x-reverse">
             <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200 flex items-center justify-center font-bold text-xs gap-1">
               <Languages size={20} />
               <span>{language.toUpperCase()}</span>
             </button>
             <button onClick={() => onChangeView(ViewState.SEARCH)} className={`p-2 rounded-full transition-colors ${currentView === ViewState.SEARCH ? 'bg-gray-100 dark:bg-gray-700 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200'}`}>
              <Search size={20} />
            </button>
             <button onClick={() => onChangeView(ViewState.QR_SCANNER)} className={`p-2 rounded-full transition-colors ${currentView === ViewState.QR_SCANNER ? 'bg-gray-100 dark:bg-gray-700 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200'}`}>
              <QrCode size={20} />
            </button>
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => onChangeView(ViewState.NOTIFICATIONS)} className={`p-2 rounded-full transition-colors relative ${currentView === ViewState.NOTIFICATIONS ? 'bg-gray-100 dark:bg-gray-700 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200'}`}>
              <Bell size={20} />
              {notificationsCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md mx-auto md:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-4">
          {children}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between px-2 py-1 overflow-x-auto hide-scrollbar w-full">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex flex-col items-center justify-center min-w-[4.5rem] py-2 px-1 transition-colors duration-200
                  ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} className={item.id === ViewState.ADVISOR ? 'text-amber-500 animate-pulse' : ''} />
                <span className="text-[10px] mt-1 font-medium truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
