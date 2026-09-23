const fs = require('fs');

function revert(file, regex, replacement) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
}

// InvoicesListTab.jsx
revert('frontend/src/components/InvoicesListTab.jsx', /=== t\(`غير مدفوعة`\)/g, "=== 'غير مدفوعة'");
revert('frontend/src/components/InvoicesListTab.jsx', /\|\| t\(`عميل نقدي`\)/g, "|| 'عميل نقدي'");
revert('frontend/src/components/InvoicesListTab.jsx', /\|\| t\(`مدفوعة`\)/g, "|| 'مدفوعة'");

// PosTab.jsx
revert('frontend/src/components/PosTab.jsx', /\|\| t\(`نقدي`\)/g, "|| 'نقدي'");

// PurchaseInvoicesListTab.jsx
revert('frontend/src/components/PurchaseInvoicesListTab.jsx', /\|\| t\(`توريد نقدي مباشر`\)/g, "|| 'توريد نقدي مباشر'");
revert('frontend/src/components/PurchaseInvoicesListTab.jsx', /\|\| t\(`قطعة`\)/g, "|| 'قطعة'");

// PurchasesTab.jsx
revert('frontend/src/components/PurchasesTab.jsx', /=== t\(`كرتون`\)/g, "=== 'كرتون'");
revert('frontend/src/components/PurchasesTab.jsx', /!== t\(`لا يوجد`\)/g, "!== 'لا يوجد'");

// SalesBillingTab.jsx
revert('frontend/src/components/SalesBillingTab.jsx', /=== t\(`مدفوعة`\)/g, "=== 'مدفوعة'");
revert('frontend/src/components/SalesBillingTab.jsx', /setInvoiceStatus\(t\(`مدفوعة`\)\)/g, "setInvoiceStatus('مدفوعة')");
revert('frontend/src/components/SalesBillingTab.jsx', /=== t\(`غير مدفوعة`\)/g, "=== 'غير مدفوعة'");
revert('frontend/src/components/SalesBillingTab.jsx', /setInvoiceStatus\(t\(`غير مدفوعة`\)\)/g, "setInvoiceStatus('غير مدفوعة')");
revert('frontend/src/components/SalesBillingTab.jsx', /\|\| t\(`قطعة`\)/g, "|| 'قطعة'");

console.log('Reverted logic state strings to base Arabic');

