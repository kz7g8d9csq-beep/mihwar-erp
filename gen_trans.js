const fs = require('fs');

const strings = fs.readFileSync('arabic_strings.txt', 'utf8').split('\n').filter(Boolean);

const dict = {};
strings.forEach(s => {
    // Very basic translation rules
    let en = s;
    en = en.replace(/?????/g, 'Add');
    en = en.replace(/???/g, 'Save');
    en = en.replace(/?????/g, 'Edit');
    en = en.replace(/???/g, 'Delete');
    en = en.replace(/????/g, 'Product');
    en = en.replace(/????/g, 'Client');
    en = en.replace(/????/g, 'Supplier');
    en = en.replace(/????/g, 'Employee');
    en = en.replace(/???/g, 'Number');
    en = en.replace(/???/g, 'Name');
    en = en.replace(/?????/g, 'Date');
    en = en.replace(/??????/g, 'Qty');
    en = en.replace(/?????/g, 'Price');
    en = en.replace(/????????/g, 'Total');
    en = en.replace(/????????/g, 'Invoice');
    en = en.replace(/???????/g, 'Inventory');
    en = en.replace(/?????/g, 'Print');
    en = en.replace(/???/g, 'Pay');
    en = en.replace(/?????/g, 'Cancel');
    en = en.replace(/?????/g, 'OK');
    en = en.replace(/???/g, 'Search');
    en = en.replace(/????/g, 'Search');
    
    // For others, just provide a generic transliteration or keep it
    dict[s.trim()] = en;
});

const content = fs.readFileSync('frontend/src/App.jsx', 'utf8');

const mappingStr = JSON.stringify(dict, null, 2);

const newContent = content.replace(
  '  const t = (key) => {',
    const autoEnMap = ;\n  const t = (key) => {\n    if (lang === 'en' && autoEnMap[key] && autoEnMap[key] !== key) return autoEnMap[key];\n    if (lang === 'en' && dict['en'][key]) return dict['en'][key];
);

fs.writeFileSync('frontend/src/App.jsx', newContent, 'utf8');
