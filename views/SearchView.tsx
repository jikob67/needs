
import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Search as SearchIcon, X, MapPin, Filter, ShoppingBag } from 'lucide-react';

interface SearchViewProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onBack: () => void;
}

const SearchView: React.FC<SearchViewProps> = ({ products, onProductClick, onBack }) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'WHEELCHAIR' | 'SERVICE' | 'FREE'>('ALL');

  const filteredResults = useMemo(() => {
    return products.filter(p => {
      const matchesQuery = p.title.toLowerCase().includes(query.toLowerCase()) || 
                          p.description.toLowerCase().includes(query.toLowerCase()) ||
                          p.location.toLowerCase().includes(query.toLowerCase());
      
      const matchesFilter = activeFilter === 'ALL' || 
                           (activeFilter === 'WHEELCHAIR' && p.type === 'WHEELCHAIR') ||
                           (activeFilter === 'SERVICE' && p.type === 'SERVICE') ||
                           (activeFilter === 'FREE' && p.priceType === 'FREE');

      return matchesQuery && matchesFilter;
    });
  }, [products, query, activeFilter]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Search Bar Area */}
      <div className="sticky top-0 z-20 pt-2 pb-4 bg-gray-50 dark:bg-gray-900">
        <div className="relative group">
          <SearchIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" size={20} />
          <input 
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن كراسي، خدمات، أو مواقع..."
            className="w-full pr-12 pl-12 py-4 bg-white dark:bg-gray-800 rounded-2xl border-2 border-transparent focus:border-primary-500 shadow-sm outline-none transition-all dark:text-white"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Filters */}
        <div className="flex gap-2 overflow-x-auto py-4 hide-scrollbar">
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'WHEELCHAIR', label: 'كراسي متحركة' },
            { id: 'SERVICE', label: 'خدمات طبية' },
            { id: 'FREE', label: 'تبرعات مجانية' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === f.id 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex justify-between items-center px-2">
        <h3 className="font-bold text-gray-800 dark:text-white">النتائج ({filteredResults.length})</h3>
      </div>

      {/* Grid Results */}
      {filteredResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
           <div className="p-6 bg-gray-200 dark:bg-gray-800 rounded-full mb-4">
              <ShoppingBag size={48} className="text-gray-400" />
           </div>
           <p className="font-bold text-lg">لا توجد نتائج تطابق بحثك</p>
           <p className="text-sm">حاول تغيير الكلمات المفتاحية أو الفلاتر</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResults.map(product => (
            <div 
              key={product.id} 
              onClick={() => onProductClick(product)}
              className="bg-white dark:bg-gray-800 p-3 rounded-2xl flex gap-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-bold text-white ${product.priceType === 'FREE' ? 'bg-green-500' : 'bg-primary-600'}`}>
                  {product.priceType === 'FREE' ? 'مجاني' : product.price}
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h4 className="font-bold text-sm truncate dark:text-white">{product.title}</h4>
                <div className="flex items-center gap-1 text-gray-400 text-[10px] mt-1">
                  <MapPin size={10} />
                  <span className="truncate">{product.location}</span>
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {product.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchView;
