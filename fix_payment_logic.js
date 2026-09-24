const fs = require('fs');
const file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    if (payConfirmMethod === 'دفع جزء') {
      const total = Number(invTarget?.totalAmount) || 0;
      paidAmt = Number(partialPayAmount) || 0;
      
      if (paidAmt <= 0) { alert('الرجاء إدخال مبلغ صحيح للسداد.'); return; }
      
      if (paidAmt >= total) {
        finalStatus = 'مدفوعة';
        actualMethod = partialPayMethod;
        paidAmt = total;
        remAmt = 0;
      } else {
        finalStatus = 'مدفوعة جزئياً';
        actualMethod = partialPayMethod;
        remAmt = total - paidAmt;
      }
    }`;

const replaceStr = `    if (payConfirmMethod === 'دفع جزء') {
      const total = Number(invTarget?.totalAmount) || 0;
      const newlyPaid = Number(partialPayAmount) || 0;
      
      if (newlyPaid <= 0) { alert('الرجاء إدخال مبلغ صحيح للسداد.'); return; }
      
      const previousPaid = Number(invTarget?.paidAmount) || 0;
      paidAmt = previousPaid + newlyPaid;
      
      if (paidAmt >= total) {
        finalStatus = 'مدفوعة';
        actualMethod = partialPayMethod;
        paidAmt = total;
        remAmt = 0;
      } else {
        finalStatus = 'مدفوعة جزئياً';
        actualMethod = partialPayMethod;
        remAmt = total - paidAmt;
      }
    } else {
      paidAmt = Number(invTarget?.totalAmount) || 0;
      remAmt = 0;
    }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated handleExecutePayment.');
} else {
  // Let's try matching with regex to ignore whitespace differences
  console.log('Exact match failed, trying regex...');
  const regex = /if\s*\(payConfirmMethod\s*===\s*'دفع جزء'\)\s*\{\s*const\s*total\s*=\s*Number\(invTarget\?\.totalAmount\)\s*\|\|\s*0;\s*paidAmt\s*=\s*Number\(partialPayAmount\)\s*\|\|\s*0;\s*if\s*\(paidAmt\s*<=\s*0\)\s*\{\s*alert\('الرجاء إدخال مبلغ صحيح للسداد\.'\);\s*return;\s*\}\s*if\s*\(paidAmt\s*>=\s*total\)\s*\{\s*finalStatus\s*=\s*'مدفوعة';\s*actualMethod\s*=\s*partialPayMethod;\s*paidAmt\s*=\s*total;\s*remAmt\s*=\s*0;\s*\}\s*else\s*\{\s*finalStatus\s*=\s*'مدفوعة جزئياً';\s*actualMethod\s*=\s*partialPayMethod;\s*remAmt\s*=\s*total\s*-\s*paidAmt;\s*\}\s*\}/s;
  if (regex.test(content)) {
    content = content.replace(regex, replaceStr);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully updated using regex.');
  } else {
    console.log('Regex also failed.');
  }
}
