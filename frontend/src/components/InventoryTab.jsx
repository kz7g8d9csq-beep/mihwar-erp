import React from 'react';

const InventoryTab = ({
  t, theme, isDark, user,
  filteredInventory = [],
  inventorySearchQuery, setInventorySearchQuery,
  newProdName, setNewProdName,
  newProdPrice, setNewProdPrice,
  newProdStock, setNewProdStock,
  newItemCode, setNewItemCode,
  newProdCommission = '', setNewProdCommission,
  handleAddProduct,
  handleOpenEditProduct,
  handleDeleteProduct,
  handleExportInventory
}) => {

  const getText = (key, fallback) => {
    if (typeof t === 'function') return t(key);
    if (t && t[key]) return t[key];
    return fallback || key;
  };

  const currencyText = (t && t.currency) || 'ر.س';

  const getCleanDateTime = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + min;
  };

  // دالة تصدير الإكسيل المحدثة متضمنة عمولة الكرتون
  const handleExportInventoryToExcel = () => {
    const list = filteredInventory || [];
    if (!list || list.length === 0) {
      alert('لا توجد عناصر في المخزون للتصدير');
      return;
    }

    const systemTitle = 'نظام محور • تقرير جرد المخزون والمستودع والعمولات';
    const exportDate = getCleanDateTime();

    let tableRows = '';
    let totalInventoryValue = 0;
    let totalPiecesCount = 0;
    let totalCartonsCount = 0;

    list.forEach((item, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const code = item?.itemCode || 'SKU-' + (item?.id || idx + 1);
      const name = item?.name || 'صنف بدون اسم';
      const price = Number(item?.price || 0);
      const stock = Number(item?.stock || 0);
      const boxSize = Number(item?.boxSize || 12);
      const cartons = (stock / boxSize).toFixed(1);
      const commission = Number(item?.cartonCommission || item?.commissionPerBox || 0);
      const itemTotalValue = stock * price;

      totalInventoryValue += itemTotalValue;
      totalPiecesCount += stock;
      totalCartonsCount += (stock / boxSize);

      let statusText = 'متوفر';
      let statusColor = '#16a34a';
      if (stock === 0) {
        statusText = 'نفد من المخزون';
        statusColor = '#dc2626';
      } else if (stock <= 5) {
        statusText = 'مخزون منخفض';
        statusColor = '#d97706';
      }

      tableRows += '<tr style="background-color: ' + bgColor + ';">' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; mso-number-format:\'\\@\'; color: #d97706;">' + code + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;">' + name + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">' + price.toFixed(2) + ' ' + currencyText + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;">' + stock + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">' + boxSize + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; color: #0284c7;">' + cartons + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #8b5cf6;">' + commission.toFixed(2) + ' ' + currencyText + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">' + itemTotalValue.toFixed(2) + ' ' + currencyText + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: ' + statusColor + ';">' + statusText + '</td>' +
      '</tr>';
    });

    // صف إجمالي مقسم على 9 خلايا متطابقة تماماً مع الأعمدة
    tableRows += '<tr style="background-color: #e2e8f0; font-weight: bold;">' +
      '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #d97706; font-size: 13px;">الإجمالي</td>' +
      '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: right; color: #0f172a; font-size: 13px;">الإجمالي الكلي للمخزون</td>' +
      '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
      '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #10b981; font-size: 13px;">' + totalPiecesCount + ' حبة</td>' +
      '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
      '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #0284c7; font-size: 13px;">' + totalCartonsCount.toFixed(1) + ' كرتون</td>' +
      '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
      '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #0f172a; font-size: 13px;">' + totalInventoryValue.toFixed(2) + ' ' + currencyText + '</td>' +
      '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
    '</tr>';

    const excelTemplate = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head>' +
        '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">' +
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
        '<x:Name>جرد المخزون</x:Name>' +
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
              '<th style="min-width: 140px;">رقم الصنف (SKU)</th>' +
              '<th style="min-width: 200px;">اسم المنتج</th>' +
              '<th style="min-width: 130px;">سعر البيع</th>' +
              '<th style="min-width: 130px;">المخزون (حبة)</th>' +
              '<th style="min-width: 110px;">سعة الكرتون</th>' +
              '<th style="min-width: 130px;">المخزون (كرتون)</th>' +
              '<th style="min-width: 140px;">عمولة الكرتون للمندوب</th>' +
              '<th style="min-width: 150px;">القيمة الإجمالية</th>' +
              '<th style="min-width: 130px;">حالة التوفر</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</body>' +
    '</html>';

    const blob = new Blob(['\ufeff' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'تقرير_المخزون_والمستودع_' + Date.now() + '.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'cashier' ? '1fr' : '1fr 2.5fr', gap: '20px' }}>
      
      {/* نموذج إضافة منتج جديد */}
      {user?.role !== 'cashier' && (
        <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{getText('➕ إضافة منتج', '➕ إضافة منتج')}</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>رقم الصنف (SKU):</label>
              <input 
                type="text" 
                placeholder="مثال: SKU-001" 
                value={newItemCode} 
                onChange={e => setNewItemCode(e.target.value)} 
                style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>اسم المنتج * :</label>
              <input 
                type="text" 
                placeholder={getText('prodName', 'اسم المنتج')} 
                value={newProdName} 
                onChange={e => setNewProdName(e.target.value)} 
                required 
                style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعر البيع ({currencyText}) * :</label>
              <input 
                type="number" 
                step="0.01" 
                placeholder={getText('prodPrice', 'السعر')} 
                value={newProdPrice} 
                onChange={e => setNewProdPrice(e.target.value)} 
                required 
                style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>الكمية الافتتاحية (بالحبة):</label>
              <input 
                type="number" 
                placeholder={getText('prodStock', 'المخزون')} 
                value={newProdStock} 
                onChange={e => setNewProdStock(e.target.value)} 
                style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>
                عمولة الكرتون للمندوب ({currencyText}):
              </label>
              <input 
                type="number" 
                step="0.01" 
                min="0"
                placeholder="مثال: 0.10 أو 0.30" 
                value={newProdCommission} 
                onChange={e => setNewProdCommission && setNewProdCommission(e.target.value)} 
                style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} 
              />
            </div>
            <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
              {getText('saveProd', 'حفظ المنتج')}
            </button>
          </form>
        </div>
      )}

      {/* جدول مستودع المخزون */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '17px' }}>{getText('stockRepo', 'مستودع المخزون')}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              value={inventorySearchQuery} 
              onChange={e => setInventorySearchQuery(e.target.value)} 
              placeholder={getText('🔍 ابحث برقم الصنف أو الاسم...', '🔍 ابحث برقم الصنف أو الاسم...')} 
              style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '12px', width: '220px' }} 
            />
            <button 
              onClick={handleExportInventoryToExcel} 
              style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              تصدير Excel 📊
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '780px' }}>
          <thead>
            <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '12px', textAlign: 'right' }}>{getText('رقم الصنف', 'رقم الصنف')}</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>{getText('اسم المنتج', 'اسم المنتج')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('السعر', 'السعر')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('المخزون المتوفر', 'المخزون المتوفر')}</th>
              <th style={{ padding: '12px', textAlign: 'center', color: '#d97706' }}>عمولة الكرتون</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('الحالة', 'الحالة')}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{getText('الإجراءات', 'الإجراءات')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(i => {
              const boxSize = Number(i?.boxSize || 12);
              const stock = Number(i?.stock || 0);
              const cartons = (stock / boxSize).toFixed(1);
              const price = Number(i?.price || 0);
              const comm = Number(i?.cartonCommission || i?.commissionPerBox || 0);

              let statusBg = '#064e3b44';
              let statusColor = '#34d399';
              let statusText = 'متوفر';
              if (stock === 0) {
                statusBg = '#7f1d1d44';
                statusColor = '#f87171';
                statusText = 'نفد';
              } else if (stock <= 5) {
                statusBg = '#78350f44';
                statusColor = '#fbbf24';
                statusText = 'منخفض';
              }

              return (
                <tr key={i?.id || Math.random()} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', color: '#d97706' }}>
                    {i?.itemCode || 'SKU-' + (i?.id || '001')}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    {i?.name}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>
                    {price.toFixed(2)} {currencyText}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                    {stock} حبة <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'normal' }}>({cartons} كرتون)</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {comm > 0 ? `${comm.toFixed(2)} ${currencyText}` : '-'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ background: statusBg, color: statusColor, padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                      {statusText}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleOpenEditProduct(i)} 
                        style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                      >
                        {getText('تعديل ✏️', 'تعديل ✏️')}
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(i?.id)} 
                        style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}
                      >
                        {getText('حذف 🗑️', 'حذف 🗑️')}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!filteredInventory.length && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '25px', color: theme.textMuted }}>
                  لا توجد منتجات مسجلة في المخزون حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTab;