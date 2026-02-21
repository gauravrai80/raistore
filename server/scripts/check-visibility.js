
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloom-commerce';

async function checkProducts() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const products = await Product.find().sort({ created_at: -1 }).limit(10);
        console.log('Latest Products:');
        products.forEach(p => {
            console.log(`- ${p.name}`);
            console.log(`  _id: ${p._id}`);
            console.log(`  is_active: ${p.is_active}`);
            console.log(`  category_id: ${p.category_id}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkProducts();
