const { Cashfree, CFEnvironment } =require( "cashfree-pg");

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  "TEST430329ae80e0f32e41a393d78b923034",
  "TESTaf195616268bd6202eeb3bf8dc458956e7192a85"
);

// ============================
// CREATE ORDER
// ============================

const createOrder = async (
  orderId,
  orderAmount,
  orderCurrency,
  customerId,
  customerPhone
) => {
  try {

    const request = {
      order_amount: orderAmount,
      order_currency: orderCurrency,
      order_id: orderId,

      customer_details: {
        customer_id: customerId,
        customer_phone: customerPhone,
        customer_email: "test@example.com"
      },

     order_meta: {
   return_url: "http://127.0.0.1:5500/ExpenseTracker/view/payment-success.html?orderId={order_id}",
   payment_methods: "cc,dc,upi"
}

    };

    // Correct function call as per Cashfree SDK
    const response = await cashfree.PGCreateOrder(request);

    console.log("Order created successfully");

    // Correct response path
    return response.data.payment_session_id;

  } catch (error) {
    console.error("Error creating order:", error.response?.data?.message || error);
    return null;
  }
};

// ============================
// GET PAYMENT STATUS
// ============================

const getPaymentStatus = async (orderId) => {
  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);

    const payments = response.data;

    console.log("🔍 RAW CASHFREE RESPONSE:", payments);

    let orderStatus = "PENDING";

    const successfulPayment = payments.filter(
      (txn) => txn.payment_status === "SUCCESS"
    );

    if (successfulPayment.length > 0) {
      orderStatus = "SUCCESS";
    } else {
      const failedPayment = payments.filter(
        (txn) => txn.payment_status === "FAILED"
      );
      if (failedPayment.length > 0) {
        orderStatus = "FAILED";
      }
    }

    return {
      orderId,
      status: orderStatus,
      payments,
    };

  } catch (error) {
    console.error("Error fetching status:", error);
    return { orderId, status: "ERROR" };
  }
};



module.exports={
    createOrder,
    getPaymentStatus
}
