const fs = require('fs');
const dir = 'frontend/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).map(f => dir + '/' + f);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');

    // Safe alerts and confirms
    content = content.replace(/alert\('([^']+)'\)/g, (match, text) => {
        if (/[\u0600-\u06FF]/.test(text) && !text.includes('t(')) {
            return `alert(t(\`${text}\`))`;
        }
        return match;
    });
    content = content.replace(/alert\("([^"]+)"\)/g, (match, text) => {
        if (/[\u0600-\u06FF]/.test(text) && !text.includes('t(')) {
            return `alert(t(\`${text}\`))`;
        }
        return match;
    });
    
    content = content.replace(/confirm\('([^']+)'\)/g, (match, text) => {
        if (/[\u0600-\u06FF]/.test(text) && !text.includes('t(')) {
            return `confirm(t(\`${text}\`))`;
        }
        return match;
    });
    content = content.replace(/confirm\("([^"]+)"\)/g, (match, text) => {
        if (/[\u0600-\u06FF]/.test(text) && !text.includes('t(')) {
            return `confirm(t(\`${text}\`))`;
        }
        return match;
    });

    fs.writeFileSync(file, content, 'utf-8');
});
console.log('Safely wrapped alerts and confirms');
