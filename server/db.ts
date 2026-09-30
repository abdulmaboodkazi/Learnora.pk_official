import fs from 'node:fs';
import path from 'node:path';
import {
  User,
  Product,
  Category,
  Order,
  CartItem,
  WishlistItem,
  Address,
  Review,
  Coupon,
  Banner,
  Notification,
  ShippingMethod,
  StoreSettings,
  PaymentTransaction,
} from '../src/types/index.ts';

export interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> password hash / string
  resetTokens: Record<string, { email: string; expires: number }>;
  products: Product[];
  categories: Category[];
  orders: Order[];
  cartItems: (CartItem & { sessionId?: string; userId?: string })[];
  wishlistItems: WishlistItem[];
  addresses: Address[];
  reviews: Review[];
  coupons: Coupon[];
  banners: Banner[];
  notifications: Notification[];
  shippingMethods: ShippingMethod[];
  settings: StoreSettings;
  paymentTransactions: PaymentTransaction[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'learnora.json');

// Initial Categories (Initial Toys + Future Marketplace categories)
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat_edu',
    name: 'Educational Toys',
    slug: 'educational-toys',
    description: 'Montessori learning sets, alphabet boards, logic games, and counting tools.',
    image: '/src/assets/images/product_stem_robotics_1790783464103.jpg',
    sortOrder: 1,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_blocks',
    name: 'Building Blocks',
    slug: 'building-blocks',
    description: 'Architectural wooden blocks, magnetic tiles, and STEM construction kits.',
    image: '/src/assets/images/product_building_blocks_1790783483537.jpg',
    sortOrder: 2,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_stem',
    name: 'STEM Toys',
    slug: 'stem-toys',
    description: 'Robotics kits, coding trainers, science labs, and solar energy models.',
    image: '/src/assets/images/product_stem_robotics_1790783464103.jpg',
    sortOrder: 3,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_rc',
    name: 'Remote Control Toys',
    slug: 'remote-control-toys',
    description: 'All-terrain crawlers, high-speed stunt cars, drones, and hovercrafts.',
    image: '/src/assets/images/product_stem_robotics_1790783464103.jpg',
    sortOrder: 4,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_dolls',
    name: 'Dolls & Dollhouses',
    slug: 'dolls',
    description: 'Artisanal wooden dollhouses, family figurines, and miniature accessories.',
    image: '/src/assets/images/product_wooden_dollhouse_1790783499318.jpg',
    sortOrder: 5,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_board',
    name: 'Board Games & Puzzles',
    slug: 'board-games',
    description: 'Family strategy games, memory cards, floor jigsaw puzzles, and chess sets.',
    image: '/src/assets/images/product_building_blocks_1790783483537.jpg',
    sortOrder: 6,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_baby',
    name: 'Baby Toys & Sensory',
    slug: 'baby-toys',
    description: 'Silicone teething toys, sensory rattles, tummy-time mats, and soft rings.',
    image: '/src/assets/images/hero_kids_playtime_1790783444732.jpg',
    sortOrder: 7,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_books',
    name: 'Kids Books & Learning',
    slug: 'kids-books',
    description: 'Interactive picture books, early phonics, fairy tales, and encyclopedias.',
    image: '/src/assets/images/hero_kids_playtime_1790783444732.jpg',
    sortOrder: 8,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_clothing',
    name: 'Kids Clothing & Wear',
    slug: 'kids-clothing',
    description: 'Organic cotton playwear, knit sweaters, pajamas, and seasonal outfits.',
    image: '/src/assets/images/hero_kids_playtime_1790783444732.jpg',
    sortOrder: 9,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'cat_crafts',
    name: 'Arts, Crafts & Stationery',
    slug: 'arts-and-crafts',
    description: 'Non-toxic beeswax crayons, watercolor sets, modeling clay, and sketchbooks.',
    image: '/src/assets/images/product_building_blocks_1790783483537.jpg',
    sortOrder: 10,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Modular STEM Coding Explorer Robot',
    slug: 'modular-stem-coding-explorer-robot',
    description: 'An interactive robotics platform designed for young inventors. Children assemble modular motors, sensors, and gears while learning visual block coding fundamentals. Supports obstacle detection, line tracking, and customizable LED displays.',
    shortDescription: 'Hands-on coding robot with modular motors, ultrasonic sensor, and visual drag-and-drop app.',
    images: ['/src/assets/images/product_stem_robotics_1790783464103.jpg'],
    price: 4950,
    salePrice: 4200,
    categoryId: 'cat_stem',
    brand: 'RoboSpark',
    sku: 'RSP-COD-101',
    stock: 24,
    reservedStock: 0,
    lowStockThreshold: 5,
    ageRange: '6-8',
    tags: ['Coding', 'Robotics', 'STEM', 'Best Seller', 'Electronics'],
    attributes: {
      material: 'BPA-Free ABS Polymer & Brass Gears',
      pieces: 148,
      batteryRequired: true,
      batteryIncluded: false,
      dimensions: '18 x 14 x 12 cm',
      safetyWarning: 'Choking hazard - small parts. Not suitable for children under 3 years.',
    },
    rating: 4.9,
    reviewCount: 42,
    isFeatured: true,
    isNew: false,
    isActive: true,
    salesCount: 185,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'prod_2',
    name: 'Architectural Solid Beechwood Building Blocks (120 Pcs)',
    slug: 'architectural-solid-beechwood-blocks-120pcs',
    description: 'Precision-milled natural German beechwood architectural blocks. Features arches, columns, domes, and buttresses for open-ended creative construction. Finished with organic food-grade plant oils.',
    shortDescription: '120 precision natural beechwood building blocks with storage chest.',
    images: ['/src/assets/images/product_building_blocks_1790783483537.jpg'],
    price: 3600,
    salePrice: 3200,
    categoryId: 'cat_blocks',
    brand: 'NordicTimber',
    sku: 'NT-BL-120',
    stock: 35,
    reservedStock: 0,
    lowStockThreshold: 8,
    ageRange: '3-5',
    tags: ['Wooden', 'Montessori', 'Open Ended', 'Creative', 'Architecture'],
    attributes: {
      material: 'Sustainably Harvested Solid Beechwood',
      pieces: 120,
      safetyWarning: 'Smooth rounded edges, safe for curious toddlers.',
      dimensions: 'Box 32 x 28 x 14 cm',
    },
    rating: 4.95,
    reviewCount: 68,
    isFeatured: true,
    isNew: false,
    isActive: true,
    salesCount: 310,
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'prod_3',
    name: 'Artisan Heritage 3-Story Wooden Dollhouse',
    slug: 'artisan-heritage-3-story-wooden-dollhouse',
    description: 'A timeless heirloom wooden dollhouse designed with open-access front panels, magnetic wallpaper options, and 24 hand-finished miniature Scandinavian furniture pieces. Built to last generations.',
    shortDescription: 'Classic 3-story wooden dollhouse with 24-piece miniature furniture suite.',
    images: ['/src/assets/images/product_wooden_dollhouse_1790783499318.jpg'],
    price: 8900,
    salePrice: 7950,
    categoryId: 'cat_dolls',
    brand: 'Little Manor',
    sku: 'LM-DH-300',
    stock: 12,
    reservedStock: 0,
    lowStockThreshold: 3,
    ageRange: '3-5',
    tags: ['Pretend Play', 'Wooden', 'Heirloom', 'Dollhouse', 'Decor'],
    attributes: {
      material: 'Solid Birch Plywood & Organic Non-toxic Paints',
      pieces: 28,
      dimensions: '62 x 34 x 72 cm',
      safetyWarning: 'Complies with EN71 European toy safety standards.',
    },
    rating: 5.0,
    reviewCount: 31,
    isFeatured: true,
    isNew: true,
    isActive: true,
    salesCount: 94,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'prod_4',
    name: 'High-Torque 4WD All-Terrain Desert Crawler RC',
    slug: 'high-torque-4wd-all-terrain-desert-crawler-rc',
    description: 'Heavy-duty 1:16 scale rock crawler with independent 4-wheel coil spring suspension, waterproof electronics, 2.4GHz proportional steering controller, and dual rechargeable battery packs delivering up to 45 minutes of run time.',
    shortDescription: '1:16 scale remote control crawler with 4-wheel drive and dual battery packs.',
    images: ['/src/assets/images/product_stem_robotics_1790783464103.jpg'],
    price: 5400,
    salePrice: 4750,
    categoryId: 'cat_rc',
    brand: 'TorqueApex',
    sku: 'TA-RC-401',
    stock: 18,
    reservedStock: 0,
    lowStockThreshold: 4,
    ageRange: '9-12',
    tags: ['Remote Control', 'Outdoor', 'High Speed', 'Cars', 'Rechargeable'],
    attributes: {
      material: 'Reinforced Metal Chassis & Rubber Tires',
      batteryRequired: true,
      batteryIncluded: true,
      dimensions: '28 x 19 x 16 cm',
      speed: 'Up to 25 km/h',
    },
    rating: 4.8,
    reviewCount: 54,
    isFeatured: true,
    isNew: false,
    isActive: true,
    salesCount: 220,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'prod_5',
    name: 'Montessori Wooden Geometric Sensory Peg Board',
    slug: 'montessori-wooden-geometric-sensory-peg-board',
    description: 'Promotes fine motor dexterity, spatial pattern recognition, and color sorting. Includes 30 graduated solid wood pegs and 12 double-sided challenge activity cards.',
    shortDescription: 'Sensory wooden peg board for toddler motor skills and color matching.',
    images: ['/src/assets/images/product_building_blocks_1790783483537.jpg'],
    price: 1850,
    salePrice: 1550,
    categoryId: 'cat_edu',
    brand: 'Montessori World',
    sku: 'MW-PEG-05',
    stock: 45,
    reservedStock: 0,
    lowStockThreshold: 10,
    ageRange: '0-2',
    tags: ['Montessori', 'Toddler', 'Sensory', 'Motor Skills', 'Under 2000'],
    attributes: {
      material: 'Natural Pine & Non-toxic water-based stain',
      pieces: 42,
      safetyWarning: 'Tested safe for toddlers 18 months and up.',
    },
    rating: 4.85,
    reviewCount: 39,
    isFeatured: false,
    isNew: true,
    isActive: true,
    salesCount: 145,
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'prod_6',
    name: 'Magnetic 3D Building Geometry Tiles (100 Pcs)',
    slug: 'magnetic-3d-building-geometry-tiles-100pcs',
    description: 'Vibrant translucent magnetic shapes with reinforced ultrasonic welded borders and neodymium safety rivets. Sparks architectural creativity, 2D to 3D spatial thinking, and color blending.',
    shortDescription: '100 magnetic translucent STEM construction tiles in vibrant jewel tones.',
    images: ['/src/assets/images/product_building_blocks_1790783483537.jpg'],
    price: 3950,
    salePrice: 3450,
    categoryId: 'cat_blocks',
    brand: 'MagnaCraft',
    sku: 'MC-TILE-100',
    stock: 28,
    reservedStock: 0,
    lowStockThreshold: 6,
    ageRange: '3-5',
    tags: ['Magnetic', 'Building', 'STEM', 'Best Seller'],
    attributes: {
      material: 'Food-Grade ABS Plastic & Rare Earth Neodymium Magnets',
      pieces: 100,
    },
    rating: 4.9,
    reviewCount: 77,
    isFeatured: true,
    isNew: false,
    isActive: true,
    salesCount: 420,
    createdAt: '2026-01-05T10:00:00Z',
    updatedAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'prod_7',
    name: 'Solar Powered 12-in-1 Educational Robotics Lab',
    slug: 'solar-powered-12-in-1-robotics-lab',
    description: 'Build 12 unique moving robot creatures and aquatic vehicles powered exclusively by solar energy or halogen light. Teaches renewable energy concepts, gear ratios, and mechanical movement.',
    shortDescription: 'Build 12 moving solar-powered robots without batteries.',
    images: ['/src/assets/images/product_stem_robotics_1790783464103.jpg'],
    price: 2800,
    salePrice: 2450,
    categoryId: 'cat_stem',
    brand: 'GreenSci',
    sku: 'GS-SOLAR-12',
    stock: 22,
    reservedStock: 0,
    lowStockThreshold: 5,
    ageRange: '9-12',
    tags: ['Solar', 'Green Energy', 'STEM', 'Gears', 'Under 3000'],
    attributes: {
      material: 'Recycled Eco Polymer',
      pieces: 190,
      batteryRequired: false,
    },
    rating: 4.75,
    reviewCount: 29,
    isFeatured: false,
    isNew: true,
    isActive: true,
    salesCount: 88,
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'prod_8',
    name: 'Cooperative Island Mystery Family Board Game',
    slug: 'cooperative-island-mystery-family-board-game',
    description: 'An exciting cooperative adventure where the whole family works together as a team of archaeologists to solve riddles, avoid rising tides, and recover ancient relics before the island sinks.',
    shortDescription: 'Thrilling cooperative family board game for 2 to 4 players.',
    images: ['/src/assets/images/product_building_blocks_1790783483537.jpg'],
    price: 2950,
    salePrice: 2600,
    categoryId: 'cat_board',
    brand: 'TabletopTales',
    sku: 'TT-ISLE-01',
    stock: 19,
    reservedStock: 0,
    lowStockThreshold: 4,
    ageRange: '6-8',
    tags: ['Board Games', 'Family', 'Cooperative', 'Strategy'],
    attributes: {
      players: '2-4 Players',
      playTime: '30-45 minutes',
      material: 'FSC Certified Linen Cardboard & Wooden Meeples',
    },
    rating: 4.9,
    reviewCount: 48,
    isFeatured: false,
    isNew: false,
    isActive: true,
    salesCount: 160,
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z',
  },
  {
    id: 'prod_9',
    name: 'Organic Cotton Quilted Playmat with Wooden Arch',
    slug: 'organic-cotton-quilted-playmat-wooden-arch',
    description: 'Super soft, 100% GOTS organic cotton quilted floor playmat paired with a removable FSC solid beechwood activity gym arch with 4 hanging silicone & wooden tactile toys.',
    shortDescription: 'GOTS organic cotton baby playmat with natural wooden sensory arch.',
    images: ['/src/assets/images/hero_kids_playtime_1790783444732.jpg'],
    price: 6500,
    salePrice: 5800,
    categoryId: 'cat_baby',
    brand: 'PureSprout',
    sku: 'PS-MAT-01',
    stock: 14,
    reservedStock: 0,
    lowStockThreshold: 3,
    ageRange: '0-2',
    tags: ['Baby', 'Organic', 'Sensory', 'Nursery', 'Premium'],
    attributes: {
      material: '100% GOTS Organic Cotton & Beechwood',
      washable: 'Machine washable cover',
      dimensions: '90 cm diameter',
    },
    rating: 5.0,
    reviewCount: 22,
    isFeatured: true,
    isNew: false,
    isActive: true,
    salesCount: 75,
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'prod_10',
    name: 'Hardcover Illustrated Atlas of Ocean Wonders',
    slug: 'hardcover-illustrated-atlas-of-ocean-wonders',
    description: 'An oversized, richly illustrated ocean encyclopedia with fold-out panoramic spreads detailing deep-sea trenches, coral reef ecosystems, bioluminescent creatures, and marine conservation.',
    shortDescription: 'Stunning 96-page illustrated hardcover ocean encyclopedia with foldouts.',
    images: ['/src/assets/images/hero_kids_playtime_1790783444732.jpg'],
    price: 1950,
    salePrice: 1750,
    categoryId: 'cat_books',
    brand: 'CuriousKids Press',
    sku: 'CKP-BK-OCN',
    stock: 50,
    reservedStock: 0,
    lowStockThreshold: 10,
    ageRange: '6-8',
    tags: ['Books', 'Science', 'Nature', 'Reading', 'Under 2000'],
    attributes: {
      author: 'Dr. Elena Rostova',
      pages: 96,
      language: 'English',
      publisher: 'CuriousKids Press',
      format: 'Hardcover with Gold Foil Emboss',
    },
    rating: 4.95,
    reviewCount: 35,
    isFeatured: false,
    isNew: true,
    isActive: true,
    salesCount: 110,
    createdAt: '2026-02-05T10:00:00Z',
    updatedAt: '2026-02-05T10:00:00Z',
  },
  {
    id: 'prod_11',
    name: 'Organic Linen Everyday Dungaree Overall',
    slug: 'organic-linen-everyday-dungaree-overall',
    description: 'Relaxed fit, ultra-durable 100% organic linen overalls with adjustable coconut shell button straps, roomy front pockets for backyard treasures, and reinforced knee patches.',
    shortDescription: 'Pure organic linen breathable kids dungarees with coconut buttons.',
    images: ['/src/assets/images/hero_kids_playtime_1790783444732.jpg'],
    price: 2600,
    salePrice: 2250,
    categoryId: 'cat_clothing',
    brand: 'LittleLoom',
    sku: 'LL-CL-DNG',
    stock: 30,
    reservedStock: 0,
    lowStockThreshold: 6,
    ageRange: '3-5',
    tags: ['Clothing', 'Organic', 'Apparel', 'Kids Wear'],
    attributes: {
      fabric: '100% French Organic Flax Linen',
      color: 'Warm Oatmeal',
      sizesAvailable: '2-3Y, 3-4Y, 4-5Y',
      gender: 'Unisex',
    },
    rating: 4.8,
    reviewCount: 19,
    isFeatured: false,
    isNew: true,
    isActive: true,
    salesCount: 65,
    createdAt: '2026-02-12T10:00:00Z',
    updatedAt: '2026-02-12T10:00:00Z',
  },
  {
    id: 'prod_12',
    name: 'Artisan Natural Beeswax Block Crayons (16 Colors)',
    slug: 'artisan-natural-beeswax-block-crayons-16-colors',
    description: 'Pure German beeswax block crayons designed ergonomically for small hands that cannot yet hold thin pencils. Beautiful translucent color layering, completely smudge-free, in a metal travel tin.',
    shortDescription: '16 pure beeswax ergonomic block crayons in keepsake tin.',
    images: ['/src/assets/images/product_building_blocks_1790783483537.jpg'],
    price: 1250,
    salePrice: 990,
    categoryId: 'cat_crafts',
    brand: 'WaldorfStudio',
    sku: 'WS-CR-16',
    stock: 60,
    reservedStock: 0,
    lowStockThreshold: 12,
    ageRange: '3-5',
    tags: ['Arts & Crafts', 'Drawing', 'Non-toxic', 'Under 1000'],
    attributes: {
      material: '100% Pure Natural Beeswax & Food-grade Pigments',
      pieces: 16,
      safetyWarning: 'Non-toxic, petroleum-free, certified food-safe ingredients.',
    },
    rating: 4.9,
    reviewCount: 44,
    isFeatured: true,
    isNew: false,
    isActive: true,
    salesCount: 280,
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
  },
];

