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

// جدار الحماية الأمني
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
    req.userRole = user.role?.name || 'مدير النظام';
    next();
  } catch (error) {
    return res.status(401).json({ error: 'رمز التوثيق غير صالح أو منتهي الصلاحية' });
  }
});

// المصادقة والتسجيل
app.post(['/register', '/api/register', '/api/api/register'], async (req, res) => {
  const { businessName, clientName, email, phone, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبان' });
    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) return res.status(400).json({ error: 'البريد مسجل مسبقاً' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({ data: { name: businessName || 'شركة جديدة' } });
      const adminRole = await tx.role.create({ data: { companyId: company.id, name: 'مدير النظام' } });
      const user = await tx.user.create({
        data: { companyId: company.id, roleId: adminRole.id, name: clientName || 'مدير', email: cleanEmail, password: hashedPassword, phone: phone || null }
      });
      return { company, user, role: adminRole };
    });

    const token = jwt.sign({ id: result.user.id, companyId: result.company.id }, JWT_SECRET, { expiresIn: '7d' });
    const userData = { id: result.user.id, email: result.user.email, name: result.user.name, role: result.role.name, businessName: result.company.name };

    res.json({ message: 'تم إنشاء مساحة العمل بنجاح', user: userData, token });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في إنشاء مساحة العمل' });
  }
});

app.post(['/login', '/api/login', '/api/api/login'], async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: 'البريد وكلمة المرور مطلوبان' });
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail }, include: { company: true, role: true } });
    
    if (!user || !user.isActive) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

    let isValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isValid = await bcrypt.compare(password, user.password);
    } else if (user.password === password) {
      isValid = true;
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    }

    if (!isValid) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });

    const token = jwt.sign({ id: user.id, companyId: user.companyId }, JWT_SECRET, { expiresIn: '7d' });
    const userData = { id: user.id, email: user.email, name: user.name, role: user.role?.name || 'مدير النظام', businessName: user.company?.name || 'محور ERP' };

    res.json({ message: 'تم تسجيل الدخول بنجاح', user: userData, token });
  } catch (error) {
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

app.post(['/forgot-password', '/api/forgot-password', '/api/api/forgot-password'], async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) return res.status(404).json({ error: 'البريد غير مسجل' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر إعادة تعيين كلمة المرور' });
  }
});

app.post(['/change-password', '/api/change-password', '/api/api/change-password'], async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(400).json({ error: 'المستخدم غير موجود' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashed } });
    res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
  } catch (error) { res.status(500).json({ error: 'خطأ' }); }
});

app.post(['/delete-account', '/api/delete-account', '/api/api/delete-account'], async (req, res) => {
  const { confirmPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(400).json({ error: 'المستخدم غير موجود' });
    const isMatch = await bcrypt.compare(confirmPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'كلمة المرور غير صحيحة' });

    await prisma.user.update({ where: { id: req.userId }, data: { isActive: false } });
    res.json({ message: 'تم تعطيل الحساب بنجاح' });
  } catch (error) { res.status(500).json({ error: 'خطأ' }); }
});

