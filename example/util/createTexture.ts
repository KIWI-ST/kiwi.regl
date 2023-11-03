/**
 * 获取远程图片地址，生成RGBA格式uint8Array
 * @param uri 
 * @param key 
 * @returns 
 */
const fetchTexture = (uri: string, key: string = ``): Promise<{ buf: Uint8Array, w: number, h: number, c: number, key: string }> => {
    return new Promise((resolve, reject) => {
        fetch(uri).then((res0: Response) => res0.blob()).then((blob: Blob) => createImageBitmap(blob))
            .then((bitmap: ImageBitmap) => {
                const w = bitmap.width, h = bitmap.height, c = 4;
                const CANVAS = document.createElement('canvas');
                CANVAS.width = devicePixelRatio * w;
                CANVAS.height = devicePixelRatio * h;
                CANVAS.style.width = `${w}px`;
                CANVAS.style.height = `${h}px`;
                const CTX = CANVAS.getContext('2d');
                CTX.drawImage(bitmap, 0, 0);
                const uc8arr = CTX.getImageData(0, 0, w, h).data;
                const buf = new Uint8Array(uc8arr);
                resolve({ buf, w, h, c, key });
            })
            .catch(reason => {
                reject(reason);
            });
    });
}

export { 
    fetchTexture 
}