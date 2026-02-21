import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { CreditCard, ArrowLeft, Lock, Shield } from 'lucide-react';
import StripePaymentForm from '@/components/StripePaymentForm';
import { Navbar } from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

// Initialize Stripe outside to avoid recreation
const stripePromise = loadStripe('pk_test_51Shkw164XUn3aLBfTGcJQvqIXODhBsQALFHeY3npw2kqp6LzKr1z33nO54tbyqpoKTjUDMIIEhOii5A6eexmSb5q00JZkS4Dui');

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Checkout() {
    const { items, totalPrice } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [clientSecret, setClientSecret] = useState('');
    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
    });

    const shipping = totalPrice > 100 ? 0 : 9.99;
    const tax = totalPrice * 0.08;
    const total = totalPrice + shipping + tax;

    useEffect(() => {
        if (items.length > 0) {
            fetch(`${API_URL}/payment/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items }),
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.clientSecret) {
                        setClientSecret(data.clientSecret);
                    } else {
                        toast.error('Failed to initialize payment: ' + (data.message || 'Unknown error'));
                    }
                })
                .catch(() => toast.error('Failed to initialize payment. Is the server running?'));
        }
    }, [items]);

    const handleShippingChange = (field) => (e) => {
        setShippingInfo(prev => ({ ...prev, [field]: e.target.value }));
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-32 text-center">
                    <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <CreditCard className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6">Add some items before checking out.</p>
                    <button onClick={() => navigate('/')} className="gradient-orange text-white px-6 py-2.5 rounded-xl font-semibold font-body">
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-10">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 text-body font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back to Shopping
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Forms */}
                    <div>
                        <div className="mb-8">
                            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Checkout</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Lock className="h-3.5 w-3.5" />
                                Secure SSL Encrypted Transaction
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Steps Indicator */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'gradient-orange text-white' : 'bg-secondary text-muted-foreground'}`}>1</div>
                                <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'gradient-orange' : 'bg-secondary'}`} />
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'gradient-orange text-white' : 'bg-secondary text-muted-foreground'}`}>2</div>
                                <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'gradient-orange' : 'bg-secondary'}`} />
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'gradient-orange text-white' : 'bg-secondary text-muted-foreground'}`}>3</div>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="font-display text-lg font-bold mb-4">Shipping Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="First Name"
                                        value={shippingInfo.firstName}
                                        onChange={handleShippingChange('firstName')}
                                        className="w-full px-4 py-2.5 bg-secondary rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Last Name"
                                        value={shippingInfo.lastName}
                                        onChange={handleShippingChange('lastName')}
                                        className="w-full px-4 py-2.5 bg-secondary rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address"
                                        value={shippingInfo.address}
                                        onChange={handleShippingChange('address')}
                                        className="w-full col-span-2 px-4 py-2.5 bg-secondary rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={shippingInfo.city}
                                        onChange={handleShippingChange('city')}
                                        className="w-full px-4 py-2.5 bg-secondary rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Postal Code"
                                        value={shippingInfo.postalCode}
                                        onChange={handleShippingChange('postalCode')}
                                        className="w-full px-4 py-2.5 bg-secondary rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-2xl p-6">
                                <h3 className="font-display text-lg font-bold mb-4">Payment Method</h3>
                                {clientSecret ? (
                                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                        <StripePaymentForm
                                            clientSecret={clientSecret}
                                            items={items}
                                            subtotal={totalPrice}
                                            shippingCost={shipping}
                                            taxAmount={tax}
                                            total={total}
                                            customerName={user ? user.full_name : `${shippingInfo.firstName} ${shippingInfo.lastName}`.trim()}
                                            customerEmail={user ? user.email : ''}
                                            shippingAddress={shippingInfo}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="flex items-center justify-center p-8">
                                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <div className="bg-secondary/30 rounded-3xl p-6 lg:p-8 sticky top-24 border border-border/50">
                            <h3 className="font-display text-xl font-bold mb-6">Order Summary</h3>
                            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {items.map((item) => (
                                    <div key={item.product.id || item.product._id} className="flex gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-border">
                                            <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm line-clamp-1">{item.product.name}</p>
                                            <p className="text-xs text-muted-foreground mb-1">{item.selectedSize} · Qty {item.quantity}</p>
                                            <p className="font-bold text-sm text-primary">${(item.product.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-border">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Subtotal</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Shipping</span>
                                    <span className={shipping === 0 ? 'text-emerald-500 font-medium' : ''}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Tax</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-foreground pt-3 border-t border-border/50">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Shield className="h-3.5 w-3.5" />
                                <span>Secure Checkout</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
