const fs = require('fs');

function fix(file, regex, replacement) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
}

// DashboardTab.jsx
fix('frontend/src/components/DashboardTab.jsx', /\(\{todayInvoices\?\.length \|\| 0\} فواتير تم إصدارها اليوم\)/g, '({todayInvoices?.length || 0} {t(`فواتير تم إصدارها اليوم`)})');
fix('frontend/src/components/DashboardTab.jsx', /`⚠️ تنبيه: يوجد \$\{lowStockItems\.length\} صنف وصل للحد الأدنى للمخزون \(\$\{lowStockThreshold\} \$\{lowStockUnit\} أو أقل\)`/g, '`⚠️ ${t(`تنبيه: يوجد`)} ${lowStockItems.length} ${t(`صنف وصل للحد الأدنى للمخزون`)} (${lowStockThreshold} ${lowStockUnit} ${t(`أو أقل`)})`');
fix('frontend/src/components/DashboardTab.jsx', /\? `\$\{\(item\.stock \/ bSize\)\.toFixed\(1\)\} كرتون` : `\$\{item\.stock\} حبة`/g, '? `${(item.stock / bSize).toFixed(1)} ${t(`كرتون`)}` : `${item.stock} ${t(`حبة`)}`');
fix('frontend/src/components/DashboardTab.jsx', /\{item\.name\} \(المتبقي: \{remainingText\}\)/g, '{item.name} ({t(`المتبقي:`)} {remainingText})');
fix('frontend/src/components/DashboardTab.jsx', /📅 حركة المبيعات الشهرية خلال عام \{currentYear\}/g, '📅 {t(`حركة المبيعات الشهرية خلال عام`)} {currentYear}');
fix('frontend/src/components/DashboardTab.jsx', /\{m\.count\} فواتير/g, '{m.count} {t(`فواتير`)}');
fix('frontend/src/components/DashboardTab.jsx', /عام \{y\.year\}/g, '{t(`عام`)} {y.year}');

// HrTab.jsx
fix('frontend/src/components/HrTab.jsx', /\{employees\.length\} موظف/g, '{employees.length} {t(`موظف`)}');
fix('frontend/src/components/HrTab.jsx', /خصم: \{emp\.deductions\} \{t\.currency\}/g, '{t(`خصم:`)} {emp.deductions} {t.currency}');
fix('frontend/src/components/HrTab.jsx', /عمولة: \$\{emp\.commission\}% /g, '${t(`عمولة:`)} ${emp.commission}% ');
fix('frontend/src/components/HrTab.jsx', /\| بدلات: \$\{emp\.allowances\}/g, '| ${t(`بدلات:`)} ${emp.allowances}');
fix('frontend/src/components/HrTab.jsx', /أجازات: \{emp\.vacations\} يوم/g, '{t(`أجازات:`)} {emp.vacations} {t(`يوم`)}');
fix('frontend/src/components/HrTab.jsx', /إقامة: \{emp\.iqamaEnd\}/g, '{t(`إقامة:`)} {emp.iqamaEnd}');
fix('frontend/src/components/HrTab.jsx', /صحي: \{emp\.healthEnd\}/g, '{t(`صحي:`)} {emp.healthEnd}');
fix('frontend/src/components/HrTab.jsx', /عقد: \{emp\.contractEnd\}/g, '{t(`عقد:`)} {emp.contractEnd}');
fix('frontend/src/components/HrTab.jsx', /\{alert\.docType\} \(هوية: \{alert\.empIdNumber\}\)/g, '{alert.docType} ({t(`هوية:`)} {alert.empIdNumber})');
fix('frontend/src/components/HrTab.jsx', /\? `منتهي منذ \$\{Math\.abs\(alert\.daysDiff\)\} يوم` : `يتبقى \$\{alert\.daysDiff\} يوم`/g, '? `${t(`منتهي منذ`)} ${Math.abs(alert.daysDiff)} ${t(`يوم`)}` : `${t(`يتبقى`)} ${alert.daysDiff} ${t(`يوم`)}`');
fix('frontend/src/components/HrTab.jsx', /\? '✅ جميع وثائق الموظفين \(الإقامة، الشهادة الصحية، العقود\) سارية ومحدثة ولا توجد تنبيهات منتهية!'/g, '? t(`✅ جميع وثائق الموظفين (الإقامة، الشهادة الصحية، العقود) سارية ومحدثة ولا توجد تنبيهات منتهية!`)');
fix('frontend/src/components/HrTab.jsx', /: 'لا توجد نتائج مطابقة للبحث في التنبيهات\.'/g, ': t(`لا توجد نتائج مطابقة للبحث في التنبيهات.`)');

