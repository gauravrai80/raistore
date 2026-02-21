import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    full_name:              { type: String, required: true, trim: true },
    email:                  { type: String, required: true, unique: true, lowercase: true },
    password:               { type: String, required: true, minlength: 6, select: false },
    avatar_url:             { type: String },
    phone:                  { type: String },
    role:                   { type: String, enum: ['admin', 'user'], default: 'user' },
    is_verified:            { type: Boolean, default: false },
    verification_token:     { type: String, select: false },
    reset_password_token:   { type: String, select: false },
    reset_password_expires: { type: Date, select: false },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', UserSchema);
