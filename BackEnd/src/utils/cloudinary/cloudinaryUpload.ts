import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import cloudinary from "../../config/cloudinaryConfig";

export const cloudinaryImageUploadMethod = async (fileBuffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                { folder: "products" }, 
                (err: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                    if (err) {
                        reject(new Error(`Upload image error: ${err.message}`));
                    } else if (result) {
                        resolve(result.secure_url); // Return secure URL of the uploaded image
                    } else {
                        reject(new Error("No result from Cloudinary"));
                    }
                }
            )
            .end(fileBuffer); 
    });
};