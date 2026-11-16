export interface Product {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock?: number;
  weight?: number;
  brand?: string;
  variant?: string;
  images?: string[];
  image?: string;
  createdAt?: string;
}

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  variant: string;
}

export interface OrderItem {
  productId: string | number;
  name: string;
  price: number;
  quantity: number;
  variant: string;
}

export interface Order {
  id?: string | number;
  orderCode?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  courier: string;
  shippingCost: number;
  subtotal: number;
  total: number;
  status?: string;
  trackingNumber?: string;
  items: OrderItem[];
}