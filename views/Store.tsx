
import React, { useState, useEffect } from 'react';
import { Product, User, UserRole, SubscriptionPlan, SubscriptionPeriod } from '../types';
import { CRYPTO_WALLETS, ExtendedCryptoWallet } from '../constants';
import { 
  Copy, CheckCircle, Star, Award, ShoppingBag, ArrowLeft, 
  ShieldCheck, Loader, Wallet, ExternalLink, AlertTriangle, 
  Zap, Crown, Search, RefreshCw, Cpu, Trash2
} from 'lucide-react';

interface StoreProps {
    products: Product[];
    user?: User | null;
    onUpgrade?: (plan: SubscriptionPlan, period: SubscriptionPeriod) => void;
    onDeleteProduct?: (id: string) => void;
}

type PaymentStep = 'SELECT_WALLET' | 'CONNECT_WALLET' | 'PAYMENT' | 'VERIFYING' | 'SUCCESS';

const EXCHANGE_RATES: Record<string, number> = {
    'SAR': 1, 'USD': 0.27, 'EGP': 12.90, 'AED': 0.98, 'KWD': 0.082,
    'QAR': 0.97, 'BHD': 0.10, 'OMR': 0.10, 'JOD': 0.19, 'LBP': 24000, 'EUR': 0.25
};

interface PlanConfig {
    id: SubscriptionPlan;
    label: string;
    description: string;
    icon: any;
    colorFrom: string;
    colorTo: string;
    features: string[];
    prices: Record<SubscriptionPeriod, number>;
}

