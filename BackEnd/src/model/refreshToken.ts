import mongoose, { Types } from 'mongoose';


export interface RefreshTokenType extends Document {
    user: Types.ObjectId; 
    token: string; 
    role?: string; 
    expiresAt: Date; 
    createdAt: Date; 
}
const refreshTokenSchema = new mongoose.Schema<RefreshTokenType>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    role:{
        type: String
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

const RefreshToken = mongoose.model<RefreshTokenType>('RefreshToken', refreshTokenSchema);

export default RefreshToken;