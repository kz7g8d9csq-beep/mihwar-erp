import { useState, useEffect } from 'react';
import API from './services/api';
import emailjs from 'emailjs-com';
import DashboardTab from './components/DashboardTab';
import PosTab from './components/PosTab';
import SalesBillingTab from './components/SalesBillingTab';
import InvoicesListTab from './components/InvoicesListTab';
import PurchaseInvoicesListTab from './components/PurchaseInvoicesListTab';
import PurchasesTab from './components/PurchasesTab';
import CustomersTab from './components/CustomersTab';
import SuppliersTab from './components/SuppliersTab';
import InventoryTab from './components/InventoryTab';
import HrTab from './components/HrTab';
import SettingsTab from './components/SettingsTab';

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
    invoicesList: 'سجل فواتير المبيعات',
    purchaseInvoicesList: 'سجل فواتير الشراء',
    purchases: 'المشتريات',
    customers: 'العملاء',
    suppliers: 'الموردين',
    inventory: 'المخزون',
    settings: 'الإعدادات',
    hr: 'الموارد البشرية',
    welcome: 'مرحباً بك،',
    currency: 'ر.س',
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
    saveEmp: 'Save Employee',
    updateEmp: 'Update Employee',
    saveDeduct: 'Save Deduction',
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
    invRepo: 'سجل فواتير المبيعات',
    prefTitle: '🌐 تفضيلات اللغة والمظهر',
    companyLogoTitle: '🏢 شعار المنشأة والنظام',
    companyLogoDesc: 'اختر أو ارفع ملف صورة الشعار (PNG/JPG) ليظهر في الشريط الجانبي والفواتير',
    logoUrlLabel: 'رفع ملف الشعار:',
    saveLogoBtn: 'حفظ شعار المنشأة',
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
    invoicesList: 'Sales Invoices List',
    purchaseInvoicesList: 'Purchase Invoices List',
    purchases: 'Purchasing',
    customers: 'Clients',
    suppliers: 'Suppliers',
    inventory: 'Inventory',
    reports: 'Reports',
    settings: 'Settings',
    hr: 'HR',
    welcome: 'Welcome,',
    currency: 'SAR',
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
    companyLogoTitle: '🏢 Company Logo (Sidebar & Invoices)',
    companyLogoDesc: 'Upload image file to appear on sidebar and printed invoices',
    logoUrlLabel: 'Upload Logo File:',
    saveLogoBtn: 'Save Company Logo',
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

const getDaysDiff = (dateStr) => {
  if (!dateStr || dateStr === '-') return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getMakkahDateString = (dateObj = new Date()) => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(dateObj);
  } catch {
    return new Date(dateObj).toISOString().slice(0, 10);
  }
};

