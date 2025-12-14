const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authenticate = require("../middleware/auth");

router.post("/create-order", authenticate, orderController.createOrder);
router.post("/update-order-status", authenticate, orderController.updateOrderStatus);

module.exports = router;
