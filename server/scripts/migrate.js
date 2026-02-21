import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Load root .env for Supabase
dotenv.config({ path: path.resolve(__dirname, '../.env') });   // Load server .env for MongoDB

// Supabase Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // Using public key as we are just reading public data, usually. If RLS blocks, might need secret key.

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials missing in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// MongoDB Configuration
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ MongoDB URI missing in .env");
  process.exit(1);
}

// Models (Simplified inline definition or import if possible, but for script simplicity we define schema here to match current server models)
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String },
  image_url: { type: String },
  description: { type: String },
  display_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at' } });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  original_price: { type: Number },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: String },
  images: { type: [String], default: [] },
  colors: { type: [String], default: [] },
  sizes: { type: [String], default: [] },
  features: { type: [String], default: [] },
  badge: { type: String },
  rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  is_featured: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);

async function migrate() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    // 1. Migrate Categories
    console.log("Fetching Categories from Supabase...");
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) throw catError;
    console.log(`Found ${categories.length} categories.`);

    const categoryMap = {}; // Map Supabase ID -> MongoDB ObjectId

    for (const cat of categories) {
      const existing = await Category.findOne({ slug: cat.slug });
      let savedCat;
      if (existing) {
        // Update
        Object.assign(existing, {
            name: cat.name,
            icon: cat.icon,
            image_url: cat.image_url,
            is_active: cat.is_active
        });
        savedCat = await existing.save();
        console.log(`Updated category: ${cat.name}`);
      } else {
        // Create
        savedCat = await Category.create({
          name: cat.name,
          slug: cat.slug, // Assuming Supabase has slug, if not generate one? Current code implies it exists.
          icon: cat.icon,
          image_url: cat.image_url,
          display_order: cat.display_order || 0,
          is_active: cat.is_active
        });
        console.log(`Created category: ${cat.name}`);
      }
      categoryMap[cat.id] = savedCat._id;
    }

    // 2. Migrate Products
    console.log("Fetching Products from Supabase...");
    const { data: products, error: prodError } = await supabase.from('products').select('*');
    if (prodError) throw prodError;
    console.log(`Found ${products.length} products.`);

    for (const prod of products) {
        const mongoCategoryId = categoryMap[prod.category_id]; // Assuming supabase product has category_id pointing to supabase category id

        // Construct product object
        const productData = {
          name: prod.name,
          slug: prod.slug || prod.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          brand: prod.brand || 'Generic',
          description: prod.description,
          price: prod.price,
          original_price: prod.original_price,
          category_id: mongoCategoryId,
          subcategory: prod.subcategory,
          images: prod.images || [], // Handle array compatibility
          colors: prod.colors || [],
          sizes: prod.sizes || [],
          features: prod.features || [],
          badge: prod.badge,
          rating: prod.rating,
          review_count: prod.review_count,
          is_featured: prod.is_featured,
          is_active: prod.is_active
        };

        const existing = await Product.findOne({ slug: productData.slug });
        if (existing) {
             Object.assign(existing, productData);
             await existing.save();
             console.log(`Updated product: ${prod.name}`);
        } else {
            await Product.create(productData);
            console.log(`Created product: ${prod.name}`);
        }
    }

    console.log("🎉 Migration Completed Successfully!");

  } catch (error) {
    console.error("❌ Migration Failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

migrate();
