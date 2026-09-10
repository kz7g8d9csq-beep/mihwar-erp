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

  const [inventory, setInventory] = useState([]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');

  const [clients, setClients] = useState([{id: 1, name: 'شركة أفق للتجارة'}]);
  const [invoices, setInvoices] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [amount, setAmount] = useState('');
  const [taxRate] = useState(15);

  const theme = {
    primary: '#0f766e',
    secondary: '#0f172a',
    bgMain: '#f8fafc',
    cardBg: '#ffffff',
    textDark: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0'
  };

  useEffect(() => { 
    if (user) {
      setBusinessName(user.businessName || 'محور ERP');
      fetchInventory();
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

  const handleLogout = () => { setUser(null); localStorage.removeItem('mihwar_user'); delete API.defaults.headers.common['user-id']; setAuthView('login'); };

  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    const prod = inventory.find(p => p.id == prodId);
    if(prod) setAmount(prod.price);
  };

  const handleSaveInvoice = () => {
    if(!selectedClientId || !selectedProductId) { alert('الرجاء اختيار العميل والمنتج'); return; }
    const prod = inventory.find(p => p.id == selectedProductId);
    const client = clients.find(c => c.id == selectedClientId);
    const subtotal = Number(amount) * qty;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    const newInvoice = { id: Date.now(), invoiceNumber: `INV-${Math.floor(Math.random()*1000000)}`, client: client, items: [{ description: prod.name, quantity: qty, unitPrice: amount }], totalAmount: totalAmount.toFixed(2), createdAt: new Date() };
    setInvoices([newInvoice, ...invoices]);
    alert('تم إصدار الفاتورة بنجاح');
    setActiveTab('reports');
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

      <div style={{ background: theme.secondary, color: '#fff', padding: '0 30px', display: 'flex', gap: '4px', fontSize: '13px' }}>
        {[
          { id: 'dashboard', label: '📊 لوحة التحكم' },
          { id: 'sales', label: '🛍️ المبيعات' },
          { id: 'inventory', label: '📦 المخزون (حي)' },
          { id: 'reports', label: '📈 التقارير' }
        ].map(tab => (
          <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? theme.primary : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '16px 20px', fontWeight: activeTab === tab.id ? 'bold' : 'normal' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ padding: '35px', maxWidth: '1400px', margin: 'auto' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ margin: '0 0 20px 0', fontSize: '26px', color: theme.secondary }}>مرحباً بك، {user.name} 👋</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p>قيمة المخزون (من قاعدة البيانات)</p><h2 style={{ color: '#0d9488' }}>{inventoryVal.toLocaleString()} ر.س</h2></div>
            </div>
          </div>
        )}

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

        {activeTab === 'sales' && (
          <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '30px' }}>
            <h2 style={{ marginTop: 0, color: theme.secondary }}>إصدار فاتورة مبيعات</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div><label>العميل</label><select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}` }}><option value="">-- اختر العميل --</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              <div><label>المنتج (يسحب من مخزون TiDB)</label><select value={selectedProductId} onChange={handleProductSelect} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}` }}><option value="">-- اختر من المستودع الحقيقي --</option>{inventory.map(p => <option key={p.id} value={p.id}>{p.name} ({p.price} ر.س)</option>)}</select></div>
              <div><label>الكمية</label><input type="number" value={qty} onChange={e => setQty(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}` }} /></div>
              <div><label>السعر</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}` }} /></div>
            </div>
            <button onClick={handleSaveInvoice} style={{ background: theme.primary, color: '#fff', padding: '12px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>حفظ الفاتورة</button>
          </div>
        )}

        {activeTab === 'reports' && (
          <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '30px' }}>
            <h2 style={{ marginTop: 0, color: theme.secondary }}>الفواتير والتقارير</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead><tr style={{ borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>رقم الفاتورة</th><th style={{ padding: '10px' }}>العميل</th><th style={{ padding: '10px' }}>المبلغ</th></tr></thead>
              <tbody>
                {invoices.length === 0 ? <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>لا توجد فواتير.</td></tr> : invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>#{inv.invoiceNumber}</td><td style={{ padding: '10px' }}>{inv.client?.name}</td><td style={{ padding: '10px', color: '#0d9488', fontWeight: 'bold' }}>{inv.totalAmount} ر.س</td></tr>
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