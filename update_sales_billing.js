const fs = require('fs');
let content = fs.readFileSync('frontend/src/components/SalesBillingTab.jsx', 'utf8');

// 1. Replace the blue box with dynamic text
const blueBoxRegex = /(<div style=\{\{\s*fontSize: '12px',\s*color: '#8b5cf6',\s*background: '#8b5cf615',[^>]*>\s*)<span[^>]*>[^<]*<strong>[^<]*<\/strong><\/span>\s*<span[^>]*>[^<]*<strong>[^<]*<\/strong><\/span>\s*(<\/div>)/;
const newBlueBox = `$1
            {Number(selectedProd.boxSize) === 1 ? (
              <span>عمولة القطعة: <strong>{Number(selectedProd.cartonCommission || selectedProd.commissionPerBox || 0).toFixed(2)} {currency}</strong></span>
            ) : (
              <>
                <span>سعة الكرتون: <strong>{selectedProd.boxSize || 12} حبة</strong></span>
                <span>عمولة الكرتون: <strong>{Number(selectedProd.cartonCommission || selectedProd.commissionPerBox || 0).toFixed(2)} {currency}</strong></span>
              </>
            )}
          $2`;
content = content.replace(blueBoxRegex, newBlueBox);

// 2. Replace the select options for unitType
const selectRegex = /(<select\s*value=\{salesUnitType\}\s*onChange=\{e => setSalesUnitType\(e\.target\.value\)\}[^>]*>\s*<option[^>]*>[^<]*<\/option>\s*)(<option[^>]*>[^<]*<\/option>)/;
const newSelect = `$1
                {(!selectedProd || Number(selectedProd.boxSize) > 1) && (
                  $2
                )}`;
content = content.replace(selectRegex, newSelect);

fs.writeFileSync('frontend/src/components/SalesBillingTab.jsx', content, 'utf8');
console.log('SalesBillingTab updated.');
