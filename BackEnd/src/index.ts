import express, { NextFunction, Request, Response } from 'express';
import config from 'config';
import connectDB from './utils/connectDB';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes';
import adminRoutes from "./routes/adminRoutes"
import { v2 as cloudinary } from "cloudinary"


const app = express();
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});  

app.use(
    cors({
      // origin: config.get<string>('origin'),
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
  

  
app.get('/', (req: Request, res: Response) => {
  res.send('Hello TypeScript with Express!');
});


app.use('/api/users',userRoutes)

app.use('/api/admin',adminRoutes)


app.all('*', (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`) as any;
    err.statusCode = 404;
    next(err);
  });
  

  const port = config.get<number>('port');
  app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
    connectDB();
  
  });