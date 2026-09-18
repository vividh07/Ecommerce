import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Coupon } from '../models/Coupon.js';

export async function seedIfEmpty() {
  const count = await User.countDocuments();
  if (count > 0) return false;

  const passwordHash = await bcrypt.hash('Password123!', 12);

  const [, sellerUser] = await User.create([
    { name: 'Admin User', email: 'admin@demo.shop', passwordHash, role: 'ADMIN' },
    { name: 'Nova Gear', email: 'seller@demo.shop', passwordHash, role: 'SELLER' },
    { name: 'Alex Customer', email: 'customer@demo.shop', passwordHash, role: 'CUSTOMER' },
  ]);

  const seller = await Seller.create({
    userId: sellerUser._id,
    storeName: 'Nova Gear Lab',
    description: 'Futuristic apparel and accessories for everyday explorers.',
    isApproved: true,
  });

  const [electronics, fashion] = await Category.create([
    { name: 'Electronics' },
    { name: 'Fashion' },
  ]);

  const products = await Product.create([
    {
      sellerId: seller._id,
      name: 'Aurora Wireless Headphones',
      categoryId: electronics._id,
      description: 'Spatial audio, 40h battery, matte obsidian finish.',
      basePrice: 189,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
      isActive: true,
    },
    {
      sellerId: seller._id,
      name: 'Nebula Runner Sneakers',
      categoryId: fashion._id,
      description: 'Lightweight knit upper with reactive foam sole.',
      basePrice: 129,
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800'],
      isActive: true,
    },
    {
      sellerId: seller._id,
      name: 'Pulse Smart Watch',
      categoryId: electronics._id,
      description: 'Health tracking with edge-lit AMOLED display.',
      basePrice: 249,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      isActive: true,
    },
  ]);

  await ProductVariant.create([
    {
      productId: products[0]._id,
      attributes: new Map([['color', 'Obsidian']]),
      price: 189,
      stock: 25,
      sku: 'AUR-OBS-001',
    },
    {
      productId: products[1]._id,
      attributes: new Map([['size', '10'], ['color', 'Crimson']]),
      price: 129,
      stock: 18,
      sku: 'NEB-10-CR',
    },
    {
      productId: products[1]._id,
      attributes: new Map([['size', '11'], ['color', 'Crimson']]),
      price: 129,
      stock: 12,
      sku: 'NEB-11-CR',
    },
    {
      productId: products[2]._id,
      attributes: new Map([['size', '42mm'], ['band', 'Graphite']]),
      price: 249,
      stock: 30,
      sku: 'PUL-42-GR',
    },
  ]);

  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);
  await Coupon.create({
    code: 'SAVE10',
    type: 'PERCENTAGE',
    value: 10,
    minOrderValue: 50,
    expiryDate: expiry,
    usageLimit: 1000,
    isActive: true,
  });

  console.log('Seeded demo catalog (admin@demo.shop / Password123!, coupon SAVE10)');
  return true;
}
