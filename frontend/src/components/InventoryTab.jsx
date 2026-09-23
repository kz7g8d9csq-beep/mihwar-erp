const InventoryTab = ({
  t, theme, isDark, user,
  filteredInventory,
  inventorySearchQuery, setInventorySearchQuery,
  newProdName, setNewProdName,
  newProdPrice, setNewProdPrice,
  newProdStock, setNewProdStock,
  newItemCode, setNewItemCode,
  handleAddProduct,
  handleOpenEditProduct,
  handleDeleteProduct,
  handleExportInventory
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'cashier' ? '1fr' : '1fr 2fr', gap: '20px' }}>
      {user?.role !== 'cashier' && (
        <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '17px' }}>➕ إضافة منتج</h3>
          <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input type="text" placeholder="رقم الصنف (مثال: SKU-001)" value={newItemCode} onChange={e=>setNewItemCode(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
            <input type="text" placeholder={t.prodName} value={newProdName} onChange={e=>setNewProdName(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
            <input type="number" placeholder={t.prodPrice} value={newProdPrice} onChange={e=>setNewProdPrice(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
            <input type="number" placeholder={t.prodStock} value={newProdStock} onChange={e=>setNewProdStock(e.target.value)} style={{ padding: '12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none' }} />
            <button type="submit" style={{ background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>{t.saveProd}</button>
          </form>
        </div>
      )}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, fontSize: '17px' }}>{t.stockRepo}</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="text" value={inventorySearchQuery} onChange={e => setInventorySearchQuery(e.target.value)} placeholder="🔍 ابحث برقم الصنف أو الاسم..." style={{ padding: '6px 10px', borderRadius: '6px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '12px', width: '220px' }} />
            <button onClick={handleExportInventory} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>تصدير Excel</button>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '10px' }}>رقم الصنف</th>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Price</th>
              <th style={{ padding: '10px' }}>المخزون بالحبة وبالكرتون</th>
              <th style={{ padding: '10px' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(i => {
              const boxSize = Number(i.boxSize || 12);
              const cartons = (i.stock / boxSize).toFixed(1);
              return (
                <tr key={i.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: '#d97706' }}>{i.itemCode || 'SKU-001'}</td>
                  <td style={{ padding: '10px' }}>{i.name}</td>
                  <td style={{ padding: '10px' }}>{i.price}</td>
                  <td style={{ padding: '10px', color: '#10b981', fontWeight: 'bold' }}>
                    {i.stock} حبة <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'normal' }}>({cartons} كرتون)</span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleOpenEditProduct(i)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>تعديل ✏️</button>
                      <button onClick={() => handleDeleteProduct(i.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>حذف 🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTab;

