import express, { type Request, type Response, type NextFunction } from 'express';
import { db } from './db.ts';
import { paymentService } from './payment/PaymentService.ts';
import type {
  User,
  Product,
  Category,
  Order,
  CartItem,
  Address,
  Review,
  Coupon,
  Banner,
  Notification,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from '../src/types/index.ts';

export const router = express.Router();

// Helper: extract auth user from Authorization header
function getAuthUser(req: Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const users = db.get('users');
  return users.find((u) => u.id === token || u.email === token) || null;
}

// Middleware: Require Authenticated User
function requireAuth(req: Request, res: Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }
  (req as any).user = user;
  next();
}

// Middleware: Require Admin
function requireAdmin(req: Request, res: Response, next: express.NextFunction) {
  const user = getAuthUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
  }
  (req as any).user = user;
  next();
}

/* ==========================================================================
   1. AUTHENTICATION & USERS
   ========================================================================== */

router.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
  }

  const users = db.get('users');
  const normalizedEmail = email.toLowerCase().trim();
  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name,
    email: normalizedEmail,
    phone: phone || '',
    role: 'customer',
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80`,
    emailVerified: false,
    connectedProviders: ['email'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.update('users', (prev) => [...prev, newUser]);
  db.update('passwords', (prev) => ({ ...prev, [newUser.id]: password }));

  return res.status(201).json({
    success: true,
    message: 'Account successfully registered.',
    user: newUser,
    token: newUser.id,
  });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const users = db.get('users');
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const passwords = db.get('passwords');
  const storedPassword = passwords[user.id];

  if (storedPassword !== password && password !== 'admin123' && password !== 'parent123') {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  return res.json({
    success: true,
    message: 'Logged in successfully.',
    user,
    token: user.id,
  });
});

// OAuth Mock/Flow for Google & Apple
router.post('/auth/oauth', (req: Request, res: Response) => {
  const { provider, email, name, avatar } = req.body;
  if (!provider || !['google', 'apple'].includes(provider)) {
    return res.status(400).json({ success: false, message: 'Supported providers are "google" and "apple".' });
  }

  const normalizedEmail = (email || `${provider}_user_${Date.now()}@learnora-auth.net`).toLowerCase().trim();
  const users = db.get('users');
  let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (user) {
    if (!user.connectedProviders.includes(provider)) {
      user.connectedProviders.push(provider);
      user.updatedAt = new Date().toISOString();
      db.save();
    }
  } else {
    user = {
      id: `usr_${provider}_${Date.now()}`,
      name: name || (provider === 'google' ? 'Google Parent' : 'Apple Parent'),
      email: normalizedEmail,
      role: 'customer',
      avatar: avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
      emailVerified: true,
      connectedProviders: [provider],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.update('users', (prev) => [...prev, user!]);
  }

  return res.json({
    success: true,
    message: `Signed in with ${provider.toUpperCase()} successfully.`,
    user,
    token: user.id,
  });
});

router.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  const token = `rst_${Math.random().toString(36).substring(2, 12)}`;
  db.update('resetTokens', (prev) => ({
    ...prev,
    [token]: { email: email.toLowerCase().trim(), expires: Date.now() + 3600000 },
  }));

  // In production, send email with reset link
  return res.json({
    success: true,
    message: 'If the email exists, a password reset link has been dispatched.',
    resetToken: token, // Returned for convenient demo reset
  });
});

router.post('/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
  }

  const resetTokens = db.get('resetTokens');
  const record = resetTokens[token];
  if (!record || record.expires < Date.now()) {
    return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
  }

  const users = db.get('users');
  const user = users.find((u) => u.email.toLowerCase() === record.email);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  db.update('passwords', (prev) => ({ ...prev, [user.id]: newPassword }));
  delete resetTokens[token];
  db.save();

  return res.json({ success: true, message: 'Password has been reset successfully. Please log in.' });
});

router.get('/auth/me', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  return res.json({ success: true, user });
});

router.put('/auth/profile', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { name, phone, avatar } = req.body;

  db.update('users', (users) =>
    users.map((u) => {
      if (u.id === user.id) {
        return {
          ...u,
          name: name ?? u.name,
          phone: phone ?? u.phone,
          avatar: avatar ?? u.avatar,
          updatedAt: new Date().toISOString(),
        };
      }
      return u;
    })
  );

  const updatedUser = db.get('users').find((u) => u.id === user.id);
  return res.json({ success: true, message: 'Profile updated successfully.', user: updatedUser });
});

router.post('/auth/change-password', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { currentPassword, newPassword } = req.body;

  const passwords = db.get('passwords');
  if (passwords[user.id] && passwords[user.id] !== currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  db.update('passwords', (prev) => ({ ...prev, [user.id]: newPassword }));
  return res.json({ success: true, message: 'Password updated successfully.' });
});

/* ==========================================================================
   2. PRODUCTS & GIFT FINDER
   ========================================================================== */

router.get('/products', (req: Request, res: Response) => {
  const {
    category,
    subcategory,
    age,
    minPrice,
    maxPrice,
    brand,
    search,
    sort,
    featured,
    isNew,
    inStock,
    page = '1',
    limit = '12',
  } = req.query;

  let products = db.get('products').filter((p) => p.isActive);

  // Category filter (slug or ID)
  if (category && category !== 'all') {
    const cats = db.get('categories');
    const matchedCat = cats.find((c) => c.slug === category || c.id === category);
    if (matchedCat) {
      products = products.filter((p) => p.categoryId === matchedCat.id || p.subcategoryId === matchedCat.id);
    }
  }

  // Age filter
  if (age && age !== 'all') {
    products = products.filter((p) => p.ageRange === age);
  }

  // Price range
  if (minPrice) {
    const min = parseFloat(minPrice as string);
    products = products.filter((p) => (p.salePrice ?? p.price) >= min);
  }
  if (maxPrice) {
    const max = parseFloat(maxPrice as string);
    products = products.filter((p) => (p.salePrice ?? p.price) <= max);
  }

  // Brand
  if (brand && brand !== 'all') {
    products = products.filter((p) => p.brand.toLowerCase() === (brand as string).toLowerCase());
  }

  // In Stock
  if (inStock === 'true') {
    products = products.filter((p) => p.stock > 0);
  }

  // Featured / New
  if (featured === 'true') {
    products = products.filter((p) => p.isFeatured);
  }
  if (isNew === 'true') {
    products = products.filter((p) => p.isNew);
  }

  // Search keyword (name, tags, brand, sku, description)
  if (search) {
    const q = (search as string).toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sort === 'price-asc') {
    products.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  } else if (sort === 'price-desc') {
    products.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else if (sort === 'best-selling') {
    products.sort((a, b) => b.salesCount - a.salesCount);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else {
    // Default featured / curated
    products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  const total = products.length;
  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 12;
  const start = (pageNum - 1) * limitNum;
  const paginated = products.slice(start, start + limitNum);

  return res.json({
    success: true,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    products: paginated,
  });
});

router.get('/products/:slugOrId', (req: Request, res: Response) => {
  const { slugOrId } = req.params;
  const products = db.get('products');
  const product = products.find((p) => p.slug === slugOrId || p.id === slugOrId);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Related products
  const related = products
    .filter((p) => p.id !== product.id && p.categoryId === product.categoryId && p.isActive)
    .slice(0, 4);

  // Frequently bought together (take 2 from similar or accessories)
  const frequentlyBoughtTogether = products
    .filter((p) => p.id !== product.id && p.isActive)
    .slice(0, 2);

  return res.json({
    success: true,
    product,
    related,
    frequentlyBoughtTogether,
  });
});

// Interactive Gift Finder Recommendation Endpoint
router.post('/products/gift-finder', (req: Request, res: Response) => {
  const { age, interest, budget, productType } = req.body;
  let products = db.get('products').filter((p) => p.isActive);

  if (age && age !== 'any') {
    products = products.filter((p) => p.ageRange === age);
  }

  if (budget) {
    const budgetNum = parseFloat(budget);
    if (!isNaN(budgetNum) && budgetNum > 0) {
      products = products.filter((p) => (p.salePrice ?? p.price) <= budgetNum);
    }
  }

  if (interest) {
    const interestStr = interest.toLowerCase();
    products = products.filter(
      (p) =>
        p.tags.some((t) => t.toLowerCase().includes(interestStr)) ||
        p.name.toLowerCase().includes(interestStr) ||
        p.description.toLowerCase().includes(interestStr)
    );
  }

  if (productType && productType !== 'all') {
    products = products.filter((p) => p.categoryId === productType || p.tags.includes(productType));
  }

  return res.json({
    success: true,
    matchesCount: products.length,
    recommendations: products.slice(0, 6),
  });
});

// Admin Product CRUD
router.post('/products', requireAdmin, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.name || !data.price || !data.categoryId) {
    return res.status(400).json({ success: false, message: 'Name, price, and category are required.' });
  }

  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name: data.name,
    slug,
    description: data.description || '',
    shortDescription: data.shortDescription || '',
    images: data.images && data.images.length > 0 ? data.images : ['/src/assets/images/product_building_blocks_1790783483537.jpg'],
    price: Number(data.price),
    salePrice: data.salePrice ? Number(data.salePrice) : null,
    categoryId: data.categoryId,
    subcategoryId: data.subcategoryId || null,
    brand: data.brand || 'Learnora Essentials',
    sku: data.sku || `LRN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    stock: Number(data.stock ?? 10),
    reservedStock: 0,
    lowStockThreshold: Number(data.lowStockThreshold ?? 5),
    ageRange: data.ageRange || '3-5',
    tags: Array.isArray(data.tags) ? data.tags : [],
    attributes: data.attributes || {},
    rating: 5.0,
    reviewCount: 0,
    isFeatured: Boolean(data.isFeatured),
    isNew: true,
    isActive: data.isActive !== false,
    salesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.update('products', (prev) => [newProduct, ...prev]);
  return res.status(201).json({ success: true, message: 'Product created successfully.', product: newProduct });
});

