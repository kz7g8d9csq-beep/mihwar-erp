const fs = require('fs');

let invContent = fs.readFileSync('frontend/src/components/InventoryTab.jsx', 'utf8');

const regex = /<div>\s*<label[^>]*>[^<]*<\/label>\s*<input[^>]*value=\{newProdCommission\}[^>]*>\s*<\/div>/g;

const newAddFields = `<div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>نوع العمولة *:</label>
                <select value={newCommissionType} onChange={e=>setNewCommissionType && setNewCommissionType(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }}>
                  <option value="بالقطعة">بالقطعة</option>
                  <option value="بالكرتون">بالكرتون</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>{newCommissionType === 'بالقطعة' ? 'عمولة القطعة / الحبة (ر.س) *:' : 'عمولة الكرتون (ر.س) *:'}</label>
                <input type="number" step="0.01" min="0" placeholder="مثال: 5.00" value={newProdCommission} onChange={e=>setNewProdCommission && setNewProdCommission(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
              </div>
              {newCommissionType === 'بالكرتون' && (
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>سعة الكرتون (عدد الحبات) *:</label>
                  <input type="number" min="1" placeholder="الافتراضي: 12" value={newBoxSize} onChange={e=>setNewBoxSize && setNewBoxSize(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              )}`;

invContent = invContent.replace(regex, newAddFields);

fs.writeFileSync('frontend/src/components/InventoryTab.jsx', invContent, 'utf8');
console.log('InventoryTab forms fixed.');
