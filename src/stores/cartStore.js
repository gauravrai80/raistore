import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storefrontApiRequest } from '@/lib/shopify';
const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id checkoutUrl
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;
const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }
      }
      userErrors { field message }
    }
  }
`;
const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;
const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;
function formatCheckoutUrl(url) {
    try {
        const u = new URL(url);
        u.searchParams.set('channel', 'online_store');
        return u.toString();
    }
    catch {
        return url;
    }
}
function isCartNotFound(errors) {
    return errors.some(e => e.message.toLowerCase().includes('cart not found') ||
        e.message.toLowerCase().includes('does not exist'));
}
async function createShopifyCart(item) {
    const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
        input: { lines: [{ quantity: item.quantity, merchandiseId: item.variantId }] },
    });
    const errors = data?.data?.cartCreate?.userErrors || [];
    if (errors.length > 0) {
        console.error('Cart create errors:', errors);
        return null;
    }
    const cart = data?.data?.cartCreate?.cart;
    if (!cart?.checkoutUrl)
        return null;
    const lineId = cart.lines.edges[0]?.node?.id;
    if (!lineId)
        return null;
    return { cartId: cart.id, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId };
}
async function addLineToCart(cartId, item) {
    const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
        cartId,
        lines: [{ quantity: item.quantity, merchandiseId: item.variantId }],
    });
    const errors = data?.data?.cartLinesAdd?.userErrors || [];
    if (isCartNotFound(errors))
        return { success: false, cartNotFound: true };
    if (errors.length > 0) {
        console.error('Add line errors:', errors);
        return { success: false };
    }
    const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
    const newLine = lines.find((l) => l.node.merchandise.id === item.variantId);
    return { success: true, lineId: newLine?.node?.id };
}
async function updateCartLine(cartId, lineId, quantity) {
    const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
        cartId,
        lines: [{ id: lineId, quantity }],
    });
    const errors = data?.data?.cartLinesUpdate?.userErrors || [];
    if (isCartNotFound(errors))
        return { success: false, cartNotFound: true };
    if (errors.length > 0) {
        console.error('Update line errors:', errors);
        return { success: false };
    }
    return { success: true };
}
async function removeCartLine(cartId, lineId) {
    const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
        cartId,
        lineIds: [lineId],
    });
    const errors = data?.data?.cartLinesRemove?.userErrors || [];
    if (isCartNotFound(errors))
        return { success: false, cartNotFound: true };
    if (errors.length > 0) {
        console.error('Remove line errors:', errors);
        return { success: false };
    }
    return { success: true };
}
export const useCartStore = create()(persist((set, get) => ({
    items: [],
    cartId: null,
    checkoutUrl: null,
    isLoading: false,
    isSyncing: false,
    addItem: async (item) => {
        const { items, cartId, clearCart } = get();
        const existing = items.find(i => i.variantId === item.variantId);
        set({ isLoading: true });
        try {
            if (!cartId) {
                const result = await createShopifyCart({ ...item, lineId: null });
                if (result) {
                    set({ cartId: result.cartId, checkoutUrl: result.checkoutUrl, items: [{ ...item, lineId: result.lineId }] });
                }
            }
            else if (existing) {
                const newQty = existing.quantity + item.quantity;
                if (!existing.lineId)
                    return;
                const result = await updateCartLine(cartId, existing.lineId, newQty);
                if (result.success) {
                    set({ items: get().items.map(i => i.variantId === item.variantId ? { ...i, quantity: newQty } : i) });
                }
                else if (result.cartNotFound) {
                    clearCart();
                }
            }
            else {
                const result = await addLineToCart(cartId, { ...item, lineId: null });
                if (result.success) {
                    set({ items: [...get().items, { ...item, lineId: result.lineId ?? null }] });
                }
                else if (result.cartNotFound) {
                    clearCart();
                }
            }
        }
        catch (err) {
            console.error('addItem error:', err);
        }
        finally {
            set({ isLoading: false });
        }
    },
    updateQuantity: async (variantId, quantity) => {
        if (quantity <= 0) {
            await get().removeItem(variantId);
            return;
        }
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId)
            return;
        set({ isLoading: true });
        try {
            const result = await updateCartLine(cartId, item.lineId, quantity);
            if (result.success) {
                set({ items: get().items.map(i => i.variantId === variantId ? { ...i, quantity } : i) });
            }
            else if (result.cartNotFound) {
                clearCart();
            }
        }
        catch (err) {
            console.error('updateQuantity error:', err);
        }
        finally {
            set({ isLoading: false });
        }
    },
    removeItem: async (variantId) => {
        const { items, cartId, clearCart } = get();
        const item = items.find(i => i.variantId === variantId);
        if (!item?.lineId || !cartId)
            return;
        set({ isLoading: true });
        try {
            const result = await removeCartLine(cartId, item.lineId);
            if (result.success) {
                const newItems = get().items.filter(i => i.variantId !== variantId);
                newItems.length === 0 ? clearCart() : set({ items: newItems });
            }
            else if (result.cartNotFound) {
                clearCart();
            }
        }
        catch (err) {
            console.error('removeItem error:', err);
        }
        finally {
            set({ isLoading: false });
        }
    },
    clearCart: () => set({ items: [], cartId: null, checkoutUrl: null }),
    getCheckoutUrl: () => get().checkoutUrl,
    syncCart: async () => {
        const { cartId, isSyncing, clearCart } = get();
        if (!cartId || isSyncing)
            return;
        set({ isSyncing: true });
        try {
            const data = await storefrontApiRequest(CART_QUERY, { id: cartId });
            if (!data)
                return;
            const cart = data?.data?.cart;
            if (!cart || cart.totalQuantity === 0)
                clearCart();
        }
        catch (err) {
            console.error('syncCart error:', err);
        }
        finally {
            set({ isSyncing: false });
        }
    },
}), {
    name: 'shopify-cart',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ items: state.items, cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
}));
