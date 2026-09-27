const fs = require('fs');
let hrContent = fs.readFileSync('frontend/src/components/HrTab.jsx', 'utf8');

// The array looks like this:
// { id: 'employees', label: 'الموظفين' },
// { id: 'deductions', label: 'الخصومات' },
// { id: 'incentives', label: 'الحوافز والمكافآت' },
// { id: 'alerts', label: 'الوثائق والتنبيهات' }

const regex = /(\{\s*id:\s*'alerts',\s*label:\s*[^}]+\})/;
const replacement = "{ id: 'commissions', label: 'العمولات' },\n                $1";

hrContent = hrContent.replace(regex, replacement);

fs.writeFileSync('frontend/src/components/HrTab.jsx', hrContent, 'utf8');
console.log('Added commissions tab button to HrTab.jsx');
