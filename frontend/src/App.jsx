import { useState, useEffect } from 'react';
import API from './services/api';

const exportToExcel = (sheetTitle, headers, rows, lang = 'ar') => {
  const isAr = lang === 'ar';
  const cleanTitle = sheetTitle.replace(/[/\\?*[\]]/g, '');
  const brandName = isAr ? 'محور ERP' : 'Mihwar ERP';
  const metaText = isAr
    ? `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')} | وثيقة معتمدة ومصدرة آلياً`
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
    dashboard: '📊 لوحة التحكم',
    sales: '🛍️ المبيعات والفوترة',
    purchases: '📥 المشتريات والتوريد',
    customers: '👥 العملاء',
    suppliers: '🏭 الموردين',
    inventory: '📦 المخزون',
    reports: '📈 التقارير',
    team: '👨‍💼 فريق العمل والصلاحيات',
    settings: '⚙️ الإعدادات',
    welcome: 'مرحباً بك،',
    currency: 'ر.س',

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
    cartEmpty: 'لم تتم إضافة أي صنف للفاتورة بعد.',
    confirmSaleBtn: '💳 إصدار الفاتورة واعتماد الخصم',
    summaryTitle: 'ملخص الحسبة التلقائية',
    vatBadge: 'ضريبة 15% آلية',
    subtotal: 'المبلغ الخاضع للضريبة:',
    vatAmount: 'ضريبة القيمة المضافة (15%):',
    totalDue: 'الإجمالي المستحق:',
    vatNote: '💡 ستُخصم كافة أصناف السلة فوراً من رصيد المستودع.',

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
    exportSalesBtn: '📥 تصدير المبيعات للإقرار الضريبي',
    exportPurchasesBtn: '📥 تصدير المشتريات',
    exportInventoryBtn: '📥 تصدير جرد المستودع',
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
    zatcaQRSub: 'امسح الرمز للتحقق من بيانات الفاتورة',
    invoiceFooterNote: 'شكراً لتعاملكم معنا • صدرت إلكترونياً عبر نظام محور ERP',

    prodName: 'اسم المنتج',
    prodPrice: 'سعر البيع الافتراضي (ر.س)',
    prodStock: 'الكمية الأولية بالمخزون',
    saveProd: 'حفظ المنتج في TiDB',
    stockRepo: '📦 مستودع المنتجات (متصل بـ TiDB)',
    availableStock: 'الرصيد الفعلي',

    teamTitle: 'إدارة فريق العمل وصلاحيات الموظفين',
    teamSub: 'إضافة موظفين جدد وتحديد أدوارهم في النظام',
    empName: 'اسم الموظف',
    empEmail: 'البريد الإلكتروني',
    empPass: 'كلمة المرور المؤقتة',
    empRole: 'الدور الوظيفي',
    addEmpBtn: 'إضافة موظف جديد',
    teamList: 'قائمة أعضاء الفريق',

    settingsHeader: 'مركز إعدادات النظام',
    settingsSub: 'التحكم في المظهر واللغة والأمان',
    prefTitle: '🌐 تفضيلات اللغة والمظهر',
    prefDesc: 'تخصيص لغة النظام ونمط الشاشة',
    langLabel: 'لغة النظام:',
    themeLabel: 'نمط العرض:',
    darkMode: 'الوضع الليلي 🌙',
    lightMode: 'الوضع النهاري ☀️',
    securityTitle: '🔒 حماية الحساب وتغيير كلمة المرور',
    securityDesc: 'تغيير كلمة المرور بضوابط أمان مشددة',
    oldPass: 'كلمة المرور الحالية',
    newPass: 'كلمة المرور الجديدة (8 خانات فأكثر)',
    updatePassBtn: 'تحديث كلمة المرور فوراً',
    sessionTitle: '🚪 الجلسة وإدارة الحساب',
    sessionDesc: 'تسجيل الخروج من النظام',
    logoutBtn: 'تسجيل الخروج',
    dangerZoneTitle: '⚠️ منطقة الخطر: تعطيل الحساب',
    dangerZoneDesc: 'سيتم تعطيل الحساب وحظر الدخول نهائياً:',
    deleteAccBtn: 'تعطيل الحساب نهائياً'
  },
  en: {
    brand: 'Mihwar ERP',
    tagline: 'Enterprise Management Reimagined.',
    taglineSub: 'Next-generation cloud ERP connecting every department.',
    workspace: 'Workspace:',
    dashboard: '📊 Dashboard',
    sales: '🛍️ Sales & POS',
    purchases: '📥 Purchasing',
    customers: '👥 Clients',
    suppliers: '🏭 Suppliers',
    inventory: '📦 Inventory',
    reports: '📈 Reports',
    team: '👨‍💼 Team & Roles',
    settings: '⚙️ Settings',
    welcome: 'Welcome,',
    currency: 'SAR',

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
    lowStockClean: '✅ Warehouse inventory levels are optimal.',
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
    cartEmpty: 'No items added yet.',
    confirmSaleBtn: '💳 Confirm & Deplete Stock',
    summaryTitle: 'Live Tax Summary',
    vatBadge: 'Automated 15% VAT',
    subtotal: 'Taxable Amount:',
    vatAmount: 'Value Added Tax (15%):',
    totalDue: 'Total Amount Due:',
    vatNote: '💡 All items in the cart will be depleted atomically.',

    issuePurchase: '📥 Record Purchase & Inbound Stock',
    selectSupp: 'Supplier',
    defaultSupp: 'Direct Cash Inbound',
    purchaseProd: 'Target Product',
    purchaseQty: 'Inbound Quantity (Adds to stock)',
    purchaseCost: 'Unit Cost Price (SAR)',
    confirmPurchaseBtn: '📦 Confirm & Replenish Stock',
    purchaseVatNote: '💡 Warehouse stock will increase immediately.',

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
    zatcaQRSub: 'Scan to verify electronic invoice details',
    invoiceFooterNote: 'Thank you for your business • Issued electronically via Mihwar ERP',

    prodName: 'Product Name',
    prodPrice: 'Default Sale Price (SAR)',
    prodStock: 'Initial Stock Quantity',
    saveProd: 'Save Product to TiDB',
    stockRepo: '📦 Warehouse Products (TiDB Connected)',
    availableStock: 'Available Stock',

    teamTitle: 'Team & Staff Roles Management',
    teamSub: 'Add new employees and assign system access levels',
    empName: 'Employee Name',
    empEmail: 'Email Address',
    empPass: 'Temporary Password',
    empRole: 'Job Role',
    addEmpBtn: 'Add New Staff Member',
    teamList: 'Team Members Directory',

    settingsHeader: 'System Settings',
    settingsSub: 'Control enterprise preferences and security',
    prefTitle: '🌐 Language & Display Preferences',
    prefDesc: 'Customize interface language and theme',
    langLabel: 'System Language:',
    themeLabel: 'Color Theme:',
    darkMode: 'Dark Mode 🌙',
    lightMode: 'Light Mode ☀️',
    securityTitle: '🔒 Account Security & Password',
    securityDesc: 'Update your password under strict rules',
    oldPass: 'Current Password',
    newPass: 'New Password (8+ characters)',
    updatePassBtn: 'Update Password Now',
    sessionTitle: '🚪 Session & Controls',
    sessionDesc: 'Sign out from system',
    logoutBtn: 'Sign Out',
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

  // إدارة الفريق والموظفين
  const [teamUsers, setTeamUsers] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPass, setEmpPass] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRoleId, setEmpRoleId] = useState('');

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
    }
  }, [user]);

  const fetchAllData = () => {
    fetchInventory();
    fetchCustomers();
    fetchSuppliers();
    fetchInvoices();
    fetchPurchases();
    fetchTeamAndRoles();
  };

  const fetchInventory = async () => { try { const res = await API.get('/api/inventory'); if (res.data) setInventory(res.data); } catch (e) {} };
  const fetchCustomers = async () => { try { const res = await API.get('/api/customers'); if (res.data) setCustomers(res.data); } catch (e) {} };
  const fetchSuppliers = async () => { try { const res = await API.get('/api/suppliers'); if (res.data) setSuppliers(res.data); } catch (e) {} };
  const fetchInvoices = async () => { try { const res = await API.get('/api/sales'); if (res.data) setInvoices(res.data); } catch (e) {} };
  const fetchPurchases = async () => { try { const res = await API.get('/api/purchases'); if (res.data) setPurchaseInvoices(res.data); } catch (e) {} };
  
  const fetchTeamAndRoles = async () => {
    try {
      const uRes = await API.get('/api/users');
      if (uRes.data) setTeamUsers(uRes.data);
      const rRes = await API.get('/api/roles');
      if (rRes.data) setRolesList(rRes.data);
    } catch (e) {}
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    if (!empName || !empEmail || !empPass) return;
    try {
      await API.post('/api/users', { name: empName, email: empEmail, password: empPass, phone: empPhone, roleId: empRoleId ? Number(empRoleId) : null });
      alert(lang === 'ar' ? 'تم إضافة الموظف بنجاح' : 'Staff added successfully');
      setEmpName(''); setEmpEmail(''); setEmpPass(''); setEmpPhone(''); setEmpRoleId('');
      fetchTeamAndRoles();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed');
    }
  };

  const handleExportSales = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_المبيعات_الضريبية' : 'Tax_Sales_Report';
    const headers = isAr ? ['رقم الفاتورة', 'العميل المستلم', 'تاريخ الإصدار', 'المبلغ الخاضع للضريبة', 'الضريبة 15%', 'الإجمالي', 'البنود'] : ['Invoice #', 'Client', 'Date', 'Taxable', 'VAT 15%', 'Total', 'Items'];
    const rows = invoices.map(inv => [inv.invoiceNo, inv.customer?.name || 'Cash', new Date(inv.createdAt).toISOString().slice(0, 10), Number(inv.subtotal || 0).toFixed(2), Number(inv.taxAmount || 0).toFixed(2), Number(inv.totalAmount || 0).toFixed(2), inv.items?.length || 1]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportPurchases = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_المشتريات' : 'Purchases_Report';
    const headers = isAr ? ['رقم الشراء', 'المورد', 'التاريخ', 'المبلغ', 'الضريبة 15%', 'الإجمالي'] : ['Purchase #', 'Supplier', 'Date', 'Base', 'VAT 15%', 'Total'];
    const rows = purchaseInvoices.map(p => [p.invoiceNo, p.supplier?.name || 'Cash', new Date(p.createdAt).toISOString().slice(0, 10), Number(p.subtotal || 0).toFixed(2), Number(p.taxAmount || 0).toFixed(2), Number(p.totalAmount || 0).toFixed(2)]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportInventory = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_المخزون' : 'Inventory_Report';
    const headers = isAr ? ['المنتج', 'SKU', 'الرصيد', 'التكلفة', 'سعر البيع', 'القيمة الإجمالية'] : ['Product', 'SKU', 'Stock', 'Cost', 'Price', 'Total Value'];
    const rows = inventory.map(i => [i.name, i.sku || '-', i.stock, Number(i.cost || i.price).toFixed(2), Number(i.price).toFixed(2), (Number(i.price) * Number(i.stock)).toFixed(2)]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportCustomers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_العملاء' : 'Clients_Directory';
    const headers = isAr ? ['الاسم', 'الهوية / السجل', 'الهاتف', 'البريد'] : ['Name', 'ID/Tax', 'Phone', 'Email'];
    const rows = customers.map(c => [c.name, c.nationalId || '-', c.phone || '-', c.email || '-']);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportSuppliers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_الموردين' : 'Suppliers_Directory';
    const headers = isAr ? ['المورد', 'الرقم الضريبي', 'الهاتف', 'البريد'] : ['Supplier', 'Tax No', 'Phone', 'Email'];
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

  const handleSaveInvoice = async () => {
    if (!cartItems.length) return;
    setIsSubmittingSale(true);
    try {
      const res = await API.post('/api/sales', { customerId: selectedCustomerId ? Number(selectedCustomerId) : null, items: cartItems });
      setCartItems([]); fetchAllData();
      if (res.data?.invoice) setPrintingInvoice(res.data.invoice);
      setActiveTab('reports');
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
  const marginPercentage = totalRev > 0 ? ((netProfitVal / totalRev) * 100).toFixed(1) : '0.0';
  const lowStockItems = inventory.filter(i => i.stock <= lowStockThreshold);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authView === 'login') {
        const res = await API.post('/api/login', { email: authEmail, password: authPassword });
        setUser(res.data.user); localStorage.setItem('mihwar_user', JSON.stringify(res.data.user));
        if (res.data.token) { localStorage.setItem('mihwar_token', res.data.token); API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`; }
      } else {
        const res = await API.post('/api/register', { businessName: authBusinessName, clientName: authClientName, email: authEmail, password: authPassword });
        setUser(res.data.user); localStorage.setItem('mihwar_user', JSON.stringify(res.data.user));
        if (res.data.token) { localStorage.setItem('mihwar_token', res.data.token); API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`; }
      }
    } catch (err) { alert(err.response?.data?.error || 'Auth error'); } finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    setUser(null); localStorage.clear(); delete API.defaults.headers.common['Authorization']; setAuthView('login');
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
              <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>
                {lang === 'ar' ? 'English' : 'عربي'}
              </button>
            </div>

            <h1 style={{ color: theme.textDark, fontSize: '24px', fontWeight: '800' }}>
              {authView === 'login' ? (lang === 'ar' ? 'تسجيل الدخول' : 'Sign In') : authView === 'register' ? (lang === 'ar' ? 'إنشاء مساحة عمل' : 'Create Workspace') : t.forgotPassTitle}
            </h1>

            {authView === 'forgot' ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await API.post('/api/forgot-password', { email: authEmail, newPassword: authPassword });
                  alert(`✅ ${res.data.message}`); setAuthView('login'); setAuthPassword('');
                } catch(err) { alert(err.response?.data?.error || 'Error'); }
              }} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <input type="email" placeholder="Email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                <input type="password" placeholder="New Password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.resetPassBtn}</button>
                <span onClick={() => setAuthView('login')} style={{ color: theme.primary, cursor: 'pointer', textAlign: 'center', fontWeight: 'bold' }}>{t.backToLogin}</span>
              </form>
            ) : (
              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {authView === 'register' && (
                  <>
                    <input type="text" placeholder="Company Name" value={authBusinessName} onChange={e=>setAuthBusinessName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                    <input type="text" placeholder="Manager Name" value={authClientName} onChange={e=>setAuthClientName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                  </>
                )}
                <input type="email" placeholder="Email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }} />
                <div>
                  <input type="password" placeholder="Password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, boxSizing: 'border-box' }} />
                  {authView === 'login' && <span onClick={()=>setAuthView('forgot')} style={{ fontSize: '12px', color: theme.primary, cursor: 'pointer', fontWeight: 'bold', display: 'block', marginTop: '5px' }}>{t.forgotPassLink}</span>}
                </div>
                <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{authView === 'login' ? 'Sign In' : 'Register'}</button>
                <span onClick={()=>setAuthView(authView === 'login' ? 'register' : 'login')} style={{ color: theme.primary, cursor: 'pointer', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
                  {authView === 'login' ? 'Create an account' : 'Already registered?'}
                </span>
              </form>
            )}
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
      <header style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: '14px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #0f766e, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px' }}>🏢</div>
            <span style={{ fontWeight: '900', color: theme.textDark, fontSize: '19px' }}>{t.brand}</span>
          </div>
          <span style={{ fontSize: '13px', background: isDark ? '#334155' : '#f1f5f9', padding: '6px 14px', borderRadius: '8px' }}>{t.workspace} <strong>{businessName}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: theme.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{user.name[0]}</div>
          <span style={{ fontSize: '14px', fontWeight: '800' }}>{user.name} ({user.role})</span>
        </div>
      </header>

      <div style={{ background: theme.secondary, color: '#fff', padding: '0 30px', display: 'flex', gap: '4px', fontSize: '13px', overflowX: 'auto' }}>
        {[
          { id: 'dashboard', label: t.dashboard },
          { id: 'sales', label: t.sales },
          { id: 'purchases', label: t.purchases },
          { id: 'customers', label: t.customers },
          { id: 'suppliers', label: t.suppliers },
          { id: 'inventory', label: t.inventory },
          { id: 'reports', label: t.reports },
          { id: 'team', label: t.team },
          { id: 'settings', label: t.settings }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ background: activeTab === tab.id ? theme.primary : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '16px 18px', fontWeight: activeTab === tab.id ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
            {tab.label}
          </button>
        ))}
      </div>

      <main style={{ padding: '30px', maxWidth: '1400px', margin: 'auto' }}>
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <h1 style={{ margin: 0, fontSize: '24px' }}>{t.welcome} {user.name} 👋</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.invValue}</p><h2 style={{ color: theme.primary, margin: '8px 0 0 0', fontSize: '24px' }}>{inventoryVal.toLocaleString()} {t.currency}</h2></div>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.salesTotal}</p><h2 style={{ color: theme.accentGreen, margin: '8px 0 0 0', fontSize: '24px' }}>{totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.purchasesTotal}</p><h2 style={{ color: theme.accentAmber, margin: '8px 0 0 0', fontSize: '24px' }}>{totalPurchasesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
              <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.netProfit}</p><h2 style={{ color: theme.accentGreen, margin: '8px 0 0 0', fontSize: '24px' }}>{netProfitVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h2 style={{ marginTop: 0 }}>{t.issueInvoice}</h2>
              <select value={selectedCustomerId} onChange={e=>setSelectedCustomerId(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bgMain, color: theme.textDark, marginBottom: '15px' }}>
                <option value="">{t.defaultCust}</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <select value={selectedProductId} onChange={e=>setSelectedProductId(e.target.value)} style={{ flex: 2, padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }}>
                  <option value="">{t.chooseProd}</option>
                  {inventory.map(p=><option key={p.id} value={p.id}>{p.name} ({p.stock})</option>)}
                </select>
                <input type="number" min="1" value={itemQty} onChange={e=>setItemQty(e.target.value)} style={{ width: '70px', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <button type="button" onClick={handleAddItemToCart} style={{ background: theme.primary, color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t.addItemBtn}</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ background: isDark?'#334155':'#f8fafc' }}><th style={{ padding: '8px' }}>Item</th><th style={{ padding: '8px' }}>Qty</th><th style={{ padding: '8px' }}>Total</th><th></th></tr></thead>
                <tbody>
                  {cartItems.map((it, idx)=>(
                    <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '8px' }}>{it.name}</td><td style={{ padding: '8px' }}>{it.quantity}</td><td style={{ padding: '8px' }}>{it.subtotal}</td>
                      <td><button onClick={()=>handleRemoveItemFromCart(idx)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '4px' }}>✖</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleSaveInvoice} disabled={!cartItems.length || isSubmittingSale} style={{ width: '100%', background: cartItems.length ? theme.primary : '#94a3b8', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' }}>{t.confirmSaleBtn}</button>
            </div>
            <div style={{ background: '#020617', borderRadius: '14px', color: '#fff', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3>{t.summaryTitle}</h3>
                <p>{t.subtotal} {cartSubtotal.toFixed(2)}</p>
                <p>{t.vatAmount} {cartTax.toFixed(2)}</p>
                <hr style={{ borderColor: '#334155' }} />
                <h2>{t.totalDue} {cartGrandTotal.toFixed(2)} {t.currency}</h2>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{t.vatNote}</p>
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', maxWidth: '600px' }}>
            <h2>{t.issuePurchase}</h2>
            <select value={selectedSupplierId} onChange={e=>setSelectedSupplierId(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }}>
              <option value="">{t.defaultSupp}</option>
              {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={selectedPurchaseProdId} onChange={e=>setSelectedPurchaseProdId(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }}>
              <option value="">{t.chooseProd}</option>
              {inventory.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="number" placeholder={t.purchaseQty} value={purchaseQty} onChange={e=>setPurchaseQty(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
            <input type="number" placeholder={t.purchaseCost} value={purchaseCost} onChange={e=>setPurchaseCost(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
            <button onClick={handleSavePurchase} style={{ width: '100%', background: theme.accentAmber, color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.confirmPurchaseBtn}</button>
          </div>
        )}

        {activeTab === 'customers' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3>{t.addNewCust}</h3>
              <form onSubmit={handleAddOrUpdateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder={t.custName} value={custName} onChange={e=>setCustName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <input type="text" placeholder={t.custNationalId} value={custNationalId} onChange={e=>setCustNationalId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <input type="text" placeholder={t.custPhone} value={custPhone} onChange={e=>setCustPhone(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveCust}</button>
              </form>
            </div>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><h3>{t.custDirectory}</h3><button onClick={handleExportCustomers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>{t.exportExcelBtn}</button></div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ background: isDark?'#334155':'#f8fafc' }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Phone</th><th></th></tr></thead>
                <tbody>{customers.map(c=><tr key={c.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{c.name}</td><td style={{ padding: '10px' }}>{c.phone||'-'}</td><td><button onClick={()=>handleDeleteCustomer(c.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px' }}>🗑️</button></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3>{t.addNewSupp}</h3>
              <form onSubmit={handleAddOrUpdateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder={t.suppName} value={suppName} onChange={e=>setSuppName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <input type="text" placeholder={t.suppTaxNumber} value={suppTaxNumber} onChange={e=>setSuppTaxNumber(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <input type="text" placeholder={t.suppPhone} value={suppPhone} onChange={e=>setSuppPhone(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveSupp}</button>
              </form>
            </div>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><h3>{t.suppDirectory}</h3><button onClick={handleExportSuppliers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>{t.exportExcelBtn}</button></div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ background: isDark?'#334155':'#f8fafc' }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Tax No</th><th></th></tr></thead>
                <tbody>{suppliers.map(s=><tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{s.name}</td><td style={{ padding: '10px' }}>{s.taxNumber||'-'}</td><td><button onClick={()=>handleDeleteSupplier(s.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px' }}>🗑️</button></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3>➕ إضافة منتج</h3>
              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input type="text" placeholder={t.prodName} value={newProdName} onChange={e=>setNewProdName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <input type="number" placeholder={t.prodPrice} value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <input type="number" placeholder={t.prodStock} value={newProdStock} onChange={e=>setNewProdStock(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveProd}</button>
              </form>
            </div>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><h3>{t.stockRepo}</h3><button onClick={handleExportInventory} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>{t.exportInventoryBtn}</button></div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ background: isDark?'#334155':'#f8fafc' }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Price</th><th style={{ padding: '10px' }}>Stock</th></tr></thead>
                <tbody>{inventory.map(i=><tr key={i.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{i.name}</td><td style={{ padding: '10px' }}>{i.price}</td><td style={{ padding: '10px', color: '#0d9488', fontWeight: 'bold' }}>{i.stock}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}><h2>{t.invRepo}</h2><button onClick={handleExportSales} style={{ background: theme.primary, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px' }}>{t.exportSalesBtn}</button></div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead><tr style={{ background: isDark?'#334155':'#f8fafc' }}><th style={{ padding: '10px' }}>No</th><th style={{ padding: '10px' }}>Client</th><th style={{ padding: '10px' }}>Total</th><th></th></tr></thead>
                <tbody>{invoices.map(inv=><tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>#{inv.invoiceNo}</td><td style={{ padding: '10px' }}>{inv.customer?.name||'Cash'}</td><td style={{ padding: '10px' }}>{inv.totalAmount}</td><td><button onClick={()=>setPrintingInvoice(inv)} style={{ background: theme.primary, color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px' }}>View</button></td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3>{t.teamTitle}</h3>
              <p style={{ fontSize: '12px', color: theme.textMuted }}>{t.teamSub}</p>
              <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                <input type="text" placeholder={t.empName} value={empName} onChange={e=>setEmpName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <input type="email" placeholder={t.empEmail} value={empEmail} onChange={e=>setEmpEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <input type="password" placeholder={t.empPass} value={empPass} onChange={e=>setEmpPass(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }} />
                <select value={empRoleId} onChange={e=>setEmpRoleId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}` }}>
                  <option value="">{t.empRole}</option>
                  {rolesList.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                <button type="submit" style={{ background: theme.primary, color: '#fff', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t.addEmpBtn}</button>
              </form>
            </div>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <h3>{t.teamList}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '15px' }}>
                <thead><tr style={{ background: isDark?'#334155':'#f8fafc' }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Email</th><th style={{ padding: '10px' }}>Role</th></tr></thead>
                <tbody>{teamUsers.map(u=><tr key={u.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{u.name}</td><td style={{ padding: '10px' }}>{u.email}</td><td style={{ padding: '10px', fontWeight: 'bold', color: theme.primary }}>{u.role?.name || 'مدير'}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px' }}>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3>{t.prefTitle}</h3>
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button onClick={()=>setLang('ar')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: lang==='ar'?theme.primary:'transparent', color: lang==='ar'?'#fff':theme.textDark, border: `1px solid ${theme.border}`, fontWeight: 'bold' }}>🇸🇦 العربية</button>
                <button onClick={()=>setLang('en')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: lang==='en'?theme.primary:'transparent', color: lang==='en'?'#fff':theme.textDark, border: `1px solid ${theme.border}`, fontWeight: 'bold' }}>🇺🇸 English</button>
              </div>
            </div>
            <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '25px' }}>
              <h3>{t.sessionTitle}</h3>
              <button onClick={handleLogout} style={{ width: '100%', background: '#fee2e2', color: '#dc2626', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>🚪 {t.logoutBtn}</button>
            </div>
          </div>
        )}
      </main>

      {printingInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', color: '#0f172a', padding: '35px', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2>{t.taxInvoiceTitle}</h2>
              <button onClick={()=>setPrintingInvoice(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px' }}>{t.closeModal}</button>
            </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <img src={generateZatcaQR(printingInvoice, businessName)} alt="QR" style={{ width: '100px', height: '100px' }} />
              <div style={{ textAlign: 'right' }}>
                <p>{t.subtotal} {printingInvoice.subtotal} {t.currency}</p>
                <p>{t.vatAmount} {printingInvoice.taxAmount} {t.currency}</p>
                <h3>{t.totalDue} {printingInvoice.totalAmount} {t.currency}</h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;