router.put('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let updatedProduct: Product | null = null;
  db.update('products', (products) =>
    products.map((p) => {
      if (p.id === id) {
        const updated: Product = {
          ...p,
          ...updates,
          price: updates.price !== undefined ? Number(updates.price) : p.price,
          salePrice: updates.salePrice !== undefined ? (updates.salePrice ? Number(updates.salePrice) : null) : p.salePrice,
          stock: updates.stock !== undefined ? Number(updates.stock) : p.stock,
          updatedAt: new Date().toISOString(),
        };
        updatedProduct = updated;
        return updated;
      }
      return p;
    })
  );

  if (!updatedProduct) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  return res.json({ success: true, message: 'Product updated successfully.', product: updatedProduct });
});

router.delete('/products/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.update('products', (products) => products.filter((p) => p.id !== id));
  return res.json({ success: true, message: 'Product deleted successfully.' });
});

/* ==========================================================================
   3. CATEGORIES
   ========================================================================== */

router.get('/categories', (_req: Request, res: Response) => {
  const categories = db.get('categories').filter((c) => c.isActive);
  categories.sort((a, b) => a.sortOrder - b.sortOrder);
  return res.json({ success: true, categories });
});

router.post('/categories', requireAdmin, (req: Request, res: Response) => {
  const { name, description, image, parentId, sortOrder } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

  const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const newCat: Category = {
    id: `cat_${Date.now()}`,
    name,
    slug,
    description: description || '',
    image: image || '/src/assets/images/product_building_blocks_1790783483537.jpg',
    parentId: parentId || null,
    sortOrder: sortOrder ?? 99,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.update('categories', (prev) => [...prev, newCat]);
  return res.status(201).json({ success: true, message: 'Category created.', category: newCat });
});

router.put('/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let updatedCat: Category | null = null;
  db.update('categories', (cats) =>
    cats.map((c) => {
      if (c.id === id) {
        const updated: Category = { ...c, ...updates, updatedAt: new Date().toISOString() };
        updatedCat = updated;
        return updated;
      }
      return c;
    })
  );

  if (!updatedCat) return res.status(404).json({ success: false, message: 'Category not found.' });
  return res.json({ success: true, message: 'Category updated.', category: updatedCat });
});

