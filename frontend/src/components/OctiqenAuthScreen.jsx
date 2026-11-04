import React, { useState } from 'react';

function Icon({ name, size = 20, className = '' }) {
  const p = {
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    'eye-off': (
      <>
        <path d="m3 3 18 18M9.5 5.3A12 12 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.5 4.5M6 6.5A18 18 0 0 0 2 12s3.5 7 10 7a12 12 0 0 0 5-1.1M10 10a3 3 0 0 0 4 4" />
      </>
    ),
    phone: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M10 18h4" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <ellipse cx="12" cy="12" rx="4" ry="9" />
        <path d="M3 12h18M5 6.5h14M5 17.5h14" />
      </>
    ),
    accounting: (
      <>
        <path d="M3 15h4v6H3zm7-5h4v11h-4zm7-6h4v17h-4z" />
        <path d="M19 1v1" />
      </>
    ),
    inventory: (
      <>
        <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
        <path d="m3 7 9 5 9-5M12 12v10M7.5 4.5l9 5" />
      </>
    ),
    purchases: (
      <>
        <path d="M2 3h3l3 13h11l3-10H6M9 19h.01M18 19h.01" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    sales: (
      <>
        <path d="M5 2h10l4 4v16H5V2Zm10 0v5h4M8 10h8M8 14h8M8 18h8" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-3a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v3H2ZM17 3a4 4 0 0 1 0 8m2 3a5 5 0 0 1 3 5v2h-3" />
      </>
    ),
    building: (
      <>
        <path d="M3 22V9h6M9 22V2h9v20M18 12h4v10M1 22h23M12 6h3M12 10h3M12 14h3M12 18h3M5 12v1m0 3v1" />
      </>
    ),
    shield: (
      <>
        <path d="m12 2 9 4v6c0 5-5 9-9 11-4-2-9-6-9-11V6l9-4Z" />
        <path d="m7 12 3 3 7-7" />
      </>
    ),
    otp: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    )
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {p[name] || null}
    </svg>
  );
}

