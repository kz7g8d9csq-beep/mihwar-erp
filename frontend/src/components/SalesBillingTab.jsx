import React, { useState } from 'react';

const SalesBillingTab = ({
  t, theme, isDark,
  inventory = [], cartItems = [],
  employees = [], // قائمة الموظفين لاختيار المندوب
  selectedSalesRepId, setSelectedSalesRepId,
  salesCustomerSearch, setSalesCustomerSearch,
  selectedCustomerId, setSelectedCustomerId,
  filteredCustomersForSales = [],
  selectedProductId, setSelectedProductId,
  salesUnitType, setSalesUnitType,
  itemQty, setItemQty,
  itemPrice, setItemPrice,
  invoiceStatus, setInvoiceStatus,
  paymentMethod, setPaymentMethod,
  dueDateInput, setDueDateInput,
  handleAddItemToSalesCart, handleRemoveSalesCartItem,
  handleSaveSalesInvoice, isSubmittingSale,
  cartSubtotal = 0, cartTax = 0, cartGrandTotal = 0
}) => {

  // دعم أمان للترجمة والعملة
  const tr = (key, fallback) => {
    if (typeof t === 'function') {
      try { return t(key) || fallback || key; } catch (e) { return fallback || key; }
    }
    if (t && typeof t === 'object') return t[key] || fallback || key;
    return fallback || key;
  };

  const currency = (t && t.currency) || 'ر.س';

  // حالة احتياطية محلية للمندوب في حال لم تُمرر من App.jsx
  const [localSalesRepId, setLocalSalesRepId] = useState('');
  const currentSalesRepId = selectedSalesRepId !== undefined ? selectedSalesRepId : localSalesRepId;
  const setCurrentSalesRepId = setSelectedSalesRepId || setLocalSalesRepId;

  // الموظف/المندوب المختار حالياً
  const selectedSalesRep = (employees || []).find(e => String(e.id) === String(currentSalesRepId));

  // المنتج المختار حالياً من القائمة
  const selectedProd = (inventory || []).find(x => x.id === Number(selectedProductId));

  // دالة حساب عمولة الصنف في السلة آلياً
  const getItemCommission = (it) => {
    if (it.itemCommission !== undefined && it.itemCommission !== null && it.itemCommission !== 0) {
      return Number(it.itemCommission);
    }
    const p = (inventory || []).find(x => x.id === it.productId || x.name === it.name);
    const cartonComm = Number(p?.cartonCommission || p?.commissionPerBox || 0);
    const boxSize = Number(p?.boxSize || 12);
    const isCarton = (it.unitType === 'كرتون' || it.unit === 'كرتون');
    const cartonsCount = isCarton ? Number(it.quantity) : (Number(it.quantity) / (boxSize || 1));
    return cartonsCount * cartonComm;
  };

  // دالة حساب تكلفة الصنف لتقدير صافي الربح
  const getItemCost = (it) => {
    const p = (inventory || []).find(x => x.id === it.productId || x.name === it.name);
    const unitCost = Number(p?.cost || 0);
    const boxSize = Number(p?.boxSize || 12);
    const isCarton = (it.unitType === 'كرتون' || it.unit === 'كرتون');
    const piecesCount = isCarton ? (Number(it.quantity) * boxSize) : Number(it.quantity);
    return piecesCount * unitCost;
  };

  // إجمالي عمولات السلة الحالية
  const totalCartCommission = cartItems.reduce((acc, it) => acc + getItemCommission(it), 0);
  
  // إجمالي تكلفة البضاعة المباعة بالسلة
  const totalCartCost = cartItems.reduce((acc, it) => acc + getItemCost(it), 0);

  // صافي ربح الفاتورة التقديري للشركة (المبيعات - التكلفة - العمولة إن وُجد مندوب)
  const estimatedNetProfit = Math.max(0, cartSubtotal - totalCartCost - (currentSalesRepId ? totalCartCommission : 0));

  const salesRepsList = (employees || []).filter(emp => {
    const deptName = (emp.dept || emp.department || '').trim();
    const roleName = (emp.role || '').trim();
    return (
      deptName.includes('مبيعات') || 
      deptName.includes('توزيع') || 
      deptName.includes('مندوب') ||
      roleName.includes('مندوب') || 
      roleName.includes('مبيعات')
    );
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '20px' }}>
      
      {/* القسم الرئيسي: إدخال الفاتورة والأصناف */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#d97706' }}>
          {tr('⚡ إصدار فاتورة بيع جديدة')}
        </h2>

        {/* 1. صف اختيار العميل والمندوب المسوق */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          
          {/* اختيار العميل */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
              {tr('🔍 بحث واختيار العميل:')}
            </label>
            <input 
              type="text" 
              value={salesCustomerSearch} 
              onChange={e => setSalesCustomerSearch(e.target.value)} 
              placeholder={tr('اكتب اسم المنشأة أو العميل...')} 
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', marginBottom: '6px', boxSizing: 'border-box', fontSize: '12px' }} 
            />
            <select 
              value={selectedCustomerId} 
              onChange={e => setSelectedCustomerId(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '13px' }}>
              <option value="">{tr('-- عميل نقدي عام (افتراضي) --')}</option>
              {(filteredCustomersForSales || []).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* اختيار المندوب / مسؤول البيع */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#8b5cf6' }}>
              {tr('👤 المندوب / مسؤول المبيعات:')}
            </label>
            <div style={{ height: '39px', marginBottom: '6px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: theme.textMuted }}>
                {currentSalesRepId ? `المندوب المحدد: ${selectedSalesRep?.name || ''}` : 'حدد المندوب لاحتساب عمولة الكراتين له'}
              </span>
            </div>
            <select 
              value={currentSalesRepId} 
              onChange={e => setCurrentSalesRepId(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${currentSalesRepId ? '#8b5cf6' : theme.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '13px', fontWeight: currentSalesRepId ? 'bold' : 'normal' }}>
              <option value="">{tr('-- بدون مندوب (مبيعات مباشرة) --')}</option>
              {salesRepsList.length === 0 && (
                <option value="" disabled>-- لا يوجد موظفون مسجلون في قسم المبيعات --</option>
              )}
              {salesRepsList.map(rep => (
                <option key={rep.id} value={rep.id}>
                  {rep.name} {rep.role ? `(${rep.role})` : ''}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* 2. صف اختيار المنتج وإضافته للسلة */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.1fr 1fr 1.1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{tr('اختيار المنتج')}</label>
            <select 
              value={selectedProductId} 
              onChange={e => { 
                setSelectedProductId(e.target.value); 
                const p = (inventory || []).find(x => x.id === Number(e.target.value)); 
                if (p) setItemPrice(p.price); 
              }} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '13px' }}>
              <option value="">{tr('-- اختر المنتج --')}</option>
              {(inventory || []).map(p => (
                <option key={p.id} value={p.id}>{p.name} ({tr('متوفر:')} {p.stock})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{tr('الوحدة')}</label>
            <select 
              value={salesUnitType} 
              onChange={e => setSalesUnitType(e.target.value)} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '13px' }}>
              <option value="قطعة">{tr('قطعة')}</option>
              <option value="كرتون">{tr('كرتون')}</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{tr('الكمية')}</label>
            <div style={{ display: 'flex', alignItems: 'center', background: theme.bgMain, borderRadius: '8px', border: `1px solid ${theme.border}`, padding: '3px' }}>
              <button type="button" onClick={() => setItemQty(Math.max(1, itemQty - 1))} style={{ background: '#ef4444', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
              <input type="number" min="1" value={itemQty} onChange={e => setItemQty(Math.max(1, Number(e.target.value)))} style={{ width: '35px', textAlign: 'center', border: 'none', background: 'transparent', fontWeight: 'bold', color: theme.textDark, outline: 'none', fontSize: '13px' }} />
              <button type="button" onClick={() => setItemQty(itemQty + 1)} style={{ background: '#d97706', color: '#fff', border: 'none', width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>{tr('السعر')} ({currency})</label>
            <input 
              type="number" 
              value={itemPrice} 
              onChange={e => setItemPrice(e.target.value)} 
              placeholder={tr('السعر')} 
              style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '13px' }} 
            />
          </div>

          <button 
            type="button"
            onClick={handleAddItemToSalesCart} 
            style={{ background: '#d97706', color: '#fff', border: 'none', padding: '11px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {tr('➕ إضافة')}
          </button>
        </div>

        {/* تفاصيل عمولة وسعة كرتون المنتج المختار */}
        {selectedProd && (
          <div style={{ fontSize: '12px', color: '#8b5cf6', background: '#8b5cf615', padding: '6px 12px', borderRadius: '6px', marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span>📦 سعة الكرتون: <strong>{selectedProd.boxSize || 12} حبة</strong></span>
            <span>💰 عمولة الكرتون: <strong>{Number(selectedProd.cartonCommission || selectedProd.commissionPerBox || 0).toFixed(2)} {currency}</strong></span>
          </div>
        )}

        {/* 3. شريط حالة الدفع */}
        <div style={{ marginBottom: '20px', background: theme.bgMain, padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{tr('حالة الدفع:')}</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="radio" name="payStatus" checked={invoiceStatus === 'مدفوعة'} onChange={() => setInvoiceStatus('مدفوعة')} /> {tr('مدفوعة')}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
            <input type="radio" name="payStatus" checked={invoiceStatus === 'غير مدفوعة'} onChange={() => setInvoiceStatus('غير مدفوعة')} /> {tr('غير مدفوعة (أجل)')}
          </label>

          {invoiceStatus === 'مدفوعة' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>{tr('طريقة الدفع:')}</span>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #10b981', background: theme.cardBg, color: theme.textDark, fontSize: '12px', outline: 'none' }}>
                <option value="نقد">{tr('نقد')}</option>
                <option value="شبكة">{tr('شبكة')}</option>
                <option value="حوالة">{tr('حوالة')}</option>
              </select>
            </div>
          )}

          {invoiceStatus === 'غير مدفوعة' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f43f5e' }}>{tr('مدة الاستحقاق:')}</span>
              <input type="text" value={dueDateInput} onChange={e => setDueDateInput(e.target.value)} placeholder={tr('مثال: 2026/10/01')} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #f43f5e', background: theme.cardBg, color: theme.textDark, fontSize: '12px', outline: 'none' }} />
            </div>
          )}
        </div>

        {/* 4. جدول محتويات الفاتورة مع عمود العمولة */}
        <h3 style={{ margin: '0 0 10px 0', fontSize: '15px' }}>{tr('🛒 محتويات الفاتورة الحالية')}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '10px', textAlign: 'right' }}>{tr('المنتج')}</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>{tr('الوحدة')}</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>{tr('الكمية')}</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>{tr('السعر')}</th>
              <th style={{ padding: '10px', textAlign: 'center', color: '#8b5cf6' }}>{tr('العمولة')}</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>{tr('المجموع')}</th>
              <th style={{ padding: '10px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((it, idx) => {
              const comm = getItemCommission(it);
              return (
                <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{it.name}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{it.unitType || 'قطعة'}</td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{it.quantity}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{Number(it.unitPrice || 0).toFixed(2)} {currency}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#8b5cf6', fontWeight: 'bold' }}>
                    {comm > 0 ? `${comm.toFixed(2)} ${currency}` : '-'}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>
                    {Number(it.subtotal || 0).toFixed(2)} {currency}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button type="button" onClick={() => handleRemoveSalesCartItem(idx)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>✖</button>
                  </td>
                </tr>
              );
            })}
            {!cartItems.length && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '25px', color: theme.textMuted }}>
                  {tr('لم يتم إضافة أي صنف للفاتورة بعد.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <button 
          type="button"
          onClick={handleSaveSalesInvoice} 
          disabled={!cartItems.length || isSubmittingSale} 
          style={{ width: '100%', background: '#10b981', color: '#fff', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', opacity: (!cartItems.length || isSubmittingSale) ? 0.6 : 1 }}>
          {isSubmittingSale ? tr('جاري الحفظ...') : tr('إتمام الدفع وإصدار الفاتورة 💳')}
        </button>
      </div>

      {/* القسم الجانبي: ملخص الحسبة والأرباح والعمولات */}
      <div style={{ background: '#020617', borderRadius: '16px', color: '#fff', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#38bdf8' }}>{tr('ملخص الحسبة التلقائية')}</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>{tr('المبلغ الخاضع للضريبة:')}</span>
              <strong>{cartSubtotal.toFixed(2)} {currency}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>{tr('ضريبة القيمة المضافة (15%):')}</span>
              <strong>{cartTax.toFixed(2)} {currency}</strong>
            </div>
            
            <div style={{ borderTop: '1px solid #1e293b', paddingTop: '10px', marginTop: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 'bold' }}>
                <span>{tr('الإجمالي النهائي:')}</span>
                <span style={{ color: '#38bdf8' }}>{cartGrandTotal.toFixed(2)} {currency}</span>
              </div>
            </div>

            {/* تفصيل عمولة المندوب وصافي ربح الفاتورة */}
            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', marginTop: '15px', border: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#a855f7' }}>
                📊 تحليل أرباح وعمولات الفاتورة:
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>المندوب المسؤول:</span>
                <span style={{ fontWeight: 'bold', color: currentSalesRepId ? '#38bdf8' : '#64748b' }}>
                  {selectedSalesRep?.name || 'مبيعات مباشرة'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>عمولة المندوب المستحقة:</span>
                <strong style={{ color: '#8b5cf6' }}>{totalCartCommission.toFixed(2)} {currency}</strong>
              </div>

              <div style={{ borderTop: '1px dashed #334155', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#10b981' }}>صافي ربح الشركة المقدر:</span>
                <strong style={{ color: '#10b981' }}>{estimatedNetProfit.toFixed(2)} {currency}</strong>
              </div>
            </div>

          </div>
        </div>

        <div style={{ borderTop: '1px dashed #334155', paddingTop: '15px', marginTop: '20px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
          يتم احتساب العمولات وصافي الربح آلياً وتوثيقها في النظام فور الحفظ
        </div>
      </div>

    </div>
  );
};

export default SalesBillingTab;