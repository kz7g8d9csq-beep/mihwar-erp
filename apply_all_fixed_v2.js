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
  
  const editReplace = "<div>\\n" +
"                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة:</label>\\n" +
"                <select value={editCommissionType} onChange={e=>setEditCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }}>\\n" +
"                  <option value=\"بالقطعة\">بالقطعة</option>\\n" +
"                  <option value=\"بالكرتون\">بالكرتون</option>\\n" +
"                </select>\\n" +
"              </div>\\n" +
"              <div>\\n" +
"                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{editCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س)' : 'عمولة الكرتون (ر.س)'}</label>\\n" +
"                <input type=\"number\" step=\"0.01\" min=\"0\" placeholder=\"مثال: 5.00\" value={editCartonCommission} onChange={e=>setEditCartonCommission(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />\\n" +
"              </div>\\n" +
"              {editCommissionType === 'بالكرتون' && (\\n" +
"                <div>\\n" +
"                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات):</label>\\n" +
"                  <input type=\"number\" min=\"1\" placeholder=\"الافتراضي: 12\" value={editBoxSize} onChange={e=>setEditBoxSize(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />\\n" +
"                </div>\\n" +
"              )}";
  
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
              
  const addReplace = "<div>\\n" +
"                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة *:</label>\\n" +
"                <select value={newCommissionType} onChange={e=>setNewCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }}>\\n" +
"                  <option value=\"بالقطعة\">بالقطعة</option>\\n" +
"                  <option value=\"بالكرتون\">بالكرتون</option>\\n" +
"                </select>\\n" +
"              </div>\\n" +
"              <div>\\n" +
"                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{newCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س) *:' : 'عمولة الكرتون (ر.س) *:'}</label>\\n" +
"                <input type=\"number\" step=\"0.01\" min=\"0\" placeholder=\"مثال: 5.00\" value={newProdCommission} onChange={e=>setNewProdCommission(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />\\n" +
"              </div>\\n" +
"              {newCommissionType === 'بالكرتون' && (\\n" +
"                <div>\\n" +
"                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات) *:</label>\\n" +
"                  <input type=\"number\" min=\"1\" placeholder=\"الافتراضي: 12\" value={newBoxSize} onChange={e=>setNewBoxSize(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />\\n" +
"                </div>\\n" +
"              )}";
  
  if (addRegex.test(inv)) {
    inv = inv.replace(addRegex, addReplace);
  } else {
    console.log("Failed to match Add Form regex!");
  }
  fs.writeFileSync('frontend/src/components/InventoryTab.jsx', inv, 'utf8');


  // --- HrTab.jsx ---
  let hr = fs.readFileSync('frontend/src/components/HrTab.jsx', 'utf8');
  
  hr = hr.replace('deductionsList = [], setDeductionsList', 'deductionsList = [], setDeductionsList,\\n  invoices = []');

  const tabSearch = "              {[\\n" +
"                { id: 'employees', label: 'الموظفين' },\\n" +
"                { id: 'deductions', label: 'الخصومات' },\\n" +
"                { id: 'incentives', label: 'الحوافز والمكافآت' },\\n" +
"                { id: 'alerts', label: 'الوثائق والتنبيهات' }\\n" +
"              ]";
  const tabReplace = "              {[\\n" +
"                { id: 'employees', label: 'الموظفين' },\\n" +
"                { id: 'deductions', label: 'الخصومات' },\\n" +
"                { id: 'incentives', label: 'الحوافز والمكافآت' },\\n" +
"                { id: 'commissions', label: 'العمولات' },\\n" +
"                { id: 'alerts', label: 'الوثائق والتنبيهات' }\\n" +
"              ]";
  hr = hr.replace(tabSearch, tabReplace);

  const incEndSearch = "                  {deptIncentives.length === 0 && (\\n" +
"                    <tr><td colSpan=\"5\" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا توجد حوافز مسجلة.</td></tr>\\n" +
"                  )}\\n" +
"                </tbody>\\n" +
"              </table>\\n" +
"            </div>\\n" +
"          )}";

  const commBlock = "\\n" +
