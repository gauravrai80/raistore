import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { createOrder } from '@/api/orders';

export default function StripePaymentForm({
    clientSecret,
    items,
    subtotal,
    shippingCost,
    taxAmount,
    total,
    customerName,
    customerEmail,
    shippingAddress,
}) {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/`,
            },
            redirect: 'if_required',
        });

        if (error) {
            setMessage(error.message);
            toast.error(error.message);
            setIsLoading(false);
            return;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Save order to backend
            try {
                const orderPayload = {
                    customer_name: customerName || 'Guest',
                    customer_email: customerEmail || 'guest@example.com',
                    items: items.map(item => {
                        const rawId = item.product._id || item.product.id;
                        // Only pass the ID if it looks like a valid MongoDB ObjectId (24 hex chars)
                        const isMongoId = typeof rawId === 'string' && /^[a-f\d]{24}$/i.test(rawId);
                        return {
                            product_id: isMongoId ? rawId : null,
                            product_name: item.product.name,
                            brand: item.product.brand || '',
                            price: item.product.price,
                            quantity: item.quantity,
                            product_image: item.product.image || '',
                            selected_color: item.selectedColor || '',
                            selected_size: item.selectedSize || '',
                        };
                    }),
                    subtotal,
                    shipping_cost: shippingCost,
                    tax: taxAmount,
                    total,
                    status: 'processing',
                    payment_status: 'paid',
                    payment_method: 'stripe',
                    shipping_address: {
                        address: shippingAddress?.address || '',
                        city: shippingAddress?.city || '',
                        postal_code: shippingAddress?.postalCode || '',
                    },
                };
                await createOrder(orderPayload);
                toast.success('Payment successful! Your order has been placed.');
                clearCart();
                navigate('/orders');
            } catch (orderError) {
                const errMsg = orderError?.response?.data?.message || orderError.message;
                console.error('Order save error:', errMsg, orderError?.response?.data || orderError);
                toast.error(`Payment succeeded but order could not be saved: ${errMsg}. Please contact support.`);
                clearCart();
                navigate('/');
            }
        } else {
            setMessage('An unexpected error occurred. Please try again.');
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />

            {message && (
                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                    {message}
                </div>
            )}

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full gradient-orange text-white py-4 rounded-xl font-bold font-body text-base shadow-brand hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading
                    ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Confirm Payment'
                }
                {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                <Lock className="h-3.5 w-3.5" />
                <span>Secure Payment via Stripe</span>
            </div>
        </form>
    );
}
