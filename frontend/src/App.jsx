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
    workspace: 'مساحة العمل:',
    dashboard: 'لوحة التحكم',
    pos: 'نقطة البيع (POS)',
    sales: 'المبيعات والفوترة',
    invoicesList: 'سجل الفواتير',
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
    enterAppBtn: 'ابدأ العمل الآن 🚀',
    hrTitle: 'الموارد البشرية والرواتب والخصومات',
    hrSub: 'إدارة الموظفين، الرواتب، الأجازات، وسجل الخصومات بالتاريخ التلقائي.',
    addEmpBtn: 'إضافة موظف جديد +',
    addDeductBtn: 'إضافة خصم +',
    empName: 'الاسم الكامل *',
    empIdNumber: 'رقم الهوية / الإقامة',
    empNumber: 'رقم الموظف',
    empRole: 'المسمى الوظيفي',
    empDept: 'القسم',
    empPhone: 'رقم الهاتف',
    empSalary: 'الراتب الأساسي (ر.س)',
    empDeductions: 'إجمالي الخصومات (ر.س)',
    empVacations: 'رصيد الأجازات (أيام)',
    empInsurance: 'التأمين الطبي',
    empStatus: 'الحالة',
    empIqamaEnd: 'انتهاء الإقامة',
    empHealthEnd: 'انتهاء الشهادة الصحية',
    empContractEnd: 'انتهاء العقد',
    saveEmp: 'حفظ الموظف',
    updateEmp: 'تحديث بيانات الموظف',
    saveDeduct: 'تسجيل الخصم',
    closeModal: 'إغلاق',
    invValue: 'قيمة المخزون الإجمالية',
    salesTotal: 'إجمالي المبيعات (شامل الضريبة)',
    purchasesTotal: 'إجمالي المشتريات (شامل الضريبة)',
    netProfit: 'صافي الربح التقديري',
    lowStockClean: '✅ مستويات المخزون ممتازة، لا توجد أصناف قاربت على النفاد.',
    prodName: 'اسم المنتج',
    prodPrice: 'سعر البيع (ر.س)',
    prodStock: 'الكمية الأولية / الرصيد',
    saveProd: 'حفظ المنتج',
    updateProd: 'تحديث المنتج',
    stockRepo: '📦 مستودع المنتجات',
    invRepo: 'سجل الفواتير والمبيعات المعتمدة',
    prefTitle: '🌐 تفضيلات اللغة والمظهر',
    companyLogoTitle: '🏢 شعار المنشأة (الفاتورة)',
    companyLogoDesc: 'اختر أو ارفع صورة شعار منشأتك لتظهر تلقائياً في الفواتير المطبوعة',
    logoUrlLabel: 'رابط صورة الشعار (URL أو رفع ملف):',
    saveLogoBtn: 'حفظ شعار المنشأة',
    securityTitle: '🔒 أمان الحساب وتغيير كلمة المرور',
    oldPass: 'كلمة المرور الحالية',
    newPass: 'كلمة المرور الجديدة',
    updatePassBtn: 'تحديث كلمة المرور',
    logoutBtn: 'تسجيل الخروج',
    taxInvoiceTitle: 'فاتورة ضريبية',
    invoiceStatusPaid: 'مدفوعة',
    invoiceStatusUnpaid: 'غير مدفوعة',
    invoiceDueDateText: 'فوري (بدون مدة استحقاق)',
    clientCol: 'اسم العميل:',
    clientPhone: 'رقم الجوال:',
    clientEmail: 'البريد الإلكتروني:',
    itemDesc: 'وصف المنتج / الخدمة',
    itemQuantity: 'الكمية',
    unitPriceCol: 'السعر الفردي',
    totalCol: 'المجموع',
    subtotal: 'المبلغ الصافي:',
    vatAmount: 'ضريبة القيمة المضافة (15%):',
    totalDue: 'الإجمالي النهائي:',
    invoiceFooterNote: 'شكراً لتعاملكم معنا • صدرت إلكترونياً عبر نظام محور'
  },
  en: {
    brand: 'Mihwar ERP',
    tagline: 'Enterprise Management Reimagined.',
    workspace: 'Workspace:',
    dashboard: 'Dashboard',
    pos: 'POS Touch',
    sales: 'Sales & Invoicing',
    invoicesList: 'Invoices List',
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
    enterAppBtn: 'Get Started 🚀',
    hrTitle: 'Human Resources, Payroll & Deductions',
    hrSub: 'Manage employees, salaries, vacations, deductions with auto date.',
    addEmpBtn: 'Add New Employee +',
    addDeductBtn: 'Add Deduction +',
    empName: 'Full Name *',
    empIdNumber: 'National ID / Iqama',
    empNumber: 'Employee ID',
    empRole: 'Job Title',
    empDept: 'Department',
    empPhone: 'Phone Number',
    empSalary: 'Basic Salary (SAR)',
    empDeductions: 'Total Deductions (SAR)',
    empVacations: 'Vacation Balance (Days)',
    empInsurance: 'Medical Insurance',
    empStatus: 'Status',
    empIqamaEnd: 'Residency Expiry',
    empHealthEnd: 'Health Cert Expiry',
    empContractEnd: 'Contract Expiry',
    saveEmp: 'Save Employee',
    updateEmp: 'Update Employee',
    saveDeduct: 'Save Deduction',
    closeModal: 'Cancel',
    invValue: 'Total Inventory Valuation',
    salesTotal: 'Gross Sales',
    purchasesTotal: 'Gross Purchases',
    netProfit: 'Estimated Net Profit',
    lowStockClean: '✅ Warehouse inventory levels are optimal.',
    prodName: 'Product Name',
    prodPrice: 'Sale Price (SAR)',
    prodStock: 'Initial Stock',
    saveProd: 'Save Product',
    updateProd: 'Update Product',
    stockRepo: '📦 Warehouse Products',
    invRepo: 'Sales Invoices',
    prefTitle: '🌐 Language & Display',
    companyLogoTitle: '🏢 Company Logo (Invoice)',
    companyLogoDesc: 'Upload or set company logo URL to appear on printed invoices',
    logoUrlLabel: 'Logo Image URL:',
    saveLogoBtn: 'Save Company Logo',
    securityTitle: '🔒 Account Security',
    oldPass: 'Current Password',
    newPass: 'New Password',
    updatePassBtn: 'Update Password',
    logoutBtn: 'Sign Out',
    taxInvoiceTitle: 'Tax Invoice',
    invoiceStatusPaid: 'Paid',
    invoiceStatusUnpaid: 'Unpaid',
    invoiceDueDateText: 'Immediate (No due term)',
    clientCol: 'Client Name:',
    clientPhone: 'Mobile No:',
    clientEmail: 'Email Address:',
    itemDesc: 'Product / Service Description',
    itemQuantity: 'Qty',
    unitPriceCol: 'Unit Price',
    totalCol: 'Total',
    subtotal: 'Net Amount:',
    vatAmount: 'Value Added Tax (15%):',
    totalDue: 'Final Total:',
    invoiceFooterNote: 'Thank you for your business • Issued electronically via Mihwar ERP'
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

const safeLower = (val) => {
  if (val === null || val === undefined) return '';
  return String(val).toLowerCase();
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
  const [loginRole, setLoginRole] = useState('admin');
  const [adminSecretKey, setAdminSecretKey] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [businessName, setBusinessName] = useState('نظام محور');

  const [companyLogo, setCompanyLogo] = useState(() => {
    return localStorage.getItem('mihwar_company_logo') || '';
  });
  const [tempLogoInput, setTempLogoInput] = useState(companyLogo);

  // المخزون
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('mihwar_inventory');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'مطارة A10', price: 300, stock: 50, boxSize: 12, itemCode: 'SKU-001' }
    ];
  });
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [editingProdId, setEditingProdId] = useState(null);
  const [showEditProdModal, setShowEditProdModal] = useState(false);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdStock, setEditProdStock] = useState('');

  // العملاء
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('mihwar_customers');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'شركة الرائد لقطع غيار السيارات', nationalId: '25559451496', phone: '0562453535' }
    ];
  });
  const [custName, setCustName] = useState('');
  const [custNationalId, setCustNationalId] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [editingCustId, setEditingCustId] = useState(null);
  const [showEditCustModal, setShowEditCustModal] = useState(false);
  const [editCustName, setEditCustName] = useState('');
  const [editCustNationalId, setEditCustNationalId] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');

  // الموردين
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('mihwar_suppliers');
    return saved ? JSON.parse(saved) : [];
  });
  const [suppName, setSuppName] = useState('');
  const [suppTaxNumber, setSuppTaxNumber] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [editingSuppId, setEditingSuppId] = useState(null);
  const [showEditSuppModal, setShowEditSuppModal] = useState(false);
  const [editSuppName, setEditSuppName] = useState('');
  const [editSuppTaxNumber, setEditSuppTaxNumber] = useState('');
  const [editSuppPhone, setEditSuppPhone] = useState('');

  // الفواتير والتقارير
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('mihwar_invoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [reportSearchQuery, setReportSearchQuery] = useState('');
  
  // المبيعات والفوترة
  const [salesCustomerSearch, setSalesCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('مدفوعة');
  const [paymentMethod, setPaymentMethod] = useState('نقد');
  const [dueDateInput, setDueDateInput] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  // نقطة البيع (POS)
  const [posCustomerSearch, setPosCustomerSearch] = useState('');
  const [posSelectedCustomerId, setPosSelectedCustomerId] = useState('');
  const [showPosPayModal, setShowPosPayModal] = useState(false);
  const [posPaymentMethod, setPosPaymentMethod] = useState('نقد');

  // نافذة تأكيد طريقة السداد في سجل الفواتير
  const [showPayConfirmModal, setShowPayConfirmModal] = useState(false);
  const [payTargetInvoiceId, setPayTargetInvoiceId] = useState(null);
  const [payConfirmMethod, setPayConfirmMethod] = useState('نقد');

  // المشتريات
  const [purchaseProductSearch, setPurchaseProductSearch] = useState('');
  const [purchaseInvoices, setPurchaseInvoices] = useState(() => {
    const saved = localStorage.getItem('mihwar_purchases');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPurchaseProdId, setSelectedPurchaseProdId] = useState('');
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [purchaseCost, setPurchaseCost] = useState('');

  // الموارد البشرية
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('mihwar_hr_employees');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'أحمد حلمي محمد', idNumber: '799032458578', empNo: '20', role: 'مندوب جملة', dept: 'مبيعات وتوزيع', phone: '0530044627', salary: 4577, deductions: 120, vacations: 14, insurance: 'شامل الفئة أ', status: 'نشط', iqamaEnd: '2027-05-12', healthEnd: '2027-03-01', contractEnd: '2028-04-10' },
      { id: 2, name: 'محمد عبدالله الزهراني', idNumber: '288145789632', empNo: '21', role: 'مشرف خط إنتاج', dept: 'إنتاج وتعبئة', phone: '0501234567', salary: 5050, deductions: 50, vacations: 21, insurance: 'شامل الفئة ب', status: 'نشط', iqamaEnd: '2026-10-15', healthEnd: '2026-08-20', contractEnd: '2027-01-01' }
    ];
  });

  const [deductionsList, setDeductionsList] = useState(() => {
    const saved = localStorage.getItem('mihwar_hr_deductions');
    return saved ? JSON.parse(saved) : [
      { id: 1, empName: 'أحمد حلمي محمد', amount: 120, reason: 'تأخير عن الدوام الرسمي', date: new Date().toISOString().slice(0, 10) }
    ];
  });

  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState(null);

  const [empName, setEmpName] = useState('');
  const [empIdNumber, setEmpIdNumber] = useState('');
  const [empNumber, setEmpNumber] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [empVacations, setEmpVacations] = useState('');
  const [empInsurance, setEmpInsurance] = useState('');
  const [empStatus, setEmpStatus] = useState('نشط');
  const [empIqamaEnd, setEmpIqamaEnd] = useState('');
  const [empHealthEnd, setEmpHealthEnd] = useState('');
  const [empContractEnd, setEmpContractEnd] = useState('');

  const [hrDeductSearchQuery, setHrDeductSearchQuery] = useState('');
  const [hrSelectedEmployeeName, setHrSelectedEmployeeName] = useState('');
  const [hrDeductAmount, setHrDeductAmount] = useState('');
  const [hrDeductReason, setHrDeductReason] = useState('');

  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    const saved = localStorage.getItem('mihwar_low_stock_threshold');
    return saved ? Number(saved) : 30;
  });

  const [printingInvoice, setPrintingInvoice] = useState(null);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

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
      if (user.role === 'cashier' && activeTab !== 'pos') {
        setActiveTab('pos');
      }
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('mihwar_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('mihwar_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('mihwar_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('mihwar_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('mihwar_purchases', JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices]);

  const filteredInventory = inventory.filter(i => safeLower(i.name).includes(safeLower(inventorySearchQuery)));
  const filteredCustomers = customers.filter(c => safeLower(c.name).includes(safeLower(customerSearchQuery)) || safeLower(c.nationalId).includes(safeLower(customerSearchQuery)) || safeLower(c.phone).includes(safeLower(customerSearchQuery)));
  const filteredSuppliers = suppliers.filter(s => safeLower(s.name).includes(safeLower(supplierSearchQuery)) || safeLower(s.taxNumber).includes(safeLower(supplierSearchQuery)) || safeLower(s.phone).includes(safeLower(supplierSearchQuery)));
  const filteredInvoices = invoices.filter(inv => safeLower(inv.invoiceNo).includes(safeLower(invoiceSearchQuery)) || safeLower(inv.customer?.name).includes(safeLower(invoiceSearchQuery)));
  const filteredReports = invoices.filter(inv => safeLower(inv.invoiceNo).includes(safeLower(reportSearchQuery)) || safeLower(inv.customer?.name).includes(safeLower(reportSearchQuery)));
  const filteredCustomersForSales = customers.filter(c => safeLower(c.name).includes(safeLower(salesCustomerSearch)) || safeLower(c.nationalId).includes(safeLower(salesCustomerSearch)) || safeLower(c.phone).includes(safeLower(salesCustomerSearch)));
  const filteredCustomersForPos = customers.filter(c => safeLower(c.name).includes(safeLower(posCustomerSearch)) || safeLower(c.nationalId).includes(safeLower(posCustomerSearch)) || safeLower(c.phone).includes(safeLower(posCustomerSearch)));
  const filteredProductsForPurchase = inventory.filter(p => safeLower(p.name).includes(safeLower(purchaseProductSearch)));
  const filteredEmployeesForHrDeduct = employees.filter(emp => safeLower(emp.name).includes(safeLower(hrDeductSearchQuery)) || safeLower(emp.idNumber).includes(safeLower(hrDeductSearchQuery)));

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    if (!empName.trim()) return;
    if (editingEmpId) {
      const updated = employees.map(emp => {
        if (emp.id === editingEmpId) {
          return { ...emp, name: empName.trim(), idNumber: empIdNumber.trim() || emp.idNumber, empNo: empNumber.trim() || emp.empNo, role: empRole.trim() || emp.role, dept: empDept.trim() || emp.dept, phone: empPhone.trim() || emp.phone, salary: empSalary !== '' ? Number(empSalary) : emp.salary, vacations: empVacations !== '' ? Number(empVacations) : emp.vacations, insurance: empInsurance.trim() || emp.insurance, status: empStatus || emp.status, iqamaEnd: empIqamaEnd || emp.iqamaEnd, healthEnd: empHealthEnd || emp.healthEnd, contractEnd: empContractEnd || emp.contractEnd };
        }
        return emp;
      });
      setEmployees(updated);
      localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
    } else {
      const newEmp = { id: Date.now(), name: empName.trim(), idNumber: empIdNumber.trim() || '-', empNo: empNumber.trim() || String(employees.length + 1), role: empRole.trim() || 'موظف', dept: empDept.trim() || 'عام', phone: empPhone.trim() || '-', salary: Number(empSalary) || 4000, deductions: 0, vacations: Number(empVacations) || 21, insurance: empInsurance.trim() || 'تأمين أساسي', status: empStatus || 'نشط', iqamaEnd: '2027-05-12', healthEnd: '2027-03-01', contractEnd: '2028-04-10' };
      const updated = [newEmp, ...employees];
      setEmployees(updated);
      localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
    }
    setEmpName(''); setEmpIdNumber(''); setEmpNumber(''); setEmpRole(''); setEmpDept(''); setEmpPhone(''); setEmpSalary(''); setEmpVacations(''); setEmpInsurance(''); setEmpIqamaEnd(''); setEmpHealthEnd(''); setEmpContractEnd('');
    setEditingEmpId(null);
    setShowAddEmpModal(false);
  };

  const handleOpenEditEmp = (emp) => {
    setEditingEmpId(emp.id); setEmpName(emp.name || ''); setEmpIdNumber(emp.idNumber || ''); setEmpNumber(emp.empNo || ''); setEmpRole(emp.role || ''); setEmpDept(emp.dept || ''); setEmpPhone(emp.phone || ''); setEmpSalary(emp.salary || ''); setEmpVacations(emp.vacations || ''); setEmpInsurance(emp.insurance || ''); setEmpStatus(emp.status || 'نشط'); setEmpIqamaEnd(emp.iqamaEnd || ''); setEmpHealthEnd(emp.healthEnd || ''); setEmpContractEnd(emp.contractEnd || ''); setShowAddEmpModal(true);
  };

  const handleDeleteEmployee = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
  };

  const handleSaveHrDeduction = (e) => {
    e.preventDefault();
    if (!hrSelectedEmployeeName || !hrDeductAmount) return;
    const newDeduct = { id: Date.now(), empName: hrSelectedEmployeeName, amount: Number(hrDeductAmount), reason: hrDeductReason.trim() || 'بدون سبب مذكور', date: new Date().toISOString().slice(0, 10) };
    const updatedList = [newDeduct, ...deductionsList];
    setDeductionsList(updatedList);
    localStorage.setItem('mihwar_hr_deductions', JSON.stringify(updatedList));

    const updatedEmps = employees.map(emp => {
      if (emp.name === hrSelectedEmployeeName) {
        return { ...emp, deductions: Number(emp.deductions || 0) + Number(hrDeductAmount) };
      }
      return emp;
    });
    setEmployees(updatedEmps);
    localStorage.setItem('mihwar_hr_employees', JSON.stringify(updatedEmps));

    setHrDeductSearchQuery(''); setHrSelectedEmployeeName(''); setHrDeductAmount(''); setHrDeductReason('');
    setShowDeductModal(false);
    alert('✅ تم تسجيل الخصم بنجاح وتحديث بيانات الموظف!');
  };

  const handleRemoveDeduction = (deductId, empName, amount) => {
    if (!window.confirm('⚠️ هل أنت متأكد من إعفاء هذا الخصم؟')) return;
    const updatedDeductions = deductionsList.filter(d => d.id !== deductId);
    setDeductionsList(updatedDeductions);
    localStorage.setItem('mihwar_hr_deductions', JSON.stringify(updatedDeductions));

    const updatedEmps = employees.map(emp => {
      if (emp.name === empName) {
        return { ...emp, deductions: Math.max(0, Number(emp.deductions || 0) - Number(amount)) };
      }
      return emp;
    });
    setEmployees(updatedEmps);
    localStorage.setItem('mihwar_hr_employees', JSON.stringify(updatedEmps));
    alert('✅ تم إعفاء الخصم بنجاح واستعادة الرصيد للموظف!');
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProdId(prod.id); setEditProdName(prod.name || ''); setEditProdPrice(prod.price || ''); setEditProdStock(prod.stock !== undefined ? prod.stock : 0); setShowEditProdModal(true);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    if (!editProdName || !editProdPrice) return;
    const updated = inventory.map(item => item.id === editingProdId ? { ...item, name: editProdName, price: Number(editProdPrice), stock: Number(editProdStock) } : item);
    setInventory(updated);
    localStorage.setItem('mihwar_inventory', JSON.stringify(updated));
    setShowEditProdModal(false);
    setEditingProdId(null);
    alert('✅ تم تحديث المنتج بنجاح!');
  };

  const handleDeleteProduct = (prodId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من رغبتك في حذف هذا المنتج؟')) return;
    const updated = inventory.filter(item => item.id !== prodId);
    setInventory(updated);
    localStorage.setItem('mihwar_inventory', JSON.stringify(updated));
  };

  const handleOpenEditCustomer = (cust) => {
    setEditingCustId(cust.id); setEditCustName(cust.name || ''); setEditCustNationalId(cust.nationalId || ''); setEditCustPhone(cust.phone || ''); setShowEditCustModal(true);
  };

  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    if (!editCustName.trim()) return;
    const updated = customers.map(c => c.id === editingCustId ? { ...c, name: editCustName.trim(), nationalId: editCustNationalId.trim(), phone: editCustPhone.trim() } : c);
    setCustomers(updated);
    localStorage.setItem('mihwar_customers', JSON.stringify(updated));
    setShowEditCustModal(false);
    setEditingCustId(null);
    alert('✅ تم تحديث العميل بنجاح!');
  };

  const handleDeleteCustomer = (custId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا العميل؟')) return;
    const updated = customers.filter(c => c.id !== custId);
    setCustomers(updated);
    localStorage.setItem('mihwar_customers', JSON.stringify(updated));
  };

  const handleOpenEditSupplier = (supp) => {
    setEditingSuppId(supp.id); setEditSuppName(supp.name || ''); setEditSuppTaxNumber(supp.taxNumber || ''); setEditSuppPhone(supp.phone || ''); setShowEditSuppModal(true);
  };

  const handleUpdateSupplier = (e) => {
    e.preventDefault();
    if (!editSuppName.trim()) return;
    const updated = suppliers.map(s => s.id === editingSuppId ? { ...s, name: editSuppName.trim(), taxNumber: editSuppTaxNumber.trim(), phone: editSuppPhone.trim() } : s);
    setSuppliers(updated);
    localStorage.setItem('mihwar_suppliers', JSON.stringify(updated));
    setShowEditSuppModal(false);
    setEditingSuppId(null);
    alert('✅ تم تحديث المورد بنجاح!');
  };

  const handleDeleteSupplier = (suppId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا المورد؟')) return;
    const updated = suppliers.filter(s => s.id !== suppId);
    setSuppliers(updated);
    localStorage.setItem('mihwar_suppliers', JSON.stringify(updated));
  };

  const handleOpenPayConfirm = (invoiceId) => {
    setPayTargetInvoiceId(invoiceId);
    setPayConfirmMethod('نقد');
    setShowPayConfirmModal(true);
  };

  const handleExecutePayment = () => {
    if (!payTargetInvoiceId) return;
    const updated = invoices.map(inv => {
      if (inv.id === payTargetInvoiceId) {
        localStorage.setItem(`invoice_status_${inv.id}`, 'مدفوعة');
        localStorage.setItem(`invoice_method_${inv.id}`, payConfirmMethod);
        localStorage.removeItem(`invoice_duedate_${inv.id}`);
        return { ...inv, paymentStatus: 'مدفوعة', paymentMethod: payConfirmMethod, dueDate: '' };
      }
      return inv;
    });
    setInvoices(updated);
    localStorage.setItem('mihwar_invoices', JSON.stringify(updated));
    setShowPayConfirmModal(false);
    alert(`✅ تم تأكيد السداد بطريقة (${payConfirmMethod}) وتحويل الفاتورة إلى مدفوعة!`);
  };

  const handleAddItemToSalesCart = () => {
    if (!selectedProductId) return;
    const product = inventory.find(p => p.id === Number(selectedProductId));
    if (!product) return;
    const qty = Number(itemQty);
    if (qty <= 0) return;
    const price = itemPrice !== '' && !isNaN(Number(itemPrice)) ? Number(itemPrice) : product.price;

    const existing = cartItems.find(it => it.productId === product.id && it.unitPrice === price);
    const reqQ = (existing ? existing.quantity : 0) + qty;
    if (reqQ > product.stock) { alert('Stock limit exceeded'); return; }

    if (existing) {
      setCartItems(cartItems.map(it => (it.productId === product.id && it.unitPrice === price) ? { ...it, quantity: reqQ, subtotal: Number((reqQ * price).toFixed(2)) } : it));
    } else {
      setCartItems([...cartItems, { productId: product.id, name: product.name, quantity: qty, unitPrice: price, subtotal: Number((qty * price).toFixed(2)) }]);
    }
    setSelectedProductId(''); setItemQty(1); setItemPrice('');
  };

  const handleRemoveSalesCartItem = (idx) => {
    setCartItems(cartItems.filter((_, i) => i !== idx));
  };

  const handleSaveSalesInvoice = () => {
    if (!cartItems.length) return;
    setIsSubmittingSale(true);
    try {
      const sub = cartItems.reduce((s, it) => s + it.subtotal, 0);
      const tax = sub * 0.15;
      const tot = sub + tax;

      const newInv = {
        id: Date.now(),
        invoiceNo: Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
        customer: customers.find(c => c.id === Number(selectedCustomerId)) || null,
        items: cartItems.map(it => ({ product: { name: it.name }, quantity: it.quantity, unitPrice: it.unitPrice, subtotal: it.subtotal })),
        subtotal: sub.toFixed(2),
        taxAmount: tax.toFixed(2),
        totalAmount: tot.toFixed(2),
        paymentStatus: invoiceStatus,
        paymentMethod: invoiceStatus === 'مدفوعة' ? paymentMethod : 'آجل',
        dueDate: invoiceStatus === 'غير مدفوعة' ? dueDateInput : ''
      };

      const updatedInvList = [newInv, ...invoices];
      setInvoices(updatedInvList);
      localStorage.setItem('mihwar_invoices', JSON.stringify(updatedInvList));

      localStorage.setItem(`invoice_status_${newInv.id}`, invoiceStatus);
      localStorage.setItem(`invoice_method_${newInv.id}`, newInv.paymentMethod);
      if (invoiceStatus === 'غير مدفوعة' && dueDateInput) {
        localStorage.setItem(`invoice_duedate_${newInv.id}`, dueDateInput);
      }
      localStorage.setItem(`invoice_items_${newInv.id}`, JSON.stringify(newInv.items));

      setCartItems([]); 
      setDueDateInput('');
      setPrintingInvoice(newInv);
      setActiveTab('invoicesList');
    } catch (err) { 
      alert('Failed'); 
    } finally { 
      setIsSubmittingSale(false); 
    }
  };

  const handleSavePosInvoice = () => {
    if (!cartItems.length) return;
    setIsSubmittingSale(true);
    try {
      const sub = cartItems.reduce((s, it) => s + it.subtotal, 0);
      const tax = sub * 0.15;
      const tot = sub + tax;

      const newInv = {
        id: Date.now(),
        invoiceNo: Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
        customer: customers.find(c => c.id === Number(posSelectedCustomerId)) || null,
        items: cartItems.map(it => ({ product: { name: it.name }, quantity: it.quantity, unitPrice: it.unitPrice, subtotal: it.subtotal })),
        subtotal: sub.toFixed(2),
        taxAmount: tax.toFixed(2),
        totalAmount: tot.toFixed(2),
        paymentStatus: 'مدفوعة',
        paymentMethod: posPaymentMethod,
        dueDate: ''
      };

      const updatedInvList = [newInv, ...invoices];
      setInvoices(updatedInvList);
      localStorage.setItem('mihwar_invoices', JSON.stringify(updatedInvList));

      localStorage.setItem(`invoice_status_${newInv.id}`, 'مدفوعة');
      localStorage.setItem(`invoice_method_${newInv.id}`, posPaymentMethod);
      localStorage.setItem(`invoice_items_${newInv.id}`, JSON.stringify(newInv.items));

      setCartItems([]); 
      setShowPosPayModal(false);
      setPrintingInvoice(newInv);
      setActiveTab('invoicesList');
    } catch (err) { 
      alert('Failed'); 
    } finally { 
      setIsSubmittingSale(false); 
    }
  };

  const handleSavePurchase = async () => {
    if (!selectedPurchaseProdId || !purchaseQty || !purchaseCost) {
      alert('يرجى تحديد المنتج والكمية وسعر التكلفة');
      return;
    }

    const qty = Number(purchaseQty);
    const cost = Number(purchaseCost);
    const prodId = Number(selectedPurchaseProdId);
    const targetProd = inventory.find(p => p.id === prodId);

    const updatedInventory = inventory.map(item => {
      if (item.id === prodId) {
        return { ...item, stock: Number(item.stock || 0) + qty };
      }
      return item;
    });

    setInventory(updatedInventory);
    localStorage.setItem('mihwar_inventory', JSON.stringify(updatedInventory));

    const newPurchaseInvoice = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      supplier: suppliers.find(s => s.id === Number(selectedSupplierId)) || null,
      productId: prodId,
      productName: targetProd ? targetProd.name : '',
      quantity: qty,
      unitCost: cost,
      totalAmount: Number((qty * cost).toFixed(2))
    };

    const updatedPurchases = [newPurchaseInvoice, ...purchaseInvoices];
    setPurchaseInvoices(updatedPurchases);
    localStorage.setItem('mihwar_purchases', JSON.stringify(updatedPurchases));

    try {
      await API.post('/api/purchases', {
        productId: prodId,
        quantity: qty,
        unitCost: cost,
        supplierId: selectedSupplierId ? Number(selectedSupplierId) : null
      });
    } catch (e) {}

    setSelectedPurchaseProdId('');
    setPurchaseCost('');
    alert('✅ تم اعتماد التوريد وزيادة المخزون بنجاح!');
    setActiveTab('inventory');
  };

  const cartSubtotal = cartItems.reduce((sum, it) => sum + it.subtotal, 0);
  const cartTax = cartSubtotal * 0.15;
  const cartGrandTotal = cartSubtotal + cartTax;

  const inventoryVal = inventory.reduce((sum, i) => sum + (Number(i.price) * i.stock), 0);
  const totalSalesVal = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const totalPurchasesVal = purchaseInvoices.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const netProfitVal = totalSalesVal - totalPurchasesVal;
  
  const lowStockItems = inventory.filter(i => i.stock <= lowStockThreshold);
  const totalPayroll = employees.reduce((sum, e) => sum + Number(e.salary || 0), 0);

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
    const yearInvoices = invoices.filter(inv => new Date(inv.createdAt).getFullYear() === targetYear);
    const totalSales = yearInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
    const totalProfit = yearInvoices.reduce((sum, inv) => {
      const rev = Number(inv.subtotal || 0);
      const cogs = (inv.items || []).reduce((s, it) => s + ((it.product?.cost || 0) * it.quantity), 0);
      return sum + (rev - cogs);
    }, 0);
    const count = yearInvoices.length;
    return { year: targetYear, totalSales, totalProfit, count };
  }).filter(y => y.count > 0 || y.year === currentYear);

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!custName.trim()) return;
    const newCust = { id: Date.now(), name: custName.trim(), nationalId: custNationalId.trim(), phone: custPhone.trim() };
    const updated = [newCust, ...customers];
    setCustomers(updated);
    localStorage.setItem('mihwar_customers', JSON.stringify(updated));
    setCustName(''); setCustNationalId(''); setCustPhone('');
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!suppName.trim()) return;
    const newSupp = { id: Date.now(), name: suppName.trim(), taxNumber: suppTaxNumber.trim(), phone: suppPhone.trim() };
    const updated = [newSupp, ...suppliers];
    setSuppliers(updated);
    localStorage.setItem('mihwar_suppliers', JSON.stringify(updated));
    setSuppName(''); setSuppTaxNumber(''); setSuppPhone('');
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const newProd = { id: Date.now(), name: newProdName, price: Number(newProdPrice), stock: Number(newProdStock || 0) };
    const updated = [newProd, ...inventory];
    setInventory(updated);
    localStorage.setItem('mihwar_inventory', JSON.stringify(updated));
    setNewProdName(''); setNewProdPrice(''); setNewProdStock('');
  };

  const handleSaveCompanyLogo = (e) => {
    e.preventDefault();
    setCompanyLogo(tempLogoInput);
    localStorage.setItem('mihwar_company_logo', tempLogoInput);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) return;
    try {
      await API.post('/api/change-password', { currentPassword: currentPass, newPassword: newPass });
      setCurrentPass(''); setNewPass('');
    } catch (e) { alert('Failed'); }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (loginRole === 'admin' && adminSecretKey !== 'MihwarAdmin2026!') {
      alert('❌ خطأ أمني: كلمة المرور الإدارية السرية غير صحيحة!');
      return;
    }
    try {
      const res = await API.post('/api/login', { email: authEmail, password: authPassword });
      const loggedUser = { ...res.data.user, role: loginRole };
      setUser(loggedUser); localStorage.setItem('mihwar_user', JSON.stringify(loggedUser));
      if (res.data.token) { localStorage.setItem('mihwar_token', res.data.token); API.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`; }
    } catch (err) { alert(err.response?.data?.error || 'Auth error'); }
  };

  const handleLogout = () => {
    setUser(null); localStorage.clear(); delete API.defaults.headers.common['Authorization']; setShowLanding(true); setAuthView('login');
  };

  const handleExportSales = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_المبيعات_الضريبية' : 'Tax_Sales_Report';
    const headers = isAr ? ['رقم الفاتورة', 'العميل المستلم', 'حالة الدفع', 'مدة الاستحقاق', 'تاريخ الإصدار', 'المبلغ الخاضع للضريبة (ر.س)', 'ضريبة القيمة المضافة 15% (ر.س)', 'الإجمالي المستحق (ر.س)'] : ['Invoice Number', 'Client / Buyer', 'Payment Status', 'Due Date', 'Issue Date', 'Taxable Amount (SAR)', 'VAT 15% (SAR)', 'Total Amount Due (SAR)'];
    const rows = filteredReports.map(inv => [inv.invoiceNo, inv.customer?.name || (isAr ? 'عميل نقدي عام' : 'General Cash Customer'), inv.paymentStatus || 'مدفوعة', inv.dueDate || '-', new Date(inv.createdAt).toISOString().slice(0, 10), Number(inv.subtotal || 0).toFixed(2), Number(inv.taxAmount || 0).toFixed(2), Number(inv.totalAmount || 0).toFixed(2)]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportInventory = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_جرد_المستودع_الحي' : 'Live_Inventory_Audit_Report';
    const headers = isAr ? ['اسم المنتج', 'الرصيد الفعلي', 'سعر البيع'] : ['Product Name', 'Available Stock', 'Sale Price'];
    const rows = filteredInventory.map(i => [i.name, i.stock, Number(i.price).toFixed(2)]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportCustomers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_العملاء' : 'Clients_Directory';
    const headers = isAr ? ['الاسم', 'الهوية', 'الهاتف'] : ['Name', 'ID', 'Phone'];
    const rows = filteredCustomers.map(c => [c.name, c.nationalId || '-', c.phone || '-']);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportSuppliers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_الموردين' : 'Suppliers_Directory';
    const headers = isAr ? ['اسم المورد', 'الرقم الضريبي', 'الهاتف'] : ['Supplier Name', 'Tax No', 'Phone'];
    const rows = filteredSuppliers.map(s => [s.name, s.taxNumber || '-', s.phone || '-']);
    exportToExcel(title, headers, rows, lang);
  };

  if (!user && showLanding) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, Tahoma, sans-serif', background: '#141824', minHeight: '100vh', color: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <header style={{ background: '#1b2230', borderBottom: '1px solid #263147', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#d97706', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '14px' }}>مح</div>
            <span style={{ fontWeight: '900', color: '#f8fafc', fontSize: '18px' }}>نظام محور</span>
          </div>
          <button onClick={() => setShowLanding(false)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {t.enterAppBtn}
          </button>
        </header>
        <main style={{ padding: '80px 20px', maxWidth: '1100px', margin: 'auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '44px', fontWeight: '900', margin: '0 0 20px 0', color: '#f8fafc' }}>{t.landingTitle}</h1>
          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 40px auto', lineHeight: '1.7' }}>{t.landingDesc}</p>
          <button onClick={() => { setShowLanding(false); setAuthView('login'); }} style={{ background: '#d97706', color: '#fff', padding: '14px 30px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            تسجيل الدخول 🔑
          </button>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, Tahoma, sans-serif', background: '#141824', minHeight: '100vh', color: '#f8fafc' }}>
        <div style={{ display: 'flex', flex: 1, width: '100%', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#1b2230', padding: '30px', borderRadius: '16px', border: '1px solid #263147' }}>
            <h1 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: '900', margin: '0 0 20px 0' }}>تسجيل الدخول</h1>
            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ background: '#141824', padding: '10px', borderRadius: '8px', border: '1px solid #263147' }}>
                <label style={{ fontSize: '11px', color: '#d97706', display: 'block', marginBottom: '4px' }}>{t.roleLabel}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" onClick={() => setLoginRole('admin')} style={{ flex: 1, padding: '6px', background: loginRole==='admin'?'#d97706':'transparent', color: '#fff', border: '1px solid #263147', borderRadius: '6px', fontSize: '12px' }}>مدير النظام</button>
                  <button type="button" onClick={() => setLoginRole('cashier')} style={{ flex: 1, padding: '6px', background: loginRole==='cashier'?'#d97706':'transparent', color: '#fff', border: '1px solid #263147', borderRadius: '6px', fontSize: '12px' }}>كاشير</button>
                </div>
              </div>
              <input type="email" placeholder="البريد الإلكتروني" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none' }} />
              <input type="password" placeholder="كلمة المرور" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none' }} />
              {loginRole === 'admin' && (
                <input type="password" placeholder={t.adminSecretLabel} value={adminSecretKey} onChange={e=>setAdminSecretKey(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ef4444', background: '#141824', color: '#fff', outline: 'none' }} />
              )}
              <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>دخول النظام</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const allTabs = [
    { id: 'dashboard', label: t.dashboard, adminOnly: true, icon: '📊' },
    { id: 'pos', label: t.pos, adminOnly: false, icon: '🛒' },
    { id: 'sales', label: t.sales, adminOnly: true, icon: '🧾' },
    { id: 'invoicesList', label: t.invoicesList, adminOnly: true, icon: '📑' },
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
    ? allTabs.filter(tab => !tab.adminOnly || tab.id === 'pos' || tab.id === 'sales' || tab.id === 'invoicesList' || tab.id === 'settings') 
    : allTabs;

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, Tahoma, sans-serif', background: theme.bgMain, minHeight: '100vh', color: theme.textDark, display: 'flex' }}>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #zatca-printable-invoice, #zatca-printable-invoice * { visibility: visible !important; }
          #zatca-printable-invoice { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 15mm !important; background: #fff !important; color: #000 !important; box-sizing: border-box !important; }
          .no-print-zone { display: none !important; }
          @page { size: A4 portrait; margin: 0mm; }
        }
      `}</style>

      {/* Sidebar */}
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
                  key={tab.id} onClick={() => setActiveTab(tab.id)} 
                  style={{ background: isActive ? '#d97706' : 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '12px 16px', borderRadius: '10px', fontWeight: isActive ? 'bold' : 'normal', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'right', width: '100%', transition: '0.2s' }}>
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
            <span style={{ fontSize: '15px', fontWeight: '800', color: theme.textDark }}>{availableTabs.find(t => t.id === activeTab)?.icon} {availableTabs.find(t => t.id === activeTab)?.label}</span>
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
          
          {/* TAB 1: Dashboard */}
          {activeTab === 'dashboard' && user.role !== 'cashier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div><h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.welcome} {user.name} 👋</h2><p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>مرحباً بك في لوحة التحكم المركزية لنظام محور.</p></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.invValue}</p><h2 style={{ color: '#d97706', margin: '8px 0 0 0', fontSize: '22px' }}>{inventoryVal.toLocaleString()} {t.currency}</h2></div>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.salesTotal}</p><h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '22px' }}>{totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.purchasesTotal}</p><h2 style={{ color: '#f59e0b', margin: '8px 0 0 0', fontSize: '22px' }}>{totalPurchasesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.netProfit}</p><h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '22px' }}>{netProfitVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
              </div>
              <div style={{ background: lowStockItems.length > 0 ? '#7f1d1d22' : theme.cardBg, borderRadius: '16px', border: `1px solid ${lowStockItems.length > 0 ? '#7f1d1d' : theme.border}`, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: lowStockItems.length > 0 ? '#fca5a5' : theme.textDark }}>
                    {lowStockItems.length > 0 ? `⚠️ تنبيه: يوجد ${lowStockItems.length} صنف وصل للحد الأدنى للمخزون (${lowStockThreshold} قطع أو أقل)` : t.lowStockClean}
                  </h3>
                  {lowStockItems.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {lowStockItems.map(item => (<span key={item.id} style={{ background: '#7f1d1d', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{item.name} (المتبقي: {item.stock})</span>))}
                    </div>
                  )}
                </div>
                <div style={{ background: theme.bgMain, padding: '12px 18px', borderRadius: '10px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>تحديد الحد الأدنى:</span>
                  <input type="number" value={lowStockThreshold} onChange={e => { const val = Number(e.target.value); setLowStockThreshold(val); localStorage.setItem('mihwar_low_stock_threshold', val); }} style={{ width: '65px', padding: '6px', borderRadius: '6px', border: '1px solid #d97706', background: theme.cardBg, color: theme.textDark, textAlign: 'center', fontWeight: 'bold', fontSize: '14px', outline: 'none' }} />
                  <span style={{ fontSize: '12px', color: theme.textMuted }}>قطعة</span>
                </div>
              </div>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📅 تحليل أداء مبيعات السنة الحالية ({currentYear})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px', minWidth: '500px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>الشهر</th><th style={{ padding: '10px' }}>عدد الفواتير</th><th style={{ padding: '10px' }}>إجمالي المبيعات (ر.س)</th><th style={{ padding: '10px' }}>نسبة الأداء</th></tr></thead>
                  <tbody>
                    {monthlyData.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{m.monthName}</td>
                        <td style={{ padding: '10px' }}>{m.count} فاتورة</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#10b981' }}>{m.total.toFixed(2)} {t.currency}</td>
                        <td style={{ padding: '10px' }}><div style={{ width: '100%', maxWidth: '150px', height: '6px', background: theme.bgMain, borderRadius: '3px', overflow: 'hidden', border: `1px solid ${theme.border}` }}><div style={{ width: `${Math.min(100, (m.total / (totalSalesVal || 1)) * 100)}%`, height: '100%', background: '#d97706' }}></div></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📊 سجل النمو المالي للسنوات الماضية (حتى 10 سنوات)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px', minWidth: '500px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>السنة المالية</th><th style={{ padding: '10px' }}>عدد الفواتير</th><th style={{ padding: '10px' }}>إجمالي المبيعات</th><th style={{ padding: '10px' }}>صافي الربح التقديري</th></tr></thead>
                  <tbody>
                    {pastYearsData.map((y, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#d97706' }}>{y.year}</td>
                        <td style={{ padding: '10px' }}>{y.count} فاتورة</td>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{y.totalSales.toFixed(2)} {t.currency}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#10b981' }}>+{y.totalProfit.toFixed(2)} {t.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: POS */}
          {activeTab === 'pos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>🛒 نقطة البيع السريعة</h3>
                <div style={{ marginBottom: '15px', background: theme.bgMain, padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>🔍 البحث واختيار العميل للفاتورة:</label>
                  <input type="text" value={posCustomerSearch} onChange={e => setPosCustomerSearch(e.target.value)} placeholder="ابحث باسم المنشأة، السجل التجاري، الرقم الضريبي..." style={{ width: '100%', padding: '8px', borderRadius: '6px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', marginBottom: '6px', boxSizing: 'border-box', fontSize: '12px' }} />
                  <select value={posSelectedCustomerId} onChange={e => setPosSelectedCustomerId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '12px' }}>
                    <option value="">-- عميل نقدي عام (افتراضي) --</option>
                    {filteredCustomersForPos.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.nationalId || c.phone || 'نقدي'})</option>))}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                  {inventory.map(prod => {
                    const cartItem = cartItems.find(it => it.productId === prod.id);
                    const qty = cartItem ? cartItem.quantity : 0;
                    const updateQty = (newQ) => {
                      if (isNaN(newQ) || newQ < 0) newQ = 0;
                      if (newQ > prod.stock) newQ = prod.stock;
                      if (newQ === 0) setCartItems(cartItems.filter(i => i.productId !== prod.id));
                      else if (cartItem) setCartItems(cartItems.map(i => i.productId === prod.id ? { ...i, quantity: newQ, subtotal: Number((newQ * prod.price).toFixed(2)) } : i));
                      else setCartItems([...cartItems, { productId: prod.id, name: prod.name, quantity: newQ, unitPrice: prod.price, subtotal: Number((newQ * prod.price).toFixed(2)) }]);
                    };
                    return (
                      <div key={prod.id} style={{ background: theme.bgMain, border: `1px solid ${qty > 0 ? '#d97706' : theme.border}`, borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                        <div><h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>{prod.name}</h4><span style={{ color: '#d97706', fontWeight: 'bold', fontSize: '12px' }}>{prod.price} {t.currency}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.cardBg, borderRadius: '6px', padding: '2px', border: `1px solid ${theme.border}` }}>
                          <button onClick={() => updateQty(qty - 1)} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                          <input type="number" min="0" max={prod.stock} value={qty} onChange={(e) => updateQty(Number(e.target.value))} style={{ width: '45px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '13px', color: theme.textDark, outline: 'none' }} />
                          <button onClick={() => updateQty(qty + 1)} style={{ background: '#d97706', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
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
                        <span>{item.name} ({item.quantity})</span><strong style={{ color: '#38bdf8' }}>{item.subtotal} {t.currency}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ borderTop: '1px dashed #334155', paddingTop: '10px', margin: '15px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}><span>الإجمالي المستحق:</span><span style={{ color: '#38bdf8' }}>{cartGrandTotal.toFixed(2)} {t.currency}</span></div>
                  </div>
                  <button onClick={() => setShowPosPayModal(true)} disabled={!cartItems.length} style={{ width: '100%', background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إتمام الدفع وإصدار الفاتورة 💳</button>
                </div>
              </div>
            </div>
          )}

          {/* نافذة اختيار طريقة الدفع في نقطة البيع السريعة */}
          {showPosPayModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3100, padding: '15px' }}>
              <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '420px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#10b981' }}>اختيار طريقة الدفع السريع</h3>
                  <button onClick={() => setShowPosPayModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>طريقة الدفع (نقداً أو شبكة):</label>
                    <select value={posPaymentMethod} onChange={e => setPosPaymentMethod(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                      <option value="نقد">نقداً</option>
                      <option value="شبكة">شبكة</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="button" onClick={handleSavePosInvoice} disabled={isSubmittingSale} style={{ flex: 1, background: '#10b981', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد وإصدار الفاتورة 🚀</button>
                    <button type="button" onClick={() => setShowPosPayModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Sales */}
          {activeTab === 'sales' && user.role !== 'cashier' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '20px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#d97706' }}>⚡ إصدار فاتورة بيع جديدة</h2>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>🔍 بحث واختيار العميل:</label>
                  <input type="text" value={salesCustomerSearch} onChange={e => setSalesCustomerSearch(e.target.value)} placeholder="اكتب اسم المنشأة أو العميل للبحث السريع..." style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', marginBottom: '8px', boxSizing: 'border-box', fontSize: '13px' }} />
                  <select value={selectedCustomerId} onChange={e=>setSelectedCustomerId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                    <option value="">-- عميل نقدي عام (افتراضي) --</option>
                    {filteredCustomersForSales.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '15px', alignItems: 'end' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>اختيار المنتج</label>
                    <select value={selectedProductId} onChange={e => { setSelectedProductId(e.target.value); const p = inventory.find(x => x.id === Number(e.target.value)); if (p) setItemPrice(p.price); }} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                      <option value="">-- اختر المنتج --</option>
                      {inventory.map(p=><option key={p.id} value={p.id}>{p.name} (متوفر: {p.stock})</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>السعر (ر.س)</label>
                    <input type="number" value={itemPrice} onChange={e=>setItemPrice(e.target.value)} placeholder="السعر" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>الكمية</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: theme.bgMain, borderRadius: '8px', border: `1px solid ${theme.border}`, padding: '3px' }}>
                      <button type="button" onClick={() => setItemQty(Math.max(1, itemQty - 1))} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                      <input type="number" min="1" value={itemQty} onChange={e=>setItemQty(Math.max(1, Number(e.target.value)))} style={{ width: '35px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold', color: theme.textDark, outline: 'none', fontSize: '13px' }} />
                      <button type="button" onClick={() => setItemQty(itemQty + 1)} style={{ background: '#d97706', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                    </div>
                  </div>
                  <button onClick={handleAddItemToSalesCart} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '11px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>➕ إضافة</button>
                </div>
                <div style={{ marginBottom: '20px', background: theme.bgMain, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>حالة الدفع:</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}><input type="radio" name="payStatus" checked={invoiceStatus === 'مدفوعة'} onChange={() => setInvoiceStatus('مدفوعة')} /> مدفوعة</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}><input type="radio" name="payStatus" checked={invoiceStatus === 'غير مدفوعة'} onChange={() => setInvoiceStatus('غير مدفوعة')} /> غير مدفوعة (أجل)</label>
                  {invoiceStatus === 'غير مدفوعة' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f43f5e' }}>مدة الاستحقاق:</span>
                      <input type="text" value={dueDateInput} onChange={e => setDueDateInput(e.target.value)} placeholder="مثال: 2026/10/01" style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #f43f5e', background: theme.cardBg, color: theme.textDark, fontSize: '12px', outline: 'none' }} />
                    </div>
                  )}
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>🛒 محتويات الفاتورة الحالية</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '8px' }}>المنتج</th><th style={{ padding: '8px' }}>الكمية</th><th style={{ padding: '8px' }}>السعر</th><th style={{ padding: '8px' }}>المجموع</th><th></th></tr></thead>
                  <tbody>
                    {cartItems.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '8px' }}>{it.name}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{it.quantity}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>{it.unitPrice} {t.currency}</td>
                        <td style={{ padding: '8px', color: '#10b981', fontWeight: 'bold' }}>{it.subtotal} {t.currency}</td>
                        <td style={{ padding: '8px' }}><button onClick={() => handleRemoveSalesCartItem(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✖</button></td>
                      </tr>
                    ))}
                    {!cartItems.length && (<tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>لم يتم إضافة أي صنف للفاتورة بعد.</td></tr>)}
                  </tbody>
                </table>
                <button onClick={handleSaveSalesInvoice} disabled={!cartItems.length || isSubmittingSale} style={{ width: '100%', background: '#10b981', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>إتمام الدفع وإصدار الفاتورة 💳</button>
              </div>
              <div style={{ background: '#020617', borderRadius: '16px', color: '#fff', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#38bdf8' }}>ملخص الحسبة التلقائية</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>المبلغ الخاضع للضريبة:</span><strong>{cartSubtotal.toFixed(2)} {t.currency}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>ضريبة القيمة المضافة (15%):</span><strong>{cartTax.toFixed(2)} {t.currency}</strong></div>
                  </div>
                </div>
                <div style={{ borderTop: '1px dashed #334155', paddingTop: '15px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}><span>الإجمالي النهائي:</span><span style={{ color: '#38bdf8' }}>{cartGrandTotal.toFixed(2)} {t.currency}</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Invoices List */}
          {activeTab === 'invoicesList' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>{t.invRepo}</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="text" value={invoiceSearchQuery} onChange={e => setInvoiceSearchQuery(e.target.value)} placeholder="🔍 ابحث برقم الفاتورة أو العميل..." style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '13px', width: '240px' }} />
                  <button onClick={handleExportSales} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير إلى Excel 📥</button>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '12px' }}>رقم الفاتورة</th><th style={{ padding: '12px' }}>العميل</th><th style={{ padding: '12px' }}>المبلغ الإجمالي</th><th style={{ padding: '12px' }}>حالة الدفع</th><th style={{ padding: '12px' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => {
                    const isUnpaid = inv.paymentStatus === 'غير مدفوعة';
                    return (
                      <tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>#{inv.invoiceNo}</td>
                        <td style={{ padding: '12px' }}>{inv.customer?.name || 'عميل نقدي'}</td>
                        <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>{inv.totalAmount} {t.currency}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: isUnpaid ? '#7f1d1d' : '#065f46', color: isUnpaid ? '#fca5a5' : '#6ee7b7', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px' }}>{inv.paymentStatus || 'مدفوعة'}</span>
                          {isUnpaid && inv.dueDate && <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>الاستحقاق: {inv.dueDate}</div>}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button onClick={() => setPrintingInvoice(inv)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>معاينة وطباعة 👁️</button>
                            {isUnpaid && (<button onClick={() => handleOpenPayConfirm(inv.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>تم الدفع ✓</button>)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: Purchases */}
          {activeTab === 'purchases' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', maxWidth: '600px', margin: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>تسجيل فاتورة شراء وتوريد بضاعة</h2>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>المورد</label>
                <select value={selectedSupplierId} onChange={e=>setSelectedSupplierId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">توريد نقدي مباشر</option>
                  {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>🔍 بحث واختيار المنتج:</label>
                <input type="text" value={purchaseProductSearch} onChange={e => setPurchaseProductSearch(e.target.value)} placeholder="ابحث عن اسم المنتج للفلترة..." style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', marginBottom: '8px', boxSizing: 'border-box', fontSize: '13px' }} />
                <select value={selectedPurchaseProdId} onChange={e=>setSelectedPurchaseProdId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">-- اختر المنتج المستهدف --</option>
                  {filteredProductsForPurchase.map(p=><option key={p.id} value={p.id}>{p.name} (المتوفر الحالي: {p.stock})</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>الكمية الموردة</label>
                <input type="number" placeholder="الكمية" value={purchaseQty} onChange={e=>setPurchaseQty(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>سعر التكلفة للوحدة (ر.س)</label>
                <input type="number" placeholder="سعر التكلفة" value={purchaseCost} onChange={e=>setPurchaseCost(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <button onClick={handleSavePurchase} style={{ width: '100%', background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>اعتماد التوريد وزيادة المخزون 📦</button>
            </div>
          )}

          {/* TAB 6: Customers */}
          {activeTab === 'customers' && user.role !== 'cashier' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>فتح حساب عميل جديد</h3>
                <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="اسم العميل / المؤسسة *" value={custName} onChange={e=>setCustName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <input type="text" placeholder="رقم الهوية / السجل التجاري" value={custNationalId} onChange={e=>setCustNationalId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <input type="text" placeholder="رقم الهاتف" value={custPhone} onChange={e=>setCustPhone(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>حفظ العميل</button>
                </form>
              </div>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px' }}>دليل العملاء</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" value={customerSearchQuery} onChange={e => setCustomerSearchQuery(e.target.value)} placeholder="🔍 ابحث بالاسم، الهوية أو الهاتف..." style={{ padding: '6px 10px', borderRadius: '6px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '12px', width: '200px' }} />
                    <button onClick={handleExportCustomers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>تصدير Excel</button>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>الاسم</th><th style={{ padding: '10px' }}>الهوية / السجل</th><th style={{ padding: '10px' }}>الهاتف</th><th style={{ padding: '10px' }}>الإجراءات</th></tr></thead>
                  <tbody>
                    {filteredCustomers.map(c => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.name}</td>
                        <td style={{ padding: '10px' }}>{c.nationalId || '-'}</td>
                        <td style={{ padding: '10px' }}>{c.phone || '-'}</td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleOpenEditCustomer(c)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>تعديل ✏️</button>
                            <button onClick={() => handleDeleteCustomer(c.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>حذف 🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: Suppliers */}
          {activeTab === 'suppliers' && user.role !== 'cashier' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>فتح حساب مورد جديد</h3>
                <form onSubmit={handleAddSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="text" placeholder="اسم المورد / الشركة *" value={suppName} onChange={e=>setSuppName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <input type="text" placeholder="الرقم الضريبي" value={suppTaxNumber} onChange={e=>setSuppTaxNumber(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <input type="text" placeholder="رقم الهاتف" value={suppPhone} onChange={e=>setSuppPhone(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>حفظ المورد</button>
                </form>
              </div>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px' }}>دليل الموردين</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" value={supplierSearchQuery} onChange={e => setSupplierSearchQuery(e.target.value)} placeholder="🔍 ابحث بالاسم، الرقم الضريبي..." style={{ padding: '6px 10px', borderRadius: '6px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '12px', width: '200px' }} />
                    <button onClick={handleExportSuppliers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>تصدير Excel</button>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>اسم المورد</th><th style={{ padding: '10px' }}>الرقم الضريبي</th><th style={{ padding: '10px' }}>الهاتف</th><th style={{ padding: '10px' }}>الإجراءات</th></tr></thead>
                  <tbody>
                    {filteredSuppliers.map(s => (
                      <tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{s.name}</td>
                        <td style={{ padding: '10px' }}>{s.taxNumber || '-'}</td>
                        <td style={{ padding: '10px' }}>{s.phone || '-'}</td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleOpenEditSupplier(s)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>تعديل ✏️</button>
                            <button onClick={() => handleDeleteSupplier(s.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>حذف 🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: Inventory */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px' }}>{t.stockRepo}</h3>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input type="text" value={inventorySearchQuery} onChange={e => setInventorySearchQuery(e.target.value)} placeholder="🔍 ابحث باسم المنتج..." style={{ padding: '6px 10px', borderRadius: '6px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '12px', width: '200px' }} />
                    <button onClick={handleExportInventory} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>تصدير Excel</button>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Price</th><th style={{ padding: '10px' }}>Stock</th><th style={{ padding: '10px' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map(i => (
                      <tr key={i.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '10px' }}>{i.name}</td>
                        <td style={{ padding: '10px' }}>{i.price}</td>
                        <td style={{ padding: '10px', color: '#10b981', fontWeight: 'bold' }}>{i.stock}</td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleOpenEditProduct(i)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>تعديل ✏️</button>
                            <button onClick={() => handleDeleteProduct(i.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>حذف 🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 9: Production */}
          {activeTab === 'production' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '30px', textAlign: 'center' }}>
              <h2>🏭 إدارة الإنتاج وأوامر التصنيع (BOM)</h2>
              <p style={{ color: theme.textMuted }}>النظام جاهز لربط وصفات التصنيع ومتابعة خطوط الإنتاج بدقة عالية.</p>
              <button style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>أمر إنتاج +</button>
            </div>
          )}

          {/* TAB 10: HR */}
          {activeTab === 'hr' && user.role !== 'cashier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.hrTitle}</h2>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.hrSub}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { setEditingEmpId(null); setEmpName(''); setEmpIdNumber(''); setEmpNumber(''); setEmpRole(''); setEmpDept(''); setEmpPhone(''); setEmpSalary(''); setEmpVacations(''); setEmpInsurance(''); setEmpIqamaEnd(''); setEmpHealthEnd(''); setEmpContractEnd(''); setShowAddEmpModal(true); }} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                    {t.addEmpBtn}
                  </button>
                  <button onClick={() => setShowDeductModal(true)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                    {t.addDeductBtn}
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي الموظفين</p><h2 style={{ color: '#38bdf8', margin: '8px 0 0 0', fontSize: '24px' }}>{employees.length} موظف</h2></div>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي الرواتب الأساسية</p><h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '24px' }}>{totalPayroll.toLocaleString()} {t.currency}</h2></div>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📋 سجل الموظفين، الرواتب، الأجازات والوثائق</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '950px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '12px' }}>الموظف</th><th style={{ padding: '12px' }}>رقم الإقامة / الهوية</th><th style={{ padding: '12px' }}>المسمى والقسم</th><th style={{ padding: '12px' }}>الهاتف</th><th style={{ padding: '12px' }}>الراتب والخصومات</th><th style={{ padding: '12px' }}>التأمين والأجازات</th><th style={{ padding: '12px' }}>انتهاء الوثائق</th><th style={{ padding: '12px' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name} <span style={{ fontSize: '11px', color: theme.textMuted }}>(#{emp.empNo})</span></td>
                        <td style={{ padding: '12px' }}>{emp.idNumber}</td>
                        <td style={{ padding: '12px' }}>{emp.role} <br/><span style={{ color: '#2dd4bf', fontSize: '11px' }}>{emp.dept}</span></td>
                        <td style={{ padding: '12px' }}>{emp.phone}</td>
                        <td style={{ padding: '12px' }}><span style={{ color: '#10b981', fontWeight: 'bold' }}>{emp.salary} {t.currency}</span><br/><span style={{ color: '#ef4444', fontSize: '11px' }}>خصم: {emp.deductions} {t.currency}</span></td>
                        <td style={{ padding: '12px' }}><span>{emp.insurance}</span><br/><span style={{ color: '#38bdf8', fontSize: '11px' }}>أجازات: {emp.vacations} يوم</span></td>
                        <td style={{ padding: '12px', fontSize: '11px' }}>إقامة: {emp.iqamaEnd} <br/>صحي: {emp.healthEnd} <br/>عقد: {emp.contractEnd}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleOpenEditEmp(emp)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تعديل ✏️</button>
                            <button onClick={() => handleDeleteEmployee(emp.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>حذف 🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* سجل الخصومات التفصيلي مع زر الإعفاء */}
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px', color: '#fca5a5' }}>🔻 سجل الخصومات التفصيلي (السبب، القيمة، والتاريخ التلقائي)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '10px' }}>اسم الموظف</th><th style={{ padding: '10px' }}>قيمة الخصم</th><th style={{ padding: '10px' }}>سبب الخصم</th><th style={{ padding: '10px' }}>تاريخ التسجيل (تلقائي)</th><th style={{ padding: '10px' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deductionsList.map(d => (
                      <tr key={d.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{d.empName}</td>
                        <td style={{ padding: '10px', color: '#ef4444', fontWeight: 'bold' }}>{d.amount} {t.currency}</td>
                        <td style={{ padding: '10px' }}>{d.reason}</td>
                        <td style={{ padding: '10px', color: theme.textMuted }}>{d.date}</td>
                        <td style={{ padding: '10px' }}>
                          <button onClick={() => handleRemoveDeduction(d.id, d.empName, d.amount)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>إعفاء الخصم ↩️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 11: Reports */}
          {activeTab === 'reports' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>{t.invRepo}</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="text" value={reportSearchQuery} onChange={e => setReportSearchQuery(e.target.value)} placeholder="🔍 ابحث برقم الفاتورة أو اسم العميل..." style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '13px', width: '240px' }} />
                  <button onClick={handleExportSales} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير المبيعات</button>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '10px' }}>No</th><th style={{ padding: '10px' }}>Client</th><th style={{ padding: '10px' }}>Total</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                      <td style={{ padding: '10px' }}>#{inv.invoiceNo}</td>
                      <td style={{ padding: '10px' }}>{inv.customer?.name||'Cash'}</td>
                      <td style={{ padding: '10px' }}>{inv.totalAmount}</td>
                      <td><button onClick={()=>setPrintingInvoice(inv)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 12: Settings */}
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
                  <button onClick={()=>setIsDark(true)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: isDark?'#d97706':'transparent', color: '#fff', border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🌙 الداكن</button>
                </div>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '22px' }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '17px' }}>{t.companyLogoTitle}</h3>
                <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 12px 0' }}>{t.companyLogoDesc}</p>
                <form onSubmit={handleSaveCompanyLogo} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" placeholder="https://example.com/logo.png" value={tempLogoInput} onChange={e=>setTempLogoInput(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  {tempLogoInput && <img src={tempLogoInput} alt="Logo Preview" style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#fff', borderRadius: '6px', padding: '4px' }} />}
                  <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '10px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveLogoBtn}</button>
                </form>
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

      {/* =======================
          ALL POPUPS & MODALS 
      ======================== */}

      {/* Edit Customer Modal */}
      {showEditCustModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '450px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>تعديل بيانات العميل</h3>
              <button onClick={() => setShowEditCustModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>
            <form onSubmit={handleUpdateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>اسم العميل</label><input type="text" value={editCustName} onChange={e=>setEditCustName(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>رقم الهوية أو السجل التجاري</label><input type="text" value={editCustNationalId} onChange={e=>setEditCustNationalId(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>رقم الهاتف</label><input type="text" value={editCustPhone} onChange={e=>setEditCustPhone(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>تحديث العميل</button>
                <button type="button" onClick={() => setShowEditCustModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditSuppModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '450px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>تعديل بيانات المورد</h3>
              <button onClick={() => setShowEditSuppModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>
            <form onSubmit={handleUpdateSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>اسم المورد / الشركة</label><input type="text" value={editSuppName} onChange={e=>setEditSuppName(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>الرقم الضريبي</label><input type="text" value={editSuppTaxNumber} onChange={e=>setEditSuppTaxNumber(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>رقم الهاتف</label><input type="text" value={editSuppPhone} onChange={e=>setEditSuppPhone(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>تحديث المورد</button>
                <button type="button" onClick={() => setShowEditSuppModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProdModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '450px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>تعديل بيانات المنتج</h3>
              <button onClick={() => setShowEditProdModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>
            <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.prodName}</label><input type="text" value={editProdName} onChange={e=>setEditProdName(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.prodPrice}</label><input type="number" value={editProdPrice} onChange={e=>setEditProdPrice(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.prodStock}</label><input type="number" value={editProdStock} onChange={e=>setEditProdStock(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.updateProd}</button>
                <button type="button" onClick={() => setShowEditProdModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Employee Modal */}
      {showAddEmpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0', fontSize: '18px', fontWeight: '900' }}>{editingEmpId ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}</h3>
              <button onClick={() => setShowAddEmpModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>
            <form onSubmit={handleSaveEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empName}</label><input type="text" value={empName} onChange={e=>setEmpName(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empNumber}</label><input type="text" value={empNumber} onChange={e=>setEmpNumber(e.target.value)} placeholder="مثال: 22" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empIdNumber}</label><input type="text" value={empIdNumber} onChange={e=>setEmpIdNumber(e.target.value)} placeholder="رقم الهوية أو الإقامة" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empPhone}</label><input type="text" value={empPhone} onChange={e=>setEmpPhone(e.target.value)} placeholder="05xxxxxxxx" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empRole}</label><input type="text" value={empRole} onChange={e=>setEmpRole(e.target.value)} placeholder="المسمى الوظيفي" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empDept}</label><input type="text" value={empDept} onChange={e=>setEmpDept(e.target.value)} placeholder="القسم" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empSalary}</label><input type="number" value={empSalary} onChange={e=>setEmpSalary(e.target.value)} required placeholder="4000" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empVacations}</label><input type="number" value={empVacations} onChange={e=>setEmpVacations(e.target.value)} placeholder="21" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{editingEmpId ? t.updateEmp : t.saveEmp}</button>
                <button type="button" onClick={() => setShowAddEmpModal(false)} style={{ flex: '1', background: '#334155', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deduction Modal */}
      {showDeductModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '520px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>تسجيل خصم مالي على موظف</h3>
              <button onClick={() => setShowDeductModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>
            <form onSubmit={handleSaveHrDeduction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>🔍 محرك البحث (بالهوية أو الاسم):</label>
                <input type="text" value={hrDeductSearchQuery} onChange={e => setHrDeductSearchQuery(e.target.value)} placeholder="اكتب اسم الموظف أو رقم الهوية..." style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', marginBottom: '8px', boxSizing: 'border-box' }} />
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>اختر الموظف:</label>
                <select value={hrSelectedEmployeeName} onChange={e=>setHrSelectedEmployeeName(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">-- اختر الموظف من القائمة --</option>
                  {filteredEmployeesForHrDeduct.map(e => (<option key={e.id} value={e.name}>{e.name} (هوية: {e.idNumber})</option>))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>قيمة الخصم (ر.س)</label>
                <input type="number" value={hrDeductAmount} onChange={e=>setHrDeductAmount(e.target.value)} required placeholder="100" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سبب الخصم</label>
                <input type="text" value={hrDeductReason} onChange={e=>setHrDeductReason(e.target.value)} placeholder="مثال: تأخير عن الدوام الرسمي" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ background: theme.bgMain, padding: '10px', borderRadius: '8px', fontSize: '12px', color: theme.textMuted }}>
                📅 تاريخ الخصم: <strong>{new Date().toISOString().slice(0, 10)}</strong>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveDeduct}</button>
                <button type="button" onClick={() => setShowDeductModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تأكيد طريقة السداد في سجل الفواتير */}
      {showPayConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3100, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '420px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#10b981' }}>تأكيد سداد الفاتورة</h3>
              <button onClick={() => setShowPayConfirmModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>اختر طريقة الدفع المعتمدة للسداد:</label>
                <select value={payConfirmMethod} onChange={e => setPayConfirmMethod(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="نقد">نقد</option>
                  <option value="شبكة">شبكة</option>
                  <option value="حوالة">حوالة بنكية</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={handleExecutePayment} style={{ flex: 1, background: '#10b981', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد السداد ✓</button>
                <button type="button" onClick={() => setShowPayConfirmModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      {printingInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '10px' }}>
          <div style={{ background: '#fff', color: '#0f172a', padding: '30px', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="no-print-zone" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ طباعة الفاتورة / PDF</button>
              </div>
              <button onClick={()=>setPrintingInvoice(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>{t.closeModal}</button>
            </div>

            <div id="zatca-printable-invoice" style={{ background: '#fff', color: '#000', padding: '20px', boxSizing: 'border-box', fontFamily: 'Cairo, Tahoma, sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                <div>
                  {companyLogo ? (<img src={companyLogo} alt="Logo" style={{ width: '70px', height: '70px', objectFit: 'contain', marginBottom: '8px' }} />) : null}
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{businessName}</h2>
                  <p style={{ margin: '3px 0', fontSize: '12px', color: '#64748b' }}>المملكة العربية السعودية - جدة</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#d97706' }}>{t.taxInvoiceTitle}</h3>
                  <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>رقم الفاتورة:</strong> INV-{printingInvoice.invoiceNo}</p>
                  <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>الحالة:</strong> <span style={{ color: printingInvoice.paymentStatus === 'غير مدفوعة' ? '#f43f5e' : '#10b981', fontWeight: 'bold' }}>{printingInvoice.paymentStatus || 'مدفوعة'}</span></p>
                  <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>طريقة الدفع:</strong> <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{printingInvoice.paymentMethod || 'نقد'}</span></p>
                  {printingInvoice.dueDate && (<p style={{ margin: '2px 0', fontSize: '12px', color: '#f43f5e' }}><strong>مدة الاستحقاق:</strong> {printingInvoice.dueDate}</p>)}
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#64748b' }}><strong>تاريخ الإصدار:</strong> {new Date(printingInvoice.createdAt).toLocaleDateString('en-CA')}</p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#0f172a' }}>بيانات العميل:</h4>
                <p style={{ margin: '3px 0' }}><strong>{t.clientCol}</strong> {printingInvoice.customer?.name || 'عميل نقدي عام'}</p>
                <p style={{ margin: '3px 0' }}><strong>{t.clientPhone}</strong> {printingInvoice.customer?.phone || '0556682463'}</p>
                <p style={{ margin: '3px 0' }}><strong>{t.clientEmail}</strong> {printingInvoice.customer?.email || 'customer@gmail.com'}</p>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    <th style={{ padding: '10px', textAlign: 'right' }}>{t.itemDesc}</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>{t.itemQuantity}</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>{t.unitPriceCol}</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>{t.totalCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {(printingInvoice.items || []).map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{it.product?.name || it.name || 'خدمة عامة'}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>{it.unitPrice} {t.currency}</td>
                      <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>{it.subtotal} {t.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #e2e8f0', paddingTop: '15px' }}>
                <img src={generateZatcaQR(printingInvoice, businessName)} alt="ZATCA QR" style={{ width: '100px', height: '100px' }} />
                <div style={{ textAlign: 'left', fontSize: '14px', minWidth: '220px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span style={{ color: '#64748b' }}>{t.subtotal}</span><strong>{printingInvoice.subtotal} {t.currency}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}><span style={{ color: '#64748b' }}>{t.vatAmount}</span><strong>{printingInvoice.taxAmount} {t.currency}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0 0 0', borderTop: '1px solid #cbd5e1', paddingTop: '8px', fontSize: '16px', color: '#d97706' }}><strong>{t.totalDue}</strong><strong>{printingInvoice.totalAmount} {t.currency}</strong></div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '11px', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>{t.invoiceFooterNote}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;