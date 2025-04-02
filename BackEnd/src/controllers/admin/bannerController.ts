import { Request, Response } from "express";
import uploadImages, { cloudinaryDeleteImages } from "../../utils/cloudinary/cloudinaryUpload";
import Banner from "../../model/bannerModel"




export const fetchBanners=async(req:Request,res:Response): Promise<void>=>{
    try {
       const banners= await Banner.find()
       res.status(200).json({success:true,message:"Banners fetched",banners})
    } catch (error) {
        console.log("failed to fetch banners");
        res.status(500).json({success:false,message:"Banners not fetched"})
    }
}


export const addBanner = async (req: Request, res: Response): Promise<void> => {
    try {
      const imageFiles = req.files as Express.Multer.File[];
      const {title,content,isActive} =req.body
  
      console.log("Request Body:", req.body);
      console.log("Uploaded Files:", imageFiles);
  
     
  
      const imageUrls = await uploadImages(imageFiles);
  
      const newbanner = new Banner({
        title:title,
        content:content,
        isActive:isActive,
        images: imageUrls,
      });
  
      await newbanner.save();
  
      res.status(201).json({ message: "banner added successfully", banner: newbanner });
    } catch (error: any) {
      console.error("Error adding banner:", error.message);
      res.status(500).json({ message: "Something went wrong while adding the banner." });
    }
  };



  export const deleteBanner=async(req:Request,res:Response): Promise<void>=>{
    try {
        const {bannerId}=req.params
        if(!bannerId){
             res.status(400).json({success:false,message:"Please provide a valid request"})
             return
            }
       const banner= await Banner.findById(bannerId)
       if(!banner){
         res.status(404).json({message:"banner not found"})
         return
        }
       banner.isActive=!banner.isActive
       await banner.save()
       res.status(200).json({message:"Banner status changed"})
    } catch (error) {
        console.error("Failed to update status ofbanner",error);
        res.status(500).json({success:false,message:"banner status not changed"})
    }
}



export const editBanner= async (req: Request, res: Response) : Promise<void>  => {
    const { _id } = req.params;
    const { title, updatedUrls, deletedImages } = req.body;
  
    console.log("banneris editing...");
  
    if (!req.files || !Array.isArray(req.files)) {
       res.status(400).json({ message: "No files uploaded or files are not in the correct format" });
       return
      }
  
    const files = req.files as Express.Multer.File[];
    const updatedbanner= req.body;
  
    try {
      const productExist = await Banner.findOne({ _id });
      if (!productExist) {
       res.status(404).json({ error: "bannernot found" });
       return
      }
  
      const productWithSameName = await Banner.findOne({ _id: { $ne: _id }, name: name });
      if (productWithSameName) {
         res.status(400).json({ message: "bannerwith the same name already exists." });
         return
        }
  
      // Delete previous images
      if (deletedImages && deletedImages.length > 0) {
        try {
          const deleteResults = await cloudinaryDeleteImages(deletedImages);
          console.log("Deleted images:", deleteResults);
        } catch (error) {
          console.error("Error deleting images:", error);
        }
      }
  
      // Upload new images
      let imageUrls: string[] = [];
      if (files.length > 0) {
        try {
          imageUrls = await uploadImages(files);
        } catch (error) {
          console.error("Error uploading images:", error);
           res.status(500).json({ message: "Error uploading images." });
           return
          }
      }
  
      // Update bannerwith new images and other fields
      updatedbanner.images = [...(updatedUrls || []), ...imageUrls];
      Object.assign(productExist, updatedbanner);
  
      const editedbanner= await productExist.save();
       res.status(200).json({ message: "banneredited successfully", product: editedbanner});
       
        
    } catch (error: any) {
      console.error("Error editing product:", error.message);
       res.status(500).json({
        message: "Something went wrong while editing the product.",
        error: error.message,
      });
    }
  };
  