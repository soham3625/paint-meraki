'use client';

// ============================================
// paint_n_meraki — HOMEPAGE
// Dynamic Storefront synchronized with Admin Panel
// ============================================

import Link from 'next/link';
import { ArrowRight, Heart, Sparkles, Package, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  products as defaultProducts,
  categories as defaultCategories,
  demoReviews as defaultReviews,
  formatPrice,
} from '@/lib/data/products';
import ProductCard from '@/components/product/ProductCard';
import Rating from '@/components/ui/Rating';
import type { Product, Category, Review, HomepageConfig, BusinessSettings } from '@/types';

// Helper to sanitize and normalize image paths
function normalizeImagePath(path?: string): string {
  if (!path) return '';
  const trimmed = path.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/?public\//, '/');
  return clean.startsWith('/') ? clean : `/${clean}`;
}

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const [productsList, setProductsList] = useState<Product[]>(defaultProducts);
  const [categoriesList, setCategoriesList] = useState<Category[]>(defaultCategories);
  const [reviewsList, setReviewsList] = useState<Review[]>(defaultReviews);
  const [homepageConfig, setHomepageConfig] = useState<Partial<HomepageConfig>>({
    heroHeading: 'Art That Speaks to Your Soul',
    heroSubtitle: 'Handcrafted Resin Masterpieces & Custom Decor',
    heroDescription: 'Every piece at paint_n_meraki is meticulously handcrafted with love, precision, and artistic passion by Astha Patel.',
    heroButtonText: 'Explore Collection',
    heroButtonLink: '/shop',
    heroImage: '/images/categories/clock-2.jpg',
    heroEnabled: true,
    resinClocksImage: '/images/products/clock-6.png',
  });
  const [settings, setSettings] = useState<Partial<BusinessSettings>>({
    whatsappNumber: '919878541310',
    instagramUrl: 'https://www.instagram.com/paint_n_meraki',
  });
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    // Synchronize live data from Public Storefront Endpoints
    async function loadLiveData() {
      try {
        const [prodsRes, catsRes, revsRes, homeRes, settRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/reviews'),
          fetch('/api/homepage'),
          fetch('/api/settings'),
        ]);

        if (prodsRes.ok) {
          const prodsData = await prodsRes.json();
          if (Array.isArray(prodsData) && prodsData.length > 0) {
            setProductsList(prodsData);
          }
        }
        if (catsRes.ok) {
          const catsData = await catsRes.json();
          if (Array.isArray(catsData) && catsData.length > 0) {
            setCategoriesList(catsData);
          }
        }
        if (revsRes.ok) {
          const revsData = await revsRes.json();
          if (Array.isArray(revsData) && revsData.length > 0) {
            setReviewsList(revsData);
          }
        }
        if (homeRes.ok) {
          const homeData = await homeRes.json();
          const liveConfig = homeData.config || homeData;
          if (liveConfig && liveConfig.heroHeading) {
            setHomepageConfig(liveConfig);
          }
        }
        if (settRes.ok) {
          const settData = await settRes.json();
          if (settData) setSettings(settData);
        }
      } catch (err) {
        // Fallback to defaults
      }
    }

    loadLiveData();
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
  const resinClocksSpotlightImage = normalizeImagePath(
    homepageConfig.resinClocksImage ||
    resinClockCategory?.image ||
    resinClocks[0]?.thumbnail ||
    '/images/products/clock-6.png'
  );

  const heroImgSrc = normalizeImagePath(homepageConfig.heroImage || '/circle.png');
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
                {homepageConfig.heroHeading || 'Art from the heart,'}
              </motion.h2>
              <motion.p variants={fadeInUp} className="font-accent text-3xl sm:text-4xl lg:text-5xl text-dusty-rose mb-6">
                {homepageConfig.heroSubtitle || 'made just for you.'}
              </motion.p>
              <motion.p variants={fadeInUp} className="text-taupe text-base sm:text-lg leading-relaxed max-w-lg mb-8">
                {homepageConfig.heroDescription || 'Handcrafted resin art, personalised decor and meaningful creations made with love and attention to every detail.'}
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-wrap gap-3 mb-8">
                <Link href={homepageConfig.heroButtonLink || '/shop'} className="btn-primary">
                  {homepageConfig.heroButtonText || 'Shop Collection'} <ArrowRight size={16} />
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
                        src={category.image}
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

      {/* ========== RESIN CLOCKS SECTION ========== */}
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
                  alt="Resin Clock Collection"
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
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal to-charcoal/95" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full border border-ivory/20" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full border border-ivory/10" />
          <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full border border-ivory/15" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.p variants={fadeInUp} className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-4">
              ✦ Custom Creations
            </motion.p>
            <motion.h2 variants={fadeInUp} className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold text-ivory mb-3">
              Have Something Special in Mind?
            </motion.h2>
            <motion.p variants={fadeInUp} className="font-accent text-xl sm:text-2xl text-dusty-rose mb-6">
              Let&apos;s turn your idea into something beautiful.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-ivory/60 max-w-xl mx-auto mb-8 leading-relaxed">
              From personalised clocks and photo frames to completely custom resin creations, tell us what you imagine and we&apos;ll create it for you.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap justify-center gap-3">
              <Link href="/custom-order" className="btn-rose">
                Request Custom Order <ArrowRight size={16} />
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary border-ivory/30 text-ivory hover:bg-ivory hover:text-charcoal"
              >
                Chat on WhatsApp
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========== ABOUT THE ARTIST ========== */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.p variants={fadeInUp} className="text-xs tracking-[0.2em] uppercase text-dusty-rose font-medium mb-4">
                ♡ About the Artist
              </motion.p>
              <motion.h2 variants={fadeInUp} className="font-heading text-3xl sm:text-4xl font-semibold text-charcoal mb-1">
                Made with Passion,
              </motion.h2>
              <motion.p variants={fadeInUp} className="font-accent text-2xl sm:text-3xl text-dusty-rose mb-6">
                crafted with love.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-taupe leading-relaxed mb-4">
                Hi, I&apos;m Astha Patel, the hands and heart behind paint_n_meraki. Every piece you see here is thoughtfully handmade with premium quality materials and a lot of love. Thank you for supporting handmade!
              </motion.p>
              <motion.p variants={fadeInUp} className="text-taupe leading-relaxed mb-6">
                paint_n_meraki is born from a love for art, creativity and meaningful handmade pieces. Every creation is thoughtfully designed, carefully handcrafted and made with the intention of becoming something special in your space.
              </motion.p>
              <motion.div variants={fadeInUp} className="mb-6">
                <p className="font-accent text-xl text-charcoal">Astha Patel <span className="text-dusty-rose">♡</span></p>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link href="/about" className="btn-secondary">
                  Read Our Story <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-cream via-blush/20 to-beige/50 relative shadow-card"
            >
              <img
                src="/girl-2.png"
                alt="Astha Patel - paint_n_meraki Artist"
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== HOW IT'S MADE ========== */}
      <section className="py-16 sm:py-20 lg:py-24 bg-cream/50">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="section-heading"
          >
            <motion.h2 variants={fadeInUp}>How It&apos;s Made</motion.h2>
            <motion.p variants={fadeInUp}>Every creation goes through a careful handmade process.</motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          >
            {[
              { step: '01', title: 'Design', desc: 'Every creation begins with an idea.' },
              { step: '02', title: 'Create', desc: 'Carefully handcrafted using premium materials.' },
              { step: '03', title: 'Finish', desc: 'Every detail is checked and polished.' },
              { step: '04', title: 'Deliver', desc: 'Beautifully packed and safely delivered to you.' },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeInUp} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-dusty-rose/10 flex items-center justify-center">
                  <span className="font-heading text-xl font-semibold text-dusty-rose">{item.step}</span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-charcoal mb-2">{item.title}</h3>
                <p className="text-sm text-taupe">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== TRUST / VALUE BADGES ========== */}
      <section className="py-12 sm:py-16 border-y border-beige/50">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12">
            {[
              { icon: '♡', title: 'Handmade', desc: 'Created with care' },
              { icon: '✦', title: 'Premium Quality', desc: 'Quality materials' },
              { icon: '♡', title: 'Personalised', desc: 'Made for you' },
              { icon: '📦', title: 'Secure Packaging', desc: 'Packed with care' },
              { icon: '♡', title: 'Small Business', desc: 'Your support matters' },
            ].map((item) => (
              <div key={item.title} className="text-center flex-shrink-0">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-cream flex items-center justify-center text-lg">
                  {item.icon}
                </div>
                <p className="text-sm font-medium text-charcoal">{item.title}</p>
                <p className="text-xs text-taupe">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CUSTOMER REVIEWS ========== */}
      {reviewsList.length > 0 && (
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="container-custom">
            <div className="section-heading">
              <h2>What Our Customers Say</h2>
              <p>Real reviews from real customers. Thank you for your love!</p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                {reviewsList.slice(reviewIndex, reviewIndex + 3).map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-2xl p-6 shadow-soft border border-beige/30"
                  >
                    <Rating value={review.rating} size="sm" />
                    <p className="text-sm text-charcoal/80 mt-3 mb-4 leading-relaxed italic">
                      &ldquo;{review.review}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-charcoal">
                          – {review.customerName} <span className="text-dusty-rose">♡</span>
                        </p>
                        {review.productName && (
                          <p className="text-xs text-taupe mt-0.5">{review.productName}</p>
                        )}
                      </div>
                      {review.verified && (
                        <span className="text-[10px] text-success font-medium">✓ Verified</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation arrows */}
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
