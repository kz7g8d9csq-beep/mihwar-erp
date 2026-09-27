import React, { useState, useEffect, useCallback, useMemo } from 'react';

const API_BASE = 'https://backend-6grl.onrender.com';

const HrTab = ({
  t, theme = {}, isDark, user,
  employees = [], setEmployees,
  incentiveRecords = [], setIncentiveRecords,
  deductionsList = [], setDeductionsList,
  invoices = []
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

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  // Tabs and Search States
  const [hrSubTab, setHrSubTab] = useState('employees');
  const [deptSearchQuery, setDeptSearchQuery] = useState('');
  const [empSearchQuery, setEmpSearchQuery] = useState('');

  // إدارة العمولات المحذوفة / المصفاة لبدء دورات جديدة
  const [clearedCommissionIds, setClearedCommissionIds] = useState(() => {
    try {
      const saved = localStorage.getItem('mihwar_cleared_commissions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  // Add Employee Form States
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

  // Edit Employee Modal State
  const [showEditEmpModal, setShowEditEmpModal] = useState(false);
  const [editEmpData, setEditEmpData] = useState(null);

  // Profile View State
  const [viewingEmpProfile, setViewingEmpProfile] = useState(null);

  // Incentives & Deductions Modals
  const [showIncentiveModal, setShowIncentiveModal] = useState(false);
  const [incEmpId, setIncEmpId] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incReason, setIncReason] = useState('');

  const [showDeductModal, setShowDeductModal] = useState(false);
  const [dedEmpId, setDedEmpId] = useState('');
  const [dedAmount, setDedAmount] = useState('');
  const [dedReason, setDedReason] = useState('');

  // ترويسة التوثيق للأمان
  const getHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('mihwar_token') || (user && user.token) || '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (user && user.id) headers['user-id'] = user.id;
    return headers;
  };

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

  const checkExp = (dateStr) => {
    if (!dateStr || dateStr === '-') return { status: 'none', label: 'غير محدد', color: '#64748b' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { status: 'none', label: 'غير محدد', color: '#64748b' };
    const diffDays = (d.getTime() - Date.now()) / (1000 * 3600 * 24);
    if (diffDays < 0) return { status: 'expired', label: `منتهي منذ ${Math.abs(Math.floor(diffDays))} يوم`, color: '#ef4444' };
    if (diffDays <= 30) return { status: 'warning', label: `باقي ${Math.floor(diffDays)} يوم`, color: '#d97706' };
    return { status: 'ok', label: 'ساري', color: '#10b981' };
  };

  // مزامنة البيانات تلقائياً مع السيرفر
  const fetchCloudData = useCallback(async () => {
    try {
      const [deptRes, empRes] = await Promise.all([
        fetch(`${API_BASE}/departments`, { headers: getHeaders() }),
        fetch(`${API_BASE}/employees`, { headers: getHeaders() })
      ]);

      if (deptRes.ok) {
        const depts = await deptRes.json();
        if (Array.isArray(depts) && depts.length > 0) {
          setDepartments(depts);
          localStorage.setItem('mihwar_departments', JSON.stringify(depts));
        }
      }

      if (empRes.ok) {
        const emps = await empRes.json();
        if (Array.isArray(emps)) {
          const allIncs = [];
          const allDeds = [];

          const formatted = emps.map(emp => {
            const incTotal = (emp.incentives || []).reduce((sum, i) => sum + parseNum(i.amount), 0);
            const dedTotal = (emp.deductions || []).reduce((sum, d) => sum + parseNum(d.amount), 0);

            (emp.incentives || []).forEach(i => {
              allIncs.push({
                id: i.id,
                employeeId: emp.id,
                empName: emp.name,
                empRole: emp.role,
                amount: parseNum(i.amount),
                reason: i.reason,
                date: i.date || (i.createdAt ? i.createdAt.slice(0, 10) : '')
              });
            });

            (emp.deductions || []).forEach(d => {
              allDeds.push({
                id: d.id,
                employeeId: emp.id,
                empName: emp.name,
                amount: parseNum(d.amount),
                reason: d.reason,
                date: d.date || (d.createdAt ? d.createdAt.slice(0, 10) : '')
              });
            });

            return {
              ...emp,
              dept: emp.deptName || (emp.department ? emp.department.name : 'الإدارة العامة'),
              incentives: incTotal,
              deductions: dedTotal
            };
          });

          if (setEmployees) setEmployees(formatted);
          if (setIncentiveRecords) setIncentiveRecords(allIncs);
          if (setDeductionsList) setDeductionsList(allDeds);

          localStorage.setItem('mihwar_hr_employees', JSON.stringify(formatted));
          localStorage.setItem('mihwar_hr_incentives', JSON.stringify(allIncs));
          localStorage.setItem('mihwar_hr_deductions', JSON.stringify(allDeds));
        }
      }
    } catch (err) {
      console.warn('استخدام التخزين المحلي مؤقتاً لحين استجابة السيرفر:', err);
    }
  }, [setEmployees, setIncentiveRecords, setDeductionsList]);

  useEffect(() => {
    fetchCloudData();
  }, [fetchCloudData]);

  // إضافة قسم
  const handleAddDept = async (e) => {
    e.preventDefault();
    if (!newDeptName) return;

    let newDept = { id: Date.now(), name: newDeptName.trim(), desc: newDeptDesc };
    try {
      const res = await fetch(`${API_BASE}/departments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name: newDeptName.trim(), desc: newDeptDesc })
      });
      if (res.ok) {
        const saved = await res.json();
        newDept = saved;
      }
    } catch (err) {
      console.error(err);
    }

    const updated = [...departments, newDept];
    setDepartments(updated);
    localStorage.setItem('mihwar_departments', JSON.stringify(updated));
    setNewDeptName('');
    setNewDeptDesc('');
    setShowAddDeptModal(false);
  };

  // حذف قسم
  const handleDeleteDept = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('هل أنت متأكد من حذف هذا القسم؟')) {
      try {
        await fetch(`${API_BASE}/departments/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch (err) {
        console.error(err);
      }
      const updated = departments.filter(d => d.id !== id);
      setDepartments(updated);
      localStorage.setItem('mihwar_departments', JSON.stringify(updated));
    }
  };

  // إضافة موظف جديد
  const handleAddEmp = async (e) => {
    e.preventDefault();
    if (!empName || !empSalary || !empNationalId) return;

    const payload = {
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
      deptName: selectedDepartment ? selectedDepartment.name : 'الإدارة العامة',
      departmentId: selectedDepartment?.id || null
    };

    let newEmp = { ...payload, id: Date.now(), dept: payload.deptName, incentives: 0, deductions: 0 };
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        newEmp = { ...saved, dept: saved.deptName || payload.deptName, incentives: 0, deductions: 0 };
      }
    } catch (err) {
      console.error(err);
    }

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

  // فتح نافذة التعديل
  const handleOpenEditModal = (emp) => {
    setEditEmpData({
      ...emp,
      address: emp.address || '',
      medicalInsurance: emp.medicalInsurance || '',
      contractEnd: emp.contractEnd === '-' ? '' : emp.contractEnd || '',
      iqamaEnd: emp.iqamaEnd === '-' ? '' : emp.iqamaEnd || '',
      healthEnd: emp.healthEnd === '-' ? '' : emp.healthEnd || ''
    });
    setShowEditEmpModal(true);
  };

  // حفظ التعديلات
  const handleSaveEditEmp = async (e) => {
    e.preventDefault();
    if (!editEmpData || !editEmpData.name) return;

    const payload = {
      empNo: editEmpData.empNo,
      name: editEmpData.name,
      role: editEmpData.role,
      idNumber: editEmpData.idNumber,
      phone: editEmpData.phone,
      address: editEmpData.address,
      maritalStatus: editEmpData.maritalStatus,
      childrenCount: parseNum(editEmpData.childrenCount),
      medicalInsurance: editEmpData.medicalInsurance,
      salary: parseNum(editEmpData.salary),
      vacations: parseNum(editEmpData.vacations),
      housingAllowance: parseNum(editEmpData.housingAllowance),
      transportAllowance: parseNum(editEmpData.transportAllowance),
      contractEnd: editEmpData.contractEnd || '-',
      iqamaEnd: editEmpData.iqamaEnd || '-',
      healthEnd: editEmpData.healthEnd || '-',
      deptName: editEmpData.dept || selectedDepartment?.name
    };

    try {
      await fetch(`${API_BASE}/employees/${editEmpData.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error(err);
    }

    const updated = employees.map(emp => {
      if (emp.id === editEmpData.id) {
        return {
          ...emp,
          ...editEmpData,
          ...payload
        };
      }
      return emp;
    });

    if (setEmployees) {
      setEmployees(updated);
      localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
    }
    setShowEditEmpModal(false);
    setEditEmpData(null);
  };

  // تسجيل حافز
  const handleAddIncentive = async (e) => {
    e.preventDefault();
    if (!incEmpId || !incAmount) return;
    const emp = employees.find(e => String(e.id) === String(incEmpId));
    const amount = parseNum(incAmount);
    const dateNow = getCleanDateTime();

    let newId = Date.now();
    try {
      const res = await fetch(`${API_BASE}/incentives`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          employeeId: incEmpId,
          amount,
          reason: incReason,
          date: dateNow
        })
      });
      if (res.ok) {
        const saved = await res.json();
        newId = saved.id;
      }
    } catch (err) {
      console.error(err);
    }

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
      id: newId,
      employeeId: incEmpId,
      empName: emp?.name,
      empRole: emp?.role,
      amount: amount,
      reason: incReason,
      date: dateNow
    };
    if (setIncentiveRecords) {
      const updatedRecs = [newRecord, ...incentiveRecords];
      setIncentiveRecords(updatedRecs);
      localStorage.setItem('mihwar_hr_incentives', JSON.stringify(updatedRecs));
    }
    
    setIncEmpId(''); setIncAmount(''); setIncReason('');
    setShowIncentiveModal(false);
  };

  // تسجيل خصم
  const handleAddDeduction = async (e) => {
    e.preventDefault();
    if (!dedEmpId || !dedAmount) return;
    const emp = employees.find(e => String(e.id) === String(dedEmpId));
    const amount = parseNum(dedAmount);
    const dateNow = getCleanDateTime();

    let newId = Date.now();
    try {
      const res = await fetch(`${API_BASE}/deductions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          employeeId: dedEmpId,
          amount,
          reason: dedReason,
          date: dateNow
        })
      });
      if (res.ok) {
        const saved = await res.json();
        newId = saved.id;
      }
    } catch (err) {
      console.error(err);
    }

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
      id: newId,
      employeeId: dedEmpId,
      empName: emp?.name,
      amount: amount,
      reason: dedReason,
      date: dateNow
    };
    if (setDeductionsList) {
      const updatedList = [newRecord, ...deductionsList];
      setDeductionsList(updatedList);
      localStorage.setItem('mihwar_hr_deductions', JSON.stringify(updatedList));
    }
    
    setDedEmpId(''); setDedAmount(''); setDedReason('');
    setShowDeductModal(false);
  };

  // إعفاء وإلغاء الخصم
  const handleWaiveDeduction = async (d) => {
    if (window.confirm('هل أنت متأكد من إعفاء هذا الموظف وإلغاء الخصم؟')) {
      try {
        await fetch(`${API_BASE}/deductions/${d.id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch (err) {
        console.error(err);
      }

      const updatedList = deductionsList.filter(record => record.id !== d.id);
      const amountToRestore = parseNum(d.amount);
      const updatedEmps = employees.map(emp => {
        if (emp.name === d.empName || String(emp.id) === String(d.employeeId)) {
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

  // حذف موظف
  const handleDeleteEmployeeLocal = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        await fetch(`${API_BASE}/employees/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
      } catch (err) {
        console.error(err);
      }

      const updated = employees.filter(e => e.id !== id);
      if (setEmployees) {
        setEmployees(updated);
        localStorage.setItem('mihwar_hr_employees', JSON.stringify(updated));
      }
    }
  };

  const inputStyle = { width: '100%', padding: '11px', borderRadius: '8px', background: theme?.bgMain || '#0f172a', color: theme?.textDark || '#fff', border: `1px solid ${theme?.border || '#334155'}`, boxSizing: 'border-box', outline: 'none' };
  const labelStyle = { fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px', color: theme?.textDark || '#fff' };

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

  // معالجة عمولات مناديب المبيعات
  const deptCommissions = useMemo(() => {
    if (!selectedDepartment || !deptEmps.length) return [];
    const deptEmpIds = deptEmps.map(e => String(e.id));
    const deptEmpNames = deptEmps.map(e => (e.name || '').trim());

    return (invoices || [])
      .filter(inv => {
        if (clearedCommissionIds.includes(String(inv.id))) return false;
        const matchId = inv.salesRepId && deptEmpIds.includes(String(inv.salesRepId));
        const matchName = inv.salesRepName && deptEmpNames.includes(String(inv.salesRepName).trim());
        return matchId || matchName;
      })
      .map(inv => {
        const emp = deptEmps.find(e => 
          (inv.salesRepId && String(e.id) === String(inv.salesRepId)) ||
          (inv.salesRepName && e.name.trim() === String(inv.salesRepName).trim())
        );

        let cartonsTotal = 0;
        let piecesTotal = 0;

        if (Array.isArray(inv.items)) {
          inv.items.forEach(it => {
            const bSize = it.product?.boxSize || it.boxSize || 1;
            const q = parseNum(it.quantity);
            if (bSize > 1) {
              cartonsTotal += Math.floor(q / bSize);
              piecesTotal += (q % bSize);
            } else {
              piecesTotal += q;
            }
          });
        }

        let qtyText = '';
        if (cartonsTotal > 0 && piecesTotal > 0) {
          qtyText = `${cartonsTotal} كرتون و ${piecesTotal} قطعة`;
        } else if (cartonsTotal > 0) {
          qtyText = `${cartonsTotal} كرتون`;
        } else if (piecesTotal > 0) {
          qtyText = `${piecesTotal} قطعة`;
        } else {
          qtyText = '-';
        }

        return {
          id: inv.id,
          invoiceNo: inv.invoiceNo || `INV-${inv.id}`,
          empName: inv.salesRepName || emp?.name || 'مندوب',
          idNumber: emp?.idNumber || '-',
          customerName: inv.customer?.name || (typeof inv.customer === 'string' ? inv.customer : 'عميل عام'),
          date: inv.createdAt ? inv.createdAt.slice(0, 10) : (inv.date || '-'),
          qtyDescription: qtyText,
          cartonsCount: cartonsTotal,
          piecesCount: piecesTotal,
          totalAmount: parseNum(inv.totalAmount),
          commission: parseNum(inv.totalCommission)
        };
      });
  }, [selectedDepartment, deptEmps, invoices, clearedCommissionIds]);

  const filteredCommissions = useMemo(() => {
    return deptCommissions.filter(c => 
      (c.empName || '').includes(empSearchQuery) ||
      (c.idNumber || '').includes(empSearchQuery) ||
      (c.invoiceNo || '').includes(empSearchQuery) ||
      (c.customerName || '').includes(empSearchQuery)
    );
  }, [deptCommissions, empSearchQuery]);

  const totalCommissionsAmount = useMemo(() => {
    return filteredCommissions.reduce((sum, c) => sum + c.commission, 0);
  }, [filteredCommissions]);

  // حذف عمولة فردية
  const handleDeleteSingleCommission = (invId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه العمولة من سجل الموارد البشرية؟')) {
      const updated = [...clearedCommissionIds, String(invId)];
      setClearedCommissionIds(updated);
      localStorage.setItem('mihwar_cleared_commissions', JSON.stringify(updated));
    }
  };

  // حذف الكل لبدء دورة جديدة
  const handleDeleteAllCommissions = () => {
    if (!deptCommissions.length) return;
    if (window.confirm('هل أنت متأكد من حذف وتصفير جميع العمولات لبدء دورة جديدة لهذا القسم؟')) {
      const currentIds = deptCommissions.map(c => String(c.id));
      const updated = Array.from(new Set([...clearedCommissionIds, ...currentIds]));
      setClearedCommissionIds(updated);
      localStorage.setItem('mihwar_cleared_commissions', JSON.stringify(updated));
    }
  };

  // دالة مساعدة لتنزيل ملف الإكسل
  const downloadExcelFile = (htmlContent, fileName) => {
    const excelWrapper = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
        <x:Name>بيانات_الموارد_البشرية</x:Name>
        <x:WorksheetOptions><x:DisplayRightToLeft/></x:WorksheetOptions>
        </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          body { font-family: Tahoma, Arial, sans-serif; direction: rtl; }
          table { border-collapse: collapse; direction: rtl; margin-bottom: 25px; }
          th { border: 1px solid #94a3b8; background-color: #e2e8f0; color: #0f172a; padding: 10px; font-weight: bold; text-align: center; font-size: 13px; }
          td { border: 1px solid #cbd5e1; padding: 8px; font-size: 12px; }
        </style>
      </head>
      <body dir="rtl">
        ${htmlContent}
      </body>
    </html>`;

    const blob = new Blob(['\ufeff' + excelWrapper], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}_${Date.now()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // =========================================================================
  // 1. تصدير إكسل الشامل لجميع الأقسام (أفقي متجاور بالكامل مع الملخص بجانبهم)
  // =========================================================================
  const exportAllDepartmentsExcel = () => {
    if (!departments.length) {
      alert('لا توجد أقسام مسجلة لتصديرها.');
      return;
    }

    const exportDate = getCleanDateTime();

    // تجهيز بيانات كل قسم
    const deptsData = departments.map((dept, index) => {
      const dEmps = employees.filter(e => 
        (e.dept && e.dept.trim() === dept.name.trim()) ||
        (e.department && e.department.trim() === dept.name.trim())
      );

      let deptSalaries = 0;
      let deptIncentives = 0;
      let deptDeductions = 0;
      let deptNet = 0;

      const formattedEmps = dEmps.map(emp => {
        const salary = parseNum(emp.salary);
        const inc = parseNum(emp.incentives);
        const ded = parseNum(emp.deductions);
        const net = Math.max(0, salary + inc - ded);

        deptSalaries += salary;
        deptIncentives += inc;
        deptDeductions += ded;
        deptNet += net;

        return {
          empNo: emp.empNo || emp.id,
          name: emp.name,
          role: emp.role || '-',
          idNumber: emp.idNumber || '-',
          phone: emp.phone || '-',
          maritalStatus: emp.maritalStatus || 'أعزب',
          contractEnd: emp.contractEnd || '-',
          salary,
          inc,
          ded,
          net
        };
      });

      return {
        dept,
        index,
        emps: formattedEmps,
        totalEmployees: dEmps.length,
        deptSalaries,
        deptIncentives,
        deptDeductions,
        deptNet
      };
    });

    const maxRows = Math.max(...deptsData.map(d => d.emps.length), 1);
    const colsPerDept = 11;
    const summaryCols = 5;
    const totalCols = (deptsData.length * colsPerDept) + deptsData.length + summaryCols;

    // حساب الإجماليات العامة للملخص المالي الموحد
    const grandTotalEmployees = deptsData.reduce((s, d) => s + d.totalEmployees, 0);
    const grandTotalSalaries = deptsData.reduce((s, d) => s + d.deptSalaries, 0);
    const grandTotalIncentives = deptsData.reduce((s, d) => s + d.deptIncentives, 0);
    const grandTotalDeductions = deptsData.reduce((s, d) => s + d.deptDeductions, 0);
    const grandTotalNet = deptsData.reduce((s, d) => s + d.deptNet, 0);

    // ترويسة العنوان الرئيسي
    let tableHtml = `
      <table>
        <thead>
          <tr>
            <th colspan="${totalCols}" style="background-color: #0f172a; color: #ffffff; font-size: 18px; padding: 16px; text-align: center; font-weight: bold;">
              نظام محور • التقرير المالي والإداري الشامل لكافة الأقسام والموظفين (تنسيق أفقي متجاور بالكامل)
            </th>
          </tr>
          <tr>
            <th colspan="${totalCols}" style="background-color: #334155; color: #e2e8f0; font-size: 12px; padding: 8px; text-align: center;">
              تاريخ التصدير: ${exportDate} | جميع الأقسام مع الملخص المالي العام متجاورة أفقياً من اليمين إلى اليسار
            </th>
          </tr>
    `;

    // سطر رؤوس الأقسام مع رأس الملخص المالي في نفس السطر أفقياً
    tableHtml += '<tr>';
    deptsData.forEach(d => {
      tableHtml += `
        <th colspan="${colsPerDept}" style="background-color: #1e3a8a; color: #ffffff; font-size: 14px; padding: 12px; text-align: center; font-weight: bold; border: 1px solid #1e40af;">
          📌 قسم (${d.dept.name}) — [${d.totalEmployees} موظف]
        </th>
        <th style="background-color: #f1f5f9; border-top: none; border-bottom: none; width: 30px;"></th>
      `;
    });
    // إضافة رأس الملخص المالي الموحد مباشرة بجانب آخر قسم
    tableHtml += `
      <th colspan="${summaryCols}" style="background-color: #064e3b; color: #ffffff; font-size: 14px; padding: 12px; text-align: center; font-weight: bold; border: 1px solid #047857;">
        🏢 الملخص المالي العام الموحد (${departments.length} أقسام)
      </th>
    `;
    tableHtml += '</tr>';

    // سطر أسماء الأعمدة الفرعية لكل قسم + أعمدة الملخص المالي
    tableHtml += '<tr style="background-color: #e2e8f0;">';
    deptsData.forEach(d => {
      tableHtml += `
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">الرقم</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">اسم الموظف</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">المسمى</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">الهوية</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">الهاتف</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">الحالة</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">نهاية العقد</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">الراتب</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">الحوافز</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">الخصومات</th>
        <th style="border: 1px solid #94a3b8; padding: 8px; font-size: 12px;">الصافي</th>
        <th style="background-color: #f1f5f9; border-top: none; border-bottom: none; width: 30px;"></th>
      `;
    });
    // أعمدة الملخص المالي الجانبي
    tableHtml += `
      <th style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; font-size: 12px; color: #064e3b; font-weight: bold;">إجمالي الكادر</th>
      <th style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; font-size: 12px; color: #064e3b; font-weight: bold;">مجموع الرواتب</th>
      <th style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; font-size: 12px; color: #064e3b; font-weight: bold;">مجموع الحوافز</th>
      <th style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 8px; font-size: 12px; color: #064e3b; font-weight: bold;">مجموع الخصومات</th>
      <th style="background-color: #10b981; border: 1px solid #059669; padding: 8px; font-size: 12px; color: #ffffff; font-weight: bold;">صافي المسير الكلي</th>
    `;
    tableHtml += '</tr></thead><tbody>';

    // أسطر بيانات الموظفين جنباً إلى جنب مع خلايا الملخص الجانبي
    for (let r = 0; r < maxRows; r++) {
      const bg = r % 2 === 0 ? '#ffffff' : '#f8fafc';
      tableHtml += `<tr style="background-color: ${bg};">`;
      deptsData.forEach(d => {
        const emp = d.emps[r];
        if (emp) {
          tableHtml += `
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; mso-number-format:'\\@'; color: #d97706;">${emp.empNo}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right; font-weight: bold;">${emp.name}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">${emp.role}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; mso-number-format:'\\@';">${emp.idNumber}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; mso-number-format:'\\@';" dir="ltr">${emp.phone}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${emp.maritalStatus}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">${emp.contractEnd}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #10b981;">${emp.salary.toFixed(2)} ر.س</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #8b5cf6;">${emp.inc.toFixed(2)} ر.س</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #ef4444;">${emp.ded.toFixed(2)} ر.س</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: bold; color: #0284c7; background-color: #f0f9ff;">${emp.net.toFixed(2)} ر.س</td>
          `;
        } else {
          tableHtml += `
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
            <td style="border: 1px solid #f1f5f9; padding: 8px;"></td>
          `;
        }
        tableHtml += `<td style="background-color: #f1f5f9; border-top: none; border-bottom: none; width: 30px;"></td>`;
      });

      // خلايا الملخص المالي في نفس السطر الأول (r === 0)
      if (r === 0) {
        tableHtml += `
          <td style="border: 1px solid #a7f3d0; padding: 8px; text-align: center; font-weight: bold; color: #0f172a; background-color: #f0fdf4;">${grandTotalEmployees} موظف</td>
          <td style="border: 1px solid #a7f3d0; padding: 8px; text-align: center; font-weight: bold; color: #047857; background-color: #f0fdf4;">${grandTotalSalaries.toFixed(2)} ر.س</td>
          <td style="border: 1px solid #a7f3d0; padding: 8px; text-align: center; font-weight: bold; color: #6d28d9; background-color: #f0fdf4;">${grandTotalIncentives.toFixed(2)} ر.س</td>
          <td style="border: 1px solid #a7f3d0; padding: 8px; text-align: center; font-weight: bold; color: #b91c1c; background-color: #f0fdf4;">${grandTotalDeductions.toFixed(2)} ر.س</td>
          <td style="border: 1px solid #059669; padding: 8px; text-align: center; font-weight: bold; color: #047857; font-size: 13px; background-color: #d1fae5;">${grandTotalNet.toFixed(2)} ر.س</td>
        `;
      } else {
        tableHtml += `
          <td style="border: 1px solid #f1f5f9; padding: 8px; background-color: #f8fafc;"></td>
          <td style="border: 1px solid #f1f5f9; padding: 8px; background-color: #f8fafc;"></td>
          <td style="border: 1px solid #f1f5f9; padding: 8px; background-color: #f8fafc;"></td>
          <td style="border: 1px solid #f1f5f9; padding: 8px; background-color: #f8fafc;"></td>
          <td style="border: 1px solid #f1f5f9; padding: 8px; background-color: #f8fafc;"></td>
        `;
      }

      tableHtml += '</tr>';
    }

    // سطر مجاميع الأقسام في الختام
    tableHtml += '<tr style="background-color: #dbeafe; font-weight: bold;">';
    deptsData.forEach(d => {
      tableHtml += `
        <td colspan="7" style="border: 1px solid #93c5fd; padding: 10px; text-align: center; color: #1e3a8a;">
          مجموع مسير (${d.dept.name})
        </td>
        <td style="border: 1px solid #93c5fd; padding: 10px; text-align: center; color: #047857;">${d.deptSalaries.toFixed(2)} ر.س</td>
        <td style="border: 1px solid #93c5fd; padding: 10px; text-align: center; color: #6d28d9;">${d.deptIncentives.toFixed(2)} ر.س</td>
        <td style="border: 1px solid #93c5fd; padding: 10px; text-align: center; color: #b91c1c;">${d.deptDeductions.toFixed(2)} ر.س</td>
        <td style="border: 1px solid #93c5fd; padding: 10px; text-align: center; color: #0369a1; font-size: 13px;">${d.deptNet.toFixed(2)} ر.س</td>
        <td style="background-color: #f1f5f9; border-top: none; border-bottom: none; width: 30px;"></td>
      `;
    });
    // ختام عمود الملخص المالي
    tableHtml += `
      <td colspan="${summaryCols}" style="border: 1px solid #059669; padding: 10px; text-align: center; font-weight: bold; background-color: #064e3b; color: #ffffff;">
        ✅ مسير مالي معتمد ومغلق
      </td>
    `;
    tableHtml += '</tr></tbody></table>';

    downloadExcelFile(tableHtml, 'تقرير_شامل_أفقي_لكافة_الأقسام');
  };

  // =========================================================================
  // 2. تصدير إكسل المخصص للتبويب المفتوح فقط داخل القسم
  // =========================================================================
  const exportActiveTabExcel = () => {
    if (!selectedDepartment) return;
    const exportDate = getCleanDateTime();
    const deptName = selectedDepartment.name;

    // A. تصدير الموظفين فقط
    if (hrSubTab === 'employees') {
      if (!deptEmps.length) return alert(`لا يوجد موظفون في قسم (${deptName}) للتصدير.`);
      let rows = '';
      let sumSal = 0, sumInc = 0, sumDed = 0, sumNet = 0;

      deptEmps.forEach((emp, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        const s = parseNum(emp.salary);
        const inc = parseNum(emp.incentives);
        const ded = parseNum(emp.deductions);
        const net = Math.max(0, s + inc - ded);
        sumSal += s; sumInc += inc; sumDed += ded; sumNet += net;

        rows += `<tr style="background-color: ${bg};">
          <td style="text-align: center; font-weight: bold; mso-number-format:'\\@'; color: #d97706;">${emp.empNo || emp.id}</td>
          <td style="text-align: right; font-weight: bold;">${emp.name}</td>
          <td style="text-align: right;">${emp.role || '-'}</td>
          <td style="text-align: center; mso-number-format:'\\@';">${emp.idNumber || '-'}</td>
          <td style="text-align: center; mso-number-format:'\\@';" dir="ltr">${emp.phone || '-'}</td>
          <td style="text-align: center;">${emp.maritalStatus || 'أعزب'}</td>
          <td style="text-align: center;">${emp.childrenCount || 0}</td>
          <td style="text-align: right;">${emp.address || '-'}</td>
          <td style="text-align: center;">${emp.medicalInsurance || '-'}</td>
          <td style="text-align: center;">${emp.contractEnd || '-'}</td>
          <td style="text-align: center; font-weight: bold; color: #10b981;">${s.toFixed(2)} ر.س</td>
          <td style="text-align: center; font-weight: bold; color: #8b5cf6;">${inc.toFixed(2)} ر.س</td>
          <td style="text-align: center; font-weight: bold; color: #ef4444;">${ded.toFixed(2)} ر.س</td>
          <td style="text-align: center; font-weight: bold; color: #0284c7; background-color: #f0f9ff;">${net.toFixed(2)} ر.س</td>
        </tr>`;
      });

      const html = `
        <table>
          <thead>
            <tr><th colspan="14" style="background-color: #1e293b; color: #ffffff; font-size: 18px; padding: 15px;">نظام محور • كشف موظفي ومسير رواتب قسم (${deptName})</th></tr>
            <tr><th colspan="14" style="background-color: #334155; color: #e2e8f0; font-size: 12px; padding: 6px;">تاريخ التصدير: ${exportDate}</th></tr>
            <tr style="background-color: #e2e8f0;">
              <th>الرقم الوظيفي</th><th>اسم الموظف</th><th>المسمى</th><th>الهوية / الإقامة</th><th>الهاتف</th><th>الحالة الاجتماعية</th><th>الأطفال</th><th>العنوان الوطني</th><th>التأمين الطبي</th><th>نهاية العقد</th><th>الراتب الأساسي</th><th>الحوافز</th><th>الخصومات</th><th>صافي المستحق</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr style="background-color: #e2e8f0; font-weight: bold;">
              <td colspan="10" style="padding: 12px; text-align: center;">إجمالي مسير الرواتب</td>
              <td style="text-align: center; color: #10b981;">${sumSal.toFixed(2)} ر.س</td>
              <td style="text-align: center; color: #8b5cf6;">${sumInc.toFixed(2)} ر.س</td>
              <td style="text-align: center; color: #ef4444;">${sumDed.toFixed(2)} ر.س</td>
              <td style="text-align: center; color: #0284c7; font-size: 14px; background-color: #e0f2fe;">${sumNet.toFixed(2)} ر.س</td>
            </tr>
          </tbody>
        </table>`;
      return downloadExcelFile(html, `كشف_موظفي_${deptName.replace(/\s+/g, '_')}`);
    }

    // B. تصدير الخصومات فقط
    if (hrSubTab === 'deductions') {
      if (!deptDeductions.length) return alert(`لا توجد خصومات مسجلة في قسم (${deptName}) للتصدير.`);
      let rows = '';
      let sum = 0;
      deptDeductions.forEach((d, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        const val = parseNum(d.amount);
        sum += val;
        rows += `<tr style="background-color: ${bg};">
          <td style="text-align: right; font-weight: bold;">${d.empName}</td>
          <td style="text-align: center; mso-number-format:'\\@';">${d.idNumber}</td>
          <td style="text-align: center; font-weight: bold; color: #ef4444;">${val.toFixed(2)} ر.س</td>
          <td style="text-align: right;">${d.reason || '-'}</td>
          <td style="text-align: center;" dir="ltr">${d.date}</td>
        </tr>`;
      });

      const html = `
        <table>
          <thead>
            <tr><th colspan="5" style="background-color: #991b1b; color: #ffffff; font-size: 18px; padding: 15px;">نظام محور • سجل خصومات واستقطاعات قسم (${deptName})</th></tr>
            <tr><th colspan="5" style="background-color: #b91c1c; color: #e2e8f0; font-size: 12px; padding: 6px;">تاريخ التصدير: ${exportDate}</th></tr>
            <tr style="background-color: #fee2e2;">
              <th>اسم الموظف</th><th>رقم الهوية / الإقامة</th><th>مبلغ الخصم</th><th>سبب الاستقطاع</th><th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr style="background-color: #fecaca; font-weight: bold;">
              <td colspan="2" style="text-align: center; padding: 12px; color: #7f1d1d;">إجمالي الخصومات المستقطعة</td>
              <td style="text-align: center; color: #991b1b; font-size: 14px;">${sum.toFixed(2)} ر.س</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>`;
      return downloadExcelFile(html, `سجل_خصومات_${deptName.replace(/\s+/g, '_')}`);
    }

    // C. تصدير الحوافز فقط
    if (hrSubTab === 'incentives') {
      if (!deptIncentives.length) return alert(`لا توجد حوافز أو مكافآت مسجلة في قسم (${deptName}) للتصدير.`);
      let rows = '';
      let sum = 0;
      deptIncentives.forEach((inc, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        const val = parseNum(inc.amount);
        sum += val;
        rows += `<tr style="background-color: ${bg};">
          <td style="text-align: right; font-weight: bold;">${inc.empName}</td>
          <td style="text-align: center; mso-number-format:'\\@';">${inc.idNumber}</td>
          <td style="text-align: center; font-weight: bold; color: #8b5cf6;">${val.toFixed(2)} ر.س</td>
          <td style="text-align: right;">${inc.reason || '-'}</td>
          <td style="text-align: center;" dir="ltr">${inc.date}</td>
        </tr>`;
      });

      const html = `
        <table>
          <thead>
            <tr><th colspan="5" style="background-color: #5b21b6; color: #ffffff; font-size: 18px; padding: 15px;">نظام محور • سجل حوافز ومكافآت قسم (${deptName})</th></tr>
            <tr><th colspan="5" style="background-color: #6d28d9; color: #e2e8f0; font-size: 12px; padding: 6px;">تاريخ التصدير: ${exportDate}</th></tr>
            <tr style="background-color: #ede9fe;">
              <th>اسم الموظف</th><th>رقم الهوية / الإقامة</th><th>مبلغ المكافأة</th><th>السبب الوصفي</th><th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr style="background-color: #ddd6fe; font-weight: bold;">
              <td colspan="2" style="text-align: center; padding: 12px; color: #4c1d95;">إجمالي مبالغ الحوافز والمكافآت</td>
              <td style="text-align: center; color: #5b21b6; font-size: 14px;">${sum.toFixed(2)} ر.س</td>
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>`;
      return downloadExcelFile(html, `سجل_حوافز_${deptName.replace(/\s+/g, '_')}`);
    }

    // D. تصدير العمولات فقط
    if (hrSubTab === 'commissions') {
      if (!deptCommissions.length) return alert(`لا توجد عمولات مناديب مسجلة في قسم (${deptName}) للتصدير.`);
      let rows = '';
      let sumSales = 0, sumComm = 0;
      let sumCartons = 0, sumPieces = 0;

      deptCommissions.forEach((c, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        sumSales += c.totalAmount;
        sumComm += c.commission;
        sumCartons += c.cartonsCount;
        sumPieces += c.piecesCount;

        rows += `<tr style="background-color: ${bg};">
          <td style="text-align: right; font-weight: bold;">${c.empName}</td>
          <td style="text-align: center; mso-number-format:'\\@';">${c.idNumber}</td>
          <td style="text-align: center; font-weight: bold; color: #0284c7; mso-number-format:'\\@';">${c.invoiceNo}</td>
          <td style="text-align: right;">${c.customerName}</td>
          <td style="text-align: center;" dir="ltr">${c.date}</td>
          <td style="text-align: center; font-weight: bold; color: #d97706;">${c.qtyDescription}</td>
          <td style="text-align: center; font-weight: bold;">${c.totalAmount.toFixed(2)} ر.س</td>
          <td style="text-align: center; font-weight: bold; color: #10b981; background-color: #f0fdf4;">${c.commission.toFixed(2)} ر.س</td>
        </tr>`;
      });

      const totalQtyStr = `${sumCartons} كرتون` + (sumPieces > 0 ? ` و ${sumPieces} قطعة` : '');

      const html = `
        <table>
          <thead>
            <tr><th colspan="8" style="background-color: #0369a1; color: #ffffff; font-size: 18px; padding: 15px;">نظام محور • سجل عمولات مبيعات مناديب قسم (${deptName})</th></tr>
            <tr><th colspan="8" style="background-color: #0284c7; color: #e2e8f0; font-size: 12px; padding: 6px;">تاريخ التصدير: ${exportDate}</th></tr>
            <tr style="background-color: #e0f2fe;">
              <th>اسم المندوب</th><th>الهوية / الإقامة</th><th>رقم الفاتورة</th><th>اسم العميل</th><th>تاريخ الفاتورة</th><th>الكمية المباعة</th><th>إجمالي الفاتورة</th><th>مبلغ العمولة المستحقة</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr style="background-color: #bae6fd; font-weight: bold;">
              <td colspan="5" style="text-align: center; padding: 12px; color: #0369a1;">إجمالي عمولات ومبيعات المناديب</td>
              <td style="text-align: center; color: #d97706;">${totalQtyStr}</td>
              <td style="text-align: center; color: #0f172a;">${sumSales.toFixed(2)} ر.س</td>
              <td style="text-align: center; color: #047857; font-size: 14px;">${sumComm.toFixed(2)} ر.س</td>
            </tr>
          </tbody>
        </table>`;
      return downloadExcelFile(html, `سجل_عمولات_${deptName.replace(/\s+/g, '_')}`);
    }

    // E. تصدير الوثائق والتنبيهات فقط
    if (hrSubTab === 'alerts') {
      if (!filteredEmps.length) return alert(`لا يوجد موظفون في قسم (${deptName}) لتصدير وثائقهم.`);
      let rows = '';
      filteredEmps.forEach((emp, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#f8fafc';
        const iqama = checkExp(emp.iqamaEnd);
        const health = checkExp(emp.healthEnd);
        const contract = checkExp(emp.contractEnd);

        rows += `<tr style="background-color: ${bg};">
          <td style="text-align: right; font-weight: bold;">${emp.name}</td>
          <td style="text-align: center; mso-number-format:'\\@';">${emp.idNumber || '-'}</td>
          <td style="text-align: right;">${emp.role || '-'}</td>
          <td style="text-align: center;">${emp.iqamaEnd || '-'}</td>
          <td style="text-align: center; font-weight: bold; color: ${iqama.color};">${iqama.label}</td>
          <td style="text-align: center;">${emp.healthEnd || '-'}</td>
          <td style="text-align: center; font-weight: bold; color: ${health.color};">${health.label}</td>
          <td style="text-align: center;">${emp.contractEnd || '-'}</td>
          <td style="text-align: center; font-weight: bold; color: ${contract.color};">${contract.label}</td>
        </tr>`;
      });

      const html = `
        <table>
          <thead>
            <tr><th colspan="9" style="background-color: #b45309; color: #ffffff; font-size: 18px; padding: 15px;">نظام محور • كشف وثائق وتنبيهات صلاحية عقود موظفي قسم (${deptName})</th></tr>
            <tr><th colspan="9" style="background-color: #d97706; color: #e2e8f0; font-size: 12px; padding: 6px;">تاريخ التصدير: ${exportDate}</th></tr>
            <tr style="background-color: #fef3c7;">
              <th>اسم الموظف</th><th>رقم الهوية</th><th>المسمى الوظيفي</th><th>انتهاء الإقامة</th><th>حالة الإقامة</th><th>انتهاء التأمين الطبي</th><th>حالة التأمين</th><th>انتهاء العقد</th><th>حالة العقد</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>`;
      return downloadExcelFile(html, `وثائق_وتنبيهات_${deptName.replace(/\s+/g, '_')}`);
    }
  };

  // مسمى زر التصدير الديناميكي حسب التبويب المفتوح
  const getExportButtonLabel = () => {
    switch (hrSubTab) {
      case 'commissions': return '📊 تصدير العمولات (Excel)';
      case 'deductions': return '📊 تصدير الخصومات (Excel)';
      case 'incentives': return '📊 تصدير الحوافز (Excel)';
      case 'alerts': return '📊 تصدير الوثائق والتنبيهات (Excel)';
      default: return '📊 تصدير مسير الموظفين (Excel)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      
      {!selectedDepartment ? (
        <>
          {/* رأس الشاشة الرئيسية للأقسام مع زر التصدير الشامل المضاف */}
          <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900', color: theme?.textDark || '#fff' }}>إدارة الأقسام والموارد البشرية</h2>
              <p style={{ margin: 0, color: theme?.textMuted || '#94a3b8', fontSize: '14px' }}>إدارة الأقسام والموظفين التابعين لها والتقارير الشاملة</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={exportAllDepartmentsExcel} 
                style={{ background: '#059669', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
              >
                📊 تصدير شامل لجميع الأقسام (Excel)
              </button>
              <button 
                onClick={() => setShowAddDeptModal(true)} 
                style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}
              >
                ➕ إضافة قسم جديد
              </button>
            </div>
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
          {/* تفاصيل القسم وزر التصدير الديناميكي للتبويب المفتوح */}
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
              
              {/* زر التصدير الذكي الذي يتغير حسب التبويب المفتوح */}
              <button 
                onClick={exportActiveTabExcel} 
                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                {getExportButtonLabel()}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="text" 
              placeholder="🔍 ابحث بالاسم أو برقم الهوية أو الفاتورة..." 
              value={empSearchQuery} 
              onChange={e => setEmpSearchQuery(e.target.value)} 
              style={{ width: '100%', padding: '12px 15px', borderRadius: '10px', background: theme?.cardBg || '#1e293b', color: theme?.textDark || '#fff', border: `1px solid ${theme?.border || '#334155'}`, outline: 'none' }}
            />

            {/* Sub-Tabs Bar: تبويب العمولات */}
            <div style={{ display: 'flex', gap: '10px', background: theme?.cardBg || '#1e293b', padding: '10px', borderRadius: '12px', border: `1px solid ${theme?.border || '#334155'}`, overflowX: 'auto' }}>
              {[
                { id: 'employees', label: 'الموظفون' },
                { id: 'deductions', label: 'الخصومات' },
                { id: 'incentives', label: 'الحوافز والمكافآت' },
                { id: 'commissions', label: 'العمولات' },
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

          {/* تبويب الموظفون */}
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
                          <button onClick={() => handleOpenEditModal(emp)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>تعديل ✏️</button>
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

          {/* تبويب الخصومات */}
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

          {/* تبويب الحوافز والمكافآت */}
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

          {/* تبويب العمولات مع أزرار الحذف الفردي وحذف الكل */}
          {hrSubTab === 'commissions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* بطاقات الإحصاء السريعة */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                <div style={{ background: theme?.cardBg || '#1e293b', border: `1px solid ${theme?.border || '#334155'}`, borderRadius: '14px', padding: '18px' }}>
                  <div style={{ fontSize: '13px', color: theme?.textMuted || '#94a3b8', marginBottom: '6px' }}>إجمالي مبالغ العمولات المستحقة</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981' }}>{totalCommissionsAmount.toFixed(2)} ر.س</div>
                </div>
                <div style={{ background: theme?.cardBg || '#1e293b', border: `1px solid ${theme?.border || '#334155'}`, borderRadius: '14px', padding: '18px' }}>
                  <div style={{ fontSize: '13px', color: theme?.textMuted || '#94a3b8', marginBottom: '6px' }}>عدد الفواتير المرتبطة بالمناديب</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#38bdf8' }}>{filteredCommissions.length}</div>
                </div>
                <div style={{ background: theme?.cardBg || '#1e293b', border: `1px solid ${theme?.border || '#334155'}`, borderRadius: '14px', padding: '18px' }}>
                  <div style={{ fontSize: '13px', color: theme?.textMuted || '#94a3b8', marginBottom: '6px' }}>إجمالي الكراتين المباعة</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#d97706' }}>
                    {filteredCommissions.reduce((s, c) => s + c.cartonsCount, 0)} كرتون
                  </div>
                </div>
              </div>

              {/* الجدول التفصيلي للعمولات مع زر حذف الكل وزر حذف الفاتورة */}
              <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '20px', overflowX: 'auto' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                  <h4 style={{ margin: 0, color: theme?.textDark || '#fff', fontSize: '15px' }}>تفاصيل عمولات المناديب</h4>
                  {deptCommissions.length > 0 && (
                    <button
                      onClick={handleDeleteAllCommissions}
                      style={{
                        background: '#7f1d1d',
                        color: '#fca5a5',
                        border: '1px solid #991b1b',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      🗑️ حذف الكل (بدء دورة جديدة)
                    </button>
                  )}
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme?.border || '#334155'}` }}>
                      <th style={{ padding: '12px' }}>اسم المندوب</th>
                      <th style={{ padding: '12px' }}>رقم الهوية</th>
                      <th style={{ padding: '12px' }}>رقم الفاتورة</th>
                      <th style={{ padding: '12px' }}>اسم العميل</th>
                      <th style={{ padding: '12px' }}>تاريخ الفاتورة</th>
                      <th style={{ padding: '12px' }}>الكمية المباعة</th>
                      <th style={{ padding: '12px' }}>قيمة الفاتورة</th>
                      <th style={{ padding: '12px' }}>مبلغ العمولة</th>
                      <th style={{ padding: '12px' }}>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommissions.map(c => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${theme?.border || '#334155'}` }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.empName}</td>
                        <td style={{ padding: '12px', color: theme?.textMuted || '#94a3b8' }}>{c.idNumber}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#38bdf8' }} dir="ltr">{c.invoiceNo}</td>
                        <td style={{ padding: '12px' }}>{c.customerName}</td>
                        <td style={{ padding: '12px' }} dir="ltr">{c.date}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#d97706' }}>{c.qtyDescription}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{c.totalAmount.toFixed(2)} ر.س</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981', fontSize: '14px' }}>{c.commission.toFixed(2)} ر.س</td>
                        <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleDeleteSingleCommission(c.id)}
                            style={{
                              background: '#7f1d1d',
                              color: '#fca5a5',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}
                          >
                            حذف 🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCommissions.length === 0 && (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: theme?.textMuted || '#94a3b8' }}>
                          لا توجد عمولات حالية مسجلة لمناديب هذا القسم (تم تصفير الدورة بنجاح).
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {filteredCommissions.length > 0 && (
                    <tfoot>
                      <tr style={{ background: isDark ? '#0f172a' : '#f1f5f9', fontWeight: 'bold', borderTop: `2px solid ${theme?.border || '#334155'}` }}>
                        <td colSpan="6" style={{ padding: '14px', textAlign: 'center', color: '#38bdf8' }}>إجمالي عمولات القسم</td>
                        <td style={{ padding: '14px', color: theme?.textDark || '#fff' }}>
                          {filteredCommissions.reduce((s, c) => s + c.totalAmount, 0).toFixed(2)} ر.س
                        </td>
                        <td style={{ padding: '14px', color: '#10b981', fontSize: '15px' }}>
                          {totalCommissionsAmount.toFixed(2)} ر.س
                        </td>
                        <td style={{ padding: '14px' }}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

            </div>
          )}

          {/* تبويب الوثائق والتنبيهات */}
          {hrSubTab === 'alerts' && (
            <div>
              <h3 style={{ margin: '0 0 20px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ قائمة تنبيهات وثائق الموظفين
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {filteredEmps.map(emp => {
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
                          <span style={{ color: iqama.color, padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{iqama.label}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8' }}>شهادة صحية وتأمين طبي</div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{emp.healthEnd || '-'}</div>
                          </div>
                          <span style={{ color: health.color, padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{health.label}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: '8px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: theme?.textMuted || '#94a3b8' }}>العقد الوظيفي</div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{emp.contractEnd || '-'}</div>
                          </div>
                          <span style={{ color: contract.color, padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>{contract.label}</span>
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

      {/* نافذة إضافة موظف جديد */}
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

      {/* نافذة تعديل بيانات الموظف المدمجة */}
      {showEditEmpModal && editEmpData && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '15px' }}>
          <div style={{ background: theme?.cardBg || '#1e293b', color: theme?.textDark || '#fff', padding: '30px', borderRadius: '20px', maxWidth: '700px', width: '100%', border: `1px solid ${theme?.border || '#334155'}`, maxHeight: '92vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: '#f59e0b' }}>تعديل بيانات الموظف: {editEmpData.name}</h3>
            <form onSubmit={handleSaveEditEmp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>الاسم الكامل *</label>
                  <input type="text" value={editEmpData.name || ''} onChange={e=>setEditEmpData({...editEmpData, name: e.target.value})} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>رقم الموظف</label>
                  <input type="text" value={editEmpData.empNo || ''} onChange={e=>setEditEmpData({...editEmpData, empNo: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>رقم الهوية / الإقامة *</label>
                  <input type="text" value={editEmpData.idNumber || ''} onChange={e=>setEditEmpData({...editEmpData, idNumber: e.target.value})} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>رقم الهاتف</label>
                  <input type="text" value={editEmpData.phone || ''} onChange={e=>setEditEmpData({...editEmpData, phone: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>المسمى الوظيفي *</label>
                  <input type="text" value={editEmpData.role || ''} onChange={e=>setEditEmpData({...editEmpData, role: e.target.value})} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>القسم</label>
                  <input type="text" value={editEmpData.dept || selectedDepartment?.name} disabled style={{...inputStyle, opacity: 0.7}} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>العنوان الوطني</label>
                  <input type="text" value={editEmpData.address || ''} onChange={e=>setEditEmpData({...editEmpData, address: e.target.value})} placeholder="المدينة، الحي، الشارع" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>شركة / فئة التأمين الطبي</label>
                  <input type="text" value={editEmpData.medicalInsurance || ''} onChange={e=>setEditEmpData({...editEmpData, medicalInsurance: e.target.value})} placeholder="مثال: بوبا فئة A / التعاونية" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>الحالة الاجتماعية</label>
                  <select value={editEmpData.maritalStatus || 'أعزب'} onChange={e=>setEditEmpData({...editEmpData, maritalStatus: e.target.value})} style={inputStyle}>
                    <option value="أعزب">أعزب</option>
                    <option value="متزوج">متزوج</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>عدد الأطفال</label>
                  <input type="number" min="0" value={editEmpData.childrenCount || 0} onChange={e=>setEditEmpData({...editEmpData, childrenCount: e.target.value})} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>الراتب الأساسي (ر.س) *</label>
                  <input type="number" min="0" value={editEmpData.salary || 0} onChange={e=>setEditEmpData({...editEmpData, salary: e.target.value})} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>رصيد الإجازات (أيام)</label>
                  <input type="number" min="0" value={editEmpData.vacations || 21} onChange={e=>setEditEmpData({...editEmpData, vacations: e.target.value})} style={{...inputStyle, background: theme?.cardBg || '#1e293b'}} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: theme?.bgMain || '#0f172a', padding: '12px', borderRadius: '10px', border: `1px solid ${theme?.border || '#334155'}` }}>
                <div>
                  <label style={{ ...labelStyle, color: '#10b981' }}>بدل سكن (ر.س)</label>
                  <input type="number" min="0" value={editEmpData.housingAllowance || 0} onChange={e=>setEditEmpData({...editEmpData, housingAllowance: e.target.value})} style={{...inputStyle, padding: '10px', background: theme?.cardBg || '#1e293b'}} />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#10b981' }}>بدل مواصلات (ر.س)</label>
                  <input type="number" min="0" value={editEmpData.transportAllowance || 0} onChange={e=>setEditEmpData({...editEmpData, transportAllowance: e.target.value})} style={{...inputStyle, padding: '10px', background: theme?.cardBg || '#1e293b'}} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: theme?.bgMain || '#0f172a', padding: '12px', borderRadius: '10px', border: `1px solid ${theme?.border || '#334155'}` }}>
                <div>
                  <label style={labelStyle}>انتهاء الإقامة</label>
                  <input type="date" value={editEmpData.iqamaEnd || ''} onChange={e=>setEditEmpData({...editEmpData, iqamaEnd: e.target.value})} style={{...inputStyle, padding: '8px', fontSize: '12px', background: theme?.cardBg || '#1e293b'}} />
                </div>
                <div>
                  <label style={labelStyle}>انتهاء التأمين الطبي</label>
                  <input type="date" value={editEmpData.healthEnd || ''} onChange={e=>setEditEmpData({...editEmpData, healthEnd: e.target.value})} style={{...inputStyle, padding: '8px', fontSize: '12px', background: theme?.cardBg || '#1e293b'}} />
                </div>
                <div>
                  <label style={labelStyle}>انتهاء العقد الوظيفي</label>
                  <input type="date" value={editEmpData.contractEnd || ''} onChange={e=>setEditEmpData({...editEmpData, contractEnd: e.target.value})} style={{...inputStyle, padding: '8px', fontSize: '12px', background: theme?.cardBg || '#1e293b'}} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, background: '#10b981', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>حفظ التعديلات</button>
                <button type="button" onClick={() => { setShowEditEmpModal(false); setEditEmpData(null); }} style={{ flex: 1, background: '#334155', color: '#fff', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>إلغاء</button>
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