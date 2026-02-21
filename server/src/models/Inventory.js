import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema(
  {
    product_id:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sku:                 { type: String },
    quantity:            { type: Number, default: 0, min: 0 },
    low_stock_threshold: { type: Number, default: 10 },
    color:               { type: String },
    size:                { type: String },
  },
  { timestamps: { updatedAt: 'updated_at' } }
);

export default mongoose.model('Inventory', InventorySchema);
