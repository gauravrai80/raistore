import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Loader2, Check, Truck, Shield, RefreshCw, Star, Minus, Plus, ChevronRight, Zap, Package, Sparkles } from 'lucide-react';
import { storefrontApiRequest, PRODUCT_BY_HANDLE_QUERY, PRODUCTS_QUERY } from '@/lib/shopify';
import { useCartStore } from '@/stores/cartStore';
import { ShopifyCartDrawer } from '@/components/ShopifyCartDrawer';
import { ShopifyProductCard } from '@/components/ShopifyProductCard';
import { Navbar } from '@/components/Navbar';
import { cn } from '@/lib/utils';
export default function ShopifyProductDetail() {
    const { handle } = useParams();
    const navigate = useNavigate();
    const { addItem, isLoading: cartLoading } = useCartStore();
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const { data: product, isLoading } = useQuery({
        queryKey: ['shopify-product', handle],
        queryFn: async () => {
            const result = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
            return result?.data?.productByHandle || null;
        },
        enabled: !!handle,
    });
    const { data: suggestedProducts } = useQuery({
        queryKey: ['shopify-suggestions', handle],
        queryFn: async () => {
            const result = await storefrontApiRequest(PRODUCTS_QUERY, { first: 5 });
            const all = result?.data?.products?.edges || [];
            return all.filter((p) => p.node.handle !== handle).slice(0, 4);
        },
        enabled: !!handle,
    });
    if (isLoading) {
        return (<div className="min-h-screen bg-background">
        <Navbar onCartOpen={() => setCartOpen(true)}/>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary"/>
          <p className="text-muted-foreground font-body text-sm animate-pulse">Loading product…</p>
        </div>
      </div>);
    }
    if (!product) {
        return (<div className="min-h-screen bg-background">
        <Navbar onCartOpen={() => setCartOpen(true)}/>
        <div className="container mx-auto px-4 py-32 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">Product not found</h2>
          <button onClick={() => navigate('/')} className="gradient-orange text-white px-6 py-3 rounded-2xl font-semibold font-body">
            Back to Store
          </button>
        </div>
      </div>);
    }
    const images = product.images?.edges || [];
    const variants = product.variants?.edges || [];
    const options = product.options || [];
    const selectedVariant = variants.find((v) => v.node.id === selectedVariantId)?.node || variants[0]?.node;
    const price = selectedVariant?.price || product.priceRange?.minVariantPrice;
    const hasOptions = options.some((o) => o.values.length > 1 && o.name !== 'Title');
    const isAvailable = selectedVariant?.availableForSale !== false;
    const handleAddToCart = async () => {
        if (!selectedVariant)
            return;
        await addItem({
            product: { node: product },
            variantId: selectedVariant.id,
            variantTitle: selectedVariant.title,
            price: selectedVariant.price,
            quantity,
            selectedOptions: selectedVariant.selectedOptions || [],
        });
        setAdded(true);
        setCartOpen(true);
        setTimeout(() => setAdded(false), 2000);
    };
    return (<div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar onCartOpen={() => setCartOpen(true)}/>
      <ShopifyCartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)}/>

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-primary/5 blur-[120px]"/>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[100px]"/>
      </div>

      <div className="container mx-auto px-4 pt-6 pb-24">
        {/* Breadcrumb */}
        <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm font-body text-muted-foreground mb-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 hover:text-primary transition-colors group font-medium">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform"/>
            Store
          </button>
          <ChevronRight className="h-3.5 w-3.5 opacity-40"/>
          <span className="text-foreground font-semibold line-clamp-1">{product.title}</span>
        </motion.nav>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 mb-20">

          {/* LEFT — Image panel */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }} className="flex flex-col gap-4 mb-10 lg:mb-0">
            {/* Main image */}
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-secondary/80 to-secondary/30 aspect-square shadow-xl group">
              <AnimatePresence mode="wait">
                <motion.img key={selectedImage} src={images[selectedImage]?.node?.url} alt={images[selectedImage]?.node?.altText || product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35 }}/>
              </AnimatePresence>

              {/* Availability badge */}
              <div className="absolute top-5 left-5">
                {isAvailable ? (<span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500 text-white shadow-lg backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/>
                    In Stock
                  </span>) : (<span className="text-xs font-bold px-3 py-1.5 rounded-full bg-black/70 text-white backdrop-blur-sm">
                    Out of Stock
                  </span>)}
              </div>

              {/* Bottom image shadow */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/10 to-transparent"/>
            </div>

            {/* Thumbnails row */}
            {images.length > 1 && (<div className="flex gap-3 justify-center">
                {images.map(({ node: img }, i) => (<motion.button key={i} onClick={() => setSelectedImage(i)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }} className={cn('w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0', selectedImage === i
                    ? 'border-primary shadow-orange shadow-md'
                    : 'border-border opacity-60 hover:opacity-100 hover:border-primary/40')}>
                    <img src={img.url} alt={img.altText || ''} className="w-full h-full object-cover"/>
                  </motion.button>))}
              </div>)}
          </motion.div>

          {/* RIGHT — Info panel */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }} className="flex flex-col">
            {/* Handle / category pill */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary font-body bg-accent px-3 py-1.5 rounded-full">
                {handle?.replace(/-/g, ' ')}
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-muted-foreground font-body flex items-center gap-1">
                <Package className="h-3 w-3"/> Premium Leather
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] mb-5">
              {product.title}
            </h1>

            {/* Stars (decorative) */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (<Star key={i} className={cn('h-4 w-4', i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')}/>))}
              </div>
              <span className="text-sm font-semibold text-foreground font-body">4.8</span>
              <span className="text-sm text-muted-foreground font-body">(124 reviews)</span>
            </div>

            {/* Price card */}
            <div className="flex items-end gap-4 mb-6 p-5 bg-card border border-border rounded-2xl shadow-sm">
              <span className="font-display text-5xl font-bold text-foreground">
                {price?.currencyCode} {parseFloat(price?.amount || '0').toFixed(2)}
              </span>
              <div className="pb-1 flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wide">Per unit</span>
                <span className="text-xs font-bold text-emerald-600 font-body flex items-center gap-1">
                  <Zap className="h-3 w-3"/> Free express delivery
                </span>
              </div>
            </div>

            {/* Description */}
            {product.description && (<p className="text-muted-foreground font-body text-sm leading-relaxed mb-8 border-l-2 border-primary/30 pl-4">
                {product.description}
              </p>)}

            {/* Variants */}
            {hasOptions && options.map((option) => option.values.length > 1 && option.name !== 'Title' && (<div key={option.name} className="mb-6">
                  <p className="text-sm font-bold text-foreground font-body mb-3 uppercase tracking-wide">{option.name}</p>
                  <div className="flex gap-2 flex-wrap">
                    {option.values.map((value) => {
                const matchingVariant = variants.find((v) => v.node.selectedOptions.some((o) => o.name === option.name && o.value === value))?.node;
                const isSelected = matchingVariant?.id === selectedVariantId ||
                    (!selectedVariantId && matchingVariant?.id === variants[0]?.node?.id);
                return (<motion.button key={value} whileTap={{ scale: 0.93 }} onClick={() => setSelectedVariantId(matchingVariant?.id || null)} disabled={!matchingVariant?.availableForSale} className={cn('px-4 py-2.5 rounded-xl text-sm font-bold font-body border-2 transition-all', isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-orange'
                        : 'border-border text-foreground hover:border-primary/50 bg-card', !matchingVariant?.availableForSale && 'opacity-40 cursor-not-allowed line-through')}>
                          {value}
                        </motion.button>);
            })}
                  </div>
                </div>))}

            {/* Quantity + CTA */}
            <div className="flex items-center gap-3 mb-5">
              {/* Qty stepper */}
              <div className="flex items-center bg-secondary rounded-2xl border border-border overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-foreground hover:bg-border/60 transition-colors">
                  <Minus className="h-4 w-4"/>
                </button>
                <span className="w-10 text-center font-bold font-body text-foreground text-base">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center text-foreground hover:bg-border/60 transition-colors">
                  <Plus className="h-4 w-4"/>
                </button>
              </div>

              {/* Add to Cart */}
              <motion.button onClick={handleAddToCart} disabled={cartLoading || !isAvailable} whileTap={isAvailable ? { scale: 0.97 } : {}} className={cn('flex-1 h-12 rounded-2xl font-bold font-body text-base flex items-center justify-center gap-2 transition-all relative overflow-hidden', isAvailable
            ? added
                ? 'bg-emerald-500 text-white'
                : 'gradient-orange text-white shadow-orange hover:shadow-xl'
            : 'bg-muted text-muted-foreground cursor-not-allowed')}>
                {/* Shine sweep */}
                {!added && isAvailable && (<motion.span className="absolute inset-0 bg-white/20" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.45 }}/>)}
                <AnimatePresence mode="wait">
                  {cartLoading ? (<motion.span key="loading" className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin"/> Adding…
                    </motion.span>) : added ? (<motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Check className="h-5 w-5"/> Added to Cart!
                    </motion.span>) : (<motion.span key="add" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5"/>
                      {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                    </motion.span>)}
                </AnimatePresence>
              </motion.button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-border">
              {[
            { icon: Truck, label: 'Free Shipping', sub: 'Over $100' },
            { icon: Shield, label: 'Secure Pay', sub: 'SSL encrypted' },
            { icon: RefreshCw, label: '30-Day Returns', sub: 'Hassle-free' },
        ].map(({ icon: Icon, label, sub }) => (<motion.div key={label} whileHover={{ y: -2 }} className="flex flex-col items-center text-center gap-2 p-3 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center">
                    <Icon className="h-4 w-4 text-white"/>
                  </div>
                  <div>
                    <p className="text-xs font-bold font-body text-foreground">{label}</p>
                    <p className="text-[10px] text-muted-foreground font-body mt-0.5">{sub}</p>
                  </div>
                </motion.div>))}
            </div>
          </motion.div>
        </div>

        {/* ── Feature strip ── */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: '🧵', title: 'Full-grain leather', desc: 'Ages beautifully over time' },
            { emoji: '🔒', title: 'RFID Protected', desc: 'Shields your cards from skimming' },
            { emoji: '✂️', title: 'Hand-stitched', desc: 'Meticulous artisan craftsmanship' },
            { emoji: '📦', title: 'Gift Ready', desc: 'Premium packaging included' },
        ].map((feat, i) => (<motion.div key={feat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-0.5 gradient-orange rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"/>
              <div className="text-2xl mb-3">{feat.emoji}</div>
              <p className="font-bold font-body text-foreground text-sm mb-1">{feat.title}</p>
              <p className="text-xs text-muted-foreground font-body">{feat.desc}</p>
            </motion.div>))}
        </motion.div>

        {/* ── Product Suggestions ── */}
        {suggestedProducts && suggestedProducts.length > 0 && (<motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-20">
            {/* Section header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white"/>
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">You May Also Like</h2>
                  <p className="text-xs text-muted-foreground font-body mt-0.5">Hand-picked suggestions for you</p>
                </div>
              </div>
              <button onClick={() => navigate('/')} className="text-sm font-semibold text-primary font-body hover:underline flex items-center gap-1 group">
                View all
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform"/>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {suggestedProducts.map((p, i) => (<motion.div key={p.node.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <ShopifyProductCard product={p} onCartOpen={() => setCartOpen(true)}/>
                </motion.div>))}
            </div>
          </motion.section>)}
      </div>
    </div>);
}
