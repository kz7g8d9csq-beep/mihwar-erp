const PosTab = ({
  t, theme, isDark,
  inventory, cartItems, setCartItems,
  posCustomerSearch, setPosCustomerSearch,
  posSelectedCustomerId, setPosSelectedCustomerId,
  filteredCustomersForPos,
  showPosPayModal, setShowPosPayModal,
  posPaymentMethod, setPosPaymentMethod,
  handleSavePosInvoice, isSubmittingSale,
  cartGrandTotal
}) => {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '20px' }}>
        <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>🛒 نقطة البيع السريعة</h3>
          <div style={{ marginBottom: '15px', background: theme.bgMain, padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
            <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>🔍 البحث واختيار العميل للفاتورة:</label>
            <input type="text" value={posCustomerSearch} onChange={e => setPosCustomerSearch(e.target.value)} placeholder="ابحث باسم المنشأة، السجل التجاري، الرقم الضريبي..." style={{ width: '100%', padding: '8px', borderRadius: '6px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', marginBottom: '6px', boxSizing: 'border-box', fontSize: '12px' }} />
            <select value={posSelectedCustomerId} onChange={e => setPosSelectedCustomerId(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', background: theme.cardBg, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '12px' }}>
              <option value="">-- عميل نقدي عام (افتراضي) --</option>
              {filteredCustomersForPos.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.nationalId || c.phone || 'نقدي'})</option>))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
            {inventory.map(prod => {
              const cartItem = cartItems.find(it => it.productId === prod.id);
              const qty = cartItem ? cartItem.quantity : 0;
              const updateQty = (newQ) => {
                if (isNaN(newQ) || newQ < 0) newQ = 0;
                if (newQ > prod.stock) newQ = prod.stock;
                if (newQ === 0) setCartItems(cartItems.filter(i => i.productId !== prod.id));
                else if (cartItem) setCartItems(cartItems.map(i => i.productId === prod.id ? { ...i, quantity: newQ, subtotal: Number((newQ * prod.price).toFixed(2)) } : i));
                else setCartItems([...cartItems, { productId: prod.id, name: prod.name, quantity: newQ, unitPrice: prod.price, subtotal: Number((newQ * prod.price).toFixed(2)) }]);
              };
              return (
                <div key={prod.id} style={{ background: theme.bgMain, border: `1px solid ${qty > 0 ? '#d97706' : theme.border}`, borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px' }}>
                  <div><h4 style={{ margin: '0 0 4px 0', fontSize: '13px' }}>{prod.name}</h4><span style={{ color: '#d97706', fontWeight: 'bold', fontSize: '12px' }}>{prod.price} {t.currency}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme.cardBg, borderRadius: '6px', padding: '2px', border: `1px solid ${theme.border}` }}>
                    <button onClick={() => updateQty(qty - 1)} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                    <input type="number" min="0" max={prod.stock} value={qty} onChange={(e) => updateQty(Number(e.target.value))} style={{ width: '45px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold', fontSize: '13px', color: theme.textDark, outline: 'none' }} />
                    <button onClick={() => updateQty(qty + 1)} style={{ background: '#d97706', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ background: '#020617', borderRadius: '16px', color: '#fff', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>محتويات السلة</h3>
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cartItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#0f172a', padding: '8px', borderRadius: '8px', fontSize: '12px' }}>
                  <span>{item.name} ({item.quantity})</span><strong style={{ color: '#38bdf8' }}>{item.subtotal} {t.currency}</strong>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ borderTop: '1px dashed #334155', paddingTop: '10px', margin: '15px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}><span>الإجمالي المستحق:</span><span style={{ color: '#38bdf8' }}>{cartGrandTotal.toFixed(2)} {t.currency}</span></div>
            </div>
            <button onClick={() => setShowPosPayModal(true)} disabled={!cartItems.length} style={{ width: '100%', background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إتمام الدفع وإصدار الفاتورة 💳</button>
          </div>
        </div>
      </div>

      {/* نافذة اختيار طريقة الدفع في POS */}
      {showPosPayModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3100, padding: '15px' }}>
          <div style={{ background: theme.cardBg, color: theme.textDark, padding: '30px', borderRadius: '20px', maxWidth: '420px', width: '100%', boxSizing: 'border-box', border: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900', color: '#10b981' }}>اختيار طريقة الدفع السريع</h3>
              <button onClick={() => setShowPosPayModal(false)} style={{ background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: theme.textMuted }}>✖</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>طريقة الدفع (نقداً أو شبكة):</label>
                <select value={posPaymentMethod} onChange={e => setPosPaymentMethod(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box' }}>
                  <option value="نقد">نقداً</option>
                  <option value="شبكة">شبكة</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={handleSavePosInvoice} disabled={isSubmittingSale} style={{ flex: 1, background: '#10b981', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>تأكيد وإصدار الفاتورة 🚀</button>
                <button type="button" onClick={() => setShowPosPayModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PosTab;

