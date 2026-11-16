const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchApi(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return res.json();
}

// Mengambil daftar produk
export async function fetchProducts() {
  try {
    return await fetchApi('/products');
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Menambah produk baru (untuk Admin)
export async function addProduct(productData: any) {
  try {
    return await fetchApi('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  } catch (error) {
    console.error(error);
  }
}

// Menghapus produk (untuk Admin)
export async function deleteProduct(id: string) {
  try {
    return await fetchApi(`/products/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(error);
  }
}

// Mengambil daftar pesanan (untuk Admin)
export async function fetchOrders() {
  try {
    return await fetchApi('/orders');
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Membuat pesanan baru (saat Checkout)
export async function createOrder(orderData: any) {
  try {
    return await fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  } catch (error) {
    console.error(error);
  }
}

// Update status atau resi pesanan (untuk Admin)
export async function updateOrder(id: string, updateData: any) {
  try {
    return await fetchApi(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  } catch (error) {
    console.error(error);
  }
}