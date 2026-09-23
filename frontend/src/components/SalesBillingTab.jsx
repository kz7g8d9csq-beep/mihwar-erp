const SalesBillingTab = ({
  t, theme, isDark,
  inventory, cartItems,
  salesCustomerSearch, setSalesCustomerSearch,
  selectedCustomerId, setSelectedCustomerId,
  filteredCustomersForSales,
  selectedProductId, setSelectedProductId,
  salesUnitType, setSalesUnitType,
  itemQty, setItemQty,
  itemPrice, setItemPrice,
  invoiceStatus, setInvoiceStatus,
  paymentMethod, setPaymentMethod,
  dueDateInput, setDueDateInput,
  handleAddItemToSalesCart, handleRemoveSalesCartItem,
  handleSaveSalesInvoice, isSubmittingSale,
  cartSubtotal, cartTax, cartGrandTotal
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '20px' }}>
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#d97706' }}>{t(`⚡ إصدار فاتورة بيع جديدة`)}</h2>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`🔍 بحث واختيار العميل:`)}</label>
          <input type="text" value={salesCustomerSearch} onChange={e => setSalesCustomerSearch(e.target.value)} placeholder={t(`اكتب اسم المنشأة أو العميل للبحث السريع...`)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', marginBottom: '8px', boxSizing: 'border-box', fontSize: '13px' }} />
          <select value={selectedCustomerId} onChange={e=>setSelectedCustomerId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
            <option value="">{t(`-- عميل نقدي عام (افتراضي) --`)}</option>
            {filteredCustomersForSales.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr 1fr auto', gap: '10px', marginBottom: '15px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`اختيار المنتج`)}</label>
            <select value={selectedProductId} onChange={e => { setSelectedProductId(e.target.value); const p = inventory.find(x => x.id === Number(e.target.value)); if (p) setItemPrice(p.price); }} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
              <option value="">{t(`-- اختر المنتج --`)}</option>
              {inventory.map(p=><option key={p.id} value={p.id}>{p.name} ({t(`متوفر:`)} {p.stock})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`الوحدة`)}</label>
            <select value={salesUnitType} onChange={e=>setSalesUnitType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
              <option value="قطعة">{t(`قطعة`)}</option>
              <option value="كرتون">{t(`كرتون`)}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{t(`الكمية`)}</label>
            <div style={{ display: 'flex', alignItems: 'center', background: theme.bgMain, borderRadius: '8px', border: `1px solid ${theme.border}`, padding: '3px' }}>
              <button type="button" onClick={() => setItemQty(Math.max(1, itemQty - 1))} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
              <input type="number" min="1" value={itemQty} onChange={e=>setItemQty(Math.max(1, Number(e.target.value)))} style={{ width: '35px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold', color: theme.textDark, outline: 'none', fontSize: '13px' }} />
              <button type="button" onClick={() => setItemQty(itemQty + 1)} style={{ background: '#d97706', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{t(`السعر (ر.س)`)}</label>
            <input type="number" value={itemPrice} onChange={e=>setItemPrice(e.target.value)} placeholder={t(`السعر`)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={handleAddItemToSalesCart} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '11px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{t(`➕ إضافة`)}</button>
        </div>
        <div style={{ marginBottom: '20px', background: theme.bgMain, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{t(`حالة الدفع:`)}</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}><input type="radio" name="payStatus" checked={invoiceStatus === 'مدفوعة'} onChange={() => setInvoiceStatus('مدفوعة')} /> {t(`مدفوعة`)}</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}><input type="radio" name="payStatus" checked={invoiceStatus === 'غير مدفوعة'} onChange={() => setInvoiceStatus('غير مدفوعة')} /> {t(`غير مدفوعة (أجل)`)}</label>

          {invoiceStatus === 'مدفوعة' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>{t(`طريقة الدفع:`)}</span>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #10b981', background: theme.cardBg, color: theme.textDark, fontSize: '12px', outline: 'none' }}>
                <option value="نقد">{t(`نقد`)}</option>
                <option value="شبكة">{t(`شبكة`)}</option>
                <option value="حوالة">{t(`حوالة`)}</option>
              </select>
            </div>
          )}

          {invoiceStatus === 'غير مدفوعة' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f43f5e' }}>{t(`مدة الاستحقاق:`)}</span>
              <input type="text" value={dueDateInput} onChange={e => setDueDateInput(e.target.value)} placeholder={t(`مثال: 2026/10/01`)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #f43f5e', background: theme.cardBg, color: theme.textDark, fontSize: '12px', outline: 'none' }} />
            </div>
          )}
        </div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{t(`🛒 محتويات الفاتورة الحالية`)}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
          <thead><tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}><th style={{ padding: '8px' }}>{t(`المنتج`)}</th><th style={{ padding: '8px' }}>{t(`الوحدة`)}</th><th style={{ padding: '8px' }}>{t(`الكمية`)}</th><th style={{ padding: '8px' }}>{t(`السعر`)}</th><th style={{ padding: '8px' }}>{t(`المجموع`)}</th><th></th></tr></thead>
          <tbody>
            {cartItems.map((it, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '8px' }}>{it.name}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{it.unitType || 'قطعة'}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{it.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>{it.unitPrice} {t.currency}</td>
                <td style={{ padding: '8px', color: '#10b981', fontWeight: 'bold' }}>{it.subtotal} {t.currency}</td>
                <td style={{ padding: '8px' }}><button onClick={() => handleRemoveSalesCartItem(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✖</button></td>
              </tr>
            ))}
            {!cartItems.length && (<tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>{t(`لم يتم إضافة أي صنف للفاتورة بعد.`)}</td></tr>)}
          </tbody>
        </table>
        <button onClick={handleSaveSalesInvoice} disabled={!cartItems.length || isSubmittingSale} style={{ width: '100%', background: '#10b981', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>{t(`إتمام الدفع وإصدار الفاتورة 💳`)}</button>
      </div>
      <div style={{ background: '#020617', borderRadius: '16px', color: '#fff', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#38bdf8' }}>{t(`ملخص الحسبة التلقائية`)}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>{t(`المبلغ الخاضع للضريبة:`)}</span><strong>{cartSubtotal.toFixed(2)} {t.currency}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#94a3b8' }}>{t(`ضريبة القيمة المضافة (15%):`)}</span><strong>{cartTax.toFixed(2)} {t.currency}</strong></div>
          </div>
        </div>
        <div style={{ borderTop: '1px dashed #334155', paddingTop: '15px', marginTop: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}><span>{t(`الإجمالي النهائي:`)}</span><span style={{ color: '#38bdf8' }}>{cartGrandTotal.toFixed(2)} {t.currency}</span></div>
        </div>
      </div>
    </div>
  );
};

export default SalesBillingTab;

