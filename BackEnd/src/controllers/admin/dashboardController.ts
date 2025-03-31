import Order from "../../model/orderModel";
import { getPeriodFilter } from "../../utils/service/periodFilters";
import User from "../../model/userModel";
import { Response,Request } from "express";
import { number } from "zod";

export const fetchBestProducts = async(req:Request,res:Response):Promise<void>=>{
 
    const { period = "yearly" } = req.query;   
    const periodFilter = getPeriodFilter(period as string)
   
    try {
        const bestProducts= await Order.aggregate([
            { $match: periodFilter },
            { $unwind: "$items" },
            {
              $group: {
                _id: "$items.productId",
                totalQuantity: { $sum: "$items.quantity" },
                totalRevenue: {
                  $sum: { $multiply: ["$items.quantity", "$items.totalPrice"] },
                },
              },
            },
            {$sort:{
              totalQuantity:-1
            }},
            {$limit:10},
            {$lookup:{
              from:'products',
              localField:'_id',
              foreignField:'_id',
              as:'productDetails'
            }},
            {$unwind:"$productDetails"}
          ]);
          res.status(200).json({success:true,bestProducts})
    } catch (error) {
        console.error("Failed to fetch best products",error);
    
        res.status(500).json({success:false,message:"Failed to fetch best products"})
    }


}

export const fetchBestCategories = async(req:Request,res:Response):Promise<void>=>{
    console.log("fetching categories");

    const { period = "yearly" } = req.query;
    const periodFilter = getPeriodFilter(period as string);
    try {
        const bestCategories = await Order.aggregate([
             {$match:periodFilter},
             {$unwind :"items"},
             {$lookup:{
                from:'products',
                localField:'items.productId',
                foreignField:'_id',
                as:'productDetails'
             }},
             {$unwind:'$productDetails'},
             {$lookup:{
                from:'categories',
                localField:"productDetails.categoryId",
                foreignField:'_id',
                as:"categoryDetails"
            }},
            { $unwind: "$categoryDetails" },
            {$group:{
                _id:'$productDetails.categoryId',
                categoryName: { $first: "$categoryDetails.name" },
                totalQuantity:{$sum:'$items.quantity'},
                totalRevenue:{$sum:{$multiply:['$items.quantity','$items.totalPrice']}},
            
            }},
            {$sort:{totalQuantity:-1}},
            {$limit:10} 

        ])
        console.log("bc",bestCategories);

         res.status(200).json({success:true,bestCategories}); 
    } catch (error) {
        console.error("Failed to fetch best categories",error);
        res.status(500).json({success:false,message:"Failed to fetch best categories"})
    }

}



interface OverviewStats {
    totalRevenue: number;
    totalOrders: number;
    totalProductsSold: number;
    averageOrderValue: number;
    conversionRate: number;
    activeUsers: number;
}
export const getOverviewStats = async(req:Request,res:Response) =>{
    const{period='yearly'}=req.query
    try {
        const periodFilter=getPeriodFilter(period as string)
        const stats: OverviewStats = {
            totalRevenue: 0,
            totalOrders: 0,
            totalProductsSold: 0,
            averageOrderValue: 0,
            conversionRate: 0,
            activeUsers: 0
        };

        const revenueResult=await Order.aggregate([{$match:periodFilter},
            {$group:{
                _id:null,
                totalRevenue:{$sum:"$totalAmount"}
            }}
           ])
           stats.totalRevenue=revenueResult[0]?.totalRevenue||0
           const totalOrders=await Order.countDocuments(periodFilter)
           stats.totalOrders = totalOrders;
           const productsSoldResult = await Order.aggregate([{$match:periodFilter},
            {$unwind:"$items"},
            {$group:{
                _id:null,
                totalProductsSold:{$sum:"$items.quantity"}
            }}
        ])

        
        stats.totalProductsSold = productsSoldResult[0]?.totalProductsSold || 0;
        const activeUsers = await User.countDocuments()
        stats.averageOrderValue=totalOrders==0?0:(revenueResult[0]?.totalRevenue||0)/totalOrders
        stats.conversionRate=(totalOrders/activeUsers)*100
        stats.activeUsers=activeUsers
        
         res.status(200).json({success:true,stats})
         return
        } catch (error:any) {
                console.error("Failed to fetch stats",error);
                res.status(500).json({success:false,message:"Failed to fetch sats"}) 
            }
        }


        export const getRecentOrders = async(req:Request,res:Response):Promise<void>=>{
            try {
                const recentOrders = await Order.find()
                .sort({orderDate:-1})
                .limit(10)
                .select("_id orderNumber userId totalAmount status orderDate items")
                .populate({
                    path:"userId",
                    select:"name email"
                })
                res.status(200).json({
                    success: true,
                    recentOrders,
                  });
            } catch (error:any) {
                console.error("Failed to fetch stats",error);
                res.status(500).json({success:false,message:"Failed to fetch recent orders"}) 
            }
            }
        

export const getRevenue = async(req:Request,res:Response)=>{
    const{period='yearly'}=req.query
    const periodFilter=getPeriodFilter(period as string)
    try {
        const revenueData=await Order.aggregate([{$match:periodFilter},
            {$group:{
                _id:null,
                totalRevenue:{$sum:"$totalAmount"}
            }}
           ])
           
           res.status(200).json({
            success: true,
            revenueData,
          });
    } catch (error) {
        console.error("Failed to fetch revenue data",error);
        res.status(500).json({success:false,message:"Failed to fetch revenue data"}) 
    }
}