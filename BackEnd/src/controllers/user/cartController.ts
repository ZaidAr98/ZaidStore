import { Types } from "mongoose";
import Cart, { ICart, ICartItem } from "../../model/cartModel";
import Product from "../../model/productModel";
import { checkStock } from "../../utils/service/checkstock";
import { recalculateCartTotals } from "../../utils/service/recalculateCartTotals";
import { Request, Response } from "express";
import { ProductSize, ProductType } from "../../types/ProductType";
import { fetchLatestPrice } from "../../utils/service/fetchLatestPrice";

export interface IPopulatedCartItem extends Omit<ICartItem, "productId"> {
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
    const cartExist = await Cart.findOne({ userId }).populate<{
      items: IPopulatedCartItem[];
    }>({
      path: "items.productId",
      model: "Product",
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
    const productExist = (cartExist.items as IPopulatedCartItem[]).find(
      (item) =>
        item.productId._id.toString() === productId.toString() &&
        item.size === size &&
        item.productId.isListed
    );

    if (productExist) {
      if (productExist.quantity >= productExist.maxQtyPerUser) {
        res.status(400).json({
          success: false,
          message: "Stock limit exceeded.",
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
          message: "Product not available",
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
      message: error.message,
    });
  }
};

export const showCart = async (req: Request, res: Response) => {
  const userId = req.params;
  try {
    const cart = await Cart.findOne(userId).populate({
      path: "items.productId",
      populate: { path: "offerId" },
    });
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    //filtering only necessary items to disply total amount
    cart.items = cart.items.reduce((acc, item) => {
      //skip if product is not listed
      if (!item?.productId?.isListed) return acc;
      //check stock and mark item status
      item.inStock = checkStock(item);
      item.latestPrice = fetchLatestPrice(item);
      item.discount = item.productId.discount;
      acc.push(item);
      return acc;
    }, [] as ICartItem[]);
    await cart.save();

    const frontendCart = JSON.parse(JSON.stringify(cart));
    //recalculate totals with offer discount
    const finalFrontendCart = recalculateCartTotals(frontendCart);

    return res
      .status(200)
      .json({
        success: true,
        message: "Cart updated with oferdiscount",
        cart: finalFrontendCart,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
    console.log("error fetching cart", error.message);
  }
};

export const updateCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, itemId } = req.params;
  const newQty = req.body.quantity;

  try {
    if (!userId || !itemId || !newQty || newQty < 1) {
      res.status(400).json({ success: false, message: "Invalid inputs" });
      return;
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      populate: { path: "offerId" },
    });
    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }
    const item = cart.items.find(
      (item: ICartItem) => item._id.toString() == itemId
    );
    if (!item) {
      res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
      return;
    }

    if (!item.productId.isListed) {
      res.status(404).json({ message: "Product is currently unavailable" });
      return;
    }

    const selectedSize = item.productId.sizes.find(
      (size: ProductSize) => size.size === item.size
    );
    if (!selectedSize) {
      res
        .status(404)
        .json({ success: false, message: "Selected size not found" });
      return;
    }

    if (newQty > selectedSize.stock && newQty > item.maxQtyPerUser) {
      res.status(400).json({ success: false, message: "Stock limit exceeded" });
      return;
    }

    item.quantity = newQty;
    item.latestPrice = selectedSize.price;
    if (selectedSize.stock === 0) {
      item.inStock = false;
    } else {
      item.inStock = true;
    }

    await cart.save();
    let newCart = cart.toObject();
    //recalculating amount with new values
    const frontendCart = recalculateCartTotals(newCart);

    res
      .status(200)
      .json({ success: true, message: "Quantity updated", cart: frontendCart });
  } catch (error: any) {
    console.log("error in cart updation", error);

    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


export const removeItem = async(req:Request,res:Response):Promise<void> =>{
  const { userId, itemId } = req.params;
  try {
    if (!userId || !itemId) {
      res.status(400).json({ message: "Invalid input parameters" });
      return
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
       res
        .status(404)
        .json({ success: false, message: "cart not found" });
       return
      }

      const updatedCart = await Cart.findOneAndUpdate(
        { userId },
        { $pull: { items: { _id: itemId } } },
        { new: true }
      ).populate({path:"items.productId",populate:{path:'offerId'}});
     
      await updatedCart?.save();
  
      console.log(updatedCart);
    
    let newCart = updatedCart?.toObject() as ICart;
     const frontendCart=recalculateCartTotals(newCart);
     res
     .status(200)
     .json({ success: true, message: "Cart item removed", cart: frontendCart });
  


    } catch (error:any) {
      console.log("error removing item", error);
      res.status(500).json({ success: false, message: "Internal server error" });
  }
}


export const checkProduct = async(req:Request,res:Response)=>{
  const {userId} = req.params
  const { productId, size } = req.query;
  console.log("checking product");

  try {
    if (!userId || !productId || !size) {
      return res.status(400).json({ message: "Invalid inputs" });
    }
    const cart = await Cart.findOne({
      userId,
      "items.productId": productId,
      "items.size": size,
    });
    if (!cart) {
      return res.json({ message: "Product not in cart", inCart: false });
    }
    console.log("product is in cart");

    res.json({ message: "Product in cart", inCart: true });
  } catch (error:any) {
    console.log("error checking", error.message);
  }

}


export const checkItemStock = async(req:Request,res:Response)=>{
  try {
    let inStock=true
    const { userId } = req.params;
const cart= await Cart.findOne({userId}).populate('items.productId') as ICart
const allStockOut=cart.items.every((item)=>item.productId.sizes.find((s: ProductSize) =>s.stock==0 && s.size==item.size))

console.log("all stockk",allStockOut);

if(allStockOut){
  
  return res.status(200).json({inStock:false})
}
for(let item of cart.items){
  const selectedSize=item.productId.sizes.find((size: ProductSize)=>size.size==item.size )
  if(item.quantity>selectedSize.stock && selectedSize.stock!=0){
    console.log(`stcok limit of ${item.productId.name} exceeded, ${selectedSize.stock}`);
    
      inStock=false;
      break;
  }
}
console.log("instock",inStock);

res.status(200).json({success:false,message:"Stock limit exceeded",inStock})
  } catch (error) {
    console.log("failed to check stock",error);
    res.status(500).json({message:"failed to check stock"})
  }
}