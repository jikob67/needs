
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Product, ViewState, User } from '../types';
import { Filter, MapPin, ShoppingBag, Play, Plus, Trash2 } from 'lucide-react';

interface HomeProps {
    products: Product[];
    user?: User | null;
    onProductClick: (product: Product) => void;
    onChangeView: (view: ViewState) => void;
    onDeleteProduct?: (id: string) => void;
}

const Home: React.FC<HomeProps> = ({ products, user, onProductClick, onChangeView, onDeleteProduct }) => {
  
  // Calculate Dynamic Stats
  const statsData = [
    { name: 'كراسي', value: products.filter(p => p.type === 'WHEELCHAIR').length },
    { name: 'تبرعات', value: products.filter(p => p.priceType === 'FREE').length },
    { name: 'خدمات', value: products.filter(p => p.type === 'SERVICE').length },
    { name: 'أخرى', value: products.filter(p => p.type === 'OTHER').length },
  ];

  const hasProducts = products.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">إحصائيات المنصة</h2>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">تحديث مباشر</span>
        </div>
        <div className="h-48 w-full text-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData} layout="vertical" margin={{ left: 0, right: 20, bottom: 0, top: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={70} tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                cursor={{ fill: 'transparent' }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={16} background={{ fill: '#f3f4f6' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-full text-sm whitespace-nowrap shadow-lg shadow-primary-600/20">
          <Filter size={14} />
          الكل
        </button>
        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          مجاني (تبرع)
        </button>
        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          للبيع
        </button>
        <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm whitespace-nowrap hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          حسب المنطقة
        </button>
      </div>

      {/* Listings */}
      {!hasProducts ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-700 dark:text-gray-300 text-lg mb-2">لا توجد منتجات معروضة حالياً</h3>
            <p className="text-sm text-gray-500 max-w-xs mb-6">كن أول من يساهم! اذهب إلى قسم الصور أو الفيديو وأضف كرسياً أو خدمة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
            <div 
                key={product.id} 
                onClick={() => onProductClick(product)}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700 group"
            >
                <div className="relative h-48 bg-gray-200 dark:bg-black overflow-hidden">
                
                {product.mediaType === 'VIDEO' ? (
                     <div className="w-full h-full relative">
                         <video 
                            src={product.imageUrl} 
                            muted 
                            playsInline
                            className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                                <Play size={20} className="ml-1 fill-white" />
                            </div>
                        </div>
                     </div>
                ) : (
                    <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                )}

                <div className="absolute top-2 right-2 flex gap-2">
                    {user && (product.ownerId === user.id || (user as any).role === 'ADMIN') && onDeleteProduct && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
                                    onDeleteProduct(product.id);
                                }
                            }}
                            className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full shadow-sm z-10"
                            title="حذف الإعلان"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    product.priceType === 'FREE' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-primary-600 text-white'
                    }`}>
                    {product.priceType === 'FREE' ? 'تبرع لوجه الله' : `${product.price} ${product.currency}`}
                    </span>
                </div>
                </div>
                <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">{product.title}</h3>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs mb-3">
                    <MapPin size={12} className="ml-1" />
                    {product.location}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                    {product.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400">منذ {Math.floor((Date.now() - product.timestamp) / (1000 * 60 * 60))} ساعة</span>
                    <button className="text-primary-600 dark:text-primary-400 text-xs font-bold flex items-center gap-1 hover:underline">
                        التفاصيل &larr;
                    </button>
                </div>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Floating Action Button for Publishing */}
      <button 
        onClick={() => onChangeView(ViewState.PHOTOS)}
        className="fixed bottom-24 left-6 z-40 bg-primary-600 text-white p-4 rounded-full shadow-2xl hover:bg-primary-700 transition-all active:scale-95 flex items-center gap-2 group"
        aria-label="نشر منتج جديد"
      >
        <Plus size={24} />
        <span className="font-bold text-sm hidden group-hover:block transition-all">نشر منتج</span>
      </button>
    </div>
  );
};

export default Home;
