// ============================================
// paint_n_meraki — PRODUCT DATA (SEED)
// All real products with prices from catalog
// ============================================

import { Product, Category, Review } from '@/types';

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Resin Clocks',
    slug: 'resin-clocks',
    description: 'Statement pieces for your walls — handcrafted resin clocks that combine functional design with artistic beauty.',
    image: '/images/categories/clock-2.jpg',
    productCount: 6,
  },
  {
    id: 'cat-2',
    name: 'Pooja Thalis',
    slug: 'pooja-thalis',
    description: 'Beautifully crafted for special moments — handmade resin pooja thalis for your sacred rituals.',
    image: '/images/categories/pooja_thali.jpg',
    productCount: 3,
  },
  {
    id: 'cat-3',
    name: 'Decorative Frames',
    slug: 'decorative-frames',
    description: 'Memories preserved beautifully — handcrafted resin photo frames that turn your photos into art.',
    image: '/images/categories/deco.jpg',
    productCount: 4,
  },
  {
    id: 'cat-4',
    name: 'Resin Hanging Decor',
    slug: 'resin-hanging-decor',
    description: 'Charming handcrafted resin wall & door hangings — featuring divine Ganesh motifs, cute Krishna artwork, and custom souvenirs.',
    image: '/images/categories/haging.jpg',
    productCount: 3,
  },
  {
    id: 'cat-5',
    name: 'Custom Creations',
    slug: 'custom-creations',
    description: 'Made uniquely for you — tell us your idea and we\'ll bring it to life with our handcrafted resin art.',
    image: '/images/categories/custom.jpg',
    productCount: 0,
  },
];

