import mongoose from "mongoose";

// Define the input interface for creating a product
export interface CreateProductInput {
  name: string;
  company: string;
  description: string;
  price: number;
  discount: number;
  laptopType: "PC" | "Laptop";
  categoryId: mongoose.Types.ObjectId;
  sizes: Array<{
    size: string;
    price: number;
    stock: number;
  }>;
  images: string[];
  totalStock?: number;
  isFeatured?: boolean;
  isListed?: boolean;
  reviews?: Array<{
    name: string;
    rating: number;
    comment: string;
    createdAt?: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the document interface for the product

