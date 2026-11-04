import React from 'react';

const DashboardTab = ({
  user, t, theme, isDark,
  inventoryVal = 0, totalSalesVal = 0, totalPurchasesVal = 0, netProfitVal = 0,
  todaySalesVal = 0, todayInvoices = [],
  lowStockItems = [], lowStockThreshold = 30, setLowStockThreshold, lowStockUnit = 'قطعة', setLowStockUnit,
  monthlyData = [], pastYearsData = [], currentYear = new Date().getFullYear()
}) => {
  // Calculations for donut chart
  const totalFinancials = Math.max(1, (totalSalesVal || 0) + (totalPurchasesVal || 0));
  const salesPercent = Math.min(100, Math.round(((totalSalesVal || 0) / totalFinancials) * 100));
  const purchasesPercent = 100 - salesPercent;
  
  // Circumference for r=70: 2 * Math.PI * 70 ≈ 440
  const circumference = 440;
  const salesStroke = (circumference * salesPercent) / 100;
  const purchasesStroke = circumference - salesStroke;

  const cardShadow = isDark ? '0 10px 30px rgba(0,0,0,0.25)' : '0 8px 30px rgba(0,0,0,0.035)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* ── Main Top Grid: 2 Columns (Main Content + Statistic Sidebar) ── */}
      <div className="dashboard-main-grid" style={{ alignItems: 'start' }}>
        
        {/* ── Left Column: Cards, Quick Actions & Recent Sales ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Cards Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: theme.textDark, letterSpacing: '-0.3px' }}>
              {t.dashboard || 'البطاقات المالية'}
            </h2>
            <span style={{ fontSize: '13px', color: theme.textMuted, cursor: 'pointer', fontWeight: '600' }}>
              عرض الكل
            </span>
          </div>

          {/* Cards Row (Credit Cards Style from image_10.png) */}
          <div className="dashboard-cards-grid">
            
            {/* Card 1: Dark Premium Card (Total Sales) */}
            <div style={{
              background: 'linear-gradient(135deg, #025a7e 0%, #012839 100%)',
              color: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px 26px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 12px 35px rgba(0,0,0,0.2)',
              minHeight: '190px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}>
              {/* Subtle background decoration */}
              <div style={{
                position: 'absolute',
                top: '-40px',
                right: '-40px',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(74, 144, 226, 0.12) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              {/* Card Top: Amount & Options */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    {t.salesTotal || 'إجمالي المبيعات'}
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                    {Number(totalSalesVal || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span style={{ fontSize: '16px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>{t.currency || 'ر.س'}</span>
                  </div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px' }}>
                  ⋮
                </div>
              </div>

              {/* Card Bottom: Card Number & Expiry / Brand */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', letterSpacing: '2px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>•••• 1810</span> <span style={{ fontSize: '11px' }}>▾</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px', display: 'block' }}>
                    {currentYear} / 26
                  </span>
                </div>
                <div style={{ textAlign: 'left', fontWeight: '900', fontSize: '16px', letterSpacing: '1px', color: '#FFFFFF', fontStyle: 'italic', opacity: 0.9 }}>
                  OCTIQEN
                </div>
              </div>
            </div>

            {/* Card 2: Light Elegant Card (Net Profit) */}
            <div style={{
              background: isDark ? 'linear-gradient(135deg, #23252E 0%, #1F2026 100%)' : '#FFFFFF',
              color: theme.textDark,
              borderRadius: '24px',
              padding: '24px 26px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: cardShadow,
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
              minHeight: '190px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}>
              {/* Subtle background decoration */}
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(52, 211, 153, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              {/* Card Top: Amount & Options */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    {t.netProfit || 'صافي الربح التقديري'}
                  </span>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: theme.textDark, letterSpacing: '-0.5px' }}>
                    {Number(netProfitVal || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span style={{ fontSize: '16px', fontWeight: '600', color: '#10B981' }}>{t.currency || 'ر.س'}</span>
                  </div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', color: theme.textMuted }}>
                  ⋮
                </div>
              </div>

              {/* Card Bottom: Card Number & Dual Circle Brand */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: theme.textMuted, letterSpacing: '2px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>•••• 1423</span> <span style={{ fontSize: '11px' }}>▾</span>
                  </div>
                  <span style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', display: 'block' }}>
                    {currentYear} / 26
                  </span>
                </div>
                {/* Mastercard-style overlapping circles */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(110deg, #0e96a9, #025a7e)', opacity: 0.85 }} />
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#00E5FF', marginLeft: '-9px', opacity: 0.85 }} />
                </div>
              </div>
            </div>

          </div>

          {/* Quick Action Pills Row (from image_10.png: Transfer, Utility, Taxes, Transport) */}
          <div className="dashboard-actions-grid">
            
            {/* Pill 1: Transfer (Active Accent) */}
            <button style={{
              background: '#4A90E2',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '999px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(74, 144, 226, 0.28)',
              transition: 'all 0.2s ease'
            }}>
              <span style={{ fontSize: '16px' }}>⇄</span>
              <span>تحويل / مبيعات</span>
            </button>

            {/* Pill 2: Utility */}
            <button style={{
              background: isDark ? '#23252E' : '#FFFFFF',
              color: theme.textDark,
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
              borderRadius: '999px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: cardShadow,
              transition: 'all 0.2s ease'
            }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: isDark ? '#18191E' : '#11151f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>📄</span>
              <span>فواتير وسندات</span>
            </button>

            {/* Pill 3: Taxes */}
            <button style={{
              background: isDark ? '#23252E' : '#FFFFFF',
              color: theme.textDark,
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
              borderRadius: '999px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: cardShadow,
              transition: 'all 0.2s ease'
            }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: isDark ? '#18191E' : '#11151f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>🏛</span>
              <span>الضريبة (15%)</span>
            </button>

            {/* Pill 4: Transport / Operations */}
            <button style={{
              background: isDark ? '#23252E' : '#FFFFFF',
              color: theme.textDark,
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
              borderRadius: '999px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontSize: '13.5px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: cardShadow,
              transition: 'all 0.2s ease'
            }}>
              <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: isDark ? '#18191E' : '#11151f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>🚚</span>
              <span>المخزون والتسليم</span>
            </button>

          </div>

          {/* ── Recent Sales / Transactions Table (from image_10.png) ── */}
          <div style={{
            background: theme.cardBg,
            borderRadius: '24px',
            padding: '24px',
            boxShadow: cardShadow,
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: theme.textDark }}>
                أحدث المبيعات والعمليات (Recent Sales)
              </h3>
              <span style={{ fontSize: '12px', color: theme.textMuted }}>
                {todayInvoices?.length || 0} عملية مسجلة اليوم
              </span>
            </div>

            {/* Transactions Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Header row */}
              <div className="recent-sales-row" style={{ padding: '8px 16px', fontSize: '11.5px', color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>الطرف / العميل</span>
                <span style={{ textAlign: 'center' }}>التاريخ</span>
                <span style={{ textAlign: 'center' }}>الحالة</span>
                <span style={{ textAlign: 'left' }}>المبلغ</span>
              </div>

              {/* Transactions List */}
              {todayInvoices && todayInvoices.length > 0 ? (
                todayInvoices.slice(0, 5).map((inv, idx) => {
                  const clientName = inv.customer?.name || inv.clientName || 'عميل نقدي';
                  const dateStr = inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('ar-SA') : 'اليوم';
                  const isPaid = inv.paymentStatus === 'مدفوعة' || inv.paidAmount >= inv.totalAmount;
                  const isPartial = inv.paymentStatus === 'مدفوعة جزئياً';

                  return (
                    <div key={idx} className="recent-sales-row" style={{
                      alignItems: 'center',
                      padding: '14px 16px',
                      borderRadius: '16px',
                      background: isDark ? 'rgba(255,255,255,0.025)' : '#F9FAFB',
                      transition: 'all 0.2s ease'
                    }}>
                      {/* Client with Circular Avatar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #4A90E2, #70A1FF)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '800',
                          flexShrink: 0
                        }}>
                          {clientName.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: '700', color: theme.textDark }}>{clientName}</div>
                          <div style={{ fontSize: '11px', color: theme.textMuted }}>فاتورة #{inv.invoiceNo || inv.id}</div>
                        </div>
                      </div>

                      {/* Date */}
                      <span style={{ fontSize: '12px', color: theme.textMuted, textAlign: 'center' }}>
                        {dateStr}
                      </span>

                      {/* Pastel Pill Status */}
                      <div style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          borderRadius: '999px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: isPaid ? 'rgba(52, 211, 153, 0.12)' : (isPartial ? 'rgba(251, 191, 36, 0.14)' : 'rgba(248, 113, 113, 0.12)'),
                          color: isPaid ? '#059669' : (isPartial ? '#D97706' : '#DC2626')
                        }}>
                          • {isPaid ? 'مكتمل' : (isPartial ? 'معالجة' : 'معلق')}
                        </span>
                      </div>

                      {/* Amount */}
                      <span style={{ fontSize: '14px', fontWeight: '800', color: theme.textDark, textAlign: 'left' }}>
                        +{Number(inv.totalAmount || 0).toLocaleString()} {t.currency || 'ر.س'}
                      </span>
                    </div>
                  );
                })
              ) : (
                /* Beautiful placeholder items if no today invoices yet */
                [
                  { name: 'مؤسسة الأفق للتجارة', date: 'اليوم، 10:30 ص', status: 'Success', amount: '+1,980.0' },
                  { name: 'شركة السهم الذهبي', date: 'أمس، 04:15 م', status: 'Process', amount: '+880.0' },
                  { name: 'مركز الرضا للتوزيع', date: 'أمس، 01:20 م', status: 'Success', amount: '+1,240.0' }
                ].map((row, idx) => (
                  <div key={idx} className="recent-sales-row" style={{
                    alignItems: 'center',
                    padding: '14px 16px',
                    borderRadius: '16px',
                    background: isDark ? 'rgba(255,255,255,0.025)' : '#F9FAFB'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        background: idx === 0 ? '#4A90E2' : (idx === 1 ? '#34D399' : '#A78BFA'),
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '800'
                      }}>
                        {row.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: '700', color: theme.textDark }}>{row.name}</div>
                        <div style={{ fontSize: '11px', color: theme.textMuted }}>مبيعات نقدية</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: theme.textMuted, textAlign: 'center' }}>{row.date}</span>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: row.status === 'Success' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251, 191, 36, 0.14)',
                        color: row.status === 'Success' ? '#059669' : '#D97706'
                      }}>
                        • {row.status === 'Success' ? 'مكتمل' : 'قيد المعالجة'}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: theme.textDark, textAlign: 'left' }}>
                      {row.amount} {t.currency || 'ر.س'}
                    </span>
                  </div>
                ))
              )}

            </div>
          </div>

        </div>

        {/* ── Right Column: Statistic Sidebar Module (from image_10.png) ── */}
        <div style={{
          background: theme.cardBg,
          borderRadius: '24px',
          padding: '26px',
          boxShadow: cardShadow,
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          
          {/* Header with Title & Filter Pill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: theme.textDark }}>
                الإحصائيات (Statistic)
              </h3>
              <span style={{ fontSize: '13px', color: theme.textMuted }}>ℹ️</span>
            </div>
            <div style={{
              background: isDark ? '#25262D' : '#F4F5F7',
              color: theme.textMuted,
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer'
            }}>
              عام {currentYear} ▾
            </div>
          </div>

          {/* SVG Circular Donut Chart */}
          <div style={{ position: 'relative', width: '190px', height: '190px', margin: '10px auto' }}>
            <svg width="190" height="190" viewBox="0 0 190 190" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background ring */}
              <circle
                cx="95"
                cy="95"
                r="70"
                fill="transparent"
                stroke={isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB'}
                strokeWidth="18"
              />
              {/* Purchases Arc (Dark/Grey) */}
              <circle
                cx="95"
                cy="95"
                r="70"
                fill="transparent"
                stroke="#012839"
                strokeWidth="18"
                strokeDasharray={`${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Sales Arc (Primary Blue Accent) */}
              <circle
                cx="95"
                cy="95"
                r="70"
                fill="transparent"
                stroke="#00E5FF"
                strokeWidth="20"
                strokeDasharray={`${salesStroke} ${purchasesStroke}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Center Label */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '600' }}>
                الإجمالي
              </span>
              <span style={{ fontSize: '18px', fontWeight: '900', color: theme.textDark, marginTop: '2px' }}>
                {Number(totalSalesVal || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span style={{ fontSize: '10px', color: theme.textMuted }}>{t.currency || 'ر.س'}</span>
            </div>

            {/* Floating Value Pill on Donut (like $9,560.0 in image_10.png) */}
            <div style={{
              position: 'absolute',
              top: '25px',
              left: '120px',
              background: '#012839',
              color: '#FFFFFF',
              padding: '3px 9px',
              borderRadius: '999px',
              fontSize: '10.5px',
              fontWeight: '800',
              boxShadow: '0 4px 10px rgba(0,0,0,0.25)'
            }}>
              {salesPercent}%
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11.5px', color: theme.textMuted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#00E5FF' }} />
              <span>مبيعات المتجر</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#012839' }} />
              <span>مشتريات وعمليات</span>
            </div>
          </div>

          {/* Activity List (as in image_10.png: Spotify, Apple, Bitcoin...) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)', paddingTop: '18px' }}>
            
            {/* Activity 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(74, 144, 226, 0.15)', color: '#4A90E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                  🛒
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textDark }}>مبيعات اليوم</div>
                  <div style={{ fontSize: '10.5px', color: theme.textMuted }}>{todayInvoices?.length || 0} فواتير جديدة</div>
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: theme.textDark }}>
                +{Number(todaySalesVal || 0).toLocaleString()} {t.currency || 'ر.س'}
              </span>
            </div>

            {/* Activity 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(52, 211, 153, 0.15)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                  📦
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textDark }}>قيمة المستودع</div>
                  <div style={{ fontSize: '10.5px', color: theme.textMuted }}>تقييم المخزون الحي</div>
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: theme.textDark }}>
                {Number(inventoryVal || 0).toLocaleString()} {t.currency || 'ر.س'}
              </span>
            </div>

            {/* Activity 3 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(251, 191, 36, 0.15)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>
                  📥
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textDark }}>إجمالي المشتريات</div>
                  <div style={{ fontSize: '10.5px', color: theme.textMuted }}>توريدات الموردين</div>
                </div>
              </div>
              <span style={{ fontSize: '13px', fontWeight: '800', color: theme.textDark }}>
                -{Number(totalPurchasesVal || 0).toLocaleString()} {t.currency || 'ر.س'}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ── Low Stock Alert Card ── */}
      <div style={{
        background: lowStockItems.length > 0 ? (isDark ? 'rgba(239, 68, 68, 0.08)' : '#FEF2F2') : theme.cardBg,
        borderRadius: '24px',
        border: lowStockItems.length > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : (isDark ? '1px solid rgba(255,255,255,0.06)' : 'none'),
        padding: '22px 26px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: cardShadow
      }}>
        <div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: lowStockItems.length > 0 ? '#DC2626' : theme.textDark }}>
            {lowStockItems.length > 0 ? `⚠️ ${t('تنبيه: يوجد')} ${lowStockItems.length} ${t('صنف وصل للحد الأدنى للمخزون')} (${lowStockThreshold} ${lowStockUnit} ${t('أو أقل')})` : t.lowStockClean}
          </h4>
          {lowStockItems.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {lowStockItems.map(item => {
                const bSize = Number(item.boxSize || 12);
                const remainingText = lowStockUnit === 'كرتون' ? `${(item.stock / bSize).toFixed(1)} ${t('كرتون')}` : `${item.stock} ${t('حبة')}`;
                return (
                  <span key={item.id} style={{ background: '#DC2626', color: '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: '700' }}>
                    {item.name} ({t('المتبقي:')} {remainingText})
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Setting Controls */}
        <div style={{ background: isDark ? '#25262D' : '#F4F5F7', padding: '8px 16px', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: theme.textMuted }}>{t('تحديد الحد الأدنى:')}</span>
          <input 
            type="number" 
            min="1" 
            value={lowStockThreshold} 
            onChange={e => { 
              const val = Number(e.target.value); 
              setLowStockThreshold(val); 
              localStorage.setItem('mihwar_low_stock_threshold', val); 
            }} 
            style={{ width: '60px', padding: '6px', borderRadius: '999px', border: 'none', background: theme.cardBg, color: theme.textDark, textAlign: 'center', fontWeight: '800', fontSize: '13px', outline: 'none' }} 
          />
          <select 
            value={lowStockUnit} 
            onChange={e => { 
              const u = e.target.value; 
              setLowStockUnit(u); 
              localStorage.setItem('mihwar_low_stock_unit', u); 
            }} 
            style={{ padding: '6px 12px', borderRadius: '999px', border: 'none', background: theme.cardBg, color: theme.textDark, fontWeight: '700', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
            <option value="قطعة">{t('قطعة')}</option>
            <option value="كرتون">{t('كرتون')}</option>
          </select>
        </div>
      </div>

      {/* ── Monthly Sales Analysis ── */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '24px',
        padding: '26px',
        boxShadow: cardShadow,
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : 'none'
      }}>
        <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: '800', color: theme.textDark }}>
          📅 {t('حركة المبيعات الشهرية خلال عام')} {currentYear}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {monthlyData && monthlyData.map((m, idx) => (
            <div key={idx} style={{
              background: isDark ? 'rgba(255,255,255,0.025)' : '#F9FAFB',
              padding: '16px',
              borderRadius: '16px',
              textAlign: 'center',
              border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.02)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', display: 'block', color: theme.textMuted }}>{m.monthName}</span>
              <strong style={{ fontSize: '15px', color: '#10B981', display: 'block', margin: '6px 0' }}>{Number(m.total || 0).toLocaleString(undefined, { minimumFractionDigits: 1 })} {t.currency}</strong>
              <span style={{ fontSize: '11px', color: theme.textMuted }}>{m.count} {t('فواتير')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Annual Financial Comparison Table ── */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '24px',
        padding: '26px',
        boxShadow: cardShadow,
        border: isDark ? '1px solid rgba(255,255,255,0.06)' : 'none',
        overflowX: 'auto'
      }}>
        <h3 style={{ margin: '0 0 18px 0', fontSize: '16px', fontWeight: '800', color: theme.textDark }}>
          {t('📈 المقارنة المالية السنوية (آخر 10 سنوات)')}
        </h3>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', fontSize: '13px', minWidth: '600px' }}>
          <thead>
            <tr style={{ color: theme.textMuted }}>
              <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: '700', fontSize: '11.5px' }}>{t('السنة')}</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: '700', fontSize: '11.5px' }}>{t('عدد الفواتير')}</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: '700', fontSize: '11.5px' }}>{t('إجمالي المبيعات')}</th>
              <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: '700', fontSize: '11.5px' }}>{t('صافي الأرباح التقديري')}</th>
            </tr>
          </thead>
          <tbody>
            {pastYearsData && pastYearsData.map((y, idx) => (
              <tr key={idx} style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB' }}>
                <td style={{ padding: '14px 16px', fontWeight: '800', color: '#4A90E2', borderRadius: '0 12px 12px 0' }}>{t('عام')} {y.year}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center', color: theme.textDark, fontWeight: '600' }}>{y.count}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center', color: '#10B981', fontWeight: '800' }}>{Number(y.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 1 })} {t.currency}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center', color: '#38BDF8', fontWeight: '800', borderRadius: '12px 0 0 12px' }}>{Number(y.totalProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 1 })} {t.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default DashboardTab;
