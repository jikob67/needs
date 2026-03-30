
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Upload, X, Lock, Film, Share2, Check, MapPin, Loader, Banknote, Bitcoin } from 'lucide-react';
import { ViewState, Product, User } from '../types';

interface MediaProps {
  type: 'PHOTOS' | 'VIDEOS';
  onChangeView: (view: ViewState) => void;
  products: Product[];
  user: User;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

const Media: React.FC<MediaProps> = ({ type, onChangeView, products, user, onAddProduct, onDeleteProduct }) => {
  const MAX_DAILY_UPLOADS = 3;
  const STORAGE_KEY_LIMIT = `daily_limit_${type}`;

  const [dailyUploadCount, setDailyUploadCount] = useState(0);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter products belonging to current user and matching current media type
  const myAds = products.filter(p => 
      p.ownerId === user.id && 
      (type === 'PHOTOS' ? p.mediaType === 'IMAGE' : p.mediaType === 'VIDEO')
  );

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priceType: 'FREE' as 'FREE' | 'PAID',
    price: '',
    image: null as string | null,
    productType: 'WHEELCHAIR' as 'WHEELCHAIR' | 'SERVICE' | 'OTHER',
    location: user.location || '',
    paymentMethods: ['CASH'] as ('CASH' | 'CRYPTO')[]
  });

  // Initialize Daily Limit from Storage
  useEffect(() => {
    const savedLimit = localStorage.getItem(STORAGE_KEY_LIMIT);
    const today = new Date().toDateString();
    
    if (savedLimit) {
      try {
        const { date, count } = JSON.parse(savedLimit);
        if (date === today) {
          setDailyUploadCount(count);
        } else {
          setDailyUploadCount(0);
          localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify({ date: today, count: 0 }));
        }
      } catch (e) {
         setDailyUploadCount(0);
      }
    } else {
       localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify({ date: today, count: 0 }));
    }
  }, [type]);

  const handleAddClick = () => {
    // Re-check limit
    const savedLimit = localStorage.getItem(STORAGE_KEY_LIMIT);
    const today = new Date().toDateString();
    let currentCount = 0;

    if (savedLimit) {
         try {
            const parsed = JSON.parse(savedLimit);
            if (parsed.date === today) currentCount = parsed.count;
         } catch(e) {}
    }
    
    if (currentCount >= MAX_DAILY_UPLOADS) {
      setIsLimitModalOpen(true);
    } else {
      setIsUploadModalOpen(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({ ...prev, image: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
        alert("المتصفح لا يدعم تحديد الموقع الجغرافي");
        return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            setFormData(prev => ({
                ...prev, 
                location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }));
            setIsLocating(false);
        },
        (error) => {
            console.error(error);
            alert("تعذر الحصول على الموقع. يرجى التحقق من إعدادات الموقع في جهازك.");
            setIsLocating(false);
        }
    );
  };

  const togglePaymentMethod = (method: 'CASH' | 'CRYPTO') => {
      setFormData(prev => {
          const current = prev.paymentMethods;
          if (current.includes(method)) {
              return { ...prev, paymentMethods: current.filter(m => m !== method) };
          } else {
              return { ...prev, paymentMethods: [...current, method] };
          }
      });
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAd: Product = {
      id: `prod_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      imageUrl: formData.image || (type === 'PHOTOS' ? 'https://via.placeholder.com/400?text=No+Image' : 'https://via.placeholder.com/400?text=Video+Thumbnail'),
      type: formData.productType,
      priceType: formData.priceType,
      price: formData.price ? parseFloat(formData.price) : 0,
      currency: user.currency || 'SAR', // Use user's detected currency
      location: formData.location,
      ownerId: user.id,
      ownerName: user.fullName,
      qrCode: 'QR_' + Date.now(),
      status: 'AVAILABLE',
      mediaType: type === 'PHOTOS' ? 'IMAGE' : 'VIDEO',
      timestamp: Date.now(),
      paymentMethods: formData.priceType === 'FREE' ? [] : formData.paymentMethods
    };

    // Add to global state
    onAddProduct(newAd);

    // Update limit
    const today = new Date().toDateString();
    const newCount = dailyUploadCount + 1;
    setDailyUploadCount(newCount);
    localStorage.setItem(STORAGE_KEY_LIMIT, JSON.stringify({ date: today, count: newCount }));

    setIsUploadModalOpen(false);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      priceType: 'FREE',
      price: '',
      image: null,
      productType: 'WHEELCHAIR',
      location: user.location || '',
      paymentMethods: ['CASH']
    });
  };

  const handleShare = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const shareData = {
        title: product.title,
        text: `شاهد هذا الإعلان على تطبيق needs: ${product.title}`,
        url: `${window.location.origin}?product=${product.id}`
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err: any) {
            // Ignore AbortError which happens when user cancels sharing
            if (err.name !== 'AbortError') {
                console.error("Error sharing:", err);
            }
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareData.url);
            setCopiedId(product.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Error copying", err);
        }
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation(); // Stop bubbling to prevent opening detail view
      e.preventDefault();
      if (window.confirm('هل أنت متأكد من حذف هذا الإعلان بشكل نهائي؟')) {
          onDeleteProduct(id);
      }
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[calc(100vh-140px)]">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
         <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {type === 'PHOTOS' ? 'إعلاناتي المصورة' : 'إعلانات الفيديو'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
               الحد اليومي المتبقي: <span className="font-bold text-primary-600">{Math.max(0, MAX_DAILY_UPLOADS - dailyUploadCount)}</span> إعلان
            </p>
         </div>
      </div>
      
      {/* Floating Action Button for Upload - Fixed at bottom */}
      <button 
          onClick={handleAddClick}
          className="fixed bottom-20 left-4 z-40 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg shadow-primary-600/40 transition-transform active:scale-95 flex items-center justify-center"
          aria-label="إضافة إعلان جديد"
      >
          <Plus size={28} />
      </button>
      
      {/* Empty State */}
      {myAds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
           <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              {type === 'PHOTOS' ? <Upload size={24} className="text-gray-400" /> : <Film size={24} className="text-gray-400" />}
           </div>
           <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">لا توجد إعلانات مرفوعة</h3>
           <p className="text-sm text-gray-500 max-w-xs">ابدأ برفع منتجاتك الآن. يمكنك رفع حتى 3 إعلانات يومياً مجاناً.</p>
        </div>
      ) : (
        /* Ads Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {myAds.map((ad) => (
            <div key={ad.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 relative group">
               <div className="relative h-48 bg-gray-200 dark:bg-black">
                  {ad.mediaType === 'VIDEO' ? (
                      <video 
                        src={ad.imageUrl} 
                        className="w-full h-full object-cover" 
                        controls
                        playsInline
                      />
                  ) : (
                      <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                  )}
                  
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${ad.priceType === 'FREE' ? 'bg-green-500 text-white' : 'bg-primary-600 text-white'}`}>
                     {ad.priceType === 'FREE' ? 'تبرع' : `${ad.price} ${ad.currency}`}
                  </div>
                  
                  {/* Share Button */}
                  <button 
                    onClick={(e) => handleShare(e, ad)}
                    className="absolute top-2 left-12 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10"
                    title="مشاركة الإعلان"
                  >
                    {copiedId === ad.id ? <Check size={16} /> : <Share2 size={16} />}
                  </button>

                  {/* Delete Button - Fixed propagation */}
                  <button 
                    onClick={(e) => handleDelete(e, ad.id)}
                    className="absolute top-2 left-2 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full z-10"
                    title="حذف الإعلان"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
               <div className="p-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">{ad.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{ad.description}</p>
                  <div className="text-xs text-gray-400 flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                     <span>{new Date(ad.timestamp).toLocaleDateString('ar-SA')}</span>
                     <span className="text-green-600 dark:text-green-400 font-medium">نشط</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Limit Reached Modal */}
      {isLimitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">وصلت للحد اليومي</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
                لقد استهلكت رصيدك المجاني (3 إعلانات) لهذا اليوم. للاستمرار في نشر المزيد، يرجى الاشتراك في الباقة المميزة.
              </p>
              <div className="flex flex-col gap-3">
                 <button 
                    onClick={() => { setIsLimitModalOpen(false); onChangeView(ViewState.STORE); }}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold transition-colors"
                 >
                    الذهاب للمتجر والاشتراك
                 </button>
                 <button 
                    onClick={() => setIsLimitModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                 >
                    إلغاء
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Upload Form Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-3xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">إضافة {type === 'PHOTOS' ? 'صور' : 'فيديو'} جديد</h3>
                 <button onClick={() => setIsUploadModalOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200">
                    <X size={20} />
                 </button>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-4">
                 {/* File Upload */}
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors relative overflow-hidden h-48 flex flex-col items-center justify-center"
                 >
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept={type === 'PHOTOS' ? "image/*" : "video/*"}
                        onChange={handleFileChange}
                    />
                    
                    {formData.image ? (
                        type === 'VIDEOS' ? (
                             <video 
                                src={formData.image} 
                                className="absolute inset-0 w-full h-full object-cover bg-black" 
                                controls 
                             />
                        ) : (
                             <img src={formData.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        )
                    ) : null}
                    
                    {!formData.image && (
                         <div className="relative z-10">
                            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm text-gray-500">اضغط لرفع {type === 'PHOTOS' ? 'صور' : 'فيديو'} المنتج</p>
                        </div>
                    )}

                    {formData.image && type === 'PHOTOS' && <p className="relative z-10 text-xs text-green-600 font-bold mt-2 bg-white/80 px-2 py-1 rounded">تم اختيار الملف</p>}
                 </div>

                 <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">العنوان</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                    />
                 </div>

                 <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">الوصف</label>
                    <textarea 
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none resize-none text-gray-900 dark:text-white"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">التصنيف</label>
                        <select 
                            value={formData.productType}
                            onChange={(e) => setFormData({...formData, productType: e.target.value as any})}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-transparent outline-none text-gray-900 dark:text-white"
                        >
                            <option value="WHEELCHAIR">كرسي متحرك</option>
                            <option value="SERVICE">خدمة</option>
                            <option value="OTHER">منتج آخر</option>
                        </select>
                     </div>
                     <div className="col-span-1">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">الموقع (مطلوب)</label>
                        <div className="flex gap-2">
                             <input 
                                type="text"
                                required
                                placeholder="اضغط الرمز لتحديد الموقع"
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-transparent outline-none text-xs text-gray-900 dark:text-white"
                            />
                            <button 
                                type="button"
                                onClick={handleGetLocation}
                                disabled={isLocating}
                                className="bg-blue-100 dark:bg-blue-900/30 text-primary-600 dark:text-primary-400 p-3 rounded-xl hover:bg-blue-200 transition-colors disabled:opacity-50"
                                title="مشاركة موقعي الحالي"
                            >
                                {isLocating ? <Loader size={20} className="animate-spin" /> : <MapPin size={20} />}
                            </button>
                        </div>
                     </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">نوع العرض</label>
                       <select 
                         value={formData.priceType}
                         onChange={(e) => setFormData({...formData, priceType: e.target.value as 'FREE' | 'PAID'})}
                         className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-transparent outline-none text-gray-900 dark:text-white"
                       >
                          <option value="FREE">تبرع (مجاني)</option>
                          <option value="PAID">بيع</option>
                       </select>
                    </div>
                    {formData.priceType === 'PAID' && (
                       <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">السعر</label>
                          <div className="relative">
                              <input 
                                type="number" 
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => setFormData({...formData, price: e.target.value})}
                                className="w-full p-3 pl-10 rounded-xl bg-gray-50 dark:bg-gray-700 border-transparent focus:bg-white focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white"
                              />
                              <span className="absolute left-3 top-3 text-xs text-gray-500 font-bold">{user.currency || 'SAR'}</span>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Payment Methods Section - Only if Paid */}
                 {formData.priceType === 'PAID' && (
                     <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                         <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">طرق الدفع المقبولة</label>
                         <div className="flex gap-4">
                             <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.paymentMethods.includes('CASH') ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent bg-white dark:bg-gray-700'}`}>
                                 <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={formData.paymentMethods.includes('CASH')}
                                    onChange={() => togglePaymentMethod('CASH')}
                                 />
                                 <Banknote size={18} className={formData.paymentMethods.includes('CASH') ? 'text-primary-600' : 'text-gray-400'} />
                                 <span className="text-xs font-bold">كاش / تحويل</span>
                             </label>

                             <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.paymentMethods.includes('CRYPTO') ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent bg-white dark:bg-gray-700'}`}>
                                 <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={formData.paymentMethods.includes('CRYPTO')}
                                    onChange={() => togglePaymentMethod('CRYPTO')}
                                 />
                                 <Bitcoin size={18} className={formData.paymentMethods.includes('CRYPTO') ? 'text-primary-600' : 'text-gray-400'} />
                                 <span className="text-xs font-bold">عملات رقمية</span>
                             </label>
                         </div>
                     </div>
                 )}

                 <div className="pt-4">
                    <button 
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-primary-600/20 transition-all"
                    >
                       نشر {type === 'PHOTOS' ? 'الإعلان' : 'الفيديو'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Media;
