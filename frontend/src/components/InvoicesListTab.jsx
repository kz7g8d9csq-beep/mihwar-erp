import React from 'react';

const InvoicesListTab = ({
  t, theme, isDark, lang,
  filteredInvoices = [],
  invoiceSearchQuery, setInvoiceSearchQuery,
  handleExportSales,
  setPrintingInvoice,
  handleOpenPayConfirm,
  handleSendWhatsAppReminder,
  dueSoonInvoicesCount,
  getDueDateDaysLeft
}) => {

  // دالة لتنظيف وتنسيق التاريخ ليظهر: السنة-الشهر-اليوم فقط
  const formatDateOnly = (dateVal) => {
    if (!dateVal || dateVal === '-' || dateVal === 'null' || dateVal === 'undefined') return '-';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) {
        // إذا كان نصاً غير قابل للتحويل، يتم استخراج التاريخ قبل حرف T
        return String(dateVal).split('T')[0].split(' ')[0];
      }
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + day;
    } catch (e) {
      return String(dateVal).split('T')[0];
    }
  };

  // دالة توليد التاريخ والوقت لترويسة التصدير
  const getCleanDateTime = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + min;
  };

  // دالة تصدير الإكسيل المنسقة مع التواريخ المنظمة
  const handleExportInvoicesToExcel = () => {
    const list = filteredInvoices || [];
    if (!list || list.length === 0) {
      alert(typeof t === 'function' ? t('لا توجد فواتير مبيعات للتصدير') : 'لا توجد فواتير مبيعات للتصدير');
      return;
    }

    const systemTitle = 'نظام محور • سجل فواتير المبيعات';
    const exportDate = getCleanDateTime();

    let tableRows = '';
    list.forEach((inv, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const invNo = inv?.invoiceNo || inv?.id || '-';
      const custName = (inv?.customer && inv.customer.name) || inv?.customerName || 'عميل نقدي';
      const custPhone = (inv?.customer && inv.customer.phone) || inv?.phone || '-';
      
      // تنسيق التواريخ بشكل نظيف (السنة-الشهر-اليوم)
      const invDate = formatDateOnly(inv?.date || inv?.createdAt);
      const dueDate = formatDateOnly(inv?.dueDate);
      
      const total = Number(inv?.totalAmount || 0).toFixed(2) + ' ر.س';
      const paid = Number(inv?.paidAmount || (inv?.paymentStatus === 'مدفوعة' ? inv?.totalAmount : 0)).toFixed(2) + ' ر.س';
      const remaining = Number(inv?.remainingAmount || 0).toFixed(2) + ' ر.س';
      const status = inv?.paymentStatus || 'مدفوعة';
      
      const rawReturnDate = inv?.returnDate || (status.includes('استرجاع') || status.includes('مرتجع') ? (inv?.updatedAt || '') : '');
      const returnDate = rawReturnDate ? formatDateOnly(rawReturnDate) : '-';
      
      let statusColor = '#065f46';
      if (status === 'غير مدفوعة') statusColor = '#7f1d1d';
      else if (status === 'مدفوعة جزئياً') statusColor = '#9a3412';
      else if (status.includes('استرجاع') || status.includes('مرتجع')) statusColor = '#d97706';

      const itemsList = (inv?.items || []).map(i => {
        const pName = (i?.product && i.product.name) || i?.productName || i?.name || 'صنف';
        const q = i?.quantity || i?.qty || 1;
        const uType = i?.unitType ? ' (' + i.unitType + ')' : '';
        return pName + uType + ' × ' + q;
      }).join(' - ') || '-';

      tableRows += '<tr style="background-color: ' + bgColor + ';">' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">#' + invNo + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;">' + custName + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + custPhone + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\'; font-weight: bold;">' + invDate + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + dueDate + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;">' + total + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; color: #16a34a;">' + paid + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; color: #ef4444; font-weight: bold;">' + remaining + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: ' + statusColor + ';">' + status + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + returnDate + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">' + itemsList + '</td>' +
      '</tr>';
    });

    const excelTemplate = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head>' +
        '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">' +
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
        '<x:Name>فواتير المبيعات</x:Name>' +
        '<x:WorksheetOptions><x:DisplayRightToLeft/></x:WorksheetOptions>' +
        '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
        '<style>' +
          'body { font-family: Tahoma, Arial, sans-serif; direction: rtl; }' +
          'table { border-collapse: collapse; width: 100%; direction: rtl; }' +
          'th { border: 1px solid #94a3b8; background-color: #e2e8f0; color: #0f172a; padding: 12px; font-weight: bold; text-align: center; font-size: 13px; }' +
          'td { border: 1px solid #cbd5e1; padding: 10px; font-size: 12px; }' +
        '</style>' +
      '</head>' +
      '<body dir="rtl">' +
        '<table>' +
          '<thead>' +
            '<tr>' +
              '<th colspan="11" style="background-color: #1e293b; color: #ffffff; font-size: 18px; padding: 16px; text-align: center; font-weight: bold;">' + systemTitle + '</th>' +
            '</tr>' +
            '<tr>' +
              '<th colspan="11" style="background-color: #334155; color: #e2e8f0; font-size: 12px; padding: 8px; text-align: center;">تاريخ التصدير: ' + exportDate + ' | وثيقة معتمدة ومصدرة آلياً من النظام</th>' +
            '</tr>' +
            '<tr style="background-color: #e2e8f0;">' +
              '<th style="min-width: 130px;">رقم الفاتورة</th>' +
              '<th style="min-width: 180px;">العميل</th>' +
              '<th style="min-width: 140px;">رقم الهاتف</th>' +
              '<th style="min-width: 150px;">تاريخ الفاتورة</th>' +
              '<th style="min-width: 140px;">تاريخ الاستحقاق</th>' +
              '<th style="min-width: 140px;">المبلغ الإجمالي</th>' +
              '<th style="min-width: 120px;">المدفوع</th>' +
              '<th style="min-width: 120px;">المتبقي</th>' +
              '<th style="min-width: 130px;">حالة الدفع</th>' +
              '<th style="min-width: 140px;">تاريخ الاسترجاع</th>' +
              '<th style="min-width: 250px;">الأصناف والكميات</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</body>' +
    '</html>';

    const blob = new Blob(['\ufeff' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'سجل_فواتير_المبيعات_' + Date.now() + '.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
      
      {dueSoonInvoicesCount > 0 && (
        <div style={{ background: '#06261e22', border: '1px solid #25D366', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            <span style={{ fontSize: '13px', color: '#25D366', fontWeight: 'bold' }}>
              {t(`نظام تذكيرات الواتساب: يوجد`)} {dueSoonInvoicesCount} {t(`فواتير غير مدفوعة ومتبقي على استحقاقها 3 أيام أو أقل. يمكنك إرسال التذكيرات مباشرة ولن تتوقف حتى تضغط "تم الدفع".`)}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>{t(`📑 سجل فواتير المبيعات`)}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="text" value={invoiceSearchQuery} onChange={e => setInvoiceSearchQuery(e.target.value)} placeholder={t(`🔍 ابحث برقم الفاتورة أو العميل...`)} style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '13px', width: '240px' }} />
          <button onClick={handleExportInvoicesToExcel} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t(`تصدير إلى Excel 📥`)}</button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '750px' }}>
        <thead>
          <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
            <th style={{ padding: '12px' }}>{t(`رقم الفاتورة`)}</th>
            <th style={{ padding: '12px' }}>{t(`العميل`)}</th>
            <th style={{ padding: '12px' }}>{t(`المبلغ الإجمالي`)}</th>
            <th style={{ padding: '12px' }}>{t(`حالة الدفع والاستحقاق`)}</th>
            <th style={{ padding: '12px' }}>{t(`الإجراءات`)}</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map(inv => {
            const isUnpaid = inv?.paymentStatus === 'غير مدفوعة';
            const isPartial = inv?.paymentStatus === 'مدفوعة جزئياً';
            const needsPayment = isUnpaid || isPartial;
            const daysLeft = getDueDateDaysLeft(inv?.dueDate);
            const isDueSoon = needsPayment && daysLeft !== null && daysLeft <= 3;
            
            const statusBg = isUnpaid ? '#7f1d1d' : (isPartial ? '#9a3412' : '#065f46');
            const statusColor = isUnpaid ? '#fca5a5' : (isPartial ? '#fdba74' : '#6ee7b7');

            return (
              <tr key={inv?.id || Math.random()} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>#{inv?.invoiceNo || '-'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontWeight: 'bold' }}>{(inv?.customer && inv.customer.name) || inv?.customerName || 'عميل نقدي'}</span>
                  {inv?.customer?.phone && <div style={{ fontSize: '11px', color: theme.textMuted }}>{inv.customer.phone}</div>}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ color: '#10b981', fontWeight: 'bold' }}>{inv?.totalAmount || '0.00'} {t.currency}</div>
                  {isPartial && (
                    <div style={{ fontSize: '11px', marginTop: '4px', color: theme.textMuted }}>
                      {t(`المدفوع:`)} <span style={{ color: '#10b981' }}>{inv?.paidAmount || 0}</span> | {t(`المتبقي:`)} <span style={{ color: '#ef4444' }}>{inv?.remainingAmount || 0}</span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px' }}>
                    {inv?.paymentStatus || 'مدفوعة'}
                  </span>
                  {needsPayment && inv?.dueDate && (
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                      {t(`الاستحقاق:`)} {formatDateOnly(inv.dueDate)} {daysLeft !== null && <span style={{ color: daysLeft <= 0 ? '#ef4444' : '#38bdf8', fontWeight: 'bold' }}>({daysLeft <= 0 ? t(`مستحقة`) : `${t(`متبقي`)} ${daysLeft} ${t(`يوم`)}`})</span>}
                    </div>
                  )}
                  {isDueSoon && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ background: '#064e3b44', color: '#25D366', border: '1px solid #25D366', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                        {t(`تذكير واتساب نشط 📲`)}
                      </span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setPrintingInvoice(inv)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t(`معاينة وطباعة 👁️`)}</button>
                    
                    {needsPayment && (
                      <button 
                        type="button" 
                        onClick={() => handleSendWhatsAppReminder(inv)}
                        title={lang === 'ar' ? 'إرسال تذكير الفاتورة عبر واتساب' : 'Send invoice reminder via WhatsApp'}
                        style={{ background: '#25D366', color: '#fff', border: 'none', padding: '6px 11px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{t(`واتساب 💬`)}</span>
                      </button>
                    )}

                    {needsPayment && (<button onClick={() => handleOpenPayConfirm(inv?.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>{t(`سداد الفاتورة ✓`)}</button>)}
                  </div>
                </td>
              </tr>
            );
          })}
          {!filteredInvoices.length && (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>{t(`لا توجد فواتير مبيعات مسجلة بعد.`)}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesListTab;