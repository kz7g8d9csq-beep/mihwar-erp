import { useState, useEffect } from 'react';
import API from './services/api';

// قواميس اللغات
const dict = {
  ar: {
    brand: 'محور ERP',
    tagline: 'إدارة متكاملة برؤية مستقبلية.',
    taglineSub: 'نظام سحابي متطور لربط كافة أقسام منشأتك.',
    workspace: 'مساحة العمل:',
    logout: 'خروج',
    security: 'الأمان والحساب',
    darkMode: 'الوضع الليلي 🌙',
    lightMode: 'الوضع النهاري ☀️',
    dashboard: '📊 لوحة التحكم',
    sales: '🛍️ المبيعات والفوترة',
    customers: '👥 فتح حساب عميل',
    inventory: '📦 المخزون (حي)',
    reports: '📈 الفواتير والتقارير',
    welcome: 'مرحباً بك،',
    invValue: 'قيمة المخزون الحالي (TiDB)',
    salesTotal: 'إجمالي المبيعات مع الضريبة',
    customersTotal: 'إجمالي العملاء المسجلين',
    currency: 'ر.س',
    addNewCust: '👤 فتح حساب عميل جديد',
    custName: 'اسم العميل / المؤسسة *',
    custNationalId: 'رقم الهوية / السجل التجاري أو الضريبي',
    custPhone: 'رقم الهاتف / الجوال',
    custEmail: 'البريد الإلكتروني',
    saveCust: 'حفظ حساب العميل',
    updateCust: 'تحديث بيانات العميل',
    cancelEdit: 'إلغاء التعديل',
    custDirectory: '📋 دليل العملاء المسجلين (TiDB)',
    actions: 'الإجراءات',
    edit: 'تعديل',
    delete: 'حذف',
    confirmDeleteCust: 'هل أنت متأكد من رغبتك في حذف هذا العميل؟',
    noCusts: 'لا يوجد عملاء مسجلون حالياً.',
    issueInvoice: '⚡ إصدار فاتورة بيع جديدة',
    selectCust: 'العميل',
    defaultCust: 'عميل نقدي عام (افتراضي)',
    selectProd: 'المنتج (يسحب تلقائياً من TiDB)',
    chooseProd: '-- اختر المنتج من المستودع --',
    qty: 'الكمية المطلوبة',
    unitPrice: 'سعر الوحدة (ر.س)',
    confirmSaleBtn: '💳 إصدار الفاتورة واعتماد العملية',
    summaryTitle: 'ملخص الحسبة التلقائية',
    vatBadge: 'ضريبة 15% آلية',
    subtotal: 'المبلغ الخاضع للضريبة:',
    vatAmount: 'ضريبة القيمة المضافة (15%):',
    totalDue: 'الإجمالي المستحق:',
    vatNote: '💡 تُخصم الكمية فوراً من رصيد المستودع، وتُربط الفاتورة بقاعدة بيانات TiDB.',
    invRepo: 'سجل الفواتير والمبيعات المعتمدة',
    invNo: 'رقم الفاتورة',
    clientCol: 'العميل',
    itemCol: 'المنتج المباع',
    dateCol: 'التاريخ',
    noInvoices: 'لا توجد فواتير مسجلة حتى الآن.',
    prodName: 'اسم المنتج',
    prodPrice: 'سعر البيع (ر.س)',
    prodStock: 'الكمية الأولية بالمخزون',
    saveProd: 'حفظ في قاعدة البيانات',
    stockRepo: '📦 مستودع المنتجات (متصل بـ TiDB)',
    availableStock: 'الرصيد الفعلي',
    changePassTitle: '🔒 أمان الحساب وتغيير كلمة المرور',
    oldPass: 'كلمة المرور الحالية',
    newPass: 'كلمة المرور الجديدة (8 خانات فأكثر)',
    updatePassBtn: 'تحديث كلمة المرور',
    deleteAccTitle: '⚠️ منطقة الخطر: حذف الحساب',
    deleteAccNote: 'سيتم تعطيل حسابك بشكل نهائي، أدخل كلمة المرور للتأكيد:',
    deleteAccBtn: 'حذف الحساب نهائياً',
    close: 'إغلاق'
  },
  en: {
    brand: 'Mihwar ERP',
    tagline: 'Enterprise Management Reimagined.',
    taglineSub: 'Next-generation cloud ERP connecting every department.',
    workspace: 'Workspace:',
    logout: 'Logout',
    security: 'Account & Security',
    darkMode: 'Dark Mode 🌙',
    lightMode: 'Light Mode ☀️',
    dashboard: '📊 Dashboard',
    sales: '🛍️ Smart Sales',
    customers: '👥 Client Directory',
    inventory: '📦 Live Inventory',
    reports: '📈 Invoices & Reports',
    welcome: 'Welcome,',
    invValue: 'Total Inventory Value (TiDB)',
    salesTotal: 'Total Sales (Incl. VAT)',
    customersTotal: 'Registered Clients',
    currency: 'SAR',
    addNewCust: '👤 Add New Client Account',
    custName: 'Client / Business Name *',
    custNationalId: 'National ID / Tax / CR Number',
    custPhone: 'Phone / Mobile',
    custEmail: 'Email Address',
    saveCust: 'Save Client Account',
    updateCust: 'Update Client Info',
    cancelEdit: 'Cancel Edit',
    custDirectory: '📋 Registered Clients (TiDB)',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    confirmDeleteCust: 'Are you sure you want to delete this client?',
    noCusts: 'No clients registered yet.',
    issueInvoice: '⚡ Generate New Sales Invoice',
    selectCust: 'Select Client',
    defaultCust: 'General Cash Customer (Default)',
    selectProd: 'Product (Live TiDB Stock)',
    chooseProd: '-- Select product from warehouse --',
    qty: 'Required Quantity',
    unitPrice: 'Unit Price (SAR)',
    confirmSaleBtn: '💳 Confirm & Deplete Stock',
    summaryTitle: 'Live Tax Summary',
    vatBadge: 'Automated 15% VAT',
    subtotal: 'Taxable Amount:',
    vatAmount: 'Value Added Tax (15%):',
    totalDue: 'Total Amount Due:',
    vatNote: '💡 Stock is depleted atomically, invoice is bound to TiDB.',
    invRepo: 'Verified Invoices Registry',
    invNo: 'Invoice #',
    clientCol: 'Client',
    itemCol: 'Item Sold',
    dateCol: 'Date',
    noInvoices: 'No invoices recorded yet.',
    prodName: 'Product Name',
    prodPrice: 'Sale Price (SAR)',
    prodStock: 'Initial Stock Quantity',
    saveProd: 'Save to TiDB Database',
    stockRepo: '📦 Warehouse Products (TiDB Connected)',
    availableStock: 'Available Stock',
    changePassTitle: '🔒 Account Security & Password',
    oldPass: 'Current Password',
    newPass: 'New Password (8+ characters)',
    updatePassBtn: 'Update Password',
    deleteAccTitle: '⚠️ Danger Zone: Delete Account',
    deleteAccNote: 'Your account will be permanently deactivated. Enter password to confirm:',
    deleteAccBtn: 'Permanently Deactivate Account',
    close: 'Close'
  }
};