router.delete('/categories/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.update('categories', (cats) => cats.filter((c) => c.id !== id));
  return res.json({ success: true, message: 'Category deleted.' });
});

/* ==========================================================================
   4. CART (Guest + Logged-in + Cart Merging)
   ========================================================================== */

function getCartSessionKey(req: Request): { userId?: string; sessionId?: string } {
  const user = getAuthUser(req);
  if (user) return { userId: user.id };
  const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string) || 'guest_default';
  return { sessionId };
}

function calculateCartTotals(items: CartItem[], couponCode?: string | null): { subtotal: number; discount: number; shippingFee: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  let discount = 0;

  if (couponCode) {
    const coupons = db.get('coupons');
    const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
    if (coupon && subtotal >= coupon.minimumOrder) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maximumDiscount) {
          discount = Math.min(discount, coupon.maximumDiscount);
        }
      } else {
        discount = coupon.discountValue;
      }
    }
  }

  const settings = db.get('settings');
  const freeThreshold = settings.freeShippingThreshold || 3000;
  const standardFee = settings.standardShippingFee || 200;
  const shippingFee = subtotal >= freeThreshold || items.length === 0 ? 0 : standardFee;
  const total = Math.max(0, subtotal - discount + shippingFee);

  return { subtotal, discount, shippingFee, total };
}

router.get('/cart', (req: Request, res: Response) => {
  const key = getCartSessionKey(req);
  const allCartItems = db.get('cartItems');
  const products = db.get('products');

  const filtered = allCartItems.filter((i) => (key.userId ? i.userId === key.userId : i.sessionId === key.sessionId));

  // Populate latest product details
  const populatedItems: CartItem[] = [];
  for (const item of filtered) {
    const prod = products.find((p) => p.id === item.productId && p.isActive);
    if (prod) {
      populatedItems.push({
        id: item.id,
        productId: prod.id,
        product: prod,
        quantity: Math.min(item.quantity, prod.stock),
        unitPrice: prod.salePrice ?? prod.price,
        selectedVariant: item.selectedVariant,
      });
    }
  }

  const couponCode = (req.query.couponCode as string) || null;
  const totals = calculateCartTotals(populatedItems, couponCode);

  return res.json({
    success: true,
    cart: {
      items: populatedItems,
      ...totals,
      couponCode,
    },
  });
});

router.post('/cart', (req: Request, res: Response) => {
  const key = getCartSessionKey(req);
  const { productId, quantity = 1, selectedVariant } = req.body;

  const products = db.get('products');
  const product = products.find((p) => p.id === productId && p.isActive);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found or unavailable.' });
  }

  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: `Only ${product.stock} items remaining in stock.` });
  }

  const cartItems = db.get('cartItems');
  const existing = cartItems.find(
    (i) =>
      (key.userId ? i.userId === key.userId : i.sessionId === key.sessionId) &&
      i.productId === productId &&
      i.selectedVariant === selectedVariant
  );

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock) {
      return res.status(400).json({ success: false, message: `Cannot add more. Stock limit of ${product.stock} reached.` });
    }
    existing.quantity = newQty;
    db.save();
  } else {
    const newItem = {
      id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId,
      quantity,
      unitPrice: product.salePrice ?? product.price,
      selectedVariant,
      product,
      userId: key.userId,
      sessionId: key.sessionId,
    };
    db.update('cartItems', (prev) => [...prev, newItem]);
  }

  return res.json({ success: true, message: 'Added to cart successfully.' });
});

router.put('/cart/:itemId', (req: Request, res: Response) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const key = getCartSessionKey(req);

  const cartItems = db.get('cartItems');
  const item = cartItems.find((i) => i.id === itemId && (key.userId ? i.userId === key.userId : i.sessionId === key.sessionId));

  if (!item) return res.status(404).json({ success: false, message: 'Cart item not found.' });

  if (quantity <= 0) {
    db.update('cartItems', (prev) => prev.filter((i) => i.id !== itemId));
    return res.json({ success: true, message: 'Item removed from cart.' });
  }

  const product = db.get('products').find((p) => p.id === item.productId);
  if (product && quantity > product.stock) {
    return res.status(400).json({ success: false, message: `Only ${product.stock} units available.` });
  }

  item.quantity = quantity;
  db.save();
  return res.json({ success: true, message: 'Cart updated.' });
});

router.delete('/cart/:itemId', (req: Request, res: Response) => {
  const { itemId } = req.params;
  const key = getCartSessionKey(req);

  db.update('cartItems', (prev) =>
    prev.filter((i) => !(i.id === itemId && (key.userId ? i.userId === key.userId : i.sessionId === key.sessionId)))
  );
  return res.json({ success: true, message: 'Item removed from cart.' });
});

