import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, ShoppingBag, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { getMyOrders } from '@/api/orders';

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30' },
    processing: { label: 'Processing', icon: Package, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    shipped: { label: 'Shipped', icon: Truck, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
    delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-500 bg-red-50 dark:bg-red-950/30' },
    refunded: { label: 'Refunded', icon: XCircle, color: 'text-gray-500 bg-gray-100 dark:bg-gray-800' },
};

function StatusBadge({ status }) {
    const cfg = statusConfig[status] || statusConfig.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full font-body ${cfg.color}`}>
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
        </span>
    );
}

export default function Orders() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        getMyOrders()
            .then(data => setOrders(Array.isArray(data) ? data : []))
            .catch(err => setError(err?.response?.data?.message || err.message))
            .finally(() => setLoading(false));
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-10 max-w-4xl">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 font-body font-medium"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Shopping
                </button>

                <div className="mb-8">
                    <h1 className="font-display text-3xl font-bold text-foreground">My Orders</h1>
                    <p className="text-muted-foreground font-body mt-1">Track and manage your purchases</p>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-32">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="text-center py-20 text-red-500 font-body">{error}</div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-32"
                    >
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-5">
                            <ShoppingBag className="h-9 w-9 text-muted-foreground" />
                        </div>
                        <h2 className="font-display text-2xl font-bold text-foreground mb-2">No orders yet</h2>
                        <p className="text-muted-foreground font-body mb-6">Your orders will appear here after you make a purchase.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="gradient-orange text-white px-6 py-3 rounded-xl font-semibold font-body"
                        >
                            Start Shopping
                        </button>
                    </motion.div>
                )}

                {!loading && orders.length > 0 && (
                    <div className="space-y-6">
                        {orders.map((order, i) => (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="bg-card border border-border rounded-2xl overflow-hidden shadow-card"
                            >
                                {/* Order Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border bg-secondary/30">
                                    <div>
                                        <p className="font-display font-bold text-foreground">{order.order_number}</p>
                                        <p className="text-xs text-muted-foreground font-body mt-0.5">
                                            {new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={order.status} />
                                        <span className="font-display font-bold text-foreground text-lg">${Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="divide-y divide-border">
                                    {(order.items || []).map((item, j) => (
                                        <div key={j} className="flex items-center gap-4 px-6 py-4">
                                            {item.product_image ? (
                                                <img
                                                    src={item.product_image}
                                                    alt={item.product_name}
                                                    className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0 bg-secondary"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-foreground font-body truncate">{item.product_name}</p>
                                                {item.brand && <p className="text-xs text-muted-foreground font-body">{item.brand}</p>}
                                                <div className="flex items-center gap-2 mt-1">
                                                    {item.selected_size && (
                                                        <span className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded font-body">Size: {item.selected_size}</span>
                                                    )}
                                                    {item.selected_color && (
                                                        <span className="text-xs bg-secondary text-foreground px-2 py-0.5 rounded font-body">Color: {item.selected_color}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="font-bold text-sm text-foreground font-body">${Number(item.price).toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground font-body">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Footer */}
                                <div className="flex flex-col sm:flex-row justify-between gap-2 px-6 py-3 bg-secondary/20 text-xs text-muted-foreground font-body border-t border-border">
                                    <span>Subtotal: ${Number(order.subtotal).toFixed(2)} · Shipping: ${Number(order.shipping_cost).toFixed(2)} · Tax: ${Number(order.tax).toFixed(2)}</span>
                                    <span className="capitalize">Payment: {order.payment_method || 'card'} · {order.payment_status}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
