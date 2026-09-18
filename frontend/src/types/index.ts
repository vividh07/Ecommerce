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
  items: CartItem[];
  subtotal: number;
};

export type Order = {
  _id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  sellerBreakdown: Array<{
    sellerId: string;
    storeName: string;
    subtotal: number;
    itemCount: number;
  }>;
  items: Array<{
    productName: string;
    variantLabel: string;
    quantity: number;
    lineTotal: number;
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
