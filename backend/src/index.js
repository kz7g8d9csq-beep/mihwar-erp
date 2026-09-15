const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'mihwar-erp-super-secure-token-secret-2026';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// جدار الحماية السيبراني وفحص التوكن المشفر (JWT Auth Guard)
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const url = req.path.toLowerCase();
  if (url.includes('login') || url.includes('register') || url.includes('forgot-password')) {
    return next();
  }

  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  const legacyUserId = req.headers['user-id'];

  if (!token && !legacyUserId) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول (Missing Authentication Token)' });
  }

  try {
    let verifiedUserId = null;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      verifiedUserId = decoded.id;
    } else if (legacyUserId) {
      verifiedUserId = Number(legacyUserId);
    }

    const user = await prisma.user.findUnique({ where: { id: verifiedUserId }, include: { role: true } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'جلسة الدخول منتهية أو تم تعطيل هذا الحساب' });
    }

    req.companyId = user.companyId;
    req.userId = user.id;
    req.userRole = user.role?.name || 'مستخدم';
    next();
  } catch (error) {
    return res.status(401).json({ error: 'رمز التوثيق الرقمي غير صالح أو منتهي الصلاحية' });
  }
});

// إنشاء مساحة عمل جديدة مع تشفير Bcrypt وتوليد JWT
app.post(['/register', '/api/register', '/api/api/register'], async (req, res) => {
  const { businessName, clientName, email, phone, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    if (password.length < 8) return res.status(400).json({ error: 'يجب ألا تقل كلمة المرور عن 8 أحرف وأرقام' });

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) return res.status(400).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({ data: { name: businessName || 'شركة جديدة' } });
      const adminRole = await tx.role.create({ data: { companyId: company.id, name: 'مدير النظام', permissions: ['ALL_ACCESS'] } });
      const user = await tx.user.create({
        data: {
          companyId: company.id, roleId: adminRole.id, name: clientName || 'مدير',
          email: cleanEmail, password: hashedPassword, phone: phone || null
        }
      });
      return { company, user, role: adminRole };
    });

    const token = jwt.sign({ id: result.user.id, companyId: result.company.id }, JWT_SECRET, { expiresIn: '7d' });
    const userData = { id: result.user.id, email: result.user.email, name: result.user.name, role: result.role.name, businessName: result.company.name };

    res.json({ message: 'تم إنشاء مساحة العمل بنجاح', user: userData, token });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء مساحة العمل' });
  }
});

// تسجيل الدخول الآمن مع فحص Bcrypt والترقية التلقائية
app.post(['/login', '/api/login', '/api/api/login'], async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبان' });
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail }, include: { company: true, role: true } });
    
    if (!user) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    if (!user.isActive) return res.status(403).json({ error: 'تم تعطيل هذا الحساب' });

    let isPasswordValid = false;
    const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

    if (isBcryptHash) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      if (user.password === password) {
        isPasswordValid = true;
        const newSalt = await bcrypt.genSalt(10);
        const newHashed = await bcrypt.hash(password, newSalt);
        await prisma.user.update({ where: { id: user.id }, data: { password: newHashed } });
      }
    }

    if (!isPasswordValid) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

    const token = jwt.sign({ id: user.id, companyId: user.companyId }, JWT_SECRET, { expiresIn: '7d' });
    const userData = { id: user.id, email: user.email, name: user.name, role: user.role?.name || 'مدير النظام', businessName: user.company?.name || 'محور ERP' };

    res.json({ message: 'تم تسجيل الدخول بنجاح', user: userData, token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء تسجيل الدخول' });
  }
});

// استعادة وتحديث كلمة المرور عند النسيان
app.post(['/forgot-password', '/api/forgot-password', '/api/api/forgot-password'], async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور الجديدة مطلوبان' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'كلمة المرور الجديدة يجب ألا تقل عن 8 خانات' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    
    if (!user) {
      return res.status(404).json({ error: 'البريد الإلكتروني غير مسجل في النظام' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم أثناء إعادة تعيين كلمة المرور' });
  }
});

// تغيير كلمة المرور بأمان مع تشفير Bcrypt
app.post(['/change-password', '/api/change-password', '/api/api/change-password'], async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف وأرقام' });

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(400).json({ error: 'المستخدم غير موجود' });

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(currentPassword, user.password);
    } else {
      isMatch = (user.password === currentPassword);
    }

    if (!isMatch) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });

    const salt = await bcrypt.genSalt(10);
    const hashedNew = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashedNew } });

    res.json({ message: 'تم تحديث كلمة المرور وتشفيرها بنجاح وبشكل آمن' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر تحديث كلمة المرور' });
  }
});

