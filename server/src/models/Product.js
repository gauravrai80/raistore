import mongoose from 'mongoose';

const BADGE_VALUES = ['Best Seller', 'New', 'Sale', 'Limited', 'Trending'];

const ProductSchema = new mongoose.Schema(
  {
    name:           { type: String, required: true },
    slug:           { type: String, required: true, unique: true },
    brand:          { type: String, required: true },
    description:    { type: String },
    price:          { type: Number, required: true },
    original_price: { type: Number },
    category_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    subcategory:    { type: String },
    images:         { type: [String], default: [] },
    colors:         { type: [String], default: [] },
    sizes:          { type: [String], default: [] },
    features:       { type: [String], default: [] },
    badge:          { type: String, enum: BADGE_VALUES },
    rating:         { type: Number, default: 0, min: 0, max: 5 },
    review_count:   { type: Number, default: 0 },
    is_featured:    { type: Boolean, default: false },
    is_active:      { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

ProductSchema.index({ name: 'text', brand: 'text', description: 'text' });

export default mongoose.model('Product', ProductSchema);
