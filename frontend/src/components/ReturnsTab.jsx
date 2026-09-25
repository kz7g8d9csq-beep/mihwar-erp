import React, { useState, useEffect } from 'react';

const ReturnsTab = ({
  theme = {},
  isDark = true,
  invoices = [],
  setInvoices,
  purchaseInvoices = [],
  setPurchaseInvoices,
  inventory = [],
  setInventory
}) => {
  const [activeSubTab, setActiveSubTab] = useState('salesReturns');
  
  const [salesReturns, setSalesReturns] = useState([]);
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  
  const [searchInvoiceNo, setSearchInvoiceNo] = useState('');
  const [foundInvoice, setFoundInvoice] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [returnMethod, setReturnMethod] = useState('نقد');
  const [printingReturn, setPrintingReturn] = useState(null);

  const getCleanDate = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + min;
  };

  useEffect(() => {
    try {
      const cleanData = (dataArray) => {
        if (!Array.isArray(dataArray)) return [];
        return dataArray.map(item => {
          let cleanDate = item && item.date ? item.date : '';
          if (!cleanDate || cleanDate.includes('now.') || cleanDate.includes('${') || cleanDate.includes('String(')) {
            cleanDate = getCleanDate();
          }
          return {
            ...item,
            date: cleanDate,
            status: item.status || 'completed'
          };
        });
      };

      const savedSales = localStorage.getItem('mihwar_sales_returns');
      if (savedSales) {
        const parsed = JSON.parse(savedSales);
        const cleaned = cleanData(parsed);
        setSalesReturns(cleaned);
        localStorage.setItem('mihwar_sales_returns', JSON.stringify(cleaned));
      }
      
      const savedPurchases = localStorage.getItem('mihwar_purchase_returns');
      if (savedPurchases) {
        const parsed = JSON.parse(savedPurchases);
        const cleaned = cleanData(parsed);
        setPurchaseReturns(cleaned);
        localStorage.setItem('mihwar_purchase_returns', JSON.stringify(cleaned));
      }
    } catch (e) {
      console.error('Error loading returns data:', e);
    }
  }, []);

  const handleSearch = () => {
    if (!searchInvoiceNo.trim()) return;
    setFoundInvoice(null);
    setReturnItems({});
    
    const query = searchInvoiceNo.trim();
    if (activeSubTab === 'salesReturns') {
      const inv = invoices.find(i => String(i.invoiceNo) === query || String(i.id) === query);
      if (inv) {
        setFoundInvoice(inv);
      } else {
        alert('لم يتم العثور على فاتورة مبيعات بهذا الرقم.');
      }
    } else {
      const inv = purchaseInvoices.find(i => String(i.invoiceNo) === query || String(i.id) === query);
      if (inv) {
        setFoundInvoice(inv);
      } else {
        alert('لم يتم العثور على فاتورة مشتريات بهذا الرقم.');
      }
    }
  };

  const handleQtyChange = (idx, maxQty, val) => {
    let q = Number(val);
    if (isNaN(q) || q < 0) q = 0;
    if (q > maxQty) q = maxQty;
    
    setReturnItems(prev => ({
      ...prev,
      [idx]: q
    }));
  };

  const handleProcessReturn = () => {
    if (!foundInvoice) return;
    
    const itemsToReturn = [];
    let totalReturnAmount = 0;
    
    const invoiceItems = foundInvoice.items || (activeSubTab === 'purchaseReturns' && foundInvoice.productName ? [
      {
        product: { id: foundInvoice.productId, name: foundInvoice.productName },
        quantity: foundInvoice.quantity,
        unitPrice: foundInvoice.totalAmount / foundInvoice.quantity,
        unitType: foundInvoice.unitType
      }
    ] : []);
    
    invoiceItems.forEach((item, idx) => {
      const rq = returnItems[idx] || 0;
      if (rq > 0) {
        const itemPrice = item.unitPrice || (item.totalAmount ? item.totalAmount / item.quantity : 0);
        const subtotal = rq * itemPrice;
        itemsToReturn.push({
          productName: (item.product && item.product.name) || item.name || item.productName || 'منتج',
          productId: item.productId || (item.product && item.product.id),
          returnedQty: rq,
          unitType: item.unitType || 'حبة',
          unitPrice: itemPrice,
          subtotal: subtotal
        });
        totalReturnAmount += subtotal;
      }
    });

    if (itemsToReturn.length === 0) {
      alert('الرجاء تحديد كمية مرتجعة لصنف واحد على الأقل.');
      return;
    }

    const party = (foundInvoice.customer && foundInvoice.customer.name) || 
                  foundInvoice.customerName || 
                  foundInvoice.clientName || 
                  (foundInvoice.supplier && foundInvoice.supplier.name) || 
                  foundInvoice.supplierName || 
                  (typeof foundInvoice.customer === 'string' ? foundInvoice.customer : '') ||
                  (typeof foundInvoice.supplier === 'string' ? foundInvoice.supplier : '') ||
                  (activeSubTab === 'salesReturns' ? 'عميل نقدي' : 'مورد عام');

    const dateString = getCleanDate();
    
    const returnRecord = {
      returnId: 'RET-' + Date.now().toString().slice(-6),
      originalInvoice: foundInvoice.invoiceNo || foundInvoice.id,
      partyName: party,
      date: dateString,
      items: itemsToReturn,
      totalAmount: totalReturnAmount,
      method: returnMethod,
      status: 'pending'
    };

    if (activeSubTab === 'salesReturns') {
      const updated = [returnRecord, ...salesReturns];
      setSalesReturns(updated);
      localStorage.setItem('mihwar_sales_returns', JSON.stringify(updated));

      if (setInvoices) {
        const updatedInvoices = invoices.map(inv => {
          if (String(inv.id) === String(foundInvoice.id) || String(inv.invoiceNo) === String(foundInvoice.invoiceNo)) {
            return { ...inv, paymentStatus: 'قيد الاسترجاع' };
          }
          return inv;
        });
        setInvoices(updatedInvoices);
        localStorage.setItem('mihwar_invoices', JSON.stringify(updatedInvoices));
      }
    } else {
      const updated = [returnRecord, ...purchaseReturns];
      setPurchaseReturns(updated);
      localStorage.setItem('mihwar_purchase_returns', JSON.stringify(updated));

      if (setPurchaseInvoices) {
        const updatedPurchases = purchaseInvoices.map(inv => {
          if (String(inv.id) === String(foundInvoice.id) || String(inv.invoiceNo) === String(foundInvoice.invoiceNo)) {
            return { ...inv, paymentStatus: 'قيد الاسترجاع' };
          }
          return inv;
        });
        setPurchaseInvoices(updatedPurchases);
        localStorage.setItem('mihwar_purchase_invoices', JSON.stringify(updatedPurchases));
      }
    }

    alert('تم تسجيل العملية بنجاح بحالة (قيد الإرجاع). يمكنك اعتمادها من جدول المرتجعات السابقة أدناه.');
    setFoundInvoice(null);
    setReturnItems({});
    setSearchInvoiceNo('');
  };

  const handleConfirmReturn = (returnItem) => {
    if (returnItem.status === 'completed') return;

    const isConfirmed = window.confirm('هل أنت متأكد من تأكيد عملية الإرجاع (' + returnItem.returnId + ') نهائياً؟\nسيتم تحديث كميات المخزون وتغيير حالة الفاتورة إلى (تم الاسترجاع).');
    if (!isConfirmed) return;

    const isSales = activeSubTab === 'salesReturns';
    const actionDate = getCleanDate();

    let currentInventory = [...inventory];
    if (currentInventory.length === 0) {
      try {
        currentInventory = JSON.parse(localStorage.getItem('mihwar_inventory') || '[]');
      } catch (e) {}
    }

    returnItem.items.forEach(retProd => {
      const pIndex = currentInventory.findIndex(p => 
        (retProd.productId && Number(p.id) === Number(retProd.productId)) || 
        (p.name && p.name === retProd.productName)
      );

      if (pIndex !== -1) {
        const prod = currentInventory[pIndex];
        const multiplier = retProd.unitType === 'كرتون' ? (prod.boxSize || 12) : 1;
        const qtyAdjust = retProd.returnedQty * multiplier;

        if (isSales) {
          currentInventory[pIndex] = { ...prod, stock: (Number(prod.stock) || 0) + qtyAdjust };
        } else {
          currentInventory[pIndex] = { ...prod, stock: Math.max(0, (Number(prod.stock) || 0) - qtyAdjust) };
        }
      }
    });

    if (setInventory) setInventory(currentInventory);
    localStorage.setItem('mihwar_inventory', JSON.stringify(currentInventory));

    if (isSales) {
      let currentInvoices = [...invoices];
      if (currentInvoices.length === 0) {
        try { currentInvoices = JSON.parse(localStorage.getItem('mihwar_invoices') || '[]'); } catch (e) {}
      }
      const updatedInvoices = currentInvoices.map(inv => {
        if (String(inv.invoiceNo) === String(returnItem.originalInvoice) || String(inv.id) === String(returnItem.originalInvoice)) {
          return {
            ...inv,
            paymentStatus: 'تم الاسترجاع',
            returnDate: actionDate
          };
        }
        return inv;
      });
      if (setInvoices) setInvoices(updatedInvoices);
      localStorage.setItem('mihwar_invoices', JSON.stringify(updatedInvoices));

      const updatedSalesReturns = salesReturns.map(r => r.returnId === returnItem.returnId ? { ...r, status: 'completed' } : r);
      setSalesReturns(updatedSalesReturns);
      localStorage.setItem('mihwar_sales_returns', JSON.stringify(updatedSalesReturns));
    } else {
      let currentPurchases = [...purchaseInvoices];
      if (currentPurchases.length === 0) {
        try { currentPurchases = JSON.parse(localStorage.getItem('mihwar_purchase_invoices') || '[]'); } catch (e) {}
      }
      const updatedPurchases = currentPurchases.map(inv => {
        if (String(inv.invoiceNo) === String(returnItem.originalInvoice) || String(inv.id) === String(returnItem.originalInvoice)) {
          return {
            ...inv,
            paymentStatus: 'تم الاسترجاع',
            returnDate: actionDate
          };
        }
        return inv;
      });
      if (setPurchaseInvoices) setPurchaseInvoices(updatedPurchases);
      localStorage.setItem('mihwar_purchase_invoices', JSON.stringify(updatedPurchases));

      const updatedPurchasesReturns = purchaseReturns.map(r => r.returnId === returnItem.returnId ? { ...r, status: 'completed' } : r);
      setPurchaseReturns(updatedPurchasesReturns);
      localStorage.setItem('mihwar_purchase_returns', JSON.stringify(updatedPurchasesReturns));
    }

    alert('تم اعتماد الإرجاع بنجاح وتحديث المخزون والفاتورة.');
  };

  const handleExport = () => {
    const isSales = activeSubTab === 'salesReturns';
    const list = isSales ? salesReturns : purchaseReturns;
    if (!list || list.length === 0) {
      alert('لا توجد بيانات مرتجعات للتصدير');
      return;
    }

    const partyLabel = isSales ? 'اسم العميل' : 'اسم المورد';
    const systemTitle = isSales ? 'نظام محور • سجل مرتجعات المبيعات' : 'نظام محور • سجل مرتجعات المشتريات';
    const exportDate = getCleanDate();

    let tableRows = '';
    list.forEach((item, idx) => {
      const bgColor = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
      const retId = item.returnId || item.id || '';
      const origInv = item.originalInvoice || item.invoiceId || '';
      const party = item.partyName || 'عام';
      const dateVal = item.date || '';
      const amount = Number(item.totalAmount || 0).toFixed(2) + ' ر.س';
      const methodVal = item.method || 'نقداً';
      const statusText = item.status === 'completed' ? 'تم الإرجاع' : 'قيد الإرجاع';
      const statusColor = item.status === 'completed' ? '#16a34a' : '#d97706';
      
      const itemsList = (item.items || []).map(i => {
        const pName = i.productName || i.name || 'منتج';
        const q = i.returnedQty || i.quantity || 0;
        return pName + ' (' + q + ')';
      }).join(' - ');

      tableRows += '<tr style="background-color: ' + bgColor + ';">' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: #dc2626;">' + retId + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">#' + origInv + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right; font-weight: bold;">' + party + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">' + dateVal + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold;">' + amount + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center;">' + methodVal + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: center; font-weight: bold; color: ' + statusColor + ';">' + statusText + '</td>' +
        '<td style="border: 1px solid #cbd5e1; padding: 10px; text-align: right;">' + itemsList + '</td>' +
      '</tr>';
    });

    const excelTemplate = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">' +
      '<head>' +
        '<meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">' +
        '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
        '<x:Name>' + (isSales ? 'مرتجعات المبيعات' : 'مرتجعات المشتريات') + '</x:Name>' +
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
              '<th colspan="8" style="background-color: #1e293b; color: #ffffff; font-size: 18px; padding: 16px; text-align: center; font-weight: bold;">' + systemTitle + '</th>' +
            '</tr>' +
            '<tr>' +
              '<th colspan="8" style="background-color: #334155; color: #e2e8f0; font-size: 12px; padding: 8px; text-align: center;">تاريخ التصدير: ' + exportDate + ' | وثيقة معتمدة ومصدرة آلياً من النظام</th>' +
            '</tr>' +
            '<tr style="background-color: #e2e8f0;">' +
              '<th style="min-width: 140px;">رقم المرتجع</th>' +
              '<th style="min-width: 130px;">الفاتورة الأصلية</th>' +
              '<th style="min-width: 180px;">' + partyLabel + '</th>' +
              '<th style="min-width: 170px;">التاريخ</th>' +
              '<th style="min-width: 140px;">إجمالي القيمة</th>' +
              '<th style="min-width: 110px;">طريقة التسوية</th>' +
              '<th style="min-width: 120px;">حالة الإرجاع</th>' +
              '<th style="min-width: 260px;">الأصناف المسترجعة</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</body>' +
    '</html>';

    const blob = new Blob(['\ufeff' + excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = (isSales ? 'سجل_مرتجعات_المبيعات' : 'سجل_مرتجعات_المشتريات') + '_' + Date.now() + '.xls';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentThemeBorder = theme.border || '#334155';
  const currentCardBg = theme.cardBg || '#1e293b';
  const currentBgMain = theme.bgMain || '#0f172a';
  const currentTextDark = theme.textDark || '#fff';
  const currentTextMuted = theme.textMuted || '#94a3b8';

  return (
    <div style={{ background: currentCardBg, borderRadius: '16px', border: '1px solid ' + currentThemeBorder, padding: '25px', color: currentTextDark }}>
      
      <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid ' + currentThemeBorder, paddingBottom: '15px', marginBottom: '20px' }}>
        <button 
          onClick={() => { setActiveSubTab('salesReturns'); setFoundInvoice(null); setSearchInvoiceNo(''); }} 
          style={{ background: activeSubTab === 'salesReturns' ? '#d97706' : 'transparent', color: activeSubTab === 'salesReturns' ? '#fff' : currentTextMuted, border: activeSubTab === 'salesReturns' ? 'none' : '1px solid ' + currentThemeBorder, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          مرتجعات المبيعات 📉
        </button>
        <button 
          onClick={() => { setActiveSubTab('purchaseReturns'); setFoundInvoice(null); setSearchInvoiceNo(''); }} 
          style={{ background: activeSubTab === 'purchaseReturns' ? '#d97706' : 'transparent', color: activeSubTab === 'purchaseReturns' ? '#fff' : currentTextMuted, border: activeSubTab === 'purchaseReturns' ? 'none' : '1px solid ' + currentThemeBorder, padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          مرتجعات المشتريات 📦
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>
          {activeSubTab === 'salesReturns' ? 'إدارة مرتجعات المبيعات' : 'إدارة مرتجعات المشتريات'}
        </h2>
        <button onClick={handleExport} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          تصدير إكسيل 📊
        </button>
      </div>

      <div style={{ background: currentBgMain, padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid ' + currentThemeBorder, display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>رقم الفاتورة الأصلية:</label>
          <input 
            type="text" 
            value={searchInvoiceNo} 
            onChange={e => setSearchInvoiceNo(e.target.value)} 
            placeholder="أدخل رقم الفاتورة للبحث..." 
            style={{ width: '100%', padding: '11px', borderRadius: '8px', background: currentCardBg, color: currentTextDark, border: '1px solid ' + currentThemeBorder, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button onClick={handleSearch} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '11px 22px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '42px' }}>
          بحث 🔍
        </button>
      </div>

      {foundInvoice && (
        <div style={{ background: currentBgMain, padding: '20px', borderRadius: '12px', marginBottom: '30px', border: '1px solid ' + currentThemeBorder }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#3b82f6' }}>
              الفاتورة الأصلية: #{foundInvoice.invoiceNo || foundInvoice.id}
            </h3>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: currentTextMuted }}>
              الطرف: {(foundInvoice.customer && foundInvoice.customer.name) || foundInvoice.customerName || (foundInvoice.supplier && foundInvoice.supplier.name) || foundInvoice.supplierName || 'عام'}
            </span>
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
            <thead>
              <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: '2px solid ' + currentThemeBorder }}>
                <th style={{ padding: '10px', textAlign: 'right' }}>الصنف</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>سعر الوحدة</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>الكمية المشتراة/المباعة</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>الكمية المرتجعة</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const invoiceItems = foundInvoice.items || (activeSubTab === 'purchaseReturns' && foundInvoice.productName ? [
                  {
                    product: { id: foundInvoice.productId, name: foundInvoice.productName },
                    quantity: foundInvoice.quantity,
                    unitPrice: foundInvoice.totalAmount / foundInvoice.quantity,
                    unitType: foundInvoice.unitType
                  }
                ] : []);

                return invoiceItems.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid ' + currentThemeBorder }}>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                      {(item.product && item.product.name) || item.name || item.productName || 'منتج'}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      {Number(item.unitPrice || (item.totalAmount ? item.totalAmount / item.quantity : 0)).toFixed(2)} ر.س
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <input 
                        type="number" 
                        min="0" 
                        max={item.quantity} 
                        value={returnItems[idx] || ''} 
                        onChange={e => handleQtyChange(idx, item.quantity, e.target.value)} 
                        placeholder="0" 
                        style={{ width: '80px', padding: '6px', borderRadius: '6px', background: currentCardBg, color: currentTextDark, border: '1px solid ' + currentThemeBorder, textAlign: 'center', outline: 'none' }}
                      />
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>طريقة تسوية المرتجع:</label>
              <select value={returnMethod} onChange={e => setReturnMethod(e.target.value)} style={{ padding: '10px', borderRadius: '8px', background: currentCardBg, color: currentTextDark, border: '1px solid ' + currentThemeBorder, outline: 'none' }}>
                <option value="نقد">نقد</option>
                <option value="شبكة">شبكة</option>
                <option value="حوالة">حوالة بنكية</option>
                <option value="رصيد دائن">رصيد حساب</option>
              </select>
            </div>
            <button onClick={handleProcessReturn} style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '11px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', flex: 1, minWidth: '180px' }}>
              تسجيل طلب الإرجاع 🔄
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>سجل المرتجعات السابقة</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: '2px solid ' + currentThemeBorder }}>
              <th style={{ padding: '12px', textAlign: 'right' }}>رقم المرتجع</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>الفاتورة</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>{activeSubTab === 'salesReturns' ? 'العميل' : 'المورد'}</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>التاريخ</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>القيمة (ر.س)</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>التسوية</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>حالة الإرجاع</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {(activeSubTab === 'salesReturns' ? salesReturns : purchaseReturns).map((ret, i) => (
              <tr key={i} style={{ borderBottom: '1px solid ' + currentThemeBorder }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#ef4444' }}>{ret.returnId}</td>
                <td style={{ padding: '12px' }}>#{ret.originalInvoice}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{ret.partyName || '-'}</td>
                <td style={{ padding: '12px', color: currentTextMuted }}>{ret.date}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{Number(ret.totalAmount || 0).toFixed(2)}</td>
                <td style={{ padding: '12px' }}>{ret.method}</td>
                
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {ret.status === 'completed' ? (
                    <span style={{ background: '#10b981', color: '#fff', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'inline-block' }}>
                      تم الإرجاع ✅
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleConfirmReturn(ret)}
                      style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)' }}
                      title="اضغط هنا لتأكيد الإرجاع وتحديث المخزون والفاتورة"
                    >
                      قيد الإرجاع ⏳ (اضغط للتأكيد)
                    </button>
                  )}
                </td>

                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button onClick={() => setPrintingReturn(ret)} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>
                    معاينة وطباعة 🖨️
                  </button>
                </td>
              </tr>
            ))}
            {(activeSubTab === 'salesReturns' ? salesReturns : purchaseReturns).length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: currentTextMuted }}>
                  لا توجد مرتجعات مسجلة في هذا القسم.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {printingReturn && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '10px' }}>
          <div style={{ background: '#fff', color: '#0f172a', padding: '30px', borderRadius: '16px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="no-print-zone" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '15px', marginBottom: '20px' }}>
              <button onClick={() => window.print()} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                طباعة الإشعار 🖨️
              </button>
              <button onClick={() => setPrintingReturn(null)} style={{ background: '#334155', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>
                إغلاق
              </button>
            </div>

            <div id="zatca-printable-invoice" style={{ background: '#fff', color: '#000', padding: '20px', boxSizing: 'border-box', fontFamily: 'Cairo, Tahoma, sans-serif' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '15px', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', color: '#0f172a' }}>
                  {activeSubTab === 'salesReturns' ? 'إشعار دائن (مرتجع مبيعات)' : 'إشعار مدين (مرتجع مشتريات)'}
                </h2>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#64748b' }}>إشعار رقم: {printingReturn.returnId}</p>
                <span style={{ display: 'inline-block', marginTop: '5px', padding: '3px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', background: printingReturn.status === 'completed' ? '#dcfce7' : '#fef3c7', color: printingReturn.status === 'completed' ? '#15803d' : '#b45309' }}>
                  الحالة: {printingReturn.status === 'completed' ? 'معتمد (تم الإرجاع)' : 'قيد الإرجاع (معلق)'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '14px' }}>
                <div>
                  <p style={{ margin: '3px 0' }}><strong>رقم الفاتورة الأصلية:</strong> #{printingReturn.originalInvoice}</p>
                  <p style={{ margin: '3px 0' }}><strong>{activeSubTab === 'salesReturns' ? 'العميل:' : 'المورد:'}</strong> {printingReturn.partyName}</p>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: '3px 0' }}><strong>التاريخ:</strong> {printingReturn.date}</p>
                  <p style={{ margin: '3px 0' }}><strong>طريقة التسوية:</strong> {printingReturn.method}</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#fff' }}>
                    <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #cbd5e1' }}>الصنف</th>
                    <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1' }}>الكمية المسترجعة</th>
                    <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #cbd5e1' }}>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {(printingReturn.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #cbd5e1' }}>{it.productName || it.name}</td>
                      <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #cbd5e1' }}>{it.returnedQty} {it.unitType ? '(' + it.unitType + ')' : ''}</td>
                      <td style={{ padding: '10px', textAlign: 'left', border: '1px solid #cbd5e1', fontWeight: 'bold' }}>{Number(it.subtotal || 0).toFixed(2)} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ textAlign: 'left', fontSize: '16px', fontWeight: 'bold', borderTop: '2px solid #e2e8f0', paddingTop: '15px', color: '#d97706' }}>
                إجمالي قيمة المرتجع: {Number(printingReturn.totalAmount || 0).toFixed(2)} ر.س
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsTab;