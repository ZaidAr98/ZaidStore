import Product from "../../model/ProductModel";
import { Request, Response } from "express";
import { ProductType } from "../../types/ProductType";
import uploadImages, { cloudinaryDeleteImages } from "../../utils/cloudinary/cloudinaryUpload";

export const addProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const imageFiles = req.files as Express.Multer.File[];
    const { name, description, company, categoryId, sizes, laptopType, price } = req.body;

    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", imageFiles);

    if (!name || !price || !categoryId || !imageFiles?.length) {
      res.status(400).json({ message: "Missing required fields or images." });
      return;
    }

    const imageUrls = await uploadImages(imageFiles);

    const newProduct = new Product({
      name,
      description,
      company,
      laptopType,
      categoryId,
      price,
      sizes: JSON.parse(sizes), // Parse sizes if sent as a JSON string
      images: imageUrls,
    });

    await newProduct.save();

    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error: any) {
    console.error("Error adding product:", error.message);
    res.status(500).json({ message: "Something went wrong while adding the product." });
  }
};

// interface ProductQueryParams {
//   categoryIds?: string;
//   laptopType?: string;
//   minPrice?: string;
//   maxPrice?: string;
//   searchTerm?: string;
//   sort?: string;
// }

// interface ProductFilters {
//   categoryId?: { $in: string[] };
//   laptopType?: { $in: string[] };
//   price?: { $gte?: number; $lte?: number };
//   $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
// }

// type SortOrder = 1 | -1;

// interface SortOption {
//   [key: string]: SortOrder;
// }

// export const showProducts = async (req: Request<{}, {}, {}, ProductQueryParams>, res: Response): Promise<void> => {
//   try {
//     const { categoryIds, laptopType, minPrice, maxPrice, searchTerm, sort } = req.query;
//     console.log(req.query);

//     const filters: ProductFilters = {};

//     if (categoryIds) {
//       const categoryArray = categoryIds.split(',');
//       filters.categoryId = { $in: categoryArray };
//     }

//     if (laptopType) {
//       const laptopTypeArray = laptopType.split(',');
//       filters.laptopType = { $in: laptopTypeArray };
//     }

//     if (minPrice || maxPrice) {
//       filters.price = {};
//       if (minPrice) filters.price.$gte = parseFloat(minPrice);
//       if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
//     }

//     if (searchTerm) {
//       filters.$or = [
//         { name: { $regex: searchTerm, $options: 'i' } },
//         { 'categoryId.name': { $regex: searchTerm, $options: 'i' } },
//       ];
//     }

//     const sortOption: SortOption = {};
//     if (sort === 'priceHighLow') {
//       sortOption.price = -1; // Descending order
//     } else if (sort === 'priceLowHigh') {
//       sortOption.price = 1; // Ascending order
//     }

//     const products = await Product.find(filters)
//       .sort(sortOption)
//       .populate('categoryId', 'name');

//     res.status(200).json({ success: true, message: 'Products fetched', products });
//   } catch (error: any) {
//     res.status(400).json({ success: false, message: 'Data fetching failed.' });
//     console.log('Error in fetching:', error.message);
//   }
// };

// export const listProduct = async (req: Request, res: Response): Promise<void> => {
//   const { id } = req.params;

//   try {
//     const product = await Product.findById(id);

//     if (!product) {
//       res.status(404).json({ success: false, message: "Product not found" });
//       return;
//     }

//     product.isListed = !product.isListed;

//     await product.save();

//     console.log("Product listing status updated");

//     res.status(200).json({ success: true, message: "Product status changed", product });

//   } catch (error: any) {
//     console.error("Error in updating status:", error);

//     res.status(error?.status || 500).json({
//       success: false,
//       message: error?.message || "Something went wrong",
//     });
//   }
// };

export const showProduct = async (req:Request, res:Response): Promise<void>  => {
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

export const editProduct = async (req: Request, res: Response) : Promise<void>  => {
  const { _id } = req.params;
  const { name, categoryId, updatedUrls, deletedImages } = req.body;

  console.log("Product is editing...");

  if (!req.files || !Array.isArray(req.files)) {
     res.status(400).json({ message: "No files uploaded or files are not in the correct format" });
     return
    }

  const files = req.files as Express.Multer.File[];
  const updatedProduct = req.body;

  try {
    const productExist = await Product.findOne({ _id });
    if (!productExist) {
     res.status(404).json({ error: "Product not found" });
     return
    }

    const productWithSameName = await Product.findOne({ _id: { $ne: _id }, name: name });
    if (productWithSameName) {
       res.status(400).json({ message: "Product with the same name already exists." });
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

    // Update product with new images and other fields
    updatedProduct.images = [...(updatedUrls || []), ...imageUrls];
    Object.assign(productExist, updatedProduct);

    const editedProduct = await productExist.save();
     res.status(200).json({ message: "Product edited successfully", product: editedProduct });
     
      
  } catch (error: any) {
    console.error("Error editing product:", error.message);
     res.status(500).json({
      message: "Something went wrong while editing the product.",
      error: error.message,
    });
  }
};
