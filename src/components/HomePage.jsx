import { products as localProducts, categories as localCategories } from '@/data/products';
import { ProductCard } from '@/components/ProductCard';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Star, Shield, Truck, RefreshCw, Headphones, ChevronRight, Play, Zap } from 'lucide-react';
import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { getProducts } from '@/api/products';
import { getCategories } from '@/api/categories';

const trustBadges = [
  { icon: Truck, label: 'Free Shipping', sub: 'On orders $100+' },
  { icon: Shield, label: 'Secure Payment', sub: '256-bit SSL encrypted' },
  { icon: RefreshCw, label: 'Easy Returns', sub: '30-day hassle-free' },
  { icon: Headphones, label: '24/7 Support', sub: 'Always here to help' },
];

const stats = [
  { value: '2M+', label: 'Happy Customers' },
  { value: '50K+', label: 'Products' },
  { value: '180+', label: 'Countries' },
  { value: '4.9★', label: 'Avg Rating' },
];

const testimonials = [
  { id: 1, name: 'Sarah Chen', role: 'Fashion Director', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', rating: 5, text: 'Absolutely incredible experience. The quality exceeded my expectations and delivery was lightning fast. My new go-to for premium shopping.', product: 'Luxe Leather Tote Bag' },
  { id: 2, name: 'Marcus Williams', role: 'Tech Entrepreneur', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', rating: 5, text: 'The Apex Smartwatch is a game-changer. Battery life is insane and the health tracking is incredibly accurate. Worth every penny.', product: 'Apex Smartwatch Ultra' },
  { id: 3, name: 'Priya Patel', role: 'Lifestyle Blogger', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', rating: 5, text: 'Found my favorite brand here. The curation is exceptional — everything is premium, authentic, and arrives beautifully packaged.', product: 'Merino Cashmere Sweater' },
];

function mapDbProduct(p) {
  return {
    id: p._id || p.id,
    name: p.name,
    brand: p.brand,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    rating: Number(p.rating) || 4.5,
    reviews: p.review_count || 0,
    category: p.category_id?.name || '',
    subcategory: p.subcategory || '',
    image: p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    images: p.images || [],
    badge: p.badge,
    inStock: true,
    colors: p.colors || [],
    sizes: p.sizes || [],
    description: p.description || '',
    features: p.features || [],
    isFeatured: p.is_featured,
  };
}

import { useSearchParams } from 'react-router-dom';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const activeBadge = searchParams.get('badge');
  const viewAll = searchParams.get('viewAll') === 'true';
  const [activeTab, setActiveTab] = useState('featured');

  const { data: dbCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const data = await getCategories();
      return data || [];
    },
  });

  // Resolve category slug to ID if dbCategories is available, or use as is
  const categoriesList = dbCategories || localCategories;
  const resolvedCategory = activeCategory
    ? categoriesList.find(c => c.id === activeCategory || c.name.toLowerCase() === activeCategory.toLowerCase())?.id || activeCategory
    : null;

  const { data: dbProducts } = useQuery({
    queryKey: ['products', resolvedCategory, searchQuery, activeBadge],
    queryFn: async () => {
      const params = { limit: 100 };
      if (resolvedCategory) params.category = resolvedCategory;
      if (searchQuery) params.search = searchQuery;
      if (activeBadge) params.badge = activeBadge;

      const data = await getProducts(params);
      return data.products || data || [];
    },
  });


  const products = dbProducts?.length ? dbProducts.map(mapDbProduct) : localProducts;
  const categories = dbCategories?.length ? dbCategories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon || '🛍️',
    image: c.image_url || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    count: '',
    color: 'from-primary to-primary',
  })) : localCategories;

  const featured = products.filter(p => p.isFeatured);
  const bestsellers = products.filter(p => p.badge === 'Best Seller');
  const newProducts = products.filter(p => p.badge === 'New');
  const displayProducts = activeTab === 'featured' ? (featured.length ? featured : products)
    : activeTab === 'bestsellers' ? (bestsellers.length ? bestsellers : products)
      : (newProducts.length ? newProducts : products);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative min-h-[88vh] flex items-center overflow-hidden gradient-hero">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, hsl(24 95% 53%) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(45 90% 55%) 0%, transparent 50%)' }} />
          <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }} className="absolute right-[10%] top-[15%] w-64 h-64 rounded-3xl overflow-hidden shadow-xl-custom opacity-90 hidden lg:block">
            <img src={products[2]?.image || ''} alt="" className="w-full h-full object-cover" />
          </motion.div>
          <motion.div animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 1 }} className="absolute right-[20%] bottom-[15%] w-44 h-44 rounded-2xl overflow-hidden shadow-xl-custom opacity-80 hidden xl:block">
            <img src={products[3]?.image || ''} alt="" className="w-full h-full object-cover" />
          </motion.div>

          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-2xl">
              <motion.div
                onClick={() => {
                  setSearchParams({ badge: 'New' });
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 glass-dark text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-6 font-body cursor-pointer hover:bg-white/10 transition-colors"
              >
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot" />
                New Season Collection 2025 · Just Arrived
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
                Discover<br /><span className="text-gradient">Premium</span><br />Products
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-white/70 text-lg font-body font-light leading-relaxed mb-8 max-w-lg">
                Curated collections from the world's most innovative brands. Premium quality, exceptional value.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex flex-wrap gap-4 mb-12">
                <motion.a href="#products" className="gradient-orange text-white px-8 py-4 rounded-2xl font-semibold font-body text-base shadow-brand flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Shop Now <ArrowRight className="h-4 w-4" />
                </motion.a>
                <motion.a href="#categories" className="glass text-foreground px-8 py-4 rounded-2xl font-semibold font-body text-base flex items-center gap-2 hover:bg-white/95 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Play className="h-4 w-4 fill-current text-primary" /> Browse Categories
                </motion.a>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="flex flex-wrap gap-6">
                {stats.map((stat) => (<div key={stat.label} className="text-center">
                  <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/60 font-body">{stat.label}</p>
                </div>))}
              </motion.div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" fill="none" className="w-full" preserveAspectRatio="none">
              <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="hsl(var(--background))" />
            </svg>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-10 border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {trustBadges.map((badge, i) => (<motion.div key={badge.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                  <badge.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground font-body">{badge.label}</p>
                  <p className="text-xs text-muted-foreground font-body">{badge.sub}</p>
                </div>
              </motion.div>))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-background" id="categories">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-primary font-semibold text-sm uppercase tracking-widest font-body mb-2">Browse by Category</motion.p>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-4xl font-bold text-foreground">Shop Every Style</motion.h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => (<motion.div key={cat.id} onClick={() => {
                setSearchParams(prev => {
                  prev.set('category', cat.id);
                  // Clear search when selecting category? Standard e-com behavior varies. Let's keep it simple.
                  prev.delete('search');
                  return prev;
                });
                // Scroll to products
                document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
              }} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} whileHover={{ y: -6 }} className="group relative rounded-2xl overflow-hidden aspect-square cursor-pointer shadow-card hover:shadow-card-hover transition-all duration-300">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 text-center">
                  <span className="text-2xl mb-1">{cat.icon}</span>
                  <p className="font-display font-bold text-white text-sm leading-tight">{cat.name}</p>
                  {'count' in cat && cat.count && <p className="text-white/70 text-[10px] font-body mt-0.5">{cat.count}</p>}
                </div>
              </motion.div>))}
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-20 bg-secondary/30" id="products">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-primary font-semibold text-sm uppercase tracking-widest font-body mb-2">
                  {searchQuery ? 'Search Results' : activeCategory ? 'Category' : activeBadge ? 'filtered collection' : 'Handpicked For You'}
                </p>
                <h2 className="font-display text-4xl font-bold text-foreground">
                  {searchQuery ? `"${searchQuery}"` : activeCategory ? categories.find(c => c.id === activeCategory)?.name || activeCategory : activeBadge ? `${activeBadge} Items` : 'Trending Now'}
                </h2>
                {(searchQuery || activeCategory || activeBadge) && (
                  <button
                    onClick={() => setSearchParams({})}
                    className="text-sm text-muted-foreground hover:text-primary mt-2 underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="flex gap-1 bg-card rounded-2xl p-1.5 border border-border self-start sm:self-auto">
                {['featured', 'bestsellers', 'new'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-semibold font-body capitalize transition-all ${activeTab === tab ? 'gradient-orange text-white shadow-brand' : 'text-muted-foreground hover:text-foreground'}`}>
                  {tab === 'bestsellers' ? 'Best Sellers' : tab === 'new' ? 'New' : 'Featured'}
                </button>))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(searchQuery || activeCategory || activeBadge || viewAll
                ? products
                : displayProducts.slice(0, 8)
              ).map(product => (<ProductCard key={product.id} product={product} />))}

              {products.length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                  No products found.
                </div>
              )}
            </div>
            <div className="text-center mt-10">
              {!viewAll && !searchQuery && !activeCategory && !activeBadge && (
                <motion.button
                  onClick={() => setSearchParams({ viewAll: 'true' })}
                  className="px-8 py-4 border-2 border-primary text-primary rounded-2xl font-semibold font-body hover:gradient-orange hover:text-white hover:border-transparent transition-all duration-300 inline-flex items-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Products <ChevronRight className="h-4 w-4" />
                </motion.button>
              )}
              {(viewAll || searchQuery || activeCategory || activeBadge) && (
                <button
                  onClick={() => {
                    setSearchParams({});
                    // Scroll to top of products
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-secondary text-foreground rounded-2xl font-semibold font-body hover:bg-border transition-all duration-300 inline-flex items-center gap-2"
                >
                  Reset View
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Flash Sale Banner */}
        <section className="py-8 container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden gradient-hero min-h-[280px] flex items-center">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, hsl(24 95% 53%) 0%, transparent 60%)' }} />
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative z-10 px-10 py-10 max-w-lg">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest font-body mb-3">Limited Time Offer</p>
              <h2 className="font-display text-4xl font-bold text-white mb-3">Flash Sale<br /><span className="text-gradient">Up to 60% OFF</span></h2>
              <p className="text-white/70 font-body text-sm mb-6">On selected premium brands. Today only.</p>
              <motion.button
                onClick={() => {
                  setSearchParams({ badge: 'Sale' });
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="gradient-orange text-white px-7 py-3.5 rounded-2xl font-bold font-body shadow-brand flex items-center gap-2"
                whileTap={{ scale: 0.97 }}
              >
                Shop the Sale <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-primary font-semibold text-sm uppercase tracking-widest font-body mb-2">Social Proof</p>
              <h2 className="font-display text-4xl font-bold text-foreground">Loved by Millions</h2>
              <div className="flex items-center justify-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => <Star key={`hero-star-${i}`} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
                <span className="text-muted-foreground font-body text-sm ml-2">4.9/5 from 2M+ reviews</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (<motion.div key={t.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-secondary/50 rounded-3xl p-6 border border-border hover:shadow-card-hover transition-all duration-300">
                <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, j) => <Star key={`review-star-${t.id}-${j}`} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-foreground font-body text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold text-sm text-foreground font-body">{t.name}</p>
                    <p className="text-xs text-muted-foreground font-body">{t.role} · Purchased {t.product}</p>
                  </div>
                </div>
              </motion.div>))}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-primary font-semibold text-sm uppercase tracking-widest font-body mb-3">Stay in the loop</p>
              <h2 className="font-display text-4xl font-bold text-foreground mb-4">Get Early Access to Drops</h2>
              <p className="text-muted-foreground font-body mb-8">Join 500K+ subscribers and be first to know about flash sales, new arrivals, and exclusive deals.</p>
              <div className="flex gap-3 max-w-md mx-auto">
                <input type="email" placeholder="Enter your email" className="flex-1 px-5 py-3.5 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <motion.button className="gradient-orange text-white px-6 py-3.5 rounded-2xl font-semibold font-body text-sm shadow-brand whitespace-nowrap" whileTap={{ scale: 0.97 }}>Subscribe</motion.button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-foreground text-background py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <img src="/favicon-raistore.png" alt="RaiStore" className="w-8 h-8 rounded-lg object-contain" />
                  <span className="font-display font-bold text-xl text-background">RaiStore</span>
                </div>
                <p className="text-background/60 font-body text-sm leading-relaxed mb-4">Curating the world's best products for those who demand nothing but the finest.</p>
              </div>
              {[
                { title: 'Shop', links: ['New Arrivals', 'Best Sellers', 'Fashion', 'Electronics', 'Sale'] },
                { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Blog'] },
                { title: 'Support', links: ['Contact Us', 'Track Order', 'Returns', 'FAQ'] },
              ].map(col => (<div key={col.title}>
                <h4 className="font-display font-bold text-background mb-4">{col.title}</h4>
                <ul className="space-y-2">{col.links.map(link => <li key={link}><a href="#" className="text-background/60 hover:text-background font-body text-sm transition-colors">{link}</a></li>)}</ul>
              </div>))}
            </div>
            <div className="border-t border-background/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-background/50 font-body text-sm">© 2025 RaiStore. All rights reserved.</p>
              <a href="/admin" className="text-background/30 hover:text-background/60 font-body text-xs transition-colors">Admin</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