"          {hrSubTab === 'commissions' && (() => {\\n" +
"            const deptEmpsIds = deptEmps.map(e => e.id);\\n" +
"            const deptCommissions = (invoices || []).filter(inv => inv.salesRepId && deptEmpsIds.includes(Number(inv.salesRepId)));\\n" +
"            \\n" +
"            let totalCommissionSum = 0;\\n" +
"            let totalCartonsSum = 0;\\n" +
"            let totalPiecesSum = 0;\\n" +
"            const mappedCommissions = deptCommissions.map(inv => {\\n" +
"              const emp = employees.find(e => e.id === Number(inv.salesRepId));\\n" +
"              let cartons = 0;\\n" +
"              let pieces = 0;\\n" +
"              (inv.items || []).forEach(it => {\\n" +
"                const bSize = it.boxSize || 12;\\n" +
"                if (bSize === 1) pieces += Number(it.quantity);\\n" +
"                else cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / bSize)));\\n" +
"              });\\n" +
"              cartons = Math.floor(cartons * 100) / 100;\\n" +
"              \\n" +
"              const commAmount = Number(inv.totalCommission || 0);\\n" +
"              totalCommissionSum += commAmount;\\n" +
"              totalCartonsSum += cartons;\\n" +
"              totalPiecesSum += pieces;\\n" +
"              \\n" +
"              let qtyStr = '';\\n" +
"              if (cartons > 0) qtyStr += cartons + ' كرتون ';\\n" +
"              if (pieces > 0) qtyStr += (qtyStr ? 'و ' : '') + pieces + ' قطعة';\\n" +
"              if (!qtyStr) qtyStr = '0';\\n" +
"\\n" +
"              return {\\n" +
"                id: inv.id,\\n" +
"                empName: emp ? emp.name : inv.salesRepName,\\n" +
"                idNumber: emp ? (emp.idNumber || emp.nationalId) : '-',\\n" +
"                invoiceNo: inv.invoiceNo,\\n" +
"                customerName: inv.customer ? (inv.customer.name || inv.customer) : 'عميل نقدي',\\n" +
"                date: inv.createdAt ? String(inv.createdAt).slice(0, 10) : '-',\\n" +
"                qtyStr,\\n" +
"                totalAmount: Number(inv.totalAmount || 0),\\n" +
"                commission: commAmount\\n" +
"              };\\n" +
"            });\\n" +
"\\n" +
"            return (\\n" +
"              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>\\n" +
"                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>\\n" +
"                  <div style={{ background: theme?.cardBg || '#1e293b', border: '1px solid ' + (theme?.border || '#334155'), padding: '15px', borderRadius: '12px', textAlign: 'center' }}>\\n" +
"                    <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8', marginBottom: '5px' }}>إجمالي الفواتير</div>\\n" +
"                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8' }}>{mappedCommissions.length}</div>\\n" +
"                  </div>\\n" +
"                  <div style={{ background: theme?.cardBg || '#1e293b', border: '1px solid ' + (theme?.border || '#334155'), padding: '15px', borderRadius: '12px', textAlign: 'center' }}>\\n" +
"                    <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8', marginBottom: '5px' }}>إجمالي الكمية المباعة</div>\\n" +
"                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{(totalCartonsSum > 0 ? Number(totalCartonsSum.toFixed(2)) + ' كرتون ' : '')}{(totalPiecesSum > 0 ? totalPiecesSum + ' قطعة' : '')}</div>\\n" +
"                  </div>\\n" +
"                  <div style={{ background: theme?.cardBg || '#1e293b', border: '1px solid ' + (theme?.border || '#334155'), padding: '15px', borderRadius: '12px', textAlign: 'center' }}>\\n" +
"                    <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8', marginBottom: '5px' }}>إجمالي العمولات المستحقة</div>\\n" +
"                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>{totalCommissionSum.toFixed(2)} ر.س</div>\\n" +
"                  </div>\\n" +
"                </div>\\n" +
"                \\n" +
"                <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: '1px solid ' + (theme?.border || '#334155'), padding: '20px', overflowX: 'auto' }}>\\n" +
"                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '900px' }}>\\n" +
"                    <thead>\\n" +
"                      <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: '2px solid ' + (theme?.border || '#334155') }}>\\n" +
"                        <th style={{ padding: '12px' }}>اسم المندوب</th>\\n" +
"                        <th style={{ padding: '12px' }}>رقم الهوية</th>\\n" +
"                        <th style={{ padding: '12px' }}>رقم الفاتورة</th>\\n" +
"                        <th style={{ padding: '12px' }}>العميل</th>\\n" +
"                        <th style={{ padding: '12px' }}>التاريخ</th>\\n" +
"                        <th style={{ padding: '12px' }}>الكمية المباعة</th>\\n" +
"                        <th style={{ padding: '12px' }}>قيمة الفاتورة</th>\\n" +
"                        <th style={{ padding: '12px' }}>العمولة المستحقة</th>\\n" +
"                      </tr>\\n" +
"                    </thead>\\n" +
"                    <tbody>\\n" +
"                      {mappedCommissions.map(c => (\\n" +
"                        <tr key={c.id} style={{ borderBottom: '1px solid ' + (theme?.border || '#334155') }}>\\n" +
"                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#38bdf8' }}>{c.empName}</td>\\n" +
"                          <td style={{ padding: '12px', color: theme?.textMuted || '#94a3b8' }}>{c.idNumber}</td>\\n" +
"                          <td style={{ padding: '12px', fontWeight: 'bold' }}>#{c.invoiceNo}</td>\\n" +
"                          <td style={{ padding: '12px' }}>{c.customerName}</td>\\n" +
"                          <td style={{ padding: '12px' }} dir=\"ltr\">{c.date}</td>\\n" +
"                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981', textAlign: 'center' }}>{c.qtyStr}</td>\\n" +
"                          <td style={{ padding: '12px', textAlign: 'center' }}>{c.totalAmount.toFixed(2)} ر.س</td>\\n" +
"                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#8b5cf6', textAlign: 'center' }}>{c.commission.toFixed(2)} ر.س</td>\\n" +
"                        </tr>\\n" +
"                      ))}\\n" +
"                      {mappedCommissions.length === 0 && (\\n" +
"                        <tr><td colSpan=\"8\" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا توجد فواتير وعمولات مناديب مسجلة في هذا القسم.</td></tr>\\n" +
"                      )}\\n" +
"                    </tbody>\\n" +
"                    {mappedCommissions.length > 0 && (\\n" +
"                      <tfoot>\\n" +
"                        <tr style={{ background: isDark ? '#0f172a' : '#f1f5f9', fontWeight: 'bold', fontSize: '14px' }}>\\n" +
"                          <td colSpan=\"5\" style={{ padding: '15px', textAlign: 'left', color: theme?.textDark || '#0f172a' }}>الإجمالي الكلي:</td>\\n" +
"                          <td style={{ padding: '15px', textAlign: 'center', color: '#10b981' }}>{(totalCartonsSum > 0 ? Number(totalCartonsSum.toFixed(2)) + ' كرتون ' : '')}{(totalPiecesSum > 0 ? totalPiecesSum + ' قطعة' : '')}</td>\\n" +
"                          <td style={{ padding: '15px' }}></td>\\n" +
"                          <td style={{ padding: '15px', textAlign: 'center', color: '#8b5cf6' }}>{totalCommissionSum.toFixed(2)} ر.س</td>\\n" +
"                        </tr>\\n" +
"                      </tfoot>\\n" +
"                    )}\\n" +
"                  </table>\\n" +
"                </div>\\n" +
"              </div>\\n" +
"            );\\n" +
"          })()}";
  hr = hr.replace(incEndSearch, incEndSearch + commBlock);

  // exportDeptExcel
  const exportSearch = "      </tr>`;\\n" +
