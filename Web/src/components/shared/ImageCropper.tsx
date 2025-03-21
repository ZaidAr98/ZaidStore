import React, { useRef, useState } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { Button } from '../ui/button';
import imageCompression from 'browser-image-compression';


interface ImageCropperProps {
  imageSrc: string; 
  onImageCropped: (imageUrl: string, compressedImage: File) => void; 
}

const ImageCropper: React.FC<ImageCropperProps> = ({ imageSrc, onImageCropped }) => {

  const cropperRef = useRef<ReactCropperElement>(null);

 
  const [isCropped, setIsCropped] = useState<boolean>(true);


  const handleCrop = () => {
    if (cropperRef.current) {
    
      const cropperInstance = cropperRef.current.cropper;

    
      cropperInstance.getCroppedCanvas().toBlob(async (blob: Blob | null) => {
        if (blob) {
          try {
          
            const file = new File([blob], 'cropped-image.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

    
            const compressedImage = await imageCompression(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 500,
            });

            const imageUrl = URL.createObjectURL(compressedImage);

           
            onImageCropped(imageUrl, compressedImage);
          } catch (error) {
            console.error('Error compressing image:', error);
          }
        }
      }, 'image/jpeg');
    }
  };

  return (
    <div style={{ marginBottom: '10px' }}>
   
      {isCropped && (
        <>
          <Cropper
            src={imageSrc}
            style={{ height: 400, width: '100%' }}
            aspectRatio={1} 
            guides={false}
            ref={cropperRef} 
            viewMode={2}
            dragMode="move"
            autoCropArea={1}
            scalable={true}
            cropBoxResizable={true}
            cropBoxMovable={true}
          />
          <br />
       
          <Button onClick={handleCrop}>Crop & Compress</Button>
        </>
      )}
    </div>
  );
};

export default ImageCropper;