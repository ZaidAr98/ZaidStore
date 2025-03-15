import Product from "../../model/ProductModel";
import productSchema from "../../schemas/productSchema";
import { cloudinaryImageUploadMethod} from "../../utils/cloudinary/cloudinaryUpload";
import {cloudinaryDeleteImages} from "../../utils/cloudinary/deleteImages"
 import {  Request, Response } from "express";


interface ProductRequestBody {
    name: string;
    description: string;
    company: string;
    price: number;
    categoryId:string,
    sizes: string[];
    laptopType: string;
    discount?: number; // Optional field
  }

export const addProduct = async (req:Request, res:Response):Promise<void> =>{

    const {name,description,company,categoryId,sizes,laptopType,price,discount}:ProductRequestBody = req.body
    console.log(req.body)
  
    
    try {
        const productExist = await Product.findOne({name:name})
        if(productExist){
             res.status(400).json({message:"Product already exist"})
             return
         }

         if (!req.files || !Array.isArray(req.files)) {
            res.status(400).json({ message: "No files uploaded or files are not in the correct format" });
            return;
        }

          const files = req.files 
          const imageUrls = []

          for(const file of files){
            const imageUrl = await cloudinaryImageUploadMethod(file.buffer)
            imageUrls.push(imageUrl); 
        }


        const newProduct = new Product({
            name,
            description,
            company,
            laptopType,
            categoryId,
            price,
            discount,
            sizes: sizes,
            images: imageUrls,
          
          });
          await newProduct.save();

          res
          .status(201)
          .json({ message: "Product added successfully", product: newProduct });

    } catch (error:any) {
        console.error("Error adding product:", error.message); // Log error for debugging
        res
          .status(500)
          .json({ message: "Something went wrong while adding the product." });
    }


}



interface ProductQueryParams {
  categoryIds?: string;
  laptopType?: string;
  minPrice?: string;
  maxPrice?: string;
  searchTerm?: string;
  sort?: string;
}

interface ProductFilters {
  categoryId?: { $in: string[] };
  laptopType?: { $in: string[] };
  price?: { $gte?: number; $lte?: number };
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
}

type SortOrder = 1 | -1;

interface SortOption {
  [key: string]: SortOrder;
}


export const showProducts = async (req: Request<{}, {}, {}, ProductQueryParams>, res: Response): Promise<void> => {
  try {
    const { categoryIds, laptopType, minPrice, maxPrice, searchTerm, sort } = req.query;
    console.log(req.query);

    const filters: ProductFilters = {};

    if (categoryIds) {
      const categoryArray = categoryIds.split(',');
      filters.categoryId = { $in: categoryArray };
    }

    if (laptopType) {
      const laptopTypeArray = laptopType.split(',');
      filters.laptopType = { $in: laptopTypeArray };
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    if (searchTerm) {
      filters.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { 'categoryId.name': { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const sortOption: SortOption = {};
    if (sort === 'priceHighLow') {
      sortOption.price = -1; // Descending order
    } else if (sort === 'priceLowHigh') {
      sortOption.price = 1; // Ascending order
    }

    const products = await Product.find(filters)
      .sort(sortOption)
      .populate('categoryId', 'name');

    res.status(200).json({ success: true, message: 'Products fetched', products });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Data fetching failed.' });
    console.log('Error in fetching:', error.message);
  }
};


export const listProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return; 
    }

 
    product.isListed = !product.isListed;

    
    await product.save();

    console.log("Product listing status updated");

   
    res.status(200).json({ success: true, message: "Product status changed", product });
   

  } catch (error: any) {
    console.error("Error in updating status:", error);

   
    res.status(error?.status || 500).json({
      success: false,
      message: error?.message || "Something went wrong",
    });
  }
};



export const showProduct = async (req:Request, res:Response) => {
  const { _id } = req.params;
  try {
    const product = await Product.findById(_id).populate("categoryId", "name");
    res
      .status(200)
      .json({ success: true, message: "Product details fetched", product });
  } catch (error:any) {
    console.log("error in edit product");
    res
      .status(error.status)
      .json({ message: "fetching failed for editing", error });
  }
};





export const editProduct = async(req:Request,res:Response)=>{
  const {_id} = req.body = req.body
  const { name, categoryId, updatedUrls,deletedImages } = req.body;


  console.log("product is editing..")

  if (!req.files || !Array.isArray(req.files)) {
    res.status(400).json({ message: "No files uploaded or files are not in the correct format" });
    return;
}

  const files = req.files;
  const updatedProduct = req.body;

  

  try {
    const productExist = await Product.findOne({ _id });
    if (!productExist) {
      res.status(404).json({ error: "Product not found" });
      return
    }
    console.log("exist", productExist);

    const productWithSameName= await Product.findOne({_id:{$ne:_id},name:name})
    if(productWithSameName){
       res.status(400).json({message:"Product with same name already exist."})
       return
      }
    //delete previous images
    if(deletedImages){
      try {
        const deleteResults =await cloudinaryDeleteImages(deletedImages)
        console.log("del", deleteResults);
        
      } catch (error) {
        console.log("Images err deleted",error);
      }
    }

    const imageUrls = [];
    for (const file of files) {
      try {
        const imageUrl = await cloudinaryImageUploadMethod(file.buffer);
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    updatedProduct.images =[...(updatedUrls||[]),...imageUrls]

    Object.assign(productExist, updatedProduct);

    const editedProduct = await productExist.save()
    res
      .status(200)
      .json({ mesaage: "Product edited successfully", product: editedProduct });

  } catch (error:any) {
    console.error("Error adding product:", error.message); // Log error for debugging
    res.status(500).json({
      message: "Something went wrong while adding the product.",
      error: error.mesaage,
    });
  }

 }

