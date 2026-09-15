const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// جدار الحماية وعزل المنشآت
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const url = req.path.toLowerCase();
  if (url.includes('login') || url.includes('register') || url.includes('forgot')) {
    return next();
  }

  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول (Missing Auth Header)' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'حساب المستخدم غير متاح أو معطل' });

    req.companyId = user.companyId;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Middleware Error:', error);
    res.status(500).json({ error: 'خطأ أثناء التحقق من الصلاحيات' });
  }
});

// المصادقة
app.post(['/register', '/api/register', '/api/api/register'], async (req, res) => {
  const { businessName, clientName, email, phone, password } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    const cleanEmail = email.trim().toLowerCase();
    
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) return res.status(400).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({ data: { name: businessName || 'شركة جديدة' } });
      const adminRole = await tx.role.create({ data: { companyId: company.id, name: 'مدير النظام', permissions: ['ALL_ACCESS'] } });
      const user = await tx.user.create({
        data: {
          companyId: company.id, roleId: adminRole.id, name: clientName || 'مدير',
          email: cleanEmail, password: password, phone: phone || null
        }
      });
      return { company, user, role: adminRole };
    });
    res.json({ message: 'تم إنشاء مساحة العمل بنجاح', user: result.user });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء مساحة العمل' });
  }
});

app.post(['/login', '/api/login', '/api/api/login'], async (req, res) => {
  const { email, password } = req.body;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail }, include: { company: true, role: true } });
    if (!user || user.password !== password) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    if (!user.isActive) return res.status(403).json({ error: 'تم تعطيل هذا الحساب' });

    const userData = { id: user.id, email: user.email, name: user.name, role: user.role?.name || 'مستخدم', businessName: user.company?.name || 'محور ERP' };
    res.json({ message: 'تم تسجيل الدخول بنجاح', user: userData });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// أمان الحساب: تغيير كلمة المرور بقيود صارمة
app.post(['/change-password', '/api/change-password', '/api/api/change-password'], async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف وأرقام' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.password !== currentPassword) {
      return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة، تم رفض الطلب لأسباب أمنية' });
    }

    await prisma.user.update({
      where: { id: req.userId },
      data: { password: newPassword }
    });

    res.json({ message: 'تم تحديث كلمة المرور بنجاح وبشكل آمن' });
  } catch (error) {
    console.error('Password Change Error:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء محاولة تحديث كلمة المرور' });
  }
});

// أمان الحساب: إيقاف وحذف الحساب
app.post(['/delete-account', '/api/delete-account', '/api/api/delete-account'], async (req, res) => {
  const { confirmPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.password !== confirmPassword) {
      return res.status(400).json({ error: 'كلمة المرور غير مطابقة لتأكيد حذف الحساب' });
    }

    // تعطيل الحساب لحماية سجل المعاملات المالية المترابطة
    await prisma.user.update({
      where: { id: req.userId },
      data: { isActive: false }
    });

    res.json({ message: 'تم تعطيل الحساب بنجاح وتسجيل الخروج النهائي' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ error: 'تعذر حذف الحساب' });
  }
});

// العملاء: استعراض وإضافة
app.get(['/customers', '/api/customers', '/api/api/customers'], async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { companyId: req.companyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
    console.error('Customer Fetch Error:', error);
    res.status(500).json({ error: 'خطأ في جلب بيانات العملاء' });
  }
});

app.post(['/customers', '/api/customers', '/api/api/customers'], async (req, res) => {
  const { name, nationalId, phone, email } = req.body;
  try {
    if (!name) return res.status(400).json({ error: 'اسم العميل مطلوب' });

    const newCustomer = await prisma.customer.create({
      data: {
        companyId: req.companyId,
        name: String(name),
        nationalId: nationalId ? String(nationalId) : null,
        phone: phone ? String(phone) : null,
        email: email ? String(email) : null
      }
    });
    res.json({ message: 'تم فتح حساب العميل بنجاح', customer: newCustomer });
  } catch (error) {
    console.error('Customer Create Error:', error);
    res.status(500).json({ error: 'تعذر حفظ حساب العميل' });
  }
});

