const fs = require('fs');

let appContent = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// 1. Add states to App.jsx
appContent = appContent.replace(
  "const [newProdCommission, setNewProdCommission] = useState('');",
  "const [newProdCommission, setNewProdCommission] = useState('');\n  const [newBoxSize, setNewBoxSize] = useState('12');\n  const [newCommissionType, setNewCommissionType] = useState('بالكرتون');"
);
appContent = appContent.replace(
  "const [editBoxSize, setEditBoxSize] = useState(12);",
  "const [editBoxSize, setEditBoxSize] = useState(12);\n  const [editCommissionType, setEditCommissionType] = useState('بالكرتون');"
);

// 2. Update handleAddProduct in App.jsx
const oldHandleAdd = `const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const newProd = { id: Date.now(), name: newProdName, price: Number(newProdPrice), stock: Number(newProdStock || 0), boxSize: 12, cartonCommission: parseFloat(newProdCommission) || 0, itemCode: newItemCode.trim() || 'SKU-' + Math.floor(100 + Math.random() * 900) };
    const updated = [newProd, ...inventory];
    setInventory(updated);
    localStorage.setItem('mihwar_inventory', JSON.stringify(updated));
    setNewProdName(''); setNewProdPrice(''); setNewProdStock(''); setNewItemCode(''); setNewProdCommission('');
  };`;
const newHandleAdd = `const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    const finalBoxSize = newCommissionType === 'بالقطعة' ? 1 : Number(newBoxSize || 12);
    const newProd = { id: Date.now(), name: newProdName, price: Number(newProdPrice), stock: Number(newProdStock || 0), boxSize: finalBoxSize, commissionType: newCommissionType, cartonCommission: parseFloat(newProdCommission) || 0, itemCode: newItemCode.trim() || 'SKU-' + Math.floor(100 + Math.random() * 900) };
    const updated = [newProd, ...inventory];
    setInventory(updated);
    localStorage.setItem('mihwar_inventory', JSON.stringify(updated));
    setNewProdName(''); setNewProdPrice(''); setNewProdStock(''); setNewItemCode(''); setNewProdCommission('');
    setNewBoxSize('12'); setNewCommissionType('بالكرتون');
  };`;
appContent = appContent.replace(oldHandleAdd, newHandleAdd);

// 3. Update handleOpenEditProduct
const oldHandleOpenEdit = `setEditBoxSize(prod.boxSize ?? 12);
    setShowEditProdModal(true);`;
const newHandleOpenEdit = `setEditBoxSize(prod.boxSize ?? 12);
    setEditCommissionType(prod.commissionType || (prod.boxSize === 1 ? 'بالقطعة' : 'بالكرتون'));
    setShowEditProdModal(true);`;
appContent = appContent.replace(oldHandleOpenEdit, newHandleOpenEdit);

// 4. Update handleUpdateProduct
const oldHandleUpdate = `const updated = inventory.map(item => item.id === editingProdId ? { ...item, name: editProdName, price: Number(editProdPrice), stock: Number(editProdStock), itemCode: editItemCode.trim() || item.itemCode, cartonCommission: parseFloat(editCartonCommission) || 0, boxSize: parseInt(editBoxSize) || 12 } : item);`;
const newHandleUpdate = `const finalBoxSize = editCommissionType === 'بالقطعة' ? 1 : (parseInt(editBoxSize) || 12);
    const updated = inventory.map(item => item.id === editingProdId ? { ...item, name: editProdName, price: Number(editProdPrice), stock: Number(editProdStock), itemCode: editItemCode.trim() || item.itemCode, cartonCommission: parseFloat(editCartonCommission) || 0, boxSize: finalBoxSize, commissionType: editCommissionType } : item);`;
appContent = appContent.replace(oldHandleUpdate, newHandleUpdate);

// 5. Update InventoryTab props passed in App.jsx
appContent = appContent.replace(
  "newProdCommission={newProdCommission} setNewProdCommission={setNewProdCommission}",
  "newProdCommission={newProdCommission} setNewProdCommission={setNewProdCommission}\n              newBoxSize={newBoxSize} setNewBoxSize={setNewBoxSize}\n              newCommissionType={newCommissionType} setNewCommissionType={setNewCommissionType}"
);

// 6. Replace edit modal form fields
// It's safer to use regex or match the two specific divs.
const editRegex = /(<div><label[^>]*>عمولة الكرتون للمندوب \(ر\.س\)?:<\/label><input[^>]*value=\{editCartonCommission\}[^>]*><\/div>)\s*(<div><label[^>]*>سعة الكرتون \(عدد الحبات\)?:<\/label><input[^>]*value=\{editBoxSize\}[^>]*><\/div>)/;

const newEditFields = `<div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة:</label>
                <select value={editCommissionType} onChange={e=>setEditCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }}>
                  <option value="بالقطعة">بالقطعة</option>
                  <option value="بالكرتون">بالكرتون</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{editCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س)' : 'عمولة الكرتون (ر.س)'}</label>
                <input type="number" step="0.01" min="0" placeholder="مثال: 5.00" value={editCartonCommission} onChange={e=>setEditCartonCommission(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              {editCommissionType === 'بالكرتون' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات):</label>
                  <input type="number" min="1" placeholder="الافتراضي: 12" value={editBoxSize} onChange={e=>setEditBoxSize(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              )}`;

appContent = appContent.replace(editRegex, newEditFields);

fs.writeFileSync('frontend/src/App.jsx', appContent, 'utf8');

// -------- UPDATE InventoryTab.jsx ---------
let invContent = fs.readFileSync('frontend/src/components/InventoryTab.jsx', 'utf8');
invContent = invContent.replace(
  "newProdCommission = '', setNewProdCommission,",
  "newProdCommission = '', setNewProdCommission,\n    newBoxSize = '12', setNewBoxSize,\n    newCommissionType = 'بالكرتون', setNewCommissionType,"
);

const addRegex = /(<div>\s*<label[^>]*>عمولة الكرتون للمندوب \(ر\.س\) \*:<\/label>\s*<input[^>]*value=\{newProdCommission\}[^>]*>\s*<\/div>)/;

const newAddFields = `<div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة *:</label>
                <select value={newCommissionType} onChange={e=>setNewCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }}>
                  <option value="بالقطعة">بالقطعة</option>
                  <option value="بالكرتون">بالكرتون</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{newCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س) *:' : 'عمولة الكرتون (ر.س) *:'}</label>
                <input type="number" step="0.01" min="0" placeholder="مثال: 5.00" value={newProdCommission} onChange={e=>setNewProdCommission(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              {newCommissionType === 'بالكرتون' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات) *:</label>
                  <input type="number" min="1" placeholder="الافتراضي: 12" value={newBoxSize} onChange={e=>setNewBoxSize(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              )}`;

invContent = invContent.replace(addRegex, newAddFields);

fs.writeFileSync('frontend/src/components/InventoryTab.jsx', invContent, 'utf8');
console.log('App.jsx and InventoryTab.jsx forms updated successfully.');
