const fs = require('fs');
let appContent = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const lines = appContent.split('\\n');
let newAppLines = [];
let skipNext = false;
for (let i = 0; i < lines.length; i++) {
  if (skipNext) {
    skipNext = false;
    continue;
  }
  if (lines[i].includes('value={editCartonCommission}')) {
    newAppLines.push(`              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة:</label>
                <select value={editCommissionType} onChange={e=>setEditCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \\\`1px solid \${theme.border}\\\`, boxSizing: 'border-box', outline: 'none' }}>
                  <option value="بالقطعة">بالقطعة</option>
                  <option value="بالكرتون">بالكرتون</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{editCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س)' : 'عمولة الكرتون (ر.س)'}</label>
                <input type="number" step="0.01" min="0" placeholder="مثال: 5.00" value={editCartonCommission} onChange={e=>setEditCartonCommission(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \\\`1px solid \${theme.border}\\\`, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              {editCommissionType === 'بالكرتون' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات):</label>
                  <input type="number" min="1" placeholder="الافتراضي: 12" value={editBoxSize} onChange={e=>setEditBoxSize(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \\\`1px solid \${theme.border}\\\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              )}`);
    // The next line contains editBoxSize, we skip it
    skipNext = true;
  } else {
    newAppLines.push(lines[i]);
  }
}
fs.writeFileSync('frontend/src/App.jsx', newAppLines.join('\\n'), 'utf8');

let invContent = fs.readFileSync('frontend/src/components/InventoryTab.jsx', 'utf8');
const invLines = invContent.split('\\n');
let newInvLines = [];
for (let i = 0; i < invLines.length; i++) {
  if (invLines[i].includes('value={newProdCommission}')) {
    // wait, the newProdCommission is inside a div, so the whole block is over multiple lines.
    // In InventoryTab.jsx, the form has divs around label and input.
    // Let's replace by reading the file and replacing the specific block.
    // Actually, I can just find the index of "value={newProdCommission}" and go backwards to find <div> and forward to </div>.
  }
}
