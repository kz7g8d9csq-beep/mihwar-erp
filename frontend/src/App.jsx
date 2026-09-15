import { useState, useEffect } from 'react';
import API from './services/api';

// قاموس اللغات المتكامل
const dict = {
  ar: {
    brand: 'محور ERP',
    tagline: 'إدارة متكاملة برؤية مستقبلية.',
    taglineSub: 'نظام سحابي متطور لربط كافة أقسام منشأتك.',
    workspace: 'مساحة العمل:',
    dashboard: '📊 لوحة التحكم',
    sales: '🛍️ المبيعات والفوترة',
    purchases: '📥 المشتريات والتوريد',
    customers: '👥 العملاء',
    suppliers: '🏭 الموردين',
    inventory: '📦 المخزون (حي)',
    reports: '📈 الفواتير والتقارير',
    settings: '⚙️ الإعدادات',
    welcome: 'مرحباً بك،',
    invValue: 'قيمة المخزون الحالي (TiDB)',
    salesTotal: 'إجمالي المبيعات مع الضريبة',
    purchasesTotal: 'إجمالي المشتريات مع الضريبة',
    customersTotal: 'العملاء المسجلين',
    suppliersTotal: 'الموردين المسجلين',
    currency: 'ر.س',

    // العملاء
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

    // الموردين
    addNewSupp: '🏭 فتح حساب مورد جديد',
    suppName: 'اسم المورد / الشركة الموردة *',
    suppTaxNumber: 'الرقم الضريبي / السجل التجاري للمورد',
    suppPhone: 'رقم الهاتف / مسؤول المبيعات',
    suppEmail: 'البريد الإلكتروني للمورد',
    saveSupp: 'حفظ حساب المورد',
    updateSupp: 'تحديث بيانات المورد',
    suppDirectory: '📋 دليل الموردين المعتمدين (TiDB)',
    confirmDeleteSupp: 'هل أنت متأكد من حذف هذا المورد؟',
    noSupps: 'لا يوجد موردون مسجلون حالياً.',

    // المبيعات
    issueInvoice: '⚡ إصدار فاتورة بيع جديدة',
    selectCust: 'العميل',
    defaultCust: 'عميل نقدي عام (افتراضي)',
    selectProd: 'المنتج (يسحب تلقائياً من TiDB)',
    chooseProd: '-- اختر المنتج من المستودع --',
    qty: 'الكمية المطلوبة',
    unitPrice: 'سعر البيع (ر.س)',
    confirmSaleBtn: '💳 إصدار الفاتورة وخصم المخزون',
    summaryTitle: 'ملخص الحسبة التلقائية',
    vatBadge: 'ضريبة 15% آلية',
    subtotal: 'المبلغ الخاضع للضريبة:',
    vatAmount: 'ضريبة القيمة المضافة (15%):',
    totalDue: 'الإجمالي المستحق:',
    vatNote: '💡 تُخصم الكمية فوراً من رصيد المستودع، وتُربط الفاتورة بـ TiDB.',

    // المشتريات
    issuePurchase: '📥 تسجيل فاتورة شراء وتوريد بضاعة',
    selectSupp: 'المورد',
    defaultSupp: 'توريد نقدي مباشر',
    purchaseProd: 'المنتج المستهدف للتوريد',
    purchaseQty: 'الكمية الموردة (ستضاف للمخزون)',
    purchaseCost: 'سعر التكلفة للوحدة (ر.س)',
    confirmPurchaseBtn: '📦 اعتماد الفاتورة وتوريد المخزون',
    purchaseVatNote: '💡 ستتم زيادة رصيد المستودع فوراً وتحديث تكلفة الصنف آلياً.',

    // التقارير والطباعة
    invRepo: 'سجل الفواتير والمبيعات المعتمدة',
    purchasesRepo: 'سجل فواتير المشتريات والتوريد',
    invNo: 'رقم الفاتورة',
    clientCol: 'العميل / المستلم',
    suppCol: 'المورد',
    itemCol: 'المنتج',
    dateCol: 'التاريخ',
    noInvoices: 'لا توجد فواتير مبيعات مسجلة حتى الآن.',
    noPurchases: 'لا توجد فواتير شراء مسجلة حتى الآن.',
    viewAndPrint: '👁️ معاينة وطباعة',
    printBtn: '🖨️ طباعة الفاتورة / تصدير PDF',
    closeModal: '✖ إغلاق',
    taxInvoiceTitle: 'فاتورة ضريبية مبسطة',
    vatRegNo: 'الرقم الضريبي:',
    zatcaBadge: 'معتمدة - هيئة الزكاة والضريبة ZATCA',
    invoiceDate: 'تاريخ ووقت الإصدار:',
    buyerInfo: 'بيانات العميل المستلم:',
    itemDesc: 'بيان الصنف والخدمة',
    itemQuantity: 'الكمية',
    unitPriceCol: 'سعر الوحدة',
    totalCol: 'المجموع الخاضع للضريبة',
    zatcaQRTitle: 'رمز الاستجابة السريعة (ZATCA QR)',
    zatcaQRSub: 'امسح الرمز للتحقق من بيانات الفاتورة الضريبية',
    invoiceFooterNote: 'شكراً لتعاملكم معنا • صدرت إلكترونياً عبر نظام محور ERP',

    // المخزون
    prodName: 'اسم المنتج',
    prodPrice: 'سعر البيع الافتراضي (ر.س)',
    prodStock: 'الكمية الأولية بالمخزون',
    saveProd: 'حفظ المنتج في TiDB',
    stockRepo: '📦 مستودع المنتجات (متصل بـ TiDB)',
    availableStock: 'الرصيد الفعلي',

    // الإعدادات
    settingsHeader: 'مركز إعدادات النظام وتخصيص الحساب',
    settingsSub: 'التحكم في المظهر واللغة والأمان المشدد لمنشأتك',
    prefTitle: '🌐 تفضيلات اللغة والمظهر',
    prefDesc: 'تخصيص لغة النظام ونمط الشاشة لتناسب استخدامك',
    langLabel: 'لغة النظام:',
    themeLabel: 'نمط العرض:',
    darkMode: 'الوضع الليلي 🌙',
    lightMode: 'الوضع النهاري ☀️',
    securityTitle: '🔒 حماية الحساب وتغيير كلمة المرور',
    securityDesc: 'تغيير كلمة المرور بضوابط أمان مشددة (8 خانات كحد أدنى)',
    oldPass: 'كلمة المرور الحالية',
    newPass: 'كلمة المرور الجديدة (8 خانات فأكثر)',
    updatePassBtn: 'تحديث كلمة المرور فوراً',
    sessionTitle: '🚪 الجلسة وإدارة الحساب',
    sessionDesc: 'تسجيل الخروج أو إيقاف الحساب نهائياً',
    logoutBtn: 'تسجيل الخروج من النظام',
    dangerZoneTitle: '⚠️ منطقة الخطر: تعطيل وحذف الحساب',
    dangerZoneDesc: 'سيتم تعطيل الحساب وحظر الدخول نهائياً. أدخل كلمة المرور للتأكيد:',
    deleteAccBtn: 'تعطيل الحساب نهائياً'
  },
  en: {
    brand: 'Mihwar ERP',
    tagline: 'Enterprise Management Reimagined.',
    taglineSub: 'Next-generation cloud ERP connecting every department.',
    workspace: 'Workspace:',
    dashboard: '📊 Dashboard',
    sales: '🛍️ Sales & POS',
    purchases: '📥 Purchasing & Inbound',
    customers: '👥 Clients',
    suppliers: '🏭 Suppliers',
    inventory: '📦 Live Inventory',
    reports: '📈 Reports & Invoices',
    settings: '⚙️ Settings',
    welcome: 'Welcome,',
    invValue: 'Inventory Value (TiDB)',
    salesTotal: 'Total Sales (Incl. VAT)',
    purchasesTotal: 'Total Purchases (Incl. VAT)',
    customersTotal: 'Registered Clients',
    suppliersTotal: 'Registered Suppliers',
    currency: 'SAR',

    // Customers
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

    // Suppliers
    addNewSupp: '🏭 Add New Supplier Account',
    suppName: 'Supplier / Company Name *',
    suppTaxNumber: 'Tax ID / CR Number',
    suppPhone: 'Phone / Sales Rep',
    suppEmail: 'Supplier Email',
    saveSupp: 'Save Supplier Account',
    updateSupp: 'Update Supplier Info',
    suppDirectory: '📋 Registered Suppliers (TiDB)',
    confirmDeleteSupp: 'Are you sure you want to delete this supplier?',
    noSupps: 'No suppliers registered yet.',

    // Sales
    issueInvoice: '⚡ Generate New Sales Invoice',
    selectCust: 'Client',
    defaultCust: 'General Cash Customer (Default)',
    selectProd: 'Product (Live TiDB Stock)',
    chooseProd: '-- Select product from warehouse --',
    qty: 'Required Quantity',
    unitPrice: 'Sale Price (SAR)',
    confirmSaleBtn: '💳 Confirm & Deplete Stock',
    summaryTitle: 'Live Tax Summary',
    vatBadge: 'Automated 15% VAT',
    subtotal: 'Taxable Amount:',
    vatAmount: 'Value Added Tax (15%):',
    totalDue: 'Total Amount Due:',
    vatNote: '💡 Stock is depleted atomically, invoice is bound to TiDB.',

    // Purchases
    issuePurchase: '📥 Record Purchase & Inbound Stock',
    selectSupp: 'Supplier',
    defaultSupp: 'Direct Cash Inbound',
    purchaseProd: 'Target Product',
    purchaseQty: 'Inbound Quantity (Adds to stock)',
    purchaseCost: 'Unit Cost Price (SAR)',
    confirmPurchaseBtn: '📦 Confirm & Replenish Stock',
    purchaseVatNote: '💡 Warehouse stock will increase immediately, updating unit cost.',

    // Reports & Invoices
    invRepo: 'Verified Sales Invoices',
    purchasesRepo: 'Verified Purchase Invoices',
    invNo: 'Invoice #',
    clientCol: 'Client / Buyer',
    suppCol: 'Supplier',
    itemCol: 'Item',
    dateCol: 'Date',
    noInvoices: 'No sales invoices recorded yet.',
    noPurchases: 'No purchase invoices recorded yet.',
    viewAndPrint: '👁️ View & Print',
    printBtn: '🖨️ Print Invoice / PDF Export',
    closeModal: '✖ Close',
    taxInvoiceTitle: 'Simplified Tax Invoice',
    vatRegNo: 'VAT Registration No:',
    zatcaBadge: 'Approved - ZATCA Compliant',
    invoiceDate: 'Date & Time Issued:',
    buyerInfo: 'Client / Buyer Information:',
    itemDesc: 'Item & Service Description',
    itemQuantity: 'Qty',
    unitPriceCol: 'Unit Price',
    totalCol: 'Taxable Subtotal',
    zatcaQRTitle: 'ZATCA Official QR Code',
    zatcaQRSub: 'Scan to verify electronic tax invoice details',
    invoiceFooterNote: 'Thank you for your business • Issued electronically via Mihwar ERP',

    // Inventory
    prodName: 'Product Name',
    prodPrice: 'Default Sale Price (SAR)',
    prodStock: 'Initial Stock Quantity',
    saveProd: 'Save Product to TiDB',
    stockRepo: '📦 Warehouse Products (TiDB Connected)',
    availableStock: 'Available Stock',

    // Settings
    settingsHeader: 'System Settings & Account Management',
    settingsSub: 'Control enterprise preferences, display, language, and security',
    prefTitle: '🌐 Language & Display Preferences',
    prefDesc: 'Customize interface language and visual workspace theme',
    langLabel: 'System Language:',
    themeLabel: 'Color Theme:',
    darkMode: 'Dark Mode 🌙',
    lightMode: 'Light Mode ☀️',
    securityTitle: '🔒 Account Security & Password',
    securityDesc: 'Update your password under strict security rules (8+ characters)',
    oldPass: 'Current Password',
    newPass: 'New Password (8+ characters)',
    updatePassBtn: 'Update Password Now',
    sessionTitle: '🚪 Session & Account Controls',
    sessionDesc: 'Sign out or manage permanent account status',
    logoutBtn: 'Sign Out from System',
    dangerZoneTitle: '⚠️ Danger Zone: Deactivate Account',
    dangerZoneDesc: 'Your account will be permanently deactivated. Enter password to confirm:',
    deleteAccBtn: 'Permanently Deactivate Account'
  }
};