export const products: Product[] = [
  // ========== RESIN CLOCKS ==========
  {
    id: 'prod-1',
    name: 'Classic Geode Resin Clock',
    slug: 'classic-geode-resin-clock-10-inch',
    category: 'Resin Clocks',
    categorySlug: 'resin-clocks',
    description: 'Bring a touch of handcrafted elegance to your space with our Classic Geode Resin Clock. Each piece is carefully poured, layered and finished by hand, creating a unique combination of colour, texture and natural artistic movement. The geode-inspired design features rich resin layers with gold foil accents and crushed crystal details. No two pieces are exactly alike — making this a truly one-of-a-kind addition to your home.',
    shortDescription: 'Handcrafted geode-inspired resin wall clock with gold accents.',
    price: 3200,
    images: ['/images/products/clock-1.jpg', '/images/products/clock-3.jpg', '/images/products/clock-5.jpg'],
    thumbnail: '/images/products/clock-1.jpg',
    sizes: [
      { label: '14 inch', value: '14-inch', price: 3200, stock: 5 },
      { label: '16 inch', value: '16-inch', price: 3500, stock: 4 },
      { label: '18 inch', value: '18-inch', price: 4000, stock: 4 },
      { label: '20 inch', value: '20-inch', price: 4200, stock: 4 },
    ],
    colors: ['Rose Gold', 'Ocean Blue', 'Emerald Green', 'Royal Purple'],
    customizable: true,
    featured: true,
    bestSeller: true,
    stock: 9,
    sku: 'PM-RC-CG-10',
    weight: '800g',
    dimensions: '10 inches diameter',
    material: 'Premium epoxy resin, gold foil, crushed crystals, clock mechanism',
    careInstructions: 'Wipe gently with a soft dry cloth. Avoid direct sunlight for prolonged periods. Do not use chemical cleaners. Handle with care.',
    shippingInfo: 'Carefully packed in protective packaging. Ships within 5-7 business days. Free shipping on orders above ₹2,000.',
    rating: 4.8,
    reviewCount: 34,
    createdAt: '2025-01-15',
    updatedAt: '2026-08-01',
  },
  {
    id: 'prod-2',
    name: 'Classic Resin Clock',
    slug: 'classic-resin-clock-12-inch',
    category: 'Resin Clocks',
    categorySlug: 'resin-clocks',
    description: 'Bring a touch of handcrafted elegance to your space with our Classic Resin Clock. The larger 12-inch size makes a stunning statement piece. Each piece is carefully poured, layered and finished by hand, creating a unique combination of colour, texture and natural artistic movement. Features rich resin layers with gold foil accents and crushed crystal details.',
    shortDescription: 'Larger 12-inch resin clock — a stunning wall statement piece.',
    price: 3000,
    images: ['/images/products/clock-2.jpg', '/images/products/clock-4.jpg', '/images/products/clock3.png'],
    thumbnail: '/images/products/clock-2.jpg',
    sizes: [
      { label: '14 inch', value: '14-inch', price: 3000, stock: 4 },
      { label: '16 inch', value: '16-inch', price: 3500, stock: 4 },
      { label: '18 inch', value: '18-inch', price: 4000, stock: 4 },
      { label: '20 inch', value: '20-inch', price: 4500, stock: 4 },
    ],
    colors: ['Rose Gold', 'Ocean Blue', 'Emerald Green', 'Royal Purple'],
    customizable: true,
    featured: true,
    bestSeller: false,
    stock: 4,
    sku: 'PM-RC-CG-12',
    weight: '1.1kg',
    dimensions: '12 inches diameter',
    material: 'Premium epoxy resin, gold foil, crushed crystals, clock mechanism',
    careInstructions: 'Wipe gently with a soft dry cloth. Avoid direct sunlight for prolonged periods. Do not use chemical cleaners. Handle with care.',
    shippingInfo: 'Carefully packed in protective packaging. Ships within 5-7 business days. Free shipping on orders above ₹2,000.',
    rating: 4.9,
    reviewCount: 22,
    createdAt: '2025-02-10',
    updatedAt: '2026-08-01',
  },
  // ========== POOJA THALIS ==========
  {
    id: 'prod-7',
    name: 'Handcrafted Resin Pooja Thali',
    slug: 'handcrafted-resin-pooja-thali-8-inch',
    category: 'Pooja Thalis',
    categorySlug: 'pooja-thalis',
    description: 'Beautifully handcrafted to add an artistic touch to your sacred moments. Each pooja thali is carefully designed with resin details, embedded flowers and metallic accents, finished with attention to every small element. The 8-inch size is perfect for daily pooja or as a thoughtful gift for festivals and celebrations.',
    shortDescription: 'Artistic resin pooja thali with embedded flowers and metallic accents.',
    price: 600,
    images: ['/images/products/pooja.jpg', '/images/products/pooja2.png', '/images/products/pooja3.jpg'],
    thumbnail: '/images/products/pooja.jpg',
    sizes: [
      { label: '4 inch', value: '4-inch', price: 600, stock: 8 },
      { label: '6 inch', value: '6-inch', price: 850, stock: 6 },
      { label: '8 inch', value: '8-inch', price: 1000, stock: 4 },
      { label: '10 inch', value: '10-inch', price: 1150, stock: 4 },
      { label: '12 inch', value: '12-inch', price: 1400, stock: 4 },
    ],
    colors: ['Red & Gold', 'White & Gold', 'Pink & Gold', 'Green & Gold'],
    customizable: true,
    featured: true,
    bestSeller: true,
    stock: 18,
    sku: 'PM-PT-HR-08',
    weight: '400g',
    dimensions: '8 inches diameter',
    material: 'Premium epoxy resin, preserved flowers, metallic pigments, gold foil',
    careInstructions: 'Wipe with a soft dry cloth. Keep away from extreme heat. Do not immerse in water. Handle with care.',
    shippingInfo: 'Gift-wrapped and packed securely. Ships within 3-5 business days. Free shipping on orders above ₹2,000.',
    rating: 4.9,
    reviewCount: 48,
    createdAt: '2025-01-20',
    updatedAt: '2026-08-01',
  },
  {
    id: 'prod-8',
    name: 'Handcrafted Resin Pooja Thali',
    slug: 'handcrafted-resin-pooja-thali-10-inch',
    category: 'Pooja Thalis',
    categorySlug: 'pooja-thalis',
    description: 'Our medium 10-inch Handcrafted Resin Pooja Thali offers the perfect balance of size and elegance. Ideal for festive occasions, housewarming ceremonies and religious celebrations. Each thali features intricate resin work with preserved flowers, gold foil accents and a beautiful finish that makes every prayer moment special.',
    shortDescription: 'Medium 10-inch resin pooja thali — perfect for festive celebrations.',
    price: 600,
    images: ['/images/products/pooja4.jpg', '/images/products/pooja5.jpg'],
    thumbnail: '/images/products/pooja4.jpg',
    sizes: [
      { label: '4 inch', value: '4-inch', price: 600, stock: 8 },
      { label: '6 inch', value: '6-inch', price: 850, stock: 6 },
      { label: '8 inch', value: '8-inch', price: 1000, stock: 4 },
      { label: '10 inch', value: '10-inch', price: 1150, stock: 4 },
      { label: '12 inch', value: '12-inch', price: 1400, stock: 4 },
    ],
    colors: ['Red & Gold', 'White & Gold', 'Pink & Gold', 'Green & Gold'],
    customizable: true,
    featured: false,
    bestSeller: false,
    stock: 6,
    sku: 'PM-PT-HR-10',
    weight: '550g',
    dimensions: '10 inches diameter',
    material: 'Premium epoxy resin, preserved flowers, metallic pigments, gold foil',
    careInstructions: 'Wipe with a soft dry cloth. Keep away from extreme heat. Do not immerse in water. Handle with care.',
    shippingInfo: 'Gift-wrapped and packed securely. Ships within 3-5 business days. Free shipping on orders above ₹2,000.',
    rating: 4.7,
    reviewCount: 25,
    createdAt: '2025-02-15',
    updatedAt: '2026-08-01',
  },
  {
    id: 'prod-9',
    name: 'Handcrafted Resin Pooja Thali',
    slug: 'handcrafted-resin-pooja-thali-12-inch',
    category: 'Pooja Thalis',
    categorySlug: 'pooja-thalis',
    description: 'Our largest and most elaborate Handcrafted Resin Pooja Thali at 12 inches. This premium thali is perfect for grand celebrations, weddings and special religious ceremonies. The generous size allows for more intricate resin detailing, with cascading flower arrangements, rich gold accents and a truly luxurious finish.',
    shortDescription: 'Premium 12-inch resin pooja thali — ideal for grand celebrations.',
    price: 600,
    images: ['/images/products/pooja6.jpg', '/images/products/pooja7.jpg'],
    thumbnail: '/images/products/pooja6.jpg',
    sizes: [
      { label: '4 inch', value: '4-inch', price: 600, stock: 8 },
      { label: '6 inch', value: '6-inch', price: 850, stock: 6 },
      { label: '8 inch', value: '8-inch', price: 1000, stock: 4 },
      { label: '10 inch', value: '10-inch', price: 1150, stock: 4 },
      { label: '12 inch', value: '12-inch', price: 1400, stock: 4 },
    ],
    colors: ['Red & Gold', 'White & Gold', 'Pink & Gold', 'Green & Gold'],
    customizable: true,
    featured: false,
    bestSeller: false,
    stock: 4,
    sku: 'PM-PT-HR-12',
    weight: '750g',
    dimensions: '12 inches diameter',
    material: 'Premium epoxy resin, preserved flowers, metallic pigments, gold foil',
    careInstructions: 'Wipe with a soft dry cloth. Keep away from extreme heat. Do not immerse in water. Handle with care.',
    shippingInfo: 'Gift-wrapped and packed securely. Ships within 5-7 business days. Free shipping on orders above ₹2,000.',
    rating: 4.8,
    reviewCount: 16,
    createdAt: '2025-03-10',
    updatedAt: '2026-08-01',
  },

  // ========== DECORATIVE FRAMES ==========
  {
    id: 'prod-10',
    name: 'Decorative Photo Frame with Stand',
    slug: 'decorative-photo-frame-6-inch',
    category: 'Decorative Frames',
    categorySlug: 'decorative-frames',
    description: 'Turn a favourite memory into a timeless piece of decor. Our handcrafted resin photo frames combine your personal photograph with artistic detailing to create a meaningful keepsake. The 6-inch frame is perfect for a desk, shelf or bedside table. Each frame features elegant resin borders with preserved flower elements and gold accents.',
    shortDescription: 'Handcrafted resin photo frame — turn memories into timeless decor.',
    price: 750,
    images: ['/images/products/deco.jpg', '/images/products/deco2.jpg', '/images/products/deco3.png'],
    thumbnail: '/images/products/deco.jpg',
    sizes: [
      { label: '6 inch', value: '6-inch', price: 750, stock: 10 },
      { label: '8 inch', value: '8-inch', price: 800, stock: 7 },
      { label: '10 inch', value: '10-inch', price: 1500, stock: 5 },
      { label: '12 inch', value: '12-inch', price: 2500, stock: 3 },
    ],
    colors: ['Rose Gold', 'White & Gold', 'Pastel Pink', 'Natural'],
    customizable: true,
    featured: true,
    bestSeller: true,
    stock: 25,
    sku: 'PM-DF-PF-06',
    weight: '300g',
    dimensions: '6 inches',
    material: 'Premium epoxy resin, preserved flowers, gold foil, photo-safe backing, stand',
    careInstructions: 'Wipe with a soft dry cloth. Avoid direct sunlight to protect photos. Do not immerse in water.',
    shippingInfo: 'Packed in protective box with foam padding. Ships within 3-5 business days. Free shipping on orders above ₹2,000.',
    rating: 4.8,
    reviewCount: 52,
    createdAt: '2025-01-25',
    updatedAt: '2026-08-01',
  },
  {
    id: 'prod-12',
    name: 'Decorative Name Plate',
    slug: 'decorative-name-plate-10-inch',
    category: 'Decorative Frames',
    categorySlug: 'decorative-frames',
    description: 'The 10-inch Decorative Name Plate makes a stunning display piece. The larger size allows for more intricate resin detailing and a more dramatic presentation of your favourite photograph. Handcrafted with premium resin, preserved flowers and gold accents, this frame transforms any photo into a work of art.',
    shortDescription: 'Stunning 10-inch frame with intricate resin detailing.',
    price: 4000,
    images: ['/images/products/decoretive2.jpg', '/images/products/decoretive3.jpg', '/images/products/decoretive.jpg'],
    thumbnail: '/images/products/decoretive2.jpg',
    sizes: [
      { label: '10 * 12 inch', value: '10 * 12-inch', price: 4000, stock: 5 },
      { label: '12 * 16 inch', value: '12 * 16-inch', price: 4500, stock: 3 },
    ],
    colors: ['Rose Gold', 'White & Gold', 'Pastel Pink', 'Natural'],
    customizable: true,
    featured: false,
    bestSeller: false,
    stock: 5,
    sku: 'PM-DF-PF-10',
    weight: '600g',
    dimensions: '10 inches',
    material: 'Premium epoxy resin, preserved flowers, gold foil, photo-safe backing, stand',
    careInstructions: 'Wipe with a soft dry cloth. Avoid direct sunlight to protect photos. Do not immerse in water.',
    shippingInfo: 'Packed in protective box with foam padding. Ships within 5-7 business days. Free shipping on orders above ₹2,000.',
    rating: 4.9,
    reviewCount: 19,
    createdAt: '2025-03-15',
    updatedAt: '2026-08-01',
  },
  {
    id: 'prod-13',
    name: 'Personalized Resin Table Top',
    slug: 'personalized-resin-table-top',
    category: 'Table Top',
    categorySlug: 'table-top',
    description: 'Our premium personalized resin table top is a beautiful centerpiece designed to preserve special memories in an elegant and artistic way. Featuring handcrafted resin work with preserved flowers, crushed crystals, and gold leaf detailing, it adds a luxurious and personal touch to any home, wedding, family celebration, or special occasion. Available in multiple sizes, each piece is carefully crafted to create a unique keepsake that combines functionality with timeless beauty.',
    shortDescription: 'Premium personalized resin table top — beautiful centerpiece designed to preserve special memories.',
    price: 6500,
    images: ['/images/products/tabletop2.jpg', '/images/products/tabletop1.jpg'],
    thumbnail: '/images/products/tabletop2.jpg',
    sizes: [
      { label: '12 * 12 * 2 inch', value: '12 * 12 * 2-inch', price: 6500, stock: 10 },
      { label: '14 * 14 * 2 inch', value: '14 * 14 * 2-inch', price: 7500, stock: 7 },
      { label: '16 * 16 * 2 inch', value: '16 * 16 * 2-inch', price: 8500, stock: 5 },
    ],
    colors: ['Rose Gold', 'White & Gold', 'Pastel Pink', 'Natural'],
    customizable: true,
    featured: false,
    bestSeller: false,
    stock: 3,
    sku: 'PM-DF-PF-12',
    weight: '800g',
    dimensions: '12 inches',
    material: 'Premium epoxy resin, preserved flowers, gold leaf, crushed crystals, photo-safe backing, stand',
    careInstructions: 'Wipe with a soft dry cloth. Avoid direct sunlight to protect photos. Do not immerse in water. Handle with care.',
    shippingInfo: 'Packed in premium protective box. Ships within 5-7 business days. Free shipping included.',
    rating: 4.7,
    reviewCount: 11,
    createdAt: '2025-04-01',
    updatedAt: '2026-08-01',
  },

  // ========== RESIN HANGING DECOR ==========
  {
    id: 'prod-15',
    name: 'Handcrafted Resin Ganesh Car Hanging',
    slug: 'handcrafted-resin-ganesh-wall-hanging',
    category: 'Resin Hanging Decor',
    categorySlug: 'resin-hanging-decor',
    description: 'Add divine grace and elegance to your sacred space with our Handcrafted Resin Ganesh Car Hanging. Featuring an intricate, elegant Ganesh design set inside a decorative scalloped, floral-shaped resin border. Embellished with shimmering gold flakes and metallic accents along the rim, each piece comes complete with a decorative hanging cord. Ideal for pooja rooms, home entrance doors, festive decoration, and sacred gifting.',
    shortDescription: 'Decorative resin Ganesh car hanging with gold flakes, scalloped floral edge & hanging thread.',
    price: 650,
    images: ['/images/products/haging.jpg', '/images/products/haging2.jpg', '/images/products/haging3.jpg'],
    thumbnail: '/images/products/haging.jpg',
    sizes: [
      { label: '2 inch', value: '2-inch', price: 180, stock: 12 },
      { label: '3 inch', value: '3-inch', price: 200, stock: 12 },
      { label: '4 inch', value: '4-inch', price: 250, stock: 8 },
    ],
    colors: ['Red & Gold', 'Pink & Gold', 'Purple & Gold', 'Blue & Gold', 'Green & Gold'],
    customizable: true,
    featured: true,
    bestSeller: true,
    stock: 20,
    sku: 'PM-HD-GN-06',
    weight: '250g',
    dimensions: '6 inches diameter (excluding thread)',
    material: 'High-grade epoxy resin, gold leaf flakes, metallic pigments, decorative hanging cord',
    careInstructions: 'Wipe gently with a soft dry cloth. Avoid exposure to high temperatures and direct sunlight.',
    shippingInfo: 'Individually gift wrapped in protective bubble box. Ships within 3-5 business days.',
    rating: 4.9,
    reviewCount: 28,
    createdAt: '2026-08-10',
    updatedAt: '2026-08-15',
  },
  {
    id: 'prod-16',
    name: 'Custom Resin Krishna Magnets Hanging',
    slug: 'custom-resin-krishna-magnets-hanging',
    category: 'Resin Hanging Decor',
    categorySlug: 'resin-hanging-decor',
    description: 'Celebrate charm and devotion with our Custom Resin Krishna Hanging. Crafted in a round scalloped floral shape, this piece features a cute Krishna artwork centered on a rich royal blue resin backdrop with gold decorative accents and an intricate floral rim. Comes ready to hang with a durable decorative thread/cord. Perfect for pooja rooms, children\'s rooms, doors, and memorable gifts.',
    shortDescription: 'Round scalloped resin hanging with cute Krishna artwork, blue background & gold accents.',
    price: 200,
    images: ['/images/products/krishna3.jpg', '/images/products/krishna2.jpg', '/images/products/krishna3.jpg'],
    thumbnail: '/images/products/krishna3.jpg',
    sizes: [
      { label: '2 inch', value: '2-inch', price: 200, stock: 10 },
      { label: '3 inch', value: '3-inch', price: 250, stock: 10 },
      { label: '4 inch', value: '4-inch', price: 350, stock: 6 },
    ],
    colors: ['Royal Blue & Gold', 'Sky Blue & Silver', 'Navy & Rose Gold'],
    customizable: true,
    featured: true,
    bestSeller: false,
    stock: 16,
    sku: 'PM-HD-KR-06',
    weight: '280g',
    dimensions: '6.5 inches diameter',
    material: 'Premium epoxy resin, Krishna illustration, gold foil accents, floral scalloped border, hanging cord',
    careInstructions: 'Clean gently using a soft dry microfibre cloth. Do not use chemical sprays.',
    shippingInfo: 'Gift wrapped with care. Ships within 3-5 business days.',
    rating: 5.0,
    reviewCount: 22,
    createdAt: '2026-08-12',
    updatedAt: '2026-08-15',
  },
  {
    id: 'prod-17',
    name: 'Personalized Resin Brooch ',
    slug: 'personalized-resin-brooch',
    category: 'Resin Hanging Decor',
    categorySlug: 'resin-hanging-decor',
    description: 'Capture your favourite travels and cherished milestones with our Personalized Resin Brooch. Custom made with your preferred names, locations, landmarks, maps, photos, or custom illustrations (e.g. Canada, Andaman, city names, special dates). Features a ultra-glossy resin finish with decorative borders and gold leaf accents. Suitable for refrigerator doors, walls, doors, or unique gifting.',
    shortDescription: 'Custom resin travel brooch with custom names, places, landmarks & glossy finish.',
    price: 550,
    images: ['/images/products/personal.jpg', '/images/products/personal2.jpg'],
    thumbnail: '/images/products/personal.jpg',
    sizes: [
      { label: '2 inch', value: '2-inch', price: 150, stock: 15 },
      { label: '3 inch', value: '3-inch', price: 200, stock: 10 },
    ],
    colors: ['Clear & Gold', 'Ocean Blue', 'Sunset Amber', 'Custom Theme'],
    customizable: true,
    featured: true,
    bestSeller: true,
    stock: 25,
    sku: 'PM-HD-SV-05',
    weight: '200g',
    dimensions: '5 inches diameter',
    material: 'High-gloss epoxy resin, custom graphic/photo print, gold leaf, magnetic backing / hanging cord',
    careInstructions: 'Wipe clean with a soft dry cloth.',
    shippingInfo: 'Customized to order. Ships within 5-7 business days after custom details confirmation.',
    rating: 4.8,
    reviewCount: 31,
    createdAt: '2026-08-14',
    updatedAt: '2026-08-15',
  },
];

