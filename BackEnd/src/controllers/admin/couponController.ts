import { any } from "zod";
import { Coupon} from "../../model/couponModel";
import { Response,Request } from "express";

export const createCoupon = async(req:Request,res:Response):Promise<void>=>{


    const {code,description,discountType,discountValue,discountPercentage,
        minPurchaseOrder,maxDiscountAmount,usageLimit,expiryDate,maxUsagePerUser}=req.body;

        try {
            if(!code|| !discountType ||!usageLimit||!expiryDate){
                res.status(400).json({success:false,message:"please provide required fields."})
                return
            }   

            const coupon=await Coupon.findOne({code:code,isActive:true});
            if(coupon){
              res.status(404).json({success:false,message:"Coupon code already exist."})
              return 
            }
            const newCoupon =new Coupon({
                code,
                description,
                discountType,
                minPurchaseOrder,
               usageLimit,
               expiryDate,
               maxUsagePerUser
              })

              if(discountType=='percentage'){
                newCoupon.discountPercentage=discountPercentage
                newCoupon.maxDiscountAmount=maxDiscountAmount
              }else{
                newCoupon.discountValue=discountValue
              }
              await newCoupon.save()
                 res
                  .status(201)
                  .json({ success: true, message: "Coupon created." });
                } catch (error:any) {
                    console.error("error creating coupon",error.message);
                    res.status(500).json({success:false,message:"Coupon not added.Please try again."})
                }

    }


export const showCoupons = async(req:Request,res:Response):Promise<void>=>{
    console.log("fetching coupons");
    try {
    const coupons=  await Coupon.find({}).sort({createdAt:-1}) 
    if(!coupons){
        console.log('coupons',coupons);
        
        res.status(404).json({success:false,message:"Coupon not found"})
        return
    } 
    res.status(200).json({success:true,message:"Coupon fetched ",coupons})
    } catch (error:any) {
        console.error("error fetching coupon",error.message);
        res.status(500).json({success:false,message:"Failed to fetch coupons"})
    }
}


export const changeCouponStatus=async(req:Request,res:Response):Promise<void>=>{
    const {couponId}=req.params
    if(!couponId){
        res.status(400).json({success:false,message:"Coupon status changed"})
        return
    }
    try {
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
          res.status(404).json({ success: false, message: "Coupon not found" });
          return
        }
    
        coupon.isActive = !coupon.isActive; // Toggle the status
        await coupon.save();
    
        res.status(200).json({ success: true, message: "Coupon status changed", coupon });
  
    } catch (error) {
        res.status(200).json({success:false,message:"failed to change status"})
    }
}