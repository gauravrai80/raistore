import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, Heart, LogOut, Edit2, Save, X, Star, ChevronRight, Clock, CheckCircle, Truck, XCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { products as localProducts } from '@/data/products';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { getMyOrders } from '@/api/orders';
const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-amber-500 bg-amber-50' },
    processing: { label: 'Processing', icon: RefreshCw, color: 'text-blue-500 bg-blue-50' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-indigo-500 bg-indigo-50' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500 bg-red-50' },
    refunded: { label: 'Refunded', icon: RefreshCw, color: 'text-muted-foreground bg-secondary' },
};
export default function Profile() {
    const navigate = useNavigate();
    const { wishlist, toggleWishlist } = useCart();
    const { user, updateProfile, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('orders');
    // Profile editing
    const [profile, setProfile] = useState({ full_name: '', phone: '' });
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMsg, setSaveMsg] = useState('');
    // Orders
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);
    // Wishlist products
    const wishlistProducts = localProducts.filter(p => wishlist.includes(p.id));
    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        setProfile({ full_name: user.full_name || '', phone: user.phone || '' });
        setLoading(false);
    }, [user, navigate]);
    useEffect(() => {
        if (!user || activeTab !== 'orders')
            return;
        setOrdersLoading(true);
        getMyOrders()
            .then(data => { setOrders(data || []); })
            .finally(() => setOrdersLoading(false));
    }, [user, activeTab]);
    const handleSaveProfile = async () => {
        if (!user)
            return;
        setSaving(true);
        setSaveMsg('');
        await updateProfile({ full_name: profile.full_name, phone: profile.phone });
        setSaving(false);
        setSaveMsg('Saved!');
        setEditing(false);
        setTimeout(() => setSaveMsg(''), 3000);
    };
    if (loading) {
        return (<div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        </div>
      </div>);
    }
    const tabs = [
        { id: 'orders', label: 'Order History', icon: Package, count: orders.length || undefined },
        { id: 'wishlist', label: 'Wishlist', icon: Heart, count: wishlist.length || undefined },
        { id: 'account', label: 'Account', icon: User },
    ];
    return (<div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 gradient-orange rounded-2xl flex items-center justify-center shadow-brand flex-shrink-0">
            <span className="text-white text-2xl font-bold font-display">
              {(profile.full_name || user?.email || '?')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              {profile.full_name || 'My Account'}
            </h1>
            <p className="text-sm text-muted-foreground font-body">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="space-y-1">
              {tabs.map(tab => {
            const Icon = tab.icon;
            return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold font-body transition-all', activeTab === tab.id
                    ? 'gradient-orange text-white shadow-brand'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4"/>
                      {tab.label}
                    </span>
                    {tab.count !== undefined && (<span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none', activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground')}>
                        {tab.count}
                      </span>)}
                  </button>);
        })}

              <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm font-semibold font-body text-destructive hover:bg-destructive/10 transition-colors mt-4">
                <LogOut className="h-4 w-4"/> Sign Out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">

              {/* ORDERS TAB */}
              {activeTab === 'orders' && (<motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-display text-xl font-bold text-foreground mb-6">Order History</h2>

                  {ordersLoading ? (<div className="flex items-center justify-center py-20">
                      <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                    </div>) : orders.length === 0 ? (<div className="text-center py-20 bg-card rounded-3xl border border-border">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                      <p className="font-display font-semibold text-foreground mb-2">No orders yet</p>
                      <p className="text-sm text-muted-foreground font-body mb-6">Start shopping to see your orders here</p>
                      <button onClick={() => navigate('/')} className="gradient-orange text-white px-6 py-2.5 rounded-2xl font-semibold font-body text-sm shadow-brand">
                        Shop Now
                      </button>
                    </div>) : (<div className="space-y-4">
                      {orders.map(order => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const isExpanded = expandedOrder === order.id;
                    return (<motion.div key={order.id} layout className="bg-card rounded-3xl border border-border overflow-hidden">
                            {/* Order header */}
                            <button className="w-full flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors text-left" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                  <span className="font-display font-bold text-foreground text-sm">{order.order_number}</span>
                                  <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1', status.color)}>
                                    <StatusIcon className="h-3 w-3"/>
                                    {status.label}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground font-body">
                                  {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                  {' · '}{order.order_items?.length || 0} item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-display font-bold text-foreground">${Number(order.total).toFixed(2)}</span>
                                <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')}/>
                              </div>
                            </button>

                            {/* Order items */}
                            <AnimatePresence>
                              {isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
                                  <div className="p-5 space-y-3">
                                    {order.order_items?.map((item) => (<div key={item.id} className="flex items-center gap-4">
                                        {item.product_image && (<img src={item.product_image} alt={item.product_name} className="w-14 h-14 rounded-xl object-cover bg-secondary flex-shrink-0"/>)}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-body font-semibold text-sm text-foreground line-clamp-1">{item.product_name}</p>
                                          <p className="text-xs text-muted-foreground font-body">
                                            {item.brand && <span>{item.brand} · </span>}
                                            Qty {item.quantity}
                                            {item.selected_size && ` · ${item.selected_size}`}
                                          </p>
                                        </div>
                                        <span className="font-body font-bold text-sm text-foreground flex-shrink-0">
                                          ${(Number(item.price) * item.quantity).toFixed(2)}
                                        </span>
                                      </div>))}

                                    {/* Totals */}
                                    <div className="pt-3 border-t border-border space-y-1 text-sm font-body">
                                      <div className="flex justify-between text-muted-foreground">
                                        <span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span>
                                      </div>
                                      {order.shipping_cost > 0 && (<div className="flex justify-between text-muted-foreground">
                                          <span>Shipping</span><span>${Number(order.shipping_cost).toFixed(2)}</span>
                                        </div>)}
                                      {order.discount > 0 && (<div className="flex justify-between text-emerald-600">
                                          <span>Discount</span><span>-${Number(order.discount).toFixed(2)}</span>
                                        </div>)}
                                      <div className="flex justify-between font-bold text-foreground pt-1">
                                        <span>Total</span><span>${Number(order.total).toFixed(2)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>)}
                            </AnimatePresence>
                          </motion.div>);
                })}
                    </div>)}
                </motion.div>)}

              {/* WISHLIST TAB */}
              {activeTab === 'wishlist' && (<motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h2 className="font-display text-xl font-bold text-foreground mb-6">Saved Items</h2>

                  {wishlistProducts.length === 0 ? (<div className="text-center py-20 bg-card rounded-3xl border border-border">
                      <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4"/>
                      <p className="font-display font-semibold text-foreground mb-2">Your wishlist is empty</p>
                      <p className="text-sm text-muted-foreground font-body mb-6">Heart items on product pages to save them here</p>
                      <button onClick={() => navigate('/')} className="gradient-orange text-white px-6 py-2.5 rounded-2xl font-semibold font-body text-sm shadow-brand">
                        Discover Products
                      </button>
                    </div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlistProducts.map((product, i) => (<motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-card rounded-2xl border border-border p-4 flex gap-4 hover:shadow-card-hover transition-all duration-300">
                          <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-secondary flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => navigate(`/product/${product.id}`)}/>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider font-body mb-0.5">{product.brand}</p>
                            <p className="font-display font-semibold text-sm text-foreground line-clamp-2 mb-2 cursor-pointer hover:text-primary transition-colors" onClick={() => navigate(`/product/${product.id}`)}>
                              {product.name}
                            </p>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, j) => (<Star key={j} className={cn('h-3 w-3', j < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')}/>))}
                              <span className="text-xs text-muted-foreground font-body ml-1">{product.rating}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-display font-bold text-foreground">${product.price}</span>
                                {product.originalPrice && <span className="text-xs text-muted-foreground line-through font-body">${product.originalPrice}</span>}
                              </div>
                              <button onClick={() => toggleWishlist(product.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Remove from wishlist">
                                <X className="h-4 w-4"/>
                              </button>
                            </div>
                          </div>
                        </motion.div>))}
                    </div>)}
                </motion.div>)}

              {/* ACCOUNT TAB */}
              {activeTab === 'account' && (<motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-xl font-bold text-foreground">Account Details</h2>
                    {!editing ? (<button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm font-semibold font-body text-primary hover:underline">
                        <Edit2 className="h-3.5 w-3.5"/> Edit
                      </button>) : (<button onClick={() => setEditing(false)} className="flex items-center gap-1.5 text-sm font-semibold font-body text-muted-foreground hover:text-foreground">
                        <X className="h-3.5 w-3.5"/> Cancel
                      </button>)}
                  </div>

                  <div className="bg-card rounded-3xl border border-border p-6 space-y-6">
                    {saveMsg && (<div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-body flex items-center gap-2">
                        <CheckCircle className="h-4 w-4"/> {saveMsg}
                      </div>)}

                    {/* Email (read-only) */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-2 block">Email Address</label>
                      <div className="px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm font-body text-muted-foreground">
                        {user?.email}
                      </div>
                      <p className="text-xs text-muted-foreground font-body mt-1">Email cannot be changed</p>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-2 block">Full Name</label>
                      {editing ? (<input type="text" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="Your full name" className="w-full px-4 py-3 bg-secondary border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>) : (<div className="px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm font-body text-foreground">
                          {profile.full_name || <span className="text-muted-foreground">Not set</span>}
                        </div>)}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-2 block">Phone Number</label>
                      {editing ? (<input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 bg-secondary border border-border rounded-xl font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"/>) : (<div className="px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm font-body text-foreground">
                          {profile.phone || <span className="text-muted-foreground">Not set</span>}
                        </div>)}
                    </div>

                    {/* Member since */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-2 block">Member Since</label>
                      <div className="px-4 py-3 bg-secondary/50 border border-border rounded-xl text-sm font-body text-muted-foreground">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </div>
                    </div>

                    {editing && (<motion.button onClick={handleSaveProfile} disabled={saving} className="w-full gradient-orange text-white py-3.5 rounded-2xl font-bold font-body text-sm shadow-brand flex items-center justify-center gap-2 disabled:opacity-70" whileTap={{ scale: 0.98 }}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Save className="h-4 w-4"/> Save Changes</>}
                      </motion.button>)}
                  </div>
                </motion.div>)}

            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>);
}