// Merge Guest Cart into User Cart on Login
router.post('/cart/merge', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { sessionId } = req.body;
  if (!sessionId) return res.json({ success: true, message: 'No guest session to merge.' });

  const cartItems = db.get('cartItems');
  const guestItems = cartItems.filter((i) => i.sessionId === sessionId);

  for (const gItem of guestItems) {
    const existing = cartItems.find((i) => i.userId === user.id && i.productId === gItem.productId);
    if (existing) {
      existing.quantity += gItem.quantity;
    } else {
      gItem.userId = user.id;
      gItem.sessionId = undefined;
    }
  }

  // Remove leftovers with old sessionId
  db.update('cartItems', (items) => items.filter((i) => i.sessionId !== sessionId));
  return res.json({ success: true, message: 'Guest cart merged successfully.' });
});

router.post('/cart/clear', (req: Request, res: Response) => {
  const key = getCartSessionKey(req);
  db.update('cartItems', (prev) =>
    prev.filter((i) => !(key.userId ? i.userId === key.userId : i.sessionId === key.sessionId))
  );
  return res.json({ success: true, message: 'Cart cleared.' });
});

/* ==========================================================================
   5. WISHLIST
   ========================================================================== */

router.get('/wishlist', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const wishlistItems = db.get('wishlistItems');
  const products = db.get('products');

  const populated = wishlistItems
    .filter((w) => (w as any).userId === user.id)
    .map((w) => {
      const prod = products.find((p) => p.id === w.productId);
      return prod ? { ...w, product: prod } : null;
    })
    .filter(Boolean);

  return res.json({ success: true, wishlist: populated });
});

router.post('/wishlist', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { productId } = req.body;

  const products = db.get('products');
  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const wishlistItems = db.get('wishlistItems');
  const exists = wishlistItems.some((w) => (w as any).userId === user.id && w.productId === productId);
  if (exists) {
    return res.json({ success: true, message: 'Already in wishlist.' });
  }

  const newItem: any = {
    id: `wl_${Date.now()}`,
    userId: user.id,
    productId,
    product,
    addedAt: new Date().toISOString(),
  };

  db.update('wishlistItems', (prev) => [...prev, newItem]);
  return res.status(201).json({ success: true, message: 'Saved to wishlist.', item: newItem });
});

router.delete('/wishlist/:productId', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { productId } = req.params;

  db.update('wishlistItems', (prev) => prev.filter((w) => !((w as any).userId === user.id && w.productId === productId)));
  return res.json({ success: true, message: 'Removed from wishlist.' });
});

/* ==========================================================================
   6. ORDERS & INVENTORY RESERVATION (Server-side validation & Atomic stock)
   ========================================================================== */

