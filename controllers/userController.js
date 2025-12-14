const user=require("../models/signupUser");
const path=require("path");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const getSignPage=(req,res)=>{

    res.sendFile(path.join(__dirname,"..","view","signup.html"));

}

// sign up
const signupUser=async(req,res)=>{
    try {
        const {name,email,password}=req.body;
        // validate
        if(!name || !email || !password)
        {
            return res.status(400).json({ message: "All fields are required" });
        }

        // check already existed user
        const existingUser = await user.findOne({ where: { email } });
            if (existingUser) {
            return res.status(409).json({ message: "Email already registered" });
        }

        // hashed password
        const hashedPassword=await bcrypt.hash(password,10);
       
        // create user
      const signupUsers= await user.create({name,email,password:hashedPassword});

     res.status(201).json({message: "Signup successful",user: signupUsers,});
          
    } catch (error) {
        console.log(error)
        res.status(500).json({error:error.message});
    }
}


//jwt token
const generateTokens=(userId)=>{
    return jwt.sign({userId},"secret-key",{expiresIn:"1h"});
}
// login
const loginUser=async(req,res)=>{
    try {
        const {email,password}=req.body;
        // validate
        if (!email || !password) {
         return res.status(400).json({ message: "All fields are required." });
        }
        // check user
      const existingUser = await user.findOne({ where: { email } });
        
        if (!existingUser) {
         return res.status(404).json({ message: "User not found." });
        }
        
        // check valid password
        const validPassword=await bcrypt.compare(password,existingUser.password);
        // password not match
        if (!validPassword) {
         return res.status(401).json({ message: "Invalid credentials." });
         }  
        const token = generateTokens(existingUser.id);
        res.status(200).json({ message: "Login successful", user: existingUser,token:token });  
    
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const checkStatus=async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      isPremium: user.isPremium
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching status" });
  }
};

module.exports={
    getSignPage,
    signupUser,
    loginUser,
    checkStatus
}