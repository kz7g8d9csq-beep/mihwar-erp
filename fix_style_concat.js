const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/border:\s*[^,]+,\s*boxSizing/g, "border: '1px solid ' + (theme.border || '#334155'), boxSizing");
  fs.writeFileSync(file, content, 'utf8');
}

fix('frontend/src/App.jsx');
fix('frontend/src/components/InventoryTab.jsx');
console.log('Replaced with string concatenation.');