"  \\n" +
"      const excelTemplate = `<html";
  const exportBlock = "      </tr>`;\\n" +
"\\n" +
"      const deptEmpsIdsExport = deptEmpsList.map(e => e.id);\\n" +
"      const deptCommissionsExport = (invoices || []).filter(inv => inv.salesRepId && deptEmpsIdsExport.includes(Number(inv.salesRepId)));\\n" +
"      \\n" +
"      let commRows = '';\\n" +
"      let sumCartons = 0;\\n" +
"      let sumPieces = 0;\\n" +
"      let sumComms = 0;\\n" +
"      deptCommissionsExport.forEach((inv, idx) => {\\n" +
"          const emp = employees.find(e => e.id === Number(inv.salesRepId));\\n" +
"          let cartons = 0;\\n" +
"          let pieces = 0;\\n" +
"          (inv.items || []).forEach(it => { \\n" +
"            const bSize = it.boxSize || 12;\\n" +
"            if (bSize === 1) pieces += Number(it.quantity);\\n" +
"            else cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / bSize)));\\n" +
"          });\\n" +
"          cartons = Math.floor(cartons * 100) / 100;\\n" +
"          \\n" +
"          let qtyStr = '';\\n" +
"          if (cartons > 0) qtyStr += cartons + ' كرتون ';\\n" +
"          if (pieces > 0) qtyStr += (qtyStr ? 'و ' : '') + pieces + ' قطعة';\\n" +
"          if (!qtyStr) qtyStr = '0';\\n" +
"          \\n" +
"          const commAmount = Number(inv.totalCommission || 0);\\n" +
"          sumCartons += cartons;\\n" +
"          sumPieces += pieces;\\n" +
"          sumComms += commAmount;\\n" +
"          \\n" +
"          const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';\\n" +
"          commRows += `<tr style=\"background-color: ${bgColor};\">\\n" +
"            <td style=\"border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;\">${emp ? emp.name : inv.salesRepName}</td>\\n" +
"            <td style=\"border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:'\\\\@';\">${emp ? (emp.idNumber || emp.nationalId) : '-'}</td>\\n" +
"            <td style=\"border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;\">#${inv.invoiceNo}</td>\\n" +
"            <td style=\"border: 1px solid #cbd5e1; padding: 10px; text-align: right;\">${inv.customer ? (inv.customer.name || inv.customer) : 'عميل نقدي'}</td>\\n" +
"            <td style=\"border: 1px solid #cbd5e1; padding: 10px; text-align: center;\" dir=\"ltr\">${inv.createdAt ? String(inv.createdAt).slice(0, 10) : '-'}</td>\\n" +
"            <td style=\"border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;\">${qtyStr}</td>\\n" +
"            <td style=\"border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #8b5cf6;\">${commAmount.toFixed(2)} ر.س</td>\\n" +
"          </tr>`;\\n" +
"      });\\n" +
"      \\n" +
"      let totalQtyStr = '';\\n" +
"      if (sumCartons > 0) totalQtyStr += Number(sumCartons.toFixed(2)) + ' كرتون ';\\n" +
"      if (sumPieces > 0) totalQtyStr += (totalQtyStr ? 'و ' : '') + sumPieces + ' قطعة';\\n" +
"      if (!totalQtyStr) totalQtyStr = '0';\\n" +
"\\n" +
"      if (deptCommissionsExport.length > 0) {\\n" +
"        commRows += `<tr style=\"background-color: #e2e8f0; font-weight: bold;\">\\n" +
"          <td colspan=\"5\" style=\"border: 1px solid #94a3b8; padding: 12px; text-align: left; font-size: 13px; color: #0f172a;\">إجمالي العمولات والكمية المباعة</td>\\n" +
"          <td style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #10b981; font-size: 13px;\">${totalQtyStr}</td>\\n" +
"          <td style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #8b5cf6; font-size: 14px;\">${sumComms.toFixed(2)} ر.س</td>\\n" +
"        </tr>`;\\n" +
"      }\\n" +
"  \\n" +
"      const excelTemplate = `<html";
  hr = hr.replace(exportSearch, exportBlock);

  const tBodyEndSearch = "            </tbody>\\n" +
