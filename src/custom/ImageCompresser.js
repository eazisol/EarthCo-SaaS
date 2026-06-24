import imageCompression from 'browser-image-compression';
const imageCompresser = async (uploadedFile) => {
    if (uploadedFile) {
        if (uploadedFile.type.startsWith('image')) {
          // Compression options
          const options = {
            maxSizeMB: 1, // Maximum size in MB
            maxWidthOrHeight: 1920, // Max width/height for resizing
            useWebWorker: true, // Enable web worker for better performance
          };
    
          try {
            // Compress the image
            const compressedBlob = await imageCompression(uploadedFile, options);
  
          // Create a new File from the compressed Blob
          const compressedFile = new File([compressedBlob], uploadedFile.name, {
            type: uploadedFile.type,
            lastModified: Date.now(), // Optionally use uploadedFile.lastModified if you want to keep the original last modified time
          });
  
            console.log("uploadedFile",compressedFile)
            // Update file list with the compressed image
         
            return compressedFile
          } catch (error) {
            console.error('Error compressing the image:', error);
          }
        } else {
          // If not an image, just add the file as is
         
          return uploadedFile
        }
      }
  };
  
  export default imageCompresser;
  