import { Types } from "mongoose";
import Cart, { ICart, ICartItem } from "../../model/cartModel";
import Product from "../../model/productModel";
import { checkStock } from "../../utils/service/checkstock";
import  {recalculateCartTotals} from "../../utils/service/recalculateCartTotals"
import { Request,Response } from "express";
import { ProductType } from "../../types/ProductType";
import { fetchLatestPrice } from "../../utils/service/fetchLatestPrice";

export interface IPopulatedCartItem extends Omit<ICartItem, 'productId'> {
    productId: ProductType;
  }

  export const addToCart = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { productId, size } = req.body;
  
    try {
      const product = req.body;
      
      if (!userId) {
        res.status(400).json({ error: "Invalid user id" });
        return;
      }
  
      // Find cart and populate product details
      const cartExist = await Cart.findOne({ userId })
      .populate<{ items: IPopulatedCartItem[] }>({
        path: 'items.productId',
        model: 'Product'
      });  
      if (!cartExist) {
        const cart = await Cart.create({
          userId,
          items: product,
        });
        res.status(200).json({
          success: true,
          message: "Product added to new cart",
          cart,
          isAdded: true,
        });
        return;
      }
  
      // Find if product exists in cart (using type assertion)
      const productExist = (cartExist.items as IPopulatedCartItem[])
        .find(item => 
            item.productId._id.toString() === productId.toString() && 
          item.size === size &&
          item.productId.isListed
        );
  
      if (productExist) {
        if (productExist.quantity >= productExist.maxQtyPerUser) {
          res.status(400).json({ 
            success: false, 
            message: "Stock limit exceeded." 
          });
          return;
        }
        productExist.quantity += 1;
      } else {
        // Verify product exists and is listed before adding
        const productToAdd = await Product.findById(productId);
        if (!productToAdd || !productToAdd.isListed) {
          res.status(400).json({ 
            success: false, 
            message: "Product not available" 
          });
          return;
        }
        cartExist.items.push(product);
      }
  
      await cartExist.save();
      res.status(200).json({
        success: true,
        message: "Product added to cart",
        isAdded: true,
      });
  
    } catch (error: any) {
      console.error("Error in adding product to cart", error);
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  
}






export const showCart = async(req:Request,res:Response)=>{
  const userId = req.params;
  try {
    const cart = await Cart.findOne(userId).populate({
      path: "items.productId",
      populate: { path: "offerId" },
    })
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

   
    //filtering only necessary items to disply total amount
    cart.items=cart.items.reduce((acc,item)=>{
      //skip if product is not listed
      if(!item?.productId?.isListed) return acc
      //check stock and mark item status
      item.inStock=checkStock(item);
      item.latestPrice=fetchLatestPrice(item)
      item.discount=item.productId.discount
      acc.push(item)
      return acc
    },[]as ICartItem[])
    await cart.save()
   
    const frontendCart = JSON.parse(JSON.stringify(cart));
      //recalculate totals with offer discount
     const finalFrontendCart= recalculateCartTotals(frontendCart)
     
      return res.status(200).json({success:true, message:'Cart updated with oferdiscount',cart:finalFrontendCart})
    }
  
   catch (error:any) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
    console.log("error fetching cart", error.message);
  }

}