// تعطيل الحساب
app.post(['/delete-account', '/api/delete-account', '/api/api/delete-account'], async (req, res) => {
  const { confirmPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(400).json({ error: 'المستخدم غير موجود' });

    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(confirmPassword, user.password);
    } else {
      isMatch = (user.password === confirmPassword);
    }

    if (!isMatch) return res.status(400).json({ error: 'كلمة المرور غير مطابقة لتأكيد حذف الحساب' });

    await prisma.user.update({ where: { id: req.userId }, data: { isActive: false } });
    res.json({ message: 'تم تعطيل الحساب بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حذف الحساب' });
  }
});

// ==================== إدارة الأدوار والمستخدمين (RBAC) ====================
app.get(['/roles', '/api/roles', '/api/api/roles'], async (req, res) => {
  try {
    const roles = await prisma.role.findMany({ where: { companyId: req.companyId } });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الأدوار' });
  }
});

app.post(['/roles', '/api/roles', '/api/api/roles'], async (req, res) => {
  const { name } = req.body;
  try {
    if (!name) return res.status(400).json({ error: 'اسم الدور مطلوب' });
    const newRole = await prisma.role.create({
      data: { companyId: req.companyId, name: String(name) }
    });
    res.json({ message: 'تم إنشاء الدور بنجاح', role: newRole });
  } catch (error) {
    res.status(500).json({ error: 'تعذر إنشاء الدور' });
  }
});

app.get(['/users', '/api/users', '/api/api/users'], async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { companyId: req.companyId },
      include: { role: true },
      select: { id: true, name: true, email: true, phone: true, isActive: true, createdAt: true, role: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب المستخدمين' });
  }
});

app.post(['/users', '/api/users', '/api/api/users'], async (req, res) => {
  const { name, email, password, roleId, phone } = req.body;
  try {
    if (!name || !email || !password) return res.status(400).json({ error: 'الاسم، البريد وكلمة المرور مطلوبون' });
    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) return res.status(400).json({ error: 'البريد الإلكتروني مستخدم مسبقاً' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        companyId: req.companyId,
        name: String(name),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? String(phone) : null,
        roleId: roleId ? Number(roleId) : null
      },
      include: { role: true }
    });
    res.json({ message: 'تم إنشاء حساب الموظف بنجاح', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'تعذر إنشاء المستخدم' });
  }
});

// ==================== إدارة العملاء والموردين والمخزون والفواتير ====================
app.get(['/customers', '/api/customers', '/api/api/customers'], async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({ where: { companyId: req.companyId }, orderBy: { createdAt: 'desc' } });
    res.json(customers);
  } catch (error) { res.status(500).json({ error: 'خطأ في العملاء' }); }
});

app.post(['/customers', '/api/customers', '/api/api/customers'], async (req, res) => {
  const { name, nationalId, phone, email } = req.body;
  try {
    const newCust = await prisma.customer.create({ data: { companyId: req.companyId, name, nationalId, phone, email } });
    res.json({ message: 'تم حفظ العميل', customer: newCust });
  } catch (error) { res.status(500).json({ error: 'تعذر الحفظ' }); }
});

app.put(['/customers/:id', '/api/customers/:id', '/api/api/customers/:id'], async (req, res) => {
  const { id } = req.params;
  const { name, nationalId, phone, email } = req.body;
  try {
    const updated = await prisma.customer.update({ where: { id: Number(id) }, data: { name, nationalId, phone, email } });
    res.json({ message: 'تم التحديث', customer: updated });
  } catch (error) { res.status(500).json({ error: 'تعذر التحديث' }); }
});

app.delete(['/customers/:id', '/api/customers/:id', '/api/api/customers/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.customer.delete({ where: { id: Number(id) } });
    res.json({ message: 'تم الحذف' });
  } catch (error) { res.status(500).json({ error: 'تعذر الحذف' }); }
});

app.get(['/suppliers', '/api/suppliers', '/api/api/suppliers'], async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({ where: { companyId: req.companyId }, orderBy: { createdAt: 'desc' } });
    res.json(suppliers);
  } catch (error) { res.status(500).json({ error: 'خطأ في الموردين' }); }
});

app.post(['/suppliers', '/api/suppliers', '/api/api/suppliers'], async (req, res) => {
  const { name, taxNumber, phone, email } = req.body;
  try {
    const newSupp = await prisma.supplier.create({ data: { companyId: req.companyId, name, taxNumber, phone, email } });
    res.json({ message: 'تم الحفظ', supplier: newSupp });
  } catch (error) { res.status(500).json({ error: 'تعذر الحفظ' }); }
});

app.put(['/suppliers/:id', '/api/suppliers/:id', '/api/api/suppliers/:id'], async (req, res) => {
  const { id } = req.params;
  const { name, taxNumber, phone, email } = req.body;
  try {
    const updated = await prisma.supplier.update({ where: { id: Number(id) }, data: { name, taxNumber, phone, email } });
    res.json({ message: 'تم التحديث', supplier: updated });
  } catch (error) { res.status(500).json({ error: 'تعذر التحديث' }); }
});

