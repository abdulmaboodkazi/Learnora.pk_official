import {
  User,
  Product,
  Category,
  Cart,
  WishlistItem,
  Order,
  Address,
  Review,
  Banner,
  Notification,
  StoreSettings,
  ShippingMethod,
  PaymentTransaction,
} from '../types/index.ts';

const SESSION_KEY = 'learnora_session_id';
const TOKEN_KEY = 'learnora_auth_token';

export function getSessionId(): string {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const sessionId = getSessionId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || 'An error occurred while connecting to the server.');
  }

  return data;
}

export const api = {
  // Auth
  register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  oauthLogin: (body: { provider: 'google' | 'apple'; email?: string; name?: string; avatar?: string }) =>
    request('/auth/oauth', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (email: string) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (body: any) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<{ success: boolean; user: User }>('/auth/me'),
  updateProfile: (body: any) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body: any) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),

  // Products
  getProducts: (params?: Record<string, string | number | boolean>) => {
    const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
    return request<{ success: boolean; total: number; page: number; totalPages: number; products: Product[] }>(`/products${q}`);
  },
  getProduct: (slugOrId: string) =>
    request<{ success: boolean; product: Product; related: Product[]; frequentlyBoughtTogether: Product[] }>(`/products/${slugOrId}`),
  createProduct: (body: any) => request<{ success: boolean; product: Product }>('/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: any) => request<{ success: boolean; product: Product }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: string) => request(`/products/${id}`, { method: 'DELETE' }),
  giftFinder: (body: { age?: string; interest?: string; budget?: number; productType?: string }) =>
    request<{ success: boolean; matchesCount: number; recommendations: Product[] }>('/products/gift-finder', { method: 'POST', body: JSON.stringify(body) }),

  // Categories
  getCategories: () => request<{ success: boolean; categories: Category[] }>('/categories'),
  createCategory: (body: any) => request<{ success: boolean; category: Category }>('/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: string, body: any) => request<{ success: boolean; category: Category }>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id: string) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Cart
  getCart: (couponCode?: string) => {
    const q = couponCode ? `?couponCode=${encodeURIComponent(couponCode)}` : '';
    return request<{ success: boolean; cart: Cart }>(`/cart${q}`);
  },
  addToCart: (productId: string, quantity = 1, selectedVariant?: string) =>
    request('/cart', { method: 'POST', body: JSON.stringify({ productId, quantity, selectedVariant }) }),
  updateCartItem: (itemId: string, quantity: number) =>
    request(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  removeCartItem: (itemId: string) => request(`/cart/${itemId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart/clear', { method: 'POST' }),
  mergeCart: (sessionId: string) => request('/cart/merge', { method: 'POST', body: JSON.stringify({ sessionId }) }),

  // Wishlist
  getWishlist: () => request<{ success: boolean; wishlist: WishlistItem[] }>('/wishlist'),
  addToWishlist: (productId: string) => request('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId: string) => request(`/wishlist/${productId}`, { method: 'DELETE' }),

  // Orders
  createOrder: (body: any) => request<{ success: boolean; order: Order; paymentIntent: any }>('/orders', { method: 'POST', body: JSON.stringify(body) }),
  getOrders: (guestEmail?: string) => {
    const q = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : '';
    return request<{ success: boolean; orders: Order[] }>(`/orders${q}`);
  },
  getOrder: (id: string, guestEmail?: string) => {
    const q = guestEmail ? `?email=${encodeURIComponent(guestEmail)}` : '';
    return request<{ success: boolean; order: Order }>(`/orders/${id}${q}`);
  },
  updateOrderStatus: (id: string, body: { orderStatus?: string; paymentStatus?: string; note?: string }) =>
    request<{ success: boolean; order: Order }>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify(body) }),
  requestReturn: (id: string, returnReason: string) =>
    request(`/orders/${id}/return`, { method: 'POST', body: JSON.stringify({ returnReason }) }),

  // Payments
  verifyPayment: (body: any) => request<{ success: boolean; result: any }>('/payments/verify', { method: 'POST', body: JSON.stringify(body) }),
  submitBankTransferProof: (body: { orderId: string; referenceNumber: string; proofUrl?: string }) =>
    request('/payments/bank-transfer/submit-proof', { method: 'POST', body: JSON.stringify(body) }),
  verifyBankTransfer: (body: { orderId: string; approved: boolean }) =>
    request('/payments/bank-transfer/verify', { method: 'POST', body: JSON.stringify(body) }),
  processRefund: (body: { orderId: string; amount?: number; reason?: string }) =>
    request('/payments/refund', { method: 'POST', body: JSON.stringify(body) }),
  getPaymentTransactions: () => request<{ success: boolean; transactions: PaymentTransaction[] }>('/payments/transactions'),

  // Coupons
  validateCoupon: (code: string, orderAmount: number) =>
    request<{ success: boolean; coupon: any; discount: number }>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, orderAmount }) }),
  getCoupons: () => request<{ success: boolean; coupons: any[] }>('/coupons'),
  createCoupon: (body: any) => request('/coupons', { method: 'POST', body: JSON.stringify(body) }),
  updateCoupon: (id: string, body: any) => request(`/coupons/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCoupon: (id: string) => request(`/coupons/${id}`, { method: 'DELETE' }),

  // Reviews
  getProductReviews: (productId: string) => request<{ success: boolean; reviews: Review[] }>(`/products/${productId}/reviews`),
  submitReview: (productId: string, body: { rating: number; title: string; comment: string }) =>
    request(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
  getAllReviews: () => request<{ success: boolean; reviews: Review[] }>('/reviews'),
  updateReviewStatus: (id: string, status: 'approved' | 'rejected') =>
    request(`/reviews/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Addresses
  getAddresses: () => request<{ success: boolean; addresses: Address[] }>('/addresses'),
  createAddress: (body: any) => request<{ success: boolean; address: Address }>('/addresses', { method: 'POST', body: JSON.stringify(body) }),
  updateAddress: (id: string, body: any) => request<{ success: boolean; address: Address }>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAddress: (id: string) => request(`/addresses/${id}`, { method: 'DELETE' }),
  setDefaultAddress: (id: string) => request(`/addresses/${id}/default`, { method: 'PUT' }),

  // Banners
  getBanners: () => request<{ success: boolean; banners: Banner[] }>('/banners'),
  createBanner: (body: any) => request('/banners', { method: 'POST', body: JSON.stringify(body) }),
  updateBanner: (id: string, body: any) => request(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBanner: (id: string) => request(`/banners/${id}`, { method: 'DELETE' }),

  // Inventory
  getInventory: () => request<{ success: boolean; inventory: any[] }>('/inventory'),
  updateInventory: (productId: string, body: { stock?: number; lowStockThreshold?: number }) =>
    request(`/inventory/${productId}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Analytics
  getAnalytics: () => request<{ success: boolean; stats: any; categorySales: Record<string, number>; topProducts: Product[]; recentOrders: Order[] }>('/analytics/dashboard'),

  // Notifications
  getNotifications: () => request<{ success: boolean; notifications: Notification[] }>('/notifications'),
  markNotificationRead: (id: string) => request(`/notifications/${id}/read`, { method: 'PUT' }),

  // Admin Customers
  getCustomers: () => request<{ success: boolean; customers: any[] }>('/admin/customers'),

  // Settings
  getSettings: () => request<{ success: boolean; settings: StoreSettings; shippingMethods: ShippingMethod[] }>('/settings'),
  updateSettings: (body: any) => request('/settings', { method: 'PUT', body: JSON.stringify(body) }),
};
