import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, X, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
export function ShopifyCartDrawer({ isOpen, onClose }) {
    const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
    const currency = items[0]?.price.currencyCode || 'USD';
    useEffect(() => {
        if (isOpen)
            syncCart();
    }, [isOpen, syncCart]);
    const handleCheckout = () => {
        const url = getCheckoutUrl();
        if (url) {
            window.open(url, '_blank');
            onClose();
        }
    };
    return (<AnimatePresence>
      {isOpen && (<>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50" onClick={onClose}/>
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-xl-custom z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-primary"/>
                <h2 className="font-display font-bold text-lg text-foreground">Your Cart</h2>
                {totalItems > 0 && (<span className="text-xs font-bold px-2 py-0.5 rounded-full gradient-orange text-white font-body">
                    {totalItems}
                  </span>)}
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <X className="h-4 w-4"/>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (<div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground"/>
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground mb-1">Your cart is empty</p>
                    <p className="text-sm text-muted-foreground font-body">Add products to get started</p>
                  </div>
                  <button onClick={onClose} className="gradient-orange text-white px-6 py-2.5 rounded-2xl font-semibold font-body text-sm shadow-brand">
                    Continue Shopping
                  </button>
                </div>) : (<div className="p-4 space-y-3">
                  {items.map(item => {
                    const image = item.product.node.images?.edges?.[0]?.node;
                    return (<motion.div key={item.variantId} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-4 bg-secondary/40 rounded-2xl p-3 border border-border">
                        <div className="w-18 h-18 rounded-xl overflow-hidden bg-secondary flex-shrink-0 w-[72px] h-[72px]">
                          {image && (<img src={image.url} alt={image.altText || item.product.node.title} className="w-full h-full object-cover"/>)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body font-semibold text-sm text-foreground line-clamp-2 mb-0.5">
                            {item.product.node.title}
                          </p>
                          {item.variantTitle !== 'Default Title' && (<p className="text-xs text-muted-foreground font-body mb-2">{item.variantTitle}</p>)}
                          <p className="font-display font-bold text-sm text-foreground">
                            {currency} {(parseFloat(item.price.amount) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <button onClick={() => removeItem(item.variantId)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-3.5 w-3.5"/>
                          </button>
                          <div className="flex items-center gap-1 border border-border rounded-xl overflow-hidden">
                            <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors text-foreground">
                              <Minus className="h-3 w-3"/>
                            </button>
                            <span className="w-6 text-center text-xs font-semibold font-body text-foreground">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-secondary transition-colors text-foreground">
                              <Plus className="h-3 w-3"/>
                            </button>
                          </div>
                        </div>
                      </motion.div>);
                })}
                </div>)}
            </div>

            {/* Footer */}
            {items.length > 0 && (<div className="flex-shrink-0 p-6 border-t border-border space-y-4 bg-card">
                <div className="flex items-center justify-between">
                  <span className="font-body font-semibold text-foreground">Subtotal</span>
                  <span className="font-display font-bold text-xl text-foreground">
                    {currency} {totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground font-body">Taxes and shipping calculated at checkout</p>
                <motion.button onClick={handleCheckout} disabled={isLoading || isSyncing} className="w-full gradient-orange text-white py-4 rounded-2xl font-bold font-body text-base shadow-brand flex items-center justify-center gap-2 disabled:opacity-70" whileTap={{ scale: 0.98 }}>
                  {isLoading || isSyncing ? (<Loader2 className="h-5 w-5 animate-spin"/>) : (<>
                      <ExternalLink className="h-5 w-5"/>
                      Checkout with Shopify
                    </>)}
                </motion.button>
              </div>)}
          </motion.div>
        </>)}
    </AnimatePresence>);
}