// ========== REVIEWS ==========
// Fresh store initialization — populated by authentic customer reviews
export const demoReviews: Review[] = [];

// Helper functions with live admin data synchronization
export function getLiveProducts(): Product[] {
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as unknown as { _products?: Product[] };
    if (g._products) return g._products;
  }
  return products;
}

export function getLiveCategories(): Category[] {
  if (typeof globalThis !== 'undefined') {
    const g = globalThis as unknown as { _categories?: Category[] };
    if (g._categories) return g._categories;
  }
  return categories;
}

export function getProductBySlug(slug: string): Product | undefined {
  const list = getLiveProducts();
  return list.find((p) => p.slug === slug || p.id === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const list = getLiveProducts();
  return list.filter((p) => p.categorySlug === categorySlug && (p.status || 'ACTIVE') !== 'DRAFT');
}

export function getFeaturedProducts(): Product[] {
  const list = getLiveProducts();
  return list.filter((p) => p.featured && (p.status || 'ACTIVE') === 'ACTIVE');
}

export function getBestSellers(): Product[] {
  const list = getLiveProducts();
  return list.filter((p) => p.bestSeller && (p.status || 'ACTIVE') === 'ACTIVE');
}

export function getCategoryBySlug(slug: string): Category | undefined {
  const list = getLiveCategories();
  return list.find((c) => c.slug === slug);
}

export function formatPrice(price?: number | null | string): string {
  const num = typeof price === 'number' && !isNaN(price) ? price : Number(price) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  const list = getLiveProducts();
  return list.filter((p) =>
    (p.status || 'ACTIVE') === 'ACTIVE' &&
    (p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.material.toLowerCase().includes(q))
  );
}

