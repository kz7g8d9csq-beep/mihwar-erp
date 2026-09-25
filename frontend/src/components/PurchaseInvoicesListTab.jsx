import React from 'react';

const PurchaseInvoicesListTab = ({
  t, theme, isDark, user,
  filteredPurchaseInvoices = [],
  purchaseInvoicesListSearch, setPurchaseInvoicesListSearch,
  handleExportPurchaseInvoices,
  setPrintingPurchaseInvoice
}) => {

  // دالة لتنظيف وتنسيق التاريخ ليظهر: السنة-الشهر-اليوم
  const formatDateOnly = (dateVal) => {
    if (!dateVal || dateVal === '-' || dateVal === 'null' || dateVal === 'undefined') return '-';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) {
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

  // دالة تصدير الإكسيل الرسمية المنسقة
  const handleExportPurchasesToExcel = () => {
    const list = filteredPurchaseInvoices || [];
    if (!list || list.length === 0) {
      alert(typeof t === 'function' ? t('لا توجد فواتير شراء للتصدير') : 'لا توجد فواتير شراء للتصدير');
      return;
    }

    const systemTitle = 'نظام محور • سجل فواتير الشراء';
    const exportDate = getCleanDateTime();

    let tableRows = '';
    list.forEach((pi, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const invNo = pi?.invoiceNo || pi?.id || '-';
      const supplierName = (pi?.supplier && pi.supplier.name) || pi?.supplierName || 'توريد نقدي مباشر';
      const prodName = pi?.productName || (pi?.items && pi.items[0]?.product?.name) || 'منتج';
      const unit = pi?.unitType || 'قطعة';
      const qty = pi?.quantity || (pi?.items && pi.items[0]?.quantity) || 1;
      const total = Number(pi?.totalAmount || 0).toFixed(2) + ' ر.س';
      const invDate = formatDateOnly(pi?.date || pi?.createdAt);
      const status = pi?.paymentStatus || 'مدفوعة';
      
      const rawReturnDate = pi?.returnDate || (status.includes('استرجاع') || status.includes('مرتجع') ? (pi?.updatedAt || '') : '');
      const returnDate = rawReturnDate ? formatDateOnly(rawReturnDate) : '-';

      let statusColor = '#065f46';
      if (status === 'غير مدفوعة') statusColor = '#7f1d1d';
      else if (status.includes('استرجاع') || status.includes('مرتجع')) statusColor = '#d97706';

      tableRows += '<tr style="background-color: ' + bgColor + ';">' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">#' + invNo + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;">' + supplierName + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #d97706; font-weight: bold;">' + prodName + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">' + unit + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">' + qty + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;">' + total + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: ' + statusColor + ';">' + status + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\'; font-weight: bold;">' + invDate + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + returnDate + '</td>' +
      '</tr>';
    });

    const excelTemplate = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head>' +
        '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">' +
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
        '<x:Name>فواتير الشراء</x:Name>' +
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
              '<th colspan="9" style="background-color: #1e293b; color: #ffffff; font-size: 18px; padding: 16px; text-align: center; font-weight: bold;">' + systemTitle + '</th>' +
            '</tr>' +
            '<tr>' +
              '<th colspan="9" style="background-color: #334155; color: #e2e8f0; font-size: 12px; padding: 8px; text-align: center;">تاريخ التصدير: ' + exportDate + ' | وثيقة معتمدة ومصدرة آلياً من النظام</th>' +
            '</tr>' +
            '<tr style="background-color: #e2e8f0;">' +
              '<th style="min-width: 130px;">رقم الفاتورة</th>' +
              '<th style="min-width: 180px;">المورد</th>' +
              '<th style="min-width: 170px;">المنتج</th>' +
              '<th style="min-width: 100px;">الوحدة</th>' +
              '<th style="min-width: 90px;">الكمية</th>' +
              '<th style="min-width: 130px;">الإجمالي</th>' +
              '<th style="min-width: 130px;">حالة الفاتورة</th>' +
              '<th style="min-width: 140px;">تاريخ الشراء</th>' +
              '<th style="min-width: 140px;">تاريخ الاسترجاع</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</body>' +
    '</html>';

    const blob = new Blob(['\ufeff' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'سجل_فواتير_الشراء_' + Date.now() + '.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currencyLabel = (t && t.currency) || 'ر.س';

  return (
    <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>{t ? t('📥 سجل فواتير الشراء') : '📥 سجل فواتير الشراء'}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            value={purchaseInvoicesListSearch} 
            onChange={e => setPurchaseInvoicesListSearch(e.target.value)} 
            placeholder={t ? t('🔍 ابحث برقم الفاتورة أو المنتج أو المورد...') : '🔍 ابحث برقم الفاتورة أو المنتج أو المورد...'} 
            style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '13px', width: '280px' }} 
          />
          <button 
            onClick={handleExportPurchasesToExcel} 
            style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {t ? t('تصدير إلى Excel 📥') : 'تصدير إلى Excel 📥'}
          </button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '850px' }}>
        <thead>
          <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
            <th style={{ padding: '12px' }}>{t ? t('رقم الفاتورة') : 'رقم الفاتورة'}</th>
            <th style={{ padding: '12px' }}>{t ? t('المورد') : 'المورد'}</th>
            <th style={{ padding: '12px' }}>{t ? t('المنتج') : 'المنتج'}</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>{t ? t('الوحدة') : 'الوحدة'}</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>{t ? t('الكمية') : 'الكمية'}</th>
            <th style={{ padding: '12px' }}>{t ? t('الإجمالي') : 'الإجمالي'}</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>{t ? t('الحالة') : 'الحالة'}</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>{t ? t('التاريخ') : 'التاريخ'}</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>{t ? t('الإجراءات') : 'الإجراءات'}</th>
          </tr>
        </thead>
        <tbody>
          {filteredPurchaseInvoices.map(pi => {
            const status = pi.paymentStatus || 'مدفوعة';
            const isReturned = status.includes('استرجاع') || status.includes('مرتجع');
            const isPendingReturn = status === 'قيد الاسترجاع';

            let statusBg = '#065f46';
            let statusColor = '#6ee7b7';
            if (isPendingReturn) {
              statusBg = '#78350f';
              statusColor = '#fde68a';
            } else if (isReturned) {
              statusBg = '#9a3412';
              statusColor = '#fdba74';
            }

            return (
              <tr key={pi.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>#{pi.invoiceNo || pi.id}</td>
                <td style={{ padding: '12px' }}>{pi.supplier?.name || pi.supplierName || 'توريد نقدي مباشر'}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#d97706' }}>{pi.productName || (pi.items && pi.items[0]?.product?.name) || 'منتج'}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{pi.unitType || 'قطعة'}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{pi.quantity || (pi.items && pi.items[0]?.quantity) || 1}</td>
                <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>{pi.totalAmount} {currencyLabel}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ background: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px', display: 'inline-block' }}>
                    {status}
                  </span>
                  {pi.returnDate && (
                    <div style={{ fontSize: '10px', color: theme.textMuted, marginTop: '3px' }}>
                      {formatDateOnly(pi.returnDate)}
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px', color: theme.textMuted, textAlign: 'center' }}>{formatDateOnly(pi.date || pi.createdAt)}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => setPrintingPurchaseInvoice(pi)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {t ? t('معاينة وطباعة 👁️') : 'معاينة وطباعة 👁️'}
                  </button>
                </td>
              </tr>
            );
          })}
          {!filteredPurchaseInvoices.length && (
            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>{t ? t('لا توجد فواتير شراء مسجلة بعد.') : 'لا توجد فواتير شراء مسجلة بعد.'}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseInvoicesListTab;