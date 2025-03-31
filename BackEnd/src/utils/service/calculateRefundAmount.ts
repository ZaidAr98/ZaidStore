import { OrderItem, OrderType } from "../../types/OrderType";

export const roundToTwo = (num: number): number => {
    return parseFloat((Math.round(num * 100) / 100).toFixed(2));
  };


  export const calculateRefundPrice = (order:OrderType, item:OrderItem) => {
  const offerDiscount = (item.discount * item.price) / 100;
  const itemCouponDiscount = order.couponDiscount *(item.totalMRP/order.totalMRP)
  const itemShippingFee = order.shippingFee *(item.totalMRP/order.totalMRP);
  const itemTax = order.tax*(item.totalMRP/order.totalMRP);
  
  const maxTotalPrice=Math.max((item.price + itemTax + itemShippingFee - offerDiscount - itemCouponDiscount),0)
  return roundToTwo(maxTotalPrice)
};