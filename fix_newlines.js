const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\n/g, '\n');
  fs.writeFileSync(file, content, 'utf8');
}

['frontend/src/App.jsx', 'frontend/src/components/InventoryTab.jsx', 'frontend/src/components/HrTab.jsx', 'frontend/src/components/SalesBillingTab.jsx'].forEach(fix);
console.log('Fixed \\n');
