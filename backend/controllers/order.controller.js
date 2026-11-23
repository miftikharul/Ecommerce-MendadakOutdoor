const { prisma, binderbyteConfig } = require('../config/env');
const { checkoutSchema } = require('../schemas/order.schema');
const { normalizeWhatsApp } = require('../utils/phone.util');

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const getWibDateParts = (baseDate = new Date()) => {
  const wibDate = new Date(baseDate.getTime() + WIB_OFFSET_MS);
  const year = String(wibDate.getUTCFullYear()).slice(-2);
  const month = String(wibDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getUTCDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const startOfWibDayUtc = new Date(Date.UTC(
    wibDate.getUTCFullYear(),
    wibDate.getUTCMonth(),
    wibDate.getUTCDate(),
    0, 0, 0, 0
  ) - WIB_OFFSET_MS);

  return { dateStr, startOfWibDayUtc };
};

const createOrder = async (req, res) => {
  try {
    const validationResult = checkoutSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Validasi gagal', 
        details: validationResult.error.issues.map(e => e.message) 
      });
    }

    const { customerName, customerPhone, shippingAddress, items, destinationId, courier, serviceType } = validationResult.data;
    const normalizedPhone = normalizeWhatsApp(customerPhone);

    let calculatedProductPrice = 0;
    let totalWeightGram = 0;
    const itemsValidationData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Produk dengan ID ${item.productId} tidak ditemukan.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Stok produk ${product.name} tidak mencukupi!` });
      }

      calculatedProductPrice += product.price * item.quantity;
      totalWeightGram += (product.weight || 1000) * item.quantity;
      
      itemsValidationData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        productName: product.name,
        variant: item.variant || product.variant || 'Standard',
        currentStock: product.stock
      });
    }

    let finalShippingCost = 0;
    const costParams = new URLSearchParams({
      api_key: binderbyteConfig.apiKey,
      origin: binderbyteConfig.originId,
      destination: destinationId,
      weight: String(totalWeightGram / 1000),
      courier: courier
    });

    const BB = binderbyteConfig.baseUrl;
    const bbResponse = await fetch(`${BB}/v1/cost`, {
      method: 'POST',
      body: costParams
    });
    const bbResult = await bbResponse.json();

    if (bbResult.code === '200') {
      const allCosts = bbResult.data.results.flatMap(k => k.costs);
      const selectedCost = allCosts.find(c => c.service === serviceType);
      
      if (selectedCost) {
        finalShippingCost = Number(selectedCost.price);
      } else {
        return res.status(400).json({ error: 'Layanan kurir yang dipilih tidak valid.' });
      }
    } else {
      return res.status(400).json({ error: 'Gagal memvalidasi ongkos kirim ke server kurir.' });
    }

    const totalPrice = calculatedProductPrice + finalShippingCost;
    const { dateStr, startOfWibDayUtc } = getWibDateParts();

    let newOrder = null;
    let finalOrderCode = null;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const countToday = await prisma.order.count({
        where: {
          createdAt: { gte: startOfWibDayUtc }
        }
      });
      const candidateCode = `MO-${dateStr}-${String(countToday + 1 + attempt).padStart(4, '0')}`;

      try {
        newOrder = await prisma.$transaction(async (tx) => {
          return await tx.order.create({
            data: {
              orderCode: candidateCode,
              customerName,
              customerPhone: normalizedPhone,
              shippingAddress,
              totalPrice: Math.round(totalPrice),
              shippingCost: Math.round(finalShippingCost),
              status: 'PENDING',
              items: {
                create: itemsValidationData.map(i => ({
                  productId: i.productId,
                  quantity: i.quantity,
                  price: Math.round(i.price),
                  productName: i.productName,
                  variant: i.variant
                }))
              }
            },
            include: { items: true }
          });
        });
        finalOrderCode = candidateCode;
        break;
      } catch (err) {
        if (err.code === 'P2002' && attempt < maxRetries - 1) {
          continue;
        }
        throw err;
      }
    }

    res.status(201).json({
      message: 'Pesanan berhasil dibuat!',
      orderCode: finalOrderCode,
      order: newOrder
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Gagal memproses pesanan ke database.' });
  }
};

const getOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let where = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { orderCode: { contains: search, mode: 'insensitive' } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } }
      ];
    }
    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data pesanan.' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    const validStatuses = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status pesanan tidak valid.' });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existingOrder) return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });

    if (status === 'PAID' && !existingOrder.stockDeducted) {
      for (const item of existingOrder.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            error: `Stok produk ${item.productName || product?.name || item.productId} tidak mencukupi.`
          });
        }
      }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      let nextStockDeducted = existingOrder.stockDeducted;

      if (status === 'PAID' && !existingOrder.stockDeducted) {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }
        nextStockDeducted = true;
      }

      if (status === 'CANCELLED' && existingOrder.stockDeducted) {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
        nextStockDeducted = false;
      }

      const updatePayload = {};
      if (status) updatePayload.status = status;
      updatePayload.stockDeducted = nextStockDeducted;

      if (trackingNumber !== undefined && trackingNumber !== null) {
        const trimmedTracking = String(trackingNumber).trim();
        if (trimmedTracking !== '') {
          updatePayload.trackingNumber = trimmedTracking;
        }
      }

      return await tx.order.update({
        where: { id },
        data: updatePayload,
        include: { items: true }
      });
    });

    res.json({ message: 'Status dan resi pesanan berhasil diperbarui!', order: updatedOrder });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Gagal memperbarui status.' });
  }
};

const trackLocalOrder = async (req, res) => {
  try {
    const { query, phone } = req.query;
    
    if (!query || !phone || !String(query).trim() || !String(phone).trim()) {
      return res.status(400).json({ error: 'Kode pesanan dan nomor WhatsApp wajib diisi lengkap.' });
    }

    const normalizedQueryCode = String(query).trim();
    const normalizedPhone = normalizeWhatsApp(String(phone));

    const orders = await prisma.order.findMany({
      where: {
        orderCode: normalizedQueryCode,
        customerPhone: normalizedPhone
      },
      include: { 
        items: {
          select: {
            productName: true,
            quantity: true,
            price: true,
            variant: true
          }
        } 
      },
      orderBy: { createdAt: 'desc' }
    });

    const sanitizedOrders = orders.map(order => ({
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName,
      status: order.status,
      trackingNumber: order.trackingNumber || '-',
      shippingCost: order.shippingCost,
      totalPrice: order.totalPrice,
      createdAt: order.createdAt,
      items: order.items
    }));

    res.json(sanitizedOrders);
  } catch (error) {
    console.error('Track local error:', error);
    res.status(500).json({ error: 'Gagal mencari data pesanan.' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  trackLocalOrder
};