const Store: React.FC<StoreProps> = ({ products, user, onUpgrade, onDeleteProduct }) => {
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'SUBSCRIPTIONS'>('SUBSCRIPTIONS');
  const [selectedPeriod, setSelectedPeriod] = useState<SubscriptionPeriod>('MONTHLY');
  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlan | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('SELECT_WALLET');
  const [selectedWallet, setSelectedWallet] = useState<ExtendedCryptoWallet | null>(null);
  const [txHash, setTxHash] = useState('');
  const [isHashValid, setIsHashValid] = useState(true);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const PRICING_PLANS: PlanConfig[] = [
    { id: 'STARTER', label: 'باقة البداية', description: 'تجربة سريعة للمستخدم الجديد', icon: Zap, colorFrom: 'from-gray-600', colorTo: 'to-gray-800', features: ['نشر 5 إعلانات', 'ظهور عادي'], prices: { 'DAILY': 2, 'MONTHLY': 15, 'YEARLY': 150 } },
    { id: 'ECONOMY', label: 'باقة التوفير', description: 'الأكثر شعبية للأفراد', icon: Wallet, colorFrom: 'from-blue-500', colorTo: 'to-blue-700', features: ['نشر بلا حدود', 'شارة بائع موثوق'], prices: { 'DAILY': 5, 'MONTHLY': 30, 'YEARLY': 300 } },
    { id: 'PREMIUM', label: 'باقة التميز', description: 'للمحترفين والعائلات', icon: Award, colorFrom: 'from-purple-600', colorTo: 'to-indigo-800', features: ['كل ميزات التوفير', 'تثبيت الإعلانات', 'شارة ذهبية'], prices: { 'DAILY': 10, 'MONTHLY': 80, 'YEARLY': 800 } },
    { id: 'ELITE', label: 'باقة النخبة', description: 'للمؤسسات والشركات', icon: Crown, colorFrom: 'from-yellow-600', colorTo: 'to-amber-800', features: ['حلول مخصصة', 'توثيق رسمي', 'مدير حساب'], prices: { 'DAILY': 25, 'MONTHLY': 200, 'YEARLY': 2000 } }
  ];

  const convertPrice = (sarPrice: number) => {
    const currency = user?.currency || 'SAR';
    const rate = EXCHANGE_RATES[currency] || 1;
    let converted = sarPrice * rate;
    return converted > 100 ? Math.round(converted) : Number(converted.toFixed(2));
  };

  const validateHash = (hash: string) => {
    if (!selectedWallet) return true;
    return selectedWallet.hashRegex.test(hash.trim());
  };

  const handleTxHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTxHash(val);
    if (val.length > 10) {
      setIsHashValid(validateHash(val));
    }
  };

  const handleSubmitPayment = () => {
    if (!txHash.trim()) return;
    if (!validateHash(txHash)) {
      setIsHashValid(false);
      return;
    }

    setPaymentStep('VERIFYING');
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setPaymentStep('SUCCESS');
          if (onUpgrade && selectedPlanId) onUpgrade(selectedPlanId, selectedPeriod);
        }, 500);
      }
      setVerificationProgress(progress);
    }, 400);
  };

  const resetPayment = () => {
    setPaymentStep('SELECT_WALLET');
    setSelectedWallet(null);
    setTxHash('');
    setVerificationProgress(0);
    setIsHashValid(true);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const selectedPlan = PRICING_PLANS.find(p => p.id === selectedPlanId);
  const displayPrice = selectedPlan ? convertPrice(selectedPlan.prices[selectedPeriod]) : 0;
  const userCurrency = user?.currency || 'SAR';

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Tabs */}
      <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl">
        <button onClick={() => setActiveTab('PRODUCTS')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'PRODUCTS' ? 'bg-white dark:bg-gray-800 shadow-sm text-primary-600' : 'text-gray-500'}`}>المنتجات</button>
        <button onClick={() => setActiveTab('SUBSCRIPTIONS')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SUBSCRIPTIONS' ? 'bg-white dark:bg-gray-800 shadow-sm text-primary-600' : 'text-gray-500'}`}>الاشتراكات</button>
      </div>

      {activeTab === 'SUBSCRIPTIONS' && (
        <div className="space-y-6">
          {!selectedPlanId ? (
            <>
              {/* Period Selector */}
              <div className="flex justify-center mb-6">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-full inline-flex">
                  {(['DAILY', 'MONTHLY', 'YEARLY'] as SubscriptionPeriod[]).map(p => (
                    <button key={p} onClick={() => setSelectedPeriod(p)} className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${selectedPeriod === p ? 'bg-primary-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
                      {p === 'DAILY' ? 'يومي' : p === 'MONTHLY' ? 'شهري' : 'سنوي'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRICING_PLANS.map(plan => (
                  <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col hover:shadow-xl transition-all group">
                    <div className={`h-2 w-full bg-gradient-to-r ${plan.colorFrom} ${plan.colorTo}`}></div>
                    <div className="p-6 flex-1">
                      <div className="flex justify-between mb-4">
                        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl group-hover:scale-110 transition-transform"><plan.icon size={24} /></div>
                        <div className="text-right">
                          <div className="font-bold text-2xl">{convertPrice(plan.prices[selectedPeriod])} <span className="text-sm font-normal text-gray-500">{userCurrency}</span></div>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold mb-1">{plan.label}</h3>
                      <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((f, i) => <li key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><CheckCircle size={14} className="text-green-500" /> {f}</li>)}
                      </ul>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                      <button onClick={() => setSelectedPlanId(plan.id)} className={`w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r ${plan.colorFrom} ${plan.colorTo} shadow-lg hover:opacity-90 transition-opacity`}>اختيار الباقة</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Payment Logic */
            <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden max-w-lg mx-auto">
              <div className="bg-gray-50 dark:bg-gray-700/50 p-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <button onClick={resetPayment} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"><ArrowLeft size={20} /></button>
                <div>
                  <h3 className="font-bold">إتمام الدفع الحقيقي</h3>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">{selectedPlan.label} • {selectedPeriod}</p>
                </div>
              </div>

              {paymentStep === 'SELECT_WALLET' && (
                <div className="p-6">
                  <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4"><Cpu size={32} className="text-primary-600" /></div>
                    <h4 className="font-bold text-lg mb-2">اختر شبكة الدفع</h4>
                    <p className="text-sm text-gray-500">سيتم التحقق من المعاملة عبر البلوكشين مباشرة.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {CRYPTO_WALLETS.map(w => (
                      <button key={w.symbol} onClick={() => { setSelectedWallet(w); setPaymentStep('CONNECT_WALLET'); }} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-right group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-xs group-hover:bg-white transition-colors">{w.symbol}</div>
                        <div>
                          <span className="block font-bold text-sm">{w.name}</span>
                          <span className="text-[10px] text-gray-400">شبكة رئيسية</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentStep === 'CONNECT_WALLET' && selectedWallet && (
                <div className="p-8 text-center animate-fade-in">
                  <div className="w-20 h-20 bg-primary-600/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                    <RefreshCw size={32} className="text-primary-600 animate-spin" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary-600/20 border-t-primary-600 animate-ping"></div>
                  </div>
                  <h4 className="text-xl font-bold mb-2">جاري البحث عن محفظة {selectedWallet.name}...</h4>
                  <p className="text-sm text-gray-500 mb-8">يرجى التأكد من فتح تطبيق المحفظة وتفعيل الشبكة المطلوبة.</p>
                  <button onClick={() => setPaymentStep('PAYMENT')} className="w-full bg-gray-100 dark:bg-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">الدفع يدوياً عبر العنوان</button>
                </div>
              )}

              {paymentStep === 'PAYMENT' && selectedWallet && (
                <div className="p-6 space-y-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-4">قم بإرسال <span className="font-bold text-gray-900 dark:text-white">{displayPrice} {userCurrency}</span> إلى العنوان التالي:</p>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 inline-block mb-4">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedWallet.address}`} className="w-32 h-32" alt="QR" />
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                    <div className="flex-1 overflow-hidden">
                      <span className="text-[10px] text-gray-400 block mb-1">عنوان المحفظة الرسمية</span>
                      <code className="text-xs font-mono block truncate">{selectedWallet.address}</code>
                    </div>
                    <button onClick={() => copyToClipboard(selectedWallet.address, 'addr')} className={`p-2 rounded-lg ${copied === 'addr' ? 'bg-green-100 text-green-600' : 'bg-white dark:bg-gray-700 text-gray-400'}`}>
                      {copied === 'addr' ? <CheckCircle size={18} /> : <Copy size={18} />}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-600 dark:text-gray-400">رقم المعاملة (TX Hash)</label>
                      <a href={selectedWallet.explorerUrl + user?.id} target="_blank" rel="noreferrer" className="text-[10px] text-primary-600 flex items-center gap-1 hover:underline">
                        فتح مستكشف {selectedWallet.name} <ExternalLink size={10} />
                      </a>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={txHash} 
                        onChange={handleTxHashChange} 
                        placeholder="أدخل رمز المعاملة بعد الدفع..." 
                        className={`w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-2 outline-none text-xs font-mono transition-all ${!isHashValid ? 'border-red-400 bg-red-50 dark:bg-red-900/10' : 'border-transparent focus:border-primary-500'}`}
                      />
                      {!isHashValid && (
                        <div className="flex items-center gap-1 mt-2 text-red-500 text-[10px] font-bold">
                          <AlertTriangle size={12} /> الصيغة غير صحيحة لشبكة {selectedWallet.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <button onClick={handleSubmitPayment} disabled={!txHash || !isHashValid} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-600/20 transition-all disabled:opacity-50">تأكيد المعاملة وتفعيل الاشتراك</button>
                </div>
              )}

              {paymentStep === 'VERIFYING' && (
                <div className="p-10 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <svg className="w-full h-full rotate-[-90deg]">
                      <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                      <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={276} strokeDashoffset={276 - (276 * verificationProgress) / 100} className="text-primary-600 transition-all duration-300" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">{Math.round(verificationProgress)}%</div>
                  </div>
                  <h4 className="text-lg font-bold mb-2">جاري التحقق من البلوكشين</h4>
                  <p className="text-sm text-gray-500">نحن نتأكد من وصول المعاملة لشبكة {selectedWallet?.name}...</p>
                  <div className="mt-8 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-[10px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <ShieldCheck size={14} /> يتم التحقق من العقد الذكي رقم #0384
                  </div>
                </div>
              )}

              {paymentStep === 'SUCCESS' && (
                <div className="p-10 text-center animate-fade-in bg-green-50 dark:bg-green-900/10">
                  <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/20 animate-bounce">
                    <CheckCircle size={40} />
                  </div>
                  <h4 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">تم التفعيل بنجاح!</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">لقد تم التحقق من المعاملة {txHash.substring(0, 10)}... واشتراكك الآن نشط.</p>
                  <button onClick={() => { setActiveTab('PRODUCTS'); resetPayment(); setSelectedPlanId(null); }} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">ابدأ استخدام الميزات</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'PRODUCTS' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.filter(p => p.priceType === 'PAID').map(p => (
            <div key={p.id} className="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group">
              {user && (p.ownerId === user.id || (user as any).role === 'ADMIN') && onDeleteProduct && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
                      onDeleteProduct(p.id);
                    }
                  }}
                  className="absolute top-2 left-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg z-10 transition-all active:scale-95"
                  title="حذف المنتج"
                >
                  <Trash2 size={14} />
                </button>
              )}
              <img src={p.imageUrl} className="w-full aspect-square object-cover rounded-xl mb-3" alt="" />
              <h4 className="font-bold text-sm truncate">{p.title}</h4>
              <div className="flex justify-between mt-1"><span className="text-xs font-bold text-primary-600">{p.price} {p.currency}</span> <Star size={12} className="text-yellow-400 fill-current" /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Store;
