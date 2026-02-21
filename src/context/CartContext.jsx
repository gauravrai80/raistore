import { createContext, useContext, useState, useEffect } from 'react';
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
    });
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('wishlist');
        return saved ? JSON.parse(saved) : [];
    });
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);
    const addToCart = (product, qty = 1, color, size) => {
        setItems(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) {
                return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
            }
            return [...prev, { product, quantity: qty, selectedColor: color, selectedSize: size }];
        });
    };
    const removeFromCart = (productId) => {
        setItems(prev => prev.filter(i => i.product.id !== productId));
    };
    const updateQuantity = (productId, qty) => {
        if (qty <= 0) {
            removeFromCart(productId);
            return;
        }
        setItems(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
    };
    const toggleWishlist = (productId) => {
        setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
    };
    const clearCart = () => setItems([]);
    const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const isInWishlist = (productId) => wishlist.includes(productId);
    return (<CartContext.Provider value={{ items, wishlist, addToCart, removeFromCart, updateQuantity, toggleWishlist, clearCart, totalItems, totalPrice, isInWishlist }}>
      {children}
    </CartContext.Provider>);
}
export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx)
        throw new Error('useCart must be used within CartProvider');
    return ctx;
}
