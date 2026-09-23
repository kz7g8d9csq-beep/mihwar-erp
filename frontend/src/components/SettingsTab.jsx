const SettingsTab = ({
  t, theme, isDark,
  lang, setLang, setIsDark,
  companyLogo, setCompanyLogo,
  companyAddress, setCompanyAddress,
  invoiceLogoSize, setInvoiceLogoSize,
  handleLogoFileChange,
  handleLogout,
  handleDeleteAccountPermanently
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '22px' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>{t.prefTitle}</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <button onClick={()=>setLang('ar')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: lang==='ar'?'#d97706':'transparent', color: '#fff', border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🇸🇦 العربية</button>
          <button onClick={()=>setLang('en')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: lang==='en'?'#d97706':'transparent', color: '#fff', border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🇺🇸 English</button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={()=>setIsDark(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: !isDark?'#d97706':'transparent', color: '#fff', border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>☀️ النهاري</button>
          <button onClick={()=>setIsDark(true)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: isDark?'#d97706':'transparent', color: '#fff', border: `1px solid ${theme.border}`, fontWeight: 'bold', cursor: 'pointer' }}>🌙 الداكن</button>
        </div>
      </div>

      {/* بطاقة رفع شعار المنشأة والنظام وتعديل الحجم والعنوان المطبوع */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '22px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '17px' }}>{t.companyLogoTitle}</h3>
        <p style={{ fontSize: '12px', color: theme.textMuted, margin: '0 0 12px 0' }}>{t.companyLogoDesc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#d97706', marginBottom: '4px' }}>{t.logoUrlLabel}</label>
            <input type="file" accept="image/png, image/jpeg, image/jpg" onChange={handleLogoFileChange} style={{ padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box' }} />
          </div>
          
          {/* خيار تكبير وتحديد حجم الشعار في الفاتورة المطبوعة */}
          <div style={{ background: theme.bgMain, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#d97706' }}>حجم / تكبير الشعار في الفاتورة:</label>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>{invoiceLogoSize} بكسل</span>
            </div>
            <input 
              type="range" 
              min="70" 
              max="250" 
              step="5"
              value={invoiceLogoSize} 
              onChange={e => {
                const val = Number(e.target.value);
                setInvoiceLogoSize(val);
                localStorage.setItem('mihwar_invoice_logo_size', val);
              }} 
              style={{ width: '100%', accentColor: '#d97706', cursor: 'pointer' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#d97706', marginBottom: '4px' }}>عنوان / مقر المنشأة المطبوع على الفاتورة:</label>
            <input 
              type="text" 
              value={companyAddress} 
              onChange={e => {
                setCompanyAddress(e.target.value);
                localStorage.setItem('mihwar_company_address', e.target.value);
              }} 
              placeholder="مثال: المملكة العربية السعودية - الرياض أو جدة أو الخبر" 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '13px' }} 
            />
          </div>

          {companyLogo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
              <img src={companyLogo} alt="Logo Preview" style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#fff', borderRadius: '8px', padding: '4px', border: '1px solid #d97706' }} />
              <button type="button" onClick={() => { setCompanyLogo(''); localStorage.removeItem('mihwar_company_logo'); }} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>حذف الشعار واستعادة الافتراضي</button>
            </div>
          )}
        </div>
      </div>

      {/* بطاقة إدارة الحساب والجلسة */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: theme.textDark }}>🔒 إدارة الحساب والجلسة</h3>
          <p style={{ fontSize: '12px', color: theme.textMuted, margin: 0, lineHeight: '1.6' }}>
            تسجيل الخروج يحفظ كامل بياناتك، أما الحذف النهائي فيمسح الحساب وجميع البيانات تماماً مع إمكانية إنشاء حساب جديد لاحقاً.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            type="button" 
            onClick={handleLogout}
            style={{ background: '#334155', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>تسجيل الخروج</span> 🚪
          </button>
          <button 
            type="button" 
            onClick={handleDeleteAccountPermanently}
            style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>حذف الحساب بشكل نهائي</span> 🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;

