const { z } = require('zod');

const checkoutSchema = z.object({
  customerName: z.string().min(1, 'Nama wajib diisi'),
  customerPhone: z.string().regex(/^[0-9+\-\s]+$/, 'Nomor WhatsApp harus berupa angka atau format yang valid'),
  shippingAddress: z.string().min(5, 'Alamat pengiriman terlalu pendek'),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1, 'Jumlah minimal 1'),
    variant: z.string().optional()
  })).min(1, 'Keranjang belanja kosong'),
  destinationId: z.string().min(1, 'Destinasi pengiriman wajib diisi'),
  courier: z.string().min(1, 'Kurir pengiriman wajib diisi'),
  serviceType: z.string().min(1, 'Jenis layanan kurir wajib diisi')
});

module.exports = { checkoutSchema };