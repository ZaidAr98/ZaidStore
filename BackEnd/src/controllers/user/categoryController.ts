import Category from "../../model/categoryModel";
import { Request,Response } from "express";

export const showCategories = async(req:Request,res:Response):Promise<void>=>{
    try {
        const categories = await Category.find({isListed:true});
        if (!categories) {
            res
            .status(404)
            .json({ success: false, message: "No categories available." });
          return
        }
      
        
        res
          .status(200)
          .json({ success: true, message: "Categories fetched.", categories });
      } catch (error:any) {
        console.log("error in fetching categories");
        res
          .status(error?.status || 500)
          .json({ message: error.message || "Something went wrong" });
      }
}