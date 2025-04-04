import Order from "../../model/orderModel";
import { stripe } from "../../config/stripeConfig";
import { Request,Response } from "express";
import { OrderItem, OrderType } from "../../types/OrderType";



export const createOrder = async (req: Request, res: Response): Promise<void> => {
    const { amount } = req.body; // orderId not needed for Stripe

    try {
        console.log(amount, 'amount');

        // Input validation
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            res.status(400).json({ success: false, message: "Valid amount is required!" });
            return;
        }

        console.log("Creating Stripe Payment Intent");

        // Stripe requires amount in smallest currency unit (fils for AED)
        const stripeAmount = Math.round(amount * 100); // Convert AED to fils

        const paymentIntent = await stripe.paymentIntents.create({
            amount: stripeAmount,
            currency: 'aed', // lowercase for Stripe
            description: `zaid_rcptid_${Math.floor(Math.random() * 1000)}`, // Stripe uses description
            automatic_payment_methods: {
                enabled: true, // Recommended for Stripe
            },
            // payment_capture: 1 (Not used in Stripe - payments are automatically captured)
        });

        console.log("Payment Intent created:", paymentIntent);

        res.status(200).json({
            success: true,
            order: {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                client_secret: paymentIntent.client_secret // Essential for frontend
            }
        });

    } catch (error) {
        console.error('Error creating Stripe order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
        return;
    }
};



export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.body;
    
    console.log("Verifying Stripe payment", paymentIntentId);
    
    if (!paymentIntentId) {
      return res.status(400).json({ success: false, message: "Payment Intent ID is required" });
    }

    // Retrieve the PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log("PaymentIntent status:", paymentIntent.status);

    // Verify the payment status
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false, 
        message: `Payment not completed. Status: ${paymentIntent.status}` 
      });
    }

    // Payment is successful
    return res.status(200).json({ 
      success: true, 
      message: 'Payment verified successfully',
      payment: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};






interface RetryPaymentRequest {
  amount: number;
}

export const retryPayment = async (req: Request<{ orderId: string }, {}, RetryPaymentRequest>, res: Response) => {
  const { orderId } = req.params;
  const { amount } = req.body;

  // Input validation
  if (!orderId || !amount) {
    return res.status(400).json({
      success: false,
      message: "Order ID and amount are required"
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a positive number"
    });
  }

  try {
    // 1. Find the existing order
    const order = await Order.findById(orderId) as OrderType;
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // 2. Validate payment status
    if (order.paymentStatus !== 'Failed') {
      return res.status(400).json({
        success: false,
        message: "Only failed payments can be retried"
      });
    }

    // 3. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to smallest currency unit (cents/paisa)
      currency: 'inr', // lowercase for Stripe
      description: `Retry payment for order ${orderId}`,
      metadata: {
        order_id: orderId,
        retry_attempt: (order.retryAttempts || 0) + 1
      },
      automatic_payment_methods: {
        enabled: true // Recommended for Stripe
      }
    });

    // 4. Update order record
    order.paymentIntentId = paymentIntent.id;
    order.retryAttempts = (order.retryAttempts || 0) + 1;
    await order.save();

    // 5. Return payment intent to client
    return res.status(200).json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        client_secret: paymentIntent.client_secret // Required for frontend confirmation
      }
    });

  } catch (error) {
    console.error("Retry payment failed:", error);
    
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return res.status(500).json({
      success: false,
      message: "Retry payment failed",
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};