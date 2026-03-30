
import React from 'react';
import { Bell, CheckCircle, MessageCircle, Heart, Star, Award, Trash2, Clock } from 'lucide-react';

interface Notification {
  id: string;
  type: 'MESSAGE' | 'LIKE' | 'SYSTEM' | 'REWARD' | 'POST_APPROVED';
  title: string;
  content: string;
  time: string;
  isRead: boolean;
}

interface NotificationsViewProps {
  onClearAll: () => void;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ onClearAll }) => {
  // تم إفراغ قائمة التنبيهات الافتراضية
  const notifications: Notification[] = [];

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'MESSAGE': return <MessageCircle className="text-blue-500" size={20} />;
      case 'LIKE': return <Heart className="text-red-500 fill-red-500" size={20} />;
      case 'REWARD': return <Award className="text-yellow-500" size={20} />;
      case 'POST_APPROVED': return <CheckCircle className="text-green-500" size={20} />;
      default: return <Bell className="text-gray-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold dark:text-white">مركز التنبيهات</h2>
          <p className="text-xs text-gray-500">ابقَ على اطلاع بكل جديد</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} />
            مسح الكل
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex gap-4 ${
                notif.isRead 
                ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-70' 
                : 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900 shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notif.isRead ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{notif.title}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                     <Clock size={10} />
                     <span>{notif.time}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {notif.content}
                </p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
             <Bell size={48} className="text-gray-400 mb-4" />
             <p className="font-bold">لا توجد تنبيهات حالياً</p>
             <p className="text-xs">سيظهر هنا كل جديد يتعلق بنشاطك</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="text-center py-10 opacity-30">
           <Star size={32} className="mx-auto mb-2" />
           <p className="text-xs font-bold">لا توجد تنبيهات أقدم</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
