import api from './client';
export const getProducts = (params) => api.get('/products', { params }).then(r => r.data);
export const getAllProducts = (params) => api.get('/products/admin/all', { params }).then(r => r.data);
export const getProductBySlug = (slug) => api.get(`/products/${slug}`).then(r => r.data);
export const createProduct = (data) => api.post('/products', data).then(r => r.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then(r => r.data);
