const DashboardTab = ({
  user, t, theme, isDark,
  inventoryVal, totalSalesVal, totalPurchasesVal, netProfitVal,
  todaySalesVal, todayInvoices,
  lowStockItems, lowStockThreshold, setLowStockThreshold, lowStockUnit, setLowStockUnit,
  monthlyData, pastYearsData, currentYear
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div><h2 style={{ margin: '0 0 5px 0', fontSize: '22px', fontWeight: '900' }}>{t.welcome} {user?.name} 👋</h2><p style={{ margin: 0, color: theme.textMuted, fontSize: '14px' }}>{t(`مرحباً بك في لوحة التحكم المركزية لنظام محور.`)}</p></div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.invValue}</p><h2 style={{ color: '#d97706', margin: '8px 0 0 0', fontSize: '22px' }}>{inventoryVal.toLocaleString()} {t.currency}</h2></div>
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.salesTotal}</p><h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '22px' }}>{totalSalesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.purchasesTotal}</p><h2 style={{ color: '#f59e0b', margin: '8px 0 0 0', fontSize: '22px' }}>{totalPurchasesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid ${theme.border}` }}><p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t.netProfit}</p><h2 style={{ color: '#10b981', margin: '8px 0 0 0', fontSize: '22px' }}>{netProfitVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2></div>
        
        <div style={{ background: theme.cardBg, padding: '22px', borderRadius: '14px', border: `1px solid #38bdf844` }}>
          <p style={{ margin: 0, color: theme.textMuted, fontSize: '13px' }}>{t(`إجمالي مبيعات اليوم (شامل الضريبة)`)}</p>
          <h2 style={{ color: '#38bdf8', margin: '8px 0 0 0', fontSize: '22px' }}>{todaySalesVal.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</h2>
          <span style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', display: 'block' }}>({todayInvoices?.length || 0} فواتير تم إصدارها اليوم)</span>
        </div>
      </div>

      {/* بطاقة فحص مستويات المخزون مع تحديد الوحدة */}
      <div style={{ background: lowStockItems.length > 0 ? '#7f1d1d22' : theme.cardBg, borderRadius: '16px', border: `1px solid ${lowStockItems.length > 0 ? '#7f1d1d' : theme.border}`, padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: lowStockItems.length > 0 ? '#fca5a5' : theme.textDark }}>
            {lowStockItems.length > 0 ? `⚠️ تنبيه: يوجد ${lowStockItems.length} صنف وصل للحد الأدنى للمخزون (${lowStockThreshold} ${lowStockUnit} أو أقل)` : t.lowStockClean}
          </h3>
          {lowStockItems.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              {lowStockItems.map(item => {
                const bSize = Number(item.boxSize || 12);
                const remainingText = lowStockUnit === 'كرتون' ? `${(item.stock / bSize).toFixed(1)} كرتون` : `${item.stock} حبة`;
                return (
                  <span key={item.id} style={{ background: '#7f1d1d', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                    {item.name} (المتبقي: {remainingText})
                  </span>
                );
              })}
            </div>
          )}
        </div>
        
        <div style={{ background: theme.bgMain, padding: '10px 16px', borderRadius: '10px', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{t(`تحديد الحد الأدنى:`)}</span>
          <input 
            type="number" 
            min="1" 
            value={lowStockThreshold} 
            onChange={e => { 
              const val = Number(e.target.value); 
              setLowStockThreshold(val); 
              localStorage.setItem('mihwar_low_stock_threshold', val); 
            }} 
            style={{ width: '65px', padding: '6px', borderRadius: '6px', border: '1px solid #d97706', background: theme.cardBg, color: theme.textDark, textAlign: 'center', fontWeight: 'bold', fontSize: '14px', outline: 'none' }} 
          />
          <select 
            value={lowStockUnit} 
            onChange={e => { 
              const u = e.target.value; 
              setLowStockUnit(u); 
              localStorage.setItem('mihwar_low_stock_unit', u); 
            }} 
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #d97706', background: theme.cardBg, color: theme.textDark, fontWeight: 'bold', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
            <option value="قطعة">{t(`قطعة`)}</option>
            <option value="كرتون">{t(`كرتون`)}</option>
          </select>
        </div>
      </div>

      {/* حركة المبيعات الشهرية */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '17px', color: theme.textDark }}>
          📅 حركة المبيعات الشهرية خلال عام {currentYear}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {monthlyData.map((m, idx) => (
            <div key={idx} style={{ background: theme.bgMain, padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, textAlign: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', color: theme.textMuted }}>{m.monthName}</span>
              <strong style={{ fontSize: '16px', color: '#10b981', display: 'block', margin: '6px 0' }}>{m.total.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</strong>
              <span style={{ fontSize: '11px', color: theme.textMuted }}>{m.count} فواتير</span>
            </div>
          ))}
        </div>
      </div>

      {/* المقارنة المالية السنوية */}
      <div style={{ background: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.border}`, padding: '25px', overflowX: 'auto' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '17px', color: theme.textDark }}>
          {t(`📈 المقارنة المالية السنوية (آخر 10 سنوات)`)}
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
          <thead>
            <tr style={{ background: isDark ? '#141824' : '#f8fafc', borderBottom: `2px solid ${theme.border}` }}>
              <th style={{ padding: '12px', textAlign: 'right' }}>{t(`السنة`)}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{t(`عدد الفواتير`)}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{t(`إجمالي المبيعات`)}</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>{t(`صافي الأرباح التقديري`)}</th>
            </tr>
          </thead>
          <tbody>
            {pastYearsData.map((y, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${theme.border}` }}>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#d97706' }}>عام {y.year}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{y.count}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: 'bold' }}>{y.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#38bdf8', fontWeight: 'bold' }}>{y.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })} {t.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardTab;