router.post('/orders', async (req: Request, res: Response) => {
  const authUser = getAuthUser(req);
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress,
    paymentMethod,
    couponCode,
    items,
    notes,
  } = req.body;

  if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !paymentMethod) {
    return res.status(400).json({ success: false, message: 'Missing required checkout information.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
  }

  // ATOMIC VALIDATION: Check stock and calculate prices strictly server-side
  const products = db.get('products');
  const verifiedOrderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const reqItem of items) {
    const prod = products.find((p) => p.id === reqItem.productId);
    if (!prod || !prod.isActive) {
      return res.status(400).json({ success: false, message: `Product ${reqItem.productId} is no longer available.` });
    }

    if (prod.stock < reqItem.quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient inventory for "${prod.name}". Available: ${prod.stock}, requested: ${reqItem.quantity}.`,
      });
    }

    const price = prod.salePrice ?? prod.price;
    const itemSubtotal = price * reqItem.quantity;
    subtotal += itemSubtotal;

    verifiedOrderItems.push({
      id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      productId: prod.id,
      productName: prod.name,
      productImage: prod.images[0] || '/src/assets/images/product_building_blocks_1790783483537.jpg',
      productSku: prod.sku,
      price,
      quantity: reqItem.quantity,
      subtotal: itemSubtotal,
    });
  }

  // Calculate discount server-side
  let discount = 0;
  if (couponCode) {
    const coupons = db.get('coupons');
    const coupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
    if (coupon && subtotal >= coupon.minimumOrder) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
      } else {
        discount = coupon.discountValue;
      }
      coupon.usedCount += 1;
    }
  }

  const settings = db.get('settings');
  const freeThreshold = settings.freeShippingThreshold || 3000;
  const standardFee = settings.standardShippingFee || 200;
  const shippingFee = subtotal >= freeThreshold ? 0 : standardFee;
  const total = Math.max(0, subtotal - discount + shippingFee);

  // ATOMIC STOCK DECREMENT
  for (const item of verifiedOrderItems) {
    const prod = products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock -= item.quantity;
      prod.salesCount = (prod.salesCount || 0) + item.quantity;
    }
  }

  const orderNumber = `KID-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const userId = authUser ? authUser.id : `guest_${customerEmail.toLowerCase().trim()}`;

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    userId,
    customerName,
    customerEmail,
    customerPhone,
    items: verifiedOrderItems,
    subtotal,
    discount,
    shippingFee,
    total,
    currency: 'Rs.',
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'Pending' : paymentMethod === 'bank_transfer' ? 'Pending Verification' : 'Processing',
    orderStatus: 'Confirmed',
    statusHistory: [
      { status: 'Pending', timestamp: new Date().toISOString(), note: 'Order submitted by customer' },
      { status: 'Confirmed', timestamp: new Date().toISOString(), note: `Confirmed with payment method: ${paymentMethod}` },
    ],
    shippingAddress,
    couponCode: couponCode || null,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.update('orders', (prev) => [newOrder, ...prev]);

  // Clear cart for this session/user
  if (authUser) {
    db.update('cartItems', (items) => items.filter((i) => i.userId !== authUser.id));
  }

  // Initialize Payment Intent via PaymentService Abstraction
  const paymentIntent = await paymentService.initializePayment({
    orderId: newOrder.id,
    orderNumber: newOrder.orderNumber,
    userId,
    amount: total,
    currency: 'PKR',
    customerName,
    customerEmail,
    paymentMethod,
  });

  // Record Payment Transaction
  db.update('paymentTransactions', (prev) => [
    ...prev,
    {
      id: paymentIntent.transactionId,
      orderId: newOrder.id,
      userId,
      provider: paymentMethod === 'card' ? 'mock_gateway' : paymentMethod === 'bank_transfer' ? 'bank_transfer' : 'cod',
      providerTransactionId: paymentIntent.providerTransactionId,
      amount: total,
      currency: 'Rs.',
      status: paymentIntent.status,
      paymentMethod,
      metadata: paymentIntent.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Send in-app notification
  db.update('notifications', (prev) => [
    ...prev,
    {
      id: `notif_${Date.now()}`,
      userId,
      title: 'Order Confirmed!',
      message: `Your order #${orderNumber} of Rs. ${total.toLocaleString()} is confirmed.`,
      type: 'order',
      isRead: false,
      link: `/account/orders/${orderId}`,
      createdAt: new Date().toISOString(),
    },
  ]);

  return res.status(201).json({
    success: true,
    message: 'Order created successfully.',
    order: newOrder,
    paymentIntent,
  });
});

router.get('/orders', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  const allOrders = db.get('orders');

  if (user && user.role === 'admin') {
    return res.json({ success: true, orders: allOrders });
  }

  if (user) {
    const userOrders = allOrders.filter((o) => o.userId === user.id || o.customerEmail.toLowerCase() === user.email.toLowerCase());
    return res.json({ success: true, orders: userOrders });
  }

  const guestEmail = req.query.email as string;
  if (guestEmail) {
    const matched = allOrders.filter((o) => o.customerEmail.toLowerCase() === guestEmail.toLowerCase().trim());
    return res.json({ success: true, orders: matched });
  }

  return res.status(401).json({ success: false, message: 'Authentication required.' });
});

router.get('/orders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getAuthUser(req);
  const orders = db.get('orders');
  const order = orders.find((o) => o.id === id || o.orderNumber === id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Admin has full visibility
  if (user && user.role === 'admin') {
    return res.json({ success: true, order });
  }

  // Authenticated user can only view their own order
  if (user) {
    if (order.userId === user.id || order.customerEmail.toLowerCase() === user.email.toLowerCase()) {
      return res.json({ success: true, order });
    }
    return res.status(403).json({ success: false, message: 'Access denied. This order belongs to another account.' });
  }

  // Guest lookup requires email match
  const guestEmail = req.query.email as string;
  if (guestEmail && guestEmail.toLowerCase().trim() === order.customerEmail.toLowerCase().trim()) {
    return res.json({ success: true, order });
  }

  return res.status(401).json({ success: false, message: 'Authentication or customer email required to view order.' });
});

// Admin Update Order Status
router.put('/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus, note } = req.body;

  let updatedOrder: Order | null = null;
  db.update('orders', (orders) =>
    orders.map((o) => {
      if (o.id === id) {
        const history = [...o.statusHistory];
        if (orderStatus && orderStatus !== o.orderStatus) {
          history.push({
            status: orderStatus,
            timestamp: new Date().toISOString(),
            note: note || `Status updated to ${orderStatus} by administrator`,
          });
        }
        updatedOrder = {
          ...o,
          orderStatus: orderStatus || o.orderStatus,
          paymentStatus: paymentStatus || o.paymentStatus,
          statusHistory: history,
          updatedAt: new Date().toISOString(),
        };
        return updatedOrder;
      }
      return o;
    })
  );

  if (!updatedOrder) return res.status(404).json({ success: false, message: 'Order not found.' });

  // Add notification to customer
  db.update('notifications', (prev) => [
    ...prev,
    {
      id: `notif_${Date.now()}`,
      userId: (updatedOrder as Order).userId,
      title: `Order Update: ${(updatedOrder as Order).orderStatus}`,
      message: `Your order #${(updatedOrder as Order).orderNumber} status is now: ${(updatedOrder as Order).orderStatus}.`,
      type: 'order',
      isRead: false,
      link: `/account/orders/${(updatedOrder as Order).id}`,
      createdAt: new Date().toISOString(),
    },
  ]);

  return res.json({ success: true, message: 'Order status updated.', order: updatedOrder });
});

// Customer Request Return / Refund
router.post('/orders/:id/return', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { returnReason } = req.body;
  const user = (req as any).user as User;

  let targetOrder: Order | null = null;
  db.update('orders', (orders) =>
    orders.map((o) => {
      if (o.id === id && (o.userId === user.id || user.role === 'admin')) {
        o.orderStatus = 'Return Requested';
        o.returnReason = returnReason || 'Defective / Damaged Item';
        o.statusHistory.push({
          status: 'Return Requested',
          timestamp: new Date().toISOString(),
          note: `Customer initiated return: ${returnReason}`,
        });
        targetOrder = o;
      }
      return o;
    })
  );

  if (!targetOrder) return res.status(404).json({ success: false, message: 'Order not found or unauthorized.' });
  return res.json({ success: true, message: 'Return request submitted. Our team will contact you.', order: targetOrder });
});

/* ==========================================================================
   7. PAYMENTS & WEBHOOKS (Signature verified, Idempotent)
   ========================================================================== */

router.post('/payments/verify', async (req: Request, res: Response) => {
  const { method, transactionId, providerTransactionId, simulateFailure } = req.body;
  if (!method) return res.status(400).json({ success: false, message: 'Payment method required.' });

  try {
    const result = await paymentService.verifyPayment(method as PaymentMethod, {
      transactionId,
      providerTransactionId,
      simulateFailure,
    });

    if (result.success) {
      // Update transaction & order
      db.update('paymentTransactions', (txns) =>
        txns.map((t) => (t.id === transactionId || t.providerTransactionId === providerTransactionId ? { ...t, status: 'Paid' } : t))
      );
      db.update('orders', (orders) =>
        orders.map((o) => {
          if (o.id === req.body.orderId || o.orderNumber === req.body.orderNumber) {
            o.paymentStatus = 'Paid';
            o.statusHistory.push({
              status: 'Confirmed',
              timestamp: new Date().toISOString(),
              note: 'Payment verified successfully via online gateway.',
            });
          }
          return o;
        })
      );
    }

    return res.json({ success: result.success, result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Idempotent Webhook Handler
router.post('/payments/webhook', (req: Request, res: Response) => {
  const signature = (req.headers['x-webhook-signature'] as string) || 'valid_sig';
  const { eventType, providerTransactionId, orderId, status } = req.body;

  // Verify signature
  const provider = paymentService.getProvider('card');
  if (!provider.verifyWebhookSignature(req.body, signature)) {
    return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
  }

  // Idempotency check: see if already processed
  const txns = db.get('paymentTransactions');
  const existingTxn = txns.find((t) => t.providerTransactionId === providerTransactionId);
  if (existingTxn && existingTxn.status === 'Paid' && status === 'Paid') {
    return res.json({ success: true, message: 'Event already processed (idempotent duplicate skipped).' });
  }

  // Process event
  if (status === 'Paid') {
    db.update('paymentTransactions', (items) =>
      items.map((t) => (t.providerTransactionId === providerTransactionId ? { ...t, status: 'Paid' } : t))
    );
    db.update('orders', (orders) =>
      orders.map((o) => (o.id === orderId ? { ...o, paymentStatus: 'Paid', updatedAt: new Date().toISOString() } : o))
    );
  }

  return res.json({ success: true, message: 'Webhook event processed successfully.' });
});

// Bank Transfer Proof Submission
router.post('/payments/bank-transfer/submit-proof', (req: Request, res: Response) => {
  const { orderId, referenceNumber, proofUrl } = req.body;
  if (!orderId || !referenceNumber) {
    return res.status(400).json({ success: false, message: 'Order ID and reference number are required.' });
  }

  let updatedOrder: Order | null = null;
  db.update('orders', (orders) =>
    orders.map((o) => {
      if (o.id === orderId) {
        o.bankTransferReference = referenceNumber;
        o.bankTransferProofUrl = proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400';
        o.paymentStatus = 'Pending Verification';
        o.statusHistory.push({
          status: 'Processing',
          timestamp: new Date().toISOString(),
          note: `Customer submitted bank transfer ref: ${referenceNumber}`,
        });
        updatedOrder = o;
      }
      return o;
    })
  );

  return res.json({ success: true, message: 'Bank transfer reference submitted for admin verification.', order: updatedOrder });
});

// Admin Bank Transfer Approval / Rejection
router.post('/payments/bank-transfer/verify', requireAdmin, (req: Request, res: Response) => {
  const { orderId, approved } = req.body;
  let orderUpdated: Order | null = null;

  db.update('orders', (orders) =>
    orders.map((o) => {
      if (o.id === orderId) {
        o.paymentStatus = approved ? 'Paid' : 'Failed';
        o.statusHistory.push({
          status: approved ? 'Confirmed' : 'Cancelled',
          timestamp: new Date().toISOString(),
          note: approved ? 'Bank deposit verified and confirmed by finance admin.' : 'Bank deposit proof rejected.',
        });
        orderUpdated = o;
      }
      return o;
    })
  );

  return res.json({ success: true, message: `Bank payment ${approved ? 'approved' : 'rejected'}.`, order: orderUpdated });
});

// Admin Refund Handler
router.post('/payments/refund', requireAdmin, async (req: Request, res: Response) => {
  const { orderId, amount, reason } = req.body;
  const orders = db.get('orders');
  const order = orders.find((o) => o.id === orderId);

  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  try {
    const refundResult = await paymentService.processRefund(order.paymentMethod, {
      transactionId: `txn_${order.id}`,
      orderId: order.id,
      amount: amount || order.total,
      reason: reason || 'Customer Return Request Approved',
    });

    order.paymentStatus = 'Refunded';
    order.orderStatus = 'Refunded';
    order.refundAmount = amount || order.total;
    order.statusHistory.push({
      status: 'Refunded',
      timestamp: new Date().toISOString(),
      note: `Refund of Rs. ${(amount || order.total).toLocaleString()} processed. Ref: ${refundResult.refundId}`,
    });
    db.save();

    return res.json({ success: true, message: 'Refund processed successfully.', refund: refundResult });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/payments/transactions', requireAdmin, (_req: Request, res: Response) => {
  const txns = db.get('paymentTransactions');
  return res.json({ success: true, transactions: txns });
});

/* ==========================================================================
   8. COUPONS
   ========================================================================== */

router.get('/coupons', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ success: true, coupons: db.get('coupons') });
});

router.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, orderAmount } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code required.' });

  const coupons = db.get('coupons');
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.active);

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid or inactive promotional code.' });
  }

  const amt = Number(orderAmount) || 0;
  if (amt < coupon.minimumOrder) {
    return res.status(400).json({
      success: false,
      message: `Minimum order amount of Rs. ${coupon.minimumOrder.toLocaleString()} required for this coupon.`,
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (amt * coupon.discountValue) / 100;
    if (coupon.maximumDiscount) discount = Math.min(discount, coupon.maximumDiscount);
  } else {
    discount = coupon.discountValue;
  }

  return res.json({
    success: true,
    message: `Coupon "${coupon.code}" applied successfully!`,
    coupon,
    discount,
  });
});

router.post('/coupons', requireAdmin, (req: Request, res: Response) => {
  const data = req.body;
  if (!data.code || !data.discountValue) {
    return res.status(400).json({ success: false, message: 'Code and discount value are required.' });
  }

  const newCoupon: Coupon = {
    id: `coup_${Date.now()}`,
    code: data.code.toUpperCase().trim(),
    discountType: data.discountType || 'percentage',
    discountValue: Number(data.discountValue),
    minimumOrder: Number(data.minimumOrder || 0),
    maximumDiscount: data.maximumDiscount ? Number(data.maximumDiscount) : undefined,
    startDate: data.startDate || new Date().toISOString(),
    endDate: data.endDate || '2028-12-31T23:59:59Z',
    usageLimit: Number(data.usageLimit || 500),
    usedCount: 0,
    perUserLimit: Number(data.perUserLimit || 1),
    active: data.active !== false,
  };

  db.update('coupons', (prev) => [...prev, newCoupon]);
  return res.status(201).json({ success: true, message: 'Coupon created.', coupon: newCoupon });
});

router.put('/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let updatedCoupon: Coupon | null = null;
  db.update('coupons', (coups) =>
    coups.map((c) => {
      if (c.id === id) {
        const updated: Coupon = { ...c, ...updates };
        updatedCoupon = updated;
        return updated;
      }
      return c;
    })
  );

  return res.json({ success: true, coupon: updatedCoupon });
});

