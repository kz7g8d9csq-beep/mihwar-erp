const fs = require('fs');

let content = fs.readFileSync('frontend/src/components/HrTab.jsx', 'utf8');

// 1. Add invoices prop
content = content.replace(
  'deductionsList = [], setDeductionsList',
  'deductionsList = [], setDeductionsList,\n  invoices = []'
);

// 2. Add commissions tab to the array
const oldTabsArray = `              {[
                { id: 'employees', label: 'الموظفين' },
                { id: 'deductions', label: 'الخصومات' },
                { id: 'incentives', label: 'الحوافز والمكافآت' },
                { id: 'alerts', label: 'الوثائق والتنبيهات' }
              ]`;
const newTabsArray = `              {[
                { id: 'employees', label: 'الموظفين' },
                { id: 'deductions', label: 'الخصومات' },
                { id: 'incentives', label: 'الحوافز والمكافآت' },
                { id: 'commissions', label: 'العمولات' },
                { id: 'alerts', label: 'الوثائق والتنبيهات' }
              ]`;
content = content.replace(oldTabsArray, newTabsArray);
if (content === fs.readFileSync('frontend/src/components/HrTab.jsx', 'utf8') && !content.includes("id: 'commissions'")) {
  console.log("Failed to replace tabs array.");
}

// 3. Inject commissions view after incentives
const searchIncentivesEnd = `                  {deptIncentives.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا توجد حوافز مسجلة.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}`;

const insertCommissionsBlock = searchIncentivesEnd + `\n
          {hrSubTab === 'commissions' && (() => {
            // Filter invoices to only those that have a sales rep in this department
            const deptEmpsIds = deptEmps.map(e => e.id);
            const deptCommissions = invoices.filter(inv => inv.salesRepId && deptEmpsIds.includes(Number(inv.salesRepId)));
            
            let totalCommissionSum = 0;
            let totalCartonsSum = 0;
            const mappedCommissions = deptCommissions.map(inv => {
              const emp = employees.find(e => e.id === Number(inv.salesRepId));
              let cartons = 0;
              (inv.items || []).forEach(it => {
                cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / 12)));
              });
              cartons = Math.floor(cartons * 100) / 100;

              const commAmount = Number(inv.totalCommission || 0);
              const totalAmount = Number(inv.totalAmount || 0);
              
              totalCommissionSum += commAmount;
              totalCartonsSum += cartons;
              
              return {
                id: inv.id,
                empName: emp ? emp.name : inv.salesRepName,
                idNumber: emp ? (emp.idNumber || emp.nationalId) : '-',
                invoiceNo: inv.invoiceNo,
                customerName: inv.customer ? inv.customer.name : 'عميل نقدي',
                date: inv.createdAt ? String(inv.createdAt).slice(0, 10) : '-',
                cartons,
                totalAmount: totalAmount,
                commission: commAmount
              };
            });

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div style={{ background: theme?.cardBg || '#1e293b', border: \`1px solid \${theme?.border || '#334155'}\`, padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8', marginBottom: '5px' }}>إجمالي الفواتير</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#38bdf8' }}>{mappedCommissions.length}</div>
                  </div>
                  <div style={{ background: theme?.cardBg || '#1e293b', border: \`1px solid \${theme?.border || '#334155'}\`, padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8', marginBottom: '5px' }}>إجمالي الكراتين المباعة</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{Number(totalCartonsSum.toFixed(2))}</div>
                  </div>
                  <div style={{ background: theme?.cardBg || '#1e293b', border: \`1px solid \${theme?.border || '#334155'}\`, padding: '15px', borderRadius: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8', marginBottom: '5px' }}>إجمالي العمولات المستحقة</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>{totalCommissionSum.toFixed(2)} ر.س</div>
                  </div>
                </div>
                
                <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: \`1px solid \${theme?.border || '#334155'}\`, padding: '20px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '900px' }}>
                    <thead>
                      <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: \`2px solid \${theme?.border || '#334155'}\` }}>
                        <th style={{ padding: '12px' }}>اسم المندوب</th>
                        <th style={{ padding: '12px' }}>رقم الهوية</th>
                        <th style={{ padding: '12px' }}>رقم الفاتورة</th>
                        <th style={{ padding: '12px' }}>العميل</th>
                        <th style={{ padding: '12px' }}>التاريخ</th>
                        <th style={{ padding: '12px' }}>عدد الكراتين</th>
                        <th style={{ padding: '12px' }}>قيمة الفاتورة</th>
                        <th style={{ padding: '12px' }}>العمولة المستحقة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappedCommissions.map(c => (
                        <tr key={c.id} style={{ borderBottom: \`1px solid \${theme?.border || '#334155'}\` }}>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#38bdf8' }}>{c.empName}</td>
                          <td style={{ padding: '12px', color: theme?.textMuted || '#94a3b8' }}>{c.idNumber}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>#{c.invoiceNo}</td>
                          <td style={{ padding: '12px' }}>{c.customerName}</td>
                          <td style={{ padding: '12px' }} dir="ltr">{c.date}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981', textAlign: 'center' }}>{c.cartons}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{c.totalAmount.toFixed(2)} ر.س</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: '#8b5cf6', textAlign: 'center' }}>{c.commission.toFixed(2)} ر.س</td>
                        </tr>
                      ))}
                      {mappedCommissions.length === 0 && (
                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا توجد فواتير وعمولات مناديب مسجلة في هذا القسم.</td></tr>
                      )}
                    </tbody>
                    {mappedCommissions.length > 0 && (
                      <tfoot>
                        <tr style={{ background: isDark ? '#0f172a' : '#f1f5f9', fontWeight: 'bold', fontSize: '14px' }}>
                          <td colSpan="5" style={{ padding: '15px', textAlign: 'left', color: theme?.textDark || '#0f172a' }}>الإجمالي الكلي:</td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#10b981' }}>{Number(totalCartonsSum.toFixed(2))} كرتون</td>
                          <td style={{ padding: '15px' }}></td>
                          <td style={{ padding: '15px', textAlign: 'center', color: '#8b5cf6' }}>{totalCommissionSum.toFixed(2)} ر.س</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            );
          })()}`;

