import mongoose from 'mongoose';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

const OrderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.Mixed }, // supports both ObjectId and local string/number IDs
  product_name: { type: String, required: true },
  brand: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  product_image: { type: String },
  selected_color: { type: String },
  selected_size: { type: String },
});

const OrderSchema = new mongoose.Schema(
  {
    order_number: { type: String, unique: true, default: () => `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}` },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping_cost: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    payment_status: { type: String, default: 'pending' },
    payment_method: { type: String },
    shipping_address: { type: mongoose.Schema.Types.Mixed, default: {} },
    notes: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('Order', OrderSchema);
