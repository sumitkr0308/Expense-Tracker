const axios = require("axios");
const Order = require("../models/order");
const User = require("../models/signupUser");

const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY =  process.env.CASHFREE_API_KEY;

const CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg";

// Create Order (Step 1)
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orderId = `order_${Date.now()}`;
    
    const order = await Order.create({
      orderId,
      amount: 499,
      status: "PENDING",
      UserId: userId
    });

    const cfResponse = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: 499,
        order_currency: "INR",
        customer_details: {
          customer_id: String(userId),
          customer_email: "test@gmail.com",
          customer_phone: "9999999999",
        },
      },
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      order,
      order_token: cfResponse.data.order_token,
    });

  } catch (error) {
    console.error("Create Order Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to create order" });
  }
};


// Update Order Status (Secure)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.userId;

    const order = await Order.findOne({ where: { orderId, UserId: userId } });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // --- Step 1: verify payment with Cashfree ---
    const paymentRes = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${orderId}/payments`,
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": "2022-09-01",
        },
      }
    );

    const payments = paymentRes.data;

    if (!payments || payments.length === 0) {
      order.status = "FAILED";
      await order.save();
      return res.status(400).json({ message: "Payment not found or failed" });
    }

    const latestPayment = payments[0];

    if (latestPayment.payment_status === "SUCCESS") {
      // update both order AND user
      order.status = "SUCCESSFUL";
      order.paymentId = latestPayment.cf_payment_id;
      await order.save();

      await User.update({ isPremium: true }, { where: { id: userId } });

      return res.status(200).json({ message: "Payment verified. User is now premium.", order });
    } 
    else {
      order.status = "FAILED";
      await order.save();
      return res.status(400).json({ message: "Payment failed" });
    }

  } catch (error) {
    console.error("Update Status Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to update/verify order status" });
  }
};