"          </table>\\n" +
"        </body>";
  const tBodyEndReplace = "            </tbody>\\n" +
"          </table>\\n" +
"          ${deptCommissionsExport.length > 0 ? `\\n" +
"            <br><br>\\n" +
"            <table>\\n" +
"              <thead>\\n" +
"                <tr>\\n" +
"                  <th colspan=\"7\" style=\"background-color: #1e293b; color: #ffffff; font-size: 16px; padding: 12px; text-align: center; font-weight: bold;\">سجل عمولات المناديب</th>\\n" +
"                </tr>\\n" +
"                <tr style=\"background-color: #e2e8f0;\">\\n" +
"                  <th style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center;\">اسم المندوب</th>\\n" +
"                  <th style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center;\">رقم الهوية</th>\\n" +
"                  <th style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center;\">رقم الفاتورة</th>\\n" +
"                  <th style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center;\">العميل</th>\\n" +
"                  <th style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center;\">التاريخ</th>\\n" +
"                  <th style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center;\">الكمية المباعة</th>\\n" +
"                  <th style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center;\">قيمة العمولة المستحقة</th>\\n" +
"                </tr>\\n" +
"              </thead>\\n" +
"              <tbody>${commRows}</tbody>\\n" +
"            </table>\\n" +
"          ` : ''}\\n" +
"        </body>";
  hr = hr.replace(tBodyEndSearch, tBodyEndReplace);
  fs.writeFileSync('frontend/src/components/HrTab.jsx', hr, 'utf8');


  // --- SalesBillingTab.jsx ---
  let sales = fs.readFileSync('frontend/src/components/SalesBillingTab.jsx', 'utf8');

  const blueBoxSearch = "        {selectedProd && (\\n" +
