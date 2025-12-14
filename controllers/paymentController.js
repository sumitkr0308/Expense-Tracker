// controllers/paymentController.js

const Payment = require("../models/payment");
const User = require("../models/signupUser");
const { createOrder, getPaymentStatus } = require("../services/cashfreeServices");


// CREATE ORDER

const createOrderController = async (req, res) => {
  try {
    const { amount } = req.body;

    const userId = req.user.userId;  // logged-in user
    const customerPhone = "9999999999"; // OR pull from DB later

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required"
      });
    }

    const orderId = "ORDER_" + Date.now();

    // Call Cashfree
    const paymentSessionId = await createOrder(
      orderId,
      amount,
      "INR",
      String(userId),     // Customer ID must be STRING
      customerPhone
    );

    if (!paymentSessionId) {
      return res.status(500).json({
        success: false,
        message: "Failed to create Cashfree order"
      });
    }

    // Save order in DB
    await Payment.create({
      orderId,
      paymentSessionId,
      amount,
      currency: "INR",
      customerId: String(userId),   // ← FIXED
      customerPhone,                // ← FIXED
      status: "PENDING"
    });

    return res.status(200).json({
      success: true,
      orderId,
      paymentSessionId
    });

  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



// GET PAYMENT STATUS


const getPaymentStatusController = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await getPaymentStatus(orderId);

    console.log("🔍 Cashfree Payment Status Result:", result);

    const { status, payments } = result;

    // Update payment entry
    await Payment.update(
      { status, transactions: payments },
      { where: { orderId } }
    );

    // ⭐ IF PAYMENT SUCCESS → MAKE USER PREMIUM
    if (status === "SUCCESS") {
      const payment = await Payment.findOne({ where: { orderId } });

      if (payment) {
        await User.update(
          { isPremium: true },
          { where: { id: payment.customerId } }
        );
      }
    }

    return res.status(200).json({
      success: true,
      orderId,
      status,
      transactions: payments,
    });

  } catch (error) {
    console.error("Payment Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Error retrieving payment status",
    });
  }
};




module.exports = {
  createOrderController,
  getPaymentStatusController,
};