const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Store Administrator',
    email: 'admin@learnora.com',
    phone: '+92 300 1234567',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    connectedProviders: ['email'],
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'usr_customer',
    name: 'Sara Khan',
    email: 'parent@learnora.com',
    phone: '+92 321 9876543',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    emailVerified: true,
    connectedProviders: ['email', 'google'],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
];

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr_1',
    userId: 'usr_customer',
    fullName: 'Sara Khan',
    phone: '+92 321 9876543',
    houseFlat: 'House # 42-B',
    street: 'Khayaban-e-Seher, Phase 6',
    area: 'DHA',
    city: 'Karachi',
    province: 'Sindh',
    postalCode: '75500',
    isDefault: true,
  },
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup_1',
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minimumOrder: 1000,
    maximumDiscount: 1000,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2027-12-31T23:59:59Z',
    usageLimit: 1000,
    usedCount: 84,
    perUserLimit: 1,
    active: true,
  },
  {
    id: 'coup_2',
    code: 'KIDS20',
    discountType: 'percentage',
    discountValue: 20,
    minimumOrder: 4000,
    maximumDiscount: 2000,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2027-12-31T23:59:59Z',
    usageLimit: 500,
    usedCount: 42,
    perUserLimit: 1,
    active: true,
  },
  {
    id: 'coup_3',
    code: 'FLAT500',
    discountType: 'fixed',
    discountValue: 500,
    minimumOrder: 3000,
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2027-12-31T23:59:59Z',
    usageLimit: 300,
    usedCount: 15,
    perUserLimit: 1,
    active: true,
  },
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban_1',
    title: 'Make Every Playtime Special',
    subtitle: 'Discover safe, inspiring, and durable toys designed for purposeful childhood learning and endless family joy.',
    image: '/src/assets/images/hero_kids_playtime_1790783444732.jpg',
    ctaText: 'Explore Collection',
    link: '/shop',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'ban_2',
    title: 'Hands-On STEM & Coding Lab',
    subtitle: 'Equip young minds with mechanical wonder, logic puzzles, and beginner robotics.',
    image: '/src/assets/images/product_stem_robotics_1790783464103.jpg',
    ctaText: 'Shop STEM Toys',
    link: '/category/stem-toys',
    active: true,
    sortOrder: 2,
  },
  {
    id: 'ban_3',
    title: 'Family Game Nights & Tabletop Joy',
    subtitle: 'Connect across generations with cooperative strategy games, memory cards, and wooden chess sets.',
    image: '/src/assets/images/hero_family_playtime_1790785198699.jpg',
    ctaText: 'Explore Board Games',
    link: '/category/board-games',
    active: true,
    sortOrder: 3,
  },
  {
    id: 'ban_4',
    title: 'Architectural Natural Wood Blocks',
    subtitle: 'Precision-crafted solid beechwood arches and pillars for boundless spatial creativity.',
    image: '/src/assets/images/product_building_blocks_1790783483537.jpg',
    ctaText: 'Discover Building Sets',
    link: '/category/building-blocks',
    active: true,
    sortOrder: 4,
  },
  {
    id: 'ban_5',
    title: 'Little Makers Creative Workshop',
    subtitle: 'Safe watercolor paints, non-drying organic clay, and DIY activity kits that spark endless imagination.',
    image: '/src/assets/images/hero_creative_crafts_1790785215362.jpg',
    ctaText: 'Shop Creative Toys',
    link: '/category/creative-toys',
    active: true,
    sortOrder: 5,
  },
  {
    id: 'ban_6',
    title: 'Heirloom Scandinavian Dollhouses',
    subtitle: 'Artisanal miniature furniture, birch plywood frames, and timeless pretend play.',
    image: '/src/assets/images/product_wooden_dollhouse_1790783499318.jpg',
    ctaText: 'Explore Dollhouses',
    link: '/category/dolls',
    active: true,
    sortOrder: 6,
  },
];

