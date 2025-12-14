const express=require("express");
const paymentController=require("../controllers/paymentController")
const authenticate = require("../middleware/auth");;

const router = express.Router();

router.post("/create-order",authenticate, paymentController.createOrderController);
router.get("/payment-status/:orderId",authenticate, paymentController.getPaymentStatusController);

module.exports=router;
