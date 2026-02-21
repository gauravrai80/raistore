import Coupon from '../models/Coupon.js';

export const getCoupons = async (req, res) => {
  const now = new Date();
  const coupons = await Coupon.find({
    is_active: true,
    $or: [{ expires_at: { $gt: now } }, { expires_at: null }],
  }).sort('-created_at');
  res.json(coupons);
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { is_active: false }, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deactivated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
