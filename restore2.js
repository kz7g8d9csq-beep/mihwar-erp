const fs = require('fs');
let app = fs.readFileSync('frontend/src/App.jsx', 'utf8');

// App.jsx states
app = app.replace(
`  const [empCommission, setEmpCommission] = useState('');
  const [empAllowances, setEmpAllowances] = useState('');`,
`  const [empCommission, setEmpCommission] = useState('');
  const [empCommissionType, setEmpCommissionType] = useState('');
  const [empAllowances, setEmpAllowances] = useState('');
  const [empHousingAllowance, setEmpHousingAllowance] = useState('');
  const [empTransportAllowance, setEmpTransportAllowance] = useState('');
  const [empIncentives, setEmpIncentives] = useState('');`
);

app = app.replace(
`setEmpHealthEnd(''); setEmpContractEnd(''); setEmpCommission(''); setEmpAllowances('');`,
`setEmpHealthEnd(''); setEmpContractEnd(''); setEmpCommission(''); setEmpAllowances(''); setEmpCommissionType(''); setEmpHousingAllowance(''); setEmpTransportAllowance(''); setEmpIncentives('');`
);
app = app.replace(
`setEmpHealthEnd(''); setEmpContractEnd(''); setEmpCommission(''); setEmpAllowances('');`,
`setEmpHealthEnd(''); setEmpContractEnd(''); setEmpCommission(''); setEmpAllowances(''); setEmpCommissionType(''); setEmpHousingAllowance(''); setEmpTransportAllowance(''); setEmpIncentives('');`
);

app = app.replace(
`commission: empCommission !== '' ? Number(empCommission) : (emp.commission || 0),
            allowances: empAllowances !== '' ? Number(empAllowances) : (emp.allowances || 0)`,
`commission: empCommission !== '' ? Number(empCommission) : (emp.commission || 0),
            commissionType: empCommissionType.trim() || emp.commissionType,
            allowances: empAllowances !== '' ? Number(empAllowances) : (emp.allowances || 0),
            housingAllowance: empHousingAllowance !== '' ? Number(empHousingAllowance) : (emp.housingAllowance || 0),
            transportAllowance: empTransportAllowance !== '' ? Number(empTransportAllowance) : (emp.transportAllowance || 0),
            incentives: empIncentives !== '' ? Number(empIncentives) : (emp.incentives || 0)`
);

app = app.replace(
`commission: empCommission !== '' ? Number(empCommission) : 0,
        allowances: empAllowances !== '' ? Number(empAllowances) : 0`,
`commission: empCommission !== '' ? Number(empCommission) : 0,
        commissionType: empCommissionType.trim() || '',
        allowances: empAllowances !== '' ? Number(empAllowances) : 0,
        housingAllowance: empHousingAllowance !== '' ? Number(empHousingAllowance) : 0,
        transportAllowance: empTransportAllowance !== '' ? Number(empTransportAllowance) : 0,
        incentives: empIncentives !== '' ? Number(empIncentives) : 0`
);

app = app.replace(
`setEmpCommission(emp.commission !== undefined ? emp.commission : '');
    setEmpAllowances(emp.allowances !== undefined ? emp.allowances : '');`,
`setEmpCommission(emp.commission !== undefined ? emp.commission : '');
    setEmpCommissionType(emp.commissionType || '');
    setEmpAllowances(emp.allowances !== undefined ? emp.allowances : '');
    setEmpHousingAllowance(emp.housingAllowance !== undefined ? emp.housingAllowance : '');
    setEmpTransportAllowance(emp.transportAllowance !== undefined ? emp.transportAllowance : '');
    setEmpIncentives(emp.incentives !== undefined ? emp.incentives : '');`
);

const oldInputs = `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: theme.bgMain, padding: '12px', borderRadius: '10px', border: \`1px solid \${theme.border}\` }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>???? ??????? (%)</label>
                  <input type="number" step="0.1" value={empCommission} onChange={e=>setEmpCommission(e.target.value)} placeholder="????: 5" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>??? ???????</label>
                  <input type="number" value={empAllowances} onChange={e=>setEmpAllowances(e.target.value)} placeholder="????: 2" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>`;

const newInputs = `<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: theme.bgMain, padding: '12px', borderRadius: '10px', border: \`1px solid \${theme.border}\` }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>???????</label>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <input type="number" step="0.1" value={empCommission} onChange={e=>setEmpCommission(e.target.value)} placeholder="??????" style={{ width: '40%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                    <input type="text" value={empCommissionType} onChange={e=>setEmpCommissionType(e.target.value)} placeholder="????? (???????? ????????...)" style={{ width: '60%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>??????? (?.?)</label>
                  <input type="number" value={empIncentives} onChange={e=>setEmpIncentives(e.target.value)} placeholder="????: 500" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: theme.bgMain, padding: '12px', borderRadius: '10px', border: \`1px solid \${theme.border}\` }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>??? ??? (?.?)</label>
                  <input type="number" value={empHousingAllowance} onChange={e=>setEmpHousingAllowance(e.target.value)} placeholder="??????" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>??? ??????? (?.?)</label>
                  <input type="number" value={empTransportAllowance} onChange={e=>setEmpTransportAllowance(e.target.value)} placeholder="??????" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: '#d97706' }}>????? ????</label>
                  <input type="number" value={empAllowances} onChange={e=>setEmpAllowances(e.target.value)} placeholder="??????" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: theme.cardBg, color: theme.textDark, border: \`1px solid \${theme.border}\`, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>`;
app = app.replace(oldInputs, newInputs);

fs.writeFileSync('frontend/src/App.jsx', app);


