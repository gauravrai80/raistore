import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingBag, Tag, LogOut, Menu, X, Plus, Pencil, Trash2, Search, DollarSign, ShoppingCart, AlertTriangle, Check, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { createProduct, updateProduct, deleteProduct as apiDeleteProduct, getAllProducts } from '@/api/products';
import { getAllOrders, updateOrderStatus as apiUpdateOrderStatus } from '@/api/orders';
import { getInventory as apiGetInventory, updateInventory as apiUpdateInventory } from '@/api/inventory';
import { getCoupons } from '@/api/coupons';
import { getCategories } from '@/api/categories';
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
};
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [productModal, setProductModal] = useState({ open: false });
  const [productForm, setProductForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    loadData();
  }, [user, isAdmin]);
  const loadData = async () => {
    setLoading(true);
    const [prodRes, ordRes, invRes, couRes, catRes] = await Promise.all([
      getAllProducts({ limit: 200 }),
      getAllOrders({ limit: 200 }),
      apiGetInventory(),
      getCoupons(),
      getCategories(),
    ]);
    const prods = prodRes.products || prodRes || [];
    const ords = ordRes.orders || ordRes || [];
    setProducts(prods);
    setOrders(ords);
    setInventory(invRes || []);
    setCoupons(couRes || []);
    setCategories(catRes || []);
    setStats({
      totalRevenue: ords.reduce((s, o) => s + Number(o.total), 0),
      totalOrders: ords.length,
      totalProducts: prods.length,
      totalUsers: 0,
    });
    setLoading(false);
  };
  const handleSignOut = async () => {
    logout();
    navigate('/');
  };
  const openProductModal = (product) => {
    setProductForm(product ? {
      ...product,
      category_id: product.category_id?._id || product.category_id
    } : {
      name: '', brand: '', description: '', price: '', original_price: '', badge: '',
      is_featured: false, is_active: true, images: [], colors: [], sizes: [], features: [],
    });
    setProductModal({ open: true, product });
  };
  const saveProduct = async () => {
    setSaving(true);
    try {
      const payload = {
        name: productForm.name,
        slug: productForm.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now(),
        brand: productForm.brand,
        description: productForm.description,
        price: Number(productForm.price),
        original_price: productForm.original_price ? Number(productForm.original_price) : undefined,
        images: typeof productForm.images === 'string' ? productForm.images.split('\n').filter(Boolean) : productForm.images || [],
        colors: typeof productForm.colors === 'string' ? productForm.colors.split(',').map((s) => s.trim()).filter(Boolean) : productForm.colors || [],
        sizes: typeof productForm.sizes === 'string' ? productForm.sizes.split(',').map((s) => s.trim()).filter(Boolean) : productForm.sizes || [],
        features: typeof productForm.features === 'string' ? productForm.features.split('\n').filter(Boolean) : productForm.features || [],
        is_featured: productForm.is_featured || false,
        is_active: productForm.is_active !== false,
      };

      if (productForm.category_id) payload.category_id = productForm.category_id;
      if (productForm.badge) payload.badge = productForm.badge;

      if (productModal.product?._id) {
        // Remove slug from update to prevent changing it on every save if not intended
        delete payload.slug;
        await updateProduct(productModal.product._id, payload);
      }
      else {
        await createProduct(payload);
      }
      setProductModal({ open: false });
      loadData();
    } catch (error) {
      console.error("Failed to save product:", error);
      // alert("Failed to save product: " + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };
  const deleteProductHandler = async (id) => {
    if (!confirm('Delete this product?'))
      return;
    await apiDeleteProduct(id);
    loadData();
  };
  const updateOrderStatus = async (orderId, status) => {
    await apiUpdateOrderStatus(orderId, status);
    loadData();
  };
  const updateInventory = async (id, quantity) => {
    await apiUpdateInventory({ id, quantity });
    loadData();
  };
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', icon: RefreshCw },
    { id: 'coupons', label: 'Coupons', icon: Tag },
  ];
  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase()));
  const filteredOrders = orders.filter(o => o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()));
  return (<div className="min-h-screen bg-secondary/30 flex">
    {/* Sidebar */}
    <motion.aside animate={{ width: sidebarOpen ? 240 : 64 }} className="bg-card border-r border-border flex flex-col shrink-0 overflow-hidden" transition={{ duration: 0.2 }}>
      <div className="h-16 flex items-center px-4 border-b border-border gap-3">
        <img src="/favicon-raistore.png" alt="RaiStore" className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
        {sidebarOpen && <span className="font-display font-bold text-foreground truncate">Admin</span>}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => (<button key={item.id} onClick={() => setTab(item.id)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-body transition-colors', tab === item.id
          ? 'gradient-orange text-white shadow-brand'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary')}>
          <item.icon className="h-4 w-4 flex-shrink-0" />
          {sidebarOpen && <span className="truncate">{item.label}</span>}
        </button>))}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-body text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </motion.aside>

    {/* Main */}
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top bar */}
      <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 sticky top-0 z-20">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-muted-foreground hover:text-foreground">
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="font-display font-bold text-foreground capitalize">{tab}</h1>
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-9 pr-4 py-2 text-sm bg-secondary border border-border rounded-xl font-body focus:outline-none focus:ring-2 focus:ring-ring w-64" />
        </div>
        <button onClick={loadData} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">
          <RefreshCw className="h-4 w-4" />
        </button>
        <a href="/" className="text-xs font-body text-muted-foreground hover:text-primary">← View Store</a>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {loading ? (<div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>) : (<>
          {/* DASHBOARD */}
          {tab === 'dashboard' && (<div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' },
                { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-600 bg-blue-100' },
                { label: 'Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600 bg-purple-100' },
                { label: 'Low Stock', value: inventory.filter(i => i.quantity <= i.low_stock_threshold).length, icon: AlertTriangle, color: 'text-amber-600 bg-amber-100' },
              ].map((stat, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-2xl p-5 border border-border shadow-card">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <p className="font-display font-bold text-2xl text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-body">{stat.label}</p>
              </motion.div>))}
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-display font-bold text-lg text-foreground mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map(order => (<div key={order.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                  <div>
                    <p className="font-semibold text-sm text-foreground font-body">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground font-body">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-foreground">${Number(order.total).toFixed(2)}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-body font-semibold', statusColors[order.status])}>
                      {order.status}
                    </span>
                  </div>
                </div>))}
                {orders.length === 0 && <p className="text-muted-foreground text-sm font-body text-center py-8">No orders yet</p>}
              </div>
            </div>

            {/* Low Stock Alert */}
            {inventory.filter(i => i.quantity <= i.low_stock_threshold).length > 0 && (<div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h3 className="font-display font-bold text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Low Stock Alerts
              </h3>
              <div className="space-y-2">
                {inventory.filter(i => i.quantity <= i.low_stock_threshold).map(item => (<div key={item._id || item.id} className="flex items-center justify-between">
                  <span className="text-sm font-body text-amber-900">{item.products?.name}</span>
                  <span className="text-sm font-bold text-amber-700 font-body">{item.quantity} left</span>
                </div>))}
              </div>
            </div>)}
          </div>)}

          {/* PRODUCTS */}
          {tab === 'products' && (<div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground font-body text-sm">{filteredProducts.length} products</p>
              <button onClick={() => openProductModal()} className="gradient-orange text-white px-4 py-2 rounded-xl font-semibold font-body text-sm shadow-brand flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </button>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <table className="w-full text-sm font-body">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Badge</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Featured</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map(product => (<tr key={product._id || product.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-secondary" />
                        <div>
                          <p className="font-semibold text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{product.categories?.name || '—'}</td>
                    <td className="px-4 py-3 font-display font-bold text-foreground">${product.price}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {product.badge && <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-full">{product.badge}</span>}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {product.is_featured ? <Check className="h-4 w-4 text-emerald-500" /> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openProductModal(product)} className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-accent transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteProductHandler(product._id || product.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>))}
                  {filteredProducts.length === 0 && (<tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No products found</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>)}

          {/* ORDERS */}
          {tab === 'orders' && (<div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <table className="w-full text-sm font-body">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map(order => (<tr key={order._id || order.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{order.order_number}</td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-foreground">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 font-display font-bold text-foreground">${Number(order.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select value={order.status} onChange={e => updateOrderStatus(order._id || order.id, e.target.value)} className={cn('text-xs px-2 py-1 rounded-lg font-semibold border-0 cursor-pointer', statusColors[order.status])}>
                      {ORDER_STATUSES.map(s => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">{order.items?.length || 0} items</span>
                  </td>
                </tr>))}
                {filteredOrders.length === 0 && (<tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No orders yet</td></tr>)}
              </tbody>
            </table>
          </div>)}

          {/* INVENTORY */}
          {tab === 'inventory' && (<div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <table className="w-full text-sm font-body">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Threshold</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.map(item => (<tr key={item._id || item.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{item.products?.name}</p>
                    <p className="text-xs text-muted-foreground">{item.products?.brand}</p>
                  </td>
                  <td className="px-4 py-3">
                    <input type="number" defaultValue={item.quantity} onBlur={e => updateInventory(item._id || item.id, Number(e.target.value))} className="w-20 px-2 py-1 bg-secondary border border-border rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-ring" />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{item.low_stock_threshold}</td>
                  <td className="px-4 py-3">
                    {item.quantity === 0 ? (<span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-semibold">Out of Stock</span>) : item.quantity <= item.low_stock_threshold ? (<span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">Low Stock</span>) : (<span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">In Stock</span>)}
                  </td>
                </tr>))}
              </tbody>
            </table>
          </div>)}

          {/* COUPONS */}
          {tab === 'coupons' && (<div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <p className="font-body text-sm text-muted-foreground">{coupons.length} coupons</p>
            </div>
            <table className="w-full text-sm font-body">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Discount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Uses</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map(coupon => (<tr key={coupon._id || coupon.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-primary bg-accent px-2 py-1 rounded-lg text-xs">{coupon.code}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{coupon.description}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`} off
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                    {coupon.used_count} / {coupon.max_uses || '∞'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('text-xs px-2 py-1 rounded-full font-semibold', coupon.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600')}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>))}
              </tbody>
            </table>
          </div>)}
        </>)}
      </main>
    </div>

    {/* Product Modal */}
    {productModal.open && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={() => setProductModal({ open: false })} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-card rounded-3xl shadow-xl-custom w-full max-w-2xl p-6 border border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-foreground">
            {productModal.product ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={() => setProductModal({ open: false })} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Product Name', key: 'name', type: 'text', span: 2 },
            { label: 'Brand', key: 'brand', type: 'text', span: 1 },
            { label: 'Price ($)', key: 'price', type: 'number', span: 1 },
            { label: 'Original Price ($)', key: 'original_price', type: 'number', span: 1 },
            { label: 'Badge', key: 'badge', type: 'select', span: 1, options: ['', 'Best Seller', 'New', 'Sale', 'Limited', 'Trending'] },
          ].map(field => (<div key={field.key} className={cn(field.span === 2 ? 'col-span-2' : 'col-span-1')}>
            <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1 block">{field.label}</label>
            {field.type === 'select' ? (<select value={productForm[field.key] || ''} onChange={e => setProductForm({ ...productForm, [field.key]: e.target.value })} className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {field.options?.map((o, i) => <option key={`${o}-${i}`} value={o}>{o || 'None'}</option>)}
            </select>) : (<input type={field.type} value={productForm[field.key] || ''} onChange={e => setProductForm({ ...productForm, [field.key]: e.target.value })} className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />)}
          </div>))}

          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1 block">Category</label>
            <select value={productForm.category_id || ''} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })} className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1 block">Description</label>
            <textarea value={productForm.description || ''} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows={3} className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1 block">Image URLs (one per line)</label>
            <textarea value={Array.isArray(productForm.images) ? productForm.images.join('\n') : productForm.images || ''} onChange={e => setProductForm({ ...productForm, images: e.target.value })} rows={3} placeholder="https://..." className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div className="col-span-1">
            <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1 block">Sizes (comma-separated)</label>
            <input type="text" value={Array.isArray(productForm.sizes) ? productForm.sizes.join(', ') : productForm.sizes || ''} onChange={e => setProductForm({ ...productForm, sizes: e.target.value })} placeholder="S, M, L, XL" className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="col-span-1">
            <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1 block">Colors (hex, comma-separated)</label>
            <input type="text" value={Array.isArray(productForm.colors) ? productForm.colors.join(', ') : productForm.colors || ''} onChange={e => setProductForm({ ...productForm, colors: e.target.value })} placeholder="#ff0000, #00ff00" className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-semibold text-muted-foreground font-body uppercase tracking-wider mb-1 block">Features (one per line)</label>
            <textarea value={Array.isArray(productForm.features) ? productForm.features.join('\n') : productForm.features || ''} onChange={e => setProductForm({ ...productForm, features: e.target.value })} rows={3} className="w-full px-3 py-2.5 bg-secondary border border-border rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </div>

          <div className="col-span-2 flex gap-6">
            {[
              { key: 'is_featured', label: 'Featured Product' },
              { key: 'is_active', label: 'Active (visible)' },
            ].map(f => (<label key={f.key} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={!!productForm[f.key]} onChange={e => setProductForm({ ...productForm, [f.key]: e.target.checked })} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-body text-foreground">{f.label}</span>
            </label>))}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <button onClick={() => setProductModal({ open: false })} className="flex-1 px-4 py-2.5 bg-secondary border border-border rounded-xl font-semibold font-body text-sm hover:bg-border transition-colors">
            Cancel
          </button>
          <button onClick={saveProduct} disabled={saving} className="flex-1 gradient-orange text-white px-4 py-2.5 rounded-xl font-semibold font-body text-sm shadow-brand flex items-center justify-center gap-2 disabled:opacity-70">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Product'}
          </button>
        </div>
      </motion.div>
    </div>)}
  </div>);
}
