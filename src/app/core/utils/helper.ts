/**
 * converts base64 encoded data to a Blob
 * @param {string} b64Image
 * @param {string} mimeType
 * @returns {Blob}
 */
export function b64ToBlob(b64Image: string, mimeType: string): Blob {
  const imgStr: string = atob(b64Image.split(',')[1]);
  const uiArr: Uint8Array = new Uint8Array(imgStr.length);

  for (let i = 0; i < imgStr.length; i++) {
    uiArr[i] = imgStr.charCodeAt(i);
  }

  return new Blob([uiArr], {type: mimeType});
}

/**
 * converts Blob to File
 * @param {Blob} blob
 * @param {fileName} string
 * @returns {File}
 */
export function  blobToFile(blob: Blob, fileName: string): File {
  const b: any = blob;
  b.name = fileName;

  return <File>blob;
}

/**
 * check if the user is navigating with a mobile browser
 * NOTE: can be enhanced with more precise detection
 * @returns {boolean}
 */
export function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * checks if locale is supported
 * @returns {boolean}
 */
export function getLocaleSupport(): boolean {
  let localeSupport = false;
  try {
    'foo'.localeCompare('bar', 'i');
  } catch (e) {
    // only in this case are the locale parameters supported!
    // tslint:disable-next-line:max-line-length
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare#Check_browser_support_for_extended_arguments
    if (e.name === 'RangeError') {
      localeSupport = true;
    }
  }
  return localeSupport;
}
