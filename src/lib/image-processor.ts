/**
 * Processes an image file by resizing it to a 128x128 square.
 * @param file The image file to process.
 * @returns A promise that resolves with the processed image as a Blob.
 */
export const processImageForML = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context.'));
        }
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        // Simple center crop logic
        const sourceX = img.width > img.height ? (img.width - img.height) / 2 : 0;
        const sourceY = img.height > img.width ? (img.height - img.width) / 2 : 0;
        const sourceWidth = Math.min(img.width, img.height);
        const sourceHeight = sourceWidth;
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          size,
          size
        );
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed.'));
          }
        }, 'image/jpeg', 0.95); // Use JPEG for smaller size
      };
      img.onerror = (error) => {
        reject(error);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('FileReader did not return a string.'));
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};