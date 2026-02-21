import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ShoppingCart, ArrowLeft, Check, Truck, Shield, RefreshCw, ChevronRight, Minus, Plus, Package, Zap } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ProductCard } from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { products as localProducts } from '@/data/products';
import { useQuery } from '@tanstack/react-query';

import { cn } from '@/lib/utils';
const badgeColors = {
  'Best Seller': 'bg-amber-500 text-white',
  'New': 'bg-emerald-500 text-white',
  'Sale': 'bg-red-500 text-white',
  'Limited': 'bg-purple-600 text-white',
  'Trending': 'bg-blue-500 text-white',
};
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
    images: p.images?.length ? p.images : [p.images?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    badge: p.badge,
    inStock: true,
    colors: p.colors || [],
    sizes: p.sizes || [],
    description: p.description || '',
    features: p.features || [],
    isFeatured: p.is_featured,
  };
}
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState();
  const [selectedSize, setSelectedSize] = useState();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { data: dbProducts } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('http://localhost:5000/api/products?limit=1000');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      return data.products || [];
    },
  });
  const allProducts = dbProducts?.length ? dbProducts.map(mapDbProduct) : localProducts;
  // Find by either standard ID or MongoDB _id (which is mapped to 'id' in mapDbProduct)
  const product = allProducts.find(p => p.id === id);
  if (!product) {
    return (<div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-32 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground mb-4">Product not found</h2>
        <button onClick={() => navigate('/')} className="gradient-orange text-white px-6 py-3 rounded-2xl font-semibold font-body">
          Back to Home
        </button>
      </div>
    </div>);
  }
  const wishlisted = isInWishlist(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;
  const related = allProducts.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);
  const fallbackRelated = allProducts.filter(p => p.id !== product.id).slice(0, 4);
  const handleAddToCart = () => {
    addToCart(product, quantity, selectedColor, selectedSize);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };
  return (<div className="min-h-screen bg-background">
    <Navbar />

    {/* Hero background accent */}
    <div className="absolute top-0 left-0 right-0 h-[500px] overflow-hidden pointer-events-none -z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/40 via-background to-background" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl" />
    </div>

    <div className="relative container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm font-body text-muted-foreground mb-10">
        <button onClick={() => navigate('/')} className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium group">
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Home
        </button>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <span className="text-muted-foreground">{product.category || 'Products'}</span>
        <ChevronRight className="h-3.5 w-3.5 opacity-40" />
        <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
      </motion.nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* ── Image Gallery ── */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex gap-4">
          {/* Thumbnails */}
          {product.images.length > 1 && (<div className="flex flex-col gap-3 pt-1">
            {product.images.map((img, i) => (<motion.button key={i} onClick={() => setSelectedImage(i)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={cn('w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 shadow-sm', selectedImage === i
              ? 'border-primary shadow-orange'
              : 'border-border hover:border-primary/40')}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </motion.button>))}
          </div>)}

          {/* Main Image */}
          <div className="flex-1 relative">
            {/* Floating badge */}
            {product.badge && (<div className="absolute top-4 left-4 z-10">
              <span className={cn('text-xs font-bold px-3 py-1.5 rounded-full font-body shadow-md', badgeColors[product.badge])}>
                {product.badge}
              </span>
            </div>)}
            {discount && (<div className="absolute top-4 left-4 z-10 mt-8">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/90 text-destructive shadow-md backdrop-blur-sm">
                -{discount}% OFF
              </span>
            </div>)}

            {/* Wishlist */}
            <motion.button onClick={() => toggleWishlist(product.id)} whileTap={{ scale: 0.85 }} className={cn('absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all backdrop-blur-sm', wishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-muted-foreground hover:text-red-500 hover:bg-white')}>
              <Heart className={cn('h-5 w-5', wishlisted && 'fill-current')} />
            </motion.button>

            <motion.div layoutId={`product-${product.id}`} className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-secondary/60 to-secondary/20 aspect-square shadow-xl">
              <AnimatePresence mode="wait">
                <motion.img key={selectedImage} src={product.images[selectedImage] || product.image} alt={product.name} className="w-full h-full object-cover" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3 }} />
              </AnimatePresence>
            </motion.div>

            {/* Bottom shimmer line */}
            <div className="absolute -bottom-2 left-8 right-8 h-4 bg-primary/10 blur-xl rounded-full" />
          </div>
        </motion.div>

        {/* ── Product Info ── */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col pt-2">
          {/* Brand pill */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary font-body bg-accent px-3 py-1.5 rounded-full">
              {product.brand}
            </span>
            {product.inStock ? (<span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              In Stock
            </span>) : (<span className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
              Out of Stock
            </span>)}
          </div>

          <h1 className="font-display text-4xl font-bold text-foreground leading-tight mb-5">
            {product.name}
          </h1>

          {/* Rating row */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (<Star key={i} className={cn('h-4 w-4', i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')} />))}
            </div>
            <span className="text-sm font-bold text-foreground font-body">{product.rating}</span>
            <span className="text-sm text-muted-foreground font-body">({product.reviews.toLocaleString()} reviews)</span>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground font-body">
              <Package className="h-3.5 w-3.5" />
              SKU: {product.id.slice(0, 8).toUpperCase()}
            </div>
          </div>

          {/* Price block */}
          <div className="flex items-end gap-4 mb-6">
            <span className="font-display text-5xl font-bold text-foreground">${product.price}</span>
            {product.originalPrice && (<div className="flex flex-col pb-1">
              <span className="text-sm text-muted-foreground line-through font-body">${product.originalPrice}</span>
              {discount && (<span className="text-sm font-bold text-emerald-600 font-body">You save ${(product.originalPrice - product.price).toFixed(2)}</span>)}
            </div>)}
          </div>

          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Colors */}
          {product.colors && product.colors.length > 0 && (<div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-foreground font-body">Color</p>
              {selectedColor && (<span className="text-xs text-muted-foreground font-body">Selected</span>)}
            </div>
            <div className="flex gap-3 flex-wrap">
              {product.colors.map(color => (<motion.button key={color} onClick={() => setSelectedColor(color === selectedColor ? undefined : color)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={cn('w-9 h-9 rounded-full border-3 transition-all shadow-sm', selectedColor === color
                ? 'ring-2 ring-offset-2 ring-primary scale-110'
                : 'ring-1 ring-border hover:ring-primary/50')} style={{ backgroundColor: color }} />))}
            </div>
          </div>)}

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (<div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-foreground font-body">Size</p>
              {selectedSize && (<span className="text-xs font-semibold text-primary font-body">{selectedSize}</span>)}
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map(size => (<motion.button key={size} onClick={() => setSelectedSize(size === selectedSize ? undefined : size)} whileTap={{ scale: 0.93 }} className={cn('px-4 py-2 rounded-xl text-sm font-bold font-body border-2 transition-all', selectedSize === size
                ? 'border-primary bg-primary text-primary-foreground shadow-orange'
                : 'border-border text-foreground hover:border-primary/50 bg-card')}>
                {size}
              </motion.button>))}
            </div>
          </div>)}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mb-6">
            {/* Qty */}
            <div className="flex items-center bg-secondary rounded-2xl overflow-hidden border border-border">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 h-12 flex items-center justify-center text-foreground hover:bg-border/60 transition-colors">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-bold font-body text-foreground text-base">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="w-11 h-12 flex items-center justify-center text-foreground hover:bg-border/60 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart */}
            <motion.button onClick={handleAddToCart} disabled={!product.inStock} whileTap={product.inStock ? { scale: 0.97 } : {}} className={cn('flex-1 h-12 rounded-2xl font-bold font-body text-base flex items-center justify-center gap-2 transition-all relative overflow-hidden', product.inStock
              ? addedToCart
                ? 'bg-emerald-500 text-white'
                : 'gradient-orange text-white shadow-orange hover:shadow-xl'
              : 'bg-muted text-muted-foreground cursor-not-allowed')}>
              {!addedToCart && product.inStock && (<motion.span className="absolute inset-0 bg-white/20 rounded-2xl" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.4 }} />)}
              <AnimatePresence mode="wait">
                {addedToCart ? (<motion.span key="added" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Check className="h-5 w-5" /> Added to Cart!
                </motion.span>) : (<motion.span key="add" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </motion.span>)}
              </AnimatePresence>
            </motion.button>

            {/* Wishlist icon btn */}
            <motion.button onClick={() => toggleWishlist(product.id)} whileTap={{ scale: 0.85 }} className={cn('h-12 w-12 rounded-2xl border-2 flex items-center justify-center transition-all', wishlisted
              ? 'border-red-400 bg-red-50 text-red-500'
              : 'border-border text-muted-foreground hover:border-red-400 hover:text-red-500 hover:bg-red-50')}>
              <Heart className={cn('h-5 w-5', wishlisted && 'fill-current')} />
            </motion.button>
          </div>

          {/* Fast delivery pill */}
          <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-accent rounded-2xl border border-accent-foreground/10">
            <Zap className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm font-semibold text-foreground font-body">Express delivery available — order before 2PM</span>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Orders over $100' },
              { icon: Shield, label: 'Secure Pay', sub: 'SSL encrypted' },
              { icon: RefreshCw, label: '30-Day Returns', sub: 'Hassle-free' },
            ].map(({ icon: Icon, label, sub }) => (<div key={label} className="flex flex-col items-center text-center gap-2 p-3 bg-card rounded-2xl border border-border">
              <div className="w-9 h-9 rounded-xl gradient-orange flex items-center justify-center">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold font-body text-foreground">{label}</p>
                <p className="text-[10px] text-muted-foreground font-body mt-0.5">{sub}</p>
              </div>
            </div>))}
          </div>
        </motion.div>
      </div>

      {/* ── Features Section ── */}
      {product.features.length > 0 && (<section className="mb-24">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-border" />
          <h2 className="font-display text-2xl font-bold text-foreground whitespace-nowrap px-4">Key Features</h2>
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {product.features.map((feature, i) => (<motion.div key={i} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group relative bg-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-md transition-all">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl gradient-orange opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-8 h-8 rounded-xl gradient-orange flex items-center justify-center mb-3">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-body text-foreground font-semibold leading-snug">{feature}</span>
          </motion.div>))}
        </div>
      </section>)}

      {/* ── Related Products ── */}
      {(related.length > 0 || fallbackRelated.length > 0) && (<section className="mb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground">You May Also Like</h2>
          <button onClick={() => navigate('/')} className="text-sm font-semibold text-primary font-body hover:underline flex items-center gap-1">
            View all <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(related.length > 0 ? related : fallbackRelated).map((p, i) => (<motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} onClick={() => navigate(`/product/${p.id}`)} className="cursor-pointer">
            <ProductCard product={p} />
          </motion.div>))}
        </div>
      </section>)}
    </div>
  </div>);
}
