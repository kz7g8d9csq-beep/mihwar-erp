const fs = require('fs');

const dir = 'frontend/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).map(f => dir + '/' + f);

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const noComments = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    
    const lines = noComments.split('\n');
    let unwrappedLines = [];
    lines.forEach((line, i) => {
        if (/[\u0600-\u06FF]/.test(line)) {
            let stripped = line.replace(/t\([`'"][\s\S]*?[`'"]\)/g, '');
            if (/[\u0600-\u06FF]/.test(stripped)) {
                unwrappedLines.push(`Line ${i+1}: ${line.trim()}`);
            }
        }
    });
    if (unwrappedLines.length > 0) {
        console.log(`\n--- ${file} ---`);
        console.log(unwrappedLines.join('\n'));
    }
});
