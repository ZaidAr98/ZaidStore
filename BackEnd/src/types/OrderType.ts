import { Document, Types } from "mongoose";

export interface OrderItem {
  paymentMethod: string;
  _id:string;
  productId: Types.ObjectId;
  name: string;
  size: string;
  quantity: number;
  price: number;
  offerDiscountPrice: number;
  couponDiscountPrice: number;
  totalMRP: number;
  discount: number;
  totalPrice: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled" | "Returned";
  deliveryDate?: Date;
  paymentStatus: "Pending" | "Paid" | "Unpaid" | "Refunded" | "Failed";
  returnRequest: {
    isRequested: boolean;
    reason?: string;
    comment?: string;
    isApproved: boolean;
    isResponseSend: boolean;
  };
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

interface ActivityLog {
  status: string;
  changedAt: Date;
}

export interface OrderType extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  customerName: string;
  items: OrderItem[];
  totalMRP: number;
  totalDiscount: number;
  couponDiscount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: "Cash on Delivery" | "Credit Card" | "PayPal" | "Wallet" | "Razorpay" | "UPI";
  paymentStatus: "Pending" | "Paid" | "Unpaid" | "Refunded" | "Failed";
  transactionId?: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  activityLog: ActivityLog[];
}