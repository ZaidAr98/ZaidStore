import Product from "../../model/productModel";
import Offer from "../../model/offerModel";
import Category from "../../model/categoryModel";
import { Request, response, Response } from "express";
import { offerType } from "../../model/offerModel";
import { ProductType } from "../../types/ProductType";
import { listCategory } from "./categoryController";

interface ProductQuery {
    search?: string;
  }
  
  interface ProductFilter {
    isListed: boolean;
    name?: {
      $regex: string;
      $options: string;
    };
  }
  
  interface ProductResult {
    _id: string;
    name: string;
  }



////////////////////////////////////////////////////////////






export const fetchProducts = async (req: Request<{}, {}, {}, ProductQuery>, res: Response): Promise<void> => {

    const {search} = req.query
    console.log(search);

    if (!search) {
         res
          .status(400)
          .json({ success: false, message: "Please enter the product name." });
       return
        }

        const filter:ProductFilter = { isListed: true };
        try {
            if (search) {
              filter.name = { $regex: search, $options: "i" };
            }
            const products: ProductResult[] = await Product.find(filter).select("_id name");
            res.status(200).json({ message: "products fetched", products });
          } catch (error) {
            console.log("failed to fetch products", error);
        
            res.status(500).json({ message: "failed to fetch products" });
          }

}


export const createProductoffer = async (req: Request, res: Response): Promise<void> => {
    const { targetId, name, offerValue, startDate, endDate } = req.body;
  
    try {
      // Check if offer with same name exists
      const existingOffer = await Offer.findOne({ name });
      if (existingOffer) {
        res.status(400).json({ success: false, message: "Offer already exists." });
        return;
      }
  
      // Create new offer
      const newOffer = new Offer({
        name,
        offerValue,
        targetType: "Product",
        targetId,
        startDate,
        endDate,
      });
  
      // Find the target product with populated offer
      const product = await Product.findById(targetId).populate<{ offerId: offerType }>("offerId");
      
      if (!product) {
        res.status(404).json({ success: false, message: "Product not found" });
        return;
      }
  
      // Type guard to check if offerId is populated
   
  
      const offer = await newOffer.save();
      let responseMessage = "";
  
      // Compare with existing offers
      if (!product.offerId || offerValue > product.offerId.offerValue) {
        (product as any).offerId = offer._id;
        await product.save();
        responseMessage = "New offer created and applied as it provides better value";
      } else {
        responseMessage = "New offer created but existing offer remains as it provides better value";
      }
  
      res.status(201).json({
        message: "Product offer created successfully",
        newOffer,
        responseMessage,
      });
  
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ 
        error: "Error creating product offer", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };



export const createCategoryoffer = async(req:Request,res:Response):Promise<void>=>{
 console.log("creating category")
 const { targetId, name, offerValue, startDate, endDate } = req.body;
 try {
    const existingOffer = await Offer.findOne({ name });
    if (existingOffer) {
         res
        .status(404)
        .json({ success: false, message: "Offer already exist." });
        return
     }
     const products = await Product.find({ categoryId: targetId }).populate<{ offerId: offerType }>("offerId");
     if(products?.length===0){
         res.status(400).json({message:'No products found in this category'})
         return
        }
        const newOffer = new Offer({
            name,
            offerValue,
            targetType: "Category",
            targetId,
            startDate,
            endDate,
          });
          
          const offer = await newOffer.save();
          await Promise.all(
            products.map(async(product)=>{
              if(!product.offerId ||offerValue>product.offerId.offerValue){
                (product as any).offerId=offer._id
                await product.save()
              }
            })
          )
       
          res
            .status(201)
            .json({ message: "Product offer created successfully", offer});
 } catch (error) {
    console.log(error, "error creating cat offer");
    res.status(500).json({ message: "Category offer not created ", error });
 }
}


export const fetchOffers = async(req:Request,res:Response):Promise<void>=>{
    try {
        const [productOffers, categoryOffers] = await Promise.all([
            Offer.find({ targetType: "Product" }).populate("targetId"),
            Offer.find({ targetType: "Category" }).populate("targetId"),
          ]);

          if (!productOffers && !categoryOffers) {
            res.status(404).json({ message: "failed to fetch offers" });
            return  
        
        }
          res
          .status(200)
          .json({
            success: true,
            message: "Offers fetched",
            productOffers,
            categoryOffers,
          });

    } catch (error) {
        console.log("Error fetching offers", error);
        res.status(500).json({ message: "Failed to fetch offers" });
    }
}



export const  listCategories  = async (req:Request,res:Response):Promise<void>=>{
    try {
        console.log("fetching categories");

        const categories = await Category.find({ isListed: true });
         res
          .status(200)
          .json({ success: true, message: "Categores fetched", categories });
         return
        } catch (error) {
        console.log("error fetching categories", error);

    res.status(500).json({ success: false, message: "categories not fetched" });
    }
}