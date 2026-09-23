const fs = require('fs');
const dir = 'frontend/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).map(f => dir + '/' + f);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');

    // Replace >Arabic text<
    content = content.replace(/>([^<]+)</g, (match, p1) => {
        if (/[\u0600-\u06FF]/.test(p1)) {
            const stripped = p1.trim();
            if (stripped && !stripped.includes('{t(') && !stripped.includes('{t.')) {
                return match.replace(stripped, `{t(\`${stripped}\`)}`);
            }
        }
        return match;
    });

    // Replace attribute="Arabic text"
    content = content.replace(/([a-zA-Z0-9_]+)="([^"]+)"/g, (match, attr, text) => {
        if (/[\u0600-\u06FF]/.test(text)) {
            return `${attr}={t(\`${text}\`)}`;
        }
        return match;
    });
    
    // Replace 'Arabic text' or "Arabic text" in JS logic (rough regex)
    content = content.replace(/'([^']*)'/g, (match, text) => {
        if (/[\u0600-\u06FF]/.test(text) && !match.includes('t(')) {
            return `t(\`${text}\`)`;
        }
        return match;
    });
    
    content = content.replace(/"([^"]*)"/g, (match, text) => {
        if (/[\u0600-\u06FF]/.test(text) && !match.includes('t(')) {
            return `t(\`${text}\`)`;
        }
        return match;
    });

    fs.writeFileSync(file, content, 'utf-8');
});
console.log('Wrapped components strings in t()');
