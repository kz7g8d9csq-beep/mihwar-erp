const fs = require('fs');

function fix(file) {
  let content = fs.readFileSync(file, 'utf8');
  // I will just replace the whole style attribute with the known working one.
  // style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }}
  // let's use a regex to catch any mangled version of it:
  
  content = content.replace(/border:\s*[^,]+,\s*boxSizing/g, "border: `1px solid ${theme.border}`, boxSizing");
  
  fs.writeFileSync(file, content, 'utf8');
}

fix('frontend/src/App.jsx');
fix('frontend/src/components/InventoryTab.jsx');
console.log('Fixed styles in JS.');
