const fs = require('fs');
let inv = fs.readFileSync('frontend/src/components/InventoryTab.jsx', 'utf8');

inv = inv.replace(
  "newProdCommission = '', setNewProdCommission,",
  `newProdCommission = '', setNewProdCommission,
    newBoxSize = '12', setNewBoxSize,
    newCommissionType = 'بالكرتون', setNewCommissionType,`
);

let invLines = inv.split('\n');
let newInv = [];
for (let i=0; i<invLines.length; i++) {
  if (invLines[i].includes('value={newProdCommission}')) {
    
    // Pop back to <div>
    while (newInv.length > 0 && !newInv[newInv.length - 1].includes('<div')) {
      newInv.pop();
    }
    newInv.pop(); // Pop the <div ...>
    
    newInv.push(`              <div>`);
    newInv.push(`                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة *:</label>`);
    newInv.push(`                <select value={newCommissionType} onChange={e=>{if(setNewCommissionType) setNewCommissionType(e.target.value)}} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }}>`);
    newInv.push(`                  <option value="بالقطعة">بالقطعة</option>`);
    newInv.push(`                  <option value="بالكرتون">بالكرتون</option>`);
    newInv.push(`                </select>`);
    newInv.push(`              </div>`);
    newInv.push(`              <div>`);
    newInv.push(`                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{newCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س) *:' : 'عمولة الكرتون (ر.س) *:'}</label>`);
    newInv.push(`                <input type="number" step="0.01" min="0" placeholder="مثال: 5.00" value={newProdCommission} onChange={e=>{if(setNewProdCommission) setNewProdCommission(e.target.value)}} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />`);
    newInv.push(`              </div>`);
    newInv.push(`              {newCommissionType === 'بالكرتون' && (`);
    newInv.push(`                <div>`);
    newInv.push(`                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات) *:</label>`);
    newInv.push(`                  <input type="number" min="1" placeholder="الافتراضي: 12" value={newBoxSize} onChange={e=>{if(setNewBoxSize) setNewBoxSize(e.target.value)}} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />`);
    newInv.push(`                </div>`);
    newInv.push(`              )}`);
    
    // Skip remaining lines until we find </div>
    while (i < invLines.length && !invLines[i].includes('</div>')) {
      i++;
    }
  } else {
    newInv.push(invLines[i]);
  }
}
fs.writeFileSync('frontend/src/components/InventoryTab.jsx', newInv.join('\n'), 'utf8');
