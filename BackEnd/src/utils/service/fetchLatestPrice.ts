import { Types } from "mongoose";

interface ISize {
    _id?: string;
    size: string;
    price: number;
    stock: number;
}

interface IProduct extends Document {
    sizes: ISize[];
    isListed:boolean
}

interface ICartItem {
    _id:string;
    productId: Types.ObjectId | IProduct;
    size: string;
    quantity: number;
    latestPrice: number;
    discount: number;
    maxQtyPerUser: number;
    inStock: boolean;
}

interface IPopulatedCartItem extends Omit<ICartItem, 'productId'> {
    productId: IProduct;
}

export const fetchLatestPrice = (item: ICartItem | IPopulatedCartItem): number => {

    if (!('sizes' in item.productId)) {
        return item.latestPrice; 
    }

    const selectedSize = item.productId.sizes.find((s) => s.size === item.size);
    
    return selectedSize?.price ?? item.latestPrice;
};
