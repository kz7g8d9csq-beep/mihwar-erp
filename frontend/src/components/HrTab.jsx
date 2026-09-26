import React, { useState, useEffect } from 'react';

const HrTab = ({
  t, theme = {}, isDark, user,
  employees = [], setEmployees,
  incentiveRecords = [], setIncentiveRecords,
  deductionsList = [], setDeductionsList, handleOpenEditEmp
}) => {
  const defaultDepts = [
    { id: 1, name: 'المبيعات والتوزيع', desc: 'إدارة المبيعات والمندوبين' },
    { id: 2, name: 'المستودع والحركة', desc: 'إدارة المخزون والتوصيل' },
    { id: 3, name: 'الإدارة العامة', desc: 'الإدارة والمالية' }
  ];

  const [departments, setDepartments] = useState(() => {
    try {
      const saved = localStorage.getItem('mihwar_departments');
      return saved ? JSON.parse(saved) : defaultDepts;
    } catch {
      return defaultDepts;
    }
  });

  useEffect(() => {
    localStorage.setItem('mihwar_departments', JSON.stringify(departments));
  }, [departments]);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  // Tabs and Search States
  const [hrSubTab, setHrSubTab] = useState('employees');
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [empSearchQuery, setEmpSearchQuery] = useState('');

  // Modals state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empSalary, setEmpSalary] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empNationalId, setEmpNationalId] = useState('');
  const [empAddress, setEmpAddress] = useState('');
  const [empMaritalStatus, setEmpMaritalStatus] = useState('أعزب');
  const [empChildrenCount, setEmpChildrenCount] = useState('');
  const [empMedicalInsurance, setEmpMedicalInsurance] = useState('');
  const [empContractEnd, setEmpContractEnd] = useState('');
  const [empNumber, setEmpNumber] = useState('');
  const [empVacations, setEmpVacations] = useState('');
  const [empHousingAllowance, setEmpHousingAllowance] = useState('');
  const [empTransportAllowance, setEmpTransportAllowance] = useState('');
  const [empIqamaEnd, setEmpIqamaEnd] = useState('');
  const [empHealthEnd, setEmpHealthEnd] = useState('');
  const [viewingEmpProfile, setViewingEmpProfile] = useState(null);

  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [incEmpId, setIncEmpId] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incReason, setIncReason] = useState('');

  const [showDeductModal, setShowDeductModal] = useState(false);
  const [dedEmpId, setDedEmpId] = useState('');
  const [dedAmount, setDedAmount] = useState('');
  const [dedReason, setDedReason] = useState('');

  const parseNum = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  const getCleanDateTime = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
  };

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDeptName) return;
    const newDept = { id: Date.now(), name: newDeptName.trim(), desc: newDeptDesc };
    setDepartments([...departments, newDept]);
    setNewDeptName('');
    setNewDeptDesc('');
    setShowAddDeptModal(false);
  };

  const handleDeleteDept = (id, e) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      setDepartments(departments.filter(d => d.id !== id));
    }
  };

  const handleAddEmp = (e) => {
    e.preventDefault();
    if (!empName || !empSalary || !empNationalId) return;
    const newEmp = {
      id: Date.now(),
      empNo: empNumber.trim() || String(employees.length + 1),
      name: empName.trim(),
      role: empRole.trim(),
      idNumber: empNationalId.trim(),
      salary: parseNum(empSalary),
      phone: empPhone.trim(),
      address: empAddress.trim(),
      maritalStatus: empMaritalStatus,
      childrenCount: parseNum(empChildrenCount),
      medicalInsurance: empMedicalInsurance.trim(),
      vacations: parseNum(empVacations) || 21,
      housingAllowance: parseNum(empHousingAllowance),
      transportAllowance: parseNum(empTransportAllowance),
      iqamaEnd: empIqamaEnd || '-',
      healthEnd: empHealthEnd || '-',
      contractEnd: empContractEnd || '-',
      dept: selectedDepartment ? selectedDepartment.name : 'الإدارة العامة',
      incentives: 0,
      deductions: 0
    };
    const updated = [newEmp, ...employees];
    if (setEmployees) {
      setEmployees(updated);
      localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
    }
    setEmpName(''); setEmpRole(''); setEmpNationalId(''); setEmpSalary(''); setEmpPhone('');
    setEmpAddress(''); setEmpMaritalStatus('أعزب'); setEmpChildrenCount('');
    setEmpMedicalInsurance(''); setEmpContractEnd('');
    setEmpNumber(''); setEmpVacations(''); setEmpHousingAllowance(''); setEmpTransportAllowance('');
    setEmpIqamaEnd(''); setEmpHealthEnd('');
    setShowAddEmpModal(false);
  };

  const handleAddIncentive = (e) => {
    e.preventDefault();
    if (!incEmpId || !incAmount) return;
    const emp = employees.find(e => String(e.id) === String(incEmpId));
    const amount = parseNum(incAmount);
    
    const updatedEmps = employees.map(e => 
      String(e.id) === String(incEmpId) 
        ? { ...e, incentives: (parseNum(e.incentives) + amount) }
        : e
    );
    if (setEmployees) {
      setEmployees(updatedEmps);
      localStorage.setItem('mihwar_hr_employees', JSON.stringify(updatedEmps));
    }

    const newRecord = {
      id: Date.now(),
      empName: emp?.name,
      empRole: emp?.role,
      amount: amount,
      reason: incReason,
      date: getCleanDateTime()
    };
    if (setIncentiveRecords) {
      const updatedRecs = [newRecord, ...incentiveRecords];
      setIncentiveRecords(updatedRecs);
      localStorage.setItem('mihwar_hr_incentives', JSON.stringify(updatedRecs));
    }
    
    setIncEmpId(''); setIncAmount(''); setIncReason('');
    setShowIncentiveModal(false);
  };

  const handleAddDeduction = (e) => {
    e.preventDefault();
    if (!dedEmpId || !dedAmount) return;
    const emp = employees.find(e => String(e.id) === String(dedEmpId));
    const amount = parseNum(dedAmount);
    
    const updatedEmps = employees.map(e => 
      String(e.id) === String(dedEmpId) 
        ? { ...e, deductions: (parseNum(e.deductions) + amount) }
        : e
    );
    if (setEmployees) {
      setEmployees(updatedEmps);
      localStorage.setItem('mihwar_hr_employees', JSON.stringify(updatedEmps));
    }

    const newRecord = {
      id: Date.now(),
      empName: emp?.name,
      amount: amount,
      reason: dedReason,
      date: getCleanDateTime()
    };
    if (setDeductionsList) {
      const updatedList = [newRecord, ...deductionsList];
      setDeductionsList(updatedList);
      localStorage.setItem('mihwar_hr_deductions', JSON.stringify(updatedList));
    }
    
    setDedEmpId(''); setDedAmount(''); setDedReason('');
    setShowDeductModal(false);
  };

  const handleWaiveDeduction = (d) => {
    if (window.confirm('هل أنت متأكد من إعفاء هذا الموظف وإلغاء الخصم؟')) {
      const updatedList = deductionsList.filter(record => record.id !== d.id);
      const amountToRestore = parseNum(d.amount);
      const updatedEmps = employees.map(emp => {
        if (emp.name === d.empName) {
          return { ...emp, deductions: Math.max(0, parseNum(emp.deductions) - amountToRestore) };
        }
        return emp;
      });

      if (setDeductionsList) {
        setDeductionsList(updatedList);
        localStorage.setItem('mihwar_hr_deductions', JSON.stringify(updatedList));
      }
      
      if (setEmployees) {
        setEmployees(updatedEmps);
        localStorage.setItem('mihwar_hr_employees', JSON.stringify(updatedEmps));
      }
      
      alert('تم إعفاء الموظف بنجاح وإلغاء استقطاع المبلغ');
    }
  };

  const handleDeleteEmployeeLocal = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      const updated = employees.filter(e => e.id !== id);
      if (setEmployees) {
        setEmployees(updated);
        localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
      }
    }
  };

  // تصدير إكسيل بدون بداية العقد ومع العنوان الوطني والتأمين الطبي
  const exportDeptExcel = () => {
    if (!selectedDepartment) return;

    const deptEmpsList = employees.filter(e => 
      (e.dept && e.dept.trim() === selectedDepartment.name.trim()) ||
      (e.department && e.department.trim() === selectedDepartment.name.trim())
    );

    if (!deptEmpsList.length) {
      alert(`لا يوجد موظفون مسجلون في قسم (${selectedDepartment.name}) لتصديرهم.`);
      return;
    }

    const systemTitle = `نظام محور • كشف مسير رواتب وموظفي قسم (${selectedDepartment.name})`;
    const exportDate = getCleanDateTime();

    let tableRows = '';
    let totalSalaries = 0;
    let totalIncentives = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    deptEmpsList.forEach((emp, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const salary = parseNum(emp.salary);
      const inc = parseNum(emp.incentives);
      const ded = parseNum(emp.deductions);
      const net = Math.max(0, salary + inc - ded);

      totalSalaries += salary;
      totalIncentives += inc;
      totalDeductions += ded;
      totalNet += net;

      tableRows += `<tr style="background-color: ${bgColor};">
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; mso-number-format:'\\@'; color: #d97706;">${emp.empNo || emp.id}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;">${emp.name || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">${emp.role || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:'\\@';">${emp.idNumber || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:'\\@';" dir="ltr">${emp.phone || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">${emp.maritalStatus || 'أعزب'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">${emp.childrenCount || 0}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">${emp.address || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">${emp.medicalInsurance || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">${emp.contractEnd || '-'}</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;">${salary.toFixed(2)} ر.س</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #8b5cf6;">${inc.toFixed(2)} ر.س</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #ef4444;">${ded.toFixed(2)} ر.س</td>
        <td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #0284c7; background-color: #f0f9ff;">${net.toFixed(2)} ر.س</td>
      </tr>`;
    });

    // صف الإجماليات (10 أعمدة بيانات + 4 أعمدة مالية = 14 عموداً)
    tableRows += `<tr style="background-color: #e2e8f0; font-weight: bold;">
      <td colspan="10" style="border: 1px solid #94a3b8; padding: 12px; text-align: center; font-size: 13px; color: #0f172a;">إجمالي مسيرات الرواتب والمستحقات لقسم (${selectedDepartment.name})</td>
      <td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #10b981; font-size: 13px;">${totalSalaries.toFixed(2)} ر.س</td>
      <td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #8b5cf6; font-size: 13px;">${totalIncentives.toFixed(2)} ر.س</td>
      <td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #ef4444; font-size: 13px;">${totalDeductions.toFixed(2)} ر.س</td>
      <td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #0284c7; font-size: 14px; background-color: #e0f2fe;">${totalNet.toFixed(2)} ر.س</td>
    </tr>`;

    const excelTemplate = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>${selectedDepartment.name}</x:Name>
        <x:WorksheetOptions><x:DisplayRightToLeft/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: Tahoma, Arial, sans-serif; direction: rtl; }
          table { border-collapse: collapse; width: 100%; direction: rtl; }
          th { border: 1px solid #94a3b8; background-color: #e2e8f0; color: #0f172a; padding: 12px; font-weight: bold; text-align: center; font-size: 13px; }
          td { border: 1px solid #cbd5e1; padding: 10px; font-size: 12px; }
        </style>
      </head>
      <body dir="rtl">
        <table>
          <thead>
            <tr>
              <th colspan="14" style="background-color: #1e293b; color: #ffffff; font-size: 18px; padding: 16px; text-align: center; font-weight: bold;">${systemTitle}</th>
            </tr>
            <tr>
              <th colspan="14" style="background-color: #334155; color: #e2e8f0; font-size: 12px; padding: 8px; text-align: center;">تاريخ التصدير: ${exportDate} | تقرير مسير معتمد ومصدر آلياً من النظام</th>
            </tr>
            <tr style="background-color: #e2e8f0;">
              <th>الرقم الوظيفي</th>
              <th>اسم الموظف</th>
              <th>المسمى الوظيفي</th>
              <th>الهوية / الإقامة</th>
              <th>رقم الهاتف</th>
              <th>الحالة الاجتماعية</th>
              <th>الأطفال</th>
              <th>العنوان الوطني</th>
              <th>التأمين الطبي</th>
              <th>نهاية العقد</th>
              <th>الراتب الأساسي</th>
              <th>إجمالي الحوافز</th>
              <th>إجمالي الخصومات</th>
              <th>صافي الراتب المستحق</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>`;

    const blob = new Blob(['\ufeff' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_موظفي_${selectedDepartment.name.replace(/\s+/g, '_')}_${Date.now()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputStyle = { width: '100%', padding: '11px', borderRadius: '8px', background: theme?.bgMain || '#0f172a', color: theme?.textDark || '#fff', border: `1px solid ${theme?.border || '#334155'}`, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: theme?.textDark || '#fff' };

  // Data processing for Sub-tabs
  let deptEmps = [];
  let filteredEmps = [];
  let deptDeductions = [];
  let deptIncentives = [];

  if (selectedDepartment) {
    deptEmps = employees.filter(e => 
      (e.dept && e.dept.trim() === selectedDepartment.name.trim()) ||
      (e.department && e.department.trim() === selectedDepartment.name.trim())
    );

    filteredEmps = deptEmps.filter(e => 
      (e.name || '').includes(empSearchQuery) || 
      (e.idNumber || '').includes(empSearchQuery)
    );

    const deptEmpNames = deptEmps.map(e => e.name);
    
    deptDeductions = deductionsList
      .filter(d => deptEmpNames.includes(d.empName))
      .map(d => {
        const e = deptEmps.find(emp => emp.name === d.empName);
        return { ...d, idNumber: e ? e.idNumber : '-' };
      })
      .filter(d => (d.empName || '').includes(empSearchQuery) || (d.idNumber || '').includes(empSearchQuery));

    deptIncentives = incentiveRecords
      .filter(inc => deptEmpNames.includes(inc.empName))
      .map(inc => {
        const e = deptEmps.find(emp => emp.name === inc.empName);
        return { ...inc, idNumber: e ? e.idNumber : '-' };
      })
      .filter(inc => (inc.empName || '').includes(empSearchQuery) || (inc.idNumber || '').includes(empSearchQuery));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {!selectedDepartment ? (
        <>
          <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900', color: theme?.textDark || '#fff' }}>إدارة الأقسام والموارد البشرية</h2>
              <p style={{ margin: 0, color: theme?.textMuted || '#94a3b8', fontSize: '14px' }}>إدارة الأقسام والموظفين التابعين لها</p>
            </div>
            <button onClick={() => setShowAddDeptModal(true)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              ➕ إضافة قسم جديد
            </button>
          </div>
          
          <div>
            <input 
              type="text" 
              placeholder="🔍 ابحث باسم القسم..." 
              value={deptSearchQuery} 
              onChange={e => setDeptSearchQuery(e.target.value)} 
              style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', background: theme?.cardBg || '#1e293b', color: theme?.textDark || '#fff', border: `1px solid ${theme?.border || '#334155'}`, outline: 'none' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {departments.filter(d => d.name.includes(deptSearchQuery)).map(dept => {
              const dEmps = employees.filter(e => (e.dept && e.dept.trim() === dept.name.trim()) || (e.department && e.department.trim() === dept.name.trim()));
              const deptPayroll = dEmps.reduce((acc, e) => acc + parseNum(e.salary), 0);
              return (
                <div key={dept.id} onClick={() => { setSelectedDepartment(dept); setHrSubTab('employees'); setEmpSearchQuery(''); }} style={{ background: theme?.cardBg || '#1e293b', border: `1px solid ${theme?.border || '#334155'}`, borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#38bdf8', fontSize: '18px' }}>{dept.name}</h3>
                  <p style={{ margin: '0 0 15px 0', color: theme?.textMuted || '#94a3b8', fontSize: '13px' }}>{dept.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderTop: `1px solid ${theme?.border || '#334155'}`, paddingTop: '15px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8' }}>الموظفين</span>
                      <div style={{ fontWeight: 'bold', color: theme?.textDark || '#fff', fontSize: '16px' }}>{dEmps.length}</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8' }}>إجمالي الرواتب</span>
                      <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '16px' }}>{deptPayroll.toLocaleString()} ر.س</div>
                    </div>
                  </div>
                  <button onClick={(e) => handleDeleteDept(dept.id, e)} style={{ width: '100%', background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
                    حذف القسم 🗑️
                  </button>
                </div>
              );
            })}
            {departments.filter(d => d.name.includes(deptSearchQuery)).length === 0 && (
               <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '30px', color: theme?.textMuted || '#94a3b8' }}>لا توجد أقسام مطابقة للبحث.</div>
            )}
          </div>
        </>
      ) : (
        <>
          <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <button onClick={() => setSelectedDepartment(null)} style={{ background: 'transparent', color: '#38bdf8', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', padding: '0 0 10px 0' }}>
                ⬅ العودة إلى قائمة الأقسام
              </button>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900', color: theme?.textDark || '#fff' }}>قسم: {selectedDepartment.name}</h2>
              <p style={{ margin: 0, color: theme?.textMuted || '#94a3b8', fontSize: '14px' }}>إجمالي الموظفين في القسم: {deptEmps.length}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setShowAddEmpModal(true)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>➕ إضافة موظف جديد</button>
              <button onClick={() => setShowIncentiveModal(true)} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>🎁 إضافة حافز / مكافأة</button>
              <button onClick={() => setShowDeductModal(true)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>🔻 إضافة خصم / استقطاع</button>
              <button onClick={exportDeptExcel} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>📊 تصدير إكسل (Excel)</button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="🔍 ابحث بالاسم أو برقم الهوية..." 
              value={empSearchQuery} 
              onChange={e => setEmpSearchQuery(e.target.value)} 
              style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', background: theme?.cardBg || '#1e293b', color: theme?.textDark || '#fff', border: `1px solid ${theme?.border || '#334155'}`, outline: 'none' }}
            />

            {/* Sub-Tabs Bar */}
            <div style={{ display: 'flex', gap: '10px', background: theme?.cardBg || '#1e293b', padding: '10px', borderRadius: '12px', border: `1px solid ${theme?.border || '#334155'}`, overflowX: 'auto' }}>
              {[
                { id: 'employees', label: 'الموظفون' },
                { id: 'deductions', label: 'الخصومات' },
                { id: 'incentives', label: 'الحوافز والمكافآت' },
                { id: 'alerts', label: 'الوثائق والتنبيهات' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setHrSubTab(tab.id)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: 'none',
                    background: hrSubTab === tab.id ? '#0284c7' : 'transparent',
                    color: hrSubTab === tab.id ? '#fff' : (theme?.textMuted || '#94a3b8'),
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {hrSubTab === 'employees' && (
            <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '1000px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme?.border || '#334155'}` }}>
                    <th style={{ padding: '12px' }}>الاسم</th>
                    <th style={{ padding: '12px' }}>المسمى</th>
                    <th style={{ padding: '12px' }}>الهوية</th>
                    <th style={{ padding: '12px' }}>الهاتف</th>
                    <th style={{ padding: '12px' }}>العنوان الوطني</th>
                    <th style={{ padding: '12px' }}>التأمين الطبي</th>
                    <th style={{ padding: '12px' }}>الراتب</th>
                    <th style={{ padding: '12px' }}>صافي المستحق</th>
                    <th style={{ padding: '12px' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmps.map(emp => {
                    const salary = parseNum(emp.salary);
                    const inc = parseNum(emp.incentives);
                    const ded = parseNum(emp.deductions);
                    const net = Math.max(0, salary + inc - ded);
                    return (
                      <tr key={emp.id} style={{ borderBottom: `1px solid ${theme?.border || '#334155'}` }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{emp.name}</td>
                        <td style={{ padding: '12px', color: theme?.textMuted || '#94a3b8' }}>{emp.role || '-'}</td>
                        <td style={{ padding: '12px' }}>{emp.idNumber || '-'}</td>
                        <td style={{ padding: '12px' }} dir="ltr">{emp.phone || '-'}</td>
                        <td style={{ padding: '12px' }}>{emp.address || '-'}</td>
                        <td style={{ padding: '12px' }}>{emp.medicalInsurance || '-'}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981' }}>{salary.toFixed(2)}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '14px', color: theme?.textDark || '#fff' }}>{net.toFixed(2)}</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                          <button onClick={() => setViewingEmpProfile(emp)} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>👁️ تفاصيل</button>
                          <button onClick={() => handleOpenEditEmp && handleOpenEditEmp(emp)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>تعديل ✏️</button>
                          <button onClick={() => handleDeleteEmployeeLocal(emp.id)} style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>حذف 🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredEmps.length === 0 && (
                    <tr><td colSpan="9" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا يوجد موظفين مطابقين.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {hrSubTab === 'deductions' && (
            <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme?.border || '#334155'}` }}>
                    <th style={{ padding: '12px' }}>اسم الموظف</th>
                    <th style={{ padding: '12px' }}>رقم الهوية</th>
                    <th style={{ padding: '12px' }}>مبلغ الخصم</th>
                    <th style={{ padding: '12px' }}>سبب الخصم</th>
                    <th style={{ padding: '12px' }}>التاريخ</th>
                    <th style={{ padding: '12px' }}>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {deptDeductions.map(d => (
                    <tr key={d.id} style={{ borderBottom: `1px solid ${theme?.border || '#334155'}` }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{d.empName}</td>
                      <td style={{ padding: '12px', color: theme?.textMuted || '#94a3b8' }}>{d.idNumber}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#ef4444' }}>{d.amount} ر.س</td>
                      <td style={{ padding: '12px' }}>{d.reason || '-'}</td>
                      <td style={{ padding: '12px' }} dir="ltr">{d.date}</td>
                      <td style={{ padding: '12px' }}>
                        <button onClick={() => handleWaiveDeduction(d)} style={{ background: '#064e3b', color: '#34d399', border: '1px solid #059669', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                          ⚖️ إعفاء
                        </button>
                      </td>
                    </tr>
                  ))}
                  {deptDeductions.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا توجد خصومات مطابقة.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {hrSubTab === 'incentives' && (
            <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '20px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '800px' }}>
                <thead>
                  <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme?.border || '#334155'}` }}>
                    <th style={{ padding: '12px' }}>اسم الموظف</th>
                    <th style={{ padding: '12px' }}>رقم الهوية</th>
                    <th style={{ padding: '12px' }}>مبلغ المكافأة</th>
                    <th style={{ padding: '12px' }}>السبب</th>
                    <th style={{ padding: '12px' }}>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {deptIncentives.map(inc => (
                    <tr key={inc.id} style={{ borderBottom: `1px solid ${theme?.border || '#334155'}` }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{inc.empName}</td>
                      <td style={{ padding: '12px', color: theme?.textMuted || '#94a3b8' }}>{inc.idNumber}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#8b5cf6' }}>{inc.amount} ر.س</td>
                      <td style={{ padding: '12px' }}>{inc.reason || '-'}</td>
                      <td style={{ padding: '12px' }} dir="ltr">{inc.date}</td>
                    </tr>
                  ))}
                  {deptIncentives.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا توجد مكافآت مطابقة.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {hrSubTab === 'alerts' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ قائمة تنبيهات وثائق الموظفين
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredEmps.map(emp => {
                  const checkExp = (dateStr) => {
                    if (!dateStr || dateStr === '-') return { status: 'none' };
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return { status: 'none' };
                    const diffDays = (d.getTime() - Date.now()) / (1000 * 3600 * 24);
                    if (diffDays < 0) return { status: 'expired', days: Math.abs(Math.floor(diffDays)) };
                    if (diffDays <= 30) return { status: 'warning', days: Math.floor(diffDays) };
                    return { status: 'ok' };
                  };
                  
                  const iqama = checkExp(emp.iqamaEnd);
                  const health = checkExp(emp.healthEnd);
                  const contract = checkExp(emp.contractEnd);

                  return (
                    <div key={emp.id} style={{ background: theme?.cardBg || '#1e293b', border: `1px solid ${theme?.border || '#334155'}`, borderRadius: '16px', padding: '20px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px', color: '#38bdf8' }}>{emp.name}</div>
                      <div style={{ fontSize: '13px', color: theme?.textMuted || '#94a3b8', marginBottom: '15px' }}>الهوية: {emp.idNumber || '-'}</div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8' }}>هوية مقيم / إقامة</div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{emp.iqamaEnd || '-'}</div>
                          </div>
                          {iqama.status === 'expired' && <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>منتهية</span>}
                          {iqama.status === 'warning' && <span style={{ background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>باقي {iqama.days} يوم</span>}
                          {iqama.status === 'ok' && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>سارية</span>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8' }}>شهادة صحية وتأمين طبي</div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{emp.healthEnd || '-'}</div>
                          </div>
                          {health.status === 'expired' && <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>منتهي</span>}
                          {health.status === 'warning' && <span style={{ background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>باقي {health.days} يوم</span>}
                          {health.status === 'ok' && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>ساري</span>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8' }}>العقد الوظيفي</div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{emp.contractEnd || '-'}</div>
                          </div>
                          {contract.status === 'expired' && <span style={{ background: '#fef2f2', color: '#ef4444', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>منتهي</span>}
                          {contract.status === 'warning' && <span style={{ background: '#fffbeb', color: '#d97706', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>باقي {contract.days} يوم</span>}
                          {contract.status === 'ok' && <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>ساري</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredEmps.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>لا يوجد موظفين لعرض تنبيهاتهم.</div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* نافذة إضافة قسم جديد */}
      {showAddDeptModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme?.cardBg || '#1e293b', color: theme?.textDark || '#fff', padding: '30px', borderRadius: '20px', maxWidth: '400px', width: '100%', border: `1px solid ${theme?.border || '#334155'}` }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>إضافة قسم جديد</h3>
            <form onSubmit={handleAddDept} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>اسم القسم:</label>
                <input type="text" required value={newDeptName} onChange={e=>setNewDeptName(e.target.value)} style={inputStyle} placeholder="مثال: التسويق" />
              </div>
              <div>
                <label style={labelStyle}>وصف مبسط:</label>
                <input type="text" value={newDeptDesc} onChange={e=>setNewDeptDesc(e.target.value)} style={inputStyle} placeholder="مثال: إدارة الحملات التسويقية" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إضافة القسم</button>
                <button type="button" onClick={() => setShowAddDeptModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة موظف جديد - محدثة بالكامل */}
      {showAddEmpModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme?.cardBg || '#1e293b', color: theme?.textDark || '#fff', padding: '30px', borderRadius: '20px', maxWidth: '700px', width: '100%', border: `1px solid ${theme?.border || '#334155'}`, maxHeight: '92vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>إضافة موظف (قسم {selectedDepartment?.name})</h3>
            <form onSubmit={handleAddEmp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>الاسم الكامل *</label><input type="text" value={empName} onChange={e=>setEmpName(e.target.value)} required placeholder="اسم الموظف الثلاثي أو الرباعي" style={inputStyle} /></div>
                <div><label style={labelStyle}>رقم الموظف</label><input type="text" value={empNumber} onChange={e=>setEmpNumber(e.target.value)} placeholder="مثال: 22" style={inputStyle} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>رقم الهوية / الإقامة *</label><input type="text" value={empNationalId} onChange={e=>setEmpNationalId(e.target.value)} placeholder="رقم الهوية الوطنية أو الإقامة" required style={inputStyle} /></div>
                <div><label style={labelStyle}>رقم الهاتف</label><input type="text" value={empPhone} onChange={e=>setEmpPhone(e.target.value)} placeholder="05xxxxxxxx" style={inputStyle} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>المسمى الوظيفي *</label><input type="text" value={empRole} onChange={e=>setEmpRole(e.target.value)} placeholder="مثال: مندوب مبيعات، محاسب..." required style={inputStyle} /></div>
                <div><label style={labelStyle}>القسم</label><input type="text" value={selectedDepartment?.name} disabled style={{...inputStyle, opacity: 0.7}} /></div>
              </div>

              {/* العنوان الوطني والتأمين الطبي */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>العنوان الوطني</label>
                  <input type="text" value={empAddress} onChange={e=>setEmpAddress(e.target.value)} placeholder="مثال: الرياض - حي النرجس - شارع..." style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>شركة / فئة التأمين الطبي</label>
                  <input type="text" value={empMedicalInsurance} onChange={e=>setEmpMedicalInsurance(e.target.value)} placeholder="مثال: بوبا فئة A / التعاونية" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>الحالة الاجتماعية</label>
                  <select value={empMaritalStatus} onChange={e=>setEmpMaritalStatus(e.target.value)} style={inputStyle}>
                    <option value="أعزب">أعزب</option>
                    <option value="متزوج">متزوج</option>
                  </select>
                </div>
                <div><label style={labelStyle}>عدد الأطفال</label><input type="number" min="0" value={empChildrenCount} onChange={e=>setEmpChildrenCount(e.target.value)} placeholder="0" style={inputStyle} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div><label style={labelStyle}>الراتب الأساسي (ر.س) *</label><input type="number" min="0" value={empSalary} onChange={e=>setEmpSalary(e.target.value)} required placeholder="4000" style={inputStyle} /></div>
                <div><label style={labelStyle}>رصيد الإجازات (أيام)</label><input type="number" min="0" value={empVacations} onChange={e=>setEmpVacations(e.target.value)} placeholder="21" style={{...inputStyle, background: theme?.cardBg || '#1e293b'}} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: theme?.bgMain || '#0f172a', padding: '12px', borderRadius: '10px', border: `1px solid ${theme?.border || '#334155'}` }}>
                <div>
                  <label style={{ ...labelStyle, color: '#10b981' }}>بدل سكن (ر.س)</label>
                  <input type="number" min="0" value={empHousingAllowance} onChange={e=>setEmpHousingAllowance(e.target.value)} placeholder="0" style={{...inputStyle, padding: '10px', background: theme?.cardBg || '#1e293b'}} />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#10b981' }}>بدل مواصلات (ر.س)</label>
                  <input type="number" min="0" value={empTransportAllowance} onChange={e=>setEmpTransportAllowance(e.target.value)} placeholder="0" style={{...inputStyle, padding: '10px', background: theme?.cardBg || '#1e293b'}} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: theme?.bgMain || '#0f172a', padding: '12px', borderRadius: '10px', border: `1px solid ${theme?.border || '#334155'}` }}>
                <div>
                  <label style={labelStyle}>انتهاء الإقامة</label>
                  <input type="date" value={empIqamaEnd} onChange={e=>setEmpIqamaEnd(e.target.value)} style={{...inputStyle, padding: '8px', fontSize: '12px', background: theme?.cardBg || '#1e293b'}} />
                </div>
                <div>
                  <label style={labelStyle}>انتهاء التأمين الطبي</label>
                  <input type="date" value={empHealthEnd} onChange={e=>setEmpHealthEnd(e.target.value)} style={{...inputStyle, padding: '8px', fontSize: '12px', background: theme?.cardBg || '#1e293b'}} />
                </div>
                <div>
                  <label style={labelStyle}>انتهاء العقد الوظيفي</label>
                  <input type="date" value={empContractEnd} onChange={e=>setEmpContractEnd(e.target.value)} style={{...inputStyle, padding: '8px', fontSize: '12px', background: theme?.cardBg || '#1e293b'}} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#d97706', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>حفظ الموظف</button>
                <button type="button" onClick={() => setShowAddEmpModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة الحوافز */}
      {showIncentiveModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme?.cardBg || '#1e293b', color: theme?.textDark || '#fff', padding: '30px', borderRadius: '20px', maxWidth: '400px', width: '100%', border: `1px solid ${theme?.border || '#334155'}` }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>إضافة حافز / مكافأة</h3>
            <form onSubmit={handleAddIncentive} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>اختر الموظف *</label>
                <select required value={incEmpId} onChange={e=>setIncEmpId(e.target.value)} style={inputStyle}>
                  <option value="">-- اختر --</option>
                  {deptEmps.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>قيمة المكافأة (ر.س) *</label>
                <input type="number" min="0" required value={incAmount} onChange={e=>setIncAmount(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>السبب الوصفي</label>
                <input type="text" value={incReason} onChange={e=>setIncReason(e.target.value)} style={inputStyle} placeholder="مثل: تميز في العمل" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#8b5cf6', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>تسجيل الحافز</button>
                <button type="button" onClick={() => setShowIncentiveModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة الخصومات */}
      {showDeductModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme?.cardBg || '#1e293b', color: theme?.textDark || '#fff', padding: '30px', borderRadius: '20px', maxWidth: '400px', width: '100%', border: `1px solid ${theme?.border || '#334155'}` }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>إضافة استقطاع / جزاء</h3>
            <form onSubmit={handleAddDeduction} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>اختر الموظف *</label>
                <select required value={dedEmpId} onChange={e=>setDedEmpId(e.target.value)} style={inputStyle}>
                  <option value="">-- اختر --</option>
                  {deptEmps.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>قيمة الخصم (ر.س) *</label>
                <input type="number" min="0" required value={dedAmount} onChange={e=>setDedAmount(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>السبب الوصفي</label>
                <input type="text" value={dedReason} onChange={e=>setDedReason(e.target.value)} style={inputStyle} placeholder="مثل: غياب بدون عذر" />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#ef4444', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>تسجيل الخصم</button>
                <button type="button" onClick={() => setShowDeductModal(false)} style={{ flex: 1, background: '#334155', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة الملف الشخصي للموظف */}
      {viewingEmpProfile && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme?.cardBg || '#1e293b', color: theme?.textDark || '#fff', padding: '30px', borderRadius: '20px', maxWidth: '650px', width: '100%', border: `1px solid ${theme?.border || '#334155'}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#38bdf8' }}>الملف الشخصي الشامل للموظف</h3>
              <button onClick={() => setViewingEmpProfile(null)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', borderBottom: `1px solid ${theme?.border || '#334155'}`, paddingBottom: '20px' }}>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>الاسم:</strong> <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{viewingEmpProfile.name}</div></div>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>المسمى الوظيفي:</strong> <div>{viewingEmpProfile.role || '-'}</div></div>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>رقم الهوية / الإقامة:</strong> <div>{viewingEmpProfile.idNumber || '-'}</div></div>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>رقم الجوال:</strong> <div dir="ltr" style={{ textAlign: 'right' }}>{viewingEmpProfile.phone || '-'}</div></div>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>الراتب الأساسي:</strong> <div>{viewingEmpProfile.salary} ر.س</div></div>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>القسم:</strong> <div style={{ color: '#10b981', fontWeight: 'bold' }}>{viewingEmpProfile.dept || '-'}</div></div>
            </div>

            <h4 style={{ color: '#10b981', margin: '0 0 15px 0' }}>البيانات الشخصية والتأمين</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', borderBottom: `1px solid ${theme?.border || '#334155'}`, paddingBottom: '20px' }}>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>العنوان الوطني:</strong> <div>{viewingEmpProfile.address || '-'}</div></div>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>الحالة الاجتماعية:</strong> <div>{viewingEmpProfile.maritalStatus || '-'}</div></div>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>عدد الأطفال:</strong> <div>{viewingEmpProfile.childrenCount || '0'}</div></div>
              <div><strong style={{ color: theme?.textMuted || '#94a3b8' }}>التأمين الطبي:</strong> <div>{viewingEmpProfile.medicalInsurance || '-'}</div></div>
            </div>

            <h4 style={{ color: '#d97706', margin: '0 0 15px 0' }}>بيانات العقد الوظيفي</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
              <div>
                <strong style={{ color: theme?.textMuted || '#94a3b8' }}>تاريخ نهاية العقد:</strong> 
                <div style={{ fontWeight: 'bold', color: viewingEmpProfile.contractEnd && new Date(viewingEmpProfile.contractEnd) < new Date(Date.now() + 30*24*60*60*1000) ? '#ef4444' : (theme?.textDark || '#fff'), marginTop: '5px' }}>
                  {viewingEmpProfile.contractEnd || '-'}
                  {viewingEmpProfile.contractEnd && new Date(viewingEmpProfile.contractEnd) < new Date(Date.now() + 30*24*60*60*1000) && (
                    <span style={{ fontSize: '11px', background: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '12px', marginRight: '10px' }}>ينتهي قريباً / منتهٍ</span>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default HrTab;