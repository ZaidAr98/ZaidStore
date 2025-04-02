import { Document, Types } from 'mongoose';
import { ProductType } from '../../types/ProductType'; // Assuming this exists

interface ISize {
    _id?: string;
    size: string;
    price: number;
    stock: number;
}

interface IProduct extends Document {
    sizes: ISize[];
}

interface ICartItem {
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


export const checkStock = (cartItem: ICartItem | IPopulatedCartItem): boolean => {

    const product = cartItem.productId as IProduct;
    
    if (!product.sizes || !Array.isArray(product.sizes)) {
        return false;
    }

    const sizeData = product.sizes.find(
        (size: ISize) => size.size === cartItem.size
    );

    return sizeData ? sizeData.stock > 0 : false;
};