// خوارزمية تشفير رمز الاستجابة السريعة (ZATCA TLV Base64)
const generateZatcaQR = (invoice, companyName, defaultVatNo = '300123456700003') => {
  try {
    const getTlv = (tag, value) => {
      const str = String(value || '');
      const utf8Bytes = new TextEncoder().encode(str);
      return [tag, utf8Bytes.length, ...utf8Bytes];
    };

    const seller = companyName || 'محور ERP';
    const vatNo = defaultVatNo;
    const timeStr = invoice?.createdAt ? new Date(invoice.createdAt).toISOString() : new Date().toISOString();
    const total = Number(invoice?.totalAmount || 0).toFixed(2);
    const tax = Number(invoice?.taxAmount || 0).toFixed(2);

    const tlvBytes = [
      ...getTlv(1, seller),
      ...getTlv(2, vatNo),
      ...getTlv(3, timeStr),
      ...getTlv(4, total),
      ...getTlv(5, tax)
    ];

    let binary = '';
    for (let i = 0; i < tlvBytes.length; i++) {
      binary += String.fromCharCode(tlvBytes[i]);
    }
    const base64TLV = btoa(binary);
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(base64TLV)}`;
  } catch {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MihwarERP';
  }
};

function App() {
  const [lang, setLang] = useState('ar');
  const [isDark, setIsDark] = useState(false);

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

  // الموردين
  const [suppliers, setSuppliers] = useState([]);
  const [suppName, setSuppName] = useState('');
  const [suppTaxNumber, setSuppTaxNumber] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [suppEmail, setSuppEmail] = useState('');
  const [editingSuppId, setEditingSuppId] = useState(null);
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);

  // المبيعات
  const [invoices, setInvoices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState(1);
  const [amount, setAmount] = useState('');
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  // المشتريات
  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPurchaseProdId, setSelectedPurchaseProdId] = useState('');
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [purchaseCost, setPurchaseCost] = useState('');
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);

  // معاينة الفاتورة
  const [printingInvoice, setPrintingInvoice] = useState(null);

  // أمان الحساب
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
    accentGreen: '#10b981',
    accentAmber: '#f59e0b'
  };

  useEffect(() => {
    if (user) {
      setBusinessName(user.businessName || 'محور ERP');
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = () => {
    fetchInventory();
    fetchCustomers();
    fetchSuppliers();
    fetchInvoices();
    fetchPurchases();
  };

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

  const fetchSuppliers = async () => {
    try {
      const res = await API.get('/api/suppliers');
      if (res.data) setSuppliers(res.data);
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

  const fetchPurchases = async () => {
    try {
      const res = await API.get('/api/purchases');
      if (res.data) setPurchaseInvoices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // معالجات العملاء
  const handleAddOrUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!custName.trim()) return;
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
      alert(err.response?.data?.error || 'Error saving client');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm(t.confirmDeleteCust)) return;
    try {
      await API.delete(`/api/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete client');
    }
  };

  // معالجات الموردين
  const handleAddOrUpdateSupplier = async (e) => {
    e.preventDefault();
    if (!suppName.trim()) return;
    setIsSavingSupplier(true);
    try {
      if (editingSuppId) {
        await API.put(`/api/suppliers/${editingSuppId}`, {
          name: suppName.trim(),
          taxNumber: suppTaxNumber.trim() || null,
          phone: suppPhone.trim() || null,
          email: suppEmail.trim() || null
        });
        alert(lang === 'ar' ? '✅ تم تحديث بيانات المورد بنجاح!' : 'Supplier updated successfully!');
        setEditingSuppId(null);
      } else {
        await API.post('/api/suppliers', {
          name: suppName.trim(),
          taxNumber: suppTaxNumber.trim() || null,
          phone: suppPhone.trim() || null,
          email: suppEmail.trim() || null
        });
        alert(lang === 'ar' ? '✅ تم فتح حساب المورد في TiDB بنجاح!' : 'Supplier account created in TiDB!');
      }
      setSuppName('');
      setSuppTaxNumber('');
      setSuppPhone('');
      setSuppEmail('');
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving supplier');
    } finally {
      setIsSavingSupplier(false);
    }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm(t.confirmDeleteSupp)) return;
    try {
      await API.delete(`/api/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete supplier');
    }
  };

  // إضافة منتج
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

  // اعتماد عملية بيع
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

      const newInv = res.data?.invoice;
      alert(`✅ ${res.data.message || 'Invoice generated successfully!'}`);
      setSelectedProductId('');
      setAmount('');
      setQty(1);
      fetchAllData();
      if (newInv) setPrintingInvoice(newInv);
      setActiveTab('reports');
    } catch (err) {
      alert(err.response?.data?.error || 'Sales process failed');
    } finally {
      setIsSubmittingSale(false);
    }
  };

  // اعتماد عملية شراء وتوريد
  const handleSavePurchase = async () => {
    if (!selectedPurchaseProdId || !purchaseQty || !purchaseCost) {
      alert(lang === 'ar' ? 'الرجاء اختيار المنتج وتحديد الكمية وسعر التكلفة' : 'Please select product, quantity, and cost');
      return;
    }
    setIsSubmittingPurchase(true);
    try {
      const res = await API.post('/api/purchases', {
        productId: Number(selectedPurchaseProdId),
        quantity: Number(purchaseQty),
        unitCost: Number(purchaseCost),
        supplierId: selectedSupplierId ? Number(selectedSupplierId) : null
      });

      alert(`✅ ${res.data.message || 'Purchase recorded & stock replenished!'}`);
      setSelectedPurchaseProdId('');
      setPurchaseCost('');
      setPurchaseQty(10);
      fetchAllData();
      setActiveTab('inventory');
    } catch (err) {
      alert(err.response?.data?.error || 'Purchase process failed');
    } finally {
      setIsSubmittingPurchase(false);
    }
  };

  // الحسابات اللحظية
  const salesSubtotal = (Number(amount) || 0) * (Number(qty) || 0);
  const salesTax = salesSubtotal * 0.15;
  const salesTotal = salesSubtotal + salesTax;

  const purchaseSubtotal = (Number(purchaseCost) || 0) * (Number(purchaseQty) || 0);
  const purchaseTax = purchaseSubtotal * 0.15;
  const purchaseTotal = purchaseSubtotal + purchaseTax;

  const inventoryVal = inventory.reduce((sum, i) => sum + (Number(i.price) * Number(i.stock)), 0);
  const totalSalesVal = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const totalPurchasesVal = purchaseInvoices.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);

  // أمان الحساب
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) {
      alert(lang === 'ar' ? 'كلمة المرور يجب ألا تقل عن 8 خانات' : 'Password must be 8+ characters');
      return;
    }
    try {
      const res = await API.post('/api/change-password', { currentPassword: currentPass, newPassword: newPass });
      alert(`✅ ${res.data.message}`);
      setCurrentPass('');
      setNewPass('');
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
  };

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
      
      {/* ستايل الطباعة المنعزل */}
      <style>{`
        @media print {
          header, .main-navbar, main, .no-print-zone {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-modal-backdrop {
            position: static !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            display: block !important;
          }
          .invoice-modal-card {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            border-radius: 0 !important;
          }
          #zatca-printable-invoice {
            display: block !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* الترويسة العلوية */}
      <header style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: '14px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f766e, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
              🏢
            </div>
            <span style={{ fontWeight: '900', color: theme.textDark, fontSize: '19px' }}>{t.brand}</span>
          </div>
          <span style={{ fontSize: '13px', background: isDark ? '#334155' : '#f1f5f9', padding: '6px 14px', borderRadius: '8px', color: theme.textDark }}>
            {t.workspace} <strong>{businessName}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: theme.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            {user.name ? user.name[0] : 'U'}
          </div>
          <span style={{ fontSize: '14px', fontWeight: '800', color: theme.textDark }}>{user.name}</span>
        </div>
      </header>

      {/* شريط الأقسام الرئيسي */}
      <div className="main-navbar" style={{ background: theme.secondary, color: '#fff', padding: '0 30px', display: 'flex', gap: '4px', fontSize: '13px', overflowX: 'auto' }}>
        {[
          { id: 'dashboard', label: t.dashboard },
          { id: 'sales', label: t.sales },
          { id: 'purchases', label: t.purchases },
          { id: 'customers', label: t.customers },
          { id: 'suppliers', label: t.suppliers },
          { id: 'inventory', label: t.inventory },
          { id: 'reports', label: t.reports },
          { id: 'settings', label: t.settings }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? theme.primary : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '16px 18px', fontWeight: activeTab === tab.id ? 'bold' : 'normal', whiteSpace: 'nowrap', transition: '0.2s' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ padding: '30px', maxWidth: '1400px', margin: 'auto' }}>
        {/* لوحة التحكم */}
        {activeTab === 'dashboard' && (
          <div>
            <h1 style={{ margin: '0 0 20px 0', fontSize: '24px', color: theme.textDark }}>{t.welcome} {user.name} 👋</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.invValue}</p>
                <h2 style={{ color: theme.primary, margin: '8px 0 0 0', fontSize: '24px' }}>{inventoryVal.toLocaleString()} {t.currency}</h2>
              </div>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.salesTotal}</p>
                <h2 style={{ color: theme.accentGreen, margin: '8px 0 0 0', fontSize: '24px' }}>{totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2>
              </div>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.purchasesTotal}</p>
                <h2 style={{ color: theme.accentAmber, margin: '8px 0 0 0', fontSize: '24px' }}>{totalPurchasesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2>
              </div>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.customersTotal} / {t.suppliersTotal}</p>
                <h2 style={{ color: theme.textDark, margin: '8px 0 0 0', fontSize: '24px' }}>{customers.length} / {suppliers.length}</h2>
              </div>
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

            {/* بطاقة الضريبة للمبيعات */}
            <div style={{ background: '#020617', borderRadius: '14px', color: '#fff', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{t.summaryTitle}</h3>
                  <span style={{ background: '#0f766e', color: '#5eead4', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>{t.vatBadge}</span>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>{t.subtotal}</span>
                    <strong style={{ color: '#fff' }}>{salesSubtotal.toFixed(2)} {t.currency}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>{t.vatAmount}</span>
                    <strong style={{ color: '#5eead4' }}>{salesTax.toFixed(2)} {t.currency}</strong>
                  </div>
                  <div style={{ borderTop: '1px dashed #334155', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{t.totalDue}</span>
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#38bdf8' }}>{salesTotal.toFixed(2)} {t.currency}</span>
                  </div>
                </div>
              </div>
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>
                {t.vatNote}
              </div>
            </div>
          </div>
        )}

        {/* المشتريات والتوريد الذكي (جديد) */}
        {activeTab === 'purchases' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h2 style={{ marginTop: 0, color: theme.textDark, fontSize: '18px' }}>{t.issuePurchase}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.selectSupp}</label>
                  <select value={selectedSupplierId} onChange={e => setSelectedSupplierId(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, marginTop: '5px' }}>
                    <option value="">{t.defaultSupp}</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} {s.phone ? `(${s.phone})` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.purchaseProd}</label>
                  <select value={selectedPurchaseProdId} onChange={e => {
                    const prodId = e.target.value;
                    setSelectedPurchaseProdId(prodId);
                    const p = inventory.find(i => i.id === Number(prodId));
                    if (p) setPurchaseCost(p.cost || p.price);
                  }} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, marginTop: '5px' }}>
                    <option value="">{t.chooseProd}</option>
                    {inventory.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ({t.availableStock}: {p.stock} وحدة)
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.purchaseQty}</label>
                    <input type="number" min="1" value={purchaseQty} onChange={e => setPurchaseQty(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box', marginTop: '5px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold' }}>{t.purchaseCost}</label>
                    <input type="number" value={purchaseCost} onChange={e => setPurchaseCost(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box', marginTop: '5px' }} />
                  </div>
                </div>
                <button onClick={handleSavePurchase} disabled={isSubmittingPurchase || !selectedPurchaseProdId} style={{ background: selectedPurchaseProdId ? theme.accentAmber : '#94a3b8', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: selectedPurchaseProdId ? 'pointer' : 'not-allowed', fontSize: '14px', marginTop: '10px' }}>
                  {isSubmittingPurchase ? '...' : t.confirmPurchaseBtn}
                </button>
              </div>
            </div>

            {/* بطاقة ضريبة المشتريات */}
            <div style={{ background: '#0f172a', borderRadius: '14px', color: '#fff', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>{t.summaryTitle} (مشتريات)</h3>
                  <span style={{ background: '#b45309', color: '#fde68a', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>ضريبة مدخلات 15%</span>
                </div>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>المبلغ قبل الضريبة:</span>
                    <strong style={{ color: '#fff' }}>{purchaseSubtotal.toFixed(2)} {t.currency}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>ضريبة القيمة المضافة (15%):</span>
                    <strong style={{ color: '#fde68a' }}>{purchaseTax.toFixed(2)} {t.currency}</strong>
                  </div>
                  <div style={{ borderTop: '1px dashed #334155', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>إجمالي فاتورة الشراء:</span>
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#f59e0b' }}>{purchaseTotal.toFixed(2)} {t.currency}</span>
                  </div>
                </div>
              </div>
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>
                {t.purchaseVatNote}
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
                          <button onClick={() => { setEditingCustId(c.id); setCustName(c.name); setCustNationalId(c.nationalId||''); setCustPhone(c.phone||''); setCustEmail(c.email||''); }} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>✏️ {t.edit}</button>
                          <button onClick={() => handleDeleteCustomer(c.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ {t.delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* الموردين (جديد: إضافة + تعديل + حذف) */}
        {activeTab === 'suppliers' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3 style={{ marginTop: 0, color: theme.textDark }}>{editingSuppId ? t.updateSupp : t.addNewSupp}</h3>
              <form onSubmit={handleAddOrUpdateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textDark }}>{t.suppName}</label>
                  <input type="text" value={suppName} onChange={e=>setSuppName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textDark }}>{t.suppTaxNumber}</label>
                  <input type="text" value={suppTaxNumber} onChange={e=>setSuppTaxNumber(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textDark }}>{t.suppPhone}</label>
                  <input type="text" value={suppPhone} onChange={e=>setSuppPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textDark }}>{t.suppEmail}</label>
                  <input type="email" value={suppEmail} onChange={e=>setSuppEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  <button type="submit" disabled={isSavingSupplier} style={{ flex: 1, background: theme.primary, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isSavingSupplier ? '...' : (editingSuppId ? t.updateSupp : t.saveSupp)}
                  </button>
                  {editingSuppId && (
                    <button type="button" onClick={() => { setEditingSuppId(null); setSuppName(''); setSuppTaxNumber(''); setSuppPhone(''); setSuppEmail(''); }} style={{ background: '#94a3b8', color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      {t.cancelEdit}
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <h3 style={{ marginTop: 0, color: theme.textDark }}>{t.suppDirectory}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#334155' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '10px' }}>{t.suppName}</th>
                    <th style={{ padding: '10px' }}>{t.suppTaxNumber}</th>
                    <th style={{ padding: '10px' }}>{t.suppPhone}</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: theme.textMuted }}>{t.noSupps}</td></tr>
                  ) : suppliers.map(s => (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{s.name}</td>
                      <td style={{ padding: '10px', color: theme.textMuted }}>{s.taxNumber || '-'}</td>
                      <td style={{ padding: '10px' }}>{s.phone || '-'}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button onClick={() => { setEditingSuppId(s.id); setSuppName(s.name); setSuppTaxNumber(s.taxNumber||''); setSuppPhone(s.phone||''); setSuppEmail(s.email||''); }} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>✏️ {t.edit}</button>
                          <button onClick={() => handleDeleteSupplier(s.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🗑️ {t.delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {/* التقارير والفواتير (مبيعات + مشتريات) */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {/* جدول المبيعات */}
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
                    <th style={{ padding: '10px', textAlign: 'center' }}>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr><td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: theme.textMuted }}>{t.noInvoices}</td></tr>
                  ) : invoices.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: theme.primary }}>#{inv.invoiceNo}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{inv.customer?.name || t.defaultCust}</td>
                      <td style={{ padding: '10px' }}>{inv.items?.[0]?.product?.name || 'Item'} ({inv.items?.[0]?.quantity})</td>
                      <td style={{ padding: '10px' }}>{Number(inv.subtotal || 0).toFixed(2)} {t.currency}</td>
                      <td style={{ padding: '10px', color: '#0d9488' }}>{Number(inv.taxAmount || 0).toFixed(2)} {t.currency}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{Number(inv.totalAmount || 0).toFixed(2)} {t.currency}</td>
                      <td style={{ padding: '10px', color: theme.textMuted }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <button onClick={() => setPrintingInvoice(inv)} style={{ background: theme.primary, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                          {t.viewAndPrint}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* جدول المشتريات والتوريد */}
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <h2 style={{ marginTop: 0, color: theme.textDark, fontSize: '18px' }}>{t.purchasesRepo}</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#334155' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '10px' }}>{t.invNo}</th>
                    <th style={{ padding: '10px' }}>{t.suppCol}</th>
                    <th style={{ padding: '10px' }}>{t.itemCol}</th>
                    <th style={{ padding: '10px' }}>المبلغ الأساسي</th>
                    <th style={{ padding: '10px' }}>الضريبة (15%)</th>
                    <th style={{ padding: '10px' }}>الإجمالي</th>
                    <th style={{ padding: '10px' }}>{t.dateCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseInvoices.length === 0 ? (
                    <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: theme.textMuted }}>{t.noPurchases}</td></tr>
                  ) : purchaseInvoices.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: theme.accentAmber }}>#{p.invoiceNo}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.supplier?.name || t.defaultSupp}</td>
                      <td style={{ padding: '10px' }}>{p.items?.[0]?.product?.name || 'Item'} (+{p.items?.[0]?.quantity})</td>
                      <td style={{ padding: '10px' }}>{Number(p.subtotal || 0).toFixed(2)} {t.currency}</td>
                      <td style={{ padding: '10px', color: '#0d9488' }}>{Number(p.taxAmount || 0).toFixed(2)} {t.currency}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{Number(p.totalAmount || 0).toFixed(2)} {t.currency}</td>
                      <td style={{ padding: '10px', color: theme.textMuted }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ⚙️ مركز الإعدادات */}
        {activeTab === 'settings' && (
          <div>
            <div style={{ marginBottom: '25px' }}>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', color: theme.textDark }}>{t.settingsHeader}</h1>
              <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.settingsSub}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', color: theme.textDark }}>{t.prefTitle}</h3>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.prefDesc}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: theme.textDark, display: 'block', marginBottom: '8px' }}>{t.langLabel}</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setLang('ar')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${lang === 'ar' ? theme.primary : theme.border}`, background: lang === 'ar' ? theme.primary : 'transparent', color: lang === 'ar' ? '#fff' : theme.textDark, fontWeight: 'bold', cursor: 'pointer' }}>
                        🇸🇦 العربية
                      </button>
                      <button onClick={() => setLang('en')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${lang === 'en' ? theme.primary : theme.border}`, background: lang === 'en' ? theme.primary : 'transparent', color: lang === 'en' ? '#fff' : theme.textDark, fontWeight: 'bold', cursor: 'pointer' }}>
                        🇺🇸 English
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: theme.textDark, display: 'block', marginBottom: '8px' }}>{t.themeLabel}</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => setIsDark(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${!isDark ? theme.primary : theme.border}`, background: !isDark ? theme.primary : 'transparent', color: !isDark ? '#fff' : theme.textDark, fontWeight: 'bold', cursor: 'pointer' }}>
                        {t.lightMode}
                      </button>
                      <button onClick={() => setIsDark(true)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${isDark ? theme.primary : theme.border}`, background: isDark ? theme.primary : 'transparent', color: isDark ? '#fff' : theme.textDark, fontWeight: 'bold', cursor: 'pointer' }}>
                        {t.darkMode}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h3 style={{ margin: '0 0 6px 0', color: theme.textDark }}>{t.securityTitle}</h3>
                <p style={{ margin: '0 0 15px 0', color: theme.textMuted, fontSize: '13px' }}>{t.securityDesc}</p>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="password" placeholder={t.oldPass} value={currentPass} onChange={e=>setCurrentPass(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark }} />
                  <input type="password" placeholder={t.newPass} value={newPass} onChange={e=>setNewPass(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark }} />
                  <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                    {t.updatePassBtn}
                  </button>
                </form>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', color: theme.textDark }}>{t.sessionTitle}</h3>
                  <p style={{ margin: '0 0 15px 0', color: theme.textMuted, fontSize: '13px' }}>{t.sessionDesc}</p>
                  <button onClick={handleLogout} style={{ width: '100%', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                    🚪 {t.logoutBtn}
                  </button>
                </div>
                <div style={{ borderTop: `1px dashed ${theme.border}`, paddingTop: '15px' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#dc2626' }}>{t.dangerZoneTitle}</h4>
                  <p style={{ margin: '0 0 10px 0', color: theme.textMuted, fontSize: '12px' }}>{t.dangerZoneDesc}</p>
                  <form onSubmit={handleDeleteAccount} style={{ display: 'flex', gap: '10px' }}>
                    <input type="password" placeholder={t.oldPass} value={deleteConfirmPass} onChange={e=>setDeleteConfirmPass(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark }} />
                    <button type="submit" style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {t.deleteAccBtn}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* نافذة الفاتورة الضريبية الرسمية المعتمدة */}
      {printingInvoice && (
        <div className="invoice-modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', boxSizing: 'border-box' }}>
          <div className="invoice-modal-card" style={{ background: '#ffffff', color: '#0f172a', width: '100%', maxWidth: '780px', maxHeight: '95vh', overflowY: 'auto', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
            
            <div className="no-print-zone" style={{ background: '#0f172a', color: '#fff', padding: '14px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{t.taxInvoiceTitle} - #{printingInvoice.invoiceNo}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ background: '#0f766e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {t.printBtn}
                </button>
                <button onClick={() => setPrintingInvoice(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                  {t.closeModal}
                </button>
              </div>
            </div>

            <div id="zatca-printable-invoice" style={{ padding: '35px', background: '#ffffff', color: '#0f172a', fontFamily: 'Cairo, Tahoma, sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '25px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}>🏢</div>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>{businessName}</h1>
                  </div>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#475569' }}>{t.vatRegNo} <strong>300123456700003</strong></p>
                  <span style={{ display: 'inline-block', marginTop: '6px', background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                    ✔ {t.zatcaBadge}
                  </span>
                </div>

                <div style={{ textAlign: lang === 'ar' ? 'left' : 'right' }}>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#0f766e', fontWeight: '800' }}>{t.taxInvoiceTitle}</h2>
                  <p style={{ margin: '2px 0', fontSize: '13px', fontWeight: 'bold' }}>#{printingInvoice.invoiceNo}</p>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#64748b' }}>
                    {t.invoiceDate} {new Date(printingInvoice.createdAt).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>{t.buyerInfo}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{printingInvoice.customer?.name || t.defaultCust}</span>
                  </div>
                  {printingInvoice.customer?.nationalId && (
                    <div style={{ fontSize: '13px', color: '#334155' }}>
                      <span>الهوية / السجل: </span>
                      <strong>{printingInvoice.customer.nationalId}</strong>
                    </div>
                  )}
                  {printingInvoice.customer?.phone && (
                    <div style={{ fontSize: '13px', color: '#334155' }}>
                      <span>الهاتف: </span>
                      <strong>{printingInvoice.customer.phone}</strong>
                    </div>
                  )}
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', marginBottom: '25px', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                    <th style={{ padding: '10px 14px', borderTopLeftRadius: lang === 'ar' ? '0' : '6px', borderTopRightRadius: lang === 'ar' ? '6px' : '0' }}>#</th>
                    <th style={{ padding: '10px 14px' }}>{t.itemDesc}</th>
                    <th style={{ padding: '10px 14px' }}>{t.itemQuantity}</th>
                    <th style={{ padding: '10px 14px' }}>{t.unitPriceCol}</th>
                    <th style={{ padding: '10px 14px', borderTopLeftRadius: lang === 'ar' ? '6px' : '0', borderTopRightRadius: lang === 'ar' ? '0' : '6px' }}>{t.totalCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {printingInvoice.items && printingInvoice.items.length > 0 ? (
                    printingInvoice.items.map((it, idx) => (
                      <tr key={it.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '12px 14px' }}>{idx + 1}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>{it.product?.name || 'صنف مباع'}</td>
                        <td style={{ padding: '12px 14px' }}>{it.quantity}</td>
                        <td style={{ padding: '12px 14px' }}>{Number(it.unitPrice || 0).toFixed(2)} {t.currency}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>{Number(it.subtotal || 0).toFixed(2)} {t.currency}</td>
                      </tr>
                    ))
                  ) : (
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 14px' }}>1</td>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>مبيعات بضاعة</td>
                      <td style={{ padding: '12px 14px' }}>1</td>
                      <td style={{ padding: '12px 14px' }}>{Number(printingInvoice.subtotal || 0).toFixed(2)} {t.currency}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 'bold' }}>{Number(printingInvoice.subtotal || 0).toFixed(2)} {t.currency}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #e2e8f0', paddingTop: '20px', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <img 
                    src={generateZatcaQR(printingInvoice, businessName)} 
                    alt="ZATCA QR" 
                    style={{ width: '110px', height: '110px', borderRadius: '8px', background: '#fff', padding: '4px', border: '1px solid #cbd5e1' }} 
                  />
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#0f172a' }}>{t.zatcaQRTitle}</h4>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b', maxWidth: '180px', lineHeight: '1.4' }}>{t.zatcaQRSub}</p>
                  </div>
                </div>

                <div style={{ minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                    <span>{t.subtotal}</span>
                    <strong style={{ color: '#0f172a' }}>{Number(printingInvoice.subtotal || 0).toFixed(2)} {t.currency}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                    <span>{t.vatAmount}</span>
                    <strong style={{ color: '#0f766e' }}>{Number(printingInvoice.taxAmount || 0).toFixed(2)} {t.currency}</strong>
                  </div>
                  <div style={{ borderTop: '2px solid #0f172a', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{t.totalDue}</span>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#0f766e' }}>{Number(printingInvoice.totalAmount || 0).toFixed(2)} {t.currency}</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '35px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1', fontSize: '11px', color: '#94a3b8' }}>
                {t.invoiceFooterNote}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;