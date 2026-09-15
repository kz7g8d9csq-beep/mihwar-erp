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
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// أمان الحساب
app.post(['/change-password', '/api/change-password', '/api/api/change-password'], async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'كلمة المرور الحالية والجديدة مطلوبتان' });
    if (newPassword.length < 8) return res.status(400).json({ error: 'يجب ألا تقل كلمة المرور الجديدة عن 8 أحرف وأرقام' });

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.password !== currentPassword) {
      return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }

    await prisma.user.update({ where: { id: req.userId }, data: { password: newPassword } });
    res.json({ message: 'تم تحديث كلمة المرور بنجاح وبشكل آمن' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر تحديث كلمة المرور' });
  }
});

app.post(['/delete-account', '/api/delete-account', '/api/api/delete-account'], async (req, res) => {
  const { confirmPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || user.password !== confirmPassword) {
      return res.status(400).json({ error: 'كلمة المرور غير مطابقة لتأكيد حذف الحساب' });
    }
    await prisma.user.update({ where: { id: req.userId }, data: { isActive: false } });
    res.json({ message: 'تم تعطيل الحساب بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حذف الحساب' });
  }
});

// ==================== إدارة العملاء ====================
app.get(['/customers', '/api/customers', '/api/api/customers'], async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { companyId: req.companyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(customers);
  } catch (error) {
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
    res.json({ message: 'تم حفظ حساب العميل بنجاح', customer: newCustomer });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حفظ العميل' });
  }
});

app.put(['/customers/:id', '/api/customers/:id', '/api/api/customers/:id'], async (req, res) => {
  const { id } = req.params;
  const { name, nationalId, phone, email } = req.body;
  try {
    const updated = await prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name: name ? String(name) : undefined,
        nationalId: nationalId !== undefined ? (nationalId ? String(nationalId) : null) : undefined,
        phone: phone !== undefined ? (phone ? String(phone) : null) : undefined,
        email: email !== undefined ? (email ? String(email) : null) : undefined
      }
    });
    res.json({ message: 'تم تحديث بيانات العميل بنجاح', customer: updated });
  } catch (error) {
    res.status(500).json({ error: 'تعذر تعديل العميل' });
  }
});

app.delete(['/customers/:id', '/api/customers/:id', '/api/api/customers/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    const invoiceCount = await prisma.invoice.count({ where: { customerId: Number(id) } });
    if (invoiceCount > 0) return res.status(400).json({ error: 'لا يمكن حذف العميل لوجود فواتير مبيعات مرتبطة به' });

    await prisma.customer.delete({ where: { id: Number(id) } });
    res.json({ message: 'تم حذف العميل بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حذف العميل' });
  }
});

// ==================== إدارة الموردين ====================
app.get(['/suppliers', '/api/suppliers', '/api/api/suppliers'], async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { companyId: req.companyId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب بيانات الموردين' });
  }
});

app.post(['/suppliers', '/api/suppliers', '/api/api/suppliers'], async (req, res) => {
  const { name, taxNumber, phone, email } = req.body;
  try {
    if (!name) return res.status(400).json({ error: 'اسم المورد مطلوب' });
    const newSupplier = await prisma.supplier.create({
      data: {
        companyId: req.companyId,
        name: String(name),
        taxNumber: taxNumber ? String(taxNumber) : null,
        phone: phone ? String(phone) : null,
        email: email ? String(email) : null
      }
    });
    res.json({ message: 'تم فتح حساب المورد بنجاح', supplier: newSupplier });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حفظ المورد' });
  }
});

app.put(['/suppliers/:id', '/api/suppliers/:id', '/api/api/suppliers/:id'], async (req, res) => {
  const { id } = req.params;
  const { name, taxNumber, phone, email } = req.body;
  try {
    const updated = await prisma.supplier.update({
      where: { id: Number(id) },
      data: {
        name: name ? String(name) : undefined,
        taxNumber: taxNumber !== undefined ? (taxNumber ? String(taxNumber) : null) : undefined,
        phone: phone !== undefined ? (phone ? String(phone) : null) : undefined,
        email: email !== undefined ? (email ? String(email) : null) : undefined
      }
    });
    res.json({ message: 'تم تحديث بيانات المورد بنجاح', supplier: updated });
  } catch (error) {
    res.status(500).json({ error: 'تعذر تعديل المورد' });
  }
});

app.delete(['/suppliers/:id', '/api/suppliers/:id', '/api/api/suppliers/:id'], async (req, res) => {
  const { id } = req.params;
  try {
    const purchasesCount = await prisma.purchaseInvoice.count({ where: { supplierId: Number(id) } });
    if (purchasesCount > 0) return res.status(400).json({ error: 'لا يمكن حذف المورد لوجود فواتير شراء مرتبطة به' });

    await prisma.supplier.delete({ where: { id: Number(id) } });
    res.json({ message: 'تم حذف المورد بنجاح' });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حذف المورد' });
  }
});

// ==================== المخزون ====================
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
  const { name, price, cost, stock } = req.body;
  try {
    if (!name || price === undefined) return res.status(400).json({ error: 'اسم المنتج والسعر مطلوبان' });
    const numericPrice = Number(price);
    const numericCost = cost !== undefined ? Number(cost) : numericPrice;

    const newProduct = await prisma.product.create({
      data: {
        companyId: req.companyId,
        name: String(name),
        price: numericPrice,
        cost: numericCost,
        stock: Number(stock) || 0,
        sku: `SKU-${Date.now().toString().slice(-6)}`
      }
    });
    res.json({ message: 'تم إضافة المنتج للمخزون بنجاح', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: 'تعذر حفظ المنتج' });
  }
});

