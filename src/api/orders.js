import api from './client';
export const createOrder = (data) => api.post('/orders', data).then(r => r.data);
export const getMyOrders = () => api.get('/orders/my').then(r => r.data);
export const getAllOrders = (params) => api.get('/orders', { params }).then(r => r.data);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status }).then(r => r.data);
