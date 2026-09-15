import { useState, useEffect } from 'react';
import API from './services/api';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mihwar_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if(API.defaults) API.defaults.headers.common['user-id'] = parsed.id;
      return parsed;
    }
    return null;
  });

  const [authView, setAuthView] = useState('login'); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusinessName, setAuthBusinessName] = useState('');
  const [authClientName, setAuthClientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [businessName, setBusinessName] = useState('محور ERP');

  // المخزون
  const [inventory, setInventory] = useState([]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');

  // العملاء
  const [customers, setCustomers] = useState([]);
  const [custName, setCustName] = useState('');
  const [custNationalId, setCustNationalId] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // المبيعات والفواتير
  const [invoices, setInvoices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [amount, setAmount] = useState('');
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const theme = {
    primary: '#0f766e',
    primaryHover: '#115e59',
    secondary: '#0f172a',
    bgMain: '#f8fafc',
    cardBg: '#ffffff',
    textDark: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    accentGreen: '#10b981'
  };

  useEffect(() => { 
    if (user) {
      setBusinessName(user.businessName || 'محور ERP');
      fetchInventory();
      fetchCustomers();
      fetchInvoices();
    }
  }, [user]);

  const fetchInventory = async () => {
    try {
      const res = await API.get('/api/inventory');
      if (res.data) setInventory(res.data);
    } catch (err) {
      console.error('فشل جلب المخزون', err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/api/customers');
      if (res.data) setCustomers(res.data);
    } catch (err) {
      console.error('فشل جلب بيانات العملاء', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await API.get('/api/sales');
      if (res.data) setInvoices(res.data);
    } catch (err) {
      console.error('فشل جلب الفواتير', err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      alert('الرجاء إدخال اسم المنتج والسعر');
      return;
    }
    try {
      await API.post('/api/inventory', {
        name: newProdName,
        price: newProdPrice,
        stock: newProdStock || 0
      });
      alert('تم حفظ المنتج في قاعدة البيانات بنجاح!');
      setNewProdName('');
      setNewProdPrice('');
      setNewProdStock('');
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.error || 'حدث خطأ أثناء حفظ المنتج');
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!custName.trim()) {
      alert('الرجاء إدخال اسم العميل');
      return;
    }

    setIsSavingCustomer(true);
    try {
      await API.post('/api/customers', {
        name: custName.trim(),
        nationalId: custNationalId.trim() || null,
        phone: custPhone.trim() || null,
        email: custEmail.trim() || null
      });

      alert('✅ تم فتح حساب العميل بنجاح في قاعدة البيانات!');
      setCustName('');
      setCustNationalId('');
      setCustPhone('');
      setCustEmail('');
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'حدث خطأ أثناء فتح حساب العميل');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (authView === 'login') {
      try {
        const res = await API.post('/api/login', { email: authEmail, password: authPassword });
        const loggedInUser = res.data.user;
        setUser(loggedInUser);
        localStorage.setItem('mihwar_user', JSON.stringify(loggedInUser));
        API.defaults.headers.common['user-id'] = loggedInUser.id;
      } catch (err) { alert(err.response?.data?.error || 'فشل تسجيل الدخول'); }
    } else if (authView === 'register') {
      try {
        const res = await API.post('/api/register', { businessName: authBusinessName, clientName: authClientName, email: authEmail, password: authPassword });
        const newUser = res.data.user;
        setUser(newUser);
        localStorage.setItem('mihwar_user', JSON.stringify(newUser));
        API.defaults.headers.common['user-id'] = newUser.id;
        alert('تم إنشاء مساحة العمل بنجاح!');
      } catch (err) { alert(err.response?.data?.error || 'فشل إنشاء الحساب'); }
    }
    setIsLoading(false);
  };

  const handleLogout = () => { 
    setUser(null); 
    localStorage.removeItem('mihwar_user'); 
    delete API.defaults.headers.common['user-id']; 
    setAuthView('login'); 
  };

  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    const prod = inventory.find(p => p.id === Number(prodId));
    if (prod) {
      setAmount(prod.price);
    } else {
      setAmount('');
    }
  };

  // الحسابات اللحظية لضريبة 15%
  const currentSubtotal = (Number(amount) || 0) * (Number(qty) || 0);
  const currentTax = currentSubtotal * 0.15;
  const currentTotal = currentSubtotal + currentTax;

  const handleSaveInvoice = async () => {
    if (!selectedProductId) {
      alert('الرجاء اختيار المنتج أولاً');
      return;
    }
    if (!qty || Number(qty) <= 0) {
      alert('الرجاء تحديد كمية صحيحة');
      return;
    }

    setIsSubmittingSale(true);
    try {
      const res = await API.post('/api/sales', {
        productId: Number(selectedProductId),
        quantity: Number(qty),
        price: Number(amount),
        customerId: selectedCustomerId ? Number(selectedCustomerId) : null
      });

      alert(`✅ ${res.data.message || 'تم إصدار الفاتورة وخصم المخزون بنجاح!'}`);
      
      setSelectedProductId('');
      setAmount('');
      setQty(1);
      await fetchInventory();
      await fetchInvoices();
      setActiveTab('reports');
    } catch (err) {
      alert(err.response?.data?.error || 'فشلت عملية البيع، يرجى المحاولة لاحقاً');
    } finally {
      setIsSubmittingSale(false);
    }
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', height: '100vh', fontFamily: 'Tahoma, Cairo, sans-serif', direction: 'rtl', background: '#f8fafc' }}>
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', background: '#ffffff' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <h1 style={{ color: theme.secondary, fontSize: '28px', fontWeight: '800' }}>{authView === 'login' ? 'تسجيل الدخول لمحور' : 'إنشاء مساحة عمل جديدة'}</h1>
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
              {authView === 'register' && (
                <>
                  <div><label style={{ fontSize: '13px', fontWeight: '600' }}>الاسم التجاري للمنشأة</label><input type="text" value={authBusinessName} onChange={(e)=>setAuthBusinessName(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} /></div>
                  <div><label style={{ fontSize: '13px', fontWeight: '600' }}>اسم المدير المسؤول</label><input type="text" value={authClientName} onChange={(e)=>setAuthClientName(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} /></div>
                </>
              )}
              <div><label style={{ fontSize: '13px', fontWeight: '600' }}>البريد الإلكتروني</label><input type="email" value={authEmail} onChange={(e)=>setAuthEmail(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, boxSizing: 'border-box', direction: 'ltr', textAlign: 'right' }} /></div>
              <div><label style={{ fontSize: '13px', fontWeight: '600' }}>كلمة المرور</label><input type="password" value={authPassword} onChange={(e)=>setAuthPassword(e.target.value)} required style={{ width: '100%', padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, boxSizing: 'border-box', direction: 'ltr', textAlign: 'right' }} /></div>
              <button type="submit" disabled={isLoading} style={{ background: theme.primary, color: '#fff', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {isLoading ? 'جاري المعالجة...' : (authView === 'login' ? 'تسجيل الدخول' : 'إنشاء مساحة العمل')}
              </button>
              <div style={{ textAlign: 'center', fontSize: '14px' }}>
                <span onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')} style={{ color: theme.primary, fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                  {authView === 'login' ? 'سجل شركتك الآن' : 'لديك حساب؟ سجل دخولك'}
                </span>
              </div>
            </form>
          </div>
        </div>
        <div style={{ flex: '1 1 50%', background: theme.secondary, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 20px 0', fontWeight: '800' }}>إدارة متكاملة<br/>برؤية مستقبلية.</h1>
          <p style={{ fontSize: '16px', opacity: 0.75 }}>نظام سحابي متطور لربط كافة أقسام منشأتك.</p>
        </div>
      </div>
    );
  }

  const inventoryVal = inventory.reduce((sum, i) => sum + (Number(i.price) * Number(i.stock)), 0);
  const totalSalesVal = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

  return (
    <div style={{ fontFamily: 'Tahoma, Cairo, sans-serif', direction: 'rtl', background: theme.bgMain, minHeight: '100vh', color: theme.textDark }}>
      <header style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: '12px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
          <span style={{ fontWeight: '800', color: theme.secondary, fontSize: '18px' }}>محور</span>
          <span style={{ fontSize: '13px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px' }}>🏢 مساحة العمل: <strong>{businessName}</strong></span>
        </div>
        <div style={{ cursor: 'pointer' }} onClick={handleLogout}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '800' }}>{user.name} <span style={{ color: '#ef4444', fontSize: '11px' }}>(خروج)</span></p>
        </div>
      </header>

      {/* شريط التبويبات العلوي */}
      <div style={{ background: theme.secondary, color: '#fff', padding: '0 30px', display: 'flex', gap: '4px', fontSize: '13px', overflowX: 'auto' }}>
        {[
          { id: 'dashboard', label: '📊 لوحة التحكم' },
          { id: 'sales', label: '🛍️ المبيعات والفوترة الذكية' },
          { id: 'customers', label: '👥 فتح حساب عميل' },
          { id: 'inventory', label: '📦 المخزون (حي)' },
          { id: 'reports', label: '📈 الفواتير والتقارير' }
        ].map(tab => (
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? theme.primary : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '16px 20px', fontWeight: activeTab === tab.id ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ padding: '35px', maxWidth: '1400px', margin: 'auto' }}>
        {/* لوحة التحكم */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ margin: '0 0 20px 0', fontSize: '26px', color: theme.secondary }}>مرحباً بك، {user.name} 👋</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '14px', border: `1px solid ${theme.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>قيمة المخزون الحالي (TiDB)</p>
                <h2 style={{ color: theme.primary, margin: '10px 0 0 0', fontSize: '28px' }}>{inventoryVal.toLocaleString()} ر.س</h2>
              </div>
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '14px', border: `1px solid ${theme.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>إجمالي المبيعات مع الضريبة</p>
                <h2 style={{ color: theme.accentGreen, margin: '10px 0 0 0', fontSize: '28px' }}>{totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س</h2>
              </div>
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '14px', border: `1px solid ${theme.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>إجمالي العملاء المسجلين</p>
                <h2 style={{ color: theme.secondary, margin: '10px 0 0 0', fontSize: '28px' }}>{customers.length} عميل</h2>
              </div>
            </div>
          </div>
        )}

        {/* فتح حساب عميل */}
        {activeTab === 'customers' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3 style={{ marginTop: 0, color: theme.secondary }}>👤 فتح حساب عميل جديد</h3>
              <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>اسم العميل / المؤسسة *</label>
                  <input type="text" placeholder="مثال: شركة الرواد للتجارة" value={custName} onChange={e=>setCustName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>رقم الهوية / السجل التجاري أو الضريبي</label>
                  <input type="text" placeholder="مثال: 7001234567" value={custNationalId} onChange={e=>setCustNationalId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>رقم الهاتف / الجوال</label>
                  <input type="text" placeholder="05xxxxxxxx" value={custPhone} onChange={e=>setCustPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box', direction: 'ltr', textAlign: 'right' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>البريد الإلكتروني</label>
                  <input type="email" placeholder="client@company.com" value={custEmail} onChange={e=>setCustEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box', direction: 'ltr', textAlign: 'right' }} />
                </div>
                <button type="submit" disabled={isSavingCustomer} style={{ background: theme.primary, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isSavingCustomer ? 'جاري الحفظ في TiDB...' : 'حفظ حساب العميل'}
                </button>
              </form>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: theme.secondary }}>📋 دليل العملاء المسجلين (متصل بـ TiDB)</h3>
                <span style={{ fontSize: '12px', color: theme.textMuted }}>المجموع: {customers.length}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '10px' }}>اسم العميل</th>
                    <th style={{ padding: '10px' }}>الهوية / السجل</th>
                    <th style={{ padding: '10px' }}>الجوال</th>
                    <th style={{ padding: '10px' }}>البريد</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: theme.textMuted }}>لا يوجد عملاء مسجلون حالياً. افتح حساب أول عميل من النموذج!</td></tr>
                  ) : customers.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.name}</td>
                      <td style={{ padding: '12px', color: theme.textMuted }}>{c.nationalId || '-'}</td>
                      <td style={{ padding: '12px' }}>{c.phone || '-'}</td>
                      <td style={{ padding: '12px' }}>{c.email || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* المخزون */}
        {activeTab === 'inventory' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3 style={{ marginTop: 0, color: theme.secondary }}>➕ إضافة منتج جديد</h3>
              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>اسم المنتج</label><input type="text" value={newProdName} onChange={e=>setNewProdName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>سعر البيع (ر.س)</label><input type="number" value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>الكمية الأولية بالمخزون</label><input type="number" value={newProdStock} onChange={e=>setNewProdStock(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} /></div>
                <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>حفظ في قاعدة البيانات</button>
              </form>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3 style={{ marginTop: 0, color: theme.secondary }}>📦 مستودع المنتجات (متصل بـ TiDB)</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                <thead><tr style={{ background: '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>المنتج</th><th style={{ padding: '10px' }}>السعر</th><th style={{ padding: '10px' }}>الرصيد الفعلي</th></tr></thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: theme.textMuted }}>لا توجد منتجات مسجلة في المستودع. أضف منتجاً جديداً الآن!</td></tr>
                  ) : inventory.map(i => (
                    <tr key={i.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{i.name}</td>
                      <td style={{ padding: '12px' }}>{i.price} ر.س</td>
                      <td style={{ padding: '12px', color: '#0d9488', fontWeight: 'bold' }}>{i.stock} وحدة</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* المبيعات والفوترة الذكية */}
        {activeTab === 'sales' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '30px' }}>
              <h2 style={{ marginTop: 0, color: theme.secondary, fontSize: '20px' }}>⚡ إصدار فاتورة بيع جديدة</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '20px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>العميل (يسحب مباشرة من حسابات العملاء)</label>
                  <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, marginTop: '6px' }}>
                    <option value="">عميل نقدي عام (افتراضي)</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold' }}>المنتج (يسحب تلقائياً من TiDB)</label>
                  <select value={selectedProductId} onChange={handleProductSelect} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, marginTop: '6px' }}>
                    <option value="">-- اختر المنتج من المستودع --</option>
                    {inventory.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                        {p.name} — السعر: {p.price} ر.س {p.stock > 0 ? `(المتاح: ${p.stock})` : '(نفذت الكمية)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>الكمية المطلوبة</label>
                    <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box', marginTop: '6px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold' }}>سعر الوحدة (ر.س)</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box', marginTop: '6px' }} />
                  </div>
                </div>

                <button 
                  onClick={handleSaveInvoice} 
                  disabled={isSubmittingSale || !selectedProductId} 
                  style={{ 
                    background: selectedProductId ? theme.primary : '#94a3b8', 
                    color: '#fff', 
                    padding: '14px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: 'bold', 
                    cursor: selectedProductId ? 'pointer' : 'not-allowed', 
                    fontSize: '15px', 
                    marginTop: '10px' 
                  }}
                >
                  {isSubmittingSale ? 'جاري تنفيذ العملية وخصم المخزون...' : '💳 إصدار الفاتورة واعتماد العملية'}
                </button>
              </div>
            </div>

            {/* بطاقة الحساب التلقائي للضريبة */}
            <div style={{ background: '#0f172a', borderRadius: '14px', color: '#fff', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#f8fafc' }}>ملخص الحسبة التلقائية</h3>
                  <span style={{ background: '#0f766e', color: '#5eead4', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>ضريبة 15% آلية</span>
                </div>

                <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#94a3b8' }}>
                    <span>المبلغ الخاضع للضريبة:</span>
                    <strong style={{ color: '#fff' }}>{currentSubtotal.toFixed(2)} ر.س</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#94a3b8' }}>
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <strong style={{ color: '#5eead4' }}>{currentTax.toFixed(2)} ر.س</strong>
                  </div>
                  <div style={{ borderTop: '1px dashed #334155', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>الإجمالي المستحق:</span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: '#38bdf8' }}>{currentTotal.toFixed(2)} ر.س</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#94a3b8', marginTop: '30px', lineHeight: '1.6' }}>
                💡 تُخصم الكمية فوراً من رصيد المستودع، وتُربط الفاتورة بحساب العميل في TiDB.
              </div>
            </div>
          </div>
        )}

        {/* الفواتير والتقارير */}
        {activeTab === 'reports' && (
          <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: theme.secondary }}>سجل الفواتير والمبيعات المعتمدة</h2>
              <span style={{ fontSize: '13px', color: theme.textMuted }}>إجمالي الفواتير: {invoices.length}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: `2px solid ${theme.border}`, fontSize: '13px' }}>
                  <th style={{ padding: '12px' }}>رقم الفاتورة</th>
                  <th style={{ padding: '12px' }}>العميل</th>
                  <th style={{ padding: '12px' }}>المنتج المباع</th>
                  <th style={{ padding: '12px' }}>المبلغ الأساسي</th>
                  <th style={{ padding: '12px' }}>الضريبة (15%)</th>
                  <th style={{ padding: '12px' }}>الإجمالي شامل الضريبة</th>
                  <th style={{ padding: '12px' }}>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '25px', textAlign: 'center', color: theme.textMuted }}>لا توجد فواتير مسجلة في قاعدة البيانات حتى الآن.</td></tr>
                ) : invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}`, fontSize: '14px' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: theme.primary }}>#{inv.invoiceNo}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: theme.secondary }}>
                      {inv.customer?.name || 'عميل نقدي عام'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {inv.items && inv.items.length > 0 
                        ? `${inv.items[0]?.product?.name || 'منتج'} (${inv.items[0]?.quantity} وحدة)` 
                        : 'فاتورة مبيعات'}
                    </td>
                    <td style={{ padding: '12px' }}>{Number(inv.subtotal || 0).toFixed(2)} ر.س</td>
                    <td style={{ padding: '12px', color: '#0d9488' }}>{Number(inv.taxAmount || 0).toFixed(2)} ر.س</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: theme.secondary }}>{Number(inv.totalAmount || 0).toFixed(2)} ر.س</td>
                    <td style={{ padding: '12px', color: theme.textMuted, fontSize: '12px' }}>
                      {new Date(inv.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;