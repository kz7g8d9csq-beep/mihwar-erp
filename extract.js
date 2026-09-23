const fs = require('fs');
const dir = 'frontend/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).map(f => dir + '/' + f);

let allStrings = new Set();
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');
    const regex = /t\(`(.*?)`\)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        allStrings.add(match[1]);
    }
});

fs.writeFileSync('arabic_strings.txt', Array.from(allStrings).join('\n'), 'utf-8');
console.log('Strings extracted to arabic_strings.txt. Count:', allStrings.size);
