import Order from "../../model/orderModel";
import Product from "../../model/productModel";
import Cart from "../../model/cartModel";
import Wallet from "../../model/walletModel";
import { v4 as uuidv4 } from "uuid";
import { Response, Request } from "express";

import { generateOrderNumber } from "../../utils/generateOrderNumber";
import { recalculateCartTotals } from "../../utils/service/recalculateCartTotals";
import { calculateRefundPrice } from "../../utils/service/calculateRefundAmount";
import { Coupon, UserCoupon } from "../../model/couponModel";
import { OrderItem, OrderType } from "../../types/OrderType";
import { ProductType } from "../../types/ProductType";
import { date, string } from "zod";
import { Types } from "mongoose";

export const placeOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      userId,
      customerName,
      items,
      totalMRP,
      totalDiscount,
      couponDiscount,
      couponCode,
      shippingFee,
      tax,
      totalAmount,
      shippingAddress,
      paymentMethod,
      transactionId,
      paymentStatus,
    } = req.body;
    console.log("placing order");

    if (
      !userId ||
      !items ||
      !totalAmount ||
      !shippingAddress ||
      !paymentMethod
    ) {
      res
        .status(404)
        .json({ success: false, message: "Required fields are missing" });
      return;
    }

    const orderNumber = await generateOrderNumber();
    console.log("order number", orderNumber);

    const orderDate = new Date(); //date object
    const deliveryDays = 7;
    const expectedDeliveryDate = new Date(orderDate);
    expectedDeliveryDate.setDate(orderDate.getDate() + deliveryDays);

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with id ${item.productId} not found`);
      }
      const size = product.sizes.find((size) => size.size === item.size);
      if (!size || size.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for product: ${product.name} - ${item.size}`
        );
      }
      //Reduce stock
      size.stock -= item.quantity;
      //save product with stock reduction
      await product.save();
    }

    if (paymentMethod == "Wallet") {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        res.status(404).json({ success: false, message: "Wallet not found" });
        return;
      }
      if (wallet.balance < totalAmount) {
        res
          .status(400)
          .json({ success: false, message: "Insufficient balance in wallet" });
        return;
      }
      const newTransaction = {
        transactionId: `pay-${uuidv4()}` as const,
        type: "debit" as const,
        amount: totalAmount,
        status: "success" as const,
        date: new Date(),
      };
      wallet.transactionHistory.push(newTransaction);
      await wallet.save();
    }

    const order = new Order({
      orderNumber,
      userId,
      customerName,
      items,
      totalMRP,
      totalDiscount,
      couponDiscount: couponDiscount ? couponDiscount : 0,
      couponCode: couponCode ? couponCode : "",
      shippingFee,
      tax,
      totalAmount,
      shippingAddress,
      paymentMethod,
      transactionId: transactionId ? transactionId : "",
      paymentStatus:
        paymentStatus ||
        (paymentMethod === "Cash on Delivery" ? "Unpaid" : "Paid"),
      orderDate,
      expectedDeliveryDate,
      activityLog: [{ status: "Order Placed", changedAt: orderDate }],
    });

    await order.save();

    if (couponCode) {
      console.log("have coupon", couponCode);

      const couponUsed = await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { totalAppliedCount: 1 } },
        { new: true }
      );
      await UserCoupon.findOneAndUpdate(
        { couponId: couponUsed?._id, userId: userId },
        { $inc: { appliedCount: 1 } }
      );
    }
    console.log("order placed");

    res.status(201).json({
      success: true,
      message: "ORDER PLACED SUCCESSFULLY",
      orderId: orderNumber,
    });
  } catch (error: any) {
    console.log("error placing order", error);
    res
      .status(500)
      .json({ message: "Failed to place order", error: error.message });
  }
};