app.delete(['/suppliers/:id', '/api/suppliers/:id', '/api/api/suppliers/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.supplier.delete({ where: { id: Number(id) } });
    res.json({ message: 'تم الحذف' });
  } catch (error) { res.status(500).json({ error: 'تعذر الحذف' }); }
});

app.get(['/inventory', '/api/inventory', '/api/api/inventory'], async (req, res) => {
  try {
    const products = await prisma.product.findMany({ where: { companyId: req.companyId }, orderBy: { createdAt: 'desc' } });
    res.json(products);
  } catch (error) { res.status(500).json({ error: 'خطأ في المخزون' }); }
});

app.post(['/inventory', '/api/inventory', '/api/api/inventory'], async (req, res) => {
  const { name, price, cost, stock } = req.body;
  try {
    const product = await prisma.product.create({
      data: { companyId: req.companyId, name, price: Number(price), cost: Number(cost || price), stock: Number(stock || 0), sku: `SKU-${Date.now().slice(-6)}` }
    });
    res.json({ message: 'تم حفظ المنتج', product });
  } catch (error) { res.status(500).json({ error: 'تعذر حفظ المنتج' }); }
});

app.get(['/sales', '/api/sales', '/api/api/sales'], async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { companyId: req.companyId },
      include: { items: { include: { product: true } }, user: { select: { name: true } }, customer: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) { res.status(500).json({ error: 'خطأ في الفواتير' }); }
});

app.post(['/sales', '/api/sales', '/api/api/sales'], async (req, res) => {
  const { items, customerId } = req.body;
  try {
    if (!items || !items.length) return res.status(400).json({ error: 'السلة فارغة' });
    const result = await prisma.$transaction(async (tx) => {
      let totalSub = 0;
      const prepItems = [];
      for (const it of items) {
        const prod = await tx.product.findFirst({ where: { id: Number(it.productId), companyId: req.companyId } });
        if (!prod || prod.stock < it.quantity) throw new Error(`الرصيد غير كافٍ للمنتج ${prod?.name || ''}`);
        const lineSub = Number((prod.price * it.quantity).toFixed(2));
        totalSub += lineSub;
        await tx.product.update({ where: { id: prod.id }, data: { stock: { decrement: it.quantity } } });
        prepItems.push({ productId: prod.id, quantity: it.quantity, unitPrice: prod.price, subtotal: lineSub });
      }
      const taxAmount = Number((totalSub * 0.15).toFixed(2));
      const totalAmount = Number((totalSub + taxAmount).toFixed(2));
      const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
      const invoice = await tx.invoice.create({
        data: { invoiceNo, subtotal: totalSub, taxRate: 0.15, taxAmount, totalAmount, companyId: req.companyId, userId: req.userId, customerId: customerId ? Number(customerId) : null, items: { create: prepItems } },
        include: { items: { include: { product: true } }, customer: true }
      });
      return invoice;
    });
    res.json({ message: 'تم إصدار الفاتورة بنجاح', invoice: result });
  } catch (error) { res.status(400).json({ error: error.message || 'فشلت الفوترة' }); }
});

app.get(['/purchases', '/api/purchases', '/api/api/purchases'], async (req, res) => {
  try {
    const purchases = await prisma.purchaseInvoice.findMany({
      where: { companyId: req.companyId },
      include: { items: { include: { product: true } }, supplier: true, user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(purchases);
  } catch (error) { res.status(500).json({ error: 'خطأ في المشتريات' }); }
});

app.post(['/purchases', '/api/purchases', '/api/api/purchases'], async (req, res) => {
  const { productId, quantity, unitCost, supplierId } = req.body;
  try {
    const qty = Number(quantity);
    const cost = Number(unitCost);
    const result = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.findFirst({ where: { id: Number(productId), companyId: req.companyId } });
      if (!prod) throw new Error('المنتج غير موجود');
      const subtotal = Number((cost * qty).toFixed(2));
      const taxAmount = Number((subtotal * 0.15).toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));
      await tx.product.update({ where: { id: prod.id }, data: { stock: { increment: qty }, cost } });
      const invoiceNo = `PUR-${Date.now().toString().slice(-6)}`;
      const pur = await tx.purchaseInvoice.create({
        data: { invoiceNo, subtotal, taxRate: 0.15, taxAmount, totalAmount, companyId: req.companyId, userId: req.userId, supplierId: supplierId ? Number(supplierId) : null, items: { create: [{ productId: prod.id, quantity: qty, unitCost: cost, subtotal }] } },
        include: { items: true, supplier: true }
      });
      return pur;
    });
    res.json({ message: 'تم التوريد بنجاح', purchaseInvoice: result });
  } catch (error) { res.status(400).json({ error: error.message || 'فشل التوريد' }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Mihwar ERP Secure Backend is running on port ${PORT}`);
});