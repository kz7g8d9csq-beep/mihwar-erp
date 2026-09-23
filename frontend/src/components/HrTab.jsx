const HrTab = ({
  t, theme, isDark, user,
  hrSubTab, setHrSubTab,
  employees, filteredEmployees, filteredDeductions, filteredAlerts,
  documentAlerts, urgentAlertsCount,
  hrSearchQuery, setHrSearchQuery,
  hrPayrollSearchQuery, setHrPayrollSearchQuery,
  hrAlertsSearchQuery, setHrAlertsSearchQuery,
  totalPayroll,
  handleOpenEditEmp, handleDeleteEmployee,
  handleRemoveDeduction,
  setShowAddEmpModal, setShowDeductModal,
  setEditingEmpId,
  empFormReset
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.hrTitle}</h2>
          <p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t.hrSub}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => { if (empFormReset) empFormReset(); setEditingEmpId(null); setShowAddEmpModal(true); }} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            {t.addEmpBtn}
          </button>
          <button onClick={() => setShowDeductModal(true)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            {t.addDeductBtn}
          </button>
        </div>
      </div>

      {/* شريط التبويبات الفرعية */}
      <div style={{ display: 'flex', gap: '8px', background: theme.cardBg, padding: '6px', borderRadius: '12px', border: `1px solid ${theme.border}`, width: 'fit-content' }}>
        <button 
          type="button" 
          onClick={() => setHrSubTab('employees')}
          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: hrSubTab === 'employees' ? '#d97706' : 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          الموظفون
        </button>
        <button 
          type="button" 
          onClick={() => setHrSubTab('payroll')}
          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: hrSubTab === 'payroll' ? '#d97706' : 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          الرواتب
        </button>
        <button 
          type="button" 
          onClick={() => setHrSubTab('alerts')}
          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: hrSubTab === 'alerts' ? '#d97706' : 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>الوثائق والتنبيهات</span>
          {urgentAlertsCount > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
              {urgentAlertsCount}
            </span>
          )}
        </button>
      </div>

      {hrSubTab !== 'alerts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي الموظفين</p><h2 style={{ color: '#38bdf8', margin: '8px 0 0 0', fontSize: '24px' }}>{employees.length} موظف</h2></div>
          <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>إجمالي الرواتب الأساسية</p><h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '24px' }}>{totalPayroll.toLocaleString()} {t.currency}</h2></div>
        </div>
      )}

      {/* 1: تبويب الموظفون */}
      {hrSubTab === 'employees' && (
        <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '17px' }}>📋 سجل الموظفين وبيانات العمل والبدلات والعمولات</h3>
            <input type="text" value={hrSearchQuery} onChange={e => setHrSearchQuery(e.target.value)} placeholder="🔍 ابحث بالاسم أو رقم الهوية..." style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '13px', width: '260px' }} />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '950px' }}>
            <thead>
              <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                <th style={{ padding: '12px' }}>الموظف</th><th style={{ padding: '12px' }}>رقم الإقامة / الهوية</th><th style={{ padding: '12px' }}>المسمى والقسم</th><th style={{ padding: '12px' }}>الراتب والعمولات والبدلات</th><th style={{ padding: '12px' }}>التأمين والأجازات</th><th style={{ padding: '12px' }}>انتهاء الوثائق</th><th style={{ padding: '12px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name} <span style={{ fontSize: '11px', color: theme.textMuted }}>(#{emp.empNo})</span></td>
                  <td style={{ padding: '12px' }}>{emp.idNumber}</td>
                  <td style={{ padding: '12px' }}>{emp.role} <br/><span style={{ color: '#2dd4bf', fontSize: '11px' }}>{emp.dept}</span></td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{emp.salary} {t.currency}</span>
                    <br/><span style={{ color: '#ef4444', fontSize: '11px' }}>خصم: {emp.deductions} {t.currency}</span>
                    <div style={{ fontSize: '11px', color: '#d97706', marginTop: '3px' }}>
                      {emp.commission ? `عمولة: ${emp.commission}% ` : ''}
                      {emp.allowances ? `| بدلات: ${emp.allowances}` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}><span>{emp.insurance}</span><br/><span style={{ color: '#38bdf8', fontSize: '11px' }}>أجازات: {emp.vacations} يوم</span></td>
                  <td style={{ padding: '12px', fontSize: '11px' }}>إقامة: {emp.iqamaEnd} <br/>صحي: {emp.healthEnd} <br/>عقد: {emp.contractEnd}</td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleOpenEditEmp(emp)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>تعديل ✏️</button>
                      <button onClick={() => handleDeleteEmployee(emp.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>حذف 🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredEmployees.length && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>لا توجد نتائج مطابقة للبحث.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2: تبويب الرواتب والخصومات */}
      {hrSubTab === 'payroll' && (
        <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#fca5a5' }}>🔻 سجل الخصومات وإدارتها</h3>
            <input 
              type="text" 
              value={hrPayrollSearchQuery} 
              onChange={e => setHrPayrollSearchQuery(e.target.value)} 
              placeholder="🔍 ابحث بالاسم أو رقم الهوية..." 
              style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '13px', width: '260px' }} 
            />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
                <th style={{ padding: '10px' }}>اسم الموظف</th><th style={{ padding: '10px' }}>قيمة الخصم</th><th style={{ padding: '10px' }}>سبب الخصم</th><th style={{ padding: '10px' }}>تاريخ التسجيل</th><th style={{ padding: '10px' }}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeductions.map(d => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{d.empName}</td>
                  <td style={{ padding: '10px', color: '#ef4444', fontWeight: 'bold' }}>{d.amount} {t.currency}</td>
                  <td style={{ padding: '10px' }}>{d.reason}</td>
                  <td style={{ padding: '10px', color: theme.textMuted }}>{d.date}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleRemoveDeduction(d.id, d.empName, d.amount)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>إعفاء الخصم ↩️</button>
                  </td>
                </tr>
              ))}
              {!filteredDeductions.length && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>لا توجد نتائج مطابقة للبحث.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 3: تبويب الوثائق والتنبيهات */}
      {hrSubTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: theme.cardBg, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: theme.textDark }}>🔔 قائمة تنبيهات وثائق الموظفين</h3>
            <input 
              type="text" 
              value={hrAlertsSearchQuery} 
              onChange={e => setHrAlertsSearchQuery(e.target.value)} 
              placeholder="🔍 ابحث بالاسم أو رقم الهوية..." 
              style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '13px', width: '260px' }} 
            />
          </div>
          
          {filteredAlerts.map(alert => {
            const isExpired = alert.daysDiff < 0;
            return (
              <div 
                key={alert.id} 
                style={{ 
                  background: theme.cardBg, 
                  borderRadius: '12px', 
                  border: `1px solid ${isExpired ? '#7f1d1d' : theme.border}`, 
                  padding: '16px 25px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '900', color: theme.textDark }}>
                    {alert.empName}
                  </h4>
                  <span style={{ fontSize: '13px', color: theme.textMuted }}>
                    {alert.docType} (هوية: {alert.empIdNumber})
                  </span>
                </div>
                <div>
                  <span style={{
                    background: isExpired ? '#991b1b' : '#334155',
                    color: '#fff',
                    padding: '6px 20px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}>
                    {isExpired ? `منتهي منذ ${Math.abs(alert.daysDiff)} يوم` : `يتبقى ${alert.daysDiff} يوم`}
                  </span>
                </div>
              </div>
            );
          })}
          {filteredAlerts.length === 0 && (
            <div style={{ background: theme.cardBg, padding: '35px', borderRadius: '14px', textAlign: 'center', color: theme.textMuted, border: `1px solid ${theme.border}` }}>
              {documentAlerts.length === 0
                ? '✅ جميع وثائق الموظفين (الإقامة، الشهادة الصحية، العقود) سارية ومحدثة ولا توجد تنبيهات منتهية!'
                : 'لا توجد نتائج مطابقة للبحث في التنبيهات.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HrTab;

