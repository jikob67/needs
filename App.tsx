
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Home from './views/Home';
import Store from './views/Store';
import Support from './views/Support';
import Chat from './views/Chat';
import Profile from './views/Profile';
import Media from './views/Media';
import Community from './views/Community';
import QRScanner from './views/QRScanner';
import Legal from './views/Legal';
import WheelchairAdvisor from './views/WheelchairAdvisor';
import SearchView from './views/SearchView';
import NotificationsView from './views/NotificationsView';
import AccessibilityWidget from './components/AccessibilityWidget';
import { ViewState, Product, User, SubscriptionPlan, SubscriptionPeriod } from './types';
import { Search as SearchIcon, X, ArrowLeft, Share2, Check, Banknote, Bitcoin, MessageCircle, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const PRODUCTS_KEY = 'needs_app_products';
  const USER_KEY = 'needs_current_user';

  // Synchronously initialize user from localStorage to prevent null pointer errors on first render
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Add admin role for the user email provided in context
        if (parsed.email === 'jikob67@gmail.com') {
          parsed.role = 'ADMIN';
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved user", e);
        return null;
      }
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [products, setProducts] = useState<Product[]>([]);
  const [chatTarget, setChatTarget] = useState<{id: string, name: string} | null>(null);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const savedProducts = localStorage.getItem(PRODUCTS_KEY);
    if (savedProducts) {
      try { setProducts(JSON.parse(savedProducts)); } catch (e) {}
    }
    if (darkMode) { document.documentElement.classList.add('dark'); } 
    else { document.documentElement.classList.remove('dark'); }
  }, [darkMode]);

  useEffect(() => {
    if (!user) return;
    // تم تصفير عداد الإشعارات الأولي
    setNotificationsCount(0);
  }, [user]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleLanguage = () => setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
  
  const handleLogin = (loggedInUser: User) => {
    // Add admin role for the user email provided in context
    if (loggedInUser.email === 'jikob67@gmail.com') {
      loggedInUser.role = 'ADMIN' as any;
    }
    setUser(loggedInUser);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    if (currentView === ViewState.AUTH) {
        setCurrentView(ViewState.HOME);
    }
  };

  const handleLogout = () => {
      setUser(null);
      localStorage.removeItem(USER_KEY);
      setCurrentView(ViewState.HOME);
  };

  const handleUpdateUser = (updatedUser: User) => {
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  };

  const handleAddProduct = (newProduct: Product) => {
      const updatedProducts = [newProduct, ...products];
      setProducts(updatedProducts);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
  };

  const handleDeleteProduct = (productId: string) => {
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updatedProducts));
      if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(null);
          setCurrentView(ViewState.HOME);
      }
  };

  const handleUpgradeUser = (plan: SubscriptionPlan, period: SubscriptionPeriod) => {
      if (user) {
          const updatedUser: User = { 
              ...user, 
              subscriptionPlan: plan,
              subscriptionPeriod: period,
              subscriptionExpiry: Date.now() + (period === 'DAILY' ? 86400000 : period === 'MONTHLY' ? 2592000000 : 31536000000), 
              points: user.points + (plan === 'ELITE' ? 500 : plan === 'PREMIUM' ? 200 : 50) 
          };
          handleUpdateUser(updatedUser);
      }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView(ViewState.PRODUCT_DETAILS);
  };

  const handleClearNotifications = () => {
    setNotificationsCount(0);
  };

  const renderView = () => {
    // Handling view transitions and resets
    if (currentView === ViewState.NOTIFICATIONS && notificationsCount > 0) {
      setNotificationsCount(0); // Mark as read when entering
    }

    // Views that are accessible without a user
    if (currentView === ViewState.HOME) return <Home products={products} user={user} onProductClick={handleProductClick} onChangeView={setCurrentView} onDeleteProduct={handleDeleteProduct} />;
    if (currentView === ViewState.SUPPORT) return <Support />;
    if (currentView === ViewState.ADVISOR) return <WheelchairAdvisor products={products} onSelectProduct={handleProductClick} />;
    if (currentView === ViewState.LEGAL) return <Legal onBack={() => setCurrentView(ViewState.PROFILE)} />;
    if (currentView === ViewState.SEARCH) return <SearchView products={products} onProductClick={handleProductClick} onBack={() => setCurrentView(ViewState.HOME)} />;
    
    // Auth Gatekeeper
    if (!user) {
        return <Auth onLogin={handleLogin} />;
    }

    // Protected Views
    switch (currentView) {
      case ViewState.NOTIFICATIONS:
        return <NotificationsView onClearAll={handleClearNotifications} />;
      case ViewState.STORE:
        return <Store products={products} user={user} onUpgrade={handleUpgradeUser} onDeleteProduct={handleDeleteProduct} />;
      case ViewState.CHAT:
        return <Chat initialTarget={chatTarget} />;
      case ViewState.PROFILE:
        return <Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} onViewLegal={() => setCurrentView(ViewState.LEGAL)} />;
      case ViewState.PHOTOS:
        return <Media type="PHOTOS" products={products} user={user} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onChangeView={setCurrentView} />;
      case ViewState.VIDEOS:
        return <Media type="VIDEOS" products={products} user={user} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onChangeView={setCurrentView} />;
      case ViewState.COMMENTS:
        return <Community user={user} />;
      case ViewState.PRODUCT_DETAILS:
        if(!selectedProduct) return <Home products={products} onProductClick={handleProductClick} />;
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-fade-in pb-6">
                <div className="relative h-64 md:h-96 bg-gray-200 dark:bg-black">
                     <button onClick={() => setCurrentView(ViewState.HOME)} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10">
                         <ArrowLeft size={20} />
                     </button>
                     {selectedProduct.mediaType === 'VIDEO' ? (
                         <video src={selectedProduct.imageUrl} className="w-full h-full object-contain bg-black" controls autoPlay muted playsInline />
                     ) : (
                        <img src={selectedProduct.imageUrl} className="w-full h-full object-cover" alt={selectedProduct.title} />
                     )}
                     <div className={`absolute bottom-4 left-4 px-4 py-2 rounded-xl text-sm font-bold backdrop-blur-md z-10 ${selectedProduct.priceType === 'FREE' ? 'bg-green-500/90 text-white' : 'bg-primary-600/90 text-white'}`}>
                        {selectedProduct.priceType === 'FREE' ? 'مجاني (تبرع)' : `${selectedProduct.price} ${selectedProduct.currency}`}
                     </div>
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-2xl font-bold">{selectedProduct.title}</h1>
                        {user && (selectedProduct.ownerId === user.id || (user as any).role === 'ADMIN') && (
                            <button 
                                onClick={() => {
                                    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
                                        handleDeleteProduct(selectedProduct.id);
                                    }
                                }}
                                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 transition-colors"
                                title="حذف الإعلان"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                    <div className="prose dark:prose-invert mb-8 text-sm">{selectedProduct.description}</div>
                    <button onClick={() => { setChatTarget({id: selectedProduct.ownerId, name: selectedProduct.ownerName || 'المعلن'}); setCurrentView(ViewState.CHAT); }} className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                        <MessageCircle size={24} /> تواصل مع المالك
                    </button>
                </div>
            </div>
        );
      case ViewState.QR_SCANNER:
        return <QRScanner onClose={() => setCurrentView(ViewState.HOME)} />;
      default:
        return <Home products={products} onProductClick={handleProductClick} />;
    }
  };

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView} 
      darkMode={darkMode} 
      toggleDarkMode={() => setDarkMode(!darkMode)} 
      language={language} 
      toggleLanguage={toggleLanguage} 
      notificationsCount={notificationsCount}
    >
      <AccessibilityWidget />
      {renderView()}
    </Layout>
  );
};

export default App;
