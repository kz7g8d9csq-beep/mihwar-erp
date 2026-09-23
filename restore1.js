const fs = require('fs');

// 1. SalesBillingTab
let sales = fs.readFileSync('frontend/src/components/SalesBillingTab.jsx', 'utf8');
sales = sales.replace(
`<label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>????? (?.?)</label>
            <input type="number" value={itemPrice} onChange={e=>setItemPrice(e.target.value)} placeholder="?????" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>??????</label>`,
`<label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>??????</label>`
);
sales = sales.replace(
`</button>
            </div>
          </div>`,
`</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>????? (?.?)</label>
            <input type="number" value={itemPrice} onChange={e=>setItemPrice(e.target.value)} placeholder="?????" style={{ width: '100%', padding: '11px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: \`1px solid \${theme.border}\`, outline: 'none', boxSizing: 'border-box' }} />
          </div>`
);
fs.writeFileSync('frontend/src/components/SalesBillingTab.jsx', sales);

// 2. InventoryTab
let inv = fs.readFileSync('frontend/src/components/InventoryTab.jsx', 'utf8');
inv = inv.replace(`<th style={{ padding: '10px' }}>Price</th>`, '');
inv = inv.replace(`<td style={{ padding: '10px' }}>{i.price}</td>`, '');
fs.writeFileSync('frontend/src/components/InventoryTab.jsx', inv);

console.log("Restored Sales and Inventory.");
