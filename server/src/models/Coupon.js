import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code:             { type: String, required: true, unique: true, uppercase: true },
    description:      { type: String },
    discount_type:    { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discount_value:   { type: Number, required: true },
    min_order_amount: { type: Number, default: 0 },
    max_uses:         { type: Number },
    used_count:       { type: Number, default: 0 },
    expires_at:       { type: Date },
    is_active:        { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at' } }
);

export default mongoose.model('Coupon', CouponSchema);
