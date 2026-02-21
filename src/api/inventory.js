import api from './client';
export const getInventory = (params) => api.get('/inventory', { params }).then(r => r.data);
export const updateInventory = (data) => api.put('/inventory', data).then(r => r.data);
