const PurchaseInvoicesListTab = ({
  t, theme, isDark, user,
  filteredPurchaseInvoices,
  purchaseInvoicesListSearch, setPurchaseInvoicesListSearch,
  handleExportPurchaseInvoices,
  setPrintingPurchaseInvoice
}) => {
  return (
    <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>{t(`📥 سجل فواتير الشراء`)}</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="text" value={purchaseInvoicesListSearch} onChange={e => setPurchaseInvoicesListSearch(e.target.value)} placeholder={t(`🔍 ابحث برقم الفاتورة أو المنتج أو المورد...`)} style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '13px', width: '280px' }} />
          <button onClick={handleExportPurchaseInvoices} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t(`تصدير إلى Excel 📥`)}</button>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
        <thead>
          <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
            <th style={{ padding: '12px' }}>{t(`رقم الفاتورة`)}</th>
            <th style={{ padding: '12px' }}>{t(`المورد`)}</th>
            <th style={{ padding: '12px' }}>{t(`المنتج`)}</th>
            <th style={{ padding: '12px' }}>{t(`الوحدة`)}</th>
            <th style={{ padding: '12px' }}>{t(`الكمية`)}</th>
            <th style={{ padding: '12px' }}>{t(`الإجمالي`)}</th>
            <th style={{ padding: '12px' }}>{t(`التاريخ`)}</th>
            <th style={{ padding: '12px' }}>{t(`الإجراءات`)}</th>
          </tr>
        </thead>
        <tbody>
          {filteredPurchaseInvoices.map(pi => (
            <tr key={pi.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>#{pi.invoiceNo || pi.id}</td>
              <td style={{ padding: '12px' }}>{pi.supplier?.name || 'توريد نقدي مباشر'}</td>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#d97706' }}>{pi.productName}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{pi.unitType || 'قطعة'}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{pi.quantity}</td>
              <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>{pi.totalAmount} {t.currency}</td>
              <td style={{ padding: '12px', color: theme.textMuted }}>{new Date(pi.createdAt).toLocaleDateString('en-CA')}</td>
              <td style={{ padding: '12px' }}>
                <button onClick={() => setPrintingPurchaseInvoice(pi)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t(`معاينة وطباعة 👁️`)}</button>
              </td>
            </tr>
          ))}
          {!filteredPurchaseInvoices.length && (
            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>{t(`لا توجد فواتير شراء مسجلة بعد.`)}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseInvoicesListTab;

