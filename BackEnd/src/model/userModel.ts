import mongoose from 'mongoose';
import { CreateUserInput } from '../schemas/user.schema';

 
export interface UserDocument extends CreateUserInput, mongoose.Document {
  referralCode: string;
  referredBy?: string;
  referralRewards: number;
  totalReferrals: number;
  isReferralRewarded: boolean;
  isBlocked: boolean;
  created_at: Date;
}

const userSchema = new mongoose.Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true, 
  },

  phone: {
    type: String,
    required: false,
    trim: true,
    minLength: 10,
    maxLength: 15,
  },
  password: {
    type: String,
    required: false,
    minLength: 6,
   
  },
  referralCode:{type:String,unique:true},
  referredBy:{type:String},//code
  referralRewards:{type:Number,default:0},
  totalReferrals:{type:Number,default:0},
  isReferralRewarded:{type:Boolean,default:false},
  isBlocked:{
       type:Boolean,
       default:false
  },
  created_at:{
      type:Date,
      default: Date.now
  }
});

const User = mongoose.model<UserDocument>('User', userSchema);

export default User;