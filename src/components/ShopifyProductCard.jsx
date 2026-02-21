import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';
export function ShopifyProductCard({ product, onCartOpen }) {
    const navigate = useNavigate();
    const { addItem, isLoading } = useCartStore();
    const [wishlisted, setWishlisted] = useState(false);
    const [adding, setAdding] = useState(false);
    const { node } = product;
    const image = node.images?.edges?.[0]?.node;
    const firstVariant = node.variants?.edges?.[0]?.node;
    const price = node.priceRange.minVariantPrice;
    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (!firstVariant)
            return;
        setAdding(true);
        await addItem({
            product,
            variantId: firstVariant.id,
            variantTitle: firstVariant.title,
            price: firstVariant.price,
            quantity: 1,
            selectedOptions: firstVariant.selectedOptions || [],
        });
        setAdding(false);
        onCartOpen();
    };
    return (<motion.div className="group relative bg-card rounded-2xl overflow-hidden border border-border/50 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer" whileHover={{ y: -6 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} onClick={() => navigate(`/product/${node.handle}`)}>
      {/* Image */}
      <div className="relative overflow-hidden bg-secondary/30 aspect-square">
        {image ? (<img src={image.url} alt={image.altText || node.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>) : (<div className="w-full h-full flex items-center justify-center bg-secondary">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30"/>
          </div>)}

        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-all duration-300"/>

        {/* Wishlist */}
        <motion.button onClick={e => { e.stopPropagation(); setWishlisted(w => !w); }} className={cn('absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-md', wishlisted ? 'bg-red-500 text-white' : 'bg-card/90 text-muted-foreground hover:text-red-500 hover:bg-card')} whileTap={{ scale: 0.85 }}>
          <Heart className={cn('h-4 w-4', wishlisted && 'fill-current')}/>
        </motion.button>

        {/* Add to cart on hover */}
        <div className="absolute bottom-3 left-3 right-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button onClick={handleAddToCart} disabled={adding || isLoading || !firstVariant} className="w-full gradient-orange text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-brand font-body disabled:opacity-70" whileTap={{ scale: 0.97 }}>
            {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <ShoppingCart className="h-3.5 w-3.5"/>}
            {adding ? 'Adding...' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {node.title}
        </h3>
        {node.description && (<p className="text-xs text-muted-foreground font-body line-clamp-2 mb-3">{node.description}</p>)}
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-lg text-foreground">
            {price.currencyCode} {parseFloat(price.amount).toFixed(2)}
          </span>
          {!firstVariant?.availableForSale && (<span className="text-xs text-muted-foreground font-body">Out of stock</span>)}
        </div>
      </div>
    </motion.div>);
}
