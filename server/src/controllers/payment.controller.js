import Stripe from 'stripe';
import Product from '../models/Product.js';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items provided' });
        }

        // Calculate total amount – verify against DB when possible, fall back to client price
        let total = 0;
        for (const item of items) {
            try {
                const product = await Product.findById(item.product.id || item.product._id);
                if (product) {
                    total += product.price * item.quantity;
                } else {
                    // Product not found in DB (e.g. local/seed product) – use client price
                    total += (item.product.price || 0) * item.quantity;
                }
            } catch {
                // Invalid ObjectId (local product) – use client price
                total += (item.product.price || 0) * item.quantity;
            }
        }

        // Add shipping/tax logic if needed (matching frontend: >$100 free shipping, else $9.99, +8% tax)
        const subtotal = total;
        const shipping = subtotal > 100 ? 0 : 9.99;
        const tax = subtotal * 0.08;
        const finalTotal = subtotal + shipping + tax;

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(finalTotal * 100), // Amount in cents
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: error.message });
    }
};
