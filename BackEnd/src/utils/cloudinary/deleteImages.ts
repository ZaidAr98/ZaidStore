import cloudinary from "../../config/cloudinaryConfig"


export const cloudinaryDeleteImages = async (imageUrls:string[]) => {
    const getPublicIdFromUrl = (url:string) => {
      const parts = url.split('/');
      const fileWithExtension = parts.pop(); // Get the file name with extension

      if (!fileWithExtension) {
        throw new Error(`Invalid Cloudinary URL: ${url}`);
      }

      
      const folderPath = parts.slice(-1)[0] === 'products' ? '' : 'products/'; // Folder name
      const [publicId] = fileWithExtension.split('.'); // Get the public_id without extension
      return `${folderPath}${publicId}`;
    };
  
    const deletePromises = imageUrls.map((url:string) => {
      const publicId = getPublicIdFromUrl(url);
      return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error:any, result:string
        ) => {
          if (error) {
            console.error(`Failed to delete image with public_id ${publicId}:`, error);
            reject(error);
          } else {
            console.log(`Deleted image with public_id ${publicId}:`, result);
            resolve(result);
          }
        });
      });
    });
  
    return Promise.all(deletePromises);
  };
  
