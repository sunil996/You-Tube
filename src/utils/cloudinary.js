const cloudinary = require("cloudinary").v2;
const fs=require("fs");
const { nextTick } = require("process");
const { ApiError } = require("./apiError");
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
           resource_type: "auto",
           folder:locationFolder
        })
         fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath)   
        return null;
    }
}

const deleteImageFromCloudinary=async(publicId,folder)=>{

    try {
       await cloudinary.uploader.destroy(publicId,{folder});
    } catch (error) {
       return res.status(error.statusCode || 500).json({ error: error.message });
    }
}

module.exports={uploadOnCloudinary,deleteImageFromCloudinary}

