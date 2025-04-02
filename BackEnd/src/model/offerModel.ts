import mongoose, { Document, Model, Schema, model, Types } from "mongoose";

export interface offerType extends Document {
  name: string;
  offerValue: number;
  targetType: "Category" | "Product";
  targetId: mongoose.Types.ObjectId ;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const offerSchema = new Schema<offerType>(
    {
      name: {
        type: String,
        required: true,
        trim: true
      },
      offerValue: {
        type: Number,
        required: true,
        min: 0,
        max: 80
      },
      targetType: {
        type: String,
        enum: ["Category", "Product"],
        required: true
      },
      targetId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "targetType", 
        required: true,
       
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    },
    { 
      timestamps: true 
    }
  );

  offerSchema.index({ endDate: 1 }, { expireAfterSeconds: 0 });

  const Offer = mongoose.model<offerType>('offerSchema',offerSchema)
  
  export default Offer