// models/MenuItem.js
import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Food', 'Alcohol', 'Soft Drinks', 'Special Drinks', 'unknown'],
    required: true
  },
  imageUrl: { 
    type: String,
    default: ''
  }
});

export default mongoose.model('MenuItem', menuItemSchema);
