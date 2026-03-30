
import React, { useState } from 'react';
import { getWheelchairRecommendation } from '../services/geminiService';
import { Product } from '../types';
import { 
  Sparkles, ArrowRight, ArrowLeft, Check, 
  Brain, User, Map, Settings, Loader2, Award
} from 'lucide-react';

interface WheelchairAdvisorProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const WheelchairAdvisor: React.FC<WheelchairAdvisorProps> = ({ products, onSelectProduct }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    environment: '',
    control: ''
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const getAIAdvice = async () => {
    setLoading(true);
    const result = await getWheelchairRecommendation(formData, products);
    setRecommendation(result);
    setLoading(false);
    setStep(5);
  };

  const reset = () => {
    setStep(1);
    setRecommendation(null);
    setFormData({ age: '', weight: '', environment: '', control: '' });
  };

  return (
    <div className="max-w-xl mx-auto animate-fade-in pb-10">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Sparkles size={24} />
            </div>
            <h2 className="text-xl font-bold">المستشار الطبي الذكي</h2>
          </div>
          <p className="text-xs text-white/80">دع الذكاء الاصطناعي يساعدك في اختيار الكرسي المثالي لحالتك.</p>
        </div>

        <div className="p-8">
          {step < 5 && (
            <div className="mb-8">
              <div className="flex justify-between mb-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className={`h-1.5 flex-1 mx-1 rounded-full transition-all ${step >= i ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-primary-600 font-bold mb-4">
                <User size={20} /> <span>المعلومات الأساسية</span>
              </div>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm text-gray-500 mb-2 block">الفئة العمرية للمستخدم</span>
                  <select 
                    value={formData.age} 
                    onChange={e => setFormData({...formData, age: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">اختر الفئة...</option>
                    <option value="طفل (تحت 12 سنة)">طفل (تحت 12 سنة)</option>
                    <option value="يافع (12-18 سنة)">يافع (12-18 سنة)</option>
                    <option value="بالغ (18-65 سنة)">بالغ (18-65 سنة)</option>
                    <option value="كبير سن (فوق 65 سنة)">كبير سن (فوق 65 سنة)</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm text-gray-500 mb-2 block">الوزن التقريبي</span>
                  <select 
                    value={formData.weight} 
                    onChange={e => setFormData({...formData, weight: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">اختر الوزن...</option>
                    <option value="خفيف (تحت 50 كجم)">خفيف (تحت 50 كجم)</option>
                    <option value="متوسط (50-90 كجم)">متوسط (50-90 كجم)</option>
                    <option value="ثقيل (فوق 90 كجم)">ثقيل (فوق 90 كجم)</option>
                  </select>
                </label>
              </div>
              <button disabled={!formData.age || !formData.weight} onClick={handleNext} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 transition-all">
                التالي <ArrowLeft size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-primary-600 font-bold mb-4">
                <Map size={20} /> <span>بيئة الاستخدام</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'منزلي فقط (أرضيات ناعمة)', label: 'داخل المنزل فقط' },
                  { id: 'خارجي (شوارع وأرصفة)', label: 'خارجي (شوارع وأرصفة)' },
                  { id: 'مزدوج (داخلي وخارجي)', label: 'مزدوج (داخلي وخارجي)' },
                  { id: 'وعرة (تربة، رمال، منحدرات)', label: 'بيئة وعرة وغير مستوية' }
                ].map(env => (
                  <button 
                    key={env.id}
                    onClick={() => setFormData({...formData, environment: env.id})}
                    className={`p-4 rounded-2xl border-2 text-right transition-all ${formData.environment === env.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-700'}`}
                  >
                    {env.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 bg-gray-100 dark:bg-gray-700 py-4 rounded-2xl font-bold">السابق</button>
                <button disabled={!formData.environment} onClick={handleNext} className="flex-[2] bg-primary-600 text-white py-4 rounded-2xl font-bold">التالي</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-2 text-primary-600 font-bold mb-4">
                <Settings size={20} /> <span>أسلوب التحكم</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'يدوي (بمساعدة مرافق)', label: 'يدوي (بمساعدة مرافق)' },
                  { id: 'يدوي (دفع ذاتي)', label: 'يدوي (دفع ذاتي للمستخدم النشط)' },
                  { id: 'كهربائي (جويستيك)', label: 'كهربائي بالكامل' },
                  { id: 'رياضي / خفيف جداً', label: 'رياضي للحركة السريعة' }
                ].map(ctrl => (
                  <button 
                    key={ctrl.id}
                    onClick={() => setFormData({...formData, control: ctrl.id})}
                    className={`p-4 rounded-2xl border-2 text-right transition-all ${formData.control === ctrl.id ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-700'}`}
                  >
                    {ctrl.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleBack} className="flex-1 bg-gray-100 dark:bg-gray-700 py-4 rounded-2xl font-bold">السابق</button>
                <button disabled={!formData.control} onClick={handleNext} className="flex-[2] bg-primary-600 text-white py-4 rounded-2xl font-bold">مراجعة</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in text-center">
              <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain size={40} className="text-primary-600" />
              </div>
              <h3 className="text-xl font-bold">مستعد لتحليل بياناتك؟</h3>
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl text-right space-y-2">
                <p className="text-sm"><span className="text-gray-400">العمر:</span> {formData.age}</p>
                <p className="text-sm"><span className="text-gray-400">الوزن:</span> {formData.weight}</p>
                <p className="text-sm"><span className="text-gray-400">البيئة:</span> {formData.environment}</p>
                <p className="text-sm"><span className="text-gray-400">التحكم:</span> {formData.control}</p>
              </div>
              <button 
                onClick={getAIAdvice} 
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {loading ? 'جاري تحليل الحالة...' : 'الحصول على التوصية الآن'}
              </button>
              <button onClick={handleBack} className="text-sm text-gray-500 hover:underline">تعديل البيانات</button>
            </div>
          )}

          {step === 5 && recommendation && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <Award size={24} /> <span>توصية المستشار الذكي</span>
                </div>
                <button onClick={reset} className="text-xs text-primary-600 bg-primary-50 px-3 py-1 rounded-full font-bold">إعادة البدء</button>
              </div>
              
              <div className="prose dark:prose-invert text-sm leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-700">
                {recommendation}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-2">تنويه طبي:</h4>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">هذه التوصية مقدمة عبر الذكاء الاصطناعي بناءً على مدخلاتك. يرجى دائماً استشارة أخصائي علاج طبيعي قبل الشراء النهائي لضمان القياسات الدقيقة.</p>
              </div>

              <button 
                onClick={() => reset()} 
                className="w-full border-2 border-gray-200 dark:border-gray-700 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
              >
                إغلاق التوصية
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WheelchairAdvisor;
