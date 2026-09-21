export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type SellerProfile = {
  id: string;
  storeName: string;
  isApproved: boolean;
  description?: string;
  supportEmail?: string;
  supportPhone?: string;
  storeSlug?: string;
  category?: string;
  logoUrl?: string;
  coverUrl?: string;
  onboardingStep?: number;
  onboardingComplete?: boolean;
  pickupAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  notifications?: {
    orderUpdates?: boolean;
    lowStock?: boolean;
    returns?: boolean;
    payouts?: boolean;
  };
  payoutDestination?: {
    bankName?: string;
    accountLast4?: string;
    holderName?: string;
  };
};

export type Category = {
  _id: string;
  name: string;
  parent?: string | null;
};

export type Product = {
  _id: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  categoryId: string;
  isActive?: boolean;
  avgRating?: number;
  reviewCount?: number;
};

export type ProductVariant = {
  _id: string;
  productId: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
  sku: string;
};

export type CartItem = {
  variantId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stock: number;
  sku: string;
  attributes: Record<string, string>;
  product: {
    id: string;
    name: string;
    image: string | null;
    sellerId: string;
    storeName: string;
  };
};

export type Cart = {
  id: string;
  name: string;
  budget: number | null;
  budgetUsedPercent: number | null;
  overBudget: boolean;
  items: CartItem[];
  subtotal: number;
};

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED';

export type StatusHistoryEntry = {
  _id: string;
  status: OrderStatus;
  timestamp: string;
  note: string;
  sellerId?: string;
};

export type Order = {
  _id: string;
  status: OrderStatus;
  paymentStatus: string;
  subtotalAmount: number;
  discountAmount?: number;
  couponCode?: string | null;
  totalAmount: number;
  deliveredAt?: string | null;
  createdAt: string;
  sellerBreakdown: Array<{
    sellerId: string;
    storeName: string;
    subtotal: number;
    itemCount: number;
  }>;
  sellerFulfillment?: Array<{
    sellerId: string;
    storeName: string;
    status: OrderStatus;
  }>;
  items: Array<{
    productName: string;
    variantLabel: string;
    quantity: number;
    lineTotal: number;
    sellerId?: string;
  }>;
  shippingAddress: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};

export type Review = {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: { name: string };
};

export type Coupon = {
  _id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number;
  expiryDate: string;
  usageLimit?: number | null;
  timesUsed: number;
  isActive: boolean;
};
