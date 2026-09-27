const fs = require('fs');

// --- APP.JSX FIX ---
let appContent = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const editRegex = /(<div><label[^>]*>[^<]*<\/label><input[^>]*value=\{editCartonCommission\}[^>]*><\/div>)\s*(<div><label[^>]*>[^<]*<\/label><input[^>]*value=\{editBoxSize\}[^>]*><\/div>)/;
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

if (editRegex.test(appContent)) {
  appContent = appContent.replace(editRegex, newEditFields);
  fs.writeFileSync('frontend/src/App.jsx', appContent, 'utf8');
  console.log('App.jsx modal fixed.');
} else {
  console.log('App.jsx modal regex failed.');
}

// --- INVENTORYTAB.JSX FIX ---
let invContent = fs.readFileSync('frontend/src/components/InventoryTab.jsx', 'utf8');

const addRegex = /(<div>\s*<label[^>]*>[^<]*<\/label>\s*<input[^>]*value=\{newProdCommission\}[^>]*>\s*<\/div>)/;
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

if (addRegex.test(invContent)) {
  invContent = invContent.replace(addRegex, newAddFields);
  fs.writeFileSync('frontend/src/components/InventoryTab.jsx', invContent, 'utf8');
  console.log('InventoryTab form fixed.');
} else {
  console.log('InventoryTab form regex failed.');
}

// ALSO handleAddProduct inside App.jsx was corrupted because I used a bad replace?
// Let's check handleAddProduct.
