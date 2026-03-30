
import React, { useState, useEffect } from 'react';
import { Settings, Type, Eye, RotateCcw, X, Sun, Moon } from 'lucide-react';

const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [contrast, setContrast] = useState(false);
  const [grayscale, setGrayscale] = useState(false);

  useEffect(() => {
    // Apply Font Size
    document.documentElement.style.fontSize = `${fontSize}%`;
    
    // Apply Contrast
    if (contrast) {
      document.documentElement.style.filter = 'contrast(125%)';
    } else {
      document.documentElement.style.filter = grayscale ? 'grayscale(100%)' : 'none';
    }

    // Apply Grayscale (if contrast is not overriding logic, or combined)
    if (grayscale && !contrast) {
      document.documentElement.style.filter = 'grayscale(100%)';
    } else if (grayscale && contrast) {
      document.documentElement.style.filter = 'contrast(125%) grayscale(100%)';
    }

    if (!contrast && !grayscale) {
        document.documentElement.style.filter = 'none';
    }

  }, [fontSize, contrast, grayscale]);

  const reset = () => {
    setFontSize(100);
    setContrast(false);
    setGrayscale(false);
  };

  return (
    <>
        {/* Toggle Button - Right Side */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="fixed bottom-24 right-4 z-50 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-transform active:scale-95"
            title="إعدادات سهولة الوصول"
            aria-label="Accessibility Options"
        >
            <Settings size={24} className={isOpen ? 'animate-spin' : ''} />
        </button>

        {/* Panel - Right Side */}
        {isOpen && (
            <div className="fixed bottom-40 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-64 animate-fade-in">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">سهولة الوصول</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Font Size */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                <Type size={14} /> حجم الخط
                            </span>
                            <span className="text-xs font-bold text-primary-600">{fontSize}%</span>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                A-
                            </button>
                            <button 
                                onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                A+
                            </button>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-2">
                        <button 
                            onClick={() => setContrast(!contrast)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-colors ${contrast ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            <span className="flex items-center gap-2"><Sun size={14} /> تباين عالي</span>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${contrast ? 'bg-yellow-500' : 'bg-gray-300'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${contrast ? 'left-4.5' : 'left-0.5'}`} style={{ left: contrast ? '18px' : '2px' }}></div>
                            </div>
                        </button>

                        <button 
                            onClick={() => setGrayscale(!grayscale)}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-colors ${grayscale ? 'bg-gray-200 text-gray-800' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                        >
                            <span className="flex items-center gap-2"><Eye size={14} /> تدرج الرمادي</span>
                            <div className={`w-8 h-4 rounded-full relative transition-colors ${grayscale ? 'bg-gray-600' : 'bg-gray-300'}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all`} style={{ left: grayscale ? '18px' : '2px' }}></div>
                            </div>
                        </button>
                    </div>

                    {/* Reset */}
                    <button 
                        onClick={reset}
                        className="w-full flex items-center justify-center gap-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition-colors"
                    >
                        <RotateCcw size={12} />
                        إعادة تعيين
                    </button>
                </div>
            </div>
        )}
    </>
  );
};

export default AccessibilityWidget;
