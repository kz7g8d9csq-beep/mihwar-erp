const fs = require('fs');
const file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<div style=\{\{\s*marginBottom:\s*'10px'\s*\}\}>\s*<label[^>]*>إجمالي الفاتورة:<\/label>.*?<label[^>]*>المبلغ المتبقي:<\/label>\s*<div[^>]*>.*?<\/div>\s*<\/div>/s;

const replaceStr = `<div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>المبلغ المطلوب سداده:</label>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textDark }}>
                      {(() => {
                        const inv = invoices.find(i => i.id === payTargetInvoiceId);
                        const remaining = inv?.paymentStatus === 'مدفوعة جزئياً' ? (inv?.remainingAmount || 0) : (inv?.totalAmount || 0);
                        return Number(remaining).toFixed(2);
                      })()} {t.currency}
                    </div>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>المبلغ المسدد حالياً:</label>
                    <input type="number" step="0.01" value={partialPayAmount} onChange={e => setPartialPayAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, outline: 'none' }} />
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>طريقة دفع الجزء:</label>
                    <select value={partialPayMethod} onChange={e => setPartialPayMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, outline: 'none' }}>
                      <option value="نقد">نقد</option>
                      <option value="شبكة">شبكة</option>
                      <option value="حوالة">حوالة بنكية</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>المتبقي بعد السداد:</label>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>
                      {(() => {
                        const inv = invoices.find(i => i.id === payTargetInvoiceId);
                        const remaining = inv?.paymentStatus === 'مدفوعة جزئياً' ? (inv?.remainingAmount || 0) : (inv?.totalAmount || 0);
                        return Math.max(0, remaining - (Number(partialPayAmount) || 0)).toFixed(2);
                      })()} {t.currency}
                    </div>
                  </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replaceStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated the UI with regex.');
} else {
  console.log('Regex failed to find the block.');
}
