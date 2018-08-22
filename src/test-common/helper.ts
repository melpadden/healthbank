/**
 * Helper methods for integration testing
 */


/**
 * error handling function for promises during setup and clean up of tests
 */
export function setupFailed(err: Object) {
  throw JSON.stringify(err);
}


/**
 * converts blob between image types
 * TODO convert to promise callback
 */
export function convertImage(src: Blob,
                             targetContentType: string,
                             cb: (result: Blob) => void,
                             resize?: {w?: number, h?: number}) {
  const reader: FileReader = new FileReader();

  reader.readAsDataURL(src);
  reader.onload = () => {
    const image: HTMLImageElement = document.createElement('img');
    image.onload = () => {
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      canvas.width = image.width + (resize && resize.w || 0);
      canvas.height = image.height + (resize && resize.h || 0);
      canvas.getContext('2d').drawImage(image, 0, 0);

      const arr: string[] = canvas.toDataURL(targetContentType).split(',');
      const mime: string = arr[0].match(/:(.*?);/)[1];
      const bstr: string = atob(arr[1]);
      let n: number = bstr.length;
      const u8arr: Uint8Array = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      cb(new Blob([u8arr], {type: mime}));

    };
    image.src = reader.result;
  };
}

/**
 * converts base64 encoded data to a Blob
 * @param {string} b64Image
 * @param {string} mimeType
 * @returns {Blob}
 */
export function b64ToBlob(b64Image: string, mimeType: string): Blob {
  const imgStr: string = atob(b64Image);
  const uiArr: Uint8Array = new Uint8Array(imgStr.length);

  for (let i = 0; i < imgStr.length; i++) {
    uiArr[i] = imgStr.charCodeAt(i);
  }

  return new Blob([uiArr], {type: mimeType});
}
