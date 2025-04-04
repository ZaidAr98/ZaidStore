import Order from "../../model/orderModel"
import Product from "../../model/productModel"
import Wallet from "../../model/walletModel";
import { v4 as uuidv4 } from "uuid";
import {  NextFunction, Request, Response } from "express";
import { OrderItem, OrderType } from "../../types/OrderType";
import { calculateRefundPrice } from "../../utils/service/calculateRefundAmount";

import { Document, Types } from "mongoose";

export const getOrders = async(req:Request,res:Response):Promise<void>=>{
try {
    const orders = await Order.find({}).sort({createdAt:-1}).populate("userId").populate('items.productId')
    if (!orders) {
     res.status(404).json({ success: false, message: "Orders not found" });
     return  
    }
      res.status(200).json({ success: true, message: "Orders fetched", orders });
} catch (error:any) {
    res
    .status(error.status || 500)
    .json({ success: false, message: error.message });
  console.log("failed to fetch orders in admin", error.message);
}
}


export const cancelOrder = async(req:Request,res:Response):Promise<void>=>{
  const { orderId, itemId } = req.params;
  console.log("item id", itemId);

  try {
    //1.check if order exist
    if (!orderId || !itemId) {
      res.status(400).json({ success: false, error: "Invalid inputs" });
      return
    }
    //2.check if item exist
    const order = await Order.findById(orderId);
    if (!order) {
       res.status(404).json({ error: "order not found" });
       return
    }
    const item = order?.items.find((item: OrderItem) => item._id.toString() === itemId); 
     if (!item) {
       res.status(404).json({ error: "Item not found in this order" });
       return
    }
    if (item?.status === "Cancelled") {
        res.status(400).json({ error: "item already cancelled" });
    }
    // Update order and handle refund
    const updateOptions = {
      $set: { "items.$[elem].status": "Cancelled","items.$[elem].paymentStatus":"Pending" },
      $push: {
        activityLog: {
          status: `Cancelled item: ${item?.name}`,
          changedAt: new Date(),
        },
      },
    };

    // Non-COD payment handling
    let wallet;
    let refundAmount: number = 0;

    if (order?.paymentMethod !== "Cash on Delivery" && item?.paymentStatus=='Paid') {
      refundAmount = calculateRefundPrice(order  as OrderType, item);
      const transactionId =
      order?.transactionId ||(item.paymentMethod == "Cash on Delivery"
        ? `COD-${uuidv4()}`
        : null);


        // Prepare transaction
      const newTransaction = {
        transactionId: transactionId!,
        type: "refund" as const,
        amount: refundAmount,
        orderId: order?._id as Types.ObjectId,
        status: "success" as const,
        date: new Date(),
        description: `Refund for cancelled item: ${item.name}`

      };

      // Find or create wallet
      wallet = await Wallet.findOne({ userId: order?.userId });
      if (!wallet) {
        wallet = new Wallet({
          userId: order?.userId,
          transactionHistory: [newTransaction],
        });
        console.log("wallet created");
      } else {
        wallet.transactionHistory.push(newTransaction);
      }

      // Update order with refund status
      updateOptions.$set["items.$[elem].paymentStatus"] = "Refunded";
    }

    // Update order
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      updateOptions,
      { arrayFilters: [{ "elem._id": itemId }], new: true }
    );

    // Increase product stock
    await Product.findOneAndUpdate(
      { _id: item?.productId },
      { $inc: { "sizes.$[elem].stock": item?.quantity } },
      { arrayFilters: [{ "elem.size": item?.size }] }
    );

    // Save wallet if exists
    if (wallet) {
      await wallet.save();
      console.log("wallet is updated");
    }
    console.log("order cancelled by admin");

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      order: updatedOrder,
      refundAmount: refundAmount || null,
    });
  } catch (error:any) {
    console.error("order not cancelled", error);
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal server error." });
  }
}

export const updateStatus = async(req:Request,res:Response):Promise<void>=>{
  const { orderId, itemId } = req.params;
  const { status } = req.body;
  
  try {
    
    if (!orderId || !itemId) {
      res.status(400).json({ success: false, error: "Invalid inputs" });
      return
    }
    //2.check if item exist
    const order = await Order.findById(orderId);
    if (!order) {
       res.status(404).json({ error: "order not found" });
       return
    }
    const item = order?.items.find((item: OrderItem) => item._id.toString() === itemId);  if (!item) {
       res.status(404).json({ error: "Item not found in this order" });
       return
    }
    if(item.paymentStatus!=='Paid' && status=='Delivered'){
       res.status(400).json({success:false,message:"Payment process is not completed"})
       return
      }
 
      const updatedOrder = status == "Delivered" 
      ? await Order.findOneAndUpdate(
          { _id: orderId },
          {
            $set: {
              "items.$[elem].status": status,
              "items.$[elem].deliveryDate": new Date(),
            },
          },
          {
            arrayFilters: [{ "elem._id": itemId }],
            new: true
          }
        )
      : await Order.findOneAndUpdate(
          { _id: orderId },
          { $set: { "items.$[elem].status": status } },
          {
            arrayFilters: [{ "elem._id": itemId }],
            new: true
          }
        );
        console.log("ipdatedorder", updatedOrder);

        if (!updatedOrder) {
           res.status(500).json({ error: "Status update failed." });
           return
          }
          const updatedItem = await Order.findOne(
            { _id: orderId, "items._id": itemId },
            { "items.$": 1 } //it will project the first matching item in array
          );
          if (!updatedItem || !updatedItem.items || updatedItem.items.length === 0) {
             res
              .status(404)
              .json({ success: false, error: "Updated item not found" });
              return
            }
            res.status(200).json({
              success: true,
              message: "Status updated",
              item: updatedItem.items[0],
            });


  } catch (error:any) {
    console.log("Error updating status", error);
    res
      .status(500)
      .json({ success: false, error: error.message || "Status update failed" });
  }


}