"          <div style={{ fontSize: '12px', color: '#8b5cf6', background: '#8b5cf615', padding: '6px 12px', borderRadius: '6px', marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>\\n" +
"            <span>سعة الكرتون: <strong>{selectedProd.boxSize || 12} حبة</strong></span>\\n" +
"            <span>عمولة الكرتون: <strong>{Number(selectedProd.cartonCommission || selectedProd.commissionPerBox || 0).toFixed(2)} {currency}</strong></span>\\n" +
"          </div>\\n" +
"        )}";
  const blueBoxReplace = "        {selectedProd && (\\n" +
"          <div style={{ fontSize: '12px', color: '#8b5cf6', background: '#8b5cf615', padding: '6px 12px', borderRadius: '6px', marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>\\n" +
"            {Number(selectedProd.boxSize) === 1 ? (\\n" +
"              <span>عمولة القطعة / الحبة: <strong>{Number(selectedProd.cartonCommission || selectedProd.commissionPerBox || 0).toFixed(2)} {currency}</strong></span>\\n" +
"            ) : (\\n" +
"              <>\\n" +
"                <span>سعة الكرتون: <strong>{selectedProd.boxSize || 12} حبة</strong></span>\\n" +
"                <span>عمولة الكرتون: <strong>{Number(selectedProd.cartonCommission || selectedProd.commissionPerBox || 0).toFixed(2)} {currency}</strong></span>\\n" +
"              </>\\n" +
"            )}\\n" +
"          </div>\\n" +
"        )}";
  sales = sales.replace(blueBoxSearch, blueBoxReplace);

  const selectSearch = "              <select \\n" +
"                value={salesUnitType} \\n" +
"                onChange={e => setSalesUnitType(e.target.value)} \\n" +
"                style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', boxSizing: 'border-box', fontSize: '13px' }}>\\n" +
"                <option value=\"حبة\">{tr('حبة')}</option>\\n" +
"                <option value=\"كرتون\">{tr('كرتون')}</option>\\n" +
"              </select>";
  const selectReplace = "              <select \\n" +
"                value={salesUnitType} \\n" +
"                onChange={e => setSalesUnitType(e.target.value)} \\n" +
"                style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), outline: 'none', boxSizing: 'border-box', fontSize: '13px' }}>\\n" +
"                <option value=\"حبة\">{tr('حبة')}</option>\\n" +
"                {(!selectedProd || Number(selectedProd.boxSize) > 1) && (\\n" +
"                  <option value=\"كرتون\">{tr('كرتون')}</option>\\n" +
"                )}\\n" +
"              </select>";
  sales = sales.replace(selectSearch, selectReplace);
  fs.writeFileSync('frontend/src/components/SalesBillingTab.jsx', sales, 'utf8');
}

applyAll();
console.log('All updates successfully applied without backtick style corruption!');