const INITIAL_SHIPPING: ShippingMethod[] = [
  {
    id: 'ship_std',
    name: 'Standard Nationwide Courier Delivery',
    description: 'Safe door-to-door delivery across all major cities (TCS / Leopard / Call Courier)',
    fee: 200,
    freeShippingThreshold: 3000,
    estimatedDeliveryDays: '2 - 4 business days',
    active: true,
  },
];

const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Learnora Kids & Family Store',
  logo: '/logo.svg',
  currency: 'Rs.',
  contactEmail: 'support@learnora.com',
  contactPhone: '+92 21 3584 9200',
  address: 'Commercial Block 4, Clifton, Karachi, Pakistan',
  freeShippingThreshold: 3000,
  standardShippingFee: 200,
  bankAccountDetails: {
    bankName: 'Meezan Bank Limited / Standard Chartered',
    accountTitle: 'LEARNORA RETAIL PVT LTD',
    accountNumber: '0204 010394859101',
    iban: 'PK42MEZN000204010394859101',
    branchCode: '0204 (Clifton Branch)',
  },
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_101',
    orderNumber: 'LRN-9481',
    userId: 'usr_customer',
    customerName: 'Sara Khan',
    customerEmail: 'parent@learnora.com',
    customerPhone: '+92 321 9876543',
    items: [
      {
        id: 'oi_1',
        productId: 'prod_2',
        productName: 'Architectural Solid Beechwood Building Blocks (120 Pcs)',
        productImage: '/src/assets/images/product_building_blocks_1790783483537.jpg',
        productSku: 'NT-BL-120',
        price: 3200,
        quantity: 1,
        subtotal: 3200,
      },
    ],
    subtotal: 3200,
    discount: 320,
    shippingFee: 0,
    total: 2880,
    currency: 'Rs.',
    paymentMethod: 'card',
    paymentStatus: 'Paid',
    orderStatus: 'Shipped',
    statusHistory: [
      { status: 'Pending', timestamp: '2026-02-14T09:12:00Z', note: 'Order placed by customer' },
      { status: 'Confirmed', timestamp: '2026-02-14T09:15:00Z', note: 'Payment verified via online gateway' },
      { status: 'Processing', timestamp: '2026-02-14T11:00:00Z', note: 'Sent to warehouse picking' },
      { status: 'Packed', timestamp: '2026-02-14T14:30:00Z', note: 'Securely packed in eco-friendly protective box' },
      { status: 'Shipped', timestamp: '2026-02-15T08:00:00Z', note: 'Handed over to TCS Courier (Tracking # TCS-8392019)' },
    ],
    shippingAddress: INITIAL_ADDRESSES[0],
    couponCode: 'WELCOME10',
    createdAt: '2026-02-14T09:12:00Z',
    updatedAt: '2026-02-15T08:00:00Z',
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    productId: 'prod_2',
    userId: 'usr_customer',
    userName: 'Sara Khan',
    userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    title: 'Outstanding natural quality, our toddlers play with it daily!',
    comment: 'The smooth finish and precision of these wooden arches and columns is remarkable. Not a single splinter, beautiful smell of natural beechwood. Completely worth the price.',
    status: 'approved',
    verifiedPurchase: true,
    createdAt: '2026-02-18T14:00:00Z',
  },
  {
    id: 'rev_2',
    productId: 'prod_1',
    userId: 'usr_customer',
    userName: 'Ali Raza',
    rating: 5,
    title: 'The best STEM robot we have bought so far',
    comment: 'My 7-year-old was able to assemble it in about an hour with guidance. The app coding blocks are very intuitive and it teaches actual motor control loops.',
    status: 'approved',
    verifiedPurchase: true,
    createdAt: '2026-02-19T10:30:00Z',
  },
];

