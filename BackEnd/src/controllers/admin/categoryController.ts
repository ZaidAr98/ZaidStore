import Category from "../../model/categoryModel";
import { Request, Response } from "express";
import { Types } from 'mongoose';


export const addCategory = async (req: Request, res: Response): Promise<void> => {
    const { name, description } = req.body;
  
    try {
   
      const categoryExist = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });
  
      if (categoryExist) {
        res.status(409).json({ success: false, message: "Category already exists!" });
        return;
      }
  
      
      const newCategory = await Category.create({ name, description });
  
    
      console.log("Category added:", newCategory);
  
     
      res.status(201).json({ success: true, message: "Category added successfully.", data: newCategory });
    } catch (error: any) {
     
      console.error("Error in adding category:", error.message);
  
     
      res.status(error?.status || 500).json({
        success: false,
        message: error.message || "Something went wrong while adding the category.",
      });
    }
  };


export const showCategories = async (req:Request, res:Response):Promise<void> => {
    try {
      const categories = await Category.find({});
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
      console.log("error in fetching categories",error);
      res
        .status(error?.status || 500)
        .json({ message: error.message || "Something went wrong" });
    }
  };


  export const listCategory = async (req:Request, res:Response):Promise<void> => {
    const { categoryId } = req.params;
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
           res
          .status(404)
          .json({ success: false, message: "Category not found" });
          return
      }
      category.isListed = !category.isListed;
  
      await category.save();
      res
        .status(200)
        .json({ success: true, message: "Category status changed.", category });
    } catch (error:any) {
      console.log("error in listing categories",error.message);
      res
        .status(error?.status || 500)
        .json({ message: error.message || "Something went wrong" });
    }
  };



  export const editCategory = async (req:Request, res:Response):Promise<void> => {
    try {
      const { catId } = req.params;
      const data = req.body;
      const { name } = req.body;
     
       
      const categoryExist = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
      });

      const catIdObjectId = new Types.ObjectId(catId);

      if (categoryExist && categoryExist._id.equals(catIdObjectId)) {
         res
          .status(409)
          .json({ success: false, message: "Category already exist!" });
          return
      }
      const updatedData = await Category.findByIdAndUpdate(catId, data, {
        new: true,
      });
      if (updatedData) {
        res
          .status(200)
          .json({ success: true, message: "Category updated", updatedData });
      }
    } catch (error:any) {
      res
        .status(error?.status || 500)
        .json({ message: error.message || "Something went wrong" });
    }
  };


export const showCategory = async(req:Request,res:Response)=>{
    const {catId} = req.params 
    try {
        const category = await Category.findById(catId);
        if (!category) {
           res
            .status(404)
            .json({ success: false, message: "Category not found" });
          return
        }
    
        res
          .status(200)
          .json({ success: true, message: "Fetched category details", category });
    } catch (error:any) {
        res
        .status(error?.status || 500)
        .json({ message: error.message || "Something went wrong" });
    }
}