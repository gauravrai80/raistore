import Product from '../models/Product.js';
import mongoose from 'mongoose';
import Category from '../models/Category.js'; // Assuming Category model exists

// Public getProducts (filtered by active)
export const getProducts = async (req, res) => {
  const { category, featured, badge, search, page = 1, limit = 20 } = req.query;
  const filter = { is_active: true };

  // Handle category filter safely
  if (category && category !== 'undefined' && category !== 'null') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category_id = category;
    } else {
      // Try to find category by slug or name if it's not an ID
      const cat = await Category.findOne({
        $or: [{ slug: category }, { name: { $regex: new RegExp(`^${category}$`, 'i') } }]
      });
      if (cat) {
        filter.category_id = cat._id;
      } else {
        // If category not found by slug/name either, return empty or ignore?
        // If user specifically asked for a category that doesn't exist, returning nothing is correct.
        // BUT to avoid crash, we must NOT set an invalid ID in filter.
        // We can set a dummy ID that won't match anything.
        return res.json({ products: [], total: 0, page: Number(page), pages: 0 });
      }
    }
  }

  if (featured === 'true') filter.is_featured = true;
  if (badge) filter.badge = badge;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category_id', 'name slug').skip(skip).limit(Number(limit)).sort('-created_at'),
    Product.countDocuments(filter),
  ]);
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

// Admin getAllProducts (no active filter)
export const getAllProducts = async (req, res) => {
  const { category, search, page = 1, limit = 50 } = req.query;
  const filter = {};

  if (category) filter.category_id = category;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category_id', 'name slug').skip(skip).limit(Number(limit)).sort('-created_at'),
    Product.countDocuments(filter),
  ]);
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
};

export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, is_active: true }).populate('category_id', 'name slug');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
