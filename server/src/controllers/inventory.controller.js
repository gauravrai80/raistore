import Inventory from '../models/Inventory.js';

export const getInventory = async (req, res) => {
  const { product_id } = req.query;
  const filter = {};
  if (product_id) filter.product_id = product_id;
  const items = await Inventory.find(filter).sort('-updated_at');
  res.json(items);
};

export const updateInventory = async (req, res) => {
  const { product_id, color, size } = req.body;
  try {
    const existing = await Inventory.findOne({ product_id, color, size });
    if (existing) {
      existing.quantity = req.body.quantity ?? existing.quantity;
      existing.low_stock_threshold = req.body.low_stock_threshold ?? existing.low_stock_threshold;
      await existing.save();
      return res.json(existing);
    }
    const created = await Inventory.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
