const fs = require('fs');
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// Ensure lang is passed to all components
app = app.replace(/isDark=\{isDark\}(?! lang=\{lang\})/g, 'isDark={isDark} lang={lang}');

fs.writeFileSync('frontend/src/App.jsx', app, 'utf8');
console.log('Passed lang to components');
