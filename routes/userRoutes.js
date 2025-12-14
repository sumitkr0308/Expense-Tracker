const express=require("express");
const router=express.Router();
const userControllers=require('../controllers/userController')
const authenticate = require("../middleware/auth");
const User=require("../models/signupUser")

router.get("/",userControllers.getSignPage);
router.post("/login", userControllers.loginUser);
router.post("/signup", userControllers.signupUser);
router.get("/status", authenticate, async (req, res) => {
  const user = await User.findByPk(req.user.userId);
  res.json({ isPremium: user.isPremium });
});



module.exports=router;