import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config(); 

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    console.error("❌ No local file path provided");
    return null;
  }

  console.log("📤 Uploading file:", localFilePath);

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    console.log('✅ File uploaded to Cloudinary:', response.url);
    return response;
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error?.response?.body || error.message || error);
    return null;
  } finally {
    try {
      fs.unlinkSync(localFilePath);
      console.log('🧹 Local file deleted:', localFilePath);
    } catch (fsErr) {
      console.error('⚠️ Error deleting local file:', fsErr.message);
    }
  }
};

export { uploadToCloudinary };
