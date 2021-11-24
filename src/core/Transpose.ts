import { bufferPool0 } from "../pool/BufferPool";
import { ITexImage } from "../pool/TexImagePool";
import { toHalfFloat } from "../util/toHalfFloat";
import { TypedArrayFormat } from "./Format";
import { SComponent } from "./Support";


/**
 * }{debug
 * 图像矩阵偏移
 */
class Transpose {
    /**
     * 
     * @param image 
     * @param size 
     * @returns 
     */
    private static preConvert = (image: ITexImage, size: number): TypedArrayFormat => {
        const component: SComponent = (image.component === 'HALF_FLOAT_OES' ? 'FLOAT' : image.component) as SComponent;
        return bufferPool0.allocType(component, size);
    }

    /**
     * 
     * @param image 
     * @param data 
     */
    private static postConvert = (image: ITexImage, data: TypedArrayFormat): void => {
        if (image.component === 'HALF_FLOAT_OES') {
            image.data = toHalfFloat(data);
            bufferPool0.freeType(data);
        }
        else image.data = data;
    }

    /**
     * 
     * @param image 
     * @param arr 
     * @param sx stride x
     * @param sy stride y
     * @param sc stride channel
     * @param offset 
     */
    public static TransposeData = (image: ITexImage, arr: TypedArrayFormat, sx: number, sy: number, sc: number, offset: number): TypedArrayFormat => {
        if (!arr) return arr;
        const w = image.width, h = image.height, c = image.channels, size = w * h * c;
        const data = Transpose.preConvert(image, size);
        let p = 0;
        for (let i = 0; i < h; ++i)
            for (let j = 0; j < w; ++j)
                for (let k = 0; k < c; ++k)
                    data[p++] = arr[sx * j + sy * i + sc * k + offset];
        Transpose.postConvert(image, data);
    }
}

export { Transpose }