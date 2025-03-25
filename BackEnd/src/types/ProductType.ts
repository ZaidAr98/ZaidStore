
import {Types } from 'mongoose';



export type ProductType ={
  name: string;
  company: string;
  description: string;
  price: number;
  isListed:boolean;
  laptopType: string;
  categoryId: Types.ObjectId;
  sizes: { size: string; price: number; stock: number }[];
   images: string[];
  createdAt: Date;
  updatedAt: Date;
}