let hr = fs.readFileSync('frontend/src/components/HrTab.jsx', 'utf8');
hr = hr.replace(
`<div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: \`1px solid \${theme.border}\` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>?????? ??????? ????????</p><h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '24px' }}>{totalPayroll.toLocaleString()} {t.currency}</h2></div>
        </div>`,
`<div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: \`1px solid \${theme.border}\` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>?????? ??????? ????????</p><h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '24px' }}>{totalPayroll.toLocaleString()} {t.currency}</h2></div>
          <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: \`1px solid \${theme.border}\` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>?????? ????????</p><h2 style={{ color: '#d97706', margin: '8px 0 0 0', fontSize: '24px' }}>{employees.reduce((sum, e) => sum + (Number(e.commission) || 0), 0).toLocaleString()} {t.currency}</h2></div>
          <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: \`1px solid \${theme.border}\` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>?????? ???????</p><h2 style={{ color: '#8b5cf6', margin: '8px 0 0 0', fontSize: '24px' }}>{employees.reduce((sum, e) => sum + (Number(e.incentives) || 0), 0).toLocaleString()} {t.currency}</h2></div>
        </div>`
);

const oldHead = `<th style={{ padding: '12px' }}>??????</th><th style={{ padding: '12px' }}>??? ??????? / ??????</th><th style={{ padding: '12px' }}>?????? ??????</th><th style={{ padding: '12px' }}>?????? ????????? ????????</th><th style={{ padding: '12px' }}>??????? ?????????</th><th style={{ padding: '12px' }}>?????? ???????</th><th style={{ padding: '12px' }}>?????????</th>`;
const newHead = `<th style={{ padding: '12px' }}>??????</th><th style={{ padding: '12px' }}>??? ??????? / ??????</th><th style={{ padding: '12px' }}>?????? ??????? ??????</th><th style={{ padding: '12px' }}>?????? ????????? ????????</th><th style={{ padding: '12px' }}>??????? ?????</th><th style={{ padding: '12px' }}>????????</th><th style={{ padding: '12px' }}>?????? ???????</th><th style={{ padding: '12px' }}>?????????</th>`;
hr = hr.replace(oldHead, newHead);

const oldRow = `<td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name} <span style={{ fontSize: '11px', color: theme.textMuted }}>(#{emp.empNo})</span></td>
                  <td style={{ padding: '12px' }}>{emp.idNumber}</td>
                  <td style={{ padding: '12px' }}>{emp.role} <br/><span style={{ color: '#2dd4bf', fontSize: '11px' }}>{emp.dept}</span></td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{emp.salary} {t.currency}</span>
                    <br/><span style={{ color: '#ef4444', fontSize: '11px' }}>???: {emp.deductions} {t.currency}</span>
                    <div style={{ fontSize: '11px', color: '#d97706', marginTop: '3px' }}>
                      {emp.commission ? \`?????: \${emp.commission}% \` : ''}
                      {emp.allowances ? \`| ?????: \${emp.allowances}\` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}><span>{emp.insurance}</span><br/><span style={{ color: '#38bdf8', fontSize: '11px' }}>??????: {emp.vacations} ???</span></td>
                  <td style={{ padding: '12px', fontSize: '11px' }}>?????: {emp.iqamaEnd} <br/>???: {emp.healthEnd} <br/>???: {emp.contractEnd}</td>`;
const newRow = `<td style={{ padding: '12px', fontWeight: 'bold' }}>
                    <div style={{ marginBottom: '4px' }}>{emp.name}</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted }}>#{emp.empNo}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{emp.idNumber}</td>
                  <td style={{ padding: '12px' }}>{emp.role} <br/><span style={{ color: '#2dd4bf', fontSize: '11px' }}>{emp.dept}</span></td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '4px' }}>?????: {emp.salary} {t.currency}</div>
                    {emp.deductions > 0 && <div style={{ color: '#ef4444', fontSize: '11px', marginBottom: '2px' }}>???: {emp.deductions} {t.currency}</div>}
                    {emp.incentives > 0 && <div style={{ color: '#8b5cf6', fontSize: '11px', marginBottom: '2px' }}>?????: {emp.incentives} {t.currency}</div>}
                    {emp.commission > 0 && <div style={{ color: '#d97706', fontSize: '11px', marginBottom: '2px' }}>?????: {emp.commission} {emp.commissionType ? \`(\${emp.commissionType})\` : ''}</div>}
                    {emp.housingAllowance > 0 && <div style={{ color: '#3b82f6', fontSize: '11px', marginBottom: '2px' }}>???: {emp.housingAllowance} {t.currency}</div>}
                    {emp.transportAllowance > 0 && <div style={{ color: '#3b82f6', fontSize: '11px', marginBottom: '2px' }}>???????: {emp.transportAllowance} {t.currency}</div>}
                    {emp.allowances > 0 && <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '2px' }}>????? ????: {emp.allowances} {t.currency}</div>}
                  </td>
                  <td style={{ padding: '12px' }}>{emp.insurance}</td>
                  <td style={{ padding: '12px' }}><span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{emp.vacations} ???</span></td>
                  <td style={{ padding: '12px', fontSize: '12px', lineHeight: '1.6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span>?????:</span> <span style={{ color: theme.textMuted }}>{emp.iqamaEnd || '-'}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span>????? ???:</span> <span style={{ color: theme.textMuted }}>{emp.healthEnd || '-'}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span>??? ?????:</span> <span style={{ color: theme.textMuted }}>{emp.contractEnd || '-'}</span></div>
                  </td>`;
hr = hr.replace(oldRow, newRow);
hr = hr.replace(`colSpan="7"`, `colSpan="8"`);
fs.writeFileSync('frontend/src/components/HrTab.jsx', hr);

console.log('Restored App.jsx and HrTab.jsx');
