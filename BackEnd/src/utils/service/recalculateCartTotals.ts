import { ICart, ICartItem } from "../../model/cartModel";
import { calculateDiscountPrice } from "./calculateDiscountPrice";

interface Offer {
    expiryDate:Date|string;
    
    offerValue: number;
}


interface Product {
    offerId?: Offer;
    discount: number;
  }
  
interface ItemType{
    quantity?: number;
    latestPrice?: number;
    discount?: number;
    productId?: Product;
    inStock?:boolean;
    platformFee?: number;
}

interface CartTotals {
    totalItems: number;
    totalMRP: number;
    totalDiscount: number;
    payableAmoun?: number;
    deliveryCharge:number
}



const isOfferValid = (offer:Offer):boolean=>{
return offer && new Date() < new Date(offer.expiryDate);
}


export const calculateItemTotal = (item: ICartItem): { mrp: number; discount: number } => {
    const quantity = item.quantity ?? 0;
    const price = item.latestPrice ?? 0;
    const platformFee = item.platformFee ?? 0;

    const discount = (item.productId?.offerId && isOfferValid(item.productId.offerId))
        ? calculateDiscountPrice(item.productId)
        : (item.discount ?? 0);

    const effectiveDiscount = Math.min(discount, 100);
    
    return {
        mrp: price * quantity,
        discount: (effectiveDiscount * price * quantity) / 100,
    };
};

const roundToTwo = (num:number):number => Number((Math.round(num * 100) / 100).toFixed(2));



export const recalculateCartTotals = (cart:ICart) => {
    const totals = cart.items
      .filter((item) => item.inStock === true)
      .reduce(
        (acc, item) => {
          const itemTotals = calculateItemTotal(item);
          return {
            totalItems: acc.totalItems + 1,
            totalMRP: acc.totalMRP + itemTotals.mrp,
            totalDiscount: acc.totalDiscount + itemTotals.discount,
            
          };
        },
        { totalItems: 0, totalMRP: 0, totalDiscount: 0 }
      );
  
      const calculateDeliveryCharge=()=>{
        const totalAmount=totals.totalMRP -
        totals.totalDiscount +
        (cart.platformFee || 0)
        return  totalAmount>100?0:60
      }
  
      const deliveryCharge:number = calculateDeliveryCharge();
    //update cart with calculated totals
    return {...cart, 
      totalItems: totals.totalItems,
      totalMRP: roundToTwo(Math.max(totals.totalMRP,0)),
      totalDiscount: roundToTwo(Math.max(totals.totalDiscount,0)),
      deliveryCharge,
      totalAmount: roundToTwo(
        Math.max(
          0,
          totals.totalMRP -
          totals.totalDiscount +
          (cart.platformFee || 0) + deliveryCharge
        )
      ),
    };
  
   
  };