export default function OctiqenAuthScreen({
  authMode,
  setAuthMode,
  loginType,
  setLoginType,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authPhone,
  setAuthPhone,
  authCompanyName,
  setAuthCompanyName,
  handleTriggerOtp,
  isSendingOtp,
  showOtpModal,
  setShowOtpModal,
  enteredOtp,
  setEnteredOtp,
  handleVerifyOtpAndProceed,
  lang,
  setLang
}) {
  const [showPassword, setShowPassword] = useState(false);

  const features = [
    { icon: 'accounting', label: 'المحاسبة' },
    { icon: 'inventory', label: 'المخزون' },
    { icon: 'purchases', label: 'المشتريات' },
    { icon: 'sales', label: 'المبيعات' },
    { icon: 'people', label: 'الموارد البشرية' }
  ];

  const handleForgotPassword = () => {
    alert(
      '🔐 استعادة كلمة المرور:\n\n' +
      'أدخل بريدك الإلكتروني في الحقل واضغط على "تسجيل الدخول".\n' +
      'سيصلك رمز تحقق حقيقي لمرة واحدة (OTP) عبر الإيميل لإعادة تسجيل الدخول بأمان.'
    );
  };

  const toggleLanguage = () => {
    if (setLang) {
      setLang(lang === 'ar' ? 'en' : 'ar');
    }
  };

  return (
    <div className="octiqen-auth-root">
      <div className="octiqen-marine-auth">
        
        {/* Left Side: Authentic Marine Artwork & Hero Copy */}
        <aside className="octiqen-login-hero" aria-label="عن OCTIQEN ERP">
          <div className="hero-brand-strip">
            <img
              src="/brand/octiqen-logo.svg"
              alt="OCTIQEN Logo"
              className="hero-brand-logo"
            />
            <span className="hero-brand-name">Octiqen</span>
            <span className="hero-brand-tagline">
              نظام محاسبة وإدارة الشركات <span aria-hidden="true">—</span>
            </span>
          </div>

          <div className="hero-center-content">
            <h1 className="hero-headline">
              إدارة متكاملة
              <br />
              لأعمالك
            </h1>
            <p className="hero-subhead">
              نظام واحد يجمع جميع عمليات شركتك
              <br />
              ببساطة ومرونة.
            </p>

            <ul className="hero-module-pills" aria-label="مجالات إدارة الأعمال">
              {features.map(({ icon, label }) => (
                <li key={icon} className="hero-module-pill">
                  <div className="hero-module-icon-box">
                    <Icon name={icon} size={26} />
                  </div>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-bottom-benefits" aria-label="مزايا OCTIQEN">
            <div className="hero-benefit-item">
              <Icon name="building" size={22} />
              <div>
                <strong>إدارة أعمال متكاملة</strong>
                <small>في مساحة واحدة</small>
              </div>
            </div>
            <div className="hero-benefit-item">
              <Icon name="shield" size={22} />
              <div>
                <strong>تحقق متعدد الخطوات</strong>
                <small>بحسب إعدادات حسابك</small>
              </div>
            </div>
            <div className="hero-benefit-item">
              <Icon name="globe" size={22} />
              <div>
                <strong>تجربة عربية وإنجليزية</strong>
                <small>مصممة لأعمالك</small>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Frosted Glass Login Panel */}
        <main className="octiqen-auth-panel" role="main">
          {/* Top Bar with Language Switcher */}
          <div className="auth-panel-top-bar">
            <button
              type="button"
              className="auth-lang-btn"
              onClick={toggleLanguage}
              title="تبديل اللغة / Toggle Language"
            >
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
              <Icon name="globe" size={16} />
            </button>
          </div>

          {/* OCTIQEN Brand Header */}
          <div className="auth-brand-center">
            <img
              src="/brand/octiqen-logo.svg"
              alt="OCTIQEN Official Logo"
              className="auth-brand-octopus-logo"
            />
            <h2 className="auth-brand-wordmark">OCTIQEN</h2>
            <p className="auth-brand-subtitle">نظام محاسبة وإدارة الشركات</p>
          </div>

          <h3 className="auth-panel-title">
            {authMode === 'login' ? 'مرحباً بك مجدداً' : 'إنشاء حساب جديد'}
          </h3>
          <p className="auth-panel-subtitle">
            {authMode === 'login'
              ? 'سجل دخولك للمتابعة إلى حسابك'
              : 'ابدأ إدارة أعمالك بمرونة وسهولة'}
          </p>

          {/* Role selector for login mode */}
          {authMode === 'login' && (
            <div className="auth-role-selector" aria-label="نوع الحساب">
              <button
                type="button"
                className={`auth-role-btn ${loginType === 'admin' ? 'active' : ''}`}
                onClick={() => setLoginType('admin')}
              >
                <span>👑</span>
                <span>مدير النظام الكامل</span>
              </button>
              <button
                type="button"
                className={`auth-role-btn ${loginType === 'cashier' ? 'active' : ''}`}
                onClick={() => setLoginType('cashier')}
              >
                <span>🛒</span>
                <span>كاشير ومبيعات فقط</span>
              </button>
            </div>
          )}

          <form onSubmit={handleTriggerOtp} className="auth-form">
            {/* Email Field */}
            <div className="auth-input-group">
              <label htmlFor="auth-email">البريد الإلكتروني</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-email"
                  type="email"
                  placeholder="name@company.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  dir="ltr"
                  className="auth-input-field"
                  autoComplete="username"
                />
                <span className="auth-input-icon">
                  <Icon name="mail" size={20} />
                </span>
              </div>
            </div>

            {/* Password Field */}
            <div className="auth-input-group">
              <label htmlFor="auth-password">كلمة المرور</label>
              <div className="auth-input-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="auth-input-field"
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                />
                <span className="auth-input-icon">
                  <Icon name="lock" size={20} />
                </span>
                <button
                  type="button"
                  className="auth-reveal-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            {/* In Register mode: Phone and Company Name fields */}
            {authMode === 'register' && (
              <>
                <div className="auth-input-group">
                  <label htmlFor="auth-phone">رقم الجوال</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-phone"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      required
                      dir="ltr"
                      className="auth-input-field"
                    />
                    <span className="auth-input-icon">
                      <Icon name="phone" size={20} />
                    </span>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label htmlFor="auth-company">اسم المؤسسة أو الشركة</label>
                  <div className="auth-input-wrapper">
                    <input
                      id="auth-company"
                      type="text"
                      placeholder="مثال: شركة التطوير التجارية"
                      value={authCompanyName}
                      onChange={(e) => setAuthCompanyName(e.target.value)}
                      required
                      className="auth-input-field"
                    />
                    <span className="auth-input-icon">
                      <Icon name="building" size={20} />
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Forgot Password Link for Login */}
            {authMode === 'login' && (
              <div className="auth-sub-links">
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={handleForgotPassword}
                >
                  نسيت كلمة المرور؟
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSendingOtp}
              className="auth-submit-btn"
            >
              {isSendingOtp ? (
                <>
                  <span>جاري الإرسال عبر البريد الإلكتروني...</span>
                </>
              ) : authMode === 'login' ? (
                <>
                  <span>تسجيل الدخول</span>
                </>
              ) : (
                <>
                  <span>إرسال رمز التحقق وفتح الحساب</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="auth-toggle-mode-box">
            {authMode === 'login' ? (
              <>
                <span>ليس لديك حساب؟ </span>
                <button
                  type="button"
                  className="auth-toggle-mode-btn"
                  onClick={() => setAuthMode('register')}
                >
                  إنشاء حساب
                </button>
              </>
            ) : (
              <>
                <span>لديك حساب بالفعل؟ </span>
                <button
                  type="button"
                  className="auth-toggle-mode-btn"
                  onClick={() => setAuthMode('login')}
                >
                  تسجيل الدخول
                </button>
              </>
            )}
          </div>

          <div className="auth-panel-footer">
            OCTIQEN ERP • مساعدة أعمالك
          </div>
        </main>
      </div>

      {/* Modern OCTIQEN OTP Modal */}
      {showOtpModal && (
        <div className="octiqen-otp-overlay">
          <div className="octiqen-otp-card" role="dialog" aria-modal="true">
            <div className="otp-icon-capsule">
              <Icon name="otp" size={28} />
            </div>
            <h3 className="octiqen-otp-title">رمز التحقق الأمني (OTP)</h3>
            <p className="octiqen-otp-desc">
              تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني بنجاح. أدخله أدناه للمتابعة:
            </p>

            <form onSubmit={handleVerifyOtpAndProceed}>
              <input
                type="text"
                inputMode="numeric"
                maxLength="6"
                placeholder="------"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                required
                autoFocus
                className="octiqen-otp-input"
              />

              <div className="octiqen-otp-actions">
                <button type="submit" className="octiqen-otp-confirm">
                  تأكيد التحقق والدخول ✓
                </button>
                <button
                  type="button"
                  className="octiqen-otp-cancel"
                  onClick={() => setShowOtpModal(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
