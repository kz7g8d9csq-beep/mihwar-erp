const InvoicesListTab = ({
  t, theme, isDark, lang,
  filteredInvoices,
  invoiceSearchQuery, setInvoiceSearchQuery,
  handleExportSales,
  setPrintingInvoice,
  handleOpenPayConfirm,
  handleSendWhatsAppReminder,
  dueSoonInvoicesCount,
  getDueDateDaysLeft
}) => {
  return (
    <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
      
      {dueSoonInvoicesCount > 0 && (
        <div style={{ background: '#064e3b22', border: '1px solid #25D366', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔔</span>
            <span style={{ fontSize: '13px', color: '#25D366', fontWeight: 'bold' }}>
              نظام تذكيرات الواتساب: يوجد {dueSoonInvoicesCount} فواتير غير مدفوعة ومتبقي على استحقاقها 3 أيام أو أقل. يمكنك إرسال التذكيرات مباشرة ولن تتوقف حتى تضغط "تم الدفع".
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>📑 سجل فواتير المبيعات</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input type="text" value={invoiceSearchQuery} onChange={e => setInvoiceSearchQuery(e.target.value)} placeholder="🔍 ابحث برقم الفاتورة أو العميل..." style={{ padding: '8px 12px', borderRadius: '8px', background: theme.bgMain, color: theme.textDark, border: `1px solid ${theme.border}`, outline: 'none', fontSize: '13px', width: '240px' }} />
          <button onClick={handleExportSales} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>تصدير إلى Excel 📥</button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '750px' }}>
        <thead>
          <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
            <th style={{ padding: '12px' }}>رقم الفاتورة</th>
            <th style={{ padding: '12px' }}>العميل</th>
            <th style={{ padding: '12px' }}>المبلغ الإجمالي</th>
            <th style={{ padding: '12px' }}>حالة الدفع والاستحقاق</th>
            <th style={{ padding: '12px' }}>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map(inv => {
            const isUnpaid = inv?.paymentStatus === 'غير مدفوعة';
            const daysLeft = getDueDateDaysLeft(inv?.dueDate);
            const isDueSoon = isUnpaid && daysLeft !== null && daysLeft <= 3;

            return (
              <tr key={inv?.id || Math.random()} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>#{inv?.invoiceNo || '-'}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ fontWeight: 'bold' }}>{inv?.customer?.name || 'عميل نقدي'}</span>
                  {inv?.customer?.phone && <div style={{ fontSize: '11px', color: theme.textMuted }}>{inv.customer.phone}</div>}
                </td>
                <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>{inv?.totalAmount || '0.00'} {t.currency}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: isUnpaid ? '#7f1d1d' : '#065f46', color: isUnpaid ? '#fca5a5' : '#6ee7b7', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '11px' }}>
                    {inv?.paymentStatus || 'مدفوعة'}
                  </span>
                  {isUnpaid && inv?.dueDate && (
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                      الاستحقاق: {inv.dueDate} {daysLeft !== null && <span style={{ color: daysLeft <= 0 ? '#ef4444' : '#38bdf8', fontWeight: 'bold' }}>({daysLeft <= 0 ? 'مستحقة' : `متبقي ${daysLeft} يوم`})</span>}
                    </div>
                  )}
                  {isDueSoon && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ background: '#064e3b44', color: '#25D366', border: '1px solid #25D366', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                        تذكير واتساب نشط 📲
                      </span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button onClick={() => setPrintingInvoice(inv)} style={{ background: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>معاينة وطباعة 👁️</button>
                    
                    {/* زر الواتساب يظهر لكل فاتورة غير مدفوعة ولا يتوقف حتى يتم الضغط على تم الدفع */}
                    {isUnpaid && (
                      <button 
                        type="button"
                        onClick={() => handleSendWhatsAppReminder(inv)}
                        title={lang === 'ar' ? 'إرسال تذكير الفاتورة عبر واتساب' : 'Send invoice reminder via WhatsApp'}
                        style={{ background: '#25D366', color: '#fff', border: 'none', padding: '6px 11px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>واتساب 💬</span>
                      </button>
                    )}

                    {isUnpaid && (<button onClick={() => handleOpenPayConfirm(inv?.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>تم الدفع ✓</button>)}
                  </div>
                </td>
              </tr>
            );
          })}
          {!filteredInvoices.length && (
            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: theme.textMuted }}>لا توجد فواتير مبيعات مسجلة بعد.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesListTab;

