const fs = require('fs');

function applyAll() {
  // --- App.jsx ---
  let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

  // 1. invoices prop
  app = app.replace('filteredAlerts={filteredAlerts}', 'filteredAlerts={filteredAlerts} invoices={invoices}');

  // 2. States
  app = app.replace(
    "const [newProdCommission, setNewProdCommission] = useState('');",
    "const [newProdCommission, setNewProdCommission] = useState('');\\n  const [newBoxSize, setNewBoxSize] = useState('12');\\n  const [newCommissionType, setNewCommissionType] = useState('بالكرتون');"
  );
  app = app.replace(
    "const [editBoxSize, setEditBoxSize] = useState(12);",
    "const [editBoxSize, setEditBoxSize] = useState(12);\\n  const [editCommissionType, setEditCommissionType] = useState('بالكرتون');"
  );

  // 3. handleAddProduct
  app = app.replace(
    "const newProd = { id: Date.now(), name: newProdName, price: Number(newProdPrice), stock: Number(newProdStock || 0), boxSize: 12, cartonCommission: parseFloat(newProdCommission) || 0, itemCode: newItemCode.trim() || 'SKU-' + Math.floor(100 + Math.random() * 900) };",
    "const finalBoxSize = newCommissionType === 'بالقطعة' ? 1 : Number(newBoxSize || 12);\\n    const newProd = { id: Date.now(), name: newProdName, price: Number(newProdPrice), stock: Number(newProdStock || 0), boxSize: finalBoxSize, commissionType: newCommissionType, cartonCommission: parseFloat(newProdCommission) || 0, itemCode: newItemCode.trim() || 'SKU-' + Math.floor(100 + Math.random() * 900) };"
  );
  app = app.replace(
    "setNewProdName(''); setNewProdPrice(''); setNewProdStock(''); setNewItemCode(''); setNewProdCommission('');",
    "setNewProdName(''); setNewProdPrice(''); setNewProdStock(''); setNewItemCode(''); setNewProdCommission(''); setNewBoxSize('12'); setNewCommissionType('بالكرتون');"
  );

  // 4. handleOpenEditProduct
  app = app.replace(
    "setEditBoxSize(prod.boxSize ?? 12);",
    "setEditBoxSize(prod.boxSize ?? 12);\\n    setEditCommissionType(prod.commissionType || (prod.boxSize === 1 ? 'بالقطعة' : 'بالكرتون'));"
  );

  // 5. handleUpdateProduct
  app = app.replace(
    "const updated = inventory.map(item => item.id === editingProdId ? { ...item, name: editProdName, price: Number(editProdPrice), stock: Number(editProdStock), itemCode: editItemCode.trim() || item.itemCode, cartonCommission: parseFloat(editCartonCommission) || 0, boxSize: parseInt(editBoxSize) || 12 } : item);",
    "const finalBoxSize = editCommissionType === 'بالقطعة' ? 1 : (parseInt(editBoxSize) || 12);\\n    const updated = inventory.map(item => item.id === editingProdId ? { ...item, name: editProdName, price: Number(editProdPrice), stock: Number(editProdStock), itemCode: editItemCode.trim() || item.itemCode, cartonCommission: parseFloat(editCartonCommission) || 0, boxSize: finalBoxSize, commissionType: editCommissionType } : item);"
  );

  // 6. Pass props to InventoryTab
  app = app.replace(
    "newProdCommission={newProdCommission} setNewProdCommission={setNewProdCommission}",
    "newProdCommission={newProdCommission} setNewProdCommission={setNewProdCommission}\\n              newBoxSize={newBoxSize} setNewBoxSize={setNewBoxSize}\\n              newCommissionType={newCommissionType} setNewCommissionType={setNewCommissionType}"
  );

  // 7. Edit Product Form using regular expression matching to be safe
  const editRegex = /(<div><label[^>]*>عمولة الكرتون للمندوب \(ر\.س\):<\/label><input[^>]*value=\{editCartonCommission\}[^>]*><\/div>)\s*(<div><label[^>]*>سعة الكرتون \(عدد الحبات\):<\/label><input[^>]*value=\{editBoxSize\}[^>]*><\/div>)/;
  
  const editReplace = `<div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة:</label>
                <select value={editCommissionType} onChange={e=>setEditCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }}>
                  <option value="بالقطعة">بالقطعة</option>
                  <option value="بالكرتون">بالكرتون</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{editCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س)' : 'عمولة الكرتون (ر.س)'}</label>
                <input type="number" step="0.01" min="0" placeholder="مثال: 5.00" value={editCartonCommission} onChange={e=>setEditCartonCommission(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />
              </div>
              {editCommissionType === 'بالكرتون' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات):</label>
                  <input type="number" min="1" placeholder="الافتراضي: 12" value={editBoxSize} onChange={e=>setEditBoxSize(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />
                </div>
              )}`;
  
  if (editRegex.test(app)) {
    app = app.replace(editRegex, editReplace);
  } else {
    console.log("Failed to match Edit Form regex!");
  }
  fs.writeFileSync('frontend/src/App.jsx', app, 'utf8');


  // --- InventoryTab.jsx ---
  let inv = fs.readFileSync('frontend/src/components/InventoryTab.jsx', 'utf8');
  inv = inv.replace(
    "newProdCommission = '', setNewProdCommission,",
    "newProdCommission = '', setNewProdCommission,\\n    newBoxSize = '12', setNewBoxSize,\\n    newCommissionType = 'بالكرتون', setNewCommissionType,"
  );

  const addRegex = /(<div>\s*<label[^>]*>عمولة الكرتون للمندوب \(ر\.س\) \*:<\/label>\s*<input[^>]*value=\{newProdCommission\}[^>]*>\s*<\/div>)/;
              
  const addReplace = `<div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة *:</label>
                <select value={newCommissionType} onChange={e=>setNewCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }}>
                  <option value="بالقطعة">بالقطعة</option>
                  <option value="بالكرتون">بالكرتون</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{newCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س) *:' : 'عمولة الكرتون (ر.س) *:'}</label>
                <input type="number" step="0.01" min="0" placeholder="مثال: 5.00" value={newProdCommission} onChange={e=>setNewProdCommission(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />
              </div>
              {newCommissionType === 'بالكرتون' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات) *:</label>
                  <input type="number" min="1" placeholder="الافتراضي: 12" value={newBoxSize} onChange={e=>setNewBoxSize(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />
                </div>
              )}`;
  
  if (addRegex.test(inv)) {
    inv = inv.replace(addRegex, addReplace);
  } else {
    console.log("Failed to match Add Form regex!");
  }
  fs.writeFileSync('frontend/src/components/InventoryTab.jsx', inv, 'utf8');


  // --- HrTab.jsx ---
  let hr = fs.readFileSync('frontend/src/components/HrTab.jsx', 'utf8');
  
  hr = hr.replace('deductionsList = [], setDeductionsList', 'deductionsList = [], setDeductionsList,\\n  invoices = []');

  const tabSearch = \`              {[
                { id: 'employees', label: 'الموظفين' },
                { id: 'deductions', label: 'الخصومات' },
                { id: 'incentives', label: 'الحوافز والمكافآت' },
                { id: 'alerts', label: 'الوثائق والتنبيهات' }
              ]\`;
  const tabReplace = \`              {[
                { id: 'employees', label: 'الموظفين' },
                { id: 'deductions', label: 'الخصومات' },
                { id: 'incentives', label: 'الحوافز والمكافآت' },
                { id: 'commissions', label: 'العمولات' },
                { id: 'alerts', label: 'الوثائق والتنبيهات' }
              ]\`;
  hr = hr.replace(tabSearch, tabReplace);

  const incEndSearch = \`                  {deptIncentives.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا توجد حوافز مسجلة.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}\`;
  const commBlock = \`
          {hrSubTab === 'commissions' && (() => {
            const deptEmpsIds = deptEmps.map(e => e.id);
            const deptCommissions = (invoices || []).filter(inv => inv.salesRepId && deptEmpsIds.includes(Number(inv.salesRepId)));
            
            let totalCommissionSum = 0;
            let totalCartonsSum = 0;
            let totalPiecesSum = 0;
            const mappedCommissions = deptCommissions.map(inv => {
              const emp = employees.find(e => e.id === Number(inv.salesRepId));
              let cartons = 0;
              let pieces = 0;
              (inv.items || []).forEach(it => {
                const bSize = it.boxSize || 12;
                if (bSize === 1) pieces += Number(it.quantity);
                else cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / bSize)));
              });
              cartons = Math.floor(cartons * 100) / 100;
              
              const commAmount = Number(inv.totalCommission || 0);
              totalCommissionSum += commAmount;
              totalCartonsSum += cartons;
              totalPiecesSum += pieces;
              
              let qtyStr = '';
              if (cartons > 0) qtyStr += cartons + ' كرتون ';
              if (pieces > 0) qtyStr += (qtyStr ? 'و ' : '') + pieces + ' قطعة';
              if (!qtyStr) qtyStr = '0';

              return {
                id: inv.id,
                empName: emp ? emp.name : inv.salesRepName,
                idNumber: emp ? (emp.idNumber || emp.nationalId) : '-',
                invoiceNo: inv.invoiceNo,
                customerName: inv.customer ? (inv.customer.name || inv.customer) : 'عميل نقدي',
                date: inv.createdAt ? String(inv.createdAt).slice(0, 10) : '-',
                qtyStr,
                totalAmount: Number(inv.totalAmount || 0),
                commission: commAmount
              };
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ background: theme?.cardBg || '#1e293b', border: '1px solid ' + (theme?.border || '#334155'), padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8', marginBottom: '5px' }}>إجمالي الفواتير</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8' }}>{mappedCommissions.length}</div>
                  </div>
                  <div style={{ background: theme?.cardBg || '#1e293b', border: '1px solid ' + (theme?.border || '#334155'), padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8', marginBottom: '5px' }}>إجمالي الكمية المباعة</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{(totalCartonsSum > 0 ? Number(totalCartonsSum.toFixed(2)) + ' كرتون ' : '')}{(totalPiecesSum > 0 ? totalPiecesSum + ' قطعة' : '')}</div>
                  </div>
                  <div style={{ background: theme?.cardBg || '#1e293b', border: '1px solid ' + (theme?.border || '#334155'), padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8', marginBottom: '5px' }}>إجمالي العمولات المستحقة</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>{totalCommissionSum.toFixed(2)} ر.س</div>
                  </div>
                </div>
                
                <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: '1px solid ' + (theme?.border || '#334155'), padding: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '900px' }}>
                    <thead>
                      <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: '2px solid ' + (theme?.border || '#334155') }}>
                        <th style={{ padding: '12px' }}>اسم المندوب</th>
                        <th style={{ padding: '12px' }}>رقم الهوية</th>
                        <th style={{ padding: '12px' }}>رقم الفاتورة</th>
                        <th style={{ padding: '12px' }}>العميل</th>
                        <th style={{ padding: '12px' }}>التاريخ</th>
                        <th style={{ padding: '12px' }}>الكمية المباعة</th>
                        <th style={{ padding: '12px' }}>قيمة الفاتورة</th>
                        <th style={{ padding: '12px' }}>العمولة المستحقة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappedCommissions.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid ' + (theme?.border || '#334155') }}>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#38bdf8' }}>{c.empName}</td>
                          <td style={{ padding: '12px', color: theme?.textMuted || '#94a3b8' }}>{c.idNumber}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>#{c.invoiceNo}</td>
                          <td style={{ padding: '12px' }}>{c.customerName}</td>
                          <td style={{ padding: '12px' }} dir="ltr">{c.date}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981', textAlign: 'center' }}>{c.qtyStr}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{c.totalAmount.toFixed(2)} ر.س</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#8b5cf6', textAlign: 'center' }}>{c.commission.toFixed(2)} ر.س</td>
                        </tr>
                      ))}
                      {mappedCommissions.length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا توجد فواتير وعمولات مناديب مسجلة في هذا القسم.</td></tr>
                      )}
                    </tbody>
                    {mappedCommissions.length > 0 && (
                      <tfoot>
                        <tr style={{ background: isDark ? '#0f172a' : '#f1f5f9', fontWeight: 'bold', fontSize: '14px' }}>
                          <td colSpan="5" style={{ padding: '15px', textAlign: 'left', color: theme?.textDark || '#0f172a' }}>الإجمالي الكلي:</td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#10b981' }}>{(totalCartonsSum > 0 ? Number(totalCartonsSum.toFixed(2)) + ' كرتون ' : '')}{(totalPiecesSum > 0 ? totalPiecesSum + ' قطعة' : '')}</td>
                          <td style={{ padding: '15px' }}></td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#8b5cf6' }}>{totalCommissionSum.toFixed(2)} ر.س</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            );
          })()}\`;
  hr = hr.replace(incEndSearch, incEndSearch + '\\n' + commBlock);

  // exportDeptExcel
  const exportSearch = \`      </tr>\`;
  
      const excelTemplate = \\\`<html\`;
  const exportBlock = \`      </tr>\`;

      const deptEmpsIdsExport = deptEmpsList.map(e => e.id);
      const deptCommissionsExport = (invoices || []).filter(inv => inv.salesRepId && deptEmpsIdsExport.includes(Number(inv.salesRepId)));
      
      let commRows = '';
      let sumCartons = 0;
      let sumPieces = 0;
      let sumComms = 0;
      deptCommissionsExport.forEach((inv, idx) => {
          const emp = employees.find(e => e.id === Number(inv.salesRepId));
          let cartons = 0;
          let pieces = 0;
          (inv.items || []).forEach(it => { 
            const bSize = it.boxSize || 12;
            if (bSize === 1) pieces += Number(it.quantity);
            else cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / bSize)));
          });
          cartons = Math.floor(cartons * 100) / 100;
          
          let qtyStr = '';
          if (cartons > 0) qtyStr += cartons + ' كرتون ';
          if (pieces > 0) qtyStr += (qtyStr ? 'و ' : '') + pieces + ' قطعة';
          if (!qtyStr) qtyStr = '0';
          
          const commAmount = Number(inv.totalCommission || 0);
          sumCartons += cartons;
          sumPieces += pieces;
          sumComms += commAmount;
          
          const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
          commRows += \\\`<tr style="background-color: \${bgColor};">
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;">\${emp ? emp.name : inv.salesRepName}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:'\\\\\\\\@';">\${emp ? (emp.idNumber || emp.nationalId) : '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">#\${inv.invoiceNo}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">\${inv.customer ? (inv.customer.name || inv.customer) : 'عميل نقدي'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;" dir="ltr">\${inv.createdAt ? String(inv.createdAt).slice(0, 10) : '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;">\${qtyStr}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #8b5cf6;">\${commAmount.toFixed(2)} ر.س</td>
          </tr>\\\`;
      });
      
      let totalQtyStr = '';
      if (sumCartons > 0) totalQtyStr += Number(sumCartons.toFixed(2)) + ' كرتون ';
      if (sumPieces > 0) totalQtyStr += (totalQtyStr ? 'و ' : '') + sumPieces + ' قطعة';
      if (!totalQtyStr) totalQtyStr = '0';

      if (deptCommissionsExport.length > 0) {
        commRows += \\\`<tr style="background-color: #e2e8f0; font-weight: bold;">
          <td colspan="5" style="border: 1px solid #94a3b8; padding: 12px; text-align: left; font-size: 13px; color: #0f172a;">إجمالي العمولات والكمية المباعة</td>
          <td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #10b981; font-size: 13px;">\${totalQtyStr}</td>
          <td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #8b5cf6; font-size: 14px;">\${sumComms.toFixed(2)} ر.س</td>
        </tr>\\\`;
      }
  
      const excelTemplate = \\\`<html\`;
  hr = hr.replace(exportSearch, exportBlock);

  const tBodyEndSearch = \`            </tbody>
          </table>
        </body>\`;
  const tBodyEndReplace = \`            </tbody>
          </table>
          \${deptCommissionsExport.length > 0 ? \\\`
            <br><br>
            <table>
              <thead>
                <tr>
                  <th colspan="7" style="background-color: #1e293b; color: #ffffff; font-size: 16px; padding: 12px; text-align: center; font-weight: bold;">سجل عمولات المناديب</th>
                </tr>
                <tr style="background-color: #e2e8f0;">
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">اسم المندوب</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">رقم الهوية</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">رقم الفاتورة</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">العميل</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">التاريخ</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">الكمية المباعة</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">قيمة العمولة المستحقة</th>
                </tr>
              </thead>
              <tbody>\${commRows}</tbody>
            </table>
          \\\` : ''}
        </body>\`;
  hr = hr.replace(tBodyEndSearch, tBodyEndReplace);
  fs.writeFileSync('frontend/src/components/HrTab.jsx', hr, 'utf8');


  // --- SalesBillingTab.jsx ---
  let sales = fs.readFileSync('frontend/src/components/SalesBillingTab.jsx', 'utf8');

  const blueBoxSearch = \`        {selectedProd && (
          <div style={{ fontSize: '12px', color: '#8b5cf6', background: '#8b5cf615', padding: '6px 12px', borderRadius: '6px', marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span>سعة الكرتون: <strong>{selectedProd.boxSize || 12} حبة</strong></span>
            <span>عمولة الكرتون: <strong>{Number(selectedProd.cartonCommission || selectedProd.commissionPerBox || 0).toFixed(2)} {currency}</strong></span>
          </div>
        )}\`;
  const blueBoxReplace = \`        {selectedProd && (
          <div style={{ fontSize: '12px', color: '#8b5cf6', background: '#8b5cf615', padding: '6px 12px', borderRadius: '6px', marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            {Number(selectedProd.boxSize) === 1 ? (
              <span>عمولة القطعة / الحبة: <strong>{Number(selectedProd.cartonCommission || selectedProd.commissionPerBox || 0).toFixed(2)} {currency}</strong></span>
            ) : (
              <>
                <span>سعة الكرتون: <strong>{selectedProd.boxSize || 12} حبة</strong></span>
                <span>عمولة الكرتون: <strong>{Number(selectedProd.cartonCommission || selectedProd.commissionPerBox || 0).toFixed(2)} {currency}</strong></span>
              </>
            )}
          </div>
        )}\`;
  sales = sales.replace(blueBoxSearch, blueBoxReplace);

  const selectSearch = \`              <select 
                value={salesUnitType} 
                onChange={e => setSalesUnitType(e.target.value)} 
                style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \\\`1px solid \\\${theme.border}\\\`, outline: 'none', boxSizing: 'border-box', fontSize: '13px' }}>
                <option value="حبة">{tr('حبة')}</option>
                <option value="كرتون">{tr('كرتون')}</option>
              </select>\`;
  const selectReplace = \`              <select 
                value={salesUnitType} 
                onChange={e => setSalesUnitType(e.target.value)} 
                style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), outline: 'none', boxSizing: 'border-box', fontSize: '13px' }}>
                <option value="حبة">{tr('حبة')}</option>
                {(!selectedProd || Number(selectedProd.boxSize) > 1) && (
                  <option value="كرتون">{tr('كرتون')}</option>
                )}
              </select>\`;
  sales = sales.replace(selectSearch, selectReplace);
  fs.writeFileSync('frontend/src/components/SalesBillingTab.jsx', sales, 'utf8');
}

applyAll();
console.log('All updates successfully applied without backtick style corruption!');
