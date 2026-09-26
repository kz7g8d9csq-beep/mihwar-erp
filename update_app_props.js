const fs = require('fs');
let content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const targetStr = `              isSubmittingSale={isSubmittingSale}
              cartSubtotal={cartSubtotal} cartTax={cartTax} cartGrandTotal={cartGrandTotal}
            />`;

const newStr = `              isSubmittingSale={isSubmittingSale}
              cartSubtotal={cartSubtotal} cartTax={cartTax} cartGrandTotal={cartGrandTotal}
              selectedSalesRepId={selectedSalesRepId}
              setSelectedSalesRepId={setSelectedSalesRepId}
              employees={employees}
            />`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, newStr);
  fs.writeFileSync('frontend/src/App.jsx', content, 'utf8');
  console.log('App.jsx successfully updated.');
} else {
  console.log('Error: target string not found in App.jsx');
}
