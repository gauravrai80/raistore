import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
    console.error("❌ MongoDB URI missing in .env");
    process.exit(1);
}

async function createAdmin() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoURI);
        console.log("✅ Connected to MongoDB");

        const adminEmail = 'admin@example.com';
        const adminPassword = 'adminpassword123';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("⚠️ Admin user already exists.");
            process.exit(0);
        }

        // Create Admin User
        const adminUser = new User({
            full_name: 'Admin User',
            email: adminEmail,
            password: adminPassword, // Will be hashed by pre-save hook
            role: 'admin',
            is_verified: true
        });

        await adminUser.save();
        console.log(`🎉 Admin user created successfully!`);
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);

    } catch (error) {
        console.error("❌ Failed to create admin user:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

createAdmin();
