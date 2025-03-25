import mongoose, { Document, Types } from 'mongoose';
import { ProductType } from '../types/ProductType';


const sizeSchema = new mongoose.Schema({
  _id:{type:String},
  size: { type: String, required: true },
  price: { type: Number, required: true, min: 1, max: 8000 },
  stock: { type: Number, required: true, min: 0, max: 1000 },
});


const productSchema = new mongoose.Schema<ProductType>(
  {
    name: { type: String, required: true, index: true },
    company: { type: String, required: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    isListed:{ type: Boolean , default:true},
    laptopType: { type: String, enum: ['PC', 'Laptop'], required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', index: true },
    sizes: [sizeSchema],
    images: [{ type: String, required: true }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

productSchema.pre<ProductType>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Create the model
const Product = mongoose.model<ProductType>('Product', productSchema);

export default Product;


