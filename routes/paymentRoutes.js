const express=require("express");
const paymentController=require("../controllers/paymentController")
const authenticate = require("../middleware/auth");;

const router = express.Router();

router.post("/create-order",authenticate, paymentController.createOrderController);
router.get("/payment-status/:orderId",authenticate, paymentController.getPaymentStatusController);
router.get("/success", (req, res) => {
  const { order_id } = req.query;
  res.redirect(`http://127.0.0.1:5501/view/payment-success.html?orderId=${order_id}`);
});


module.exports=router;
