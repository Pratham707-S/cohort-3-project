import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { User } from './models/user.model';
import { Product } from './models/product.model';

const demoProducts = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise canceling headphones with dual processors and 8 microphones for exceptional sound quality.',
    price: 349.99,
    category: 'Electronics',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Apple MacBook Pro 16" M3 Max',
    description: 'The ultimate pro laptop with a Liquid Retina XDR display, incredible battery life, and high-performance Apple Silicon.',
    price: 2499.00,
    category: 'Electronics',
    stock: 8,
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Classic Vintage Leather Jacket',
    description: 'Handcrafted genuine leather jacket with premium quilted lining, antique brass zippers, and a timeless silhouette.',
    price: 189.50,
    category: 'Clothing',
    stock: 25,
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Nike Air Max 270 Sneakers',
    description: 'Modern lifestyle shoes featuring Nike\'s biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks.',
    price: 150.00,
    category: 'Sports',
    stock: 32,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Smart Minimalist Coffee Maker',
    description: 'Precision temperature brew system with programmable timer, stainless steel thermal carafe, and aroma selector.',
    price: 129.99,
    category: 'Home & Kitchen',
    stock: 14,
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Atomic Habits by James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. Over 15 million copies sold worldwide.',
    price: 22.99,
    category: 'Books',
    stock: 50,
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Organic Botanical Skincare Serum',
    description: 'Nourishing antioxidant serum enriched with Vitamin C, Hyaluronic Acid, and botanical extracts for a radiant glow.',
    price: 45.00,
    category: 'Beauty',
    stock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Professional Yoga & Fitness Mat',
    description: 'Eco-friendly non-slip exercise mat with high-density cushioning, alignment guide lines, and carry strap included.',
    price: 39.99,
    category: 'Sports',
    stock: 22,
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80',
  },
];

const seedData = async () => {
  try {
    await connectDB();

    // Find or create admin seed user
    let user = await User.findOne();
    if (!user) {
      user = new User({
        name: 'Pratham Store Admin',
        email: 'admin@storecraft.com',
        password: 'Password123',
      });
      await user.save();
    }

    // Insert demo products
    for (const prod of demoProducts) {
      const exists = await Product.findOne({ name: prod.name });
      if (!exists) {
        await Product.create({
          ...prod,
          createdBy: user._id,
        });
        console.log(`Added product: ${prod.name}`);
      }
    }

    console.log('✅ Demo products seeded successfully into MongoDB Atlas!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