// InventoryTab.jsx
fix('frontend/src/components/InventoryTab.jsx', /\{i\.stock\} حبة/g, '{i.stock} {t(`حبة`)}');
fix('frontend/src/components/InventoryTab.jsx', /\(\{cartons\} كرتون\)/g, '({cartons} {t(`كرتون`)})');

// InvoicesListTab.jsx
fix('frontend/src/components/InvoicesListTab.jsx', /نظام تذكيرات الواتساب: يوجد \{dueSoonInvoicesCount\} فواتير غير مدفوعة ومتبقي على استحقاقها 3 أيام أو أقل\. يمكنك إرسال التذكيرات مباشرة ولن تتوقف حتى تضغط "تم الدفع"\./g, '{t(`نظام تذكيرات الواتساب: يوجد`)} {dueSoonInvoicesCount} {t(`فواتير غير مدفوعة ومتبقي على استحقاقها 3 أيام أو أقل. يمكنك إرسال التذكيرات مباشرة ولن تتوقف حتى تضغط "تم الدفع".`)}');
fix('frontend/src/components/InvoicesListTab.jsx', /=== 'غير مدفوعة'/g, "=== t(`غير مدفوعة`)");
fix('frontend/src/components/InvoicesListTab.jsx', /\|\| 'عميل نقدي'/g, "|| t(`عميل نقدي`)");
fix('frontend/src/components/InvoicesListTab.jsx', /\|\| 'مدفوعة'/g, "|| t(`مدفوعة`)");
fix('frontend/src/components/InvoicesListTab.jsx', /الاستحقاق: \{inv\.dueDate\}/g, "{t(`الاستحقاق:`)} {inv.dueDate}");
fix('frontend/src/components/InvoicesListTab.jsx', /'مستحقة' : `متبقي \$\{daysLeft\} يوم`/g, "t(`مستحقة`) : `${t(`متبقي`)} ${daysLeft} ${t(`يوم`)}`");

// PosTab.jsx
fix('frontend/src/components/PosTab.jsx', /\|\| 'نقدي'/g, "|| t(`نقدي`)");

// PurchaseInvoicesListTab.jsx
fix('frontend/src/components/PurchaseInvoicesListTab.jsx', /\|\| 'توريد نقدي مباشر'/g, "|| t(`توريد نقدي مباشر`)");
fix('frontend/src/components/PurchaseInvoicesListTab.jsx', /\|\| 'قطعة'/g, "|| t(`قطعة`)");

// PurchasesTab.jsx
fix('frontend/src/components/PurchasesTab.jsx', /المتوفر الحالي: \{p\.stock\}/g, "{t(`المتوفر الحالي:`)} {p.stock}");
fix('frontend/src/components/PurchasesTab.jsx', /=== 'كرتون'/g, "=== t(`كرتون`)");
fix('frontend/src/components/PurchasesTab.jsx', /!== 'لا يوجد'/g, "!== t(`لا يوجد`)");

// SalesBillingTab.jsx
fix('frontend/src/components/SalesBillingTab.jsx', /متوفر: \{p\.stock\}/g, "{t(`متوفر:`)} {p.stock}");
fix('frontend/src/components/SalesBillingTab.jsx', /=== 'مدفوعة'/g, "=== t(`مدفوعة`)");
fix('frontend/src/components/SalesBillingTab.jsx', /setInvoiceStatus\('مدفوعة'\)/g, "setInvoiceStatus(t(`مدفوعة`))");
fix('frontend/src/components/SalesBillingTab.jsx', /=== 'غير مدفوعة'/g, "=== t(`غير مدفوعة`)");
fix('frontend/src/components/SalesBillingTab.jsx', /setInvoiceStatus\('غير مدفوعة'\)/g, "setInvoiceStatus(t(`غير مدفوعة`))");
fix('frontend/src/components/SalesBillingTab.jsx', /\|\| 'قطعة'/g, "|| t(`قطعة`)");

// SettingsTab.jsx
fix('frontend/src/components/SettingsTab.jsx', /\{invoiceLogoSize\} بكسل/g, "{invoiceLogoSize} {t(`بكسل`)}");

console.log('Fixed edge cases!');

