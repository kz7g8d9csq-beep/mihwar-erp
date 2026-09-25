import React from 'react';

const HrTab = ({
  t, theme = {}, isDark, user,
  hrSubTab, setHrSubTab,
  employees = [], filteredEmployees = [], filteredDeductions = [], filteredAlerts = [],
  documentAlerts = [], urgentAlertsCount = 0,
  hrSearchQuery = '', setHrSearchQuery,
  hrPayrollSearchQuery = '', setHrPayrollSearchQuery,
  hrAlertsSearchQuery = '', setHrAlertsSearchQuery,
  totalPayroll = 0,
  totalCommissions,
  totalIncentives,
  handleOpenEditEmp, handleDeleteEmployee,
  handleRemoveDeduction,
  setShowAddEmpModal, setShowDeductModal, setShowIncentiveModal,
  setEditingEmpId,
  empFormReset,
  incentiveRecords = [],
  hrIncentivesSearchQuery = '', setHrIncentivesSearchQuery,
  handleRemoveIncentive
}) => {
  // دالة أمان لقراءة الترجمة
  const tr = (key, fallback) => {
    if (typeof t === 'function') {
      try { return t(key) || fallback || key; } catch (e) { return fallback || key; }
    }
    if (t && typeof t === 'object') {
      return t[key] || fallback || key;
    }
    return fallback || key;
  };

  const currency = (t && t.currency) || 'ر.س';

  // دالة تنظيف وتوضيح صيغة العمولة (نسبة % أو بالكرتون أو نقداً)
  const formatCommissionDisplay = (val, type) => {
    if (val === undefined || val === null || val === '' || val === 0) return '0';
    const strVal = String(val).trim();
    const strType = String(type || '').trim();

    if (strType.includes('%') || strType.includes('نسبة') || strVal.includes('%')) {
      return strVal.replace('%', '') + '%';
    }
    if (strType.includes('كرتون')) {
      return strVal + ' بالكرتون';
    }
    if (strType && strType !== 'بدون') {
      return strVal + ' (' + strType + ')';
    }
    return strVal + ' ' + currency;
  };

  // دالة توليد التاريخ والوقت لترويسة التصدير
  const getCleanDateTime = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + min;
  };

  const calculatedCommissions = totalCommissions !== undefined 
    ? totalCommissions 
    : (employees || []).reduce((acc, emp) => acc + (Number(emp?.commission) || 0), 0);

  const calculatedIncentives = totalIncentives !== undefined 
    ? totalIncentives 
    : (employees || []).reduce((acc, emp) => {
        if (!emp?.incentiveType || emp?.incentiveType === 'حافز مادي') {
          return acc + (Number(emp?.incentives) || 0);
        }
        return acc;
      }, 0);

  const safeLower = (s) => (s || '').toString().toLowerCase();
  const filteredIncentiveRecords = (incentiveRecords || []).filter(r =>
    safeLower(r?.empName).includes(safeLower(hrIncentivesSearchQuery)) ||
    safeLower(r?.empRole).includes(safeLower(hrIncentivesSearchQuery))
  );

  // دالة تصدير الإكسيل الرسمية المعتمدة
  const handleExportHRExcel = () => {
    const exportDate = getCleanDateTime();
    let systemTitle = 'نظام محور • سجل الموارد البشرية والرواتب';
    let fileName = 'سجل_الموظفين_والرواتب';
    let tableHeaders = '';
    let tableRows = '';

    if (hrSubTab === 'payroll') {
      systemTitle = 'نظام محور • سجل الخصومات والجزاءات';
      fileName = 'سجل_خصومات_الموظفين';
      const list = filteredDeductions || [];
      if (list.length === 0) {
        alert('لا توجد بيانات خصومات للتصدير');
        return;
      }

      tableHeaders = '<tr style="background-color: #e2e8f0;">' +
        '<th width="200" style="width: 200px;">اسم الموظف</th>' +
        '<th width="140" style="width: 140px;">قيمة الخصم</th>' +
        '<th width="260" style="width: 260px;">سبب الخصم</th>' +
        '<th width="160" style="width: 160px;">تاريخ التسجيل</th>' +
      '</tr>';

      let totalDeductionsAmount = 0;
      list.forEach((d, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        const amt = Number(d?.amount || 0);
        totalDeductionsAmount += amt;
        tableRows += '<tr style="background-color: ' + bg + ';">' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px 15px; text-align: right; font-weight: bold; white-space: nowrap;">' + (d?.empName || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #ef4444;">' + amt.toFixed(2) + ' ' + currency + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">' + (d?.reason || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + (d?.date || '-') + '</td>' +
        '</tr>';
      });

      tableRows += '<tr style="background-color: #f1f5f9; font-weight: bold;">' +
        '<td style="border: 1px solid #94a3b8; padding: 12px 15px; text-align: right;">إجمالي الخصومات</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #ef4444;">' + totalDeductionsAmount.toFixed(2) + ' ' + currency + '</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
      '</tr>';

    } else if (hrSubTab === 'incentives') {
      systemTitle = 'نظام محور • سجل الحوافز والمكافآت والعمولات';
      fileName = 'سجل_حوافز_الموظفين';
      const list = filteredIncentiveRecords || [];
      if (list.length === 0) {
        alert('لا توجد بيانات حوافز ومكافآت للتصدير');
        return;
      }

      tableHeaders = '<tr style="background-color: #e2e8f0;">' +
        '<th width="200" style="width: 200px;">اسم الموظف</th>' +
        '<th width="160" style="width: 160px;">المسمى الوظيفي</th>' +
        '<th width="140" style="width: 140px;">نوع الحافز</th>' +
        '<th width="160" style="width: 160px;">قيمة / وصف الحافز</th>' +
        '<th width="140" style="width: 140px;">نوع العمولة</th>' +
        '<th width="140" style="width: 140px;">قيمة العمولة</th>' +
        '<th width="160" style="width: 160px;">تاريخ التسجيل</th>' +
      '</tr>';

      list.forEach((r, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        tableRows += '<tr style="background-color: ' + bg + ';">' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px 15px; text-align: right; font-weight: bold; white-space: nowrap;">' + (r?.empName || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #0284c7;">' + (r?.empRole || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">' + (r?.incentiveType || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;">' + (r?.incentiveValue || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">' + (r?.commissionType || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #d97706;">' + formatCommissionDisplay(r?.commissionValue, r?.commissionType) + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + (r?.date || '-') + '</td>' +
        '</tr>';
      });

    } else if (hrSubTab === 'alerts') {
      systemTitle = 'نظام محور • قائمة تنبيهات وثائق الموظفين';
      fileName = 'تنبيهات_وثائق_الموظفين';
      const list = filteredAlerts || [];
      if (list.length === 0) {
        alert('لا توجد تنبيهات وثائق للتصدير');
        return;
      }

      tableHeaders = '<tr style="background-color: #e2e8f0;">' +
        '<th width="200" style="width: 200px;">اسم الموظف</th>' +
        '<th width="160" style="width: 160px;">رقم الهوية / الإقامة</th>' +
        '<th width="160" style="width: 160px;">نوع الوثيقة</th>' +
        '<th width="150" style="width: 150px;">الأيام المتبقية</th>' +
        '<th width="140" style="width: 140px;">الحالة</th>' +
      '</tr>';

      list.forEach((al, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        const isExp = al?.daysDiff < 0;
        tableRows += '<tr style="background-color: ' + bg + ';">' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px 15px; text-align: right; font-weight: bold; white-space: nowrap;">' + (al?.empName || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + (al?.empIdNumber || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">' + (al?.docType || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">' + (al?.daysDiff || 0) + ' يوم</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: ' + (isExp ? '#dc2626' : '#16a34a') + ';">' + (isExp ? 'منتهية' : 'سارية') + '</td>' +
        '</tr>';
      });

    } else {
      // سجل الموظفين والرواتب والوثائق (14 عموداً كاملاً مع انتهاء التأمين الطبي في مكانه الصحيح)
      systemTitle = 'نظام محور • سجل الموظفين والرواتب والوثائق';
      fileName = 'سجل_الموظفين_والرواتب';
      const list = filteredEmployees || [];
      if (list.length === 0) {
        alert('لا توجد بيانات موظفين للتصدير');
        return;
      }

      tableHeaders = '<tr style="background-color: #e2e8f0;">' +
        '<th width="120" style="width: 120px;">الرقم الوظيفي</th>' +
        '<th width="260" style="width: 260px; padding: 12px 16px;">اسم الموظف</th>' +
        '<th width="160" style="width: 160px;">رقم الهوية / الإقامة</th>' +
        '<th width="160" style="width: 160px;">المسمى الوظيفي</th>' +
        '<th width="140" style="width: 140px;">القسم</th>' +
        '<th width="130" style="width: 130px;">الراتب الأساسي</th>' +
        '<th width="120" style="width: 120px;">البدلات</th>' +
        '<th width="140" style="width: 140px;">العمولات</th>' +
        '<th width="120" style="width: 120px;">الخصومات</th>' +
        '<th width="150" style="width: 150px;">صافي الراتب التقديري</th>' +
        '<th width="120" style="width: 120px;">رصيد الإجازات</th>' +
        '<th width="140" style="width: 140px;">انتهاء الإقامة</th>' +
        '<th width="150" style="width: 150px;">انتهاء التأمين الطبي</th>' +
        '<th width="140" style="width: 140px;">انتهاء العقد</th>' +
      '</tr>';

      let sumBasic = 0;
      let sumAllowances = 0;
      let sumDeductions = 0;
      let sumNet = 0;

      list.forEach((emp, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
        const empNo = emp?.empNo || ('EMP-' + (idx + 1));
        const salary = Number(emp?.salary || 0);
        const allow = (Number(emp?.allowances) || 0) + (Number(emp?.housingAllowance) || 0) + (Number(emp?.transportAllowance) || 0);
        const deduct = Number(emp?.deductions || 0);
        const net = Math.max(0, salary + allow + Number(emp?.commission || 0) - deduct);

        sumBasic += salary;
        sumAllowances += allow;
        sumDeductions += deduct;
        sumNet += net;

        tableRows += '<tr style="background-color: ' + bg + ';">' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; mso-number-format:\'\\@\'; color: #d97706;">#' + empNo + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px 16px; text-align: right; font-weight: bold; white-space: nowrap;">' + (emp?.name || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + (emp?.idNumber || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">' + (emp?.role || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; color: #0284c7;">' + (emp?.dept || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #10b981;">' + salary.toFixed(2) + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">' + allow.toFixed(2) + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #d97706;">' + formatCommissionDisplay(emp?.commission, emp?.commissionType) + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; color: #ef4444;">' + deduct.toFixed(2) + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #0f172a;">' + net.toFixed(2) + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">' + (emp?.vacations || 0) + ' يوم</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + (emp?.iqamaEnd || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\'; font-weight: bold; color: #0284c7;">' + (emp?.healthEnd || emp?.insuranceEnd || emp?.medicalEnd || '-') + '</td>' +
          '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; mso-number-format:\'\\@\';">' + (emp?.contractEnd || '-') + '</td>' +
        '</tr>';
      });

      tableRows += '<tr style="background-color: #e2e8f0; font-weight: bold;">' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #d97706; font-size: 13px;">الإجمالي</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px 16px; text-align: right; color: #0f172a; font-size: 13px; white-space: nowrap;">الإجمالي الكلي لمسير الرواتب</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #10b981; font-size: 13px;">' + sumBasic.toFixed(2) + '</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; font-size: 13px;">' + sumAllowances.toFixed(2) + '</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #d97706; font-size: 13px;">-</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #ef4444; font-size: 13px;">' + sumDeductions.toFixed(2) + '</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #0f172a; font-size: 13px;">' + sumNet.toFixed(2) + '</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
        '<td style="border: 1px solid #94a3b8; padding: 12px; text-align: center; color: #64748b;">-</td>' +
      '</tr>';
    }

    const colCount = hrSubTab === 'payroll' ? 4 : (hrSubTab === 'incentives' ? 7 : (hrSubTab === 'alerts' ? 5 : 14));

    const excelTemplate = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head>' +
        '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">' +
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
        '<x:Name>الموارد البشرية</x:Name>' +
        '<x:WorksheetOptions><x:DisplayRightToLeft/></x:WorksheetOptions>' +
        '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
        '<style>' +
          'body { font-family: Tahoma, Arial, sans-serif; direction: rtl; }' +
          'table { border-collapse: collapse; width: 100%; direction: rtl; }' +
          'th { border: 1px solid #94a3b8; background-color: #e2e8f0; color: #0f172a; padding: 12px; font-weight: bold; text-align: center; font-size: 13px; }' +
          'td { border: 1px solid #cbd5e1; padding: 10px; font-size: 12px; }' +
        '</style>' +
      '</head>' +
      '<body dir="rtl">' +
        '<table>' +
          '<thead>' +
            '<tr>' +
              '<th colspan="' + colCount + '" style="background-color: #1e293b; color: #ffffff; font-size: 18px; padding: 16px; text-align: center; font-weight: bold;">' + systemTitle + '</th>' +
            '</tr>' +
            '<tr>' +
              '<th colspan="' + colCount + '" style="background-color: #334155; color: #e2e8f0; font-size: 12px; padding: 8px; text-align: center;">تاريخ التصدير: ' + exportDate + ' | وثيقة معتمدة ومصدرة آلياً من النظام</th>' +
            '</tr>' +
            tableHeaders +
          '</thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</body>' +
    '</html>';

    const blob = new Blob(['\ufeff' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName + '_' + Date.now() + '.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* رأس الصفحة وأزرار الإضافة والتصدير */}
      <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900', color: theme?.textDark || '#fff' }}>
            {t?.hrTitle || tr('الموارد البشرية')}
          </h2>
          <p style={{ margin: 0, color: theme?.textMuted || '#94a3b8', fontSize: '14px' }}>
            {t?.hrSub || tr('إدارة الموظفين والرواتب والوثائق')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={handleExportHRExcel}
            style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {tr('تصدير إكسيل 📊')}
          </button>
          <button 
            type="button"
            onClick={() => { if (empFormReset) empFormReset(); if (setEditingEmpId) setEditingEmpId(null); if (setShowAddEmpModal) setShowAddEmpModal(true); }} 
            style={{ background: '#d97706', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            {t?.addEmpBtn || tr('إضافة موظف جديد +')}
          </button>
          <button 
            type="button" 
            onClick={() => { if (setShowIncentiveModal) setShowIncentiveModal(true); }} 
            style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            {tr('إضافة حافز أو مكافأة +')}
          </button>
          <button 
            type="button" 
            onClick={() => { if (setShowDeductModal) setShowDeductModal(true); }} 
            style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            {t?.addDeductBtn || tr('تسجيل خصم -')}
          </button>
        </div>
      </div>

      {/* شريط التبويبات الفرعية */}
      <div style={{ display: 'flex', gap: '8px', background: theme?.cardBg || '#1e293b', padding: '6px', borderRadius: '12px', border: `1px solid ${theme?.border || '#334155'}`, width: 'fit-content', flexWrap: 'wrap' }}>
        <button 
          type="button" 
          onClick={() => setHrSubTab && setHrSubTab('employees')}
          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: hrSubTab === 'employees' ? '#d97706' : 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          {tr('الموظفون')}
        </button>
        <button 
          type="button" 
          onClick={() => setHrSubTab && setHrSubTab('payroll')}
          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: hrSubTab === 'payroll' ? '#ef4444' : 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          {tr('الخصومات')}
        </button>
        <button 
          type="button" 
          onClick={() => setHrSubTab && setHrSubTab('incentives')}
          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: hrSubTab === 'incentives' ? '#8b5cf6' : 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
          {tr('الحوافز والمكافآت')}
        </button>
        <button 
          type="button" 
          onClick={() => setHrSubTab && setHrSubTab('alerts')}
          style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: hrSubTab === 'alerts' ? '#d97706' : 'transparent', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{tr('الوثائق والتنبيهات')}</span>
          {urgentAlertsCount > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
              {urgentAlertsCount}
            </span>
          )}
        </button>
      </div>

      {/* بطاقات الإحصائيات العلوية */}
      {hrSubTab !== 'alerts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          <div style={{ background: theme?.cardBg || '#1e293b', padding: '22px', borderRadius: '14px', border: `1px solid ${theme?.border || '#334155'}` }}>
            <p style={{ margin: 0, color: theme?.textMuted || '#94a3b8', fontSize: '13px' }}>{tr('إجمالي الموظفين')}</p>
            <h2 style={{ color: '#38bdf8', margin: '8px 0 0 0', fontSize: '24px' }}>{(employees || []).length} {tr('موظف')}</h2>
          </div>
          <div style={{ background: theme?.cardBg || '#1e293b', padding: '22px', borderRadius: '14px', border: `1px solid ${theme?.border || '#334155'}` }}>
            <p style={{ margin: 0, color: theme?.textMuted || '#94a3b8', fontSize: '13px' }}>{tr('إجمالي الرواتب الأساسية')}</p>
            <h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '24px' }}>{(Number(totalPayroll) || 0).toLocaleString()} {currency}</h2>
          </div>
          <div style={{ background: theme?.cardBg || '#1e293b', padding: '22px', borderRadius: '14px', border: `1px solid ${theme?.border || '#334155'}` }}>
            <p style={{ margin: 0, color: theme?.textMuted || '#94a3b8', fontSize: '13px' }}>{tr('إجمالي العمولات')}</p>
            <h2 style={{ color: '#f59e0b', margin: '8px 0 0 0', fontSize: '24px' }}>{(Number(calculatedCommissions) || 0).toLocaleString()} {currency}</h2>
          </div>
          <div style={{ background: theme?.cardBg || '#1e293b', padding: '22px', borderRadius: '14px', border: `1px solid ${theme?.border || '#334155'}` }}>
            <p style={{ margin: 0, color: theme?.textMuted || '#94a3b8', fontSize: '13px' }}>{tr('إجمالي الحوافز المادية')}</p>
            <h2 style={{ color: '#8b5cf6', margin: '8px 0 0 0', fontSize: '24px' }}>{(Number(calculatedIncentives) || 0).toLocaleString()} {currency}</h2>
          </div>
        </div>
      )}

      {/* ════════════════ 1: تبويب الموظفون ════════════════ */}
      {hrSubTab === 'employees' && (
        <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '25px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: theme?.textDark || '#fff' }}>{tr('📋 سجل الموظفين وبيانات العمل والبدلات والعمولات')}</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={hrSearchQuery} 
                onChange={e => setHrSearchQuery && setHrSearchQuery(e.target.value)} 
                placeholder={tr('🔍 ابحث بالاسم أو رقم الهوية...')} 
                style={{ padding: '8px 12px', borderRadius: '8px', background: theme?.bgMain || '#0f172a', color: theme?.textDark || '#fff', border: `1px solid ${theme?.border || '#334155'}`, outline: 'none', fontSize: '13px', width: '240px' }} 
              />
              <button 
                type="button" 
                onClick={handleExportHRExcel} 
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                تصدير Excel 📊
              </button>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '950px' }}>
            <thead>
              <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme?.border || '#334155'}` }}>
                <th style={{ padding: '12px' }}>{tr('الموظف')}</th>
                <th style={{ padding: '12px' }}>{tr('رقم الإقامة / الهوية')}</th>
                <th style={{ padding: '12px' }}>{tr('المسمى الوظيفي والقسم')}</th>
                <th style={{ padding: '12px' }}>{tr('الراتب والعمولات والبدلات')}</th>
                <th style={{ padding: '12px' }}>{tr('التأمين الطبي والأجازات')}</th>
                <th style={{ padding: '12px' }}>{tr('انتهاء الوثائق')}</th>
                <th style={{ padding: '12px' }}>{tr('الإجراءات')}</th>
              </tr>
            </thead>
            <tbody>
              {(filteredEmployees || []).map(emp => (
                <tr key={emp?.id} style={{ borderBottom: `1px solid ${theme?.border || '#334155'}` }}>
                  <td style={{ padding: '12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {emp?.name} <span style={{ fontSize: '11px', color: theme?.textMuted || '#94a3b8' }}>(#{emp?.empNo})</span>
                  </td>
                  <td style={{ padding: '12px' }}>{emp?.idNumber}</td>
                  <td style={{ padding: '12px' }}>
                    {emp?.role} <br/><span style={{ color: '#2dd4bf', fontSize: '11px' }}>{emp?.dept}</span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{emp?.salary} {currency}</span>
                    <br/><span style={{ color: '#ef4444', fontSize: '11px' }}>{tr('خصم:')} {emp?.deductions || 0} {currency}</span>
                    <div style={{ fontSize: '11px', color: '#d97706', marginTop: '3px' }}>
                      {emp?.commission ? `${tr('عمولة:')} ${formatCommissionDisplay(emp.commission, emp.commissionType)} ` : ''}
                      {(emp?.allowances || emp?.housingAllowance || emp?.transportAllowance) ? `| ${tr('بدلات:')} ${(Number(emp?.allowances) || 0) + (Number(emp?.housingAllowance) || 0) + (Number(emp?.transportAllowance) || 0)}` : ''}
                    </div>
                    <div style={{ color: '#8b5cf6', fontSize: '11px', fontWeight: 'bold', marginTop: '3px' }}>
                      {emp?.incentiveType && emp?.incentiveType !== 'حافز مادي' ? `${tr('حافز:')} ${tr(emp.incentiveType)} (${emp?.incentives || tr('بدون وصف')})` : ''}
                      {(!emp?.incentiveType || emp?.incentiveType === 'حافز مادي') && emp?.incentives ? `${tr('حافز مادي:')} ${emp.incentives} ${currency}` : ''}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span>{emp?.insurance}</span><br/><span style={{ color: '#38bdf8', fontSize: '11px' }}>{tr('أجازات:')} {emp?.vacations} {tr('يوم')}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    {tr('إقامة:')} {emp?.iqamaEnd} <br/>{tr('التأمين الطبي:')} {emp?.healthEnd || emp?.insuranceEnd || emp?.medicalEnd || '-'} <br/>{tr('عقد وظيفي:')} {emp?.contractEnd}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        type="button"
                        onClick={() => handleOpenEditEmp && handleOpenEditEmp(emp)} 
                        style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {tr('تعديل ✏️')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDeleteEmployee && handleDeleteEmployee(emp?.id)} 
                        style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {tr('حذف 🗑️')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!filteredEmployees || filteredEmployees.length === 0) && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>
                    {tr('لا توجد نتائج مطابقة للبحث.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════════ 2: تبويب الخصومات ════════════════ */}
      {hrSubTab === 'payroll' && (
        <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '25px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#fca5a5' }}>{tr('🔻 سجل الخصومات وإدارتها')}</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={hrPayrollSearchQuery} 
                onChange={e => setHrPayrollSearchQuery && setHrPayrollSearchQuery(e.target.value)} 
                placeholder={tr('🔍 ابحث بالاسم أو رقم الهوية...')} 
                style={{ padding: '8px 12px', borderRadius: '8px', background: theme?.bgMain || '#0f172a', color: theme?.textDark || '#fff', border: `1px solid ${theme?.border || '#334155'}`, outline: 'none', fontSize: '13px', width: '240px' }} 
              />
              <button 
                type="button" 
                onClick={handleExportHRExcel} 
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                تصدير Excel 📊
              </button>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme?.border || '#334155'}` }}>
                <th style={{ padding: '10px' }}>{tr('اسم الموظف')}</th>
                <th style={{ padding: '10px' }}>{tr('قيمة الخصم')}</th>
                <th style={{ padding: '10px' }}>{tr('سبب الخصم')}</th>
                <th style={{ padding: '10px' }}>{tr('تاريخ التسجيل')}</th>
                <th style={{ padding: '10px' }}>{tr('الإجراءات')}</th>
              </tr>
            </thead>
            <tbody>
              {(filteredDeductions || []).map(d => (
                <tr key={d?.id} style={{ borderBottom: `1px solid ${theme?.border || '#334155'}` }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{d?.empName}</td>
                  <td style={{ padding: '10px', color: '#ef4444', fontWeight: 'bold' }}>{d?.amount} {currency}</td>
                  <td style={{ padding: '10px' }}>{d?.reason}</td>
                  <td style={{ padding: '10px', color: theme?.textMuted || '#94a3b8' }}>{d?.date}</td>
                  <td style={{ padding: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveDeduction && handleRemoveDeduction(d?.id, d?.empName, d?.amount)} 
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                      {tr('إعفاء الخصم ↩️')}
                    </button>
                  </td>
                </tr>
              ))}
              {(!filteredDeductions || filteredDeductions.length === 0) && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: theme?.textMuted || '#94a3b8' }}>
                    {tr('لا توجد نتائج مطابقة للبحث.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════════ 3: تبويب الحوافز والمكافآت ════════════════ */}
      {hrSubTab === 'incentives' && (
        <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '16px', border: `1px solid ${theme?.border || '#334155'}`, padding: '25px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#8b5cf6' }}>{tr('🏆 سجل الحوافز والمكافآت والعمولات')}</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={hrIncentivesSearchQuery} 
                onChange={e => setHrIncentivesSearchQuery && setHrIncentivesSearchQuery(e.target.value)} 
                placeholder={tr('🔍 ابحث بالاسم أو رقم الهوية...')} 
                style={{ padding: '8px 12px', borderRadius: '8px', background: theme?.bgMain || '#0f172a', color: theme?.textDark || '#fff', border: `1px solid ${theme?.border || '#334155'}`, outline: 'none', fontSize: '13px', width: '240px' }} 
              />
              <button 
                type="button" 
                onClick={handleExportHRExcel} 
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                تصدير Excel 📊
              </button>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme?.border || '#334155'}` }}>
                <th style={{ padding: '10px' }}>{tr('الموظف')}</th>
                <th style={{ padding: '10px' }}>{tr('المسمى الوظيفي')}</th>
                <th style={{ padding: '10px' }}>{tr('الحافز')}</th>
                <th style={{ padding: '10px' }}>{tr('سبب الحافز')}</th>
                <th style={{ padding: '10px' }}>{tr('نوع العمولة')}</th>
                <th style={{ padding: '10px' }}>{tr('قيمة العمولة')}</th>
                <th style={{ padding: '10px' }}>{tr('التاريخ')}</th>
                <th style={{ padding: '10px' }}>{tr('الإجراءات')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncentiveRecords.map(r => (
                <tr key={r?.id} style={{ borderBottom: `1px solid ${theme?.border || '#334155'}` }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{r?.empName}</td>
                  <td style={{ padding: '10px', color: '#2dd4bf' }}>{r?.empRole}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ background: '#8b5cf620', color: '#8b5cf6', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                      {r?.incentiveType || '-'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: '#10b981', fontWeight: 'bold' }}>{r?.incentiveValue || '-'}</td>
                  <td style={{ padding: '10px' }}>
                    {r?.commissionType ? (
                      <span style={{ background: '#d9770620', color: '#d97706', padding: '3px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                        {tr(r.commissionType)}
                      </span>
                    ) : <span style={{ color: theme?.textMuted || '#94a3b8' }}>-</span>}
                  </td>
                  <td style={{ padding: '10px', color: '#f59e0b', fontWeight: 'bold' }}>{formatCommissionDisplay(r?.commissionValue, r?.commissionType)}</td>
                  <td style={{ padding: '10px', color: theme?.textMuted || '#94a3b8', fontSize: '12px' }}>{r?.date}</td>
                  <td style={{ padding: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveIncentive && handleRemoveIncentive(r?.id)} 
                      style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                      {tr('حذف 🗑️')}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredIncentiveRecords.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '25px', color: theme?.textMuted || '#94a3b8' }}>
                    {(incentiveRecords || []).length === 0
                      ? tr('لم يتم تسجيل أي حوافز أو مكافآت بعد. اضغط على زر "إضافة حافز أو مكافأة +" لبدء التسجيل.')
                      : tr('لا توجد نتائج مطابقة للبحث.')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ════════════════ 4: تبويب الوثائق والتنبيهات ════════════════ */}
      {hrSubTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ background: theme?.cardBg || '#1e293b', borderRadius: '14px', border: `1px solid ${theme?.border || '#334155'}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '17px', color: theme?.textDark || '#fff' }}>{tr('🔔 قائمة تنبيهات وثائق الموظفين')}</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input 
                type="text" 
                value={hrAlertsSearchQuery} 
                onChange={e => setHrAlertsSearchQuery && setHrAlertsSearchQuery(e.target.value)} 
                placeholder={tr('🔍 ابحث بالاسم أو رقم الهوية...')} 
                style={{ padding: '8px 12px', borderRadius: '8px', background: theme?.bgMain || '#0f172a', color: theme?.textDark || '#fff', border: `1px solid ${theme?.border || '#334155'}`, outline: 'none', fontSize: '13px', width: '240px' }} 
              />
              <button 
                type="button" 
                onClick={handleExportHRExcel} 
                style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                تصدير Excel 📊
              </button>
            </div>
          </div>
          
          {(filteredAlerts || []).map(alert => {
            const isExpired = alert?.daysDiff < 0;
            return (
              <div 
                key={alert?.id} 
                style={{ 
                  background: theme?.cardBg || '#1e293b', 
                  borderRadius: '12px', 
                  border: `1px solid ${isExpired ? '#7f1d1d' : (theme?.border || '#334155')}`, 
                  padding: '16px 25px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '900', color: theme?.textDark || '#fff' }}>
                    {alert?.empName}
                  </h4>
                  <span style={{ fontSize: '13px', color: theme?.textMuted || '#94a3b8' }}>
                    {alert?.docType} ({tr('هوية:')} {alert?.empIdNumber})
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
                    {isExpired ? `${tr('منتهي منذ')} ${Math.abs(alert?.daysDiff || 0)} ${tr('يوم')}` : `${tr('يتبقى')} ${alert?.daysDiff || 0} ${tr('يوم')}`}
                  </span>
                </div>
              </div>
            );
          })}
          {(!filteredAlerts || filteredAlerts.length === 0) && (
            <div style={{ background: theme?.cardBg || '#1e293b', padding: '35px', borderRadius: '14px', textAlign: 'center', color: theme?.textMuted || '#94a3b8', border: `1px solid ${theme?.border || '#334155'}` }}>
              {(documentAlerts || []).length === 0
                ? tr('✅ جميع وثائق الموظفين (الإقامة، الشهادة الصحية، العقود) سارية ومحدثة ولا توجد تنبيهات منتهية!')
                : tr('لا توجد نتائج مطابقة للبحث في التنبيهات.')}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HrTab;