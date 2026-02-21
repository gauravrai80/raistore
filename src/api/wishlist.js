import api from './client';
export const getWishlist = () => api.get('/wishlists').then(r => r.data);
export const addToWishlist = (product_id) => api.post('/wishlists', { product_id }).then(r => r.data);
export const removeFromWishlist = (product_id) => api.delete(`/wishlists/${product_id}`).then(r => r.data);
