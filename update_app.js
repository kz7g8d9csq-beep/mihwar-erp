const fs = require('fs');
const file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes('import ReturnsTab')) {
  content = content.replace(
    "import SettingsTab from './components/SettingsTab';",
    "import SettingsTab from './components/SettingsTab';\nimport ReturnsTab from './components/ReturnsTab';"
  );
}

// 2. Add to allTabs
if (!content.includes("{ id: 'returns'")) {
  const allTabsRegex = /\{ id: 'hr', label: t.hr, adminOnly: true, icon: '👔' \},/;
  if (allTabsRegex.test(content)) {
    content = content.replace(
      allTabsRegex,
      `{ id: 'returns', label: t.returns || 'المرتجعات', adminOnly: true, icon: '↩️' },\n    { id: 'hr', label: t.hr, adminOnly: true, icon: '👔' },`
    );
  }
}

// 3. Add to availableTabs logic (adminOnly handles it, but just in case, we won't touch unless needed)
// `ReturnsTab` is adminOnly=true, so it will show up for admins.

// 4. Render component
if (!content.includes('<ReturnsTab')) {
  const renderRegex = /\{\/\*\s*TAB 11: HR\s*\*\/\}/;
  if (renderRegex.test(content)) {
    content = content.replace(
      renderRegex,
      `{/* TAB: Returns */}
          {activeTab === 'returns' && (
            <ReturnsTab
              theme={theme}
              isDark={isDark}
              invoices={invoices}
              purchaseInvoices={purchaseInvoices}
              inventory={inventory}
              setInventory={setInventory}
            />
          )}

          {/* TAB 11: HR */}`
    );
  }
}

fs.writeFileSync(file, content, 'utf8');
console.log('App.jsx updated with ReturnsTab integration.');
