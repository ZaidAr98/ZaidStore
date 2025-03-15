import mongoose from 'mongoose';
import { CreateUserInput } from '../schemas/user.schema';

 

const userSchema = new mongoose.Schema<CreateUserInput>({
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
});

const User = mongoose.model<CreateUserInput>('User', userSchema);

export default User;