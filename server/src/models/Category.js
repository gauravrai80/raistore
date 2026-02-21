import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name:          { type: String, required: true },
    slug:          { type: String, required: true, unique: true },
    icon:          { type: String },
    image_url:     { type: String },
    description:   { type: String },
    display_order: { type: Number, default: 0 },
    is_active:     { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at' } }
);

export default mongoose.model('Category', CategorySchema);
