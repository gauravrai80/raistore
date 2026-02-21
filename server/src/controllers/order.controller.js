import Order from '../models/Order.js';
import { sendOrderConfirmationEmail, sendOrderStatusEmail } from '../utils/emailService.js';

export const createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      user_id: req.user?.id || undefined,
    });

    // Send order confirmation email (non-blocking)
    sendOrderConfirmationEmail(order).catch(console.error);

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user_id: req.user.id }).sort('-created_at');
  res.json(orders);
};

export const getAllOrders = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).skip(skip).limit(Number(limit)).sort('-created_at'),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, total });
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Notify customer of status change (non-blocking)
  sendOrderStatusEmail(order).catch(console.error);

  res.json(order);
};
