const fs = require('fs');
const file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const handleExportSales = \(\) => \{[\s\S]*?exportToExcel\(title, headers, rows, lang\);\s*\};/;

const replacement = `const handleExportSales = () => {
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
  };`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated handleExportSales.');
} else {
  console.log('Regex failed to match handleExportSales.');
}
