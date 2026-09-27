const fs = require('fs');

// App.jsx
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');
let appLines = app.split('\\n');
let newApp = [];
let skipApp = false;
for (let i=0; i<appLines.length; i++) {
  if (skipApp) {
    skipApp = false;
    continue;
  }
  if (appLines[i].includes('value={editCartonCommission}')) {
    newApp.push("              <div>");
    newApp.push("                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة:</label>");
    newApp.push("                <select value={editCommissionType} onChange={e=>setEditCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }}>");
    newApp.push("                  <option value=\"بالقطعة\">بالقطعة</option>");
    newApp.push("                  <option value=\"بالكرتون\">بالكرتون</option>");
    newApp.push("                </select>");
    newApp.push("              </div>");
    newApp.push("              <div>");
    newApp.push("                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{editCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س)' : 'عمولة الكرتون (ر.س)'}</label>");
    newApp.push("                <input type=\"number\" step=\"0.01\" min=\"0\" placeholder=\"مثال: 5.00\" value={editCartonCommission} onChange={e=>setEditCartonCommission(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />");
    newApp.push("              </div>");
    newApp.push("              {editCommissionType === 'بالكرتون' && (");
    newApp.push("                <div>");
    newApp.push("                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات):</label>");
    newApp.push("                  <input type=\"number\" min=\"1\" placeholder=\"الافتراضي: 12\" value={editBoxSize} onChange={e=>setEditBoxSize(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />");
    newApp.push("                </div>");
    newApp.push("              )}");
    skipApp = true; // skip editBoxSize line
    // wait, in my previous backup, the label, input, and div are all on ONE line.
    // So skipping the NEXT line is correct because it's editBoxSize on the next line!
  } else {
    newApp.push(appLines[i]);
  }
}
fs.writeFileSync('frontend/src/App.jsx', newApp.join('\\n'), 'utf8');


// InventoryTab.jsx
let inv = fs.readFileSync('frontend/src/components/InventoryTab.jsx', 'utf8');
let invLines = inv.split('\\n');
let newInv = [];
for (let i=0; i<invLines.length; i++) {
  if (invLines[i].includes('value={newProdCommission}')) {
    // The previous 4 lines are <label> and <input ...
    // The next 2 lines are style and /> </div>
    // Let's pop the last 5 lines from newInv
    newInv.pop(); // placeholder
    newInv.pop(); // min
    newInv.pop(); // step
    newInv.pop(); // type
    newInv.pop(); // <input
    newInv.pop(); // <label
    newInv.pop(); // <div>
    
    newInv.push("              <div>");
    newInv.push("                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة *:</label>");
    newInv.push("                <select value={newCommissionType} onChange={e=>setNewCommissionType && setNewCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }}>");
    newInv.push("                  <option value=\"بالقطعة\">بالقطعة</option>");
    newInv.push("                  <option value=\"بالكرتون\">بالكرتون</option>");
    newInv.push("                </select>");
    newInv.push("              </div>");
    newInv.push("              <div>");
    newInv.push("                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{newCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س) *:' : 'عمولة الكرتون (ر.س) *:'}</label>");
    newInv.push("                <input type=\"number\" step=\"0.01\" min=\"0\" placeholder=\"مثال: 5.00\" value={newProdCommission} onChange={e=>setNewProdCommission && setNewProdCommission(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />");
    newInv.push("              </div>");
    newInv.push("              {newCommissionType === 'بالكرتون' && (");
    newInv.push("                <div>");
    newInv.push("                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات) *:</label>");
    newInv.push("                  <input type=\"number\" min=\"1\" placeholder=\"الافتراضي: 12\" value={newBoxSize} onChange={e=>setNewBoxSize && setNewBoxSize(e.target.value)} required style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: '1px solid ' + (theme.border || '#334155'), boxSizing: 'border-box', outline: 'none' }} />");
    newInv.push("                </div>");
    newInv.push("              )}");
    
    // skip the next 3 lines
    i += 3;
  } else {
    newInv.push(invLines[i]);
  }
}
fs.writeFileSync('frontend/src/components/InventoryTab.jsx', newInv.join('\\n'), 'utf8');

console.log('Forms patched.');
