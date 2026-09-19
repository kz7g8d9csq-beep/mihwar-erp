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
    saveDeduct: 'تسجيل الخصم',
    closeModal: 'إغلاق',

    invValue: 'قيمة المخزون الإجمالية',
    salesTotal: 'إجمالي المبيعات (شامل الضريبة)',
    purchasesTotal: 'إجمالي المشتريات (شامل الضريبة)',
    netProfit: 'صافي الربح التقديري',
    lowStockClean: '✅ مستويات المخزون ممتازة، لا توجد أصناف قاربت على النفاد.',
    prodName: 'اسم المنتج',
    prodPrice: 'سعر البيع (ر.س)',
    prodStock: 'الكمية الأولية',
    saveProd: 'حفظ المنتج',
    stockRepo: '📦 مستودع المنتجات',
    invRepo: 'سجل الفواتير والمبيعات المعتمدة',
    prefTitle: '🌐 تفضيلات اللغة والمظهر',
    securityTitle: '🔒 أمان الحساب وتغيير كلمة المرور',
    oldPass: 'كلمة المرور الحالية',
    newPass: 'كلمة المرور الجديدة',
    updatePassBtn: 'تحديث كلمة المرور',
    logoutBtn: 'تسجيل الخروج',
    taxInvoiceTitle: 'فاتورة ضريبية مبسطة',
    clientCol: 'العميل / المستلم',
    itemDesc: 'بيان الصنف والخدمة',
    itemQuantity: 'الكمية',
    unitPriceCol: 'سعر الوحدة',
    totalCol: 'المجموع الخاضع للضريبة',
    subtotal: 'المبلغ الخاضع للضريبة:',
    vatAmount: 'ضريبة القيمة المضافة (15%):',
    totalDue: 'الإجمالي المستحق:',
    invoiceFooterNote: 'شكراً لتعاملكم معنا • صدرت إلكترونياً عبر نظام محور'
  },
  en: {
    brand: 'Mihwar ERP',
    tagline: 'Enterprise Management Reimagined.',
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
    stockRepo: '📦 Warehouse Products',
    invRepo: 'Sales Invoices',
    prefTitle: '🌐 Language & Display',
    securityTitle: '🔒 Account Security',
    oldPass: 'Current Password',
    newPass: 'New Password',
    updatePassBtn: 'Update Password',
    logoutBtn: 'Sign Out',
    taxInvoiceTitle: 'Simplified Tax Invoice',
    clientCol: 'Client / Buyer',
    itemDesc: 'Item & Service Description',
    itemQuantity: 'Qty',
    unitPriceCol: 'Unit Price',
    totalCol: 'Taxable Subtotal',
    subtotal: 'Taxable Amount:',
    vatAmount: 'Value Added Tax (15%):',
    totalDue: 'Total Amount Due:',
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

  const [suppliers, setSuppliers] = useState([]);
  const [suppName, setSuppName] = useState('');
  const [suppTaxNumber, setSuppTaxNumber] = useState('');
  const [suppPhone, setSuppPhone] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [cartItems, setCartItems] = useState([]);
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  const [purchaseInvoices, setPurchaseInvoices] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPurchaseProdId, setSelectedPurchaseProdId] = useState('');
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [purchaseCost, setPurchaseCost] = useState('');

  // حالات إدارة الموارد البشرية والخصومات التفصيلية
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

  const [empName, setEmpName] = useState('');
  const [empIdNumber, setEmpIdNumber] = useState('');
  const [empNumber, setEmpNumber] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empDept, setEmpDept] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [empDeductions, setEmpDeductions] = useState('');
  const [empVacations, setEmpVacations] = useState('');
  const [empInsurance, setEmpInsurance] = useState('');
  const [empStatus, setEmpStatus] = useState('نشط');
  const [empIqamaEnd, setEmpIqamaEnd] = useState('');
  const [empHealthEnd, setEmpHealthEnd] = useState('');
  const [empContractEnd, setEmpContractEnd] = useState('');

  // حقول نموذج الخصم السريع
  const [selectedEmpForDeduct, setSelectedEmpForDeduct] = useState('');
  const [deductAmount, setDeductAmount] = useState('');
  const [deductReason, setDeductReason] = useState('');

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

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    if (!empName.trim()) return;
    const newEmp = {
      id: Date.now(),
      name: empName.trim(),
      idNumber: empIdNumber.trim() || '-',
      empNo: empNumber.trim() || String(employees.length + 1),
      role: empRole.trim() || 'موظف',
      dept: empDept.trim() || 'عام',
      phone: empPhone.trim() || '-',
      salary: Number(empSalary) || 4000,
      deductions: Number(empDeductions) || 0,
      vacations: Number(empVacations) || 21,
      insurance: empInsurance.trim() || 'تأمين أساسي',
      status: empStatus || 'نشط',
      iqamaEnd: empIqamaEnd || '2027-05-12',
      healthEnd: empHealthEnd || '2027-03-01',
      contractEnd: empContractEnd || '2028-04-10'
    };
    const updated = [newEmp, ...employees];
    setEmployees(updated);
    localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
    setEmpName(''); setEmpIdNumber(''); setEmpNumber(''); setEmpRole(''); setEmpDept(''); setEmpPhone(''); setEmpSalary(''); setEmpDeductions(''); setEmpVacations(''); setEmpInsurance('');
    setShowAddEmpModal(false);
  };

  const handleDeleteEmployee = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
  };

  // دالة حفظ الخصم مع التاريخ التلقائي
  const handleSaveDeduction = (e) => {
    e.preventDefault();
    if (!selectedEmpForDeduct || !deductAmount) return;
    const newDeduct = {
      id: Date.now(),
      empName: selectedEmpForDeduct,
      amount: Number(deductAmount),
      reason: deductReason.trim() || 'بدون سبب مذكور',
      date: new Date().toISOString().slice(0, 10) // تاريخ اليوم تلقائياً
    };
    const updatedList = [newDeduct, ...deductionsList];
    setDeductionsList(updatedList);
    localStorage.setItem('mihwar_hr_deductions', JSON.stringify(updatedList));

    // تحديث إجمالي الخصومات للموظف المستهدف
    const updatedEmps = employees.map(emp => {
      if (emp.name === selectedEmpForDeduct) {
        return { ...emp, deductions: Number(emp.deductions || 0) + Number(deductAmount) };
      }
      return emp;
    });
    setEmployees(updatedEmps);
    localStorage.setItem('mihwar_hr_employees', JSON.stringify(updatedEmps));

    setSelectedEmpForDeduct(''); setDeductAmount(''); setDeductReason('');
    setShowDeductModal(false);
  };

  const handleExportSales = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_المبيعات_الضريبية' : 'Tax_Sales_Report';
    const headers = isAr ? ['رقم الفاتورة', 'العميل المستلم', 'تاريخ الإصدار', 'المبلغ الخاضع للضريبة (ر.س)', 'ضريبة القيمة المضافة 15% (ر.س)', 'الإجمالي المستحق (ر.س)'] : ['Invoice Number', 'Client / Buyer', 'Issue Date', 'Taxable Amount (SAR)', 'VAT 15% (SAR)', 'Total Amount Due (SAR)'];
    const rows = invoices.map(inv => [inv.invoiceNo, inv.customer?.name || (isAr ? 'عميل نقدي عام' : 'General Cash Customer'), new Date(inv.createdAt).toISOString().slice(0, 10), Number(inv.subtotal || 0).toFixed(2), Number(inv.taxAmount || 0).toFixed(2), Number(inv.totalAmount || 0).toFixed(2)]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportInventory = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_جرد_المستودع_الحي' : 'Live_Inventory_Audit_Report';
    const headers = isAr ? ['اسم المنتج', 'الرصيد الفعلي', 'سعر البيع'] : ['Product Name', 'Available Stock', 'Sale Price'];
    const rows = inventory.map(i => [i.name, i.stock, Number(i.price).toFixed(2)]);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportCustomers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_العملاء' : 'Clients_Directory';
    const headers = isAr ? ['الاسم', 'الهوية', 'الهاتف'] : ['Name', 'ID', 'Phone'];
    const rows = customers.map(c => [c.name, c.nationalId || '-', c.phone || '-']);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportSuppliers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_الموردين' : 'Suppliers_Directory';
    const headers = isAr ? ['اسم المورد', 'الرقم الضريبي', 'الهاتف'] : ['Supplier Name', 'Tax No', 'Phone'];
    const rows = suppliers.map(s => [s.name, s.taxNumber || '-', s.phone || '-']);
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
    if (existing) {
      setCartItems(cartItems.map(it => it.productId === product.id ? { ...it, quantity: reqQ, subtotal: Number((reqQ * product.price).toFixed(2)) } : it));
    } else {
      setCartItems([...cartItems, { productId: product.id, name: product.name, quantity: qty, price: product.price, subtotal: Number((qty * product.price).toFixed(2)) }]);
    }
    setSelectedProductId(''); setItemQty(1);
  };

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
    try {
      await API.post('/api/purchases', { productId: Number(selectedPurchaseProdId), quantity: Number(purchaseQty), unitCost: Number(purchaseCost), supplierId: selectedSupplierId ? Number(selectedSupplierId) : null });
      setSelectedPurchaseProdId(''); setPurchaseCost(''); fetchAllData(); setActiveTab('inventory');
    } catch (e) { alert('Failed'); }
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

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!custName.trim()) return;
    try {
      await API.post('/api/customers', { name: custName.trim(), nationalId: custNationalId.trim()||null, phone: custPhone.trim()||null });
      setCustName(''); setCustNationalId(''); setCustPhone('');
      fetchCustomers();
    } catch (e) { alert('Error'); }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    if (!suppName.trim()) return;
    try {
      await API.post('/api/suppliers', { name: suppName.trim(), taxNumber: suppTaxNumber.trim()||null, phone: suppPhone.trim()||null });
      setSuppName(''); setSuppTaxNumber(''); setSuppPhone('');
      fetchSuppliers();
    } catch (e) { alert('Error'); }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    try {
      await API.post('/api/inventory', { name: newProdName, price: newProdPrice, stock: newProdStock || 0 });
      setNewProdName(''); setNewProdPrice(''); setNewProdStock('');
      fetchInventory();
    } catch (e) { alert('Error'); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) return;
    try {
      const res = await API.post('/api/change-password', { currentPassword: currentPass, newPassword: newPass });
      alert(`✅ ${res.data.message}`);
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
          body * { visibility: hidden !important; }
          #zatca-printable-invoice, #zatca-printable-invoice * { visibility: visible !important; }
          #zatca-printable-invoice { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 15mm !important; background: #fff !important; color: #000 !important; }
          .no-print-zone { display: none !important; }
          @page { size: A4 portrait; margin: 0mm; }
        }
      `}</style>

      {/* الشريط الجانبي (Sidebar) على اليمين */}
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
          
          {/* 1. لوحة التحكم */}
          {activeTab === 'dashboard' && user.role !== 'cashier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.welcome} {user.name} 👋</h2>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>مرحباً بك في لوحة التحكم المركزية لنظام محور.</p>
                </div>
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
                      {lowStockItems.map(item => (
                        <span key={item.id} style={{ background: '#7f1d1d', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                          {item.name} (المتبقي: {item.stock})
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: theme.bgMain, padding: '12px 18px', borderRadius: '10px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>تحديد الحد الأدنى:</span>
                  <input 
                    type="number" 
                    value={lowStockThreshold} 
                    onChange={e => {
                      const val = Number(e.target.value);
                      setLowStockThreshold(val);
                      localStorage.setItem('mihwar_low_stock_threshold', val);
                    }} 
                    style={{ width: '65px', padding: '6px', borderRadius: '6px', border: '1px solid #d97706', background: theme.cardBg, color: theme.textDark, textAlign: 'center', fontWeight: 'bold', fontSize: '14px', outline: 'none' }} 
                  />
                  <span style={{ fontSize: '12px', color: theme.textMuted }}>قطعة</span>
                </div>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📅 تحليل أداء مبيعات السنة الحالية ({currentYear})</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '10px' }}>الشهر</th>
                      <th style={{ padding: '10px' }}>عدد الفواتير</th>
                      <th style={{ padding: '10px' }}>إجمالي المبيعات (ر.س)</th>
                      <th style={{ padding: '10px' }}>نسبة الأداء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{m.monthName}</td>
                        <td style={{ padding: '10px' }}>{m.count} فاتورة</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#10b981' }}>{m.total.toFixed(2)} {t.currency}</td>
                        <td style={{ padding: '10px' }}>
                          <div style={{ width: '100%', maxWidth: '150px', height: '6px', background: theme.bgMain, borderRadius: '3px', overflow: 'hidden', border: `1px solid ${theme.border}` }}>
                            <div style={{ width: `${Math.min(100, (m.total / (totalSalesVal || 1)) * 100)}%`, height: '100%', background: '#d97706' }}></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📊 سجل النمو المالي للسنوات الماضية (حتى 10 سنوات)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '10px' }}>السنة المالية</th>
                      <th style={{ padding: '10px' }}>عدد الفواتير</th>
                      <th style={{ padding: '10px' }}>إجمالي المبيعات</th>
                      <th style={{ padding: '10px' }}>صافي الربح التقديري</th>
                    </tr>
                  </thead>
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

          {/* 2. نقطة البيع (POS) */}
          {activeTab === 'pos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>🛒 نقطة البيع السريعة</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                  {inventory.map(prod => {
                    const cartItem = cartItems.find(it => it.productId === prod.id);
                    const qty = cartItem ? cartItem.quantity : 0;
                    const updateQty = (newQ) => {
                      if (isNaN(newQ) || newQ < 0) newQ = 0;
                      if (newQ > prod.stock) newQ = prod.stock;
                      if (newQ === 0) setCartItems(cartItems.filter(i => i.productId !== prod.id));
                      else if (cartItem) setCartItems(cartItems.map(i => i.productId === prod.id ? { ...i, quantity: newQ, subtotal: Number((newQ * prod.price).toFixed(2)) } : i));
                      else setCartItems([...cartItems, { productId: prod.id, name: prod.name, quantity: newQ, price: prod.price, subtotal: Number((newQ * prod.price).toFixed(2)) }]);
                    };
                    return (
                      <div key={prod.id} style={{ background: theme.bgMain, border: `1px solid ${qty > 0 ? '#d97706' : theme.border}`, borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>{prod.name}</h4>
                          <span style={{ color: '#d97706', fontWeight: 'bold', fontSize: '12px' }}>{prod.price} {t.currency}</span>
                        </div>
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

          {/* 3. الفواتير */}
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

          {/* 4. المشتريات */}
          {activeTab === 'purchases' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', maxWidth: '600px', margin: 'auto' }}>
              <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>تسجيل فاتورة شراء وتوريد بضاعة</h2>
              <select value={selectedSupplierId} onChange={e=>setSelectedSupplierId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }}>
                <option value="">توريد نقدي مباشر</option>
                {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select value={selectedPurchaseProdId} onChange={e=>setSelectedPurchaseProdId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }}>
                <option value="">-- اختر المنتج المستهدف --</option>
                {inventory.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="number" placeholder="الكمية الموردة" value={purchaseQty} onChange={e=>setPurchaseQty(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '15px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
              <input type="number" placeholder="سعر التكلفة للوحدة (ر.س)" value={purchaseCost} onChange={e=>setPurchaseCost(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', marginBottom: '20px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
              <button onClick={handleSavePurchase} style={{ width: '100%', background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>اعتماد التوريد وزيادة المخزون 📦</button>
            </div>
          )}

          {/* 5. العملاء */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}><h3 style={{ margin: 0, fontSize: '17px' }}>دليل العملاء (TiDB)</h3><button onClick={handleExportCustomers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير Excel</button></div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Phone</th></tr></thead>
                  <tbody>{customers.map(c=><tr key={c.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{c.name}</td><td style={{ padding: '10px' }}>{c.phone||'-'}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. الموردين */}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}><h3 style={{ margin: 0, fontSize: '17px' }}>دليل الموردين (TiDB)</h3><button onClick={handleExportSuppliers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير Excel</button></div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>Name</th><th style={{ padding: '10px' }}>Tax No</th></tr></thead>
                  <tbody>{suppliers.map(s=><tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}><td style={{ padding: '10px' }}>{s.name}</td><td style={{ padding: '10px' }}>{s.taxNumber||'-'}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. المخزون */}
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

          {/* 8. الإنتاج */}
          {activeTab === 'production' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '30px', textAlign: 'center' }}>
              <h2>🏭 إدارة الإنتاج وأوامر التصنيع (BOM)</h2>
              <p style={{ color: theme.textMuted }}>النظام جاهز لربط وصفات التصنيع ومتابعة خطوط الإنتاج بدقة عالية.</p>
              <button style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}>أمر إنتاج +</button>
            </div>
          )}

          {/* 9. الموارد البشرية والرواتب (HR & Payroll) */}
          {activeTab === 'hr' && user.role !== 'cashier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.hrTitle}</h2>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.hrSub}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowAddEmpModal(true)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                    {t.addEmpBtn}
                  </button>
                  <button onClick={() => setShowDeductModal(true)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                    {t.addDeductBtn}
                  </button>
                </div>
              </div>

              {/* بطاقات الإحصائيات */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي الموظفين</p>
                  <h2 style={{ color: '#38bdf8', margin: '8px 0 0 0', fontSize: '24px' }}>{employees.length} موظف</h2>
                </div>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي الرواتب الأساسية</p>
                  <h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '24px' }}>{totalPayroll.toLocaleString()} {t.currency}</h2>
                </div>
              </div>

              {/* جدول الموظفين */}
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📋 سجل الموظفين، الرواتب والخصومات والوثائق</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '900px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '12px' }}>الموظف</th>
                      <th style={{ padding: '12px' }}>رقم الإقامة / الهوية</th>
                      <th style={{ padding: '12px' }}>المسمى والقسم</th>
                      <th style={{ padding: '12px' }}>الهاتف</th>
                      <th style={{ padding: '12px' }}>الراتب والخصومات</th>
                      <th style={{ padding: '12px' }}>التأمين والأجازات</th>
                      <th style={{ padding: '12px' }}>انتهاء الوثائق</th>
                      <th style={{ padding: '12px' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name} <span style={{ fontSize: '11px', color: theme.textMuted }}>(#{emp.empNo})</span></td>
                        <td style={{ padding: '12px' }}>{emp.idNumber}</td>
                        <td style={{ padding: '12px' }}>{emp.role} <br/><span style={{ color: '#2dd4bf', fontSize: '11px' }}>{emp.dept}</span></td>
                        <td style={{ padding: '12px' }}>{emp.phone}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: '#10b981', fontWeight: 'bold' }}>{emp.salary} {t.currency}</span>
                          <br/><span style={{ color: '#ef4444', fontSize: '11px' }}>خصم: {emp.deductions} {t.currency}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span>{emp.insurance}</span>
                          <br/><span style={{ color: '#38bdf8', fontSize: '11px' }}>أجازات: {emp.vacations} يوم</span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '11px' }}>
                          إقامة: {emp.iqamaEnd} <br/>
                          صحي: {emp.healthEnd} <br/>
                          عقد: {emp.contractEnd}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button onClick={() => handleDeleteEmployee(emp.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* سجل الخصومات التفصيلي (السبب والقيمة والتاريخ التلقائي) */}
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px', color: '#fca5a5' }}>🔻 سجل الخصومات التفصيلي (السبب، القيمة، والتاريخ التلقائي)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '10px' }}>اسم الموظف</th>
                      <th style={{ padding: '10px' }}>قيمة الخصم</th>
                      <th style={{ padding: '10px' }}>سبب الخصم</th>
                      <th style={{ padding: '10px' }}>تاريخ التسجيل (تلقائي)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deductionsList.map(d => (
                      <tr key={d.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{d.empName}</td>
                        <td style={{ padding: '10px', color: '#ef4444', fontWeight: 'bold' }}>{d.amount} {t.currency}</td>
                        <td style={{ padding: '10px' }}>{d.reason}</td>
                        <td style={{ padding: '10px', color: theme.textMuted }}>{d.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* نافذة إضافة موظف جديد */}
          {showAddEmpModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
              <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>إضافة موظف جديد</h3>
                  <button onClick={() => setShowAddEmpModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
                </div>

                <form onSubmit={handleSaveEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empName}</label>
                      <input type="text" value={empName} onChange={e=>setEmpName(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empNumber}</label>
                      <input type="text" value={empNumber} onChange={e=>setEmpNumber(e.target.value)} placeholder="مثال: 22" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empIdNumber}</label>
                      <input type="text" value={empIdNumber} onChange={e=>setEmpIdNumber(e.target.value)} placeholder="رقم الهوية أو الإقامة" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empPhone}</label>
                      <input type="text" value={empPhone} onChange={e=>setEmpPhone(e.target.value)} placeholder="05xxxxxxxx" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empRole}</label>
                      <input type="text" value={empRole} onChange={e=>setEmpRole(e.target.value)} placeholder="المسمى الوظيفي" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empDept}</label>
                      <input type="text" value={empDept} onChange={e=>setEmpDept(e.target.value)} placeholder="القسم" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empSalary}</label>
                      <input type="number" value={empSalary} onChange={e=>setEmpSalary(e.target.value)} required placeholder="4000" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empDeductions}</label>
                      <input type="number" value={empDeductions} onChange={e=>setEmpDeductions(e.target.value)} placeholder="0" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empVacations}</label>
                      <input type="number" value={empVacations} onChange={e=>setEmpVacations(e.target.value)} placeholder="21" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveEmp}</button>
                    <button type="button" onClick={() => setShowAddEmpModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* نافذة إضافة خصم سريع مع التاريخ التلقائي */}
          {showDeductModal && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
              <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>تسجيل خصم مالي على موظف</h3>
                  <button onClick={() => setShowDeductModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
                </div>

                <form onSubmit={handleSaveDeduction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>اختر الموظف</label>
                    <select value={selectedEmpForDeduct} onChange={e=>setSelectedEmpForDeduct(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }}>
                      <option value="">-- اختر الموظف --</option>
                      {employees.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>قيمة الخصم (ر.س)</label>
                    <input type="number" value={deductAmount} onChange={e=>setDeductAmount(e.target.value)} required placeholder="100" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سبب الخصم</label>
                    <input type="text" value={deductReason} onChange={e=>setDeductReason(e.target.value)} placeholder="مثال: تأخير عن الدوام الرسمي" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  </div>

                  <div style={{ background: theme.bgMain, padding: '10px', borderRadius: '8px', fontSize: '12px', color: theme.textMuted }}>
                    📅 تاريخ الخصم: <strong>{new Date().toISOString().slice(0, 10)}</strong> (تلقائي)
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                    <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveDeduct}</button>
                    <button type="button" onClick={() => setShowDeductModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 10. التقارير */}
          {activeTab === 'reports' && user.role !== 'cashier' && (
            <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px' }}>{t.invRepo}</h2>
                <button onClick={handleExportSales} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير المبيعات</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                    <th style={{ padding: '10px' }}>No</th>
                    <th style={{ padding: '10px' }}>Client</th>
                    <th style={{ padding: '10px' }}>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
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

          {/* 11. الإعدادات */}
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '10px' }}>
          <div style={{ background: '#fff', color: '#0f172a', padding: '30px', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="no-print-zone" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2>{t.taxInvoiceTitle}</h2>
              <button onClick={()=>setPrintingInvoice(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>{t.closeModal}</button>
            </div>
            <div id="zatca-printable-invoice" style={{ background: '#fff', color: '#000', padding: '15px' }}>
              <h2>{businessName}</h2>
              <p><strong>{t.invNo}</strong> #{printingInvoice.invoiceNo}</p>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '20px 0', fontSize: '13px' }}>
                <thead><tr style={{ background: '#0f172a', color: '#fff' }}><th style={{ padding: '8px' }}>Item</th><th style={{ padding: '8px' }}>Qty</th><th style={{ padding: '8px' }}>Total</th></tr></thead>
                <tbody>
                  {(printingInvoice.items || []).map((it, idx)=>(
                    <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1' }}><td style={{ padding: '8px' }}>{it.product?.name}</td><td style={{ padding: '8px' }}>{it.quantity}</td><td style={{ padding: '8px' }}>{it.subtotal}</td></tr>
                  ))}
                </tbody>
              </table>
              <h3>{t.totalDue} {printingInvoice.totalAmount} {t.currency}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;