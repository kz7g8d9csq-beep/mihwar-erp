import React from 'react';

const SuppliersTab = ({
  t, theme, isDark, user,
  filteredSuppliers = [],
  supplierSearchQuery, setSupplierSearchQuery,
  suppName, setSuppName,
  suppTaxNumber, setSuppTaxNumber,
  suppPhone, setSuppPhone,
  suppAddress, setSuppAddress,
  suppGracePeriod, setSuppGracePeriod,
  handleAddSupplier,
  handleOpenEditSupplier,
  handleDeleteSupplier,
  handleExportSuppliers
}) => {

  const getText = (key, fallback) => {
    if (typeof t === 'function') return t(key);
    if (t && t[key]) return t[key];
    return fallback || key;
  };

  const getCleanDateTime = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + min;
  };

  const handleExportSuppliersToExcel = () => {
    const list = filteredSuppliers || [];
    if (!list || list.length === 0) {
      alert(getText('لا توجد بيانات موردين للتصدير', 'لا توجد بيانات موردين للتصدير'));
      return;
    }

    const systemTitle = 'نظام محور • دليل الموردين';
    const exportDate = getCleanDateTime();

    let tableRows = '';
    list.forEach((s, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const name = s?.name || '-';
      const taxNumber = s?.taxNumber || '-';
      const phone = s?.phone || '-';
      const address = s?.address || '-';
      const gracePeriod = s?.gracePeriod || '-';

      tableRows += '<tr style="background-color: ' + bgColor + ';">' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;">' + name + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\'; font-weight: bold; color: #d97706;">' + taxNumber + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + phone + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">' + address + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; color: #0284c7; font-weight: bold;">' + gracePeriod + '</td>' +
      '</tr>';
    });

    const excelTemplate = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head>' +
        '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">' +
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
        '<x:Name>دليل الموردين</x:Name>' +
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
              '<th colspan="5" style="background-color: #1e293b; color: #ffffff; font-size: 18px; padding: 16px; text-align: center; font-weight: bold;">' + systemTitle + '</th>' +
            '</tr>' +
            '<tr>' +
              '<th colspan="5" style="background-color: #334155; color: #e2e8f0; font-size: 12px; padding: 8px; text-align: center;">تاريخ التصدير: ' + exportDate + ' | وثيقة معتمدة ومصدرة آلياً من النظام</th>' +
            '</tr>' +
            '<tr style="background-color: #e2e8f0;">' +
              '<th style="min-width: 200px;">اسم المورد / الشركة</th>' +
              '<th style="min-width: 170px;">الرقم الضريبي</th>' +
              '<th style="min-width: 150px;">رقم الهاتف</th>' +
              '<th style="min-width: 250px;">العنوان</th>' +
              '<th style="min-width: 130px;">فترة السماح</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</body>' +
    '</html>';

    const blob = new Blob(['\ufeff' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'دليل_الموردين_' + Date.now() + '.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
      
      {/* نموذج فتح حساب مورد جديد */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', height: 'fit-content' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{getText('فتح حساب مورد جديد', 'فتح حساب مورد جديد')}</h3>
        <form onSubmit={handleAddSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>اسم المورد / الشركة * :</label>
            <input 
              type="text" 
              placeholder={getText('اسم المورد / الشركة *', 'اسم المورد / الشركة *')} 
              value={suppName} 
              onChange={e => setSuppName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>الرقم الضريبي:</label>
            <input 
              type="text" 
              placeholder={getText('الرقم الضريبي', 'الرقم الضريبي')} 
              value={suppTaxNumber} 
              onChange={e => setSuppTaxNumber(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>رقم الهاتف:</label>
            <input 
              type="text" 
              placeholder={getText('رقم الهاتف', 'رقم الهاتف')} 
              value={suppPhone} 
              onChange={e => setSuppPhone(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>العنوان الوطني / الحي:</label>
            <input 
              type="text" 
              placeholder={getText('العنوان (مثال: جدة - المنطقة الصناعية)', 'العنوان (مثال: جدة - المنطقة الصناعية)')} 
              value={suppAddress} 
              onChange={e => setSuppAddress(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>فترة السماح (أيام):</label>
            <input 
              type="text" 
              placeholder={getText('فترة السماح (مثال: 15 يوم / 30 يوم)', 'فترة السماح (مثال: 15 يوم / 30 يوم)')} 
              value={suppGracePeriod} 
              onChange={e => setSuppGracePeriod(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} 
            />
          </div>
          <button 
            type="submit" 
            style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}
          >
            {getText('حفظ المورد', 'حفظ المورد')}
          </button>
        </form>
      </div>

      {/* جدول دليل الموردين */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '17px' }}>{getText('دليل الموردين', 'دليل الموردين')}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              value={supplierSearchQuery} 
              onChange={e => setSupplierSearchQuery(e.target.value)} 
              placeholder={getText('🔍 ابحث بالاسم، الرقم الضريبي أو العنوان...', '🔍 ابحث بالاسم، الرقم الضريبي أو العنوان...')} 
              style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '12px', width: '240px' }} 
            />
            <button 
              onClick={handleExportSuppliersToExcel} 
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {getText('تصدير Excel', 'تصدير Excel 📊')}
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '12px', textAlign: 'right' }}>{getText('اسم المورد', 'اسم المورد')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('الرقم الضريبي', 'الرقم الضريبي')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('الهاتف', 'الهاتف')}</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>{getText('العنوان', 'العنوان')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('فترة السماح', 'فترة السماح')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('الإجراءات', 'الإجراءات')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(s => (
              <tr key={s?.id || Math.random()} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{s?.name}</td>
                <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#d97706' }}>{s?.taxNumber || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{s?.phone || '-'}</td>
                <td style={{ padding: '12px' }}>{s?.address || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#38bdf8', fontWeight: 'bold' }}>{s?.gracePeriod || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleOpenEditSupplier(s)} 
                      style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                    >
                      {getText('تعديل ✏️', 'تعديل ✏️')}
                    </button>
                    <button 
                      onClick={() => handleDeleteSupplier(s?.id)} 
                      style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                    >
                      {getText('حذف 🗑️', 'حذف 🗑️')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredSuppliers.length && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '25px', color: theme.textMuted }}>
                  لا توجد حسابات موردين مسجلة حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuppliersTab;