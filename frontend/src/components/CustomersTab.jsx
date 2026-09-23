const CustomersTab = ({
  t, theme, isDark, user,
  filteredCustomers,
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
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{t(`فتح حساب عميل جديد`)}</h3>
        <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" placeholder={t(`اسم العميل / المؤسسة *`)} value={custName} onChange={e=>setCustName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
          <input type="text" placeholder={t(`رقم الهوية / السجل التجاري`)} value={custNationalId} onChange={e=>setCustNationalId(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
          <input type="text" placeholder={t(`رقم الهاتف`)} value={custPhone} onChange={e=>setCustPhone(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
          <input type="email" placeholder={t(`البريد الإلكتروني`)} value={custEmail} onChange={e=>setCustEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
          <input type="text" placeholder={t(`العنوان (مثال: جدة - حي الروضة)`)} value={custAddress} onChange={e=>setCustAddress(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
          <input type="text" placeholder={t(`فترة السماح (مثال: 15 يوم / 30 يوم)`)} value={custGracePeriod} onChange={e=>setCustGracePeriod(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
          <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t(`حفظ العميل`)}</button>
        </form>
      </div>
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '17px' }}>{t(`دليل العملاء`)}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="text" value={customerSearchQuery} onChange={e => setCustomerSearchQuery(e.target.value)} placeholder={t(`🔍 ابحث بالاسم، الهوية، الهاتف أو البريد...`)} style={{ padding: '6px 10px', borderRadius: '6px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '12px', width: '220px' }} />
            <button onClick={handleExportCustomers} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>{t(`تصدير Excel`)}</button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '10px' }}>{t(`الاسم`)}</th><th style={{ padding: '10px' }}>{t(`الهوية / السجل`)}</th><th style={{ padding: '10px' }}>{t(`الهاتف`)}</th><th style={{ padding: '10px' }}>{t(`البريد الإلكتروني`)}</th><th style={{ padding: '10px' }}>{t(`العنوان`)}</th><th style={{ padding: '10px' }}>{t(`فترة السماح`)}</th><th style={{ padding: '10px' }}>{t(`الإجراءات`)}</th></tr></thead>
          <tbody>
            {filteredCustomers.map(c => (
              <tr key={c.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.name}</td>
                <td style={{ padding: '10px' }}>{c.nationalId || '-'}</td>
                <td style={{ padding: '10px' }}>{c.phone || '-'}</td>
                <td style={{ padding: '10px' }}>{c.email || '-'}</td>
                <td style={{ padding: '10px' }}>{c.address || '-'}</td>
                <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 'bold' }}>{c.gracePeriod || '-'}</td>
                <td style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleOpenEditCustomer(c)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>{t(`تعديل ✏️`)}</button>
                    <button onClick={() => handleDeleteCustomer(c.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>{t(`حذف 🗑️`)}</button>
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

export default CustomersTab;

