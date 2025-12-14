const jwt=require("jsonwebtoken");

const authenticate=(req,res,next)=>{
    try {
        const token=req.header("Authorization");
        if(!token)
            return res.status(401).json({ message: "Access denied" });
        const actualToken=token.split(" ")[1];
        const decoded=jwt.verify(actualToken,"secret-key");
        req.user=decoded;
        next();
    } catch (error) {
       res.status(403).json({ message: "Invalid or expired token" }); 
    }
}


module.exports = authenticate;