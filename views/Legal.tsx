
import React, { useState } from 'react';
import { ArrowRight, Shield, FileText } from 'lucide-react';

interface LegalProps {
  onBack: () => void;
}

const Legal: React.FC<LegalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'PRIVACY' | 'TERMS'>('PRIVACY');

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight size={20} className="text-gray-600 dark:text-gray-300" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">السياسة والخصوصية</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl">
        <button 
          onClick={() => setActiveTab('PRIVACY')}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'PRIVACY' 
              ? 'bg-white dark:bg-gray-800 shadow-sm text-primary-600' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <Shield size={18} />
          سياسة الخصوصية
        </button>
        <button 
          onClick={() => setActiveTab('TERMS')}
          className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'TERMS' 
              ? 'bg-white dark:bg-gray-800 shadow-sm text-primary-600' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <FileText size={18} />
          شروط الاستخدام
        </button>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 leading-relaxed">
        {activeTab === 'PRIVACY' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-600 mb-2">سياسة الخصوصية لتطبيق needs</h3>
            
            <section>
              <h4 className="font-bold mb-1">1. جمع المعلومات</h4>
              <p className="text-sm opacity-80">
                نقوم بجمع المعلومات التي تقدمها لنا مباشرة، مثل المعلومات الشخصية عند إنشاء حساب (الاسم، البريد الإلكتروني، الموقع الجغرافي)، والمحتوى الذي تنشره (صور، فيديو).
              </p>
            </section>

            <section>
              <h4 className="font-bold mb-1">2. استخدام المعلومات</h4>
              <p className="text-sm opacity-80">
                نستخدم المعلومات لتوفير خدمات التطبيق، وتسهيل التواصل بين المتبرعين والمحتاجين، وتحسين تجربة المستخدم، وإرسال الإشعارات الهامة.
              </p>
            </section>

            <section>
              <h4 className="font-bold mb-1">3. مشاركة المعلومات</h4>
              <p className="text-sm opacity-80">
                لا نقوم ببيع معلوماتك الشخصية لأطراف ثالثة. قد نشارك بعض البيانات العامة (دون تحديد الهوية) لأغراض إحصائية أو بحثية لخدمة مجتمع ذوي الاحتياجات الخاصة.
              </p>
            </section>

            <section>
              <h4 className="font-bold mb-1">4. أمان البيانات</h4>
              <p className="text-sm opacity-80">
                نحن نتخذ تدابير أمنية معقولة لحماية معلوماتك من الوصول غير المصرح به، ولكن لا يوجد نظام آمن بنسبة 100%.
              </p>
            </section>

            <section>
              <h4 className="font-bold mb-1">5. خدمات الموقع</h4>
              <p className="text-sm opacity-80">
                قد يطلب التطبيق الوصول إلى موقعك الجغرافي لتسهيل العثور على المنتجات والخدمات القريبة منك. يمكنك تعطيل هذا الإذن في أي وقت من إعدادات جهازك.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary-600 mb-2">شروط الاستخدام</h3>

            <section>
              <h4 className="font-bold mb-1">1. قبول الشروط</h4>
              <p className="text-sm opacity-80">
                باستخدامك لتطبيق needs، فإنك توافق على الالتزام بهذه الشروط. إذا كنت لا توافق، يرجى عدم استخدام التطبيق.
              </p>
            </section>

            <section>
              <h4 className="font-bold mb-1">2. سلوك المستخدم</h4>
              <p className="text-sm opacity-80">
                يجب استخدام التطبيق لأغراض مشروعة وإنسانية فقط. يمنع نشر محتوى مسيء، أو احتيالي، أو ينتهك حقوق الآخرين.
              </p>
            </section>

            <section>
              <h4 className="font-bold mb-1">3. المصداقية</h4>
              <p className="text-sm opacity-80">
                أنت مسؤول عن صحة المعلومات التي تقدمها، سواء في ملفك الشخصي أو في الإعلانات التي تنشرها.
              </p>
            </section>

            <section>
              <h4 className="font-bold mb-1">4. التبرعات والمبيعات</h4>
              <p className="text-sm opacity-80">
                التطبيق هو وسيط للربط بين المستخدمين. نحن لسنا طرفاً في المعاملات المالية المباشرة أو تسليم المنتجات، ولا نتحمل مسؤولية جودة المنتجات المعروضة.
              </p>
            </section>

            <section>
              <h4 className="font-bold mb-1">5. إلغاء الحساب</h4>
              <p className="text-sm opacity-80">
                نحتفظ بالحق في تعليق أو إنهاء حساب أي مستخدم يخالف هذه الشروط دون إشعار مسبق.
              </p>
            </section>
          </div>
        )}
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-8">
        آخر تحديث: مارس 2025
      </div>
    </div>
  );
};

export default Legal;
