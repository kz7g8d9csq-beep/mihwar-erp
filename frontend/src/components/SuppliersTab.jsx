const SuppliersTab = ({
  t, theme, isDark, user,
  filteredSuppliers,
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
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{t(`فتح حساب مورد جديد`)}</h3>
        <form onSubmit={handleAddSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" placeholder={t(`اسم المورد / الشركة *`)} value={suppName} onChange={e=>setSuppName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
          <input type="text" placeholder={t(`الرقم الضريبي`)} value={suppTaxNumber} onChange={e=>setSuppTaxNumber(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
          <input type="text" placeholder={t(`رقم الهاتف`)} value={suppPhone} onChange={e=>setSuppPhone(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
          <input type="text" placeholder={t(`العنوان (مثال: جدة - المنطقة الصناعية)`)} value={suppAddress} onChange={e=>setSuppAddress(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
          <input type="text" placeholder={t(`فترة السماح (مثال: 15 يوم / 30 يوم)`)} value={suppGracePeriod} onChange={e=>setSuppGracePeriod(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
          <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t(`حفظ المورد`)}</button>
        </form>
      </div>
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '17px' }}>{t(`دليل الموردين`)}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="text" value={supplierSearchQuery} onChange={e => setSupplierSearchQuery(e.target.value)} placeholder={t(`🔍 ابحث بالاسم، الرقم الضريبي أو العنوان...`)} style={{ padding: '6px 10px', borderRadius: '6px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '12px', width: '220px' }} />
            <button onClick={handleExportSuppliers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{t(`تصدير Excel`)}</button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>{t(`اسم المورد`)}</th><th style={{ padding: '10px' }}>{t(`الرقم الضريبي`)}</th><th style={{ padding: '10px' }}>{t(`الهاتف`)}</th><th style={{ padding: '10px' }}>{t(`العنوان`)}</th><th style={{ padding: '10px' }}>{t(`فترة السماح`)}</th><th style={{ padding: '10px' }}>{t(`الإجراءات`)}</th></tr></thead>
          <tbody>
            {filteredSuppliers.map(s => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{s.name}</td>
                <td style={{ padding: '10px' }}>{s.taxNumber || '-'}</td>
                <td style={{ padding: '10px' }}>{s.phone || '-'}</td>
                <td style={{ padding: '10px' }}>{s.address || '-'}</td>
                <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 'bold' }}>{s.gracePeriod || '-'}</td>
                <td style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleOpenEditSupplier(s)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>{t(`تعديل ✏️`)}</button>
                    <button onClick={() => handleDeleteSupplier(s.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>{t(`حذف 🗑️`)}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuppliersTab;

