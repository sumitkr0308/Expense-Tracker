const express=require("express");
const passwordControllers=require("../controllers/passwordControllers");
const router=express.Router();

router.post('/forgotpassword',passwordControllers.sendResetMail);
router.get('/resetpassword/:uuid',passwordControllers.resetPassword)
router.post('/updatepassword/:uuid',passwordControllers.updatePassword);

module.exports=router;