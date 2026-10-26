'use client';

// ============================================
// paint_n_meraki — HOMEPAGE CLIENT COMPONENT
// Hydrates with pre-rendered server data instantly,
// eliminating any delay, flicker, or stale cache.
// ============================================

import Link from 'next/link';
import { ArrowRight, Heart, Sparkles, Package, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/data/products';
import ProductCard from '@/components/product/ProductCard';
import Rating from '@/components/ui/Rating';
import { cleanImagePath } from '@/lib/image-utils';
import type { Product, Category, Review, HomepageConfig, BusinessSettings } from '@/types';

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

interface HomePageClientProps {
  initialConfig: HomepageConfig;
  initialProducts: Product[];
  initialCategories: Category[];
  initialReviews: Review[];
  initialSettings: BusinessSettings;
}

export default function HomePageClient({
  initialConfig,
  initialProducts,
  initialCategories,
  initialReviews,
  initialSettings,
}: HomePageClientProps) {
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(initialConfig);
  const [settings, setSettings] = useState<BusinessSettings>(initialSettings);
  const [reviewIndex, setReviewIndex] = useState(0);

  // Synchronize live data in the background without stale browser caching
  useEffect(() => {
    async function refreshLiveData() {
      try {
        const [prodsRes, catsRes, revsRes, homeRes, settRes] = await Promise.all([
          fetch('/api/products', { cache: 'no-store' }),
          fetch('/api/categories', { cache: 'no-store' }),
          fetch('/api/reviews', { cache: 'no-store' }),
          fetch('/api/homepage', { cache: 'no-store' }),
          fetch('/api/settings', { cache: 'no-store' }),
        ]);

        if (prodsRes.ok) {
          const prodsData = await prodsRes.json();
          if (Array.isArray(prodsData) && prodsData.length > 0) setProductsList(prodsData);
        }
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          if (Array.isArray(catsData) && catsData.length > 0) setCategoriesList(catsData);
        }
        if (revsRes.ok) {
          const revsData = await revsRes.json();
          if (Array.isArray(revsData) && revsData.length > 0) setReviewsList(revsData);
        }
        if (homeRes.ok) {
          const homeData = await homeRes.json();
          const liveConfig = homeData.config || homeData;
          if (liveConfig && liveConfig.heroHeading) {
            setHomepageConfig((prev) => ({ ...prev, ...liveConfig }));
          }
        }
        if (settRes.ok) {
          const settData = await settRes.json();
          if (settData) setSettings(settData);
        }
      } catch (err) {
        // Silently preserve pre-rendered initial server data
      }
    }

    refreshLiveData();
  }, []);

  const activeProducts = productsList.filter((p) => (p.status || 'ACTIVE') !== 'DRAFT');
  const featuredProducts = activeProducts.filter((p) => p.featured);
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : activeProducts.slice(0, 8);

  const resinClocks = activeProducts.filter((p) => p.categorySlug === 'resin-clocks');
  const poojaThalis = activeProducts.filter((p) => p.categorySlug === 'pooja-thalis');
  const decorativeFrames = activeProducts.filter((p) => p.categorySlug === 'decorative-frames');
  const hangingDecor = activeProducts.filter((p) => p.categorySlug === 'resin-hanging-decor');

  const nextReview = () => {
    setReviewIndex((prev) => (prev + 1) % Math.max(1, reviewsList.length - 2));
  };
  const prevReview = () => {
    setReviewIndex((prev) => (prev - 1 + Math.max(1, reviewsList.length - 2)) % Math.max(1, reviewsList.length - 2));
  };

  const resinClockCategory = categoriesList.find((c) => c.slug === 'resin-clocks');
  const resinClocksSpotlightImage = cleanImagePath(
    homepageConfig.resinClocksImage ||
    resinClockCategory?.image ||
    resinClocks[0]?.thumbnail ||
    '/images/products/clock-6.png'
  );

  const heroImgSrc = cleanImagePath(homepageConfig.heroImage || '/circle.png');
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber || '919878541310'}?text=${encodeURIComponent('Hi Paint Meraki, I would like to discuss a custom order.')}`;

  return (
    <div className="pb-16 sm:pb-0">
      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden">
        <div className="container-custom py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="order-2 lg:order-1"
            >
              <motion.p variants={fadeInUp} className="text-xs tracking-[0.3em] uppercase text-dusty-rose font-medium mb-4">
                paint_n_meraki
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold text-charcoal leading-[1.1] mb-2">
                {homepageConfig.heroHeading || 'Art That Speaks to Your Soul'}
              </motion.h2>
              <motion.p variants={fadeInUp} className="font-accent text-3xl sm:text-4xl lg:text-5xl text-dusty-rose mb-6">
                {homepageConfig.heroSubtitle || 'Handcrafted Resin Masterpieces & Custom Decor'}
              </motion.p>
              <motion.p variants={fadeInUp} className="text-taupe text-base sm:text-lg leading-relaxed max-w-lg mb-8">
                {homepageConfig.heroDescription || 'Every piece at paint_n_meraki is meticulously handcrafted with love, precision, and artistic passion by Astha Patel.'}
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-8">
                <Link href={homepageConfig.heroButtonLink || '/shop'} className="btn-primary">
                  {homepageConfig.heroButtonText || 'Explore Collection'} <ArrowRight size={16} />
                </Link>
                <Link href="/custom-order" className="btn-secondary">
                  Create a Custom Piece <Heart size={14} />
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 text-sm text-taupe">
                <span className="flex items-center gap-1.5">
                  <Heart size={14} className="text-dusty-rose" /> Handmade with Love
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-dusty-rose" /> Premium Quality
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart size={14} className="text-dusty-rose" /> Made Just for You
                </span>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative">
                {/* Decorative brush stroke behind */}
                <div className="absolute -inset-4 bg-gradient-to-br from-blush/30 via-beige/20 to-dusty-rose/10 rounded-[2rem] transform rotate-2" />
                <div className="relative rounded-[1.5rem] overflow-hidden aspect-[4/5] bg-gradient-to-br from-cream via-blush/40 to-dusty-rose/20 flex items-center justify-center">
                  <img
                    src={heroImgSrc}
                    alt="paint_n_meraki Resin Art Showcase"
                    className="w-full h-full object-cover object-center shadow-card"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/circle.png';
                    }}
                  />
                  <div className="text-center p-8 absolute inset-0 flex flex-col items-center justify-center -z-10">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-dusty-rose/15 flex items-center justify-center animate-float">
                      <span className="font-accent text-dusty-rose text-4xl">PM</span>
                    </div>
                    <p className="font-heading text-lg text-charcoal/60">Handcrafted Resin Art</p>
                    <p className="text-sm text-taupe mt-1">paint_n_meraki Collection</p>
                  </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-dusty-rose/10 rounded-full" />
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-gold/10 rounded-full" />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subtle decorative botanical line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-beige to-transparent" />
      </section>

      {/* ========== SHOP BY CATEGORY ========== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="section-heading"
          >
            <motion.h2 variants={fadeInUp}>Shop by Category</motion.h2>
            <motion.p variants={fadeInUp}>Handcrafted pieces made to make your moments beautiful.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {categoriesList.map((category) => (
              <motion.div key={category.id || category.slug} variants={fadeInUp}>
                <Link
                  href={category.slug === 'custom-creations' ? '/custom-order' : `/shop/${category.slug}`}
                  className="group block"
                >
                  <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-cream to-beige/50 aspect-[3/4] relative">
                    {category.image && (
                      <img
                        src={cleanImagePath(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 relative z-0"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center -z-0">
                      <div className="w-20 h-20 rounded-full bg-dusty-rose/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <span className="font-accent text-dusty-rose text-2xl">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-20">
                      <h3 className="font-heading text-base sm:text-lg font-semibold text-ivory mb-0.5">{category.name}</h3>
                      <p className="text-ivory/70 text-xs sm:text-sm line-clamp-2 mb-2 hidden sm:block">
                        {category.description?.split('—')[0]}
                      </p>
                      <span className="text-xs text-ivory/80 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Collection <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURED PRODUCTS / MADE WITH LOVE ========== */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="section-heading"
          >
            <motion.h2 variants={fadeInUp}>Made with Love</motion.h2>
            <motion.p variants={fadeInUp}>Discover some of our most-loved creations.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {displayFeatured.slice(0, 8).map((product) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <div className="text-center mt-10">
            <Link href="/shop" className="btn-secondary">
              View All Products <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== 2. RESIN CLOCKS SHOWCASE SECTION ========== */}
      {resinClocks.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container-custom">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-10">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                <motion.p variants={fadeInUp} className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-3">
                  ✦ Resin Clocks
                </motion.p>
                <motion.h2 variants={fadeInUp} className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-4">
                  Timeless Art for Your Space
                </motion.h2>
                <motion.p variants={fadeInUp} className="text-taupe leading-relaxed mb-6">
                  Our handcrafted resin clocks combine functional design with artistic beauty, creating statement pieces that are made to last. Each clock features unique geode patterns, gold accents and crystal details.
                </motion.p>
                <motion.div variants={fadeInUp}>
                  <Link href="/shop/resin-clocks" className="btn-primary">
                    Explore Resin Clocks <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </motion.div>
              <div className="rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-cream to-blush/30 relative flex items-center justify-center">
                <img
                  src={resinClocksSpotlightImage}
                  alt="Resin Clock Collection Spotlight"
                  className="w-full h-full object-cover relative z-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/products/clock-6.png';
                  }}
                />
                <span className="font-accent text-dusty-rose/40 text-2xl absolute inset-0 flex items-center justify-center z-0">
                  Resin Clock Collection
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {resinClocks.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== POOJA THALIS SECTION ========== */}
      {poojaThalis.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="container-custom">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="section-heading"
            >
              <motion.p variants={fadeInUp} className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-3">
                ✦ Pooja Thalis
              </motion.p>
              <motion.h2 variants={fadeInUp}>Sacred Moments, Beautifully Crafted</motion.h2>
              <motion.p variants={fadeInUp}>
                Handcrafted pooja thalis designed to add elegance to your special rituals and celebrations.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
              {poojaThalis.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/shop/pooja-thalis" className="btn-secondary">
                Explore Pooja Thalis <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========== DECORATIVE FRAMES SECTION ========== */}
      {decorativeFrames.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24 bg-white">
          <div className="container-custom">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="section-heading"
            >
              <motion.p variants={fadeInUp} className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-3">
                ✦ Decorative Frames
              </motion.p>
              <motion.h2 variants={fadeInUp}>Memories, Preserved Beautifully.</motion.h2>
              <motion.p variants={fadeInUp}>
                Turn your favourite memories into timeless handmade decor. Personalisation available.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {decorativeFrames.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/shop/decorative-frames" className="btn-secondary">
                Explore Frames <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========== RESIN HANGING DECOR SECTION ========== */}
      {hangingDecor.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="container-custom">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="section-heading"
            >
              <motion.p variants={fadeInUp} className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-3">
                ✦ Resin Hanging Decor
              </motion.p>
              <motion.h2 variants={fadeInUp}>Charming Art for Doors & Walls</motion.h2>
              <motion.p variants={fadeInUp}>
                Handcrafted divine Ganesh hangings, cute Krishna artwork, and customized travel brooch.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {hangingDecor.slice(0, 3).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link href="/shop/resin-hanging-decor" className="btn-secondary">
                Explore Hanging Decor <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========== CUSTOM ORDER CTA ========== */}
      <section className="py-16 sm:py-20 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blush/40 via-beige/30 to-cream" />
        <div className="container-custom relative z-10 text-center max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeInUp} className="text-xs tracking-[0.3em] uppercase text-dusty-rose font-medium mb-3 block">
              Bespoke Creations
            </motion.span>
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal mb-4">
              Have Something Special in Mind?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-taupe text-base sm:text-lg leading-relaxed mb-8">
              From wedding garlands and preservation to custom colours, names, and bespoke designs — we bring your unique vision to life with resin art.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-4">
              <Link href="/custom-order" className="btn-primary">
                Order a Custom Piece <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Chat on WhatsApp
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== REVIEWS SECTION ========== */}
      {reviewsList.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="container-custom">
            <div className="section-heading">
              <span className="text-xs tracking-[0.3em] uppercase text-dusty-rose font-medium mb-3 block">
                Customer Love
              </span>
              <h2>What Our Patrons Say</h2>
              <p>Every piece is made with love, and our customers feel it.</p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6">
                {reviewsList.slice(reviewIndex, reviewIndex + 3).map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="card p-6 flex flex-col justify-between"
                  >
                    <div>
                      <Rating value={review.rating} size="sm" className="mb-3" />
                      <p className="text-charcoal/80 text-sm leading-relaxed mb-4 italic">
                        &quot;{review.review}&quot;
                      </p>
                    </div>
                    <div className="border-t border-beige/40 pt-3 flex items-center justify-between">
                      <span className="font-heading font-medium text-xs text-charcoal">
                        {review.customerName}
                      </span>
                      {review.verified && (
                        <span className="text-[10px] text-dusty-rose font-medium">
                          ✓ Verified Order
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {reviewsList.length > 3 && (
                <>
                  <button
                    onClick={prevReview}
                    className="absolute -left-4 sm:-left-10 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center text-taupe hover:text-charcoal transition-colors hidden md:flex"
                    aria-label="Previous reviews"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextReview}
                    className="absolute -right-4 sm:-right-10 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center text-taupe hover:text-charcoal transition-colors hidden md:flex"
                    aria-label="Next reviews"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========== INSTAGRAM SECTION ========== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container-custom">
          <div className="section-heading">
            <h2>Follow the Journey</h2>
            <p>Behind every piece is a little bit of creativity, patience and love.</p>
            <p className="text-dusty-rose text-sm font-medium mt-2">@paint_n_meraki</p>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-cream via-beige/30 to-blush/20 relative flex items-center justify-center group cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img
                  src={`/images/instagram/insta-${i + 1}.jpg`}
                  alt={`Instagram Post ${i + 1}`}
                  className="w-full h-full object-cover relative z-10 group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="text-center opacity-50 group-hover:opacity-70 transition-opacity absolute inset-0 flex flex-col items-center justify-center z-0">
                  <span className="font-accent text-dusty-rose text-sm">IG</span>
                  <p className="text-[8px] text-taupe mt-1">Photo {i + 1}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href={settings.instagramUrl || 'https://www.instagram.com/paint_n_meraki'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Follow on Instagram <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
