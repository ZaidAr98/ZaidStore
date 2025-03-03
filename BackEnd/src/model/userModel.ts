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
  role:{
    type: String
},
  phone: {
    type: String,
    required: true,
    trim: true,
    minLength: 10,
    maxLength: 15,
  },
//   verified:{
//     type : Boolean,
//     required: true,
//     default:false
// },
  password: {
    type: String,
    required: true,
    minLength: 6,
   
  },
});

const User = mongoose.model<CreateUserInput>('User', userSchema);

export default User;