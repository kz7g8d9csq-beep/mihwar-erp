import { useState, useEffect } from 'react';
import API from './services/api';

const exportToExcel = (sheetTitle, headers, rows, lang = 'ar') => {
  const isAr = lang === 'ar';
  const cleanTitle = sheetTitle.replace(/[/\\?*[\]]/g, '');
  const brandName = isAr ? 'نظام محور' : 'Mihwar ERP';
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
        .main-title { font-size: 16pt; font-weight: bold; color: #d97706; text-align: center; padding: 12px; }
        .meta-text { font-size: 10pt; color: #64748b; text-align: center; padding-bottom: 10px; }
        th { background-color: #d97706; color: #ffffff; font-weight: bold; border: 1px solid #b45309; padding: 10px 14px; text-align: center; font-size: 11pt; }
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
    brand: 'نظام محور',
    tagline: 'إدارة متكاملة برؤية مستقبلية.',
    taglineSub: 'نظام سحابي متطور لربط كافة أقسام منشأتك التجارية والصناعية.',
    workspace: 'مساحة العمل:',
    dashboard: 'لوحة التحكم',
    pos: 'نقطة البيع (POS)',
    sales: 'الفواتير',
    purchases: 'المشتريات',
    customers: 'العملاء',
    suppliers: 'الموردين',
    inventory: 'المخزون',
    reports: 'التقارير',
    settings: 'الإعدادات',
    production: 'الإنتاج',
    hr: 'الموارد البشرية',
    welcome: 'مرحباً بك،',
    currency: 'ر.س',
    roleLabel: 'اختر نوع الدخول:',
    roleAdmin: 'مدير النظام (Admin)',
    roleCashier: 'كاشير (Cashier)',
    adminSecretLabel: '🔑 كلمة المرور الإدارية الخاصة بمدير النظام:',
    adminSecretPlaceholder: 'أدخل كلمة سر الإدارة المعتمدة',

    landingTitle: 'منظومة نظام محور السحابية',
    landingDesc: 'الحل الأمثل والذكي لإدارة المبيعات، المخزون المتصل بـ TiDB، الفوترة الإلكترونية المعتمدة من ZATCA، ونقاط البيع السريعة.',
    enterAppBtn: 'ابدأ العمل الآن 🚀',
    featuresTitle: '✨ لماذا يختار رواد الأعمال نظام محور؟',
    feature1Title: '⚡ نقطة بيع (POS) سريعة باللمس',
    feature1Desc: 'إدارة المبيعات وسلة الشراء بأزرار تفاعلية وعدادات كميات فورية.',
    feature2Title: '🧾 فوترة إلكترونية معتمدة (ZATCA)',
    feature2Desc: 'توليد رموز الاستجابة السريعة QR وتصدير فواتير A4 رسمية بدقة.',
    feature3Title: '🔒 صلاحيات أمان مشددة (RBAC)',
    feature3Desc: 'فصل تام بين صلاحيات الإدارة العليا وصلاحيات الكاشير لحماية المنشأة.',

    forgotPassLink: 'نسيت كلمة المرور؟',
    forgotPassTitle: 'إعادة تعيين كلمة المرور',
    forgotPassDesc: 'أدخل بريدك الإلكتروني المسجل وكلمة المرور الجديدة',
    resetPassBtn: 'تحديث كلمة المرور وتسجيل الدخول',
    backToLogin: 'العودة لتسجيل الدخول',

    invValue: 'قيمة المخزون الإجمالية',
    salesTotal: 'إجمالي المبيعات',
    purchasesTotal: 'إجمالي المشتريات',
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
    invoiceFooterNote: 'شكراً لتعاملكم معنا • صدرت إلكترونياً عبر نظام محور',

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
    darkMode: 'الوضع الداكن 🌙',
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
    dashboard: 'Dashboard',
    pos: 'POS Touch',
    sales: 'Invoices',
    purchases: 'Purchasing',
    customers: 'Clients',
    suppliers: 'Suppliers',
    inventory: 'Inventory',
    reports: 'Reports',
    settings: 'Settings',
    production: 'Production',
    hr: 'HR',
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
    salesTotal: 'Gross Sales',
    purchasesTotal: 'Gross Purchases',
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
    const seller = companyName || 'نظام محور';
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
  const [isDark, setIsDark] = useState(true);

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

  const [showLanding, setShowLanding] = useState(true);
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
  const [businessName, setBusinessName] = useState('نظام محور');

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

  const [printingInvoice, setPrintingInvoice] = useState(null);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [deleteConfirmPass, setDeleteConfirmPass] = useState('');

  const t = dict[lang];

  const theme = {
    primary: '#d97706',
    primaryHover: '#b45309',
    bgMain: isDark ? '#141824' : '#f8fafc',
    cardBg: isDark ? '#1b2230' : '#ffffff',
    sidebarBg: '#11151f',
    textDark: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    border: isDark ? '#263147' : '#e2e8f0',
    accentGreen: '#10b981',
    accentAmber: '#d97706',
    accentRose: '#f43f5e'
  };

  useEffect(() => {
    if (user) {
      setBusinessName(user.businessName || 'نظام محور');
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
      setActiveTab('sales');
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
    setUser(null); localStorage.clear(); delete API.defaults.headers.common['Authorization']; setShowLanding(true); setAuthView('login');
  };

  if (!user && showLanding) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, Tahoma, sans-serif', background: '#141824', minHeight: '100vh', color: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <header style={{ background: '#1b2230', borderBottom: '1px solid #263147', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#d97706', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '14px' }}>مح</div>
            <span style={{ fontWeight: '900', color: '#f8fafc', fontSize: '18px' }}>نظام محور</span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #263147', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: '#f8fafc' }}>
              {lang === 'ar' ? 'English' : 'عربي'}
            </button>
            <button onClick={() => setShowLanding(false)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
              {t.enterAppBtn}
            </button>
          </div>
        </header>

        <main style={{ padding: '80px 20px', maxWidth: '1100px', margin: 'auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '44px', fontWeight: '900', margin: '0 0 20px 0', color: '#f8fafc' }}>{t.landingTitle}</h1>
          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 40px auto', lineHeight: '1.7' }}>{t.landingDesc}</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '60px', flexWrap: 'wrap' }}>
            <button onClick={() => { setShowLanding(false); setAuthView('login'); }} style={{ background: '#d97706', color: '#fff', padding: '14px 30px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
              تسجيل الدخول 🔑
            </button>
            <button onClick={() => { setShowLanding(false); setAuthView('register'); }} style={{ background: '#1b2230', color: '#f8fafc', border: '1px solid #263147', padding: '14px 30px', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
              إنشاء مساحة عمل 🏢
            </button>
          </div>
        </main>

        <footer style={{ background: '#1b2230', borderTop: '1px solid #263147', padding: '20px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
          © 2026 نظام محور • Cloud ERP Suite
        </footer>
      </div>
    );
  }

  if (!user) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Cairo, Tahoma, sans-serif', background: '#141824', color: '#f8fafc' }}>
        <div style={{ display: 'flex', flex: 1, width: '100%', minHeight: '100vh' }}>
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', background: '#1b2230', boxSizing: 'border-box' }}>
            <div style={{ width: '100%', maxWidth: '420px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: '#d97706', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '14px' }}>مح</div>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#f8fafc' }}>نظام محور</span>
                </div>
                <button onClick={() => setShowLanding(true)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #263147', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', color: '#f8fafc' }}>
                  الرئيسية
                </button>
              </div>

              <h1 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: '900', margin: '0 0 20px 0' }}>
                {authView === 'login' ? 'تسجيل الدخول' : 'إنشاء مساحة عمل'}
              </h1>

              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: '#141824', padding: '12px', borderRadius: '8px', border: '1px solid #263147' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#d97706' }}>{t.roleLabel}</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setLoginRole('admin')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `2px solid ${loginRole === 'admin' ? '#d97706' : '#263147'}`, background: loginRole === 'admin' ? '#d97706' : 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                      🛡️ مدير النظام
                    </button>
                    <button type="button" onClick={() => setLoginRole('cashier')} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: `2px solid ${loginRole === 'cashier' ? '#d97706' : '#263147'}`, background: loginRole === 'cashier' ? '#d97706' : 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                      🛒 كاشير فقط
                    </button>
                  </div>
                </div>

                {authView === 'register' && (
                  <>
                    <input type="text" placeholder="اسم الشركة" value={authBusinessName} onChange={e=>setAuthBusinessName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none' }} />
                    <input type="text" placeholder="اسم المدير" value={authClientName} onChange={e=>setAuthClientName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none' }} />
                  </>
                )}

                <input type="email" placeholder="البريد الإلكتروني" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none' }} />
                <input type="password" placeholder="كلمة المرور" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />

                {loginRole === 'admin' && (
                  <div style={{ background: '#2a1a1a', border: '1px solid #7f1d1d', padding: '12px', borderRadius: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#fca5a5' }}>{t.adminSecretLabel}</label>
                    <input 
                      type="password" 
                      placeholder={t.adminSecretPlaceholder} 
                      value={adminSecretKey} 
                      onChange={e => setAdminSecretKey(e.target.value)} 
                      required 
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ef4444', background: '#141824', color: '#fff', boxSizing: 'border-box', outline: 'none' }} 
                    />
                  </div>
                )}

                <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>
                  {authView === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
                </button>
                <span onClick={()=>setAuthView(authView === 'login' ? 'register' : 'login')} style={{ color: '#d97706', cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', fontSize: '13px' }}>
                  {authView === 'login' ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
                </span>
              </form>
            </div>
          </div>

          <div style={{ flex: '1 1 50%', background: '#141824', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px', boxSizing: 'border-box' }}>
            <h1 style={{ fontSize: '40px', margin: '0 0 20px 0', fontWeight: '900' }}>نظام محور • Cloud ERP</h1>
            <p style={{ fontSize: '16px', opacity: 0.7, lineHeight: '1.6' }}>إدارة متكاملة لجميع عمليات المبيعات، الفواتير، المخزون، والإنتاج بدقة واحترافية عالية.</p>
          </div>
        </div>
      </div>
    );
  }

  const allTabs = [
    { id: 'dashboard', label: t.dashboard, adminOnly: true, icon: '📊' },
    { id: 'pos', label: t.pos, adminOnly: false, icon: '🛒' },
    { id: 'sales', label: t.sales, adminOnly: true, icon: '🧾' },
    { id: 'purchases', label: t.purchases, adminOnly: true, icon: '📥' },
    { id: 'customers', label: t.customers, adminOnly: true, icon: '👥' },
    { id: 'suppliers', label: t.suppliers, adminOnly: true, icon: '🏭' },
    { id: 'inventory', label: t.inventory, adminOnly: false, icon: '📦' },
    { id: 'production', label: t.production, adminOnly: true, icon: '⚙️' },
    { id: 'hr', label: t.hr, adminOnly: true, icon: '👔' },
    { id: 'reports', label: t.reports, adminOnly: true, icon: '📈' },
    { id: 'settings', label: t.settings, adminOnly: false, icon: '⚙️' }
  ];

  const availableTabs = user.role === 'cashier' 
    ? allTabs.filter(tab => !tab.adminOnly || tab.id === 'pos' || tab.id === 'settings') 
    : allTabs;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, Tahoma, sans-serif', background: theme.bgMain, minHeight: '100vh', color: theme.textDark, display: 'flex' }}>
      
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #zatca-printable-invoice, #zatca-printable-invoice * {
            visibility: visible !important;
          }
          #zatca-printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 15mm !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-sizing: border-box !important;
          }
          .invoice-modal-backdrop {
            background: #ffffff !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          .no-print-zone {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
        }
        @media (max-width: 900px) {
          .app-layout { flex-direction: column !important; }
          .sidebar-nav { width: 100% !important; flex-direction: row !important; overflow-x: auto !important; height: auto !important; }
        }
      `}</style>

      <aside className="sidebar-nav" style={{ width: '260px', background: theme.sidebarBg, borderLeft: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px 0', boxSizing: 'border-box', minHeight: '100vh', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ padding: '0 20px 20px 20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#d97706', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '15px' }}>مح</div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#fff' }}>نظام محور</h3>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Cloud ERP</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '15px 10px' }}>
            {availableTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  style={{ 
                    background: isActive ? '#d97706' : 'transparent', 
                    border: 'none', 
                    color: '#fff', 
                    cursor: 'pointer', 
                    padding: '12px 16px', 
                    borderRadius: '10px',
                    fontWeight: isActive ? 'bold' : 'normal',
                    fontSize: '13.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'right',
                    width: '100%',
                    transition: '0.2s'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>
          <div style={{ background: '#141824', padding: '12px', borderRadius: '10px', border: '1px solid #263147', textAlign: 'center' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>مساحة العمل النشطة</span>
            <strong style={{ fontSize: '12.5px', color: '#d97706' }}>{businessName}</strong>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: theme.textDark }}>
              {availableTabs.find(t => t.id === activeTab)?.icon} {availableTabs.find(t => t.id === activeTab)?.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: theme.bgMain, padding: '6px 14px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>{user.name[0]}</div>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{user.name}</span>
            </div>
            <button onClick={handleLogout} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>خروج</button>
          </div>
        </header>

        <main style={{ padding: '30px', flex: 1, boxSizing: 'border-box' }}>
          {activeTab === 'dashboard' && user.role !== 'cashier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>لوحة التحكم</h2>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>مرحباً بك في نظام محور المطور.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.invValue}</p><h2 style={{ color: '#d97706', margin: '8px 0 0 0', fontSize: '22px' }}>{inventoryVal.toLocaleString()} {t.currency}</h2></div>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي المبيعات</p><h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '22px' }}>{totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي المخزون</p><h2 style={{ color: '#38bdf8', margin: '8px 0 0 0', fontSize: '22px' }}>{inventory.length} منتج</h2></div>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>الفواتير المصدرة</p><h2 style={{ color: '#a855f7', margin: '8px 0 0 0', fontSize: '22px' }}>{invoices.length} فاتورة</h2></div>
              </div>
            </div>
          )}

          {activeTab === 'pos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>🛒 نقطة البيع السريعة</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                  {inventory.map(prod => {
                    const cartItem = cartItems.find(it => it.productId === prod.id);
                    const qty = cartItem ? cartItem.quantity : 0;
                    
                    // دالة لتحديث الكمية (إما بالضغط على الأزرار أو بالكتابة اليدوية المباشرة في خانة الإدخال)
                    const updateQty = (newQ) => {
                      if (isNaN(newQ) || newQ < 0) newQ = 0;
                      if (newQ > prod.stock) newQ = prod.stock;
                      
                      if (newQ === 0) {
                        setCartItems(cartItems.filter(i => i.productId !== prod.id));
                      } else if (cartItem) {
                        setCartItems(cartItems.map(i => i.productId === prod.id ? { ...i, quantity: newQ, subtotal: Number((newQ * prod.price).toFixed(2)) } : i));
                      } else {
                        setCartItems([...cartItems, { productId: prod.id, name: prod.name, quantity: newQ, price: prod.price, subtotal: Number((newQ * prod.price).toFixed(2)) }]);
                      }
                    };

                    return (
                      <div key={prod.id} style={{ background: theme.bgMain, border: `1px solid ${qty > 0 ? '#d97706' : theme.border}`, borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>{prod.name}</h4>
                          <span style={{ color: '#d97706', fontWeight: 'bold', fontSize: '12px' }}>{prod.price} {t.currency}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.cardBg, borderRadius: '6px', padding: '2px', border: `1px solid ${theme.border}` }}>
                          <button type="button" onClick={() => updateQty(qty - 1)} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                          
                          {/* خانة إدخال رقمية تقبل الكتابة اليدوية المباشرة لأي كمية */}
                          <input 
                            type="number" 
                            min="0" 
                            max={prod.stock} 
                            value={qty} 
                            onChange={(e) => updateQty(Number(e.target.value))} 
                            style={{ width: '45px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '13px', color: theme.textDark, outline: 'none' }} 
                          />

                          <button type="button" onClick={() => updateQty(qty + 1)} style={{ background: '#d97706', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: '#020617', borderRadius: '16px', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>محتويات السلة</h3>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cartItems.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '8px', borderRadius: '8px', fontSize: '12px' }}>
                        <span>{item.name} ({item.quantity})</span>
                        <strong style={{ color: '#38bdf8' }}>{item.subtotal} {t.currency}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ borderTop: '1px dashed #334155', paddingTop: '10px', margin: '15px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                      <span>الإجمالي المستحق:</span>
                      <span style={{ color: '#38bdf8' }}>{cartGrandTotal.toFixed(2)} {t.currency}</span>
                    </div>
                  </div>
                  <button onClick={handleSaveInvoice} disabled={!cartItems.length || isSubmittingSale} style={{ width: '100%', background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                    إتمام الدفع وإصدار الفاتورة 💳
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>سجل الفواتير والمبيعات المعتمدة</h2>
                <button onClick={handleExportSales} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير إلى Excel 📥</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '12px' }}>رقم الفاتورة</th>
                    <th style={{ padding: '12px' }}>العميل</th>
                    <th style={{ padding: '12px' }}>المبلغ الإجمالي</th>
                    <th style={{ padding: '12px' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>#{inv.invoiceNo}</td>
                      <td style={{ padding: '12px' }}>{inv.customer?.name || 'عميل نقدي'}</td>
                      <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>{inv.totalAmount} {t.currency}</td>
                      <td style={{ padding: '12px' }}><button onClick={() => setPrintingInvoice(inv)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>معاينة وطباعة 👁️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'purchases' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', maxWidth: '600px', margin: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>{t.issuePurchase}</h2>
              <select value={selectedSupplierId} onChange={e=>setSelectedSupplierId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }}>
                <option value="">{t.defaultSupp}</option>
                {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={selectedPurchaseProdId} onChange={e=>setSelectedPurchaseProdId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }}>
                <option value="">{t.chooseProd}</option>
                {inventory.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" placeholder={t.purchaseQty} value={purchaseQty} onChange={e=>setPurchaseQty(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
              <input type="number" placeholder={t.purchaseCost} value={purchaseCost} onChange={e=>setPurchaseCost(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={handleSavePurchase} style={{ width: '100%', background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.confirmPurchaseBtn}</button>
            </div>
          )}

          {activeTab === 'customers' && user.role !== 'cashier' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{t.addNewCust}</h3>
                <form onSubmit={handleAddOrUpdateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder={t.custName} value={custName} onChange={e=>setCustName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <input type="text" placeholder={t.custNationalId} value={custNationalId} onChange={e=>setCustNationalId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <input type="text" placeholder={t.custPhone} value={custPhone} onChange={e=>setCustPhone(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveCust}</button>
                </form>
              </div>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}><h3 style={{ margin: 0, fontSize: '17px' }}>{t.custDirectory}</h3><button onClick={handleExportCustomers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير Excel</button></div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Phone</th><th></th></tr></thead>
                  <tbody>{customers.map(c=><tr key={c.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{c.name}</td><td style={{ padding: '10px' }}>{c.phone||'-'}</td><td><button onClick={()=>handleDeleteCustomer(c.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button></td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'suppliers' && user.role !== 'cashier' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{t.addNewSupp}</h3>
                <form onSubmit={handleAddOrUpdateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder={t.suppName} value={suppName} onChange={e=>setSuppName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <input type="text" placeholder={t.suppTaxNumber} value={suppTaxNumber} onChange={e=>setSuppTaxNumber(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <input type="text" placeholder={t.suppPhone} value={suppPhone} onChange={e=>setSuppPhone(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveSupp}</button>
                </form>
              </div>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}><h3 style={{ margin: 0, fontSize: '17px' }}>{t.suppDirectory}</h3><button onClick={handleExportSuppliers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير Excel</button></div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Tax No</th><th></th></tr></thead>
                  <tbody>{suppliers.map(s=><tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{s.name}</td><td style={{ padding: '10px' }}>{s.taxNumber||'-'}</td><td><button onClick={()=>handleDeleteSupplier(s.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>🗑️</button></td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div style={{ display: 'grid', gridTemplateColumns: user.role === 'cashier' ? '1fr' : '1fr 2fr', gap: '20px' }}>
              {user.role !== 'cashier' && (
                <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                  <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>➕ إضافة منتج</h3>
                  <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input type="text" placeholder={t.prodName} value={newProdName} onChange={e=>setNewProdName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                    <input type="number" placeholder={t.prodPrice} value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                    <input type="number" placeholder={t.prodStock} value={newProdStock} onChange={e=>setNewProdStock(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                    <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveProd}</button>
                  </form>
                </div>
              )}
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}><h3 style={{ margin: 0, fontSize: '17px' }}>{t.stockRepo}</h3><button onClick={handleExportInventory} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير Excel</button></div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Price</th><th style={{ padding: '10px' }}>Stock</th></tr></thead>
                  <tbody>{inventory.map(i=><tr key={i.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{i.name}</td><td style={{ padding: '10px' }}>{i.price}</td><td style={{ padding: '10px', color: '#10b981', fontWeight: 'bold' }}>{i.stock}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'production' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '30px', textAlign: 'center' }}>
              <h2>🏭 إدارة الإنتاج وأوامر التصنيع (BOM)</h2>
              <p style={{ color: theme.textMuted }}>النظام جاهز لربط وصفات التصنيع ومتابعة خطوط الإنتاج بدقة عالية.</p>
              <button style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>أمر إنتاج +</button>
            </div>
          )}

          {activeTab === 'hr' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '30px', textAlign: 'center' }}>
              <h2>👔 إدارة الموارد البشرية والرواتب</h2>
              <p style={{ color: theme.textMuted }}>إدارة الموظفين، الرواتب، الوثائق، وتنبيهات الإقامات والعقود الصحية.</p>
              <button style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>إضافة موظف +</button>
            </div>
          )}

          {activeTab === 'reports' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}><h2 style={{ margin: 0, fontSize: '18px' }}>{t.invRepo}</h2><button onClick={handleExportSales} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير المبيعات</button></div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>No</th><th style={{ padding: '10px' }}>Client</th><th style={{ padding: '10px' }}>Total</th><th></th></tr></thead>
                <tbody>{invoices.map(inv=><tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>#{inv.invoiceNo}</td><td style={{ padding: '10px' }}>{inv.customer?.name||'Cash'}</td><td style={{ padding: '10px' }}>{inv.totalAmount}</td><td><button onClick={()=>setPrintingInvoice(inv)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>View</button></td></tr>)}</tbody>
              </table>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '22px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{t.prefTitle}</h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <button onClick={()=>setLang('ar')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: lang==='ar'?'#d97706':'transparent', color: '#fff', border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🇸🇦 العربية</button>
                  <button onClick={()=>setLang('en')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: lang==='en'?'#d97706':'transparent', color: '#fff', border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🇺🇸 English</button>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={()=>setIsDark(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: !isDark?'#d97706':'transparent', color: '#fff', border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>☀️ النهاري</button>
                  <button onClick={()=>setIsDark(core => core)} onClick={()=>setIsDark(true)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: isDark?'#d97706':'transparent', color: '#fff', border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🌙 الداكن</button>
                </div>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '22px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{t.securityTitle}</h3>
                <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="password" placeholder={t.oldPass} value={currentPass} onChange={e=>setCurrentPass(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <input type="password" placeholder={t.newPass} value={newPass} onChange={e=>setNewPass(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t.updatePassBtn}</button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {printingInvoice && (
        <div className="invoice-modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '10px' }}>
          <div className="invoice-modal-card" style={{ background: '#fff', color: '#0f172a', padding: '30px', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div className="no-print-zone" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2>{t.taxInvoiceTitle}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📥 حفظ PDF / طباعة</button>
                <button onClick={()=>setPrintingInvoice(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </div>

            {/* قالب الفاتورة المعزول خصيصاً للطباعة بحجم A4 طولي عمودي وبشكل نظيف */}
            <div id="zatca-printable-invoice" style={{ background: '#fff', color: '#000', padding: '15px', boxSizing: 'border-box' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>{businessName}</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>{t.taxInvoiceTitle}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '20px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px' }}>
                <div>
                  <p style={{ margin: '4px 0' }}><strong>{t.invNo}</strong> #{printingInvoice.invoiceNo}</p>
                  <p style={{ margin: '4px 0' }}><strong>{t.clientCol}</strong> {printingInvoice.customer?.name || 'عميل نقدي'}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '4px 0' }}><strong>{t.invoiceDate}</strong> {new Date(printingInvoice.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    <th style={{ padding: '10px', textAlign: 'right' }}>{t.itemDesc}</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>{t.itemQuantity}</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>{t.unitPriceCol}</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>{t.totalCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {printingInvoice.items?.map((it, idx)=>(
                    <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{it.product?.name || 'صنف'}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{it.unitPrice}</td>
                      <td style={{ padding: '10px', textAlign: 'left' }}>{it.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', borderTop: '1px solid #cbd5e1', paddingTop: '15px' }}>
                <img src={generateZatcaQR(printingInvoice, businessName)} alt="QR" style={{ width: '110px', height: '110px' }} />
                <div style={{ textAlign: 'right', fontSize: '14px' }}>
                  <p style={{ margin: '5px 0' }}>{t.subtotal} <strong>{printingInvoice.subtotal}</strong> {t.currency}</p>
                  <p style={{ margin: '5px 0' }}>{t.vatAmount} <strong>{printingInvoice.taxAmount}</strong> {t.currency}</p>
                  <h3 style={{ margin: '10px 0 0 0', color: '#0f172a', fontSize: '16px' }}>{t.totalDue} <strong>{printingInvoice.totalAmount}</strong> {t.currency}</h3>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '35px', fontSize: '11px', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '12px' }}>
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