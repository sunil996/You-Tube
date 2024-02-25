const cloudinary = require("cloudinary").v2;
const fs=require("fs");
const { nextTick } = require("process"); 
 
require('dotenv').config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath,locationFolder) => {
    try {
        if (!localFilePath) return null
           const response = await cloudinary.uploader.upload(localFilePath, {
           resource_type:"auto",
           folder:locationFolder
        })
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)   
        return null;
    }
}
 
  
async function deleteMediaFileFromCloudinary(publicId, resourceType="image") {
  try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      return result;
  } catch (error) {
      console.log("in error part");
      console.log(error);
      return null;
  }
}
 

module.exports={uploadOnCloudinary,deleteMediaFileFromCloudinary}

