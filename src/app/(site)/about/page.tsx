'use client';

// ============================================
// paint_n_meraki — ABOUT PAGE
// ============================================

import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function AboutPage() {
  return (
    <div className="pb-16 sm:pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-br from-cream via-ivory to-blush/20">
        <div className="container-custom py-16 sm:py-24 text-center">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs tracking-[0.3em] uppercase text-dusty-rose font-medium mb-4">
            ♡ Our Story
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl sm:text-5xl font-semibold text-charcoal mb-2">
            Made with Passion,
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-accent text-3xl sm:text-4xl text-dusty-rose">
            crafted with love.
          </motion.p>
        </div>
      </div>

      {/* Story */}
      <div className="container-custom py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal mb-6">The Story of paint_n_meraki</h2>
            <div className="space-y-4 text-taupe leading-relaxed">
              <p>
                Hi, I&apos;m Astha Patel — the hands, heart and creative mind behind paint_n_meraki. What started as a small passion project has grown into something truly special, all thanks to the love and support of every customer who believes in handmade art.
              </p>
              <p>
                <strong className="text-charcoal">paint_n_meraki</strong> is born from a deep love for art, creativity and the beauty of handmade things. The word &ldquo;Meraki&rdquo; is a Greek word meaning to do something with soul, creativity and love — and that&apos;s exactly what goes into every piece I create.
              </p>
              <p>
                Every creation is thoughtfully designed, carefully handcrafted using premium materials, and made with the intention of becoming something special in your space. From geode resin clocks to pooja thalis, decorative frames to custom creations — each piece is as unique as the person it&apos;s made for.
              </p>
              <p>
                Thank you for choosing handmade. Thank you for supporting a small business. And thank you for being part of the paint_n_meraki journey <span className="text-dusty-rose">♡</span>
              </p>
            </div>
            <p className="font-accent text-xl text-charcoal mt-6">Astha Patel <span className="text-dusty-rose">♡</span></p>
          </motion.div>
          <div className="rounded-3xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-cream via-blush/20 to-beige/40 relative shadow-card">
            <img
              src="/girl.png"
              alt="Astha Patel - paint_n_meraki Artist"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-16 sm:py-20">
        <div className="container-custom">
          <div className="section-heading">
            <h2>Our Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: '♡', title: 'Handmade with Love', desc: 'Every piece is carefully created by hand, ensuring each one is unique and made with genuine care.' },
              { icon: '✦', title: 'Quality Materials', desc: 'We use only premium quality resin, pigments, gold foil and other materials to ensure lasting beauty.' },
              { icon: '🎨', title: 'Artistic Expression', desc: 'Each creation is a work of art, blending form and function into something meaningful.' },
              { icon: '💫', title: 'Personalisation', desc: 'We believe every piece should be as unique as the person it belongs to.' },
              { icon: '📦', title: 'Thoughtful Packaging', desc: 'Every order is carefully packed to ensure it arrives safely and beautifully.' },
              { icon: '🤝', title: 'Customer First', desc: 'We work closely with each customer to bring their vision to life, ensuring complete satisfaction.' },
            ].map((value) => (
              <div key={value.title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-cream flex items-center justify-center text-xl">
                  {value.icon}
                </div>
                <h3 className="font-heading text-lg font-semibold text-charcoal mb-2">{value.title}</h3>
                <p className="text-sm text-taupe leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="container-custom pt-16 pb-24 sm:pb-28 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl font-semibold text-charcoal mb-4">
          Let&apos;s create something beautiful together
        </h2>
        <p className="text-taupe max-w-lg mx-auto mb-8">
          Whether you&apos;re looking for a unique home decor piece or a personalised gift, we&apos;d love to hear from you.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">
            Shop Collection <ArrowRight size={16} />
          </Link>
          <Link href="/custom-order" className="btn-secondary">
            Custom Order <Heart size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
