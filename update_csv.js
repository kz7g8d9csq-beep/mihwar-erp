const fs = require('fs');
const file = 'frontend/src/App.jsx';
let content = fs.readFileSync(file, 'utf8');

const exportToExcelRegex = /const exportToExcel = \(sheetTitle, headers, rows, lang = 'ar'\) => \{[\s\S]*?document\.body\.removeChild\(link\);\n\};/;

const exportToExcelReplacement = `const exportToExcel = (sheetTitle, headers, rows, lang = 'ar') => {
  const cleanTitle = sheetTitle.replace(/[/\\\\?*[\\]]/g, '');
  
  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(c => \`"\${String(c ?? '').replace(/"/g, '""')}"\`).join(','))
  ].join('\\r\\n');

  // توجيه sep=, لإجبار Excel على فصل الأعمدة بدقة
  const finalFileContent = '\\uFEFFsep=,\\r\\n' + csvContent;
  const blob = new Blob([finalFileContent], { type: 'text/csv;charset=utf-8;' });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = \`\${cleanTitle}_\${new Date().toISOString().slice(0, 10)}.csv\`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};`;

if (exportToExcelRegex.test(content)) {
  content = content.replace(exportToExcelRegex, exportToExcelReplacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('App.jsx exportToExcel updated');
} else {
  console.log('Regex failed for App.jsx exportToExcel');
}

const returnsFile = 'frontend/src/components/ReturnsTab.jsx';
let returnsContent = fs.readFileSync(returnsFile, 'utf8');

const handleExportRegex = /const csvContent = \[\s*headers\.join\(','\),\s*\.\.\.rows\.map\(r => r\.map\(c => \`"\\\$\{String\(c\)\.replace\(\/"\/g, '""'\)\}"\`\)\.join\(','\)\)\s*\]\.join\('\\r\\n'\);\s*const blob = new Blob\(\['\\uFEFF' \+ csvContent\], \{ type: 'text\/csv;charset=utf-8;' \}\);/g;

const handleExportReplacement = `const csvContent = [
       headers.join(','),
       ...rows.map(r => r.map(c => \`"\${String(c ?? '').replace(/"/g, '""')}"\`).join(','))
     ].join('\\r\\n');

     const finalFileContent = '\\uFEFFsep=,\\r\\n' + csvContent;
     const blob = new Blob([finalFileContent], { type: 'text/csv;charset=utf-8;' });`;

if (handleExportRegex.test(returnsContent)) {
  returnsContent = returnsContent.replace(handleExportRegex, handleExportReplacement);
  fs.writeFileSync(returnsFile, returnsContent, 'utf8');
  console.log('ReturnsTab.jsx handleExport updated');
} else {
  console.log('Regex failed for ReturnsTab.jsx handleExport');
}