// ==================== المبيعات والفوترة الذكية (متعددة الأصناف) ====================
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
  const { items, customerId, productId, quantity, price } = req.body;
  try {
    // دعم استقبال سلة أصناف مجمعة أو صنف فردي
    let itemsToProcess = items;
    if (!itemsToProcess || !itemsToProcess.length) {
      if (productId && quantity) {
        itemsToProcess = [{ productId, quantity, price }];
      } else {
        return res.status(400).json({ error: 'يجب إضافة صنف واحد على الأقل في الفاتورة' });
      }
    }

    const custId = customerId ? Number(customerId) : null;

    const result = await prisma.$transaction(async (tx) => {
      let totalSubtotal = 0;
      const preparedInvoiceItems = [];

      for (const it of itemsToProcess) {
        const pId = Number(it.productId);
        const q = Number(it.quantity);
        if (q <= 0) throw new Error('الكمية يجب أن تكون أكبر من صفر');

        const product = await tx.product.findFirst({
          where: { id: pId, companyId: req.companyId }
        });

        if (!product) throw new Error(`المنتج رقم ${pId} غير موجود بالمخزن`);
        if (product.stock < q) {
          throw new Error(`الرصيد غير كافٍ للمنتج "${product.name}"! المتاح بالمخزن: ${product.stock}`);
        }

        const uPrice = it.price !== undefined ? Number(it.price) : product.price;
        const lineSubtotal = Number((uPrice * q).toFixed(2));
        totalSubtotal += lineSubtotal;

        // خصم ذري فوري لكل صنف في السلة
        await tx.product.update({
          where: { id: pId },
          data: { stock: { decrement: q } }
        });

        preparedInvoiceItems.push({
          productId: pId,
          quantity: q,
          unitPrice: uPrice,
          subtotal: lineSubtotal
        });
      }

      const taxRate = 0.15;
      const subtotalRounded = Number(totalSubtotal.toFixed(2));
      const taxAmount = Number((subtotalRounded * taxRate).toFixed(2));
      const totalAmount = Number((subtotalRounded + taxAmount).toFixed(2));

      const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
      const invoice = await tx.invoice.create({
        data: {
          invoiceNo,
          subtotal: subtotalRounded,
          taxRate,
          taxAmount,
          totalAmount,
          companyId: req.companyId,
          userId: req.userId,
          customerId: custId,
          items: {
            create: preparedInvoiceItems
          }
        },
        include: {
          items: { include: { product: true } },
          customer: true
        }
      });

      return invoice;
    });

    res.json({ message: 'تم إصدار الفاتورة واعتماد خصم جميع الأصناف بنجاح', invoice: result });
  } catch (error) {
    console.error('Sales Error:', error);
    res.status(400).json({ error: error.message || 'فشلت عملية إصدار الفاتورة' });
  }
});

// ==================== المشتريات والتوريد الذكي ====================
app.get(['/purchases', '/api/purchases', '/api/api/purchases'], async (req, res) => {
  try {
    const purchaseInvoices = await prisma.purchaseInvoice.findMany({
      where: { companyId: req.companyId },
      include: {
        items: { include: { product: true } },
        supplier: true,
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(purchaseInvoices);
  } catch (error) {
    res.status(500).json({ error: 'خطأ في جلب فواتير الشراء' });
  }
});

app.post(['/purchases', '/api/purchases', '/api/api/purchases'], async (req, res) => {
  const { productId, quantity, unitCost, supplierId } = req.body;
  try {
    if (!productId || !quantity || unitCost === undefined) {
      return res.status(400).json({ error: 'المنتج، الكمية، وسعر الشراء مطلوبون' });
    }

    const qty = Number(quantity);
    const prodId = Number(productId);
    const cost = Number(unitCost);
    const suppId = supplierId ? Number(supplierId) : null;

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: prodId, companyId: req.companyId }
      });

      if (!product) throw new Error('المنتج المحدد غير موجود');

      const subtotal = Number((cost * qty).toFixed(2));
      const taxRate = 0.15;
      const taxAmount = Number((subtotal * taxRate).toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));

      await tx.product.update({
        where: { id: prodId },
        data: {
          stock: { increment: qty },
          cost: cost
        }
      });

      const invoiceNo = `PUR-${Date.now().toString().slice(-6)}`;
      const purchaseInvoice = await tx.purchaseInvoice.create({
        data: {
          invoiceNo,
          subtotal,
          taxRate,
          taxAmount,
          totalAmount,
          companyId: req.companyId,
          userId: req.userId,
          supplierId: suppId,
          items: {
            create: [
              {
                productId: prodId,
                quantity: qty,
                unitCost: cost,
                subtotal: subtotal
              }
            ]
          }
        },
        include: { items: true, supplier: true }
      });

      return purchaseInvoice;
    });

    res.json({ message: 'تم تسجيل فاتورة الشراء وتوريد الكمية للمخزون بنجاح', purchaseInvoice: result });
  } catch (error) {
    res.status(400).json({ error: error.message || 'فشلت عملية الشراء' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Mihwar ERP Backend is running on port ${PORT}`);
});