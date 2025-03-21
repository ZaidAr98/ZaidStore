import cloudinary from "cloudinary";


const uploadImages = async(imageFiles: Express.Multer.File[]) =>{
    const uploadPromises = imageFiles.map(async (image) => {
      const b64 = Buffer.from(image.buffer).toString("base64");
      let dataURI = "data:" + image.mimetype + ";base64," + b64;
      const res = await cloudinary.v2.uploader.upload(dataURI);
      return res.url;
    });
  
    const imageUrls = await Promise.all(uploadPromises);
    return imageUrls;
  }


  export default uploadImages



  export const cloudinaryDeleteImages = async (publicIds: string[]): Promise<any> => {
    const deletePromises = publicIds.map(async (publicId) => {
      return await cloudinary.v2.uploader.destroy(publicId);
    });
  
    return await Promise.all(deletePromises);
  };