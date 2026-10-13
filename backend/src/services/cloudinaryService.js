const cloudinary = require('../config/cloudinary');
const logger = require('../utils/logger');

const uploadImage = async (fileBuffer, folder = 'skillforge', publicId = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    };

    if (publicId) {
      options.public_id = publicId;
      options.overwrite = true;
    }

    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      })
      .end(fileBuffer);
  });
};

const deleteImage = async publicId => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = { uploadImage, deleteImage };