if (content.includes(searchIncentivesEnd)) {
  content = content.replace(searchIncentivesEnd, insertCommissionsBlock);
} else {
  console.log("Could not find incentives block to inject commissions tab!");
}

// 4. Update exportDeptExcel
const exportTableEndSearch = `      </tr>\`;
  
      const excelTemplate = \`<html`;
const exportAddCommissions = `      </tr>\`;

      const deptEmpsIdsExport = deptEmpsList.map(e => e.id);
      const deptCommissionsExport = (invoices || []).filter(inv => inv.salesRepId && deptEmpsIdsExport.includes(Number(inv.salesRepId)));
      
      let commRows = '';
      let sumCartons = 0;
      let sumComms = 0;
      deptCommissionsExport.forEach((inv, idx) => {
          const emp = employees.find(e => e.id === Number(inv.salesRepId));
          let cartons = 0;
          (inv.items || []).forEach(it => { cartons += (it.cartonsCount ? Number(it.cartonsCount) : (it.unitType === 'كرتون' ? Number(it.quantity) : (Number(it.quantity) / 12))); });
          cartons = Math.floor(cartons * 100) / 100;
          const commAmount = Number(inv.totalCommission || 0);
          sumCartons += cartons;
          sumComms += commAmount;
          const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
          
          commRows += \`<tr style="background-color: \${bgColor};">
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;">\${emp ? emp.name : inv.salesRepName}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:'\\\\@';">\${emp ? (emp.idNumber || emp.nationalId) : '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">#\${inv.invoiceNo}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">\${inv.customer ? inv.customer.name : 'عميل نقدي'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;" dir="ltr">\${inv.createdAt ? String(inv.createdAt).slice(0, 10) : '-'}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;">\${cartons}</td>
            <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #8b5cf6;">\${commAmount.toFixed(2)} ر.س</td>
          </tr>\`;
      });
      
      commRows += \`<tr style="background-color: #e2e8f0; font-weight: bold;">
        <td colspan="5" style="border: 1px solid #94a3b8; padding: 12px; text-align: left; font-size: 13px; color: #0f172a;">إجمالي العمولات والكراتين</td>
        <td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #10b981; font-size: 13px;">\${sumCartons.toFixed(2)}</td>
        <td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #8b5cf6; font-size: 14px;">\${sumComms.toFixed(2)} ر.س</td>
      </tr>\`;
  
      const excelTemplate = \`<html`;

content = content.replace(exportTableEndSearch, exportAddCommissions);

const tBodyEnd = `            </tbody>
          </table>
        </body>
      </html>\`;`;

const insertCommissionsSheet = `            </tbody>
          </table>
          \${deptCommissionsExport.length > 0 ? \`
            <br><br>
            <table>
              <thead>
                <tr>
                  <th colspan="7" style="background-color: #1e293b; color: #ffffff; font-size: 16px; padding: 12px; text-align: center; font-weight: bold;">سجل عمولات المناديب</th>
                </tr>
                <tr style="background-color: #e2e8f0;">
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">اسم المندوب</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">رقم الهوية</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">رقم الفاتورة</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">العميل</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">التاريخ</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">عدد الكراتين المباعة</th>
                  <th style="border: 1px solid #94a3b8; padding: 12px; text-align: center;">قيمة العمولة المستحقة</th>
                </tr>
              </thead>
              <tbody>\${commRows}</tbody>
            </table>
          \` : ''}
        </body>
      </html>\`;`;

content = content.replace(tBodyEnd, insertCommissionsSheet);

fs.writeFileSync('frontend/src/components/HrTab.jsx', content, 'utf8');
console.log('HrTab.jsx modifications complete.');
