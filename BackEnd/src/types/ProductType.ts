
import mongoose, {Types } from 'mongoose';
import { offerType } from '../model/offerModel';


interface ISize {
  size: string;
  price: number;
  stock: number;
}

interface IReview {
  name?: string;
  rating?: number;
  comment?: string;
  createdAt?: Date;
}
export type ProductType ={
  _id: string; 
  name: string;
  company: string;
  description: string;
  price: number;
  laptopType: string;
  categoryId: Types.ObjectId;
  offerId?: mongoose.Types.ObjectId;
  sizes: ISize[];
   images: string[];
   totalStock: number;
   isFeatured: boolean;
   isListed: boolean;
   reviews: IReview[];
  createdAt: Date;
  updatedAt: Date;
}