export const getPendingRequests = async(req:Request,res:Response)=>{

  try{
const PendingRequests = await Order.find({
  "items.returnRequest.isRequested":true,
  "items.returnRequest.isApproved":true,
  "items.returnRequest.isResponseSend":true,
}).populate("userId","name email")
res.status(200).json({
  success:true,
  message: "Fetched pending requests",
  PendingRequests,
})

  }catch{
    console.error("failed to fetch pending requests");
    res
      .status(500)
      .json({ success: false, message: "failed to fetch pending requests" });
  }
  }



 export  const approveReturnRequest = async(req:Request,res:Response)=>{

    try {
      const {orderId,itemId}= req.params
      if(!orderId || !itemId){
        res.status(400).json({success: false, message: "Invalid input parameters" })
      }
      const order = await Order.findOne({_id:orderId,"items._id":itemId})
      if(!order){
        res.status(404).json({success: false, message: "Order not found" })
      }
      const foundOrder = order as Document<unknown, {}, OrderType> & OrderType & {
        _id: Types.ObjectId;
      };
  
      const returnItem = foundOrder?.items.find((item: OrderItem) => item._id.toString() === itemId);
      if (
        !returnItem?.returnRequest.isRequested ||
        returnItem.returnRequest.isApproved ||
        returnItem.returnRequest.isResponseSend
      ){
        res.status(400)
        .json({ success: false, message: "Item not eligible for return." });
        return
      }
      if (
        !returnItem.deliveryDate || new Date(returnItem.deliveryDate) <   new Date(new Date().setDate(new Date().getDate() - 7))
      ) {
         res
          .status(400)
          .json({ success: false, message: "Return period has expired." });
          return
        }
        if (
          returnItem.status != "Delivered" ||
          returnItem.paymentStatus != "Paid"
        ) {
           res
            .status(400)
            .json({
              success: false,
              message: "Item not eligible for refund and return",
            });
          return
        }
        const refundAmount = calculateRefundPrice(foundOrder  as OrderType, returnItem);
        let wallet = await Wallet.findOne({ userId: foundOrder?.userId });
 
        const transactionId =
        foundOrder?.transactionId ||
        (returnItem.paymentMethod == "Cash on Delivery"
          ? `COD-${uuidv4()}`
          : null);

          const newTransaction = {
            transactionId: transactionId as string,
            type: "refund" as const,
            amount: refundAmount,
            orderId: foundOrder?._id as Types.ObjectId,
            status: "success" as const,
            date: new Date(),
            
          };


          if (!wallet) {
            wallet = await Wallet.create({
              userId: foundOrder?.userId,
              transactionHistory: [newTransaction],
            });
          } else {
            wallet.transactionHistory.push(newTransaction);
          }
          await wallet.save()
          returnItem.status = "Returned";
          returnItem.paymentStatus = "Refunded";
          returnItem.returnRequest.isApproved = true;
          returnItem.returnRequest.isResponseSend = true;
          foundOrder.paymentStatus = "Refunded";
          await foundOrder?.save();
          res.status(200).json({ success: true, message: "Return approved." });
    } catch (error:any) {
      console.error("Error approving returnrequest");
      res
        .status(500)
        .json({ success: false, message: "Failed to approve request" });
    }
    }
  

    export const  declineReturnRequest = async(req:Request,res:Response):Promise<void>=>{
      try {
        const { orderId, itemId } = req.params;
        console.log(orderId,itemId,'decline req');
        if (!orderId || !itemId) {
           res
            .status(400)
            .json({ success: false, message: "Invalid input parameters" });
            return
          }
          const order = await Order.findOne({ _id: orderId, "items._id": itemId });
          if (!order) {
             res
              .status(404)
              .json({ success: false, message: "Order not found" });
              return
            }
            const returnItem = order?.items.find((item: OrderItem) => item._id.toString() === itemId);
            if (
              !returnItem?.returnRequest.isRequested ||
              returnItem.returnRequest.isApproved ||
              returnItem.returnRequest.isResponseSend
            ) {
               res
                .status(400)
                .json({ success: false, message: "Invalid decline request" });
                return
              }
              returnItem.returnRequest.isApproved=false;
              returnItem.returnRequest.isResponseSend = true;
              await order.save();
              res.status(200).json({ success: true, message: "Return Declined" });
      } catch (error) {
        res
        .status(500)
        .json({ success: false, message: "Failed to decline request" });
    }
      }
    