import Banner from "../../model/bannerModel";
import { Request,Response } from "express";

export const fetchBanners = async(req:Request,res:Response)=>{
    try {
        const banners=  await Banner.find({isActive:true}).limit(4)
        res.status(200).json({success:true,message:"Banners fetched",banners})
    } catch (error) {
        console.log("error fetching banners",error);
        res.status(500).json({success:false,message:"Failed to fetch banners"})
    }
}