import { useState, useEffect } from 'react';
import API from './services/api';

const exportToExcel = (sheetTitle, headers, rows, lang = 'ar') => {
  const isAr = lang === 'ar';
  const cleanTitle = sheetTitle.replace(/[/\\?*[\]]/g, '');
  const brandName = isAr ? 'محور ERP' : 'Mihwar ERP';
  const metaText = isAr
    ? `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')} | وثيقة معتمدة ومصدرة آلياً من النظام`
    : `Export Date: ${new Date().toLocaleDateString('en-US')} | Official System Generated Report`;

  const rightToLeftXml = isAr ? '<x:DisplayRightToLeft/>' : '';

  const template = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>${cleanTitle.slice(0, 31)}</x:Name>
              <x:WorksheetOptions>
                ${rightToLeftXml}
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; border-collapse: collapse; direction: ${isAr ? 'rtl' : 'ltr'}; width: 100%; }
        .main-title { font-size: 16pt; font-weight: bold; color: #0f766e; text-align: center; padding: 12px; }
        .meta-text { font-size: 10pt; color: #64748b; text-align: center; padding-bottom: 10px; }
        th { background-color: #0f766e; color: #ffffff; font-weight: bold; border: 1px solid #042f2e; padding: 10px 14px; text-align: center; font-size: 11pt; }
        td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 10pt; text-align: ${isAr ? 'right' : 'left'}; }
        .text-cell { mso-number-format: "\\@"; text-align: center; }
        .num-cell { mso-number-format: "#\\,##0\\.00"; text-align: right; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr><td colspan="${headers.length}" class="main-title">${brandName} • ${cleanTitle.replace(/_/g, ' ')}</td></tr>
          <tr><td colspan="${headers.length}" class="meta-text">${metaText}</td></tr>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              ${row.map(cell => {
                const str = String(cell ?? '');
                const isCodeOrPhone = /^\d{9,}$/.test(str) || str.startsWith('05') || str.startsWith('+');
                const isCurrency = /^-?\d+(\.\d+)?$/.test(str) && !isCodeOrPhone;
                if (isCodeOrPhone) {
                  return `<td class="text-cell">${str}</td>`;
                } else if (isCurrency) {
                  return `<td class="num-cell">${Number(str).toFixed(2)}</td>`;
                }
                return `<td>${str}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + template], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cleanTitle}_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const dict = {
  ar: {
    brand: 'محور ERP',
    tagline: 'إدارة متكاملة برؤية مستقبلية.',
    taglineSub: 'نظام سحابي متطور لربط كافة أقسام منشأتك.',
    workspace: 'مساحة العمل:',
    dashboard: '📊 لوحة التحكم والتحليلات',
    pos: '🛒 نقطة البيع (POS)',
    sales: '🛍️ المبيعات والفوترة',
    purchases: '📥 المشتريات والتوريد',
    customers: '👥 العملاء',
    suppliers: '🏭 الموردين',
    inventory: '📦 المخزون (حي)',
    reports: '📈 الفواتير والتقارير',
    settings: '⚙️ الإعدادات',
    welcome: 'مرحباً بك،',
    currency: 'ر.س',
    roleLabel: 'اختر نوع الدخول:',
    roleAdmin: 'مدير النظام (Admin)',
    roleCashier: 'كاشير (Cashier)',
    adminSecretLabel: '🔑 كلمة المرور الإدارية الخاصة بمدير النظام:',
    adminSecretPlaceholder: 'أدخل كلمة سر الإدارة المعتمدة',

    forgotPassLink: 'نسيت كلمة المرور؟',
    forgotPassTitle: 'إعادة تعيين كلمة المرور',
    forgotPassDesc: 'أدخل بريدك الإلكتروني المسجل وكلمة المرور الجديدة',
    resetPassBtn: 'تحديث كلمة المرور وتسجيل الدخول',
    backToLogin: 'العودة لتسجيل الدخول',

    invValue: 'قيمة المخزون الإجمالية',
    salesTotal: 'إجمالي المبيعات (شامل الضريبة)',
    purchasesTotal: 'إجمالي المشتريات (شامل الضريبة)',
    netProfit: 'صافي الربح التقديري',
    profitMargin: 'هامش الربحية',
    lowStockTitle: '⚠️ تنبيه: المخزون على وشك النفاد',
    lowStockClean: '✅ مستويات المخزون ممتازة، لا توجد أصناف قاربت على النفاد.',
    reorderBtn: 'طلب توريد فوراً',
    topSellingTitle: '🏆 تقرير أداء المنتجات وربحية الأصناف',
    productCol: 'المنتج',
    stockCol: 'الرصيد الحالي',
    priceCol: 'سعر البيع',
    costCol: 'التكلفة',
    unitProfitCol: 'ربح الوحدة',
    statusCol: 'حالة التوفر',

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

    issueInvoice: '⚡ إصدار فاتورة بيع جديدة',
    selectCust: 'العميل المستلم',
    defaultCust: 'عميل نقدي عام (افتراضي)',
    selectProd: 'اختيار المنتج',
    chooseProd: '-- اختر المنتج لإضافته للفاتورة --',
    qty: 'الكمية',
    unitPrice: 'السعر (ر.س)',
    addItemBtn: '➕ إضافة الصنف إلى الفاتورة',
    cartItemsTitle: '🛒 محتويات الفاتورة الحالية',
    cartEmpty: 'لم تتم إضافة أي صنف للفاتورة بعد. اختر منتجاً واضغط إضافة.',
    confirmSaleBtn: '💳 إصدار الفاتورة واعتماد الخصم',
    summaryTitle: 'ملخص الحسبة التلقائية',
    vatBadge: 'ضريبة 15% آلية',
    subtotal: 'المبلغ الخاضع للضريبة:',
    vatAmount: 'ضريبة القيمة المضافة (15%):',
    totalDue: 'الإجمالي المستحق:',
    vatNote: '💡 ستُخصم كافة أصناف السلة فوراً من رصيد المستودع، وتُربط الفاتورة بـ TiDB.',

    issuePurchase: '📥 تسجيل فاتورة شراء وتوريد بضاعة',
    selectSupp: 'المورد',
    defaultSupp: 'توريد نقدي مباشر',
    purchaseProd: 'المنتج المستهدف للتوريد',
    purchaseQty: 'الكمية الموردة (ستضاف للمخزون)',
    purchaseCost: 'سعر التكلفة للوحدة (ر.س)',
    confirmPurchaseBtn: '📦 اعتماد الفاتورة وتوريد المخزون',
    purchaseVatNote: '💡 ستتم زيادة رصيد المستودع فوراً وتحديث تكلفة الصنف آلياً.',

    invRepo: 'سجل الفواتير والمبيعات المعتمدة',
    purchasesRepo: 'سجل فواتير المشتريات والتوريد',
    invNo: 'رقم الفاتورة',
    clientCol: 'العميل / المستلم',
    suppCol: 'المورد',
    itemCol: 'الأصناف المباعة',
    dateCol: 'التاريخ',
    noInvoices: 'لا توجد فواتير مبيعات مسجلة حتى الآن.',
    noPurchases: 'لا توجد فواتير شراء مسجلة حتى الآن.',
    viewAndPrint: '👁️ معاينة وطباعة',
    printBtn: '🖨️ طباعة الفاتورة / تصدير PDF',
    exportExcelBtn: '📥 تصدير إلى Excel',
    exportSalesBtn: '📥 تصدير المبيعات للإقرار الضريبي (Excel)',
    exportPurchasesBtn: '📥 تصدير المشتريات ومصروفات التوريد (Excel)',
    exportInventoryBtn: '📥 تصدير جرد المستودع (Excel)',
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

    prodName: 'اسم المنتج',
    prodPrice: 'سعر البيع الافتراضي (ر.س)',
    prodStock: 'الكمية الأولية بالمخزون',
    saveProd: 'حفظ المنتج في TiDB',
    stockRepo: '📦 مستودع المنتجات (متصل بـ TiDB)',
    availableStock: 'الرصيد الفعلي',

    settingsHeader: 'مركز إعدادات النظام وتخصيص الحساب',
    settingsSub: 'التحكم في المظهر واللغة والأمان المشدد لمنشأتك',
    prefTitle: '🌐 تفضيلات اللغة والمظهر',
    prefDesc: 'تخصيص لغة النظام ونمط الشاشة لتناسب استخدامك',
    langLabel: 'لغة النظام:',
    themeLabel: 'نمط العرض:',
    darkMode: 'الوضع الليلي 🌙',
    lightMode: 'الوضع النهاري ☀️',
    securityTitle: '🔒 الحماية وتغيير كلمة المرور',
    securityDesc: 'تغيير كلمة المرور بضوابط أمان مشددة',
    oldPass: 'كلمة المرور الحالية',
    newPass: 'كلمة المرور الجديدة',
    updatePassBtn: 'تحديث كلمة المرور',
    sessionTitle: '🚪 الجلسة وإدارة الحساب',
    sessionDesc: 'تسجيل الخروج أو إيقاف الحساب نهائياً',
    logoutBtn: 'تسجيل الخروج من النظام',
    dangerZoneTitle: '⚠️ منطقة الخطر: تعطيل وحذف الحساب',
    dangerZoneDesc: 'سيتم تعطيل الحساب نهائياً:',
    deleteAccBtn: 'تعطيل الحساب نهائياً'
  },
  en: {
    brand: 'Mihwar ERP',
    tagline: 'Enterprise Management Reimagined.',
    taglineSub: 'Next-generation cloud ERP connecting every department.',
    workspace: 'Workspace:',
    dashboard: '📊 Dashboard & Analytics',
    pos: '🛒 POS Touch',
    sales: '🛍️ Sales & POS',
    purchases: '📥 Purchasing & Inbound',
    customers: '👥 Clients',
    suppliers: '🏭 Suppliers',
    inventory: '📦 Live Inventory',
    reports: '📈 Reports & Invoices',
    settings: '⚙️ Settings',
    welcome: 'Welcome,',
    currency: 'SAR',
    roleLabel: 'Select Login Role:',
    roleAdmin: 'System Administrator (Admin)',
    roleCashier: 'Cashier (POS Only)',
    adminSecretLabel: '🔑 Master Admin Secret Key:',
    adminSecretPlaceholder: 'Enter master admin secret password',

    forgotPassLink: 'Forgot password?',
    forgotPassTitle: 'Reset Password',
    forgotPassDesc: 'Enter your registered email and new secure password',
    resetPassBtn: 'Update Password & Sign In',
    backToLogin: 'Back to Sign In',

    invValue: 'Total Inventory Valuation',
    salesTotal: 'Gross Sales (Incl. VAT)',
    purchasesTotal: 'Gross Purchases (Incl. VAT)',
    netProfit: 'Estimated Net Profit',
    profitMargin: 'Profit Margin',
    lowStockTitle: '⚠️ Warning: Low Stock Alert',
    lowStockClean: '✅ Warehouse inventory levels are optimal. No shortages detected.',
    reorderBtn: 'Reorder Now',
    topSellingTitle: '🏆 Product Performance & Profitability',
    productCol: 'Product',
    stockCol: 'Current Stock',
    priceCol: 'Sale Price',
    costCol: 'Unit Cost',
    unitProfitCol: 'Unit Margin',
    statusCol: 'Availability',

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

    issueInvoice: '⚡ Generate New Sales Invoice',
    selectCust: 'Client / Buyer',
    defaultCust: 'General Cash Customer (Default)',
    selectProd: 'Select Product',
    chooseProd: '-- Select product to add to invoice --',
    qty: 'Quantity',
    unitPrice: 'Price (SAR)',
    addItemBtn: '➕ Add Item to Invoice',
    cartItemsTitle: '🛒 Current Invoice Items',
    cartEmpty: 'No items added yet. Select a product and click add.',
    confirmSaleBtn: '💳 Confirm & Deplete Stock',
    summaryTitle: 'Live Tax Summary',
    vatBadge: 'Automated 15% VAT',
    subtotal: 'Taxable Amount:',
    vatAmount: 'Value Added Tax (15%):',
    totalDue: 'Total Amount Due:',
    vatNote: '💡 All items in the cart will be depleted atomically from TiDB.',

    issuePurchase: '📥 Record Purchase & Inbound Stock',
    selectSupp: 'Supplier',
    defaultSupp: 'Direct Cash Inbound',
    purchaseProd: 'Target Product',
    purchaseQty: 'Inbound Quantity (Adds to stock)',
    purchaseCost: 'Unit Cost Price (SAR)',
    confirmPurchaseBtn: '📦 Confirm & Replenish Stock',
    purchaseVatNote: '💡 Warehouse stock will increase immediately, updating unit cost.',

    invRepo: 'Verified Sales Invoices',
    purchasesRepo: 'Verified Purchase Invoices',
    invNo: 'Invoice #',
    clientCol: 'Client / Buyer',
    suppCol: 'Supplier',
    itemCol: 'Items Sold',
    dateCol: 'Date',
    noInvoices: 'No sales invoices recorded yet.',
    noPurchases: 'No purchase invoices recorded yet.',
    viewAndPrint: '👁️ View & Print',
    printBtn: '🖨️ Print Invoice / PDF Export',
    exportExcelBtn: '📥 Export to Excel',
    exportSalesBtn: '📥 Export Sales Tax Report (Excel)',
    exportPurchasesBtn: '📥 Export Purchases & Inbound (Excel)',
    exportInventoryBtn: '📥 Export Warehouse Audit (Excel)',
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

    prodName: 'Product Name',
    prodPrice: 'Default Sale Price (SAR)',
    prodStock: 'Initial Stock Quantity',
    saveProd: 'Save Product to TiDB',
    stockRepo: '📦 Warehouse Products (TiDB Connected)',
    availableStock: 'Available Stock',

    settingsHeader: 'System Settings & Account Management',
    settingsSub: 'Control enterprise preferences, display, language, and security',
    prefTitle: '🌐 Language & Display Preferences',
    prefDesc: 'Customize interface language and visual workspace theme',
    langLabel: 'System Language:',
    themeLabel: 'Color Theme:',
    darkMode: 'Dark Mode 🌙',
    lightMode: 'Light Mode ☀️',
    securityTitle: '🔒 Account Security & Password',
    securityDesc: 'Update your password under strict security rules',
    oldPass: 'Current Password',
    newPass: 'New Password',
    updatePassBtn: 'Update Password Now',
    sessionTitle: '🚪 Session & Account Controls',
    sessionDesc: 'Sign out or manage permanent account status',
    logoutBtn: 'Sign Out from System',
    dangerZoneTitle: '⚠️ Danger Zone: Deactivate Account',
    dangerZoneDesc: 'Your account will be permanently deactivated:',
    deleteAccBtn: 'Deactivate Account'
  }
};

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

    const tlvBytes = [...getTlv(1, seller), ...getTlv(2, vatNo), ...getTlv(3, timeStr), ...getTlv(4, total), ...getTlv(5, tax)];
    let binary = '';
    for (let i = 0; i < tlvBytes.length; i++) binary += String.fromCharCode(tlvBytes[i]);
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(btoa(binary))}`;
  } catch {
    return 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=MihwarERP';
  }
};

function App() {
  const [lang, setLang] = useState('ar');
  const [isDark, setIsDark] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mihwar_user');
    const savedToken = localStorage.getItem('mihwar_token');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (savedToken && API.defaults) API.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      return parsed;
    }
    return null;
  });

  const [authView, setAuthView] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authBusinessName, setAuthBusinessName] = useState('');
  const [authClientName, setAuthClientName] = useState('');
  const [loginRole, setLoginRole] = useState('admin');
  const [adminSecretKey, setAdminSecretKey] = useState('');
  const [authRole, setAuthRole] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [businessName, setBusinessName] = useState('محور ERP');

  const [inventory, setInventory] = useState([]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');

  const [customers, setCustomers] = useState([]);
  const [custName, setCustName] = useState('');
  const [custNationalId, setCustNationalId] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [editingCustId, setEditingCustId] = useState(null);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  const [suppliers, setSuppliers] = useState([]);
  const [suppName, setSuppName] = useState('');
  const [suppTaxNumber, setSuppTaxNumber] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [suppEmail, setSuppEmail] = useState('');
  const [editingSuppId, setEditingSuppId] = useState(null);
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);

  const [invoices, setInvoices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPurchaseProdId, setSelectedPurchaseProdId] = useState('');
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [purchaseCost, setPurchaseCost] = useState('');
  const [isSubmittingPurchase, setIsSubmittingPurchase] = useState(false);

  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    const saved = localStorage.getItem('mihwar_low_stock_threshold');
    return saved ? Number(saved) : 30;
  });
  const [isEditingThreshold, setIsEditingThreshold] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(lowStockThreshold);

  const [printingInvoice, setPrintingInvoice] = useState(null);
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
    accentAmber: '#f59e0b',
    accentRose: '#f43f5e'
  };

  useEffect(() => {
    if (user) {
      setBusinessName(user.businessName || 'محور ERP');
      fetchAllData();
      if (user.role === 'cashier' && activeTab !== 'pos') {
        setActiveTab('pos');
      }
    }
  }, [user]);

  const fetchAllData = () => {
    fetchInventory();
    fetchCustomers();
    fetchSuppliers();
    fetchInvoices();
    fetchPurchases();
  };

  const fetchInventory = async () => { try { const res = await API.get('/api/inventory'); if (res.data) setInventory(res.data); } catch (e) {} };
  const fetchCustomers = async () => { try { const res = await API.get('/api/customers'); if (res.data) setCustomers(res.data); } catch (e) {} };
  const fetchSuppliers = async () => { try { const res = await API.get('/api/suppliers'); if (res.data) setSuppliers(res.data); } catch (e) {} };
  const fetchInvoices = async () => { try { const res = await API.get('/api/sales'); if (res.data) setInvoices(res.data); } catch (e) {} };
  const fetchPurchases = async () => { try { const res = await API.get('/api/purchases'); if (res.data) setPurchaseInvoices(res.data); } catch (e) {} };

  const handleExportSales = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_المبيعات_الضريبية' : 'Tax_Sales_Report';
    const headers = isAr ? ['رقم الفاتورة', 'العميل المستلم', 'تاريخ الإصدار', 'المبلغ الخاضع للضريبة (ر.س)', 'ضريبة القيمة المضافة 15% (ر.س)', 'الإجمالي المستحق (ر.س)', 'عدد البنود المباعة'] : ['Invoice Number', 'Client / Buyer', 'Issue Date', 'Taxable Amount (SAR)', 'VAT 15% (SAR)', 'Total Amount Due (SAR)', 'Items Count'];
    const rows = invoices.map(inv => [inv.invoiceNo, inv.customer?.name || (isAr ? 'عميل نقدي عام' : 'General Cash Customer'), new Date(inv.createdAt).toISOString().slice(0, 10), Number(inv.subtotal || 0).toFixed(2), Number(inv.taxAmount || 0).toFixed(2), Number(inv.totalAmount || 0).toFixed(2), inv.items ? inv.items.length : 1]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportPurchases = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_المشتريات_والتوريد' : 'Purchases_Inbound_Report';
    const headers = isAr ? ['رقم فاتورة الشراء', 'اسم المورد', 'تاريخ التوريد', 'المبلغ الأساسي (ر.س)', 'ضريبة المدخلات 15% (ر.س)', 'إجمالي فاتورة الشراء (ر.س)'] : ['Purchase Invoice #', 'Supplier Name', 'Inbound Date', 'Base Amount (SAR)', 'Input VAT 15% (SAR)', 'Total Purchase Cost (SAR)'];
    const rows = purchaseInvoices.map(p => [p.invoiceNo, p.supplier?.name || (isAr ? 'توريد نقدي مباشر' : 'Direct Cash Inbound'), new Date(p.createdAt).toISOString().slice(0, 10), Number(p.subtotal || 0).toFixed(2), Number(p.taxAmount || 0).toFixed(2), Number(p.totalAmount || 0).toFixed(2)]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportInventory = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_جرد_المستودع_الحي' : 'Live_Inventory_Audit_Report';
    const headers = isAr ? ['اسم المنتج', 'رمز الصنف (SKU)', 'الرصيد الفعلي بالمستودع', 'سعر التكلفة للوحدة (ر.س)', 'سعر البيع الافتراضي (ر.س)', 'إجمالي القيمة التقديرية (ر.س)'] : ['Product Name', 'SKU Code', 'Available Stock', 'Unit Cost (SAR)', 'Sale Price (SAR)', 'Total Valuation (SAR)'];
    const rows = inventory.map(i => [i.name, i.sku || '-', i.stock, Number(i.cost || i.price).toFixed(2), Number(i.price).toFixed(2), (Number(i.price) * Number(i.stock)).toFixed(2)]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportCustomers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_العملاء_المعتمدين' : 'Registered_Clients_Directory';
    const headers = isAr ? ['اسم العميل / المؤسسة', 'الهوية / السجل التجاري أو الضريبي', 'رقم الهاتف / الجوال', 'البريد الإلكتروني'] : ['Client / Business Name', 'National ID / CR / Tax No', 'Phone / Mobile', 'Email Address'];
    const rows = customers.map(c => [c.name, c.nationalId || '-', c.phone || '-', c.email || '-']);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportSuppliers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_الموردين_المعتمدين' : 'Approved_Suppliers_Directory';
    const headers = isAr ? ['اسم الشركة الموردة', 'الرقم الضريبي / السجل التجاري', 'رقم الهاتف ومسؤول المبيعات', 'البريد الإلكتروني'] : ['Supplier / Company Name', 'Tax ID / CR Number', 'Phone / Sales Rep', 'Email Address'];
    const rows = suppliers.map(s => [s.name, s.taxNumber || '-', s.phone || '-', s.email || '-']);
    exportToExcel(title, headers, rows, lang);
  };

  const handleAddItemToCart = () => {
    if (!selectedProductId) return;
    const product = inventory.find(p => p.id === Number(selectedProductId));
    if (!product) return;
    const qty = Number(itemQty);
    if (qty <= 0) return;
    const existing = cartItems.find(it => it.productId === product.id);
    const reqQ = (existing ? existing.quantity : 0) + qty;
    if (reqQ > product.stock) { alert('Stock limit exceeded'); return; }
    const price = Number(itemPrice) || product.price;
    if (existing) {
      setCartItems(cartItems.map(it => it.productId === product.id ? { ...it, quantity: reqQ, subtotal: Number((reqQ * price).toFixed(2)) } : it));
    } else {
      setCartItems([...cartItems, { productId: product.id, name: product.name, quantity: qty, price, subtotal: Number((qty * price).toFixed(2)) }]);
    }
    setSelectedProductId(''); setItemQty(1); setItemPrice('');
  };

  const handleRemoveItemFromCart = (index) => setCartItems(cartItems.filter((_, idx) => idx !== index));

  const handleSaveInvoice = async () => {
    if (!cartItems.length) return;
    setIsSubmittingSale(true);
    try {
      const res = await API.post('/api/sales', { customerId: selectedCustomerId ? Number(selectedCustomerId) : null, items: cartItems });
      setCartItems([]); fetchAllData();
      if (res.data?.invoice) setPrintingInvoice(res.data.invoice);
      setActiveTab('pos');
    } catch (err) { alert(err.response?.data?.error || 'Failed'); } finally { setIsSubmittingSale(false); }
  };

  const handleSavePurchase = async () => {
    if (!selectedPurchaseProdId || !purchaseQty || !purchaseCost) return;
    setIsSubmittingPurchase(true);
    try {
      await API.post('/api/purchases', { productId: Number(selectedPurchaseProdId), quantity: Number(purchaseQty), unitCost: Number(purchaseCost), supplierId: selectedSupplierId ? Number(selectedSupplierId) : null });
      setSelectedPurchaseProdId(''); setPurchaseCost(''); fetchAllData(); setActiveTab('inventory');
    } catch (err) { alert('Failed'); } finally { setIsSubmittingPurchase(false); }
  };

  const cartSubtotal = cartItems.reduce((sum, it) => sum + it.subtotal, 0);
  const cartTax = cartSubtotal * 0.15;
  const cartGrandTotal = cartSubtotal + cartTax;

  const inventoryVal = inventory.reduce((sum, i) => sum + (Number(i.price) * i.stock), 0);
  const totalSalesVal = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const totalPurchasesVal = purchaseInvoices.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const totalRev = invoices.reduce((sum, inv) => sum + Number(inv.subtotal || 0), 0);
  const totalCogs = invoices.reduce((sum, inv) => sum + (inv.items || []).reduce((s, it) => s + ((it.product?.cost || 0) * it.quantity), 0), 0);
  const netProfitVal = totalRev - totalCogs;

  const currentYear = new Date().getFullYear();
  const currentYearInvoices = invoices.filter(inv => new Date(inv.createdAt).getFullYear() === currentYear);
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthInvs = currentYearInvoices.filter(inv => new Date(inv.createdAt).getMonth() === i);
    const total = monthInvs.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const count = monthInvs.length;
    return { monthName: new Date(currentYear, i, 1).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US', { month: 'long' }), total, count };
  });

  const pastYearsData = Array.from({ length: 10 }, (_, i) => {
    const targetYear = currentYear - i;
    const yearInvs = invoices.filter(inv => new Date(inv.createdAt).getFullYear() === targetYear);
    const totalSales = yearInvs.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const totalProfit = yearInvs.reduce((sum, inv) => {
      const rev = Number(inv.subtotal || 0);
      const cogs = (inv.items || []).reduce((s, it) => s + ((it.product?.cost || 0) * it.quantity), 0);
      return sum + (rev - cogs);
    }, 0);
    const count = yearInvs.length;
    return { year: targetYear, totalSales, totalProfit, count };
  }).filter(y => y.count > 0 || y.year === currentYear);

  const purchaseSubtotal = (Number(purchaseCost) || 0) * (Number(purchaseQty) || 0);
  const purchaseTax = purchaseSubtotal * 0.15;
  const purchaseTotal = purchaseSubtotal + purchaseTax;

  const handleAddOrUpdateCustomer = async (e) => {
    e.preventDefault();
    if (!custName.trim()) return;
    setIsSavingCustomer(true);
    try {
      await API.post('/api/customers', { name: custName.trim(), nationalId: custNationalId.trim()||null, phone: custPhone.trim()||null });
      setCustName(''); setCustNationalId(''); setCustPhone('');
      fetchCustomers();
    } catch (err) { alert('Error'); } finally { setIsSavingCustomer(false); }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm(t.confirmDeleteCust)) return;
    try { await API.delete(`/api/customers/${id}`); fetchCustomers(); } catch (err) {}
  };

  const handleAddOrUpdateSupplier = async (e) => {
    e.preventDefault();
    if (!suppName.trim()) return;
    setIsSavingSupplier(true);
    try {
      await API.post('/api/suppliers', { name: suppName.trim(), taxNumber: suppTaxNumber.trim()||null, phone: suppPhone.trim()||null });
      setSuppName(''); setSuppTaxNumber(''); setSuppPhone('');
      fetchSuppliers();
    } catch (err) { alert('Error'); } finally { setIsSavingSupplier(false); }
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm(t.confirmDeleteSupp)) return;
    try { await API.delete(`/api/suppliers/${id}`); fetchSuppliers(); } catch (err) {}
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    try {
      await API.post('/api/inventory', { name: newProdName, price: newProdPrice, stock: newProdStock || 0 });
      setNewProdName(''); setNewProdPrice(''); setNewProdStock('');
      fetchInventory();
    } catch (err) { alert('Error'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) return;
    try {
      const res = await API.post('/api/change-password', { currentPassword: currentPass, newPassword: newPass });
      alert(`✅ ${res.data.message}`);
      setCurrentPass(''); setNewPass('');
    } catch (err) { alert('Failed'); }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm('Delete account?')) return;
    try {
      await API.post('/api/delete-account', { confirmPassword: deleteConfirmPass });
      handleLogout();
    } catch (err) { alert('Failed'); }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await API.post('/api/forgot-password', { email: authEmail, newPassword: authPassword });
      alert(`✅ ${res.data.message}`);
      setAuthView('login'); setAuthPassword('');
    } catch (err) { alert('Failed'); } finally { setIsLoading(false); }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (loginRole === 'admin') {
      if (adminSecretKey !== 'MihwarAdmin2026!') {
        alert(lang === 'ar' ? '❌ خطأ أمني: كلمة المرور الإدارية السرية غير صحيحة!' : '❌ Security Error: Incorrect Master Admin Secret Key!');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (authView === 'login') {
        const res = await API.post('/api/login', { email: authEmail, password: authPassword });
        const loggedUser = { ...res.data.user, role: loginRole };
        setUser(loggedUser); localStorage.setItem('mihwar_user', JSON.stringify(loggedUser));
        if (res.data.token) { localStorage.setItem('mihwar_token', res.data.token); API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`; }
      } else {
        const res = await API.post('/api/register', { businessName: authBusinessName, clientName: authClientName, email: authEmail, password: authPassword, role: loginRole });
        const newUser = { ...res.data.user, role: loginRole };
        setUser(newUser); localStorage.setItem('mihwar_user', JSON.stringify(newUser));
        if (res.data.token) { localStorage.setItem('mihwar_token', res.data.token); API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`; }
      }
    } catch (err) { alert(err.response?.data?.error || 'Auth error'); } finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    setUser(null); localStorage.clear(); delete API.defaults.headers.common['Authorization']; setAuthView('login');
  };

  if (!user) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Cairo, Tahoma, sans-serif', background: theme.bgMain }}>
        <style>{`
          @media (min-width: 768px) {
            .auth-container { flex-direction: row !important; }
            .auth-form-side { flex: 0.5 1 50% !important; padding: 40px !important; }
            .auth-brand-side { flex: 0.5 1 50% !important; padding: 80px !important; display: flex !important; }
          }
          @media (max-width: 767px) {
            .auth-container { flex-direction: column !important; }
            .auth-form-side { width: 100% !important; padding: 25px !important; }
            .auth-brand-side { display: none !important; }
          }
        `}</style>
        <div className="auth-container" style={{ display: 'flex', flex: 1, width: '100%' }}>
          <div className="auth-form-side" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: theme.cardBg, boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '26px' }}>⚡</span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: theme.primary }}>{t.brand}</span>
                </div>
                <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>
                  {lang === 'ar' ? 'English' : 'عربي'}
                </button>
              </div>
              <h1 style={{ color: theme.textDark, fontSize: '24px', fontWeight: '800' }}>
                {authView === 'login' ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In') : authView === 'register' ? (lang === 'ar' ? 'إنشاء مساحة عمل' : 'Create Workspace') : t.forgotPassTitle}
              </h1>
              {authView === 'forgot' ? (
                <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                  <input type="email" placeholder="Email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                  <input type="password" placeholder="New Password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                  <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.resetPassBtn}</button>
                  <span onClick={() => setAuthView('login')} style={{ color: theme.primary, cursor: 'pointer', textAlign: 'center', fontWeight: 'bold' }}>{t.backToLogin}</span>
                </form>
              ) : (
                <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                  
                  <div style={{ background: isDark ? '#334155' : '#f1f5f9', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: theme.primary }}>{t.roleLabel}</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="button" onClick={() => setLoginRole('admin')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `2px solid ${loginRole === 'admin' ? theme.primary : theme.border}`, background: loginRole === 'admin' ? theme.primary : 'transparent', color: loginRole === 'admin' ? '#fff' : theme.textDark, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                        🛡️ مدير النظام
                      </button>
                      <button type="button" onClick={() => setLoginRole('cashier')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `2px solid ${loginRole === 'cashier' ? theme.primary : theme.border}`, background: loginRole === 'cashier' ? theme.primary : 'transparent', color: loginRole === 'cashier' ? '#fff' : theme.textDark, fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                        🛒 كاشير فقط
                      </button>
                    </div>
                  </div>

                  {authView === 'register' && (
                    <>
                      <input type="text" placeholder="Company Name" value={authBusinessName} onChange={e=>setAuthBusinessName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                      <input type="text" placeholder="Manager Name" value={authClientName} onChange={e=>setAuthClientName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                    </>
                  )}

                  <input type="email" placeholder="Email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                  <input type="password" placeholder="Password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />

                  {loginRole === 'admin' && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '12px', borderRadius: '8px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#b91c1c' }}>{t.adminSecretLabel}</label>
                      <input 
                        type="password" 
                        placeholder={t.adminSecretPlaceholder} 
                        value={adminSecretKey} 
                        onChange={e => setAdminSecretKey(e.target.value)} 
                        required 
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #f87171', background: '#fff', color: '#0f172a', boxSizing: 'border-box' }} 
                      />
                    </div>
                  )}

                  <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{authView === 'login' ? 'Sign In' : 'Register'}</button>
                  <span onClick={()=>setAuthView(authView === 'login' ? 'register' : 'login')} style={{ color: theme.primary, cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                    {authView === 'login' ? 'Create an account' : 'Already registered?'}
                  </span>
                </form>
              )}
            </div>
          </div>
          <div className="auth-brand-side" style={{ background: theme.secondary, color: '#fff', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <h1 style={{ fontSize: '44px', margin: '0 0 20px 0', fontWeight: '800' }}>{t.tagline}</h1>
            <p style={{ fontSize: '16px', opacity: 0.8 }}>{t.taglineSub}</p>
          </div>
        </div>
      </div>
    );
  }

  const allTabs = [
    { id: 'dashboard', label: t.dashboard, adminOnly: true },
    { id: 'pos', label: t.pos, adminOnly: false },
    { id: 'sales', label: t.sales, adminOnly: true },
    { id: 'purchases', label: t.purchases, adminOnly: true },
    { id: 'customers', label: t.customers, adminOnly: true },
    { id: 'suppliers', label: t.suppliers, adminOnly: true },
    { id: 'inventory', label: t.inventory, adminOnly: false },
    { id: 'reports', label: t.reports, adminOnly: true },
    { id: 'settings', label: t.settings, adminOnly: false }
  ];

  const availableTabs = user.role === 'cashier' 
    ? allTabs.filter(tab => !tab.adminOnly || tab.id === 'pos' || tab.id === 'settings') 
    : allTabs;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, Tahoma, sans-serif', background: theme.bgMain, minHeight: '100vh', color: theme.textDark }}>
      
      <style>{`
        @media print {
          header, .main-navbar, main, .no-print-zone, button {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .invoice-modal-backdrop {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #ffffff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 99999 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .invoice-modal-card {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
            padding: 15mm !important;
            box-sizing: border-box !important;
            overflow: visible !important;
          }
          #zatca-printable-invoice {
            display: block !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }

        /* قواعد التجاوب التام لواجهة الهاتف المحمول (Mobile Responsiveness) */
        @media (max-width: 900px) {
          .responsive-grid {
            grid-template-columns: 1fr !important;
          }
          .main-header-bar {
            padding: 12px 15px !important;
            flex-direction: column !important;
            gap: 10px !important;
            align-items: flex-start !important;
          }
          main {
            padding: 15px !important;
          }
        }
      `}</style>

      <header className="main-header-bar" style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: '14px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f766e, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}>🏢</div>
            <span style={{ fontWeight: '900', color: theme.textDark, fontSize: '19px' }}>{t.brand}</span>
          </div>
          <span style={{ fontSize: '13px', background: isDark ? '#334155' : '#f1f5f9', padding: '6px 14px', borderRadius: '8px' }}>
            {t.workspace} <strong>{businessName}</strong> ({user.role === 'cashier' ? t.roleCashier : t.roleAdmin})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: theme.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{user.name[0]}</div>
          <span style={{ fontSize: '14px', fontWeight: '800' }}>{user.name}</span>
        </div>
      </header>

      <div className="main-navbar" style={{ background: theme.secondary, color: '#fff', padding: '0 20px', display: 'flex', gap: '4px', fontSize: '13px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {availableTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? theme.primary : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '16px 18px', fontWeight: activeTab === tab.id ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ padding: '30px', maxWidth: '1400px', margin: 'auto' }}>
        {activeTab === 'dashboard' && user.role !== 'cashier' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>{t.welcome} {user.name} 👋</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.invValue}</p><h2 style={{ color: theme.primary, margin: '8px 0 0 0', fontSize: '24px' }}>{inventoryVal.toLocaleString()} {t.currency}</h2></div>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.salesTotal}</p><h2 style={{ color: theme.accentGreen, margin: '8px 0 0 0', fontSize: '24px' }}>{totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.purchasesTotal}</p><h2 style={{ color: theme.accentAmber, margin: '8px 0 0 0', fontSize: '24px' }}>{totalPurchasesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.netProfit}</p><h2 style={{ color: theme.accentGreen, margin: '8px 0 0 0', fontSize: '24px' }}>{netProfitVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📅 تحليل أداء مبيعات السنة الحالية ({currentYear})</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px', minWidth: '500px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#334155' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '10px' }}>الشهر</th>
                    <th style={{ padding: '10px' }}>عدد الفواتير</th>
                    <th style={{ padding: '10px' }}>إجمالي المبيعات (ر.س)</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{m.monthName}</td>
                      <td style={{ padding: '10px' }}>{m.count} فاتورة</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: theme.accentGreen }}>{m.total.toFixed(2)} {t.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📊 سجل النمو المالي للسنوات الماضية</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px', minWidth: '500px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#334155' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '10px' }}>السنة المالية</th>
                    <th style={{ padding: '10px' }}>عدد الفواتير الكلي</th>
                    <th style={{ padding: '10px' }}>إجمالي المبيعات</th>
                    <th style={{ padding: '10px' }}>صافي الربح التقديري</th>
                  </tr>
                </thead>
                <tbody>
                  {pastYearsData.map((y, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: theme.primary }}>{y.year}</td>
                      <td style={{ padding: '10px' }}>{y.count} فاتورة</td>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{y.totalSales.toFixed(2)} {t.currency}</td>
                      <td style={{ padding: '10px', fontWeight: 'bold', color: theme.accentGreen }}>+{y.totalProfit.toFixed(2)} {t.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'pos' && (
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: theme.textDark }}>{lang === 'ar' ? '⚡ نقطة البيع السريعة' : '⚡ Quick POS'}</h2>
                <span style={{ fontSize: '12px', background: theme.bgMain, padding: '6px 12px', borderRadius: '6px', border: `1px solid ${theme.border}` }}>
                  {inventory.length} {lang === 'ar' ? 'منتج' : 'Items'}
                </span>
              </div>

              {inventory.length === 0 ? (
                <p style={{ textAlign: 'center', color: theme.textMuted, padding: '40px' }}>{lang === 'ar' ? 'لا توجد منتجات مسجلة.' : 'No products available.'}</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px', maxHeight: '550px', overflowY: 'auto', paddingRight: '5px' }}>
                  {inventory.map(prod => {
                    const isOut = prod.stock <= 0;
                    const cartItem = cartItems.find(it => it.productId === prod.id);
                    const currentQtyInCart = cartItem ? cartItem.quantity : 0;

                    const updateProdQty = (newQty) => {
                      if (newQty < 0 || newQty > prod.stock) return;
                      if (newQty === 0) {
                        setCartItems(cartItems.filter(it => it.productId !== prod.id));
                      } else if (cartItem) {
                        setCartItems(cartItems.map(it => it.productId === prod.id ? { ...it, quantity: newQty, subtotal: Number((newQty * it.price).toFixed(2)) } : it));
                      } else {
                        setCartItems([...cartItems, { productId: prod.id, name: prod.name, quantity: newQty, price: prod.price, subtotal: Number((newQty * prod.price).toFixed(2)) }]);
                      }
                    };

                    return (
                      <div 
                        key={prod.id} 
                        style={{ 
                          background: isOut ? theme.bgMain : theme.cardBg, 
                          border: `2px solid ${currentQtyInCart > 0 ? theme.primary : theme.border}`, 
                          borderRadius: '12px', 
                          padding: '14px', 
                          opacity: isOut ? 0.5 : 1,
                          display: 'flex', 
                          flexDirection: 'column', 
                          justifyContent: 'space-between',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px', color: theme.textDark }}>{prod.name}</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ color: theme.primary, fontSize: '13px' }}>{prod.price} {t.currency}</strong>
                            <span style={{ fontSize: '10px', color: theme.textMuted }}>متبقي: {prod.stock}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.bgMain, borderRadius: '8px', padding: '3px', border: `1px solid ${theme.border}` }}>
                          <button 
                            type="button"
                            disabled={isOut || currentQtyInCart <= 0}
                            onClick={() => updateProdQty(currentQtyInCart - 1)}
                            style={{ background: '#ef4444', color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', fontWeight: 'bold', cursor: currentQtyInCart > 0 ? 'pointer' : 'not-allowed', fontSize: '14px' }}
                          >
                            -
                          </button>
                          
                          <input 
                            type="number"
                            min="0"
                            max={prod.stock}
                            value={currentQtyInCart}
                            onChange={(e) => updateProdQty(Number(e.target.value))}
                            style={{ width: '35px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '13px', color: theme.textDark }}
                          />

                          <button 
                            type="button"
                            disabled={isOut || currentQtyInCart >= prod.stock}
                            onClick={() => updateProdQty(currentQtyInCart + 1)}
                            style={{ background: theme.primary, color: '#fff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', fontWeight: 'bold', cursor: currentQtyInCart < prod.stock ? 'pointer' : 'not-allowed', fontSize: '14px' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ background: '#020617', borderRadius: '14px', color: '#fff', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>🛒 السلة</h3>
                  <span style={{ background: '#0f766e', color: '#5eead4', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>{cartItems.length}</span>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>{t.selectCust}</label>
                  <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#0f172a', color: '#fff', border: '1px solid #334155', boxSizing: 'border-box' }}>
                    <option value="">{t.defaultCust}</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {cartItems.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', padding: '20px' }}>{t.cartEmpty}</p>
                  ) : (
                    cartItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '10px', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px' }}>
                        <div>
                          <strong>{item.name}</strong>
                          <div style={{ color: '#94a3b8', fontSize: '11px' }}>{item.quantity} × {item.price}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{item.subtotal}</span>
                          <button onClick={() => handleRemoveItemFromCart(idx)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✖</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div style={{ borderTop: '1px dashed #334155', paddingTop: '15px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>{t.subtotal}</span>
                    <strong style={{ color: '#fff' }}>{cartSubtotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                    <span>{t.vatAmount}</span>
                    <strong style={{ color: '#5eead4' }}>{cartTax.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>{t.totalDue}</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#38bdf8' }}>{cartGrandTotal.toFixed(2)} {t.currency}</span>
                  </div>
                </div>

                <button 
                  onClick={handleSaveInvoice} 
                  disabled={isSubmittingSale || cartItems.length === 0} 
                  style={{ 
                    width: '100%', 
                    background: cartItems.length > 0 ? theme.primary : '#334155', 
                    color: '#fff', 
                    padding: '14px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    fontWeight: 'bold', 
                    cursor: cartItems.length > 0 ? 'pointer' : 'not-allowed',
                    fontSize: '15px' 
                  }}
                >
                  {isSubmittingSale ? '...' : '💳 إتمام الدفع الفوري'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: user.role === 'cashier' ? '1fr' : '1fr 2fr', gap: '25px' }}>
            {user.role !== 'cashier' && (
              <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h3>➕ إضافة منتج</h3>
                <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder={t.prodName} value={newProdName} onChange={e=>setNewProdName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                  <input type="number" placeholder={t.prodPrice} value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                  <input type="number" placeholder={t.prodStock} value={newProdStock} onChange={e=>setNewProdStock(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                  <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveProd}</button>
                </form>
              </div>
            )}
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}><h3>{t.stockRepo}</h3><button onClick={handleExportInventory} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>{t.exportInventoryBtn}</button></div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
                <thead><tr style={{ background: isDark?'#334155':'#f8fafc' }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Price</th><th style={{ padding: '10px' }}>Stock</th></tr></thead>
                <tbody>{inventory.map(i=><tr key={i.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{i.name}</td><td style={{ padding: '10px' }}>{i.price}</td><td style={{ padding: '10px', color: '#0d9488', fontWeight: 'bold' }}>{i.stock}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3>{t.prefTitle}</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={()=>setLang('ar')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: lang==='ar'?theme.primary:'transparent', color: lang==='ar'?'#fff':theme.textDark, border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🇸🇦 العربية</button>
                <button onClick={()=>setLang('en')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: lang==='en'?theme.primary:'transparent', color: lang==='en'?'#fff':theme.textDark, border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🇺🇸 English</button>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={()=>setIsDark(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: !isDark?theme.primary:'transparent', color: !isDark?'#fff':theme.textDark, border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>☀️ {t.lightMode}</button>
                <button onClick={()=>setIsDark(true)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: isDark?theme.primary:'transparent', color: isDark?'#fff':theme.textDark, border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🌙 {t.darkMode}</button>
              </div>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3>{t.securityTitle}</h3>
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <input type="password" placeholder={t.oldPass} value={currentPass} onChange={e=>setCurrentPass(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                <input type="password" placeholder={t.newPass} value={newPass} onChange={e=>setNewPass(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t.updatePassBtn}</button>
              </form>
            </div>

            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3>{t.sessionTitle}</h3>
                <button onClick={handleLogout} style={{ width: '100%', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>🚪 {t.logoutBtn}</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {printingInvoice && (
        <div className="invoice-modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '10px', boxSizing: 'border-box' }}>
          <div className="invoice-modal-card" style={{ background: '#fff', color: '#0f172a', padding: '25px', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div className="no-print-zone" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <h2>{t.taxInvoiceTitle}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ background: '#0f766e', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📥 حفظ PDF / طباعة</button>
                <button onClick={()=>setPrintingInvoice(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </div>

            <div id="zatca-printable-invoice">
              <p><strong>{t.invNo}</strong> #{printingInvoice.invoiceNo}</p>
              <p><strong>{t.clientCol}</strong> {printingInvoice.customer?.name || 'Cash'}</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', fontSize: '13px' }}>
                <thead><tr style={{ background: '#0f172a', color: '#fff' }}><th style={{ padding: '8px' }}>Item</th><th style={{ padding: '8px' }}>Qty</th><th style={{ padding: '8px' }}>Price</th><th style={{ padding: '8px' }}>Total</th></tr></thead>
                <tbody>
                  {printingInvoice.items?.map((it, idx)=>(
                    <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1' }}><td style={{ padding: '8px' }}>{it.product?.name}</td><td style={{ padding: '8px' }}>{it.quantity}</td><td style={{ padding: '8px' }}>{it.unitPrice}</td><td style={{ padding: '8px' }}>{it.subtotal}</td></tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <img src={generateZatcaQR(printingInvoice, businessName)} alt="QR" style={{ width: '100px', height: '100px' }} />
                <div style={{ textAlign: 'right' }}>
                  <p>{t.subtotal} {printingInvoice.subtotal} {t.currency}</p>
                  <p>{t.vatAmount} {printingInvoice.taxAmount} {t.currency}</p>
                  <h3>{t.totalDue} {printingInvoice.totalAmount} {t.currency}</h3>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;