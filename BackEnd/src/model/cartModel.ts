
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ProductType } from '../types/ProductType';


export interface ICartItem {
    productId:any;
    size: string;
    quantity: number;
    latestPrice: number;
    discount: number;
    maxQtyPerUser: number;
    inStock:boolean;
    platformFee: number;
  }


  export interface ICart extends Document {
    userId: Types.ObjectId;
    items: ICartItem[];
    platformFee: number;
    createdAt: Date;
    updatedAt: Date;

  }
  


  
  // Cart Item Schema
  const cartItemSchema = new Schema<ICartItem>({
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    size: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    latestPrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      required: true,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    maxQtyPerUser: {
      type: Number,
      default: 5
    },
    inStock: {
      type: Boolean,
      default: true
    }
  });

  const CartSchema = new mongoose.Schema<ICart>({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
        unique:true  //one user have one cart
    },
    items:[cartItemSchema],
    platformFee:{
        type:Number,
        default:3
    },
},
{
    timestamps:true
})


const Cart = mongoose.model<ICart>('Cart', CartSchema);

export interface IPopulatedCartItem extends Omit<ICartItem, 'productId'> {
  productId: ProductType;
}





export default Cart;