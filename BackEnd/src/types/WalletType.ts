import { Document, Types } from "mongoose";

interface Transaction {
    transactionId: string;
    type: 'credit' | 'debit' | 'refund'; 
    amount: number;
    description?: string;
    orderId?: Types.ObjectId;
    status: "success" | "failed" | "pending";
    date: Date;
  }

  export interface WalletType extends Document {
    userId: Types.ObjectId;
    balance: number;
    transactionHistory: Transaction[];
    createdAt: Date;
    updatedAt: Date;
  }