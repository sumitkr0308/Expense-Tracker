const Sib = require("sib-api-v3-sdk");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const forgetPasswordRequests=require('../models/forgetPasswordRequest');
const Users=require("../models/signupUser");
const bcrypt = require("bcrypt");



exports.sendResetMail=async(req,res)=>{

    try {
        const {email}=req.body;

        const user=await Users.findOne({ where: { email: email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const id = uuidv4(); // generate unique request ID

        const forgetPasswordRequest=await forgetPasswordRequests.create({id,UserId:user.id});

        // send mail
        const client=Sib.ApiClient.instance;
        client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
        const tranEmailApi = new Sib.TransactionalEmailsApi();
        const resetURL = `http://localhost:4000/password/resetpassword/${id}`;
       
        await tranEmailApi.sendTransacEmail({
          sender:{email:"sumit2k30@gmail.com"},
          to:[{email}],
          subject: "Reset Expense Tracker password",
          htmlContent:`<p>Click the link to reset the password:</p>
                        <a href="${resetURL}">${resetURL} </a> 
                        `
        });

        res.status(200).json("Reset Password link sent") 
    } catch (error) {
        console.log("ERROR:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
}

exports.resetPassword=async(req,res)=>{
  try {
      const uuid = req.params.uuid;
      const request=await forgetPasswordRequests.findByPk(uuid);
      if (!request || !request.isActive) {
        return res.send("<h2>Invalid or Expired Link</h2>");
      }
      
      // reset page 
      res.status(201).send(`
              <form action="/password/updatepassword/${uuid}" method="POST">
              <h3>Enter New Password</h3>
              <input type="password" name="newpassword" required>
              <button type="submit">Update Password</button>
              </form>
        `);
    
  } catch (error) {
    console.log("ERROR:", error);
    res.status(500).json({ message: "Something went wrong" });
  }

}

exports.updatePassword=async(req,res)=>{
  try {
    const uuid=req.params.uuid;
    const newpassword=req.body.newpassword;
    console.log("newpassword",newpassword);
      if (!newpassword) {
            return res.send("<h2>Password is required</h2>");
        }
    const request=await forgetPasswordRequests.findByPk(uuid);
    if(!request || !request.isActive)
      {
        return res.send("<h2>Link expired or already used</h2>");
      }    

    const user=await Users.findByPk(request.UserId);
    const hashedPassword=await bcrypt.hash(newpassword,10);
    await user.update({password:hashedPassword});
    await request.update({isActive:false});
    res.send(`<h2>Password Updated Successfully 🎉</h2>
            <a href="/login.html">Click here to login</a>`);  
  } catch (error) {
    console.log("ERROR:", error);
     res.status(500).json({ message: "Something went wrong" });
  }
}

