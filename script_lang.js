const fs = require('fs');
const file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf-8');

// We want to make sure all components in activeTab render get lang={lang}
// e.g. <DashboardTab user={user} t={t} theme={theme} isDark={isDark}
// we will replace `isDark={isDark}` with `isDark={isDark} lang={lang}` if it's not already there.

content = content.replace(/isDark={isDark}(?! lang={lang})/g, 'isDark={isDark} lang={lang}');

fs.writeFileSync(file, content, 'utf-8');
console.log('App.jsx updated with lang props.');
