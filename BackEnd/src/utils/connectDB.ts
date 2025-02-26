import mongoose from 'mongoose';

require('dotenv').config();


const dbUrl:string = process.env.MONGODB_URL as string;


const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log('Database connected...');
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
