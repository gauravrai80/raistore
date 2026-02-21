import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
const badgeColors = {
    'Best Seller': 'bg-amber-500 text-white',
    'New': 'bg-emerald-500 text-white',
    'Sale': 'bg-red-500 text-white',
    'Limited': 'bg-purple-600 text-white',
    'Trending': 'bg-blue-500 text-white',
};
export function ProductCard({ product, onQuickView, className }) {
    const navigate = useNavigate();
    const { addToCart, toggleWishlist, isInWishlist } = useCart();
    const wishlisted = isInWishlist(product.id);
    const discount = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : null;
    return (<motion.div className={cn('group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300', className)} whileHover={{ y: -6 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Image Container */}
      <div className="relative overflow-hidden bg-secondary/30 aspect-square cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
        <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all duration-300"/>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.badge && (<span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full font-body', badgeColors[product.badge])}>
              {product.badge}
            </span>)}
          {discount && (<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card text-destructive font-body">
              -{discount}%
            </span>)}
        </div>

        {/* Wishlist */}
        <motion.button onClick={() => toggleWishlist(product.id)} className={cn('absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md', wishlisted ? 'bg-red-500 text-white' : 'bg-card/90 text-muted-foreground hover:text-red-500 hover:bg-card')} whileTap={{ scale: 0.85 }}>
          <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')}/>
        </motion.button>

        {/* Quick actions on hover */}
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button onClick={() => addToCart(product)} className="flex-1 gradient-orange text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-brand font-body" whileTap={{ scale: 0.97 }}>
            <ShoppingCart className="h-3.5 w-3.5"/>
            Add to Cart
          </motion.button>
          {onQuickView && (<motion.button onClick={() => onQuickView(product)} className="px-3 py-2.5 bg-card/95 text-foreground text-xs font-semibold rounded-xl border border-border font-body hover:bg-secondary" whileTap={{ scale: 0.97 }}>
              View
            </motion.button>)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider font-body mb-1">{product.brand}</p>
        <h3 onClick={() => navigate(`/product/${product.id}`)} className="font-display font-semibold text-foreground text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (<Star key={i} className={cn('h-3 w-3', i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')}/>))}
          </div>
          <span className="text-xs text-muted-foreground font-body">{product.rating} ({product.reviews.toLocaleString()})</span>
        </div>

        {/* Colors */}
        {product.colors && (<div className="flex items-center gap-1 mb-3">
            {product.colors.slice(0, 4).map(color => (<div key={color} className="w-4 h-4 rounded-full border-2 border-background shadow-sm cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: color }}/>))}
            {product.colors.length > 4 && (<span className="text-xs text-muted-foreground font-body">+{product.colors.length - 4}</span>)}
          </div>)}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-lg text-foreground">${product.price}</span>
            {product.originalPrice && (<span className="text-sm text-muted-foreground line-through font-body">${product.originalPrice}</span>)}
          </div>
          {!product.inStock && (<span className="text-xs text-muted-foreground font-body">Out of stock</span>)}
        </div>
      </div>
    </motion.div>);
}
