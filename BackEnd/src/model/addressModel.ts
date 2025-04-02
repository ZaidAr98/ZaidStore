import mongoose from 'mongoose';

interface AddressType {
  user: mongoose.Types.ObjectId;
  fullname: string;
  phone: string;
  email: string;
  addressLine: string;
  city: string;
  state: string;
  landmark?: string; 
  pincode: string;
  addressType: 'Home' | 'Work';
  isListed?: boolean; // Optional field with default
  isDefault?: boolean; // Optional field with default
  createdAt?: Date; // Added by timestamps
  updatedAt?: Date; // Added by timestamps
}

const addressSchema = new mongoose.Schema<AddressType>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    trim: true
  },
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{10}$/
  },
  email: {
    type: String,
    required: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  addressLine: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    match: /^[0-9]{6}$/,
    trim: true
  },
  addressType: {
    type: String,
    enum: ['Home', 'Work'],
    required: true
  },
  isListed: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

addressSchema.pre('save', async function (next) {
  // if address being saved is set as default
  if (this.isDefault) {
    const Address = mongoose.model<AddressType>("Address", addressSchema);
    // find other address by the same user marked as default
    await Address.updateMany(
      { user: this.user, isDefault: true, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const Address = mongoose.model<AddressType>('Address', addressSchema);

export default Address;