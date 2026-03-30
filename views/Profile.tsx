
import React, { useRef, useState, useEffect } from 'react';
import { User } from '../types';
import { MapPin, Award, Share2, CreditCard, Camera, LogOut, Edit2, Check, X, Shield, FileText } from 'lucide-react';

interface ProfileProps {
    user: User;
    onLogout: () => void;
    onUpdateUser?: (updatedUser: User) => void;
    onViewLegal: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, onUpdateUser, onViewLegal }) => {
  // Safety guard for null user (should be handled by parent, but good for robustness)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p>يرجى تسجيل الدخول لعرض الملف الشخصي</p>
      </div>
    );
  }

  const [avatar, setAvatar] = useState(user.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.fullName) + '&background=random');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
      fullName: user.fullName,
      location: user.location,
      bio: user.bio || ''
  });

  useEffect(() => {
     if(user.avatar) setAvatar(user.avatar);
     setEditForm({
         fullName: user.fullName,
         location: user.location,
         bio: user.bio || ''
     });
  }, [user]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
          const result = reader.result as string;
          setAvatar(result);
          if (onUpdateUser) {
              onUpdateUser({ ...user, avatar: result });
          }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
      if (onUpdateUser) {
          onUpdateUser({
              ...user,
              fullName: editForm.fullName,
              location: editForm.location,
              bio: editForm.bio
          });
      }
      setIsEditing(false);
  };

  const handleShareProfile = async () => {
    const shareData = {
        title: `ملف ${user.fullName} على needs`,
        text: `تصفح ملف ${user.fullName} في تطبيق needs للمساعدة والدعم.`,
        url: window.location.href 
    };
    
    // Construct clean URL for sharing
    const urlObj = new URL(window.location.origin);
    urlObj.searchParams.set('profile', user.id);
    shareData.url = urlObj.toString();

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error("Error sharing:", err);
            }
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareData.url);
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2000);
        } catch (err) {
            console.error("Error copying:", err);
        }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm relative border border-gray-100 dark:border-gray-700">
        
        {/* Top Actions */}
        <div className="absolute top-4 left-4 flex gap-2">
            <button 
                onClick={onLogout}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title="تسجيل الخروج"
            >
                <LogOut size={20} />
            </button>
        </div>

        <div className="absolute top-4 right-4">
            {isEditing ? (
                <div className="flex gap-2">
                    <button onClick={handleSaveProfile} className="bg-green-500 text-white p-2 rounded-full shadow hover:bg-green-600">
                        <Check size={18} />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-full hover:bg-gray-300">
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <button onClick={() => setIsEditing(true)} className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 p-2 rounded-full hover:bg-primary-100 transition-colors">
                    <Edit2 size={18} />
                </button>
            )}
        </div>
        
        {/* Avatar */}
        <div className="relative w-24 h-24 mx-auto mb-4 group">
          <div className="w-full h-full rounded-full overflow-hidden border-4 border-primary-100 dark:border-primary-900 shadow-inner">
            <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full shadow-md hover:bg-primary-700 transition-all transform hover:scale-110"
            title="تغيير الصورة الشخصية"
          >
            <Camera size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Info Fields */}
        <div className="text-center">
            {isEditing ? (
                <div className="space-y-3 max-w-xs mx-auto mb-4">
                    <input 
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full text-center p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white font-bold"
                        placeholder="الاسم الكامل"
                    />
                    <input 
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        className="w-full text-center p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
                        placeholder="الموقع (المدينة، الدولة)"
                    />
                     <textarea 
                        value={editForm.bio}
                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                        className="w-full text-center p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm resize-none"
                        placeholder="اكتب نبذة عنك..."
                        rows={2}
                    />
                </div>
            ) : (
                <>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.fullName}</h2>
                    <p className="text-primary-600 text-sm font-medium dir-ltr mb-2">{user.username}</p>
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                        <MapPin size={14} />
                        {user.location || 'الموقع غير محدد'}
                    </div>
                    {user.bio && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm max-w-sm mx-auto mb-4 italic">
                            "{user.bio}"
                        </p>
                    )}
                </>
            )}
        </div>

        <div className="flex justify-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
           <div className="text-center px-4">
             <div className="font-bold text-lg dark:text-white">{user.points}</div>
             <div className="text-xs text-gray-400">نقاط</div>
           </div>
           <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
           <div className="text-center px-4">
             <div className="font-bold text-lg dark:text-white">{user.subscriptionPlan !== 'FREE' ? '∞' : '3'}</div>
             <div className="text-xs text-gray-400">إعلان يومي</div>
           </div>
           <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
           <div className="text-center px-4">
             <div className="font-bold text-lg dark:text-white">5.0</div>
             <div className="text-xs text-gray-400">تقييم</div>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 opacity-20">
               <Award size={64} />
           </div>
           <Award size={24} className="mb-2 opacity-90" />
           <div className="font-bold text-2xl">{user.points}</div>
           <div className="text-xs opacity-90">رصيد النقاط المكتسبة</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-md relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 opacity-20">
               <CreditCard size={64} />
           </div>
           <CreditCard size={24} className="mb-2 opacity-90" />
           <div className="font-bold text-xl">{user.subscriptionPlan === 'FREE' ? 'مجانية' : user.subscriptionPlan}</div>
           <div className="text-xs opacity-90">
               {user.subscriptionPlan === 'FREE' ? 'ترقية الحساب' : `${user.subscriptionPeriod || ''} - نشط`}
           </div>
        </div>
      </div>

      {/* Legal & Privacy Link */}
      <button 
        onClick={onViewLegal}
        className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
             <div className="bg-blue-100 dark:bg-blue-900/30 text-primary-600 p-2 rounded-full">
                <Shield size={20} />
             </div>
             <span className="font-bold text-gray-800 dark:text-gray-200">السياسة والخصوصية</span>
        </div>
        <FileText size={18} className="text-gray-400" />
      </button>

      {/* QR Code */}
       <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm flex flex-col items-center border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold mb-4 text-sm text-gray-500 dark:text-gray-400">بطاقة الملف الشخصي</h3>
          <div className="bg-white p-2 rounded-lg border border-gray-200 mb-4">
             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=user:${user.id}`} alt="QR Code" className="w-32 h-32 mix-blend-multiply" />
          </div>
          <button 
            onClick={handleShareProfile}
            className={`flex items-center gap-2 text-sm font-bold hover:underline transition-colors ${shareSuccess ? 'text-green-600' : 'text-primary-600 dark:text-primary-400'}`}
          >
            {shareSuccess ? <Check size={16} /> : <Share2 size={16} />}
            {shareSuccess ? 'تم نسخ الرابط' : 'مشاركة الرابط'}
          </button>
       </div>
    </div>
  );
};

export default Profile;