function App() {
  const [lang, setLang] = useState('ar');
  const [isDark, setIsDark] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('mihwar_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (API.defaults) API.defaults.headers.common['user-id'] = parsed.id;
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
  const [editingCustId, setEditingCustId] = useState(null);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // المبيعات
  const [invoices, setInvoices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [amount, setAmount] = useState('');
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  // الأمان
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [deleteConfirmPass, setDeleteConfirmPass] = useState('');

  const t = dict[lang];

  const theme = {
    primary: '#0f766e',
    primaryHover: '#115e59',
    secondary: isDark ? '#020617' : '#0f172a',
    bgMain: isDark ? '#0b1120' : '#f8fafc',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    textDark: isDark ? '#f1f5f9' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#334155' : '#e2e8f0',
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
      console.error(err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/api/customers');
      if (res.data) setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await API.get('/api/sales');
      if (res.data) setInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddOrUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!custName.trim()) {
      alert(lang === 'ar' ? 'الرجاء إدخال اسم العميل' : 'Customer name is required');
      return;
    }

    setIsSavingCustomer(true);
    try {
      if (editingCustId) {
        await API.put(`/api/customers/${editingCustId}`, {
          name: custName.trim(),
          nationalId: custNationalId.trim() || null,
          phone: custPhone.trim() || null,
          email: custEmail.trim() || null
        });
        alert(lang === 'ar' ? '✅ تم تحديث بيانات العميل بنجاح!' : 'Client updated successfully!');
        setEditingCustId(null);
      } else {
        await API.post('/api/customers', {
          name: custName.trim(),
          nationalId: custNationalId.trim() || null,
          phone: custPhone.trim() || null,
          email: custEmail.trim() || null
        });
        alert(lang === 'ar' ? '✅ تم فتح حساب العميل في TiDB بنجاح!' : 'Client account created in TiDB!');
      }

      setCustName('');
      setCustNationalId('');
      setCustPhone('');
      setCustEmail('');
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || (lang === 'ar' ? 'حدث خطأ في العملية' : 'Error saving client'));
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleEditClick = (c) => {
    setEditingCustId(c.id);
    setCustName(c.name || '');
    setCustNationalId(c.nationalId || '');
    setCustPhone(c.phone || '');
    setCustEmail(c.email || '');
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm(t.confirmDeleteCust)) return;
    try {
      await API.delete(`/api/customers/${id}`);
      alert(lang === 'ar' ? 'تم حذف العميل بنجاح' : 'Client deleted successfully');
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || (lang === 'ar' ? 'تعذر حذف العميل' : 'Failed to delete client'));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    try {
      await API.post('/api/inventory', {
        name: newProdName,
        price: newProdPrice,
        stock: newProdStock || 0
      });
      alert(lang === 'ar' ? 'تم حفظ المنتج بنجاح!' : 'Product saved successfully!');
      setNewProdName('');
      setNewProdPrice('');
      setNewProdStock('');
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving product');
    }
  };

  const handleSaveInvoice = async () => {
    if (!selectedProductId || !qty) return;
    setIsSubmittingSale(true);
    try {
      const res = await API.post('/api/sales', {
        productId: Number(selectedProductId),
        quantity: Number(qty),
        price: Number(amount),
        customerId: selectedCustomerId ? Number(selectedCustomerId) : null
      });
      alert(`✅ ${res.data.message || (lang === 'ar' ? 'تم إصدار الفاتورة بنجاح!' : 'Invoice generated successfully!')}`);
      setSelectedProductId('');
      setAmount('');
      setQty(1);
      await fetchInventory();
      await fetchInvoices();
      setActiveTab('reports');
    } catch (err) {
      alert(err.response?.data?.error || 'Sales process failed');
    } finally {
      setIsSubmittingSale(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) {
      alert(lang === 'ar' ? 'كلمة المرور يجب ألا تقل عن 8 خانات' : 'Password must be 8+ characters');
      return;
    }
    try {
      const res = await API.post('/api/change-password', {
        currentPassword: currentPass,
        newPassword: newPass
      });
      alert(`✅ ${res.data.message}`);
      setCurrentPass('');
      setNewPass('');
      setShowSecurityModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm(lang === 'ar' ? 'تحذير نهائي: هل تريد تعطيل وحذف حسابك تماماً؟' : 'Final Warning: Permanently deactivate account?')) return;
    try {
      await API.post('/api/delete-account', { confirmPassword: deleteConfirmPass });
      alert(lang === 'ar' ? 'تم تعطيل الحساب بنجاح' : 'Account deactivated successfully');
      handleLogout();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete account');
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authView === 'login') {
        const res = await API.post('/api/login', { email: authEmail, password: authPassword });
        const loggedInUser = res.data.user;
        setUser(loggedInUser);
        localStorage.setItem('mihwar_user', JSON.stringify(loggedInUser));
        API.defaults.headers.common['user-id'] = loggedInUser.id;
      } else {
        const res = await API.post('/api/register', {
          businessName: authBusinessName,
          clientName: authClientName,
          email: authEmail,
          password: authPassword
        });
        const newUser = res.data.user;
        setUser(newUser);
        localStorage.setItem('mihwar_user', JSON.stringify(newUser));
        API.defaults.headers.common['user-id'] = newUser.id;
        alert('تم إنشاء مساحة العمل بنجاح!');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mihwar_user');
    delete API.defaults.headers.common['user-id'];
    setAuthView('login');
    setShowSecurityModal(false);
  };

  const currentSubtotal = (Number(amount) || 0) * (Number(qty) || 0);
  const currentTax = currentSubtotal * 0.15;
  const currentTotal = currentSubtotal + currentTax;

  const inventoryVal = inventory.reduce((sum, i) => sum + (Number(i.price) * Number(i.stock)), 0);
  const totalSalesVal = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

  if (!user) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ display: 'flex', height: '100vh', fontFamily: 'Cairo, Tahoma, sans-serif', background: theme.bgMain }}>
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', background: theme.cardBg }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '26px' }}>⚡</span>
                <span style={{ fontSize: '22px', fontWeight: '900', color: theme.primary }}>{t.brand}</span>
              </div>
              <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: theme.textDark }}>
                {lang === 'ar' ? 'English' : 'عربي'}
              </button>
            </div>

            <h1 style={{ color: theme.textDark, fontSize: '24px', fontWeight: '800' }}>
              {authView === 'login' ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In') : (lang === 'ar' ? 'إنشاء مساحة عمل جديدة' : 'Create Workspace')}
            </h1>

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              {authView === 'register' && (
                <>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textDark }}>{lang === 'ar' ? 'اسم المنشأة' : 'Company Name'}</label>
                    <input type="text" value={authBusinessName} onChange={(e)=>setAuthBusinessName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textDark }}>{lang === 'ar' ? 'اسم المدير' : 'Manager Name'}</label>
                    <input type="text" value={authClientName} onChange={(e)=>setAuthClientName(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                  </div>
                </>
              )}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textDark }}>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <input type="email" value={authEmail} onChange={(e)=>setAuthEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textDark }}>{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                <input type="password" value={authPassword} onChange={(e)=>setAuthPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={isLoading} style={{ background: theme.primary, color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                {isLoading ? '...' : (authView === 'login' ? (lang === 'ar' ? 'دخول' : 'Sign In') : (lang === 'ar' ? 'تسجيل مساحة العمل' : 'Register Workspace'))}
              </button>
              <div style={{ textAlign: 'center', fontSize: '14px' }}>
                <span onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')} style={{ color: theme.primary, fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>
                  {authView === 'login' ? (lang === 'ar' ? 'سجل شركتك الآن' : 'Create an account') : (lang === 'ar' ? 'لديك حساب؟ سجل دخولك' : 'Already registered?')}
                </span>
              </div>
            </form>
          </div>
        </div>
        <div style={{ flex: '1 1 50%', background: theme.secondary, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px' }}>
          <h1 style={{ fontSize: '44px', margin: '0 0 20px 0', fontWeight: '800' }}>{t.tagline}</h1>
          <p style={{ fontSize: '16px', opacity: 0.8 }}>{t.taglineSub}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, Tahoma, sans-serif', background: theme.bgMain, minHeight: '100vh', color: theme.textDark }}>
      {/* الترويسة الرئيسية */}
      <header style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: '12px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* أيقونة الشركة والشعار */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f766e, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '18px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
              🏢
            </div>
            <span style={{ fontWeight: '900', color: theme.textDark, fontSize: '18px' }}>{t.brand}</span>
          </div>
          <span style={{ fontSize: '13px', background: isDark ? '#334155' : '#f1f5f9', padding: '6px 12px', borderRadius: '6px' }}>
            {t.workspace} <strong>{businessName}</strong>
          </span>
        </div>

        {/* أدوات التحكم: اللغة، الوضع الليلي، الأمان، الخروج */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* تبديل اللغة */}
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textDark, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            🌐 {lang === 'ar' ? 'English' : 'عربي'}
          </button>

          {/* تبديل الوضع الليلي / النهاري */}
          <button onClick={() => setIsDark(!isDark)} style={{ background: 'transparent', border: `1px solid ${theme.border}`, color: theme.textDark, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
            {isDark ? t.lightMode : t.darkMode}
          </button>

          {/* زر إعدادات الأمان */}
          <button onClick={() => setShowSecurityModal(true)} style={{ background: isDark ? '#334155' : '#e2e8f0', border: 'none', color: theme.textDark, padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
            ⚙️ {t.security}
          </button>

          {/* تسجيل الخروج */}
          <button onClick={handleLogout} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
            🚪 {t.logout}
          </button>
        </div>
      </header>

      {/* شريط الأقسام */}
      <div style={{ background: theme.secondary, color: '#fff', padding: '0 30px', display: 'flex', gap: '4px', fontSize: '13px', overflowX: 'auto' }}>
        {[
          { id: 'dashboard', label: t.dashboard },
          { id: 'sales', label: t.sales },
          { id: 'customers', label: t.customers },
          { id: 'inventory', label: t.inventory },
          { id: 'reports', label: t.reports }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? theme.primary : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '16px 20px', fontWeight: activeTab === tab.id ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ padding: '30px', maxWidth: '1400px', margin: 'auto' }}>
        {/* لوحة التحكم */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ margin: '0 0 20px 0', fontSize: '24px', color: theme.textDark }}>{t.welcome} {user.name} 👋</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.invValue}</p>
                <h2 style={{ color: theme.primary, margin: '10px 0 0 0', fontSize: '28px' }}>{inventoryVal.toLocaleString()} {t.currency}</h2>
              </div>
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.salesTotal}</p>
                <h2 style={{ color: theme.accentGreen, margin: '10px 0 0 0', fontSize: '28px' }}>{totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2>
              </div>
              <div style={{ background: theme.cardBg, padding: '25px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.customersTotal}</p>
                <h2 style={{ color: theme.textDark, margin: '10px 0 0 0', fontSize: '28px' }}>{customers.length}</h2>
              </div>
            </div>
          </div>
        )}

        {/* العملاء (إضافة + تعديل + حذف) */}
        {activeTab === 'customers' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3 style={{ marginTop: 0, color: theme.textDark }}>{editingCustId ? t.updateCust : t.addNewCust}</h3>
              <form onSubmit={handleAddOrUpdateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textDark }}>{t.custName}</label>
                  <input type="text" value={custName} onChange={e=>setCustName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textDark }}>{t.custNationalId}</label>
                  <input type="text" value={custNationalId} onChange={e=>setCustNationalId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textDark }}>{t.custPhone}</label>
                  <input type="text" value={custPhone} onChange={e=>setCustPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textDark }}>{t.custEmail}</label>
                  <input type="email" value={custEmail} onChange={e=>setCustEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <button type="submit" disabled={isSavingCustomer} style={{ flex: 1, background: theme.primary, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isSavingCustomer ? '...' : (editingCustId ? t.updateCust : t.saveCust)}
                  </button>
                  {editingCustId && (
                    <button type="button" onClick={() => { setEditingCustId(null); setCustName(''); setCustNationalId(''); setCustPhone(''); setCustEmail(''); }} style={{ background: '#94a3b8', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {t.cancelEdit}
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <h3 style={{ marginTop: 0, color: theme.textDark }}>{t.custDirectory}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#334155' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '10px' }}>{t.custName}</th>
                    <th style={{ padding: '10px' }}>{t.custNationalId}</th>
                    <th style={{ padding: '10px' }}>{t.custPhone}</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: theme.textMuted }}>{t.noCusts}</td></tr>
                  ) : customers.map(c => (
                    <tr key={c.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.name}</td>
                      <td style={{ padding: '10px', color: theme.textMuted }}>{c.nationalId || '-'}</td>
                      <td style={{ padding: '10px' }}>{c.phone || '-'}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button onClick={() => handleEditClick(c)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            ✏️ {t.edit}
                          </button>
                          <button onClick={() => handleDeleteCustomer(c.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                            🗑️ {t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* المبيعات والفوترة الذكية */}
        {activeTab === 'sales' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h2 style={{ marginTop: 0, color: theme.textDark, fontSize: '18px' }}>{t.issueInvoice}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.selectCust}</label>
                  <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, marginTop: '5px' }}>
                    <option value="">{t.defaultCust}</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.selectProd}</label>
                  <select value={selectedProductId} onChange={e => {
                    const prodId = e.target.value;
                    setSelectedProductId(prodId);
                    const p = inventory.find(i => i.id === Number(prodId));
                    if (p) setAmount(p.price); else setAmount('');
                  }} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, marginTop: '5px' }}>
                    <option value="">{t.chooseProd}</option>
                    {inventory.map(p => (
                      <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                        {p.name} — {p.price} {t.currency} {p.stock > 0 ? `(${t.availableStock}: ${p.stock})` : '(نفذت الكمية)'}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.qty}</label>
                    <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box', marginTop: '5px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.unitPrice}</label>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box', marginTop: '5px' }} />
                  </div>
                </div>
                <button onClick={handleSaveInvoice} disabled={isSubmittingSale || !selectedProductId} style={{ background: selectedProductId ? theme.primary : '#94a3b8', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: selectedProductId ? 'pointer' : 'not-allowed', fontSize: '14px', marginTop: '10px' }}>
                  {isSubmittingSale ? '...' : t.confirmSaleBtn}
                </button>
              </div>
            </div>

            {/* بطاقة الضريبة */}
            <div style={{ background: '#020617', borderRadius: '14px', color: '#fff', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{t.summaryTitle}</h3>
                  <span style={{ background: '#0f766e', color: '#5eead4', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>{t.vatBadge}</span>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>{t.subtotal}</span>
                    <strong style={{ color: '#fff' }}>{currentSubtotal.toFixed(2)} {t.currency}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>{t.vatAmount}</span>
                    <strong style={{ color: '#5eead4' }}>{currentTax.toFixed(2)} {t.currency}</strong>
                  </div>
                  <div style={{ borderTop: '1px dashed #334155', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{t.totalDue}</span>
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8' }}>{currentTotal.toFixed(2)} {t.currency}</span>
                  </div>
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>
                {t.vatNote}
              </div>
            </div>
          </div>
        )}

        {/* المخزون */}
        {activeTab === 'inventory' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3 style={{ marginTop: 0, color: theme.textDark }}>➕ إضافة منتج</h3>
              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.prodName}</label><input type="text" value={newProdName} onChange={e=>setNewProdName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.prodPrice}</label><input type="number" value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.prodStock}</label><input type="number" value={newProdStock} onChange={e=>setNewProdStock(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} /></div>
                <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveProd}</button>
              </form>
            </div>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <h3 style={{ marginTop: 0, color: theme.textDark }}>{t.stockRepo}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#334155' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '10px' }}>{t.prodName}</th>
                    <th style={{ padding: '10px' }}>{t.prodPrice}</th>
                    <th style={{ padding: '10px' }}>{t.availableStock}</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(i => (
                    <tr key={i.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{i.name}</td>
                      <td style={{ padding: '10px' }}>{i.price} {t.currency}</td>
                      <td style={{ padding: '10px', color: '#0d9488', fontWeight: 'bold' }}>{i.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* التقارير */}
        {activeTab === 'reports' && (
          <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
            <h2 style={{ marginTop: 0, color: theme.textDark, fontSize: '18px' }}>{t.invRepo}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: isDark ? '#334155' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                  <th style={{ padding: '10px' }}>{t.invNo}</th>
                  <th style={{ padding: '10px' }}>{t.clientCol}</th>
                  <th style={{ padding: '10px' }}>{t.itemCol}</th>
                  <th style={{ padding: '10px' }}>{t.subtotal}</th>
                  <th style={{ padding: '10px' }}>{t.vatAmount}</th>
                  <th style={{ padding: '10px' }}>{t.totalDue}</th>
                  <th style={{ padding: '10px' }}>{t.dateCol}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: theme.textMuted }}>{t.noInvoices}</td></tr>
                ) : invoices.map(inv => (
                  <tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: theme.primary }}>#{inv.invoiceNo}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{inv.customer?.name || t.defaultCust}</td>
                    <td style={{ padding: '10px' }}>{inv.items?.[0]?.product?.name || 'Item'} ({inv.items?.[0]?.quantity})</td>
                    <td style={{ padding: '10px' }}>{Number(inv.subtotal || 0).toFixed(2)} {t.currency}</td>
                    <td style={{ padding: '10px', color: '#0d9488' }}>{Number(inv.taxAmount || 0).toFixed(2)} {t.currency}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{Number(inv.totalAmount || 0).toFixed(2)} {t.currency}</td>
                    <td style={{ padding: '10px', color: theme.textMuted }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* نافذة الأمان والحساب المنبثقة */}
      {showSecurityModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: theme.cardBg, padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '480px', border: `1px solid ${theme.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', color: theme.textDark }}>{t.security}</h2>
              <button onClick={() => setShowSecurityModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>

            {/* تغيير كلمة المرور المشدد */}
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: `1px solid ${theme.border}`, paddingBottom: '20px', marginBottom: '20px' }}>
              <h4 style={{ margin: 0, color: theme.primary }}>{t.changePassTitle}</h4>
              <input type="password" placeholder={t.oldPass} value={currentPass} onChange={e=>setCurrentPass(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark }} />
              <input type="password" placeholder={t.newPass} value={newPass} onChange={e=>setNewPass(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark }} />
              <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.updatePassBtn}</button>
            </form>

            {/* منطقة الخطر: حذف الحساب */}
            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h4 style={{ margin: 0, color: '#dc2626' }}>{t.deleteAccTitle}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>{t.deleteAccNote}</p>
              <input type="password" placeholder={t.oldPass} value={deleteConfirmPass} onChange={e=>setDeleteConfirmPass(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark }} />
              <button type="submit" style={{ background: '#dc2626', color: '#fff', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.deleteAccBtn}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;