// دالة حساب الأيام المتبقية الآمنة ضد الأخطاء
const getDueDateDaysLeft = (dueDateStr) => {
  if (!dueDateStr || dueDateStr === '-' || dueDateStr === '') return null;
  try {
    const clean = String(dueDateStr).trim().replace(/\//g, '-');
    const target = new Date(clean);
    if (isNaN(target.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

function App() {
  const lang = 'ar';
  const [isDark, setIsDark] = useState(true);

  const getRegisteredAccounts = () => {
    try {
      return JSON.parse(localStorage.getItem('mihwar_registered_accounts') || '[]');
    } catch {
      return [];
    }
  };

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mihwar_user');
    const savedToken = localStorage.getItem('mihwar_token');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (savedToken && API.defaults) API.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem('mihwar_user'));
  const [authMode, setAuthMode] = useState('login');
  const [loginType, setLoginType] = useState('admin');
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authCompanyName, setAuthCompanyName] = useState('');

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [pendingAuthData, setPendingAuthData] = useState(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [businessName, setBusinessName] = useState(() => {
    return localStorage.getItem('mihwar_business_name') || 'نظام محور';
  });

  const [companyAddress, setCompanyAddress] = useState(() => {
    return localStorage.getItem('mihwar_company_address') || 'المملكة العربية السعودية - جدة';
  });

  const [companyLogo, setCompanyLogo] = useState(() => {
    return localStorage.getItem('mihwar_company_logo') || '';
  });

  const [invoiceLogoSize, setInvoiceLogoSize] = useState(() => {
    const saved = localStorage.getItem('mihwar_invoice_logo_size');
    return saved ? Number(saved) : 110;
  });

  // المخزون
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('mihwar_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [editingProdId, setEditingProdId] = useState(null);
  const [showEditProdModal, setShowEditProdModal] = useState(false);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdStock, setEditProdStock] = useState('');
  const [editItemCode, setEditItemCode] = useState('');

  // العملاء
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('mihwar_customers');
    return saved ? JSON.parse(saved) : [];
  });
  const [custName, setCustName] = useState('');
  const [custNationalId, setCustNationalId] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custGracePeriod, setCustGracePeriod] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [editingCustId, setEditingCustId] = useState(null);
  const [showEditCustModal, setShowEditCustModal] = useState(false);
  const [editCustName, setEditCustName] = useState('');
  const [editCustNationalId, setEditCustNationalId] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustEmail, setEditCustEmail] = useState('');
  const [editCustAddress, setEditCustAddress] = useState('');
  const [editCustGracePeriod, setEditCustGracePeriod] = useState('');

  // الموردين
  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('mihwar_suppliers');
    return saved ? JSON.parse(saved) : [];
  });
  const [suppName, setSuppName] = useState('');
  const [suppTaxNumber, setSuppTaxNumber] = useState('');
  const [suppPhone, setSuppPhone] = useState('');
  const [suppAddress, setSuppAddress] = useState('');
  const [suppGracePeriod, setSuppGracePeriod] = useState('');
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [editingSuppId, setEditingSuppId] = useState(null);
  const [showEditSuppModal, setShowEditSuppModal] = useState(false);
  const [editSuppName, setEditSuppName] = useState('');
  const [editSuppTaxNumber, setEditSuppTaxNumber] = useState('');
  const [editSuppPhone, setEditSuppPhone] = useState('');
  const [editSuppAddress, setEditSuppAddress] = useState('');
  const [editSuppGracePeriod, setEditSuppGracePeriod] = useState('');

  // الفواتير
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem('mihwar_invoices');
    return saved ? JSON.parse(saved) : [];
  });
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  
  // المبيعات والفوترة
  const [salesCustomerSearch, setSalesCustomerSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [salesUnitType, setSalesUnitType] = useState('قطعة');
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

  const [showPayConfirmModal, setShowPayConfirmModal] = useState(false);
  const [payTargetInvoiceId, setPayTargetInvoiceId] = useState(null);
  const [payConfirmMethod, setPayConfirmMethod] = useState('نقد');
  const [partialPayAmount, setPartialPayAmount] = useState('');
  const [partialPayMethod, setPartialPayMethod] = useState('نقد');

  // المشتريات
  const [purchaseProductSearch, setPurchaseProductSearch] = useState('');
  const [purchaseInvoices, setPurchaseInvoices] = useState(() => {
    const saved = localStorage.getItem('mihwar_purchases');
    return saved ? JSON.parse(saved) : [];
  });
  const [purchaseInvoicesListSearch, setPurchaseInvoicesListSearch] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [selectedPurchaseProdId, setSelectedPurchaseProdId] = useState('');
  const [purchaseUnitType, setPurchaseUnitType] = useState('قطعة');
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [piecesPerCartonInput, setPiecesPerCartonInput] = useState(12);
  const [unitGramOrKilo, setUnitGramOrKilo] = useState('لا يوجد');
  const [weightInputValue, setWeightInputValue] = useState('');
  const [purchasePieceCost, setPurchasePieceCost] = useState('');
  const [purchaseBoxCost, setPurchaseBoxCost] = useState('');

  // الموارد البشرية
  const [hrSubTab, setHrSubTab] = useState('employees');
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('mihwar_hr_employees');
    return saved ? JSON.parse(saved) : [];
  });
  const [hrSearchQuery, setHrSearchQuery] = useState('');
  const [hrPayrollSearchQuery, setHrPayrollSearchQuery] = useState('');
  const [hrAlertsSearchQuery, setHrAlertsSearchQuery] = useState('');

  const [deductionsList, setDeductionsList] = useState(() => {
    const saved = localStorage.getItem('mihwar_hr_deductions');
    return saved ? JSON.parse(saved) : [];
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
  const [empCommission, setEmpCommission] = useState('');
  const [empCommissionType, setEmpCommissionType] = useState('');
  const [empAllowances, setEmpAllowances] = useState('');
  const [empHousingAllowance, setEmpHousingAllowance] = useState('');
  const [empTransportAllowance, setEmpTransportAllowance] = useState('');
  const [empIncentiveType, setEmpIncentiveType] = useState('???? ????');
  const [empIncentiveValue, setEmpIncentiveValue] = useState('');

  const [hrDeductSearchQuery, setHrDeductSearchQuery] = useState('');
  const [hrSelectedEmployeeName, setHrSelectedEmployeeName] = useState('');
  const [hrDeductAmount, setHrDeductAmount] = useState('');
  const [hrDeductReason, setHrDeductReason] = useState('');

  // نافذة الحوافز والمكافآت
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [incSelectedEmpName, setIncSelectedEmpName] = useState('');
  const [incIncentiveType, setIncIncentiveType] = useState('');
  const [incIncentiveValue, setIncIncentiveValue] = useState('');
  const [incCommissionType, setIncCommissionType] = useState('');
  const [incCommissionValue, setIncCommissionValue] = useState('');
  const [hrIncentivesSearchQuery, setHrIncentivesSearchQuery] = useState('');
  const [incentiveRecords, setIncentiveRecords] = useState(() => {
    const saved = localStorage.getItem('mihwar_hr_incentives');
    return saved ? JSON.parse(saved) : [];
  });

  // الحد الأدنى للمخزون
  const [lowStockThreshold, setLowStockThreshold] = useState(() => {
    const saved = localStorage.getItem('mihwar_low_stock_threshold');
    return saved ? Number(saved) : 30;
  });

  const [lowStockUnit, setLowStockUnit] = useState(() => {
    return localStorage.getItem('mihwar_low_stock_unit') || 'قطعة';
  });

  const [printingInvoice, setPrintingInvoice] = useState(null);
  const [printingPurchaseInvoice, setPrintingPurchaseInvoice] = useState(null);

    const t = (key) => {
    if (lang === 'ar') return dict['ar'][key] || key;
    if (dict['en'][key]) return dict['en'][key];
    
    // Auto translation map fallback
    const autoMap = {
        "?????? ?? ?? ???? ?????? ???????? ????? ????.": "Welcome to the Mihwar Central Dashboard.",
        "?????? ?????? ????? (???? ???????)": "Today's Total Sales (Tax Incl.)",
        "??????? ??????? / ??????": "Available Stock / Balance",
        "????? ??????": "Light Mode",
        "??? ??????": "Unpaid",
        "??????? ?????? ??????? (??? ?? ???? ??????)": "Low Stock Alerts (Below Minimum)",
        "??????? ??????? ??????? ?? ???? ????? ????? ??? ??????.": "Stock levels are optimal, no items are running low.",
        "????? ???????? ??????? ????": "Monthly Sales Analysis for Year",
        "???? ????????? ???????? ??????? (??? 10 ?????)": "Annual Revenue and Profit Summary (Last 10 Years)",
        "?????": "OK",
        "??? ????????": "Pay Invoice",
        "?????? ????????": "Total Commissions",
        "???? ????? ????????": "Estimated Net Profit",
        "??????": "Paid",
        "????? ?????": "Confirm Payment",
        "????? ????????": "Cancel Invoice",
        "????? ?????? ????????": "Export Sales Invoices",
        "??? ?????? ??????": "Purchase Invoices List",
        "????? ?????? ??????": "Edit Employee Details",
        "????? ???? ????": "Add New Employee",
        "???": "Cash",
        "????? ?????? ???? ?????": "Issue New Purchase Invoice",
        "????? ?????? ??? ?????": "Issue New Sales Invoice",
        "?????? ??????": "Select Product",
        "????? (?.?)": "Price (SAR)",
        "??????? (15%)": "VAT (15%)",
        "????????": "Vacations",
        "????? ???????": "Tax Number",
        "???????": "Address",
        "?????? ??": "WhatsApp ??",
        "?? ????? ?": "Paid ?",
        "??? ?????????": "Save Changes",
        "??????? ??????": "System Settings",
        "??????? ?????": "Health Insurance",
        "??? ???????": "Company Name",
        "????? ?????????": "Due Date",
        "?????????": "Actions",
        "?????? ??????? ????????": "Total Basic Salaries",
        "?????? ???????": "Documents Expiry",
        "??? ??????? / ??????": "Iqama / ID Number",
        "?????? ??????? ??????": "Job Title & Dept",
        "?????? ????????? ????????": "Salary, Commissions & Allowances",
        "????": "Card",
        "????? ????": "Bank Transfer",
        "??? (???)": "Credit",
        "الخصومات": "Deductions",
        "الحوافز والمكافآت": "Incentives & Rewards",
        "إضافة حافز أو مكافأة +": "Add Incentive / Reward +",
        "إضافة حافز أو مكافأة": "Add Incentive / Reward",
        "إضافة موظف جديد +": "Add New Employee +",
        "المسمى الوظيفي والقسم": "Job Title & Department",
        "التأمين الطبي والأجازات": "Medical Insurance & Vacations",
        "🏆 سجل الحوافز والمكافآت والعمولات": "🏆 Incentives, Rewards & Commissions Log",
        "المسمى الوظيفي": "Job Title",
        "التاريخ": "Date",
        "حفظ الحافز": "Save Incentive",
        "لم يتم تسجيل أي حوافز أو مكافآت بعد. اضغط على زر \"إضافة حافز أو مكافأة +\" لبدء التسجيل.": "No incentives or rewards recorded yet. Click \"Add Incentive / Reward +\" to start.",
        "اختر الموظف": "Select Employee",
        "-- اختر الموظف من القائمة --": "-- Select Employee --",
        "انتهاء التأمين الطبي": "Medical Insurance Expiry",
        "انتهاء العقد الوظيفي": "Employment Contract Expiry",
        "التأمين الطبي:": "Medical Insurance:",
        "عقد وظيفي:": "Employment Contract:",
        "بدل سكن (ر.س)": "Housing Allowance (SAR)",
        "بدل مواصلات (ر.س)": "Transport Allowance (SAR)",
        "المدفوع:": "Paid:",
        "المتبقي:": "Remaining:",
        "سداد الفاتورة ✓": "Pay Invoice ✓"
    };
    
    if (autoMap[key]) return autoMap[key];
    
    // Word by word fallback
    let en = String(key);
    const wordsMap = {
      '?????': 'Add', '???': 'Save', '?????': 'Edit', '???': 'Delete', '?????': 'Close', '?????': 'Cancel',
      '???': 'Search', '????': 'Search', '?????': 'OK', '???': 'Yes', '??': 'No',
      '???': 'Name', '???': 'Number', '?????': 'Date', '??????': 'Quantity', '?????': 'Price',
      '????????': 'Total', '???????': 'Total', '?????': 'Tax', '???': 'Discount',
      '????': 'Product', '????????': 'Products', '????': 'Customer', '???????': 'Customers',
      '????': 'Supplier', '????????': 'Suppliers', '????': 'Employee', '????????': 'Employees',
      '??????': 'Invoice', '????????': 'Invoices', '??????': 'Sales', '???????': 'Purchases',
      '?????': 'Inventory', '???????': 'Resources', '???????': 'Human',
      '???????': 'Settings', '?????': 'Print', '?????': 'Export', '???': 'Pay', '????': 'New',
      '??????': 'Details', '????': 'Status', '?????????': 'Actions', '?????': 'Message',
      '??????': 'WhatsApp', '??????': 'Value', '??????': 'Net', '???????': 'Remaining',
      '?????????': 'Due Date', '??????': 'Unit', '????': 'Piece', '?????': 'Carton', '????': 'Kilo',
      '????': 'Gram', '?????': 'Allowances', '?????': 'Commission', '?????': 'Incentives',
      '????': 'Salary', '?????': 'Basic', '?????': 'Insurance', '??????': 'Vacations',
      '???': 'Contract', '?????': 'Iqama', '????': 'ID', '???': 'Health', '?????': 'Today',
      '??????': 'Total'
    };
    let translated = en.split(/\s+/).map(w => {
      let clean = w.replace(/[.,:;()\[\]{}!?]/g, '');
      if (wordsMap[clean]) return w.replace(clean, wordsMap[clean]);
      return w;
    }).join(' ');
    
    return translated;
  };
  Object.assign(t, dict[lang] || dict['ar']);

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
    if (user) localStorage.setItem('mihwar_customers', JSON.stringify(customers));
  }, [customers, user]);

  useEffect(() => {
    if (user) localStorage.setItem('mihwar_suppliers', JSON.stringify(suppliers));
  }, [suppliers, user]);

  useEffect(() => {
    if (user) localStorage.setItem('mihwar_inventory', JSON.stringify(inventory));
  }, [inventory, user]);

  useEffect(() => {
    if (user) localStorage.setItem('mihwar_invoices', JSON.stringify(invoices));
  }, [invoices, user]);

  useEffect(() => {
    if (user) localStorage.setItem('mihwar_purchases', JSON.stringify(purchaseInvoices));
  }, [purchaseInvoices, user]);

  const filteredInventory = inventory.filter(i => safeLower(i.name).includes(safeLower(inventorySearchQuery)) || safeLower(i.itemCode).includes(safeLower(inventorySearchQuery)));
  const filteredCustomers = customers.filter(c => safeLower(c.name).includes(safeLower(customerSearchQuery)) || safeLower(c.nationalId).includes(safeLower(customerSearchQuery)) || safeLower(c.phone).includes(safeLower(customerSearchQuery)) || safeLower(c.email).includes(safeLower(customerSearchQuery)) || safeLower(c.address).includes(safeLower(customerSearchQuery)));
  const filteredSuppliers = suppliers.filter(s => safeLower(s.name).includes(safeLower(supplierSearchQuery)) || safeLower(s.taxNumber).includes(safeLower(supplierSearchQuery)) || safeLower(s.phone).includes(safeLower(supplierSearchQuery)) || safeLower(s.address).includes(safeLower(supplierSearchQuery)));
  
  // فلترة الفواتير الآمنة
  const filteredInvoices = invoices.filter(inv => {
    try {
      const query = safeLower(invoiceSearchQuery);
      const invNoStr = safeLower(inv?.invoiceNo);
      const custNameStr = safeLower(inv?.customer?.name);
      return invNoStr.includes(query) || custNameStr.includes(query);
    } catch {
      return true;
    }
  });

  const filteredPurchaseInvoices = purchaseInvoices.filter(pi => safeLower(pi.invoiceNo || pi.id).includes(safeLower(purchaseInvoicesListSearch)) || safeLower(pi.productName).includes(safeLower(purchaseInvoicesListSearch)) || safeLower(pi.supplier?.name).includes(safeLower(purchaseInvoicesListSearch)));
  const filteredCustomersForSales = customers.filter(c => safeLower(c.name).includes(safeLower(salesCustomerSearch)) || safeLower(c.nationalId).includes(safeLower(salesCustomerSearch)) || safeLower(c.phone).includes(safeLower(salesCustomerSearch)));
  const filteredCustomersForPos = customers.filter(c => safeLower(c.name).includes(safeLower(posCustomerSearch)) || safeLower(c.nationalId).includes(safeLower(posCustomerSearch)) || safeLower(c.phone).includes(safeLower(posCustomerSearch)));
  const filteredProductsForPurchase = inventory.filter(p => safeLower(p.name).includes(safeLower(purchaseProductSearch)));
  const filteredEmployeesForHrDeduct = employees.filter(emp => safeLower(emp.name).includes(safeLower(hrDeductSearchQuery)) || safeLower(emp.idNumber).includes(safeLower(hrDeductSearchQuery)));
  const filteredEmployees = employees.filter(emp => safeLower(emp.name).includes(safeLower(hrSearchQuery)) || safeLower(emp.idNumber).includes(safeLower(hrSearchQuery)));

  const filteredDeductions = deductionsList.filter(d => {
    const emp = employees.find(e => e.name === d.empName);
    return safeLower(d.empName).includes(safeLower(hrPayrollSearchQuery)) ||
           safeLower(emp?.idNumber || '').includes(safeLower(hrPayrollSearchQuery));
  });

  const documentAlerts = [];
  employees.forEach(emp => {
    if (emp.contractEnd && emp.contractEnd !== '-') {
      const diff = getDaysDiff(emp.contractEnd);
      if (diff !== null) {
        documentAlerts.push({
          id: `${emp.id}-contract`,
          empName: emp.name,
          empIdNumber: emp.idNumber || '-',
          docType: 'العقد',
          expiryDate: emp.contractEnd,
          daysDiff: diff
        });
      }
    }
    if (emp.healthEnd && emp.healthEnd !== '-') {
      const diff = getDaysDiff(emp.healthEnd);
      if (diff !== null) {
        documentAlerts.push({
          id: `${emp.id}-health`,
          empName: emp.name,
          empIdNumber: emp.idNumber || '-',
          docType: 'الشهادة الصحية',
          expiryDate: emp.healthEnd,
          daysDiff: diff
        });
      }
    }
    if (emp.iqamaEnd && emp.iqamaEnd !== '-') {
      const diff = getDaysDiff(emp.iqamaEnd);
      if (diff !== null) {
        documentAlerts.push({
          id: `${emp.id}-iqama`,
          empName: emp.name,
          empIdNumber: emp.idNumber || '-',
          docType: 'الإقامة',
          expiryDate: emp.iqamaEnd,
          daysDiff: diff
        });
      }
    }
  });

  documentAlerts.sort((a, b) => a.daysDiff - b.daysDiff);
  const urgentAlertsCount = documentAlerts.filter(a => a.daysDiff <= 30).length;

  const filteredAlerts = documentAlerts.filter(a =>
    safeLower(a.empName).includes(safeLower(hrAlertsSearchQuery)) ||
    safeLower(a.empIdNumber || '').includes(safeLower(hrAlertsSearchQuery))
  );

  const lowStockItems = inventory.filter(i => {
    const boxSize = Number(i.boxSize || 12);
    if (lowStockUnit === 'كرتون') {
      const availableCartons = i.stock / boxSize;
      return availableCartons <= lowStockThreshold;
    }
    return i.stock <= lowStockThreshold;
  });

  const todayMakkahString = getMakkahDateString();
  const todayInvoices = invoices.filter(inv => {
    if (!inv.createdAt) return false;
    return getMakkahDateString(new Date(inv.createdAt)) === todayMakkahString;
  });
  const todaySalesVal = todayInvoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);

  // إرسال رسالة الواتساب وفق لغة النظام وتتضمن معلومات الفاتورة وتاريخ الاستحقاق
  const handleSendWhatsAppReminder = (inv) => {
    let phone = (inv?.customer?.phone || '').replace(/[^0-9]/g, '');
    if (phone.startsWith('05')) phone = '966' + phone.slice(1);
    else if (phone.startsWith('5')) phone = '966' + phone;

    const isAr = lang === 'ar';
    const clientName = inv?.customer?.name || (isAr ? 'عميل' : 'Customer');
    const dueDate = inv?.dueDate || (isAr ? 'غير محدد' : 'Not specified');
    
    let text = '';
    const isPartial = inv?.paymentStatus === 'مدفوعة جزئياً';

    if (isAr) {
      if (isPartial) {
        text = `أهلاً بك ${clientName}\nرقم الفاتورة: #${inv?.invoiceNo}\nالإجمالي النهائي: ${inv?.totalAmount} ر.س\nالمبلغ المسدد: ${inv?.paidAmount || 0} ر.س\nالمبلغ المتبقي: ${inv?.remainingAmount || 0} ر.س\nتاريخ الاستحقاق: ${dueDate}\nنود تذكيركم بسداد المبلغ المتبقي.\nشكراً لتعاملك معنا في نظام محور.`;
      } else {
        text = `أهلاً بك ${clientName}\nرقم الفاتورة: #${inv?.invoiceNo}\nالإجمالي النهائي: ${inv?.totalAmount} ر.س\nتاريخ الاستحقاق: ${dueDate}\nنود تذكيركم بسداد المبلغ المستحق.\nشكراً لتعاملك معنا في نظام محور.`;
      }
    } else {
      if (isPartial) {
        text = `Hello ${clientName}\nInvoice Number: #${inv?.invoiceNo}\nTotal Invoice: ${inv?.totalAmount} SAR\nPaid Amount: ${inv?.paidAmount || 0} SAR\nRemaining Due: ${inv?.remainingAmount || 0} SAR\nDue Date: ${dueDate}\nKindly settle the pending payment.\nThank you for your business with Mihwar ERP.`;
      } else {
        text = `Hello ${clientName}\nInvoice Number: #${inv?.invoiceNo}\nTotal Amount Due: ${inv?.totalAmount} SAR\nDue Date: ${dueDate}\nKindly settle the pending payment.\nThank you for your business with Mihwar ERP.`;
      }
    }

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const empFormReset = () => {
    setEmpName(''); setEmpIdNumber(''); setEmpNumber(''); setEmpRole(''); setEmpDept(''); setEmpPhone(''); setEmpSalary(''); setEmpVacations(''); setEmpInsurance(''); setEmpIqamaEnd(''); setEmpHealthEnd(''); setEmpContractEnd(''); setEmpCommission(''); setEmpAllowances(''); setEmpCommissionType(''); setEmpHousingAllowance(''); setEmpTransportAllowance(''); setEmpIncentiveType('حافز مادي'); setEmpIncentiveValue('');
  };


  const handleSaveEmployee = (e) => {
    e.preventDefault();
    if (!empName.trim()) return;
    if (editingEmpId) {
      const updated = employees.map(emp => {
        if (emp.id === editingEmpId) {
          return {
            ...emp,
            name: empName.trim(),
            idNumber: empIdNumber.trim() || emp.idNumber,
            empNo: empNumber.trim() || emp.empNo,
            role: empRole.trim() || emp.role,
            dept: empDept.trim() || emp.dept,
            phone: empPhone.trim() || emp.phone,
            salary: empSalary !== '' ? Number(empSalary) : emp.salary,
            vacations: empVacations !== '' ? Number(empVacations) : emp.vacations,
            insurance: empInsurance.trim() || emp.insurance,
            status: empStatus || emp.status,
            iqamaEnd: empIqamaEnd || emp.iqamaEnd,
            healthEnd: empHealthEnd || emp.healthEnd,
            contractEnd: empContractEnd || emp.contractEnd,
            commission: empCommission !== '' ? Number(empCommission) : (emp.commission || 0),
            commissionType: empCommissionType || emp.commissionType || '',
            allowances: empAllowances !== '' ? Number(empAllowances) : (emp.allowances || 0),
            housingAllowance: empHousingAllowance !== '' ? Number(empHousingAllowance) : (emp.housingAllowance || 0),
            transportAllowance: empTransportAllowance !== '' ? Number(empTransportAllowance) : (emp.transportAllowance || 0),
            incentiveType: empIncentiveType || emp.incentiveType || '???? ????',
            incentives: empIncentiveValue !== '' ? empIncentiveValue : (emp.incentives || '')
          };
        }
        return emp;
      });
      setEmployees(updated);
      localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
    } else {
      const newEmp = {
        id: Date.now(),
        name: empName.trim(),
        idNumber: empIdNumber.trim() || '-',
        empNo: empNumber.trim() || String(employees.length + 1),
        role: empRole.trim() || 'موظف',
        dept: empDept.trim() || 'عام',
        phone: empPhone.trim() || '-',
        salary: Number(empSalary) || 4000,
        deductions: 0,
        vacations: Number(empVacations) || 21,
        insurance: empInsurance.trim() || 'تأمين أساسي',
        status: empStatus || 'نشط',
        iqamaEnd: empIqamaEnd || '-',
        healthEnd: empHealthEnd || '-',
        contractEnd: empContractEnd || '-',
        commission: empCommission !== '' ? Number(empCommission) : 0,
          commissionType: empCommissionType || '',
          allowances: empAllowances !== '' ? Number(empAllowances) : 0,
          housingAllowance: empHousingAllowance !== '' ? Number(empHousingAllowance) : 0,
          transportAllowance: empTransportAllowance !== '' ? Number(empTransportAllowance) : 0,
          incentiveType: empIncentiveType || '???? ????',
          incentives: empIncentiveValue !== '' ? empIncentiveValue : ''
      };
      const updated = [newEmp, ...employees];
      setEmployees(updated);
      localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
    }
    setEmpName(''); setEmpIdNumber(''); setEmpNumber(''); setEmpRole(''); setEmpDept(''); setEmpPhone(''); setEmpSalary(''); setEmpVacations(''); setEmpInsurance(''); setEmpIqamaEnd(''); setEmpHealthEnd(''); setEmpContractEnd(''); setEmpCommission(''); setEmpAllowances(''); setEmpCommissionType(''); setEmpHousingAllowance(''); setEmpTransportAllowance(''); setEmpIncentiveType('حافز مادي'); setEmpIncentiveValue('');
    setEditingEmpId(null);
    setShowAddEmpModal(false);
  };

  const handleOpenEditEmp = (emp) => {
    setEditingEmpId(emp.id);
    setEmpName(emp.name || '');
    setEmpIdNumber(emp.idNumber || '');
    setEmpNumber(emp.empNo || '');
    setEmpRole(emp.role || '');
    setEmpDept(emp.dept || '');
    setEmpPhone(emp.phone || '');
    setEmpSalary(emp.salary || '');
    setEmpVacations(emp.vacations || '');
    setEmpInsurance(emp.insurance || '');
    setEmpStatus(emp.status || 'نشط');
    setEmpIqamaEnd(emp.iqamaEnd || '');
    setEmpHealthEnd(emp.healthEnd || '');
    setEmpContractEnd(emp.contractEnd || '');
    setEmpCommission(emp.commission !== undefined ? emp.commission : '');
      setEmpCommissionType(emp.commissionType || '');
      setEmpAllowances(emp.allowances !== undefined ? emp.allowances : '');
      setEmpHousingAllowance(emp.housingAllowance !== undefined ? emp.housingAllowance : '');
      setEmpTransportAllowance(emp.transportAllowance !== undefined ? emp.transportAllowance : '');
      setEmpIncentiveType(emp.incentiveType || '???? ????');
      setEmpIncentiveValue(emp.incentives !== undefined ? emp.incentives : '');
    setShowAddEmpModal(true);
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

  // === حفظ حافز/مكافأة جديدة ===
  const handleSaveIncentive = (e) => {
    e.preventDefault();
    if (!incSelectedEmpName) return;
    const emp = employees.find(em => em.name === incSelectedEmpName);
    const newRecord = {
      id: Date.now(),
      empName: incSelectedEmpName,
      empRole: emp?.role || '-',
      incentiveType: incIncentiveType,
      incentiveValue: incIncentiveValue,
      commissionType: incCommissionType,
      commissionValue: incCommissionValue ? Number(incCommissionValue) : 0,
      date: new Date().toISOString().slice(0, 10)
    };
    const updated = [newRecord, ...incentiveRecords];
    setIncentiveRecords(updated);
    localStorage.setItem('mihwar_hr_incentives', JSON.stringify(updated));
    setIncSelectedEmpName(''); setIncIncentiveType(''); setIncIncentiveValue(''); setIncCommissionType(''); setIncCommissionValue('');
    setShowIncentiveModal(false);
    alert('✅ تم تسجيل الحافز/المكافأة بنجاح!');
  };

  const handleRemoveIncentive = (recordId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا الحافز؟')) return;
    const updated = incentiveRecords.filter(r => r.id !== recordId);
    setIncentiveRecords(updated);
    localStorage.setItem('mihwar_hr_incentives', JSON.stringify(updated));
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProdId(prod.id); setEditProdName(prod.name || ''); setEditProdPrice(prod.price || ''); setEditProdStock(prod.stock !== undefined ? prod.stock : 0); setEditItemCode(prod.itemCode || ''); setShowEditProdModal(true);
  };

  const handleUpdateProduct = (e) => {
    e.preventDefault();
    if (!editProdName || !editProdPrice) return;
    const updated = inventory.map(item => item.id === editingProdId ? { ...item, name: editProdName, price: Number(editProdPrice), stock: Number(editProdStock), itemCode: editItemCode.trim() || item.itemCode } : item);
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
    setEditingCustId(cust.id); setEditCustName(cust.name || ''); setEditCustNationalId(cust.nationalId || ''); setEditCustPhone(cust.phone || ''); setEditCustEmail(cust.email || ''); setEditCustAddress(cust.address || ''); setEditCustGracePeriod(cust.gracePeriod || ''); setShowEditCustModal(true);
  };

  const handleUpdateCustomer = (e) => {
    e.preventDefault();
    if (!editCustName.trim()) return;
    const updated = customers.map(c => c.id === editingCustId ? { ...c, name: editCustName.trim(), nationalId: editCustNationalId.trim(), phone: editCustPhone.trim(), email: editCustEmail.trim(), address: editCustAddress.trim(), gracePeriod: editCustGracePeriod.trim() } : c);
    setCustomers(updated);
    localStorage.setItem('mihwar_customers', JSON.stringify(updated));
    setShowEditCustModal(false);
    setEditingCustId(null);
    alert('✅ تم تحديث بيانات العميل بنجاح!');
  };

  const handleDeleteCustomer = (custId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا العميل؟')) return;
    const updated = customers.filter(c => c.id !== custId);
    setCustomers(updated);
    localStorage.setItem('mihwar_customers', JSON.stringify(updated));
  };

  const handleOpenEditSupplier = (supp) => {
    setEditingSuppId(supp.id); setEditSuppName(supp.name || ''); setEditSuppTaxNumber(supp.taxNumber || ''); setEditSuppPhone(supp.phone || ''); setEditSuppAddress(supp.address || ''); setEditSuppGracePeriod(supp.gracePeriod || ''); setShowEditSuppModal(true);
  };

  const handleUpdateSupplier = (e) => {
    e.preventDefault();
    if (!editSuppName.trim()) return;
    const updated = suppliers.map(s => s.id === editingSuppId ? { ...s, name: editSuppName.trim(), taxNumber: editSuppTaxNumber.trim(), phone: editSuppPhone.trim(), address: editSuppAddress.trim(), gracePeriod: editSuppGracePeriod.trim() } : s);
    setSuppliers(updated);
    localStorage.setItem('mihwar_suppliers', JSON.stringify(updated));
    setShowEditSuppModal(false);
    setEditingSuppId(null);
    alert('✅ تم تحديث بيانات المورد بنجاح!');
  };

  const handleDeleteSupplier = (suppId) => {
    if (!window.confirm('⚠️ هل أنت متأكد من حذف هذا المورد؟')) return;
    const updated = suppliers.filter(s => s.id !== suppId);
    setSuppliers(updated);
    localStorage.setItem('mihwar_suppliers', JSON.stringify(updated));
  };

  const handleOpenPayConfirm = (invoiceId) => {
    setPayTargetInvoiceId(invoiceId); setPayConfirmMethod('نقد'); setPartialPayAmount(''); setPartialPayMethod('نقد'); setShowPayConfirmModal(true);
  };

  const handleExecutePayment = () => {
    if (!payTargetInvoiceId) return;
    let finalStatus = 'مدفوعة';
    let paidAmt = 0;
    let remAmt = 0;
    let actualMethod = payConfirmMethod;
    
    const invTarget = invoices.find(inv => inv.id === payTargetInvoiceId);
    if (!invTarget) return;

            let currentPaymentAmount = 0;
    if (payConfirmMethod === 'دفع جزء') {
      const total = Number(invTarget?.totalAmount) || 0;
      const newlyPaid = Number(partialPayAmount) || 0;
      
      if (newlyPaid <= 0) { alert('الرجاء إدخال مبلغ صحيح للسداد.'); return; }
      
      const previousPaid = Number(invTarget?.paidAmount) || 0;
      paidAmt = previousPaid + newlyPaid;
      currentPaymentAmount = newlyPaid;
      
      if (paidAmt >= total) {
        finalStatus = 'مدفوعة';
        actualMethod = partialPayMethod;
        paidAmt = total;
        remAmt = 0;
      } else {
        finalStatus = 'مدفوعة جزئياً';
        actualMethod = partialPayMethod;
        remAmt = total - paidAmt;
      }
    } else {
      paidAmt = Number(invTarget?.totalAmount) || 0;
      remAmt = 0;
      currentPaymentAmount = paidAmt - (Number(invTarget?.paidAmount) || 0);
    }

    const updated = invoices.map(inv => {
      if (inv.id === payTargetInvoiceId) {
        localStorage.setItem(`invoice_status_${inv.id}`, finalStatus);
        localStorage.setItem(`invoice_method_${inv.id}`, actualMethod);
        
        const now = new Date();
        const dateString = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        const newPaymentRecord = {
          amount: currentPaymentAmount,
          date: dateString,
          method: actualMethod,
          remaining: remAmt
        };

        const currentPayments = Array.isArray(inv.payments) ? [...inv.payments] : [];
        currentPayments.push(newPaymentRecord);

        if (finalStatus === 'مدفوعة') {
          localStorage.removeItem(`invoice_duedate_${inv.id}`);
          return { ...inv, paymentStatus: finalStatus, paymentMethod: actualMethod, paidAmount: paidAmt, remainingAmount: 0, dueDate: '', payments: currentPayments };
        } else {
          return { ...inv, paymentStatus: finalStatus, paymentMethod: actualMethod, paidAmount: paidAmt, remainingAmount: remAmt, payments: currentPayments };
        }
      }
      return inv;
    });
    setInvoices(updated);
    localStorage.setItem('mihwar_invoices', JSON.stringify(updated));
    setShowPayConfirmModal(false);
    alert(`✅ تم تأكيد السداد بتحويل الفاتورة إلى ${finalStatus}!`);
  };

  const handleAddItemToSalesCart = () => {
    if (!selectedProductId) return;
    const product = inventory.find(p => p.id === Number(selectedProductId));
    if (!product) return;
    const qty = Number(itemQty);
    if (qty <= 0) return;
    const price = itemPrice !== '' && !isNaN(Number(itemPrice)) ? Number(itemPrice) : product.price;

    const existing = cartItems.find(it => it.productId === product.id && it.unitPrice === price && it.unitType === salesUnitType);
    const reqQ = (existing ? existing.quantity : 0) + qty;
    const multiplier = salesUnitType === 'كرتون' ? (product.boxSize || 12) : 1;
    const totalPiecesReq = reqQ * multiplier;

    if (totalPiecesReq > product.stock) { 
      alert('الكمية المطلوبة تتجاوز الرصيد المتوفر في المخزون!'); 
      return; 
    }

    if (existing) {
      setCartItems(cartItems.map(it => (it.productId === product.id && it.unitPrice === price && it.unitType === salesUnitType) ? { ...it, quantity: reqQ, subtotal: Number((reqQ * price).toFixed(2)) } : it));
    } else {
      setCartItems([...cartItems, { productId: product.id, name: product.name, unitType: salesUnitType, quantity: qty, unitPrice: price, subtotal: Number((qty * price).toFixed(2)) }]);
    }
    setSelectedProductId(''); setItemQty(1); setItemPrice(''); setSalesUnitType('قطعة');
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

      const updatedInventory = inventory.map(prod => {
        const matchingItems = cartItems.filter(item => item.productId === prod.id);
        if (matchingItems.length > 0) {
          const totalSoldPieces = matchingItems.reduce((sum, item) => {
            const multiplier = item.unitType === 'كرتون' ? (prod.boxSize || 12) : 1;
            return sum + (item.quantity * multiplier);
          }, 0);
          return { ...prod, stock: Math.max(0, prod.stock - totalSoldPieces) };
        }
        return prod;
      });
      setInventory(updatedInventory);
      localStorage.setItem('mihwar_inventory', JSON.stringify(updatedInventory));

      const newInv = {
        id: Date.now(),
        invoiceNo: Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
        customer: customers.find(c => c.id === Number(selectedCustomerId)) || null,
        items: cartItems.map(it => ({ product: { name: it.name }, unitType: it.unitType, quantity: it.quantity, unitPrice: it.unitPrice, subtotal: it.subtotal })),
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

      const updatedInventory = inventory.map(prod => {
        const cartMatch = cartItems.find(item => item.productId === prod.id);
        if (cartMatch) {
          return { ...prod, stock: Math.max(0, prod.stock - cartMatch.quantity) };
        }
        return prod;
      });
      setInventory(updatedInventory);
      localStorage.setItem('mihwar_inventory', JSON.stringify(updatedInventory));

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
    if (!selectedPurchaseProdId || !purchaseQty) {
      alert('يرجى اختيار المنتج والكمية الموردة');
      return;
    }

    const qty = Number(purchaseQty);
    const prodId = Number(selectedPurchaseProdId);
    const targetProd = inventory.find(p => p.id === prodId);

    let addedPieces = qty;
    if (purchaseUnitType === 'كرتون') {
      const pPerCarton = Number(piecesPerCartonInput) || 12;
      addedPieces = qty * pPerCarton;
    }

    const updatedInventory = inventory.map(item => {
      if (item.id === prodId) {
        return { ...item, stock: Number(item.stock || 0) + addedPieces };
      }
      return item;
    });

    setInventory(updatedInventory);
    localStorage.setItem('mihwar_inventory', JSON.stringify(updatedInventory));

    const pCost = purchasePieceCost !== '' ? Number(purchasePieceCost) : 0;
    const bCost = purchaseBoxCost !== '' ? Number(purchaseBoxCost) : 0;

    const newPurchaseInvoice = {
      id: Date.now(),
      invoiceNo: Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString(),
      supplier: suppliers.find(s => s.id === Number(selectedSupplierId)) || null,
      productId: prodId,
      productName: targetProd ? targetProd.name : '',
      unitType: purchaseUnitType,
      quantity: qty,
      piecesPerCarton: purchaseUnitType === 'كرتون' ? piecesPerCartonInput : null,
      weightOption: unitGramOrKilo,
      weightNote: unitGramOrKilo !== 'لا يوجد' ? weightInputValue : '',
      pieceCost: pCost,
      boxCost: bCost,
      totalAmount: Number((purchaseUnitType === 'كرتون' ? qty * bCost : qty * pCost).toFixed(2))
    };

    const updatedPurchases = [newPurchaseInvoice, ...purchaseInvoices];
    setPurchaseInvoices(updatedPurchases);
    localStorage.setItem('mihwar_purchases', JSON.stringify(updatedPurchases));

    try {
      await API.post('/api/purchases', {
        productId: prodId,
        quantity: addedPieces,
        unitCost: pCost,
        supplierId: selectedSupplierId ? Number(selectedSupplierId) : null
      });
    } catch (e) {}

    setSelectedPurchaseProdId(''); setPurchasePieceCost(''); setPurchaseBoxCost(''); setWeightInputValue(''); setUnitGramOrKilo('لا يوجد');
    setPrintingPurchaseInvoice(newPurchaseInvoice);
    setActiveTab('purchaseInvoicesList');
  };

  const handleExportPurchaseInvoices = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_فواتير_الشراء' : 'Purchase_Invoices_Report';
    const headers = isAr ? ['رقم الفاتورة', 'المورد', 'المنتج', 'وحدة التوريد', 'الكمية', 'الإجمالي (ر.س)', 'التاريخ'] : ['Invoice No', 'Supplier', 'Product', 'Unit Type', 'Quantity', 'Total (SAR)', 'Date'];
    const rows = filteredPurchaseInvoices.map(pi => [
      `#${pi.invoiceNo || pi.id}`,
      pi.supplier?.name || (isAr ? 'توريد نقدي مباشر' : 'Direct Cash Supply'),
      pi.productName,
      pi.unitType || 'قطعة',
      pi.quantity,
      Number(pi.totalAmount || 0).toFixed(2),
      new Date(pi.createdAt).toLocaleDateString('en-CA')
    ]);
    exportToExcel(title, headers, rows, lang);
  };

  const cartSubtotal = cartItems.reduce((sum, it) => sum + it.subtotal, 0);
  const cartTax = cartSubtotal * 0.15;
  const cartGrandTotal = cartSubtotal + cartTax;

  const inventoryVal = inventory.reduce((sum, i) => sum + (Number(i.price) * i.stock), 0);
  const totalSalesVal = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0);
  const totalPurchasesVal = purchaseInvoices.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  const netProfitVal = totalSalesVal - totalPurchasesVal;
  
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
    const newCust = { id: Date.now(), name: custName.trim(), nationalId: custNationalId.trim(), phone: custPhone.trim(), email: custEmail.trim(), address: custAddress.trim(), gracePeriod: custGracePeriod.trim() };
    const updated = [newCust, ...customers];
    setCustomers(updated);
    localStorage.setItem('mihwar_customers', JSON.stringify(updated));
    setCustName(''); setCustNationalId(''); setCustPhone(''); setCustEmail(''); setCustAddress(''); setCustGracePeriod('');
  };

  const handleAddSupplier = (e) => {
    e.preventDefault();
    if (!suppName.trim()) return;
    const newSupp = { id: Date.now(), name: suppName.trim(), taxNumber: suppTaxNumber.trim(), phone: suppPhone.trim(), address: suppAddress.trim(), gracePeriod: suppGracePeriod.trim() };
    const updated = [newSupp, ...suppliers];
    setSuppliers(updated);
    localStorage.setItem('mihwar_suppliers', JSON.stringify(updated));
    setSuppName(''); setSuppTaxNumber(''); setSuppPhone(''); setSuppAddress(''); setSuppGracePeriod('');
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const newProd = { id: Date.now(), name: newProdName, price: Number(newProdPrice), stock: Number(newProdStock || 0), boxSize: 12, itemCode: newItemCode.trim() || 'SKU-' + Math.floor(100 + Math.random() * 900) };
    const updated = [newProd, ...inventory];
    setInventory(updated);
    localStorage.setItem('mihwar_inventory', JSON.stringify(updated));
    setNewProdName(''); setNewProdPrice(''); setNewProdStock(''); setNewItemCode('');
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setCompanyLogo(base64String);
        localStorage.setItem('mihwar_company_logo', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mihwar_user');
    localStorage.removeItem('mihwar_token');
    if (API.defaults) delete API.defaults.headers.common['Authorization'];
    setShowLanding(false);
    setAuthMode('login');
    setAuthEmail('');
    setAuthPassword('');
    setAuthPhone('');
    setAuthCompanyName('');
  };

  const handleDeleteAccountPermanently = () => {
    const confirmed = window.confirm('⚠️ تحذير نهائي: هل أنت متأكد تماماً من رغبتك في حذف الحساب ومسح جميع البيانات بشكل نهائي؟\n\nسيتم مسح كافة البيانات ولن يمكن استرجاعها، ولكن يمكنك فتح حساب جديد بنفس البريد لاحقاً.');
    if (!confirmed) return;

    const currentEmail = user?.email?.trim().toLowerCase();
    const accounts = getRegisteredAccounts();
    const remainingAccounts = accounts.filter(a => a.email !== currentEmail);

    localStorage.removeItem('mihwar_user');
    localStorage.removeItem('mihwar_token');
    localStorage.removeItem('mihwar_business_name');
    localStorage.removeItem('mihwar_company_logo');
    localStorage.removeItem('mihwar_company_address');
    localStorage.removeItem('mihwar_invoice_logo_size');
    localStorage.setItem('mihwar_registered_accounts', JSON.stringify(remainingAccounts));
    localStorage.setItem('mihwar_inventory', JSON.stringify([]));
    localStorage.setItem('mihwar_customers', JSON.stringify([]));
    localStorage.setItem('mihwar_suppliers', JSON.stringify([]));
    localStorage.setItem('mihwar_invoices', JSON.stringify([]));
    localStorage.setItem('mihwar_purchases', JSON.stringify([]));
    localStorage.setItem('mihwar_hr_employees', JSON.stringify([]));
    localStorage.setItem('mihwar_hr_deductions', JSON.stringify([]));

    setUser(null);
    if (API.defaults) delete API.defaults.headers.common['Authorization'];
    setBusinessName('نظام محور');
    setCompanyAddress('المملكة العربية السعودية - جدة');
    setCompanyLogo('');
    setInvoiceLogoSize(110);
    setInventory([]);
    setCustomers([]);
    setSuppliers([]);
    setInvoices([]);
    setPurchaseInvoices([]);
    setEmployees([]);
    setDeductionsList([]);
    setAuthEmail('');
    setAuthPassword('');
    setAuthPhone('');
    setAuthCompanyName('');
    setShowLanding(false);
    setAuthMode('register');

    alert('✅ تم حذف الحساب وجميع البيانات نهائياً! يمكنك الآن فتح حساب جديد في أي وقت بنفس البريد أو ببريد مختلف.');
  };

  const handleTriggerOtp = (e) => {
    e.preventDefault();
    
    if (authMode === 'register') {
      if (!authEmail || !authPassword || !authPhone || !authCompanyName) {
        alert('❌ يرجى تعبئة الحقول الأربعة المطلوبة لفتح الحساب!');
        return;
      }
    } else {
      if (!authEmail || !authPassword || !authPhone) {
        alert('❌ يرجى إدخال البريد الإلكتروني، كلمة المرور، ورقم الهاتف!');
        return;
      }

      const accounts = getRegisteredAccounts();
      const account = accounts.find(a => a.email === authEmail.trim().toLowerCase());
      if (!account) {
        alert('❌ هذا الحساب غير موجود أو تم حذفه نهائياً!\nيرجى الانتقال لتبويب "فتح حساب" لإنشاء الحساب.');
        setAuthMode('register');
        return;
      }
      if (account.password && authPassword !== account.password) {
        alert('❌ كلمة المرور غير صحيحة!');
        return;
      }
    }

    setPendingAuthData({
      email: authEmail,
      password: authPassword,
      phone: authPhone,
      businessName: authCompanyName || 'نظام محور'
    });

    setIsSendingOtp(true);

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);

    const templateParams = {
      email: authEmail,
      to_email: authEmail,
      "البريد الإلكتروني": authEmail,
      passcode: randomOtp,
      otp: randomOtp,
      "رمز المرور": randomOtp,
      time: '15 دقيقة',
      "وقت": '15 دقيقة'
    };

    const SERVICE_ID = 'service_wlj45av';
    const TEMPLATE_ID = 'template_foajm36';
    const PUBLIC_KEY = 'H5wice2-sjrNZHBQX';

    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
      .then((response) => {
        setIsSendingOtp(false);
        setShowOtpModal(true);
        console.log('SUCCESS!', response.status, response.text);
        alert('✅ تم إرسال رمز التحقق الحقيقي بنجاح إلى بريدك الإلكتروني!');
      })
      .catch((error) => {
        setIsSendingOtp(false);
        console.error('EmailJS Error Object:', error);
        const errorMessage = error?.text || error?.message || JSON.stringify(error);
        alert(`❌ فشل إرسال البريد الإلكتروني.\nالسبب: ${errorMessage}`);
      });
  };

  const handleVerifyOtpAndProceed = (e) => {
    e.preventDefault();
    
    if (enteredOtp.trim() === generatedOtp.trim()) {
      setShowOtpModal(false);
      setEnteredOtp('');

      if (authMode === 'register') {
        const accounts = getRegisteredAccounts();
        const cleanEmail = pendingAuthData.email.trim().toLowerCase();
        const newAccount = {
          email: cleanEmail,
          password: pendingAuthData.password,
          phone: pendingAuthData.phone,
          businessName: pendingAuthData.businessName
        };
        const updatedAccounts = accounts.filter(a => a.email !== cleanEmail);
        updatedAccounts.push(newAccount);
        localStorage.setItem('mihwar_registered_accounts', JSON.stringify(updatedAccounts));
        localStorage.setItem('mihwar_business_name', newAccount.businessName);

        localStorage.setItem('mihwar_inventory', JSON.stringify([]));
        localStorage.setItem('mihwar_customers', JSON.stringify([]));
        localStorage.setItem('mihwar_suppliers', JSON.stringify([]));
        localStorage.setItem('mihwar_invoices', JSON.stringify([]));
        localStorage.setItem('mihwar_purchases', JSON.stringify([]));
        localStorage.setItem('mihwar_hr_employees', JSON.stringify([]));
        localStorage.setItem('mihwar_hr_deductions', JSON.stringify([]));

        setInventory([]);
        setCustomers([]);
        setSuppliers([]);
        setInvoices([]);
        setPurchaseInvoices([]);
        setEmployees([]);
        setDeductionsList([]);
        setBusinessName(newAccount.businessName);

        const loggedUser = { 
          name: newAccount.businessName, 
          email: newAccount.email, 
          role: 'admin', 
          businessName: newAccount.businessName 
        };
        setUser(loggedUser);
        localStorage.setItem('mihwar_user', JSON.stringify(loggedUser));
        alert('✅ تم فتح الحساب وتفعيله بنجاح! تم تسجيل دخولك مباشرة.');
      } else {
        const accounts = getRegisteredAccounts();
        const account = accounts.find(a => a.email === pendingAuthData.email.trim().toLowerCase());
        const bName = (account && account.businessName) || pendingAuthData.businessName || 'نظام محور';
        
        const loggedUser = { 
          name: bName, 
          email: pendingAuthData.email, 
          role: loginType, 
          businessName: bName 
        };
        setUser(loggedUser);
        setBusinessName(bName);
        localStorage.setItem('mihwar_user', JSON.stringify(loggedUser));
        alert('✅ تم تسجيل الدخول بنجاح!');
      }
    } else {
      alert('❌ رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleExportSales = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_المبيعات_الضريبية' : 'Tax_Sales_Report';
    const headers = isAr ? 
      ['رقم الفاتورة', 'العميل المستلم', 'تاريخ الإصدار', 'المبلغ الخاضع للضريبة (ر.س)', 'ضريبة القيمة المضافة 15% (ر.س)', 'إجمالي الفاتورة (ر.س)', 'المبلغ المدفوع (ر.س)', 'المبلغ المتبقي (ر.س)', 'حالة الدفع', 'طريقة الدفع', 'مدة الاستحقاق'] : 
      ['Invoice Number', 'Client / Buyer', 'Issue Date', 'Taxable Amount (SAR)', 'VAT 15% (SAR)', 'Total Amount Due (SAR)', 'Paid Amount (SAR)', 'Remaining Amount (SAR)', 'Payment Status', 'Payment Method', 'Due Date'];
    
    const rows = filteredInvoices.map(inv => {
      const status = inv?.paymentStatus || 'مدفوعة';
      const total = Number(inv?.totalAmount) || 0;
      let paid = 0;
      let rem = 0;

      if (status === 'مدفوعة') {
        paid = total;
        rem = 0;
      } else if (status === 'غير مدفوعة') {
        paid = 0;
        rem = total;
      } else if (status === 'مدفوعة جزئياً') {
        paid = Number(inv?.paidAmount) || 0;
        rem = Number(inv?.remainingAmount) || 0;
      }

      return [
        inv?.invoiceNo || '-', 
        inv?.customer?.name || (isAr ? 'عميل نقدي عام' : 'General Cash Customer'), 
        inv?.createdAt ? new Date(inv.createdAt).toISOString().slice(0, 10) : '-',
        Number(inv?.subtotal || 0).toFixed(2), 
        Number(inv?.taxAmount || 0).toFixed(2), 
        total.toFixed(2),
        paid.toFixed(2),
        rem.toFixed(2),
        status, 
        inv?.paymentMethod || 'نقد', 
        inv?.dueDate || '-'
      ];
    });
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportInventory = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'تقرير_جرد_المستودع_الحي' : 'Live_Inventory_Audit_Report';
    const headers = isAr ? ['رقم الصنف', 'اسم المنتج', 'المخزون بالحبة', 'المخزون بالكرتون', 'سعر البيع'] : ['Item Code', 'Product Name', 'Stock (Pieces)', 'Stock (Cartons)', 'Sale Price'];
    const rows = filteredInventory.map(i => {
      const boxSize = Number(i.boxSize || 12);
      const cartons = (i.stock / boxSize).toFixed(1);
      return [i.itemCode || 'SKU-001', i.name, `${i.stock} حبة`, `${cartons} كرتون`, Number(i.price).toFixed(2)];
    });
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportCustomers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_العملاء' : 'Clients_Directory';
    const headers = isAr ? ['الاسم', 'الهوية / السجل', 'الهاتف', 'البريد الإلكتروني', 'العنوان', 'فترة السماح'] : ['Name', 'ID', 'Phone', 'Email', 'Address', 'Grace Period'];
    const rows = filteredCustomers.map(c => [c.name, c.nationalId || '-', c.phone || '-', c.email || '-', c.address || '-', c.gracePeriod || '-']);
    exportToExcel(title, headers, rows, lang);
  };

  const handleExportSuppliers = () => {
    const isAr = lang === 'ar';
    const title = isAr ? 'دليل_الموردين' : 'Suppliers_Directory';
    const headers = isAr ? ['اسم المورد', 'الرقم الضريبي', 'الهاتف', 'العنوان', 'فترة السماح'] : ['Supplier Name', 'Tax No', 'Phone', 'Address', 'Grace Period'];
    const rows = filteredSuppliers.map(s => [s.name, s.taxNumber || '-', s.phone || '-', s.address || '-', s.gracePeriod || '-']);
    exportToExcel(title, headers, rows, lang);
  };

  // عدد الفواتير المستحقة خلال 3 أيام وغير مدفوعة
  const dueSoonInvoicesCount = invoices.filter(inv => {
    try {
      const isUnpaid = inv?.paymentStatus === 'غير مدفوعة';
      const daysLeft = getDueDateDaysLeft(inv?.dueDate);
      return isUnpaid && daysLeft !== null && daysLeft <= 3;
    } catch {
      return false;
    }
  }).length;

  if (!user && showLanding) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, Tahoma, sans-serif', background: '#141824', minHeight: '100vh', color: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <header style={{ background: '#1b2230', borderBottom: '1px solid #263147', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '2px' }} />
            ) : (
              <div style={{ background: '#d97706', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontWeight: '900', fontSize: '14px' }}>مح</div>
            )}
            <span style={{ fontWeight: '900', color: '#f8fafc', fontSize: '18px' }}>نظام محور</span>
          </div>
          <button onClick={() => { setShowLanding(false); setAuthMode('register'); }} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {t.enterAppBtn}
          </button>
        </header>
        <main style={{ padding: '80px 20px', maxWidth: '1100px', margin: 'auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '44px', fontWeight: '900', margin: '0 0 20px 0', color: '#f8fafc' }}>نظام إدارة الموارد المؤسسية</h1>
          <p style={{ fontSize: '17px', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 40px auto', lineHeight: '1.7' }}>إدارة متكاملة للمبيعات، المخزون، الحسابات، والموارد البشرية برؤية تقنية متطورة.</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button onClick={() => { setShowLanding(false); setAuthMode('login'); }} style={{ background: '#d97706', color: '#fff', padding: '14px 30px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
              تسجيل الدخول 🔑
            </button>
            <button onClick={() => { setShowLanding(false); setAuthMode('register'); }} style={{ background: '#10b981', color: '#fff', padding: '14px 30px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
              فتح حساب جديد ✨
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'} style={{ fontFamily: 'Cairo, Tahoma, sans-serif', background: '#141824', minHeight: '100vh', color: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '460px', background: '#1b2230', padding: '35px', borderRadius: '20px', border: '1px solid #263147', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h2 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: '900', margin: '0 0 8px 0' }}>{authMode === 'login' ? 'تسجيل الدخول' : 'فتح حساب جديد'}</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>نظام محور ERP - الإدارة المتكاملة</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', background: '#141824', padding: '5px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #263147' }}>
            <button type="button" onClick={() => setAuthMode('login')} style={{ flex: 1, padding: '8px', background: authMode === 'login' ? '#d97706' : 'transparent', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>تسجيل الدخول</button>
            <button type="button" onClick={() => setAuthMode('register')} style={{ flex: 1, padding: '8px', background: authMode === 'register' ? '#d97706' : 'transparent', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>فتح حساب</button>
          </div>

          {authMode === 'login' && (
            <div style={{ background: '#141824', padding: '10px', borderRadius: '10px', border: '1px solid #263147', marginBottom: '15px' }}>
              <label style={{ fontSize: '11px', color: '#d97706', display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اختر صلاحية الدخول:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setLoginType('admin')} style={{ flex: 1, padding: '8px', background: loginType === 'admin' ? '#d97706' : 'transparent', color: '#fff', border: '1px solid #263147', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>مدير النظام الكامل</button>
                <button type="button" onClick={() => setLoginType('cashier')} style={{ flex: 1, padding: '8px', background: loginType === 'cashier' ? '#d97706' : 'transparent', color: '#fff', border: '1px solid #263147', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>كاشير فقط</button>
              </div>
            </div>
          )}

          <form onSubmit={handleTriggerOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {authMode === 'register' ? (
              <>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#94a3b8' }}>1. البريد الإلكتروني *</label>
                  <input type="email" placeholder="name@example.com" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#94a3b8' }}>2. كلمة المرور *</label>
                  <input type="password" placeholder="••••••••" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#94a3b8' }}>3. رقم الهاتف *</label>
                  <input type="text" placeholder="05xxxxxxxx" value={authPhone} onChange={e=>setAuthPhone(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#94a3b8' }}>4. اسم المؤسسة أو الشركة أو المنشأة *</label>
                  <input type="text" placeholder="مثال: مؤسسة مانويل التجارية" value={authCompanyName} onChange={e=>setAuthCompanyName(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#94a3b8' }}>1. البريد الإلكتروني *</label>
                  <input type="email" placeholder="name@example.com" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#94a3b8' }}>2. كلمة المرور *</label>
                  <input type="password" placeholder="••••••••" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#94a3b8' }}>3. رقم الهاتف *</label>
                  <input type="text" placeholder="05xxxxxxxx" value={authPhone} onChange={e=>setAuthPhone(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', border: '1px solid #263147', background: '#141824', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </>
            )}

            <button type="submit" disabled={isSendingOtp} style={{ background: '#d97706', color: '#fff', padding: '13px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', marginTop: '5px' }}>
              {isSendingOtp ? 'جاري الإرسال عبر البريد...' : (authMode === 'login' ? 'متابعة وإرسال رمز التحقق عبر الإيميل 🔐' : 'إرسال رمز التحقق وفتح الحساب 🔐')}
            </button>
          </form>
        </div>

        {/* نافذة التحقق الأمني OTP Modal */}
        {showOtpModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000, padding: '15px' }}>
            <div style={{ background: '#1b2230', color: '#f8fafc', padding: '35px', borderRadius: '20px', maxWidth: '400px', width: '100%', border: '1px solid #d97706', boxSizing: 'border-box', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: '900', color: '#d97706' }}>رمز التحقق الأمني (OTP)</h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px 0', lineHeight: '1.6' }}>
                تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني بنجاح. أدخله أدناه:
              </p>
              
              <form onSubmit={handleVerifyOtpAndProceed} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" maxLength="6" placeholder="------" value={enteredOtp} onChange={e=>setEnteredOtp(e.target.value)} required style={{ padding: '14px', borderRadius: '10px', border: '2px solid #d97706', background: '#141824', color: '#fff', textAlign: 'center', fontSize: '22px', letterSpacing: '6px', fontWeight: 'bold', outline: 'none' }} />
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" style={{ flex: 1, background: '#10b981', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>تأكيد التحقق ✓</button>
                  <button type="button" onClick={() => setShowOtpModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const allTabs = [
    { id: 'dashboard', label: t.dashboard, adminOnly: true, icon: '📊' },
    { id: 'pos', label: t.pos, adminOnly: false, icon: '🛒' },
    { id: 'sales', label: t.sales, adminOnly: false, icon: '🧾' },
    { id: 'invoicesList', label: t.invoicesList, adminOnly: false, icon: '📑' },
    { id: 'purchaseInvoicesList', label: t.purchaseInvoicesList, adminOnly: true, icon: '📥' },
    { id: 'purchases', label: t.purchases, adminOnly: true, icon: '📝' },
    { id: 'customers', label: t.customers, adminOnly: true, icon: '👥' },
    { id: 'suppliers', label: t.suppliers, adminOnly: true, icon: '🏭' },
    { id: 'inventory', label: t.inventory, adminOnly: false, icon: '📦' },
    { id: 'hr', label: t.hr, adminOnly: true, icon: '👔' },
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
            {companyLogo ? (
              <img src={companyLogo} alt="Logo" style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '2px', border: '1px solid #d97706' }} />
            ) : (
              <div style={{ background: '#d97706', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '15px' }}>مح</div>
            )}
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
        <header style={{ background: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: '16px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: theme.textDark }}>{availableTabs.find(t => t.id === activeTab)?.icon} {availableTabs.find(t => t.id === activeTab)?.label}</span>
          </div>
        </header>

        <main style={{ padding: '30px', flex: 1, boxSizing: 'border-box' }}>

          {/* TAB 1: Dashboard */}
          {activeTab === 'dashboard' && user.role !== 'cashier' && (
            <DashboardTab
              user={user} t={t} theme={theme} isDark={isDark} lang={lang}
              inventoryVal={inventoryVal} totalSalesVal={totalSalesVal}
              totalPurchasesVal={totalPurchasesVal} netProfitVal={netProfitVal}
              todaySalesVal={todaySalesVal} todayInvoices={todayInvoices}
              lowStockItems={lowStockItems} lowStockThreshold={lowStockThreshold}
              setLowStockThreshold={setLowStockThreshold}
              lowStockUnit={lowStockUnit} setLowStockUnit={setLowStockUnit}
              monthlyData={monthlyData} pastYearsData={pastYearsData}
              currentYear={currentYear}
            />
          )}

          {/* TAB 2: POS */}
          {activeTab === 'pos' && (
            <PosTab
              t={t} theme={theme} isDark={isDark} lang={lang}
              inventory={inventory} cartItems={cartItems} setCartItems={setCartItems}
              posCustomerSearch={posCustomerSearch} setPosCustomerSearch={setPosCustomerSearch}
              posSelectedCustomerId={posSelectedCustomerId} setPosSelectedCustomerId={setPosSelectedCustomerId}
              filteredCustomersForPos={filteredCustomersForPos}
              showPosPayModal={showPosPayModal} setShowPosPayModal={setShowPosPayModal}
              posPaymentMethod={posPaymentMethod} setPosPaymentMethod={setPosPaymentMethod}
              handleSavePosInvoice={handleSavePosInvoice} isSubmittingSale={isSubmittingSale}
              cartGrandTotal={cartGrandTotal}
            />
          )}

          {/* TAB 3: Sales */}
          {activeTab === 'sales' && (
            <SalesBillingTab
              t={t} theme={theme} isDark={isDark} lang={lang}
              inventory={inventory} cartItems={cartItems}
              salesCustomerSearch={salesCustomerSearch} setSalesCustomerSearch={setSalesCustomerSearch}
              selectedCustomerId={selectedCustomerId} setSelectedCustomerId={setSelectedCustomerId}
              filteredCustomersForSales={filteredCustomersForSales}
              selectedProductId={selectedProductId} setSelectedProductId={setSelectedProductId}
              salesUnitType={salesUnitType} setSalesUnitType={setSalesUnitType}
              itemQty={itemQty} setItemQty={setItemQty}
              itemPrice={itemPrice} setItemPrice={setItemPrice}
              invoiceStatus={invoiceStatus} setInvoiceStatus={setInvoiceStatus}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              dueDateInput={dueDateInput} setDueDateInput={setDueDateInput}
              handleAddItemToSalesCart={handleAddItemToSalesCart}
              handleRemoveSalesCartItem={handleRemoveSalesCartItem}
              handleSaveSalesInvoice={handleSaveSalesInvoice}
              isSubmittingSale={isSubmittingSale}
              cartSubtotal={cartSubtotal} cartTax={cartTax} cartGrandTotal={cartGrandTotal}
            />
          )}

          {/* TAB 4: InvoicesList */}
          {activeTab === 'invoicesList' && (
            <InvoicesListTab
              t={t} theme={theme} isDark={isDark} lang={lang}
              filteredInvoices={filteredInvoices}
              invoiceSearchQuery={invoiceSearchQuery} setInvoiceSearchQuery={setInvoiceSearchQuery}
              handleExportSales={handleExportSales}
              setPrintingInvoice={setPrintingInvoice}
              handleOpenPayConfirm={handleOpenPayConfirm}
              handleSendWhatsAppReminder={handleSendWhatsAppReminder}
              dueSoonInvoicesCount={dueSoonInvoicesCount}
              getDueDateDaysLeft={getDueDateDaysLeft}
            />
          )}

          {/* TAB 5: PurchaseInvoicesList */}
          {activeTab === 'purchaseInvoicesList' && user.role !== 'cashier' && (
            <PurchaseInvoicesListTab
              t={t} theme={theme} isDark={isDark} lang={lang} user={user}
              filteredPurchaseInvoices={filteredPurchaseInvoices}
              purchaseInvoicesListSearch={purchaseInvoicesListSearch}
              setPurchaseInvoicesListSearch={setPurchaseInvoicesListSearch}
              handleExportPurchaseInvoices={handleExportPurchaseInvoices}
              setPrintingPurchaseInvoice={setPrintingPurchaseInvoice}
            />
          )}

          {/* TAB 6: Purchases */}
          {activeTab === 'purchases' && user.role !== 'cashier' && (
            <PurchasesTab
              t={t} theme={theme} isDark={isDark} lang={lang} user={user}
              suppliers={suppliers}
              selectedSupplierId={selectedSupplierId} setSelectedSupplierId={setSelectedSupplierId}
              purchaseProductSearch={purchaseProductSearch} setPurchaseProductSearch={setPurchaseProductSearch}
              filteredProductsForPurchase={filteredProductsForPurchase}
              selectedPurchaseProdId={selectedPurchaseProdId} setSelectedPurchaseProdId={setSelectedPurchaseProdId}
              purchaseUnitType={purchaseUnitType} setPurchaseUnitType={setPurchaseUnitType}
              purchaseQty={purchaseQty} setPurchaseQty={setPurchaseQty}
              piecesPerCartonInput={piecesPerCartonInput} setPiecesPerCartonInput={setPiecesPerCartonInput}
              unitGramOrKilo={unitGramOrKilo} setUnitGramOrKilo={setUnitGramOrKilo}
              weightInputValue={weightInputValue} setWeightInputValue={setWeightInputValue}
              purchasePieceCost={purchasePieceCost} setPurchasePieceCost={setPurchasePieceCost}
              purchaseBoxCost={purchaseBoxCost} setPurchaseBoxCost={setPurchaseBoxCost}
              handleSavePurchase={handleSavePurchase}
            />
          )}

          {/* TAB 7: Customers */}
          {activeTab === 'customers' && user.role !== 'cashier' && (
            <CustomersTab
              t={t} theme={theme} isDark={isDark} lang={lang} user={user}
              filteredCustomers={filteredCustomers}
              customerSearchQuery={customerSearchQuery} setCustomerSearchQuery={setCustomerSearchQuery}
              custName={custName} setCustName={setCustName}
              custNationalId={custNationalId} setCustNationalId={setCustNationalId}
              custPhone={custPhone} setCustPhone={setCustPhone}
              custEmail={custEmail} setCustEmail={setCustEmail}
              custAddress={custAddress} setCustAddress={setCustAddress}
              custGracePeriod={custGracePeriod} setCustGracePeriod={setCustGracePeriod}
              handleAddCustomer={handleAddCustomer}
              handleOpenEditCustomer={handleOpenEditCustomer}
              handleDeleteCustomer={handleDeleteCustomer}
              handleExportCustomers={handleExportCustomers}
            />
          )}

          {/* TAB 8: Suppliers */}
          {activeTab === 'suppliers' && user.role !== 'cashier' && (
            <SuppliersTab
              t={t} theme={theme} isDark={isDark} lang={lang} user={user}
              filteredSuppliers={filteredSuppliers}
              supplierSearchQuery={supplierSearchQuery} setSupplierSearchQuery={setSupplierSearchQuery}
              suppName={suppName} setSuppName={setSuppName}
              suppTaxNumber={suppTaxNumber} setSuppTaxNumber={setSuppTaxNumber}
              suppPhone={suppPhone} setSuppPhone={setSuppPhone}
              suppAddress={suppAddress} setSuppAddress={setSuppAddress}
              suppGracePeriod={suppGracePeriod} setSuppGracePeriod={setSuppGracePeriod}
              handleAddSupplier={handleAddSupplier}
              handleOpenEditSupplier={handleOpenEditSupplier}
              handleDeleteSupplier={handleDeleteSupplier}
              handleExportSuppliers={handleExportSuppliers}
            />
          )}

          {/* TAB 9: Inventory */}
          {activeTab === 'inventory' && (
            <InventoryTab
              t={t} theme={theme} isDark={isDark} lang={lang} user={user}
              filteredInventory={filteredInventory}
              inventorySearchQuery={inventorySearchQuery} setInventorySearchQuery={setInventorySearchQuery}
              newProdName={newProdName} setNewProdName={setNewProdName}
              newProdPrice={newProdPrice} setNewProdPrice={setNewProdPrice}
              newProdStock={newProdStock} setNewProdStock={setNewProdStock}
              newItemCode={newItemCode} setNewItemCode={setNewItemCode}
              handleAddProduct={handleAddProduct}
              handleOpenEditProduct={handleOpenEditProduct}
              handleDeleteProduct={handleDeleteProduct}
              handleExportInventory={handleExportInventory}
            />
          )}

          {/* TAB 11: HR */}
          {activeTab === 'hr' && user.role !== 'cashier' && (
            <HrTab
              t={t} theme={theme} isDark={isDark} lang={lang} user={user}
              hrSubTab={hrSubTab} setHrSubTab={setHrSubTab}
              employees={employees}
              filteredEmployees={filteredEmployees}
              filteredDeductions={filteredDeductions}
              filteredAlerts={filteredAlerts}
              documentAlerts={documentAlerts}
              urgentAlertsCount={urgentAlertsCount}
              hrSearchQuery={hrSearchQuery} setHrSearchQuery={setHrSearchQuery}
              hrPayrollSearchQuery={hrPayrollSearchQuery} setHrPayrollSearchQuery={setHrPayrollSearchQuery}
              hrAlertsSearchQuery={hrAlertsSearchQuery} setHrAlertsSearchQuery={setHrAlertsSearchQuery}
              totalPayroll={totalPayroll}
              handleOpenEditEmp={handleOpenEditEmp}
              handleDeleteEmployee={handleDeleteEmployee}
              handleRemoveDeduction={handleRemoveDeduction}
              setShowAddEmpModal={setShowAddEmpModal}
              setShowDeductModal={setShowDeductModal}
              setEditingEmpId={setEditingEmpId}
              empFormReset={empFormReset}
              setShowIncentiveModal={setShowIncentiveModal}
              incentiveRecords={incentiveRecords}
              hrIncentivesSearchQuery={hrIncentivesSearchQuery}
              setHrIncentivesSearchQuery={setHrIncentivesSearchQuery}
              handleRemoveIncentive={handleRemoveIncentive}
            />
          )}

          {/* TAB 12: Settings */}
          {activeTab === 'settings' && (
            <SettingsTab
              t={t} theme={theme} isDark={isDark} lang={lang}
              setIsDark={setIsDark}
              companyLogo={companyLogo} setCompanyLogo={setCompanyLogo}
              companyAddress={companyAddress} setCompanyAddress={setCompanyAddress}
              invoiceLogoSize={invoiceLogoSize} setInvoiceLogoSize={setInvoiceLogoSize}
              handleLogoFileChange={handleLogoFileChange}
              handleLogout={handleLogout}
              handleDeleteAccountPermanently={handleDeleteAccountPermanently}
            />
          )}

        </main>
      </div>

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
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>البريد الإلكتروني</label><input type="email" value={editCustEmail} onChange={e=>setEditCustEmail(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>العنوان</label><input type="text" value={editCustAddress} onChange={e=>setEditCustAddress(e.target.value)} placeholder="مثال: جدة - حي الروضة" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>فترة السماح</label><input type="text" value={editCustGracePeriod} onChange={e=>setEditCustGracePeriod(e.target.value)} placeholder="مثال: 30 يوم" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
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
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>العنوان</label><input type="text" value={editSuppAddress} onChange={e=>setEditSuppAddress(e.target.value)} placeholder="مثال: جدة - المنطقة الصناعية" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>فترة السماح</label><input type="text" value={editSuppGracePeriod} onChange={e=>setEditSuppGracePeriod(e.target.value)} placeholder="مثال: 15 يوم" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
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
              <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>رقم الصنف</label><input type="text" value={editItemCode} onChange={e=>setEditItemCode(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
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

      {/* نافذة إضافة وتعديل الموظف */}
      {showAddEmpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '720px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
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
                <div><label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t.empVacations}</label><input type="number" value={empVacations} onChange={e=>setEmpVacations(e.target.value)} placeholder="21" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} /></div>
              </div>

              {/* البدلات */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: theme.bgMain, padding: '12px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#10b981' }}>{t(`بدل سكن (ر.س)`)}</label>
                  <input type="number" value={empHousingAllowance} onChange={e=>setEmpHousingAllowance(e.target.value)} placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#10b981' }}>{t(`بدل مواصلات (ر.س)`)}</label>
                  <input type="number" value={empTransportAllowance} onChange={e=>setEmpTransportAllowance(e.target.value)} placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              {/* تواريخ انتهاء الوثائق */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: theme.bgMain, padding: '12px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>انتهاء الإقامة</label>
                  <input type="date" value={empIqamaEnd} onChange={e=>setEmpIqamaEnd(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>انتهاء التأمين الطبي</label>
                  <input type="date" value={empHealthEnd} onChange={e=>setEmpHealthEnd(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>انتهاء العقد الوظيفي</label>
                  <input type="date" value={empContractEnd} onChange={e=>setEmpContractEnd(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none', fontSize: '12px' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{editingEmpId ? t.updateEmp : t.saveEmp}</button>
                <button type="button" onClick={() => setShowAddEmpModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تسجيل خصم على موظف */}
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
                <input type="text" value={hrDeductReason} onChange={e=>setHrDeductReason(e.target.value)} placeholder="مثال: تأخير عن الدوام الرسمي" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} />
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

      {/* نافذة إضافة حافز أو مكافأة */}
      {showIncentiveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '580px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#8b5cf6' }}>{t('إضافة حافز أو مكافأة')}</h3>
              <button onClick={() => setShowIncentiveModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>
            <form onSubmit={handleSaveIncentive} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t('اختر الموظف')}</label>
                <select value={incSelectedEmpName} onChange={e=>setIncSelectedEmpName(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="">{t('-- اختر الموظف من القائمة --')}</option>
                  {employees.map(e => (<option key={e.id} value={e.name}>{e.name} ({t('هوية:')} {e.idNumber})</option>))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#8b5cf6' }}>{t('الحافز')}</label>
                  <input type="text" value={incIncentiveType} onChange={e=>setIncIncentiveType(e.target.value)} placeholder={t('مثال: 100 ر.س')} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#8b5cf6' }}>{t('سبب الحافز')}</label>
                  <input type="text" value={incIncentiveValue} onChange={e=>setIncIncentiveValue(e.target.value)} placeholder={t('مثال: تميز في المبيعات')} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>{t('نوع العمولة')}</label>
                  <select value={incCommissionType} onChange={e=>setIncCommissionType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }}>
                    <option value="">{t('-- بدون عمولة --')}</option>
                    <option value="بالكرتون">{t('بالكرتون')}</option>
                    <option value="بالنسبة">{t('بالنسبة (%)')}</option>
                    <option value="باليوم">{t('باليوم')}</option>
                    <option value="بالساعة">{t('بالساعة')}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>{t('قيمة العمولة')}</label>
                  <input type="number" step="0.1" value={incCommissionValue} onChange={e=>setIncCommissionValue(e.target.value)} placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#8b5cf6', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t('حفظ الحافز')}</button>
                <button type="button" onClick={() => setShowIncentiveModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.closeModal}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Confirm Modal */}
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
                  <option value="دفع جزء">دفع جزء من المبلغ</option>
                </select>
              </div>

              {payConfirmMethod === 'دفع جزء' && (
                <div style={{ background: theme.bgMain, padding: '15px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>المبلغ المطلوب سداده:</label>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textDark }}>
                      {(() => {
                        const inv = invoices.find(i => i.id === payTargetInvoiceId);
                        const remaining = inv?.paymentStatus === 'مدفوعة جزئياً' ? (inv?.remainingAmount || 0) : (inv?.totalAmount || 0);
                        return Number(remaining).toFixed(2);
                      })()} {t.currency}
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>المبلغ المسدد حالياً:</label>
                    <input type="number" step="0.01" value={partialPayAmount} onChange={e => setPartialPayAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>طريقة دفع الجزء:</label>
                    <select value={partialPayMethod} onChange={e => setPartialPayMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }}>
                      <option value="نقد">نقد</option>
                      <option value="شبكة">شبكة</option>
                      <option value="حوالة">حوالة بنكية</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>المتبقي بعد السداد:</label>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>
                      {(() => {
                        const inv = invoices.find(i => i.id === payTargetInvoiceId);
                        const remaining = inv?.paymentStatus === 'مدفوعة جزئياً' ? (inv?.remainingAmount || 0) : (inv?.totalAmount || 0);
                        return Math.max(0, remaining - (Number(partialPayAmount) || 0)).toFixed(2);
                      })()} {t.currency}
                    </div>
                  </div>
                </div>
              )}
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
          <div style={{ background: '#fff', color: '#0f172a', padding: '30px', borderRadius: '16px', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="no-print-zone" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ طباعة الفاتورة / PDF</button>
              </div>
              <button onClick={()=>setPrintingInvoice(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>{t.closeModal}</button>
            </div>

            <div id="zatca-printable-invoice" style={{ background: '#fff', color: '#000', padding: '20px', boxSizing: 'border-box', fontFamily: 'Cairo, Tahoma, sans-serif' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{businessName}</h2>
                  <p style={{ margin: '2px 0', fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>{companyAddress}</p>
                  <p style={{ margin: '2px 0', fontSize: '11px', color: '#94a3b8' }}>سجل تجاري / ضريبي معتمد</p>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {companyLogo ? (
                    <img 
                      src={companyLogo} 
                      alt="Logo" 
                      style={{ 
                        width: `${invoiceLogoSize}px`, 
                        height: `${invoiceLogoSize}px`, 
                        objectFit: 'contain', 
                        display: 'block' 
                      }} 
                    />
                  ) : (
                    <div style={{ width: `${Math.max(60, invoiceLogoSize * 0.7)}px`, height: `${Math.max(60, invoiceLogoSize * 0.7)}px`, borderRadius: '12px', background: '#d97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '26px' }}>مح</div>
                  )}
                </div>

                <div style={{ flex: 1, textAlign: 'left', direction: 'rtl' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#d97706', fontWeight: '900' }}>{t.taxInvoiceTitle}</h3>
                  <p style={{ margin: '3px 0', fontSize: '12.5px' }}><strong>رقم الفاتورة:</strong> <span style={{ direction: 'ltr', display: 'inline-block' }}>INV-{printingInvoice.invoiceNo}</span></p>
                  <p style={{ margin: '3px 0', fontSize: '12.5px' }}><strong>الحالة:</strong> <span style={{ color: printingInvoice.paymentStatus === 'غير مدفوعة' ? '#f43f5e' : '#10b981', fontWeight: 'bold' }}>{printingInvoice.paymentStatus || 'مدفوعة'}</span></p>
                  <p style={{ margin: '3px 0', fontSize: '12.5px' }}><strong>طريقة الدفع:</strong> <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{printingInvoice.paymentMethod || 'نقد'}</span></p>
                  {printingInvoice.dueDate && (<p style={{ margin: '3px 0', fontSize: '12px', color: '#f43f5e' }}><strong>مدة الاستحقاق:</strong> {printingInvoice.dueDate}</p>)}
                  <p style={{ margin: '3px 0', fontSize: '12px', color: '#64748b' }}><strong>تاريخ الإصدار:</strong> {new Date(printingInvoice.createdAt).toLocaleDateString('en-CA')}</p>
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
                      <td style={{ padding: '10px', textAlign: 'center' }}>{it.quantity} {it.unitType ? `(${it.unitType})` : ''}</td>
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '10px 0 0 0', borderTop: '1px solid #cbd5e1', paddingTop: '8px', fontSize: '16px', color: '#0f172a' }}><strong>إجمالي الفاتورة:</strong><strong>{printingInvoice.totalAmount} {t.currency}</strong></div>
                </div>
              </div>

              {/* سجل الدفعات */}
              {printingInvoice.payments && printingInvoice.payments.length > 0 && (
                <div style={{ marginTop: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', background: '#f8fafc' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #cbd5e1', paddingBottom: '5px' }}>سجل الدفعات (Payment History)</h4>
                  <div style={{ fontSize: '12px' }}>
                    {printingInvoice.payments.map((pmt, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i !== printingInvoice.payments.length - 1 ? '1px dashed #cbd5e1' : 'none' }}>
                        <div>
                          <strong>دفعة #{i + 1}:</strong> تم سداد <span style={{ color: '#10b981', fontWeight: 'bold' }}>{pmt?.amount} ر.س</span>
                          <span style={{ color: '#64748b', marginLeft: '10px' }}> (طريقة الدفع: {pmt?.method}) </span>
                        </div>
                        <div style={{ color: '#64748b' }}>بتاريخ: {pmt?.date}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div style={{ marginTop: '12px', borderTop: '2px solid #cbd5e1', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>إجمالي المبالغ المدفوعة:</span>
                      <span style={{ color: '#10b981' }}>{printingInvoice.paidAmount || 0} ر.س</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>المتبقي للتحصيل:</span>
                      {(printingInvoice.remainingAmount || 0) > 0 ? (
                        <span style={{ color: '#ef4444' }}>{printingInvoice.remainingAmount} ر.س</span>
                      ) : (
                        <span style={{ color: '#10b981' }}>خالصة بالكامل ✓</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '11px', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '10px' }}>{t.invoiceFooterNote}</div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Invoice Print Modal */}
      {printingPurchaseInvoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '10px' }}>
          <div style={{ background: '#fff', color: '#0f172a', padding: '30px', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="no-print-zone" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => window.print()} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🖨️ طباعة فاتورة الشراء / PDF</button>
              </div>
              <button onClick={()=>setPrintingPurchaseInvoice(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>إغلاق</button>
            </div>

            <div style={{ background: '#fff', color: '#000', padding: '20px', boxSizing: 'border-box', fontFamily: 'Cairo, Tahoma, sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>{businessName} - قسم التوريد</h2>
                  <p style={{ margin: '3px 0', fontSize: '12px', color: '#64748b' }}>فاتورة شراء بضاعة من مورد</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#d97706' }}>فاتورة شراء</h3>
                  <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>رقم الفاتورة:</strong> PUR-{printingPurchaseInvoice.invoiceNo || printingPurchaseInvoice.id}</p>
                  <p style={{ margin: '2px 0', fontSize: '12px', color: '#64748b' }}><strong>تاريخ التوريد:</strong> {new Date(printingPurchaseInvoice.createdAt).toLocaleDateString('en-CA')}</p>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#0f172a' }}>بيانات المورد:</h4>
                <p style={{ margin: '3px 0' }}><strong>المورد:</strong> {printingPurchaseInvoice.supplier?.name || 'توريد نقدي مباشر'}</p>
                <p style={{ margin: '3px 0' }}><strong>الرقم الضريبي:</strong> {printingPurchaseInvoice.supplier?.taxNumber || '-'}</p>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    <th style={{ padding: '10px', textAlign: 'right' }}>المنتج</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>وحدة التوريد</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>الكمية</th>
                    <th style={{ padding: '10px', textAlign: 'center' }}>الوزن / ملاحظة</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{printingPurchaseInvoice.productName}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{printingPurchaseInvoice.unitType}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{printingPurchaseInvoice.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{printingPurchaseInvoice.weightNote || '-'}</td>
                    <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>{printingPurchaseInvoice.totalAmount} {t.currency}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ textAlign: 'left', fontSize: '15px', fontWeight: 'bold', borderTop: '2px solid #e2e8f0', paddingTop: '15px', color: '#d97706' }}>
                الإجمالي النهائي للتوريد: {printingPurchaseInvoice.totalAmount} {t.currency}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;