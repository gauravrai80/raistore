import Wishlist from '../models/Wishlist.js';

export const getWishlist = async (req, res) => {
  const items = await Wishlist.find({ user_id: req.user.id }).populate('product_id');
  res.json(items);
};

export const addToWishlist = async (req, res) => {
  try {
    const item = await Wishlist.create({ user_id: req.user.id, product_id: req.body.product_id });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ user_id: req.user.id, product_id: req.params.product_id });
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
