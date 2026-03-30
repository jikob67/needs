
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  Camera, Building2, Users, User as UserIcon, 
  Briefcase, HeartHandshake, Baby, Info, X 
} from 'lucide-react';
import Legal from '../views/Legal'; // Import Legal component to reuse content

interface AuthProps {
  onLogin: (user: User) => void;
}

type AccountType = 'PERSONAL' | 'PROXY' | 'INSTITUTION';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [accountType, setAccountType] = useState<AccountType>('PERSONAL');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLegalModal, setShowLegalModal] = useState(false);

  // Avatar State
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detected info
  const [detectedInfo, setDetectedInfo] = useState({ currency: 'SAR', defaultLocation: 'الرياض' });

  // Form State
  const [formData, setFormData] = useState({
    fullName: '', // Generic name field
    username: '',
    email: '',
    password: '',
    
    // Institution specific
    licenseNumber: '', 
    organizationType: 'CHARITY', // CHARITY | COMPANY
    
    // Proxy specific
    representativeName: '', // Name of the person being helped
    relationship: '' // Father, Mother, etc.
  });

  useEffect(() => {
    // Detect Currency and roughly Location based on Timezone
    const detectLocationInfo = () => {
        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            let currency = 'USD';
            let location = 'غير محدد';

            if (timeZone.includes('Riyadh')) { currency = 'SAR'; location = 'السعودية'; }
            else if (timeZone.includes('Dubai')) { currency = 'AED'; location = 'الإمارات'; }
            else if (timeZone.includes('Cairo')) { currency = 'EGP'; location = 'مصر'; }
            else if (timeZone.includes('Kuwait')) { currency = 'KWD'; location = 'الكويت'; }
            else if (timeZone.includes('Qatar')) { currency = 'QAR'; location = 'قطر'; }
            else if (timeZone.includes('Bahrain')) { currency = 'BHD'; location = 'البحرين'; }
            else if (timeZone.includes('Muscat')) { currency = 'OMR'; location = 'عمان'; }
            else if (timeZone.includes('Amman')) { currency = 'JOD'; location = 'الأردن'; }
            else if (timeZone.includes('Beirut')) { currency = 'LBP'; location = 'لبنان'; }
            else if (timeZone.includes('Europe')) { currency = 'EUR'; location = 'أوروبا'; }
            
            setDetectedInfo({ currency, defaultLocation: location });
        } catch (e) {
            console.error("Error detecting timezone", e);
        }
    };
    detectLocationInfo();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
        // Signup Logic based on Account Type
        let role = UserRole.USER;
        let bio = '';
        let displayName = formData.fullName;

        if (accountType === 'PROXY') {
            role = UserRole.PROXY;
            bio = `وكيل عن: ${formData.representativeName} (${formData.relationship})`;
        } else if (accountType === 'INSTITUTION') {
            role = UserRole.INSTITUTION;
            bio = `مؤسسة رسمية - ترخيص رقم: ${formData.licenseNumber}`;
        } else {
            bio = 'حساب شخصي';
        }

        const user: User = {
          id: 'u_' + Date.now(),
          fullName: displayName,
          username: formData.username.startsWith('@') ? formData.username : `@${formData.username}`,
          email: formData.email,
          avatar: selectedAvatar || ('https://ui-avatars.com/api/?name=' + encodeURIComponent(displayName || 'User') + '&background=random'),
          role: role,
          points: role === UserRole.INSTITUTION ? 200 : 50, // Institutions get more starting points
          isVerified: role === UserRole.INSTITUTION, // Auto-verify institutions for demo
          location: detectedInfo.defaultLocation,
          currency: detectedInfo.currency,
          subscriptionPlan: 'FREE',
          bio: bio
        };
      
      localStorage.setItem('needs_current_user', JSON.stringify(user));
      setIsLoading(false);
      onLogin(user);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4 animate-fade-in relative">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex flex-col items-center justify-center mb-6">
            <h1 className="text-5xl font-black text-primary-600 mt-4 tracking-tighter">needs</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">مجتمع داعم وشامل</p>
          <p className="text-[10px] text-primary-500 mt-2 bg-primary-50 dark:bg-primary-900/20 inline-block px-3 py-1 rounded-full border border-primary-100 dark:border-primary-800">
              تم تحديد عملتك تلقائياً: {detectedInfo.currency}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            إنشاء حساب جديد
          </h2>
          
          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-sm">
                  {error}
              </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Account Type Selector */}
            <div className="grid grid-cols-3 gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-xl mb-6">
                <button
                    type="button" 
                    onClick={() => setAccountType('PERSONAL')}
                    className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${accountType === 'PERSONAL' ? 'bg-white dark:bg-gray-800 shadow text-primary-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    <UserIcon size={18} />
                    فردي
                </button>
                <button
                    type="button"  
                    onClick={() => setAccountType('PROXY')}
                    className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${accountType === 'PROXY' ? 'bg-white dark:bg-gray-800 shadow text-primary-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    <HeartHandshake size={18} />
                    وكيل/عائلة
                </button>
                <button
                    type="button"  
                    onClick={() => setAccountType('INSTITUTION')}
                    className={`py-3 rounded-lg text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${accountType === 'INSTITUTION' ? 'bg-white dark:bg-gray-800 shadow text-primary-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                >
                    <Building2 size={18} />
                    مؤسسة
                </button>
            </div>

            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-6">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-24 h-24 rounded-full border-4 flex items-center justify-center cursor-pointer overflow-hidden transition-all group shadow-sm ${
                        accountType === 'INSTITUTION' 
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' 
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                >
                    {selectedAvatar ? (
                        <img src={selectedAvatar} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center p-2 text-gray-400 group-hover:text-primary-500 transition-colors">
                            {accountType === 'INSTITUTION' ? <Building2 className="mx-auto mb-1" size={28} /> : <Camera className="mx-auto mb-1" size={28} />}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 hidden group-hover:flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">
                        تغيير الصورة
                    </div>
                </div>
                <span className="text-xs text-gray-500 mt-2 font-medium">
                    {accountType === 'INSTITUTION' ? 'شعار المؤسسة' : accountType === 'PROXY' ? 'صورة الوكيل' : 'صورة شخصية'}
                </span>
                <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
            </div>

            {/* --- Personal Fields --- */}
            {accountType === 'PERSONAL' && (
                <div className="animate-fade-in">
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">الاسم الكامل</label>
                    <input 
                        type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required 
                        placeholder="الاسم الثلاثي" 
                        className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all" 
                    />
                </div>
            )}

            {/* --- Proxy Fields --- */}
            {accountType === 'PROXY' && (
                <div className="animate-fade-in space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 flex gap-2">
                        <Baby className="text-blue-600 flex-shrink-0" size={20} />
                        <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                            هذا الحساب مخصص لأولياء الأمور أو الوكلاء الذين يديرون الحساب نيابة عن شخص من ذوي الاحتياجات الخاصة.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">اسم الوكيل (أنت)</label>
                        <input 
                            type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required 
                            placeholder="اسمك الكامل" 
                            className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none" 
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                            <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">اسم المستفيد</label>
                            <input 
                                type="text" name="representativeName" value={formData.representativeName} onChange={handleInputChange} required 
                                placeholder="الشخص الذي ترعاه" 
                                className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none" 
                            />
                            </div>
                            <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">صلة القرابة</label>
                            <select 
                                name="relationship" value={formData.relationship} onChange={handleInputChange} 
                                className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="">اختر...</option>
                                <option value="FATHER">أب</option>
                                <option value="MOTHER">أم</option>
                                <option value="BROTHER">أخ/أخت</option>
                                <option value="GUARDIAN">ولي أمر قانوني</option>
                                <option value="OTHER">غير ذلك</option>
                            </select>
                            </div>
                    </div>
                </div>
            )}

            {/* --- Institution Fields --- */}
            {accountType === 'INSTITUTION' && (
                <div className="animate-fade-in space-y-3">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800 flex gap-2">
                        <Building2 className="text-purple-600 flex-shrink-0" size={20} />
                        <p className="text-xs text-purple-800 dark:text-purple-200 leading-relaxed">
                            مخصص للجمعيات الخيرية، الشركات الطبية، والمراكز المعتمدة. يتطلب التحقق من رقم الترخيص.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">اسم المؤسسة الرسمي</label>
                        <input 
                            type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required 
                            placeholder="اسم الشركة / الجمعية" 
                            className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">رقم الترخيص / السجل التجاري</label>
                        <div className="relative">
                            <input 
                                type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleInputChange} required 
                                placeholder="مثال: 1010xxxxxx" 
                                className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none pl-10 font-mono" 
                            />
                            <Briefcase className="absolute left-3 top-3 text-gray-400" size={18} />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Common Signup Fields */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">اسم المستخدم</label>
                    <input 
                        type="text" name="username" value={formData.username} onChange={handleInputChange} required 
                        placeholder="@username" 
                        className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none dir-ltr text-right" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
                    <input 
                        type="email" name="email" value={formData.email} onChange={handleInputChange} required 
                        placeholder="email@example.com" 
                        className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none dir-ltr text-right" 
                    />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">كلمة المرور</label>
              <input 
                type="password" name="password" value={formData.password} onChange={handleInputChange} required 
                className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none" 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-3 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 ${
                  accountType === 'INSTITUTION'
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/30' 
                  : 'bg-primary-600 hover:bg-primary-700 shadow-primary-600/30'
              }`}
            >
              {isLoading ? 'جاري المعالجة...' : 'إنشاء الحساب'}
            </button>
            
            <p className="text-center text-xs text-gray-500 mt-4">
               بالتسجيل أنت توافق على <button type="button" onClick={() => setShowLegalModal(true)} className="text-primary-600 font-bold hover:underline">الشروط والأحكام</button>
            </p>
          </form>
        </div>

        {/* Legal Modal */}
        {showLegalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl h-[80vh] overflow-hidden shadow-2xl relative">
                    <button 
                        onClick={() => setShowLegalModal(false)}
                        className="absolute top-4 left-4 z-10 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-600 dark:text-white" />
                    </button>
                    <div className="h-full overflow-y-auto">
                         <Legal onBack={() => setShowLegalModal(false)} />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