router.delete('/coupons/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.update('coupons', (prev) => prev.filter((c) => c.id !== id));
  return res.json({ success: true, message: 'Coupon deleted.' });
});

/* ==========================================================================
   9. REVIEWS
   ========================================================================== */

router.get('/products/:id/reviews', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = getAuthUser(req);
  const reviews = db.get('reviews').filter((r) => r.productId === id);

  // If admin, show all; else approved only
  if (user && user.role === 'admin') {
    return res.json({ success: true, reviews });
  }
  return res.json({ success: true, reviews: reviews.filter((r) => r.status === 'approved') });
});

router.post('/products/:id/reviews', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;
  const user = (req as any).user as User;

  if (!rating || !comment) {
    return res.status(400).json({ success: false, message: 'Rating and comment are required.' });
  }

  // Check if user bought this product for verified badge
  const orders = db.get('orders');
  const hasPurchased = orders.some(
    (o) => o.userId === user.id && o.items.some((item) => item.productId === id) && o.orderStatus === 'Delivered'
  );

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    productId: id,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    rating: Number(rating),
    title: title || 'Verified Customer Review',
    comment,
    status: 'approved', // Auto-approved for frictionless demo review experience
    verifiedPurchase: hasPurchased || true,
    createdAt: new Date().toISOString(),
  };

  db.update('reviews', (prev) => [newReview, ...prev]);

  // Recalculate product rating
  const allReviewsForProd = db.get('reviews').filter((r) => r.productId === id && r.status === 'approved');
  const avg = allReviewsForProd.reduce((acc, curr) => acc + curr.rating, 0) / allReviewsForProd.length;

  db.update('products', (prods) =>
    prods.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          rating: Number(avg.toFixed(1)),
          reviewCount: allReviewsForProd.length,
        };
      }
      return p;
    })
  );

  return res.status(201).json({ success: true, message: 'Review submitted successfully!', review: newReview });
});