// فريق العمل والأدوار
app.get(['/roles', '/api/roles', '/api/api/roles'], async (req, res) => {
  try { res.json(await prisma.role.findMany({ where: { companyId: req.companyId } })); } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.get(['/users', '/api/users', '/api/api/users'], async (req, res) => {
  try { res.json(await prisma.user.findMany({ where: { companyId: req.companyId }, include: { role: true }, select: { id: true, name: true, email: true, phone: true, isActive: true, role: true } })); } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.post(['/users', '/api/users', '/api/api/users'], async (req, res) => {
  const { name, email, password, roleId, phone } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({
      data: { companyId: req.companyId, name, email: email.trim().toLowerCase(), password: hashed, phone, roleId: roleId ? Number(roleId) : null },
      include: { role: true }
    });
    res.json({ message: 'تم إضافة الموظف بنجاح', user: newUser });
  } catch (e) { res.status(500).json({ error: 'تعذر إضافة الموظف' }); }
});

// العملاء
app.get(['/customers', '/api/customers', '/api/api/customers'], async (req, res) => {
  try { res.json(await prisma.customer.findMany({ where: { companyId: req.companyId }, orderBy: { createdAt: 'desc' } })); } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.post(['/customers', '/api/customers', '/api/api/customers'], async (req, res) => {
  const { name, nationalId, phone, email } = req.body;
  try {
    const cust = await prisma.customer.create({ data: { companyId: req.companyId, name, nationalId, phone, email } });
    res.json({ message: 'تم الحفظ', customer: cust });
  } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.put(['/customers/:id', '/api/customers/:id', '/api/api/customers/:id'], async (req, res) => {
  const { id } = req.params;
  const { name, nationalId, phone, email } = req.body;
  try {
    const updated = await prisma.customer.update({ where: { id: Number(id) }, data: { name, nationalId, phone, email } });
    res.json({ message: 'تم التحديث', customer: updated });
  } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.delete(['/customers/:id', '/api/customers/:id', '/api/api/customers/:id'], async (req, res) => {
  try { await prisma.customer.delete({ where: { id: Number(req.params.id) } }); res.json({ message: 'تم الحذف' }); } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});

// الموردين
app.get(['/suppliers', '/api/suppliers', '/api/api/suppliers'], async (req, res) => {
  try { res.json(await prisma.supplier.findMany({ where: { companyId: req.companyId }, orderBy: { createdAt: 'desc' } })); } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.post(['/suppliers', '/api/suppliers', '/api/api/suppliers'], async (req, res) => {
  const { name, taxNumber, phone, email } = req.body;
  try {
    const supp = await prisma.supplier.create({ data: { companyId: req.companyId, name, taxNumber, phone, email } });
    res.json({ message: 'تم الحفظ', supplier: supp });
  } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.put(['/suppliers/:id', '/api/suppliers/:id', '/api/api/suppliers/:id'], async (req, res) => {
  const { id } = req.params;
  const { name, taxNumber, phone, email } = req.body;
  try {
    const updated = await prisma.supplier.update({ where: { id: Number(id) }, data: { name, taxNumber, phone, email } });
    res.json({ message: 'تم التحديث', supplier: updated });
  } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.delete(['/suppliers/:id', '/api/suppliers/:id', '/api/api/suppliers/:id'], async (req, res) => {
  try { await prisma.supplier.delete({ where: { id: Number(req.params.id) } }); res.json({ message: 'تم الحذف' }); } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});

// المخزون
app.get(['/inventory', '/api/inventory', '/api/api/inventory'], async (req, res) => {
  try { res.json(await prisma.product.findMany({ where: { companyId: req.companyId }, orderBy: { createdAt: 'desc' } })); } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.post(['/inventory', '/api/inventory', '/api/api/inventory'], async (req, res) => {
  const { name, price, cost, stock } = req.body;
  try {
    const prod = await prisma.product.create({ data: { companyId: req.companyId, name, price: Number(price), cost: Number(cost || price), stock: Number(stock || 0), sku: `SKU-${Date.now().slice(-6)}` } });
    res.json({ message: 'تم الحفظ', product: prod });
  } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});

// المبيعات
app.get(['/sales', '/api/sales', '/api/api/sales'], async (req, res) => {
  try {
    const invs = await prisma.invoice.findMany({ where: { companyId: req.companyId }, include: { items: { include: { product: true } }, user: { select: { name: true } }, customer: true }, orderBy: { createdAt: 'desc' } });
    res.json(invs);
  } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.post(['/sales', '/api/sales', '/api/api/sales'], async (req, res) => {
  const { items, customerId } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      let totalSub = 0;
      const prep = [];
      for (const it of items) {
        const prod = await tx.product.findFirst({ where: { id: Number(it.productId), companyId: req.companyId } });
        if (!prod || prod.stock < it.quantity) throw new Error(`الرصيد غير كافٍ للمنتج ${prod?.name || ''}`);
        const line = Number((prod.price * it.quantity).toFixed(2));
        totalSub += line;
        await tx.product.update({ where: { id: prod.id }, data: { stock: { decrement: it.quantity } } });
        prep.push({ productId: prod.id, quantity: it.quantity, unitPrice: prod.price, subtotal: line });
      }
      const taxAmount = Number((totalSub * 0.15).toFixed(2));
      const totalAmount = Number((totalSub + taxAmount).toFixed(2));
      const invoice = await tx.invoice.create({
        data: { invoiceNo: `INV-${Date.now().slice(-6)}`, subtotal: totalSub, taxRate: 0.15, taxAmount, totalAmount, companyId: req.companyId, userId: req.userId, customerId: customerId ? Number(customerId) : null, items: { create: prep } },
        include: { items: { include: { product: true } }, customer: true }
      });
      return invoice;
    });
    res.json({ message: 'تم إصدار الفاتورة', invoice: result });
  } catch (e) { res.status(400).json({ error: e.message || 'خطأ' }); }
});

// المشتريات
app.get(['/purchases', '/api/purchases', '/api/api/purchases'], async (req, res) => {
  try {
    const purs = await prisma.purchaseInvoice.findMany({ where: { companyId: req.companyId }, include: { items: { include: { product: true } }, supplier: true, user: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(purs);
  } catch (e) { res.status(500).json({ error: 'خطأ' }); }
});
app.post(['/purchases', '/api/purchases', '/api/api/purchases'], async (req, res) => {
  const { productId, quantity, unitCost, supplierId } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.findFirst({ where: { id: Number(productId), companyId: req.companyId } });
      if (!prod) throw new Error('المنتج غير موجود');
      const subtotal = Number((Number(unitCost) * Number(quantity)).toFixed(2));
      const taxAmount = Number((subtotal * 0.15).toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));
      await tx.product.update({ where: { id: prod.id }, data: { stock: { increment: Number(quantity) }, cost: Number(unitCost) } });
      const pur = await tx.purchaseInvoice.create({
        data: { invoiceNo: `PUR-${Date.now().slice(-6)}`, subtotal, taxRate: 0.15, taxAmount, totalAmount, companyId: req.companyId, userId: req.userId, supplierId: supplierId ? Number(supplierId) : null, items: { create: [{ productId: prod.id, quantity: Number(quantity), unitCost: Number(unitCost), subtotal }] } },
        include: { items: true, supplier: true }
      });
      return pur;
    });
    res.json({ message: 'تم التوريد', purchaseInvoice: result });
  } catch (e) { res.status(400).json({ error: e.message || 'خطأ' }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });