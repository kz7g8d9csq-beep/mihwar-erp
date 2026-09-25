import React from 'react';

const CustomersTab = ({
  t, theme, isDark, user,
  filteredCustomers = [],
  customerSearchQuery, setCustomerSearchQuery,
  custName, setCustName,
  custNationalId, setCustNationalId,
  custPhone, setCustPhone,
  custEmail, setCustEmail,
  custAddress, setCustAddress,
  custGracePeriod, setCustGracePeriod,
  handleAddCustomer,
  handleOpenEditCustomer,
  handleDeleteCustomer,
  handleExportCustomers
}) => {

  // دالة مساعدة لدعم الترجمة أو النصوص المباشرة
  const getText = (key, fallback) => {
    if (typeof t === 'function') return t(key);
    if (t && t[key]) return t[key];
    return fallback || key;
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

  // دالة تصدير الإكسيل الرسمية المعتمدة والمطابقة لقالب النظام
  const handleExportCustomersToExcel = () => {
    const list = filteredCustomers || [];
    if (!list || list.length === 0) {
      alert(getText('لا توجد بيانات عملاء للتصدير', 'لا توجد بيانات عملاء للتصدير'));
      return;
    }

    const systemTitle = 'نظام محور • دليل العملاء';
    const exportDate = getCleanDateTime();

    let tableRows = '';
    list.forEach((c, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const name = c?.name || '-';
      const nationalId = c?.nationalId || '-';
      const phone = c?.phone || '-';
      const email = c?.email || '-';
      const address = c?.address || '-';
      const gracePeriod = c?.gracePeriod || '-';

      tableRows += '<tr style="background-color: ' + bgColor + ';">' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;">' + name + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\'; font-weight: bold;">' + nationalId + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + phone + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">' + email + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">' + address + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; color: #0284c7; font-weight: bold;">' + gracePeriod + '</td>' +
      '</tr>';
    });

    const excelTemplate = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head>' +
        '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">' +
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
        '<x:Name>دليل العملاء</x:Name>' +
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
              '<th colspan="6" style="background-color: #1e293b; color: #ffffff; font-size: 18px; padding: 16px; text-align: center; font-weight: bold;">' + systemTitle + '</th>' +
            '</tr>' +
            '<tr>' +
              '<th colspan="6" style="background-color: #334155; color: #e2e8f0; font-size: 12px; padding: 8px; text-align: center;">تاريخ التصدير: ' + exportDate + ' | وثيقة معتمدة ومصدرة آلياً من النظام</th>' +
            '</tr>' +
            '<tr style="background-color: #e2e8f0;">' +
              '<th style="min-width: 180px;">الاسم</th>' +
              '<th style="min-width: 150px;">الهوية / السجل</th>' +
              '<th style="min-width: 140px;">الهاتف</th>' +
              '<th style="min-width: 200px;">البريد الإلكتروني</th>' +
              '<th style="min-width: 220px;">العنوان</th>' +
              '<th style="min-width: 120px;">فترة السماح</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</body>' +
    '</html>';

    const blob = new Blob(['\ufeff' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'دليل_العملاء_' + Date.now() + '.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
      
      {/* نموذج فتح حساب عميل جديد */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', height: 'fit-content' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{getText('فتح حساب عميل جديد', 'فتح حساب عميل جديد')}</h3>
        <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>اسم العميل / المؤسسة * :</label>
            <input 
              type="text" 
              placeholder={getText('اسم العميل / المؤسسة *', 'اسم العميل / المؤسسة *')} 
              value={custName} 
              onChange={e => setCustName(e.target.value)} 
              required 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>رقم الهوية / السجل التجاري:</label>
            <input 
              type="text" 
              placeholder={getText('رقم الهوية / السجل التجاري', 'رقم الهوية / السجل التجاري')} 
              value={custNationalId} 
              onChange={e => setCustNationalId(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>رقم الهاتف:</label>
            <input 
              type="text" 
              placeholder={getText('رقم الهاتف', 'رقم الهاتف')} 
              value={custPhone} 
              onChange={e => setCustPhone(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>البريد الإلكتروني:</label>
            <input 
              type="email" 
              placeholder={getText('البريد الإلكتروني', 'البريد الإلكتروني')} 
              value={custEmail} 
              onChange={e => setCustEmail(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>العنوان الوطني / الحي:</label>
            <input 
              type="text" 
              placeholder={getText('العنوان (مثال: جدة - حي الروضة)', 'العنوان (مثال: جدة - حي الروضة)')} 
              value={custAddress} 
              onChange={e => setCustAddress(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} 
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>فترة السماح (أيام):</label>
            <input 
              type="text" 
              placeholder={getText('فترة السماح (مثال: 15 يوم / 30 يوم)', 'فترة السماح (مثال: 15 يوم / 30 يوم)')} 
              value={custGracePeriod} 
              onChange={e => setCustGracePeriod(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} 
            />
          </div>
          <button 
            type="submit" 
            style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px' }}
          >
            {getText('حفظ العميل', 'حفظ العميل')}
          </button>
        </form>
      </div>

      {/* جدول دليل العملاء */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '17px' }}>{getText('دليل العملاء', 'دليل العملاء')}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              value={customerSearchQuery} 
              onChange={e => setCustomerSearchQuery(e.target.value)} 
              placeholder={getText('🔍 ابحث بالاسم، الهوية، الهاتف أو البريد...', '🔍 ابحث بالاسم، الهوية، الهاتف أو البريد...')} 
              style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '12px', width: '230px' }} 
            />
            <button 
              onClick={handleExportCustomersToExcel} 
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {getText('تصدير Excel', 'تصدير Excel 📊')}
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '12px', textAlign: 'right' }}>{getText('الاسم', 'الاسم')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('الهوية / السجل', 'الهوية / السجل')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('الهاتف', 'الهاتف')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('البريد الإلكتروني', 'البريد الإلكتروني')}</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>{getText('العنوان', 'العنوان')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('فترة السماح', 'فترة السماح')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('الإجراءات', 'الإجراءات')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c?.id || Math.random()} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{c?.name}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{c?.nationalId || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{c?.phone || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{c?.email || '-'}</td>
                <td style={{ padding: '12px' }}>{c?.address || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#38bdf8', fontWeight: 'bold' }}>{c?.gracePeriod || '-'}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                    <button 
                      onClick={() => handleOpenEditCustomer(c)} 
                      style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                    >
                      {getText('تعديل ✏️', 'تعديل ✏️')}
                    </button>
                    <button 
                      onClick={() => handleDeleteCustomer(c?.id)} 
                      style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                    >
                      {getText('حذف 🗑️', 'حذف 🗑️')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!filteredCustomers.length && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '25px', color: theme.textMuted }}>
                  لا توجد حسابات عملاء مسجلة حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomersTab;