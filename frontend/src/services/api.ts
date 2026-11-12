const API_BASE_URL = 'http://localhost:5000/api';

// Mengambil daftar produk
export async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Gagal memuat produk');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Menambah produk baru (untuk Admin)
export async function addProduct(productData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

// Menghapus produk (untuk Admin)
export async function deleteProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

// Mengambil daftar pesanan (untuk Admin)
export async function fetchOrders() {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`);
    if (!res.ok) throw new Error('Gagal memuat pesanan');
    return await res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Membuat pesanan baru (saat Checkout)
export async function createOrder(orderData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}

// Update status atau resi pesanan (untuk Admin)
export async function updateOrder(id: string, updateData: any) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    return await res.json();
  } catch (error) {
    console.error(error);
  }
}