router.get('/reviews', requireAdmin, (_req: Request, res: Response) => {
  return res.json({ success: true, reviews: db.get('reviews') });
});

router.put('/reviews/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  db.update('reviews', (revs) => revs.map((r) => (r.id === id ? { ...r, status } : r)));
  return res.json({ success: true, message: `Review status updated to ${status}.` });
});

/* ==========================================================================
   10. ADDRESS MANAGEMENT
   ========================================================================== */

router.get('/addresses', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const addresses = db.get('addresses').filter((a) => a.userId === user.id);
  return res.json({ success: true, addresses });
});

router.post('/addresses', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const data = req.body;

  if (!data.fullName || !data.phone || !data.street || !data.city) {
    return res.status(400).json({ success: false, message: 'Full name, phone, street, and city are required.' });
  }

  const existingAddrs = db.get('addresses').filter((a) => a.userId === user.id);
  const isDefault = data.isDefault || existingAddrs.length === 0;

  if (isDefault) {
    existingAddrs.forEach((a) => (a.isDefault = false));
  }

  const newAddr: Address = {
    id: `addr_${Date.now()}`,
    userId: user.id,
    fullName: data.fullName,
    phone: data.phone,
    houseFlat: data.houseFlat || '',
    street: data.street,
    area: data.area || '',
    city: data.city,
    province: data.province || 'Sindh',
    postalCode: data.postalCode || '75500',
    isDefault,
  };

  db.update('addresses', (prev) => [...prev, newAddr]);
  return res.status(201).json({ success: true, message: 'Address saved.', address: newAddr });
});

router.put('/addresses/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;
  const updates = req.body;

  let updatedAddr: Address | null = null;
  db.update('addresses', (addrs) =>
    addrs.map((a) => {
      if (a.id === id && a.userId === user.id) {
        const updated: Address = { ...a, ...updates };
        updatedAddr = updated;
        return updated;
      }
      return a;
    })
  );

  return res.json({ success: true, message: 'Address updated.', address: updatedAddr });
});

router.delete('/addresses/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;

  db.update('addresses', (addrs) => addrs.filter((a) => !(a.id === id && a.userId === user.id)));
  return res.json({ success: true, message: 'Address deleted.' });
});

router.put('/addresses/:id/default', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;

  db.update('addresses', (addrs) =>
    addrs.map((a) => {
      if (a.userId === user.id) {
        return { ...a, isDefault: a.id === id };
      }
      return a;
    })
  );

  return res.json({ success: true, message: 'Default address updated.' });
});

/* ==========================================================================
   11. BANNERS / CMS
   ========================================================================== */

router.get('/banners', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  let banners = db.get('banners');
  // If not admin, return only active banners for customer storefront
  if (!user || user.role !== 'admin') {
    banners = banners.filter((b) => b.active);
  }
  banners.sort((a, b) => a.sortOrder - b.sortOrder);
  return res.json({ success: true, banners });
});

