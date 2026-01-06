const AWS = require("aws-sdk");

const uploadToS3 = async (data, fileName) =>   {

try {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.S3_ACCESS_KEY;
  const IAM_USER_SECRET = process.env.S3_SECRET_KEY; 
    let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });
 
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: data,
      ACL: "public-read",
    };
   const result = await s3bucket.upload(params).promise();
   return result.Location;
  
} catch (error) {
  console.log("S3 upload error:", error);
  throw new Error("Failed to upload to S3");
} 
}

module.exports = { uploadToS3 };