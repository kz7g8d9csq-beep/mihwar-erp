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
    production: 'الإنتاج وتصنيع BOM',
    hr: 'الموارد البشرية',
    accounting: 'الحسابات المالية',
    welcome: 'مرحباً بك،',
    currency: 'ر.س',
    roleLabel: 'اختر نوع الدخول:',
    roleAdmin: 'مدير النظام (Admin)',
    roleCashier: 'كاشير (Cashier)',
    adminSecretLabel: '🔑 كلمة المرور الإدارية الخاصة بمدير النظام:',
    adminSecretPlaceholder: 'أدخل كلمة سر الإدارة المعتمدة',
    enterAppBtn: 'ابدأ العمل الآن 🚀',

    hrTitle: 'الموارد البشرية والرواتب',
    hrSub: 'إدارة الموظفين، الرواتب، الأجازات، الخصومات المفتوحة، والوثائق.',
    addEmpBtn: 'إضافة موظف جديد +',
    searchEmpPlaceholder: '🔍 ابحث عن موظف بالاسم أو رقم الهوية / الإقامة...',
    empName: 'الاسم الكامل *',
    empIdNumber: 'رقم الهوية / الإقامة',
    empNumber: 'رقم الموظف',
    empRole: 'المسمى الوظيفي',
    empDept: 'القسم',
    empPhone: 'رقم الهاتف',
    empSalary: 'الراتب الأساسي (ر.س)',
    empVacations: 'رصيد الأجازات (أيام)',
    empInsurance: 'التأمين الطبي',
    empStatus: 'الحالة',
    empIqamaEnd: 'انتهاء الإقامة',
    empHealthEnd: 'انتهاء الشهادة الصحية',
    empContractEnd: 'انتهاء العقد',
    saveEmp: 'حفظ الموظف',
    closeModal: 'إغلاق',

    prodTitle: 'إدارة الإنتاج وتصنيع الوصفات (BOM)',
    prodSub: 'ربط المواد الخام بمنتجات المستودع وخصمها آلياً عند أمر التصنيع.',
    createBomBtn: 'إنشاء أمر تصنيع جديد ⚙️',
    bomRepo: 'سجل أوامر التصنيع المعتمدة',

    accTitle: 'الحسابات المالية العامة ودليل الحسابات',
    accSub: 'إدارة شجرة الحسابات والقيود اليومية والربط الآلي.',
    addJournalBtn: 'إضافة حساب جديد +',
    accountName: 'اسم الحساب',
    accountType: 'نوع الحساب',

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
    invoiceFooterNote: 'شكراً لتعاملكم معنا • صدرت إلكترونياً عبر نظام محور',
    exportSalesBtn: '📥 تصدير المبيعات للإقرار الضريبي (Excel)',
    exportPurchasesBtn: '📥 تصدير المشتريات (Excel)',
    exportInventoryBtn: '📥 تصدير جرد المستودع (Excel)'
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
    production: 'Production BOM',
    hr: 'HR',
    accounting: 'General Ledger',
    welcome: 'Welcome,',
    currency: 'SAR',
    roleLabel: 'Select Login Role:',
    roleAdmin: 'System Administrator (Admin)',
    roleCashier: 'Cashier (POS Only)',
    adminSecretLabel: '🔑 Master Admin Secret Key:',
    adminSecretPlaceholder: 'Enter master admin secret password',
    enterAppBtn: 'Get Started 🚀',

    hrTitle: 'Human Resources & Payroll',
    hrSub: 'Manage employees, salaries, vacations, open deductions, and documents.',
    addEmpBtn: 'Add New Employee +',
    searchEmpPlaceholder: '🔍 Search by name or National ID / Iqama...',
    empName: 'Full Name *',
    empIdNumber: 'National ID / Iqama',
    empNumber: 'Employee ID',
    empRole: 'Job Title',
    empDept: 'Department',
    empPhone: 'Phone Number',
    empSalary: 'Basic Salary (SAR)',
    empVacations: 'Vacation Balance (Days)',
    empInsurance: 'Medical Insurance',
    empStatus: 'Status',
    empIqamaEnd: 'Residency Expiry',
    empHealthEnd: 'Health Cert Expiry',
    empContractEnd: 'Contract Expiry',
    saveEmp: 'Save Employee',
    closeModal: 'Cancel',

    prodTitle: 'Production & BOM Management',
    prodSub: 'Link raw materials to stock items and deplete automatically.',
    createBomBtn: 'New Manufacturing Order ⚙️',
    bomRepo: 'Approved Manufacturing Orders',

    accTitle: 'General Ledger & Chart of Accounts',
    accSub: 'Manage chart of accounts and journal entries.',
    addJournalBtn: 'Add Account +',
    accountName: 'Account Name',
    accountType: 'Account Type',

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
    invoiceFooterNote: 'Thank you for your business • Issued electronically via Mihwar ERP',
    exportSalesBtn: '📥 Export Sales Tax Report (Excel)',
    exportPurchasesBtn: '📥 Export Purchases (Excel)',
    exportInventoryBtn: '📥 Export Warehouse Audit (Excel)'
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

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('mihwar_hr_employees');
    return saved ? JSON.parse(saved) : [
      { 
        id: 1, 
        name: 'أحمد حلمي محمد', 
        idNumber: '799032458578', 
        empNo: '20', 
        role: 'مندوب جملة', 
        dept: 'مبيعات وتوزيع', 
        phone: '0530044627', 
        salary: 4577, 
        deductionsList: [
          { id: 101, amount: 120, reason: 'تأخير صباحي', date: '2026-06-01' }
        ],
        vacations: 14, 
        insurance: 'شامل الفئة أ', 
        status: 'نشط', 
        iqamaEnd: '2027-05-12', 
        healthEnd: '2027-03-01', 
        contractEnd: '2028-04-10' 
      }
    ];
  });
  
  const [hrSearchQuery, setHrSearchQuery] = useState('');
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
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

  const [managingDeductionsEmp, setManagingDeductionsEmp] = useState(null);
  const [newDeductionAmount, setNewDeductionAmount] = useState('');
  const [newDeductionReason, setNewDeductionReason] = useState('');

  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('mihwar_accounts');
    return saved ? JSON.parse(saved) : [
      { id: 101, code: '1101', name: 'الصندوق / النقدية', type: 'أصول', balance: 125400 },
      { id: 102, code: '1102', name: 'البنك التجاري', type: 'أصول', balance: 450000 },
      { id: 201, code: '2101', name: 'الموردين الدائنون', type: 'خصوم', balance: 32000 },
      { id: 301, code: '3101', name: 'رأس المال', type: 'حقوق ملكية', balance: 500000 },
      { id: 401, code: '4101', name: 'إيرادات المبيعات', type: 'إيرادات', balance: 0 },
      { id: 501, code: '5101', name: 'رواتب ومستحقات الموظفين', type: 'مصروفات', balance: 0 }
    ];
  });
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [newAccCode, setNewAccCode] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('أصول');
  const [newAccBalance, setNewAccBalance] = useState('');

  const [bomOrders, setBomOrders] = useState(() => {
    const saved = localStorage.getItem('mihwar_bom_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [showBomModal, setShowBomModal] = useState(false);
  const [bomTargetProductId, setBomTargetProductId] = useState('');
  const [bomQtyToProduce, setBomQtyToProduce] = useState(1);

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
      deductionsList: [],
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
    setEmpName(''); setEmpIdNumber(''); setEmpNumber(''); setEmpRole(''); setEmpDept(''); setEmpPhone(''); setEmpSalary(''); setEmpVacations(''); setEmpInsurance('');
    setShowAddEmpModal(false);
  };

  const handleDeleteEmployee = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
  };

  const handleAddDeduction = (e) => {
    e.preventDefault();
    if (!managingDeductionsEmp || !newDeductionAmount) return;
    const amt = Number(newDeductionAmount);
    if (amt <= 0) return;

    const todayStr = new Date().toISOString().slice(0, 10);
    const newDed = {
      id: Date.now(),
      amount: amt,
      reason: newDeductionReason.trim() || 'خصم إداري',
      date: todayStr
    };

    const updatedEmployees = employees.map(emp => {
      if (emp.id === managingDeductionsEmp.id) {
        const currentList = emp.deductionsList || [];
        const updatedEmp = { ...emp, deductionsList: [newDed, ...currentList] };
        setManagingDeductionsEmp(updatedEmp);
        return updatedEmp;
      }
      return emp;
    });

    setEmployees(updatedEmployees);
    localStorage.setItem('mihwar_hr_employees', JSON.stringify(updatedEmployees));
    setNewDeductionAmount('');
    setNewDeductionReason('');
  };

  const handleRemoveDeduction = (dedId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء/إعفاء الموظف من هذا الخصم؟')) return;
    const updatedEmployees = employees.map(emp => {
      if (emp.id === managingDeductionsEmp.id) {
        const currentList = emp.deductionsList || [];
        const updatedList = currentList.filter(d => d.id !== dedId);
        const updatedEmp = { ...emp, deductionsList: updatedList };
        setManagingDeductionsEmp(updatedEmp);
        return updatedEmp;
      }
      return emp;
    });
    setEmployees(updatedEmployees);
    localStorage.setItem('mihwar_hr_employees', JSON.stringify(updatedEmployees));
  };

  const handleAddAccount = (e) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccCode.trim()) return;
    const newAcc = {
      id: Date.now(),
      code: newAccCode.trim(),
      name: newAccName.trim(),
      type: newAccType,
      balance: Number(newAccBalance) || 0
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    localStorage.setItem('mihwar_accounts', JSON.stringify(updated));
    setNewAccCode(''); setNewAccName(''); setNewAccBalance('');
    setShowAddAccountModal(false);
  };

  const handleCreateBomOrder = async (e) => {
    e.preventDefault();
    if (!bomTargetProductId || bomQtyToProduce <= 0) return;
    const prod = inventory.find(p => p.id === Number(bomTargetProductId));
    if (!prod) return;

    const newOrder = {
      id: Date.now(),
      productName: prod.name,
      qty: Number(bomQtyToProduce),
      date: new Date().toLocaleDateString('ar-SA'),
      status: 'مكتمل ومعتمد محاسبياً'
    };

    try {
      await API.post('/api/inventory', { name: prod.name, price: prod.price, stock: prod.stock + Number(bomQtyToProduce) });
      const updatedBom = [newOrder, ...bomOrders];
      setBomOrders(updatedBom);
      localStorage.setItem('mihwar_bom_orders', JSON.stringify(updatedBom));
      fetchAllData();
      setShowBomModal(false);
      setBomQtyToProduce(1);
      alert('✅ تم تنفيذ أمر التصنيع وزيادة المخزون بنجاح!');
    } catch (err) {
      alert('❌ فشل في تنفيذ أمر التصنيع');
    }
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
    const title = isAr ? 'تقرير_جرد_المستودع' : 'Inventory_Audit_Report';
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
  const totalPayroll = employees.reduce((sum, e) => {
    const totalEmpDed = (e.deductionsList || []).reduce((s, d) => s + Number(d.amount || 0), 0);
    return sum + Math.max(0, Number(e.salary || 0) - totalEmpDed);
  }, 0);

  const filteredEmployees = employees.filter(emp => {
    const q = hrSearchQuery.toLowerCase();
    const nameMatch = emp.name.toLowerCase().includes(q);
    const idMatch = String(emp.idNumber).toLowerCase().includes(q);
    const noMatch = String(emp.empNo).toLowerCase().includes(q);
    return nameMatch || idMatch || noMatch;
  });

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
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'Cairo, Tahoma, sans-serif', background: '#141824', color: '#f8fafc' }}>
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
    { id: 'accounting', label: t.accounting, adminOnly: true, icon: '💰' },
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
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.welcome} {user.name} 👋</h2>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>مرحباً بك في لوحة التحكم المركزية لنظام محور.</p>
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
                  <input type="number" value={lowStockThreshold} onChange={e => { const val = Number(e.target.value); setLowStockThreshold(val); localStorage.setItem('mihwar_low_stock_threshold', val); }} style={{ width: '65px', padding: '6px', borderRadius: '6px', border: '1px solid #d97706', background: theme.cardBg, color: theme.textDark, textAlign: 'center', fontWeight: 'bold', outline: 'none' }} />
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
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{m.monthName}</td>
                        <td style={{ padding: '10px' }}>{m.count} فاتورة</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#10b981' }}>{m.total.toFixed(2)} {t.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📊 سجل النمو المالي للسنوات الماضية</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: lang === 'ar' ? 'right' : 'left', fontSize: '13px', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '10px' }}>السنة المالية</th>
                      <th style={{ padding: '10px' }}>عدد الفواتير</th>
                      <th style={{ padding: '10px' }}>إجمالي المبيعات</th>
                      <th style={{ padding: '10px' }}>صافي الربح</th>
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

          {/* 3. الفواتير والمبيعات */}
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

          {/* 4. المشتريات والتوريد */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.prodTitle}</h2>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.prodSub}</p>
                </div>
                <button onClick={() => setShowBomModal(true)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  {t.createBomBtn}
                </button>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{t.bomRepo}</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '12px' }}>المنتج المصنع</th>
                      <th style={{ padding: '12px' }}>الكمية المنتجة</th>
                      <th style={{ padding: '12px' }}>تاريخ التشغيل</th>
                      <th style={{ padding: '12px' }}>الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bomOrders.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: theme.textMuted }}>لا توجد أوامر تصنيع مسجلة حتى الآن.</td>
                      </tr>
                    ) : (
                      bomOrders.map(ord => (
                        <tr key={ord.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{ord.productName}</td>
                          <td style={{ padding: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{ord.qty} وحدة</td>
                          <td style={{ padding: '12px' }}>{ord.date}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ background: '#065f46', color: '#6ee7b7', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                              {ord.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 9. الموارد البشرية */}
          {activeTab === 'hr' && user.role !== 'cashier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.hrTitle}</h2>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.hrSub}</p>
                </div>
                <button onClick={() => setShowAddEmpModal(true)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  {t.addEmpBtn}
                </button>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <input 
                  type="text" 
                  value={hrSearchQuery} 
                  onChange={e => setHrSearchQuery(e.target.value)} 
                  placeholder={t.searchEmpPlaceholder} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '14px' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي الموظفين</p>
                  <h2 style={{ color: '#38bdf8', margin: '8px 0 0 0', fontSize: '24px' }}>{employees.length} موظف</h2>
                </div>
                <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>صافي الرواتب المستحقة (مرتبط بالمحاسبة)</p>
                  <h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '24px' }}>{totalPayroll.toLocaleString()} {t.currency}</h2>
                </div>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📋 سجل الموظفين وإدارة الخصومات المفتوحة</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '950px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '12px' }}>الموظف</th>
                      <th style={{ padding: '12px' }}>رقم الإقامة / الهوية</th>
                      <th style={{ padding: '12px' }}>المسمى والقسم</th>
                      <th style={{ padding: '12px' }}>الهاتف</th>
                      <th style={{ padding: '12px' }}>الراتب والخصومات</th>
                      <th style={{ padding: '12px' }}>التأمين والأجازات</th>
                      <th style={{ padding: '12px' }}>انتهاء الوثائق</th>
                      <th style={{ padding: '12px' }}>إدارة الخصومات</th>
                      <th style={{ padding: '12px' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: theme.textMuted }}>لا توجد نتائج مطابقة لبحثك.</td>
                      </tr>
                    ) : (
                      filteredEmployees.map(emp => {
                        const totalEmpDed = (emp.deductionsList || []).reduce((s, d) => s + Number(d.amount || 0), 0);
                        return (
                          <tr key={emp.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name} <span style={{ fontSize: '11px', color: theme.textMuted }}>(#{emp.empNo})</span></td>
                            <td style={{ padding: '12px' }}>{emp.idNumber}</td>
                            <td style={{ padding: '12px' }}>{emp.role} <br/><span style={{ color: '#2dd4bf', fontSize: '11px' }}>{emp.dept}</span></td>
                            <td style={{ padding: '12px' }}>{emp.phone}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ color: '#10b981', fontWeight: 'bold' }}>{emp.salary} {t.currency}</span>
                              <br/><span style={{ color: '#ef4444', fontSize: '11px' }}>خصم: {totalEmpDed} {t.currency}</span>
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
                              <button onClick={() => setManagingDeductionsEmp(emp)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>إدارة الخصومات ➕</button>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <button onClick={() => handleDeleteEmployee(emp.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>حذف</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. الحسابات المالية العامة (General Ledger) */}
          {activeTab === 'accounting' && user.role !== 'cashier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.accTitle}</h2>
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.accSub}</p>
                </div>
                <button onClick={() => setShowAddAccountModal(true)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                  {t.addJournalBtn}
                </button>
              </div>

              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>📊 شجرة الدليل المحاسبي (مرتبطة آلياً بالرواتب والمبيعات)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                      <th style={{ padding: '12px' }}>رمز الحساب</th>
                      <th style={{ padding: '12px' }}>{t.accountName}</th>
                      <th style={{ padding: '12px' }}>{t.accountType}</th>
                      <th style={{ padding: '12px' }}>الرصيد الحالي (ر.س)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(acc => (
                      <tr key={acc.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#38bdf8' }}>{acc.code}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{acc.name}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#f59e0b', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            {acc.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981' }}>{acc.balance.toLocaleString()} {t.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 11. التقارير */}
          {activeTab === 'reports' && user.role !== 'cashier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', fontWeight: '900' }}>📈 مركز التقارير والإقرارات الرسمية</h2>
                <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>تصدير كافة تقارير المبيعات والمخزون والعملاء بصيغة Excel معتمدة.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '17px' }}>{t.invRepo}</h3>
                    <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي فواتير المبيعات والضرائب لتقديم الإقرار الضريبي لهيئة الزكاة.</p>
                  </div>
                  <button onClick={handleExportSales} style={{ background: theme.primary, color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t.exportSalesBtn}</button>
                </div>

                <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '17px' }}>{t.stockRepo}</h3>
                    <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>تقرير جرد المستودع الحي وقيمة الأصول والمنتجات المتاحة.</p>
                  </div>
                  <button onClick={handleExportInventory} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t.exportInventoryBtn}</button>
                </div>

                <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '15px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '17px' }}>دليل العملاء</h3>
                    <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>قائمة تفصيلية بكافة العملاء المسجلين وقاعدة البيانات.</p>
                  </div>
                  <button onClick={handleExportCustomers} style={{ background: '#059669', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير العملاء (Excel)</button>
                </div>
              </div>
            </div>
          )}

          {/* 12. الإعدادات */}
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

      {/* نافذة إضافة أمر تصنيع (BOM) */}
      {showBomModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>إنشاء أمر تصنيع جديد (BOM)</h3>
              <button onClick={() => setShowBomModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>

            <form onSubmit={handleCreateBomOrder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>اختر المنتج المراد تصنيعه وإضافته للمستودع:</label>
              <select value={bomTargetProductId} onChange={e=>setBomTargetProductId(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }}>
                <option value="">-- اختر المنتج --</option>
                {inventory.map(p => <option key={p.id} value={p.id}>{p.name} (المتوفر الحالي: {p.stock})</option>)}
              </select>

              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>الكمية المراد إنتاجها:</label>
              <input type="number" min="1" value={bomQtyToProduce} onChange={e=>setBomQtyToProduce(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>تنفيذ الأمر وزيادة المخزون ⚙️</button>
                <button type="button" onClick={() => setShowBomModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إدارة الخصومات المفتوحة */}
      {managingDeductionsEmp && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3500, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>إدارة خصومات الموظف: {managingDeductionsEmp.name}</h3>
              <button onClick={() => setManagingDeductionsEmp(null)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>

            <form onSubmit={handleAddDeduction} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <input type="number" placeholder="مبلغ الخصم (ر.س)" value={newDeductionAmount} onChange={e=>setNewDeductionAmount(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                <input type="text" placeholder="سبب الخصم (مثال: تأخير، غياب...)" value={newDeductionReason} onChange={e=>setNewDeductionReason(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
              </div>
              <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إضافة الخصم وتسجيل التاريخ آلياً وربطه بالمحاسبة ➕</button>
            </form>

            <h4 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>سجل الخصومات الحالية (تاريخ آلي مع إمكانية الإعفاء):</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {(!managingDeductionsEmp.deductionsList || managingDeductionsEmp.deductionsList.length === 0) ? (
                <p style={{ color: theme.textMuted, fontSize: '13px' }}>لا توجد خصومات مسجلة لهذا الموظف حالياً.</p>
              ) : (
                managingDeductionsEmp.deductionsList.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.bgMain, padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, fontSize: '13px' }}>
                    <div>
                      <strong style={{ color: '#ef4444' }}>{d.amount} ر.س</strong> - <span>{d.reason}</span>
                      <span style={{ display: 'block', fontSize: '11px', color: theme.textMuted }}>تاريخ الخصم: {d.date}</span>
                    </div>
                    <button onClick={() => handleRemoveDeduction(d.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>إعفاء / حذف ✖</button>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => setManagingDeductionsEmp(null)} style={{ width: '100%', background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>إغلاق</button>
          </div>
        </div>
      )}

      {/* نافذة إضافة موظف جديد شاملة */}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empSalary}</label>
                  <input type="number" value={empSalary} onChange={e=>setEmpSalary(e.target.value)} required placeholder="4000" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empVacations}</label>
                  <input type="number" value={empVacations} onChange={e=>setEmpVacations(e.target.value)} placeholder="21" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empInsurance}</label>
                  <input type="text" value={empInsurance} onChange={e=>setEmpInsurance(e.target.value)} placeholder="نوع التأمين الطبي" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empStatus}</label>
                  <select value={empStatus} onChange={e=>setEmpStatus(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }}>
                    <option value="نشط">نشط</option>
                    <option value="إجازة">إجازة</option>
                    <option value="موقوف">موقوف</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empIqamaEnd}</label>
                  <input type="date" value={empIqamaEnd} onChange={e=>setEmpIqamaEnd(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empHealthEnd}</label>
                  <input type="date" value={empHealthEnd} onChange={e=>setEmpHealthEnd(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empContractEnd}</label>
                  <input type="date" value={empContractEnd} onChange={e=>setEmpContractEnd(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none', fontSize: '12px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveEmp}</button>
                <button type="button" onClick={() => setShowAddEmpModal(false)} style={{ flex: '1', background: '#334155', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة حساب جديد */}
      {showAddAccountModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '500px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900' }}>إضافة حساب جديد لدليل الحسابات</h3>
              <button onClick={() => setShowAddAccountModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>

            <form onSubmit={handleAddAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" placeholder="رمز الحساب (مثال: 1103)" value={newAccCode} onChange={e=>setNewAccCode(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
              <input type="text" placeholder="اسم الحساب (مثال: عهد ومستحقات)" value={newAccName} onChange={e=>setNewAccName(e.target.value)} required style={{ padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
              <select value={newAccType} onChange={e=>setNewAccType(e.target.value)} style={{ padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }}>
                <option value="أصول">أصول</option>
                <option value="خصوم">خصوم</option>
                <option value="حقوق ملكية">حقوق ملكية</option>
                <option value="إيرادات">إيرادات</option>
                <option value="مصروفات">مصروفات</option>
              </select>
              <input type="number" placeholder="الرصيد الافتتاحي (ر.س)" value={newAccBalance} onChange={e=>setNewAccBalance(e.target.value)} style={{ padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>حفظ الحساب</button>
                <button type="button" onClick={() => setShowAddAccountModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {printingInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '10px' }}>
          <div style={{ background: '#fff', color: '#0f172a', padding: '30px', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="no-print-zone" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
              <h2>{t.taxInvoiceTitle}</h2>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>📥 حفظ PDF / طباعة</button>
                <button onClick={()=>setPrintingInvoice(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </div>
            
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
                    <th style={{ padding: '10px', textAlign: 'center'}>{t.unitPriceCol}</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>{t.totalCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {(printingInvoice.items || []).map((it, idx)=>(
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