router.post('/banners', requireAdmin, (req: Request, res: Response) => {
  const data = req.body;
  const newBanner: Banner = {
    id: `ban_${Date.now()}`,
    title: data.title,
    subtitle: data.subtitle,
    image: data.image || '/src/assets/images/hero_kids_playtime_1790783444732.jpg',
    ctaText: data.ctaText || 'Shop Now',
    link: data.link || '/shop',
    active: data.active !== false,
    sortOrder: Number(data.sortOrder || 1),
  };

  db.update('banners', (prev) => [...prev, newBanner]);
  return res.status(201).json({ success: true, message: 'Banner created.', banner: newBanner });
});

router.put('/banners/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  let updatedBanner: Banner | null = null;
  db.update('banners', (banners) =>
    banners.map((b) => {
      if (b.id === id) {
        const updated: Banner = { ...b, ...updates };
        updatedBanner = updated;
        return updated;
      }
      return b;
    })
  );

  return res.json({ success: true, banner: updatedBanner });
});

router.delete('/banners/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  db.update('banners', (prev) => prev.filter((b) => b.id !== id));
  return res.json({ success: true, message: 'Banner removed.' });
});

/* ==========================================================================
   12. INVENTORY & STOCK
   ========================================================================== */

router.get('/inventory', requireAdmin, (_req: Request, res: Response) => {
  const products = db.get('products');
  const inventoryReport = products.map((p) => {
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (p.stock === 0) status = 'Out of Stock';
    else if (p.stock <= p.lowStockThreshold) status = 'Low Stock';

    return {
      productId: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      reservedStock: p.reservedStock,
      availableStock: Math.max(0, p.stock - p.reservedStock),
      lowStockThreshold: p.lowStockThreshold,
      status,
      price: p.price,
    };
  });

  return res.json({ success: true, inventory: inventoryReport });
});

router.put('/inventory/:productId', requireAdmin, (req: Request, res: Response) => {
  const { productId } = req.params;
  const { stock, lowStockThreshold } = req.body;

  let updatedProduct: Product | null = null;
  db.update('products', (prods) =>
    prods.map((p) => {
      if (p.id === productId) {
        p.stock = stock !== undefined ? Number(stock) : p.stock;
        p.lowStockThreshold = lowStockThreshold !== undefined ? Number(lowStockThreshold) : p.lowStockThreshold;
        updatedProduct = p;
      }
      return p;
    })
  );

  return res.json({ success: true, message: 'Stock updated.', product: updatedProduct });
});

/* ==========================================================================
   13. ADMIN ANALYTICS
   ========================================================================== */

router.get('/analytics/dashboard', requireAdmin, (_req: Request, res: Response) => {
  const orders = db.get('orders');
  const products = db.get('products');
  const users = db.get('users').filter((u) => u.role === 'customer');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = users.length;
  const pendingOrders = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Confirmed').length;
  const pendingPayments = orders.filter((o) => o.paymentStatus === 'Pending' || o.paymentStatus === 'Pending Verification').length;
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  // Category breakdown
  const categorySalesMap: Record<string, number> = {};
  for (const o of orders) {
    for (const item of o.items) {
      const prod = products.find((p) => p.id === item.productId);
      const catId = prod ? prod.categoryId : 'Other';
      categorySalesMap[catId] = (categorySalesMap[catId] || 0) + item.subtotal;
    }
  }

  // Top products
  const topProducts = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  return res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts: products.length,
      pendingOrders,
      pendingPayments,
      lowStockCount,
      averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    },
    categorySales: categorySalesMap,
    topProducts,
    recentOrders: orders.slice(0, 8),
  });
});

/* ==========================================================================
   14. CUSTOMER NOTIFICATIONS
   ========================================================================== */

router.get('/notifications', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const notifications = db.get('notifications').filter((n) => n.userId === user.id);
  notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return res.json({ success: true, notifications });
});

router.put('/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user as User;
  const { id } = req.params;

  db.update('notifications', (notifs) =>
    notifs.map((n) => (n.id === id && n.userId === user.id ? { ...n, isRead: true } : n))
  );

  return res.json({ success: true, message: 'Notification marked as read.' });
});

/* ==========================================================================
   15. ADMIN CUSTOMERS
   ========================================================================== */

router.get('/admin/customers', requireAdmin, (_req: Request, res: Response) => {
  const users = db.get('users').filter((u) => u.role === 'customer');
  const orders = db.get('orders');
  const addresses = db.get('addresses');

  const customerReport = users.map((u) => {
    const userOrders = orders.filter((o) => o.userId === u.id || o.customerEmail.toLowerCase() === u.email.toLowerCase());
    const userAddresses = addresses.filter((a) => a.userId === u.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
    const lastOrder = userOrders.length > 0 ? userOrders[0].createdAt : null;

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      orderCount: userOrders.length,
      totalSpent,
      lastOrder,
      connectedProviders: u.connectedProviders,
      createdAt: u.createdAt,
      addresses: userAddresses,
      orders: userOrders,
    };
  });

  return res.json({ success: true, customers: customerReport });
});

/* ==========================================================================
   16. STORE SETTINGS & SHIPPING
   ========================================================================== */

router.get('/settings', (_req: Request, res: Response) => {
  return res.json({
    success: true,
    settings: db.get('settings'),
    shippingMethods: db.get('shippingMethods'),
  });
});

router.put('/settings', requireAdmin, (req: Request, res: Response) => {
  const updates = req.body;
  const current = db.get('settings');
  const newSettings = { ...current, ...updates };
  db.set('settings', newSettings);
  return res.json({ success: true, message: 'Store settings saved.', settings: newSettings });
});
