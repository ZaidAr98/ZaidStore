interface Product {
    discount: number;
    offerId?: { 
        offerValue: number;
        expiryDate: Date | string;
    };
}

export const calculateDiscountPrice = (product: Product): number => {
    const offerDiscount = product.offerId?.offerValue || 0;
    let totalDiscount = product.discount + offerDiscount;
    totalDiscount = Math.min(totalDiscount, 100);
    return totalDiscount;
};