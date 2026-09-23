const fs = require('fs');
const dir = 'frontend/src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx')).map(f => dir + '/' + f);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf-8');

    // Safe JSX Text: >Arabic text< without { or } inside
    content = content.replace(/>([^<{}]+)</g, (match, p1) => {
        if (/[\u0600-\u06FF]/.test(p1)) {
            const stripped = p1.trim();
            if (stripped && !stripped.includes('t(')) {
                return match.replace(stripped, `{t(\`${stripped}\`)}`);
            }
        }
        return match;
    });

    // Safe Attributes: placeholder="Arabic", title="Arabic"
    content = content.replace(/\b(placeholder|title)="([^"]+)"/g, (match, attr, text) => {
        if (/[\u0600-\u06FF]/.test(text)) {
            return `${attr}={t(\`${text}\`)}`;
        }
        return match;
    });

    fs.writeFileSync(file, content, 'utf-8');
});
console.log('Safely wrapped components strings in t()');