class DatabaseEngine {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure default admin & customer are present
        if (!parsed.users || parsed.users.length === 0) {
          parsed.users = INITIAL_USERS;
        }
        return parsed;
      }
    } catch (err) {
      console.error('[DB] Error loading file, initializing defaults:', err);
    }

    const defaultData: DatabaseSchema = {
      users: INITIAL_USERS,
      passwords: {
        usr_admin: 'admin123',
        usr_customer: 'parent123',
      },
      resetTokens: {},
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: INITIAL_ORDERS,
      cartItems: [],
      wishlistItems: [],
      addresses: INITIAL_ADDRESSES,
      reviews: INITIAL_REVIEWS,
      coupons: INITIAL_COUPONS,
      banners: INITIAL_BANNERS,
      notifications: [
        {
          id: 'notif_1',
          userId: 'usr_customer',
          title: 'Order Shipped!',
          message: 'Your order KID-9481 has been handed to TCS Courier.',
          type: 'order',
          isRead: false,
          link: '/account/orders/ord_101',
          createdAt: '2026-02-15T08:00:00Z',
        },
      ],
      shippingMethods: INITIAL_SHIPPING,
      settings: INITIAL_SETTINGS,
      paymentTransactions: [
        {
          id: 'txn_101',
          orderId: 'ord_101',
          userId: 'usr_customer',
          provider: 'mock_gateway',
          providerTransactionId: 'pg_live_94819283',
          amount: 2880,
          currency: 'Rs.',
          status: 'Paid',
          paymentMethod: 'card',
          metadata: { brand: 'Visa' },
          createdAt: '2026-02-14T09:15:00Z',
          updatedAt: '2026-02-14T09:15:00Z',
        },
      ],
    };

    this.save(defaultData);
    return defaultData;
  }

  public save(newData?: DatabaseSchema): void {
    if (newData) {
      this.data = newData;
    }
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save database file:', err);
    }
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]): void {
    this.data[key] = value;
    this.save();
  }

  public update<K extends keyof DatabaseSchema>(
    key: K,
    updater: (prev: DatabaseSchema[K]) => DatabaseSchema[K]
  ): DatabaseSchema[K] {
    this.data[key] = updater(this.data[key]);
    this.save();
    return this.data[key];
  }
}

export const db = new DatabaseEngine();
