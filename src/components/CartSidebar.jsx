import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export function CartSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const shipping = totalPrice > 100 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;
  return (<AnimatePresence>
    {isOpen && (<>
      {/* Backdrop */}
      <motion.div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

      {/* Sidebar */}
      <motion.div className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-xl-custom z-50 flex flex-col" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="font-display font-bold text-xl text-foreground">Your Cart</h2>
            {totalItems > 0 && (<span className="gradient-orange text-white text-xs font-bold px-2 py-0.5 rounded-full font-body">
              {totalItems}
            </span>)}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Free shipping bar */}
        {totalPrice < 100 && totalPrice > 0 && (<div className="px-6 py-3 bg-accent border-b border-border">
          <p className="text-xs text-accent-foreground font-body">
            Add <strong>${(100 - totalPrice).toFixed(2)}</strong> more for free shipping! 🎉
          </p>
          <div className="mt-2 h-1.5 bg-background rounded-full overflow-hidden">
            <div className="h-full gradient-orange rounded-full transition-all duration-500" style={{ width: `${Math.min((totalPrice / 100) * 100, 100)}%` }} />
          </div>
        </div>)}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted stroke-1 mb-4" />
            <p className="font-display font-semibold text-lg text-foreground mb-1">Your cart is empty</p>
            <p className="text-sm text-muted-foreground font-body">Add items to get started</p>
            <button onClick={onClose} className="mt-6 gradient-orange text-white px-6 py-2.5 rounded-xl font-semibold font-body text-sm shadow-brand">
              Continue Shopping
            </button>
          </div>) : (items.map(item => (<motion.div key={item.product.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex gap-4 p-3 rounded-2xl bg-secondary/50 border border-border/50">
            <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary font-body uppercase tracking-wide">{item.product.brand}</p>
              <p className="text-sm font-semibold text-foreground font-body leading-tight mt-0.5 truncate">{item.product.name}</p>
              {item.selectedSize && (<p className="text-xs text-muted-foreground font-body mt-0.5">Size: {item.selectedSize}</p>)}
              <div className="flex items-center justify-between mt-2">
                {/* Quantity */}
                <div className="flex items-center gap-2 bg-card rounded-lg border border-border p-0.5">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-sm font-semibold text-foreground font-body w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>)))}
        </div>

        {/* Footer */}
        {items.length > 0 && (<div className="border-t border-border px-6 py-5 space-y-4">
          {/* Coupon */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Coupon code" className="w-full pl-9 pr-3 py-2.5 text-sm bg-secondary border border-border rounded-xl font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <button className="px-4 py-2.5 bg-secondary border border-border rounded-xl text-sm font-semibold font-body text-foreground hover:bg-border transition-colors">
              Apply
            </button>
          </div>

          {/* Totals */}
          <div className="space-y-2 text-sm font-body">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span className={shipping === 0 ? 'text-emerald-500 font-semibold' : ''}>
                {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-foreground pt-2 border-t border-border">
              <span className="font-display">Total</span>
              <span className="font-display">${total.toFixed(2)}</span>
            </div>
          </div>

          <motion.button
            onClick={() => {
              onClose();
              navigate('/checkout');
            }}
            className="w-full gradient-orange text-white py-4 rounded-2xl font-bold font-body text-base shadow-brand flex items-center justify-center gap-2"
            whileTap={{ scale: 0.98 }}
          >
            Checkout Now
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          <p className="text-center text-xs text-muted-foreground font-body">
            🔒 Secure checkout · SSL encrypted
          </p>
        </div>)}
      </motion.div>
    </>)}
  </AnimatePresence>);
}
