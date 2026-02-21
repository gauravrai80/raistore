import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { sendWelcomeEmail } from '../utils/emailService.js';

export const register = async (req, res) => {
  const { full_name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ full_name, email, password });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(console.error);

    const token = generateToken(user._id.toString(), user.role);
    res.status(201).json({
      token,
      user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role, avatar_url: user.avatar_url }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user._id.toString(), user.role);
    res.json({
      token,
      user: { id: user._id, full_name: user.full_name, email: user.email, role: user.role, avatar_url: user.avatar_url }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, full_name: user.full_name, email: user.email, role: user.role, avatar_url: user.avatar_url, phone: user.phone });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { full_name: req.body.full_name, phone: req.body.phone, avatar_url: req.body.avatar_url },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.comparePassword(current_password))) {
      return res.status(401).json({ message: 'Current password incorrect' });
    }
    user.password = new_password;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
