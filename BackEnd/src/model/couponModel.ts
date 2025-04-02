import { Document, Model, Schema, model, Types } from "mongoose";

// Interface for UserCoupon document
interface IUserCoupon extends Document {
  couponId: Types.ObjectId;
  userId: Types.ObjectId;
  appliedCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// UserCoupon Schema
const userCouponSchema = new Schema<IUserCoupon>(
  {
    couponId: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    appliedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create composite index for faster lookups
userCouponSchema.index({ userId: 1, couponId: 1 });

// Discount type
type DiscountType = "percentage" | "flat";
type CustomerType = "all" | "new" | "existing";

// Interface for Coupon document
interface ICoupon extends Document {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue?: number;
  discountPercentage?: number;
  minPurchaseOrder: number;
  maxDiscountAmount?: number;
  applicableCategories: Types.ObjectId[];
  applicableProducts: Types.ObjectId[];
  validFrom: Date;
  expiryDate: Date;
  usageLimit: number;
  maxUsagePerUser: number;
  isActive: boolean;
  totalAppliedCount: number;
  customerType: CustomerType;
  createdAt?: Date;
  updatedAt?: Date;
}

// Coupon Schema
const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 500,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"] as DiscountType[],
      required: true,
    },
    discountValue: {
      type: Number,
      min: 1,
      validate: {
        validator: function (this: ICoupon, value: number) {
          return this.discountType === "flat" ? value >= 1 : true;
        },
        message: "Discount value must be at least 1 for flat discount type",
      },
    },
    discountPercentage: {
      type: Number,
      min: 1,
      max: 100,
      validate: {
        validator: function (this: ICoupon, value: number) {
          return this.discountType === "percentage"
            ? value >= 1 && value <= 100
            : true;
        },
        message:
          "Discount percentage is required for percentage discount type and must be between 1 and 100",
      },
    },
    minPurchaseOrder: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (this: ICoupon, value: number) {
          if (this.discountType == "percentage") {
            return value !== undefined && value >= 0;
          }
          return true;
        },
      },
    },
    applicableCategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    validFrom: {
      type: Date,
      default: Date.now(),
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    maxUsagePerUser: {
      type: Number,
      default: 1,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalAppliedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    customerType: {
      type: String,
      enum: ["all", "new", "existing"] as CustomerType[],
      default: "all",
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.pre<ICoupon>("save", function (next) {
  if (this.discountType === "percentage") {
    // If the discount type is "percentage", ensure `discountValue` is undefined
    this.discountValue = undefined;

    // Calculate the maximum discount amount based on the percentage
    if (this.discountPercentage && this.minPurchaseOrder) {
      this.maxDiscountAmount =
        (this.discountPercentage / 100) * this.minPurchaseOrder;
    }
  } else if (this.discountType === "flat") {
    // If the discount type is "flat", ensure `discountPercentage` is undefined
    this.discountPercentage = undefined;
    this.maxDiscountAmount = undefined; // No max limit for flat discount
  }
  next();
});

// Models
const Coupon: Model<ICoupon> = model<ICoupon>("Coupon", couponSchema);
const UserCoupon: Model<IUserCoupon> = model<IUserCoupon>("UserCoupon", userCouponSchema);

export { Coupon, UserCoupon, ICoupon, IUserCoupon };