const PurchasesTab = ({
  t, theme, isDark, user,
  suppliers,
  selectedSupplierId, setSelectedSupplierId,
  purchaseProductSearch, setPurchaseProductSearch,
  filteredProductsForPurchase,
  selectedPurchaseProdId, setSelectedPurchaseProdId,
  purchaseUnitType, setPurchaseUnitType,
  purchaseQty, setPurchaseQty,
  piecesPerCartonInput, setPiecesPerCartonInput,
  unitGramOrKilo, setUnitGramOrKilo,
  weightInputValue, setWeightInputValue,
  purchasePieceCost, setPurchasePieceCost,
  purchaseBoxCost, setPurchaseBoxCost,
  handleSavePurchase
}) => {
  return (
    <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', maxWidth: '650px', margin: 'auto' }}>
      <h2 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>{t(`تسجيل فاتورة شراء وتوريد بضاعة`)}</h2>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`المورد`)}</label>
        <select value={selectedSupplierId} onChange={e=>setSelectedSupplierId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
          <option value="">{t(`توريد نقدي مباشر`)}</option>
          {suppliers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`🔍 بحث واختيار المنتج:`)}</label>
        <input type="text" value={purchaseProductSearch} onChange={e => setPurchaseProductSearch(e.target.value)} placeholder={t(`ابحث عن اسم المنتج للفلترة...`)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', marginBottom: '8px', boxSizing: 'border-box', fontSize: '13px' }} />
        <select value={selectedPurchaseProdId} onChange={e=>setSelectedPurchaseProdId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
          <option value="">{t(`-- اختر المنتج المستهدف --`)}</option>
          {filteredProductsForPurchase.map(p=><option key={p.id} value={p.id}>{p.name} (المتوفر الحالي: {p.stock})</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`وحدة التوريد`)}</label>
          <select value={purchaseUnitType} onChange={e=>setPurchaseUnitType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
            <option value="قطعة">{t(`قطعة`)}</option>
            <option value="كرتون">{t(`كرتون`)}</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`الكمية الموردة`)}</label>
          <input type="number" placeholder={t(`الكمية`)} value={purchaseQty} onChange={e=>setPurchaseQty(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
        </div>
      </div>

      {purchaseUnitType === 'كرتون' && (
        <div style={{ marginBottom: '15px', background: theme.bgMain, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#d97706' }}>{t(`كم قطعة بداخل الكرتون؟ (إدخال يدوي):`)}</label>
          <input type="number" placeholder={t(`مثال: 12 أو 24`)} value={piecesPerCartonInput} onChange={e=>setPiecesPerCartonInput(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px', background: theme.bgMain, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`إضافة وحدة وزن (اختياري):`)}</label>
          <select value={unitGramOrKilo} onChange={e=>setUnitGramOrKilo(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
            <option value="لا يوجد">{t(`-- بدون وزن --`)}</option>
            <option value="جرام">{t(`جرام`)}</option>
            <option value="كيلوجرام">{t(`كيلوجرام`)}</option>
            <option value="مل">{t(`مل`)}</option>
            <option value="لتر">{t(`لتر`)}</option>
          </select>
        </div>
        {unitGramOrKilo !== 'لا يوجد' && (
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`اكتب الوزن (مثال: 10 جرام أو 16 كيلو):`)}</label>
            <input type="text" placeholder={t(`اكتب هنا يدوياً...`)} value={weightInputValue} onChange={e=>setWeightInputValue(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`تكلفة القطعة الواحدة (ر.س)`)}</label>
          <input type="number" placeholder={t(`سعر القطعة`)} value={purchasePieceCost} onChange={e=>setPurchasePieceCost(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`تكلفة الكرتون (ر.س)`)}</label>
          <input type="number" placeholder={t(`سعر الكرتون`)} value={purchaseBoxCost} onChange={e=>setPurchaseBoxCost(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, boxSizing: 'border-box', outline: 'none' }} />
        </div>
      </div>

      <button onClick={handleSavePurchase} style={{ width: '100%', background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t(`اعتماد التوريد وزيادة المخزون 📦`)}</button>
    </div>
  );
};

export default PurchasesTab;

