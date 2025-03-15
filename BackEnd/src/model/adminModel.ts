import mongoose from 'mongoose';
import { CreateAdminInput} from '../schemas/user.schema';

 

const adminSchema = new mongoose.Schema<CreateAdminInput>({
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
    type:String,
    required:true,
    default:"admin"
 },

  phone: {
    type: String,
    required: true,
    trim: true,
    minLength: 10,
    maxLength: 15,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
   
  },
});

const Admin = mongoose.model<CreateAdminInput>('Admin', adminSchema);

export default Admin;