export const getOrderDetails = async (req: Request, res: Response) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findOne({ orderNumber: orderId }).populate(
      "items.productId"
    );
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Oder details fetched", order });
  } catch (error: any) {
    console.log("error in fetching order", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    const orders = await Order.find({ userId })
      .populate("items.productId")
      .sort({ orderDate: -1 });
    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "Orders not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Orders fetched successfully", orders });
  } catch (error: any) {
    console.log("error fetching orders", error);

    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const cancelOrder = async (req: Request, res: Response) => {
  const { orderId, itemId } = req.params;
  console.log(orderId, itemId);

  try {
    const order = await Order.findOne({ orderNumber: orderId });
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const item = order.items.find(
      (item: OrderItem) => item._id.toString() === itemId
    );
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    if (item.status === "Cancelled") {
      return res.status(400).json({ error: "item already cancelled" });
    }
    // Update order and handle refund
    const updateOptions = {
      $set: {
        "items.$[elem].status": "Cancelled",
        "items.$[elem].paymentStatus": "Pending",
      },
      $push: {
        activityLog: {
          status: `Cancelled item: ${item?.name}`,
          changedAt: new Date(),
        },
      },
    };

    // Non-COD payment handling
    let wallet, refundAmount;
    if (
      order.paymentMethod !== "Cash on Delivery" &&
      order.paymentStatus === "Paid"
    ) {
      refundAmount = calculateRefundPrice(order as OrderType, item);
      console.log("cancel refund amount", refundAmount);

      const transactionId =
        order?.transactionId ||
        (item?.paymentMethod == "Cash on Delivery" ? `COD-${uuidv4()}` : null);
      // Prepare transaction
      const newTransaction = {
        transactionId: transactionId!,
        type: "refund" as const,
        amount: refundAmount,
        orderId: order._id as Types.ObjectId,
        status: "success" as const,
        date: new Date(),
      };

      // Find or create wallet
      wallet = await Wallet.findOne({ userId: order.userId });
      if (!wallet) {
        wallet = new Wallet({
          userId: order?.userId,
          transactionHistory: [newTransaction],
        });
      } else {
        wallet.transactionHistory.push(newTransaction);
      }

      // Update order with refund status
      updateOptions.$set["items.$[elem].paymentStatus"] = "Refunded";
    }

    // Update order
    const updatedOrder = await Order.findOneAndUpdate(
      { orderNumber: orderId },
      updateOptions,
      { arrayFilters: [{ "elem._id": itemId }], new: true }
    );

    console.log("uo", updatedOrder);

    // Increase product stock
    await Product.findOneAndUpdate(
      { _id: item.productId },
      { $inc: { "sizes.$[elem].stock": item.quantity } },
      { arrayFilters: [{ "elem.size": item.size }] }
    );

    // Save wallet if exists
    if (wallet && updatedOrder) {
      await wallet.save();
      console.log("wallet updated");
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      order: updatedOrder,
      refundAmount: refundAmount || null,
    });
  } catch (error: any) {
    console.log("order cancelation failed", error.message);

    res.status(error.status).json({ error: "Order cancellation failed" });
  }
};

export const changePaymentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { orderId } = req.params;
  const { transactionId, paymentMethod, paymentStatus } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order || order.paymentStatus != "Failed") {
      res.status(404).json({ success: false, message: "Order not found" });
      return;
    }
    order.items.forEach((item) => (item.paymentStatus = "Paid"));
    order.transactionId = transactionId;
    order.paymentMethod = paymentMethod;
    order.paymentStatus = paymentStatus;
    await order.save();
    res
      .status(200)
      .json({ success: true, order, message: "Order payment status updated" });
  } catch (error) {
    console.error("Failed to update payment status", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const sendReturnRequest = async (req: Request, res: Response) => {
  const { orderId, itemId, reason, comment } = req.body;
  console.log(req.body, "return req");

  if (!orderId || !itemId || !reason) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid input parameters" });
  }

  const reqComment = comment ? comment : "";

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    const orderItem = order?.items.find(
      (item: OrderItem) => item._id.toString() === itemId
    );
    if (orderItem?.paymentStatus != "Paid" || orderItem.status != "Delivered") {
      return res
        .status(400)
        .json({ success: false, message: "order not eligible for return." });
    }
    if (
      !orderItem.deliveryDate ||
      new Date(orderItem.deliveryDate) <
        new Date(new Date().setDate(new Date().getDate() - 7))
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Return period has expired." });
    }
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId, "items._id": itemId },
      {
        $set: {
          "items.$[elem].returnRequest.isRequested": true,
          "items.$[elem].returnRequest.comment": reqComment,
          "items.$[elem].returnRequest.reason": reason,
        },
      },
      {
        arrayFilters: [{ "elem._id": itemId }],
        new: true,
      }
    );

    console.log("updated item", updatedOrder?.items);

    return res
      .status(200)
      .json({ success: true, message: "Return request sent" });
  } catch (error: any) {
    console.error("error sending return request", error);
    res
      .status(500)
      .json({ success: false, message: "Return request not sent" });
  }
};



export const fetchBestProducts = async (req:Request, res:Response) => {
 
  try {
    
   const bestProducts= await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.totalPrice"] },
          },
        },
      },
      {$sort:{
        totalQuantity:-1
      }},
      {$limit:4},
      {$lookup:{
        from:'products',
        localField:'_id',
        foreignField:'_id',
        as:'productDetails'
      }},
      {$unwind:"$productDetails"}
    ]);
    res.status(200).json({success:true,bestProducts})
  } catch (error) {
    console.error("Failed to fetch best products",error);
    
    res.status(500).json({success:false,message:"Failed to fetch best products"})
  }}