// العملاء: تعديل بيانات عميل
app.put(['/customers/:id', '/api/customers/:id', '/api/api/customers/:id'], async (req, res) => {
  const { id } = req.params;
  const { name, nationalId, phone, email } = req.body;
  try {
    const existing = await prisma.customer.findFirst({
      where: { id: Number(id), companyId: req.companyId }
    });
    if (!existing) return res.status(404).json({ error: 'العميل غير موجود أو لا تملك صلاحية تعديله' });

    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name: name ? String(name) : existing.name,
        nationalId: nationalId !== undefined ? (nationalId ? String(nationalId) : null) : existing.nationalId,
        phone: phone !== undefined ? (phone ? String(phone) : null) : existing.phone,
        email: email !== undefined ? (email ? String(email) : null) : existing.email
      }
    });

    res.json({ message: 'تم تحديث بيانات العميل بنجاح', customer: updated });
  } catch (error) {
    console.error('Customer Update Error:', error);
    res.status(500).json({ error: 'تعذر تعديل بيانات العميل' });
  }
});

// العملاء: حذف عميل مع التحقق من الارتباطات المالية
app.delete(['/customers/:id', '/api/customers/:id', '/api/api/customers/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.customer.findFirst({
      where: { id: Number(id), companyId: req.companyId }
    });
    if (!existing) return res.status(404).json({ error: 'العميل غير موجود' });

    // منع الحذف إذا كانت هناك فواتير مسجلة باسمه حفاظاً على سلامة الدفاتر المحاسبية
    const invoiceCount = await prisma.invoice.count({ where: { customerId: Number(id) } });
    if (invoiceCount > 0) {
      return res.status(400).json({ error: 'لا يمكن حذف هذا العميل لوجود فواتير مبيعات سابقة مسجلة باسمه' });
    }

    await prisma.customer.delete({ where: { id: Number(id) } });
    res.json({ message: 'تم حذف حساب العميل بنجاح' });
  } catch (error) {
    console.error('Customer Delete Error:', error);
    res.status(500).json({ error: 'تعذر حذف العميل' });
  }
});

// المخزون
app.get(['/inventory', '/api/inventory', '/api/api/inventory'], async (req, res) => {
  try {
    const products = await prisma.product.findMany({ 
      where: { companyId: req.companyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات المخزون' });
  }
});

app.post(['/inventory', '/api/inventory', '/api/api/inventory'], async (req, res) => {
  const { name, price, stock } = req.body;
  try {
    if (!name || price === undefined) return res.status(400).json({ error: 'اسم المنتج والسعر مطلوبان' });
    const numericPrice = Number(price);

    const newProduct = await prisma.product.create({
      data: {
        companyId: req.companyId,
        name: String(name),
        price: numericPrice,
        cost: numericPrice,
        stock: Number(stock) || 0,
        sku: `SKU-${Date.now().toString().slice(-6)}`
      }
    });
    res.json({ message: 'تم إضافة المنتج للمخزون بنجاح', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حفظ المنتج' });
  }
});

// المبيعات والفوترة
app.get(['/sales', '/api/sales', '/api/api/sales'], async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { companyId: req.companyId },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true } },
        customer: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب الفواتير' });
  }
});

app.post(['/sales', '/api/sales', '/api/api/sales'], async (req, res) => {
  const { productId, quantity, price, customerId } = req.body;
  try {
    if (!productId || !quantity) return res.status(400).json({ error: 'المنتج والكمية مطلوبان' });

    const qty = Number(quantity);
    const prodId = Number(productId);
    const custId = customerId ? Number(customerId) : null;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: prodId, companyId: req.companyId }
      });

      if (!product) throw new Error('المنتج غير موجود');
      if (product.stock < qty) throw new Error(`الرصيد غير كافٍ! المتوفر: ${product.stock}`);

      const unitPrice = price !== undefined ? Number(price) : product.price;
      const subtotal = Number((unitPrice * qty).toFixed(2));
      const taxRate = 0.15;
      const taxAmount = Number((subtotal * taxRate).toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));

      await tx.product.update({
        where: { id: prodId },
        data: { stock: { decrement: qty } }
      });

      const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
      const invoice = await tx.invoice.create({
        data: {
          invoiceNo,
          subtotal,
          taxRate,
          taxAmount,
          totalAmount,
          companyId: req.companyId,
          userId: req.userId,
          customerId: custId,
          items: {
            create: [
              {
                productId: prodId,
                quantity: qty,
                unitPrice: unitPrice,
                subtotal: subtotal
              }
            ]
          }
        },
        include: { items: true, customer: true }
      });

      return invoice;
    });

    res.json({ message: 'تم إصدار الفاتورة وخصم المخزون بنجاح', invoice: result });
  } catch (error) {
    res.status(400).json({ error: error.message || 'فشلت عملية البيع' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Mihwar ERP Backend is running on port ${PORT}`);
});