import mongoose, { Document, Schema } from 'mongoose';
import { ProductInput } from '../schemas/productSchema';



export interface ProductInput extends Document {
  name: string; 
  description: string; 
  isListed: Boolean; 
  createdAt: Date; 
}

// Define the schema
const productSchema = new mongoose.Schema<ProductInput>({
  name: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  discount: {
    type: Number,
    required: true,
    min: [0, "Discount cannot be negative"],
    max: [90, "Discount cannot exceed 90%"],
  },
  laptopType: {
    type: String,
    enum: ["PC", "Laptop"],
    required: true,
  },
 
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    
  },
  sizes: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true, min: 1, max: 8000 },
      stock: { type: Number, required: true, min: 0, max: 1000 },
    },
  ],
  images: [{ type: String, required: true }],
  totalStock: {
    type: Number,
    default: 0,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
  reviews: [
    {
      name: {
        type: String,
      },
      rating: {
        type: Number,
      },
      comment: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to calculate totalStock before saving
productSchema.pre<ProductInput>("save", function (next) {
  this.totalStock = this.sizes.reduce((sum, size) => sum + size.stock, 0);
  next();
});

// Middleware to update the updatedAt field before saving
productSchema.pre<ProductInput>("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Create the model
const Product = mongoose.model<ProductInput>("Product", productSchema);

export default Product;


//fix this schema
// remove .env