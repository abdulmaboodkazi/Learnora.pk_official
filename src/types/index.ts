export type Role = 'customer' | 'admin' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Role;
  emailVerified: boolean;
  connectedProviders: ('email' | 'google' | 'apple')[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  houseFlat: string;
  street: string;
  area: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductAttributes {
  // Toys
  material?: string;
  color?: string;
  pieces?: number;
  batteryRequired?: boolean;
  batteryIncluded?: boolean;
  // Clothing
  size?: string;
  fabric?: string;
  gender?: string;
  // Books
  author?: string;
  pages?: number;
  language?: string;
  publisher?: string;
  // General
  dimensions?: string;
  weight?: string;
  safetyWarning?: string;
  warranty?: string;
  [key: string]: any;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  price: number;
  salePrice?: number | null;
  categoryId: string;
  subcategoryId?: string | null;
  brand: string;
  sku: string;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  ageRange: string; // e.g., '0-2', '3-5', '6-8', '9-12', '12+'
  tags: string[];
  attributes: ProductAttributes;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  selectedVariant?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Return Requested'
  | 'Returned'
  | 'Refunded';

export type PaymentStatus =
  | 'Pending'
  | 'Pending Verification'
  | 'Processing'
  | 'Paid'
  | 'Failed'
  | 'Cancelled'
  | 'Refunded'
  | 'Partially Refunded';

export type PaymentMethod = 'cod' | 'bank_transfer' | 'card';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  productSku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
  shippingAddress: Address;
  billingAddress?: Address;
  couponCode?: string | null;
  notes?: string;
  bankTransferReference?: string;
  bankTransferProofUrl?: string;
  returnReason?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  provider: 'mock_gateway' | 'bank_transfer' | 'cod';
  providerTransactionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumOrder: number;
  maximumDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  categoryRestrictions?: string[];
  active: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  link: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  sortOrder: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'promo' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  fee: number;
  freeShippingThreshold: number;
  estimatedDeliveryDays: string;
  active: boolean;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  currency: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  bankAccountDetails: {
    bankName: string;
    accountTitle: string;
    accountNumber: string;
    iban: string;
    branchCode: string;
  };
}
