import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { storefrontApiRequest, PRODUCTS_QUERY } from '@/lib/shopify';
import { ShopifyProductCard } from '@/components/ShopifyProductCard';
import { ShopifyCartDrawer } from '@/components/ShopifyCartDrawer';
import { Navbar } from '@/components/Navbar';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Zap, ShoppingBag } from 'lucide-react';
const categoryTabs = [
    { id: 'all', label: 'All Products', query: null },
    { id: 'new', label: 'New Arrivals', query: 'tag:new-arrival' },
    { id: 'fashion', label: 'Fashion', query: 'product_type:Fashion OR tag:fashion' },
    { id: 'electronics', label: 'Electronics', query: 'product_type:Electronics OR tag:electronics' },
    { id: 'home', label: 'Home & Living', query: 'product_type:Home OR tag:home-living' },
    { id: 'sale', label: '🔥 Sale', query: 'tag:sale' },
];
const trustBadges = [
    { icon: Truck, label: 'Free Shipping', sub: 'On orders $100+' },
    { icon: Shield, label: 'Secure Payment', sub: '256-bit SSL encrypted' },
    { icon: RefreshCw, label: 'Easy Returns', sub: '30-day hassle-free' },
    { icon: Headphones, label: '24/7 Support', sub: 'Always here to help' },
];
export default function ShopifyStorefront() {
    const [cartOpen, setCartOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    useEffect(() => {
        const handler = (e) => {
            const tab = e.detail;
            setActiveTab(tab);
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
        };
        window.addEventListener('shopify-nav-tab', handler);
        return () => window.removeEventListener('shopify-nav-tab', handler);
    }, []);
    const activeCategory = categoryTabs.find(c => c.id === activeTab);
    const { data, isLoading } = useQuery({
        queryKey: ['shopify-products', activeTab],
        queryFn: async () => {
            const result = await storefrontApiRequest(PRODUCTS_QUERY, {
                first: 24,
                query: activeCategory.query ?? undefined,
            });
            return (result?.data?.products?.edges || []);
        },
    });
    const products = data || [];
    return (<div className="min-h-screen bg-background">
      <Navbar onCartOpen={() => setCartOpen(true)}/>
      <ShopifyCartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)}/>

      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden gradient-hero">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, hsl(24 95% 53%) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(45 90% 55%) 0%, transparent 50%)' }}/>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 glass-dark text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-6 font-body">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse-dot"/>
              Shop Premium Products · Free Shipping Over $100
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              Discover<br /><span className="text-gradient">Premium</span><br />Products
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-white/70 text-lg font-body font-light leading-relaxed mb-8 max-w-lg">
              Curated collections from the world's most innovative brands. Premium quality, exceptional value.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <motion.a href="#products" className="gradient-orange text-white px-8 py-4 rounded-2xl font-semibold font-body text-base shadow-brand inline-flex items-center gap-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                Shop Now <ArrowRight className="h-4 w-4"/>
              </motion.a>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full" preserveAspectRatio="none">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Trust badges */}
      <section className="py-10 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustBadges.map((badge, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center flex-shrink-0">
                  <badge.icon className="h-5 w-5 text-primary"/>
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground font-body">{badge.label}</p>
                  <p className="text-xs text-muted-foreground font-body">{badge.sub}</p>
                </div>
              </motion.div>))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-20 bg-background" id="products">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-primary font-semibold text-sm uppercase tracking-widest font-body mb-2">Our Collection</p>
            <h2 className="font-display text-4xl font-bold text-foreground">Shop All Products</h2>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-10">
            {categoryTabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-2.5 rounded-2xl text-sm font-semibold font-body transition-all ${activeTab === tab.id
                ? 'gradient-orange text-white shadow-brand'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
                {tab.label}
              </button>))}
          </div>

          {isLoading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (<div key={i} className="bg-card rounded-2xl border border-border overflow-hidden animate-pulse">
                  <div className="aspect-square bg-secondary"/>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4"/>
                    <div className="h-3 bg-secondary rounded w-1/2"/>
                    <div className="h-5 bg-secondary rounded w-1/3"/>
                  </div>
                </div>))}
            </div>) : products.length === 0 ? (<div className="text-center py-24 bg-card rounded-3xl border border-border">
              <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground"/>
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">No products yet</h3>
              <p className="text-muted-foreground font-body mb-2">Tell me what product you'd like to add and I'll create it for you.</p>
              <p className="text-sm text-muted-foreground font-body">e.g. "Add a black leather wallet for $49"</p>
            </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, i) => (<motion.div key={product.node.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <ShopifyProductCard product={product} onCartOpen={() => setCartOpen(true)}/>
                </motion.div>))}
            </div>)}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="gradient-orange w-9 h-9 rounded-xl flex items-center justify-center shadow-brand">
                  <Zap className="h-5 w-5 text-white fill-current"/>
                </div>
                <span className="font-display font-bold text-2xl text-background">Rai<span className="text-primary">Store</span></span>
              </div>
              <p className="text-background/50 font-body text-sm leading-relaxed max-w-xs">
                Curated premium leather goods crafted for those who demand timeless quality and everyday elegance.
              </p>
              <div className="flex gap-3 mt-6">
                {['Instagram', 'Twitter', 'Pinterest'].map(s => (<a key={s} href="#" className="w-9 h-9 rounded-xl bg-background/10 hover:bg-background/20 flex items-center justify-center text-background/60 hover:text-background text-xs font-body transition-all">
                    {s[0]}
                  </a>))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-display font-bold text-background mb-4 text-sm uppercase tracking-widest">Shop</h4>
              <ul className="space-y-2.5">
                {['All Products', 'New Arrivals', 'Fashion', 'Sale'].map(link => (<li key={link}><a href="#products" className="text-background/50 hover:text-background font-body text-sm transition-colors">{link}</a></li>))}
              </ul>
            </div>
            <div>
              <h4 className="font-display font-bold text-background mb-4 text-sm uppercase tracking-widest">Support</h4>
              <ul className="space-y-2.5">
                {['Contact Us', 'Track Order', 'Easy Returns', 'FAQ'].map(link => (<li key={link}><a href="#" className="text-background/50 hover:text-background font-body text-sm transition-colors">{link}</a></li>))}
              </ul>
            </div>
          </div>

          <div className="border-t border-background/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-background/40 font-body text-xs">© 2025 RaiStore. All rights reserved.</p>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service'].map(link => (<a key={link} href="#" className="text-background/40 hover:text-background/70 font-body text-xs transition-colors">{link}</a>))}
            </div>
          </div>
        </div>
      </footer>
    </div>);
}
