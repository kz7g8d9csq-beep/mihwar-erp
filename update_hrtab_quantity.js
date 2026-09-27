const fs = require('fs');
let hrContent = fs.readFileSync('frontend/src/components/HrTab.jsx', 'utf8');

// The replacement for HrTab commissions logic
const oldHrLogic = `              let cartons = 0;
              (inv.items || []).forEach(it => {
                cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / 12)));
              });
              cartons = Math.floor(cartons * 100) / 100;`;

const newHrLogic = `              let cartons = 0;
              let pieces = 0;
              (inv.items || []).forEach(it => {
                const bSize = it.boxSize || 12; // fallback if not joined
                if (bSize === 1) {
                  pieces += Number(it.quantity);
                } else {
                  cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / bSize)));
                }
              });
              cartons = Math.floor(cartons * 100) / 100;
              let qtyStr = '';
              if (cartons > 0) qtyStr += cartons + ' كرتون ';
              if (pieces > 0) qtyStr += (qtyStr ? 'و ' : '') + pieces + ' قطعة';
              if (!qtyStr) qtyStr = '0';
              // Override cartons variable for sorting/totals if needed, but we can pass qtyStr directly
              const cartonsForTotal = cartons;`;

hrContent = hrContent.replace(oldHrLogic, newHrLogic);

hrContent = hrContent.replace(
  "cartons,\n                totalAmount:",
  "cartons: qtyStr,\n                cartonsRaw: cartonsForTotal,\n                piecesRaw: pieces,\n                totalAmount:"
);

// We need to also update the sum logic for cartons in HrTab
hrContent = hrContent.replace(
  "totalCartonsSum += cartons;",
  "totalCartonsSum += cartonsForTotal;"
);

// We need to replace the column header 'عدد الكراتين' with 'الكمية المباعة'
hrContent = hrContent.replace(/<th[^>]*>عدد الكراتين<\/th>/g, "<th style={{ padding: '12px' }}>الكمية المباعة</th>");
hrContent = hrContent.replace("إجمالي الكراتين المباعة", "إجمالي الكراتين المباعة"); // keep this as is or change?

// Same in exportDeptExcel logic inside HrTab.jsx
const oldExportLogic = `          let cartons = 0;
          (inv.items || []).forEach(it => { cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / 12))); });
          cartons = Math.floor(cartons * 100) / 100;`;
const newExportLogic = `          let cartons = 0;
          let pieces = 0;
          (inv.items || []).forEach(it => { 
            const bSize = it.boxSize || 12;
            if (bSize === 1) pieces += Number(it.quantity);
            else cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / bSize))); 
          });
          cartons = Math.floor(cartons * 100) / 100;
          let qtyStr = '';
          if (cartons > 0) qtyStr += cartons + ' كرتون ';
          if (pieces > 0) qtyStr += (qtyStr ? 'و ' : '') + pieces + ' قطعة';
          if (!qtyStr) qtyStr = '0';`;
hrContent = hrContent.replace(oldExportLogic, newExportLogic);

// Then replace ${cartons} in export with ${qtyStr}
// We have this: <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;">\${cartons}</td>
hrContent = hrContent.replace(
  "<td style=\"border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;\">\\${cartons}</td>",
  "<td style=\"border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;\">\\${qtyStr}</td>"
);

// We need to replace "عدد الكراتين المباعة" in the export table with "الكمية المباعة"
hrContent = hrContent.replace(/<th[^>]*>عدد الكراتين المباعة<\/th>/g, "<th style=\"border: 1px solid #94a3b8; padding: 12px; text-align: center;\">الكمية المباعة</th>");

fs.writeFileSync('frontend/src/components/HrTab.jsx', hrContent, 'utf8');
console.log('HrTab table and export updated for quantity format.');

