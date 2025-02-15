import { getExtend } from '../util/getExtendCopy';
import { bufferPool0 } from './BufferPool';
import { TypedArrayFormat } from './../core/Format';
import { ITexFlag, createTexFlag } from './../util/createTexFlag';

/**
 * Texture Image 属性设置
 */
interface ITexImage extends ITexFlag {
    /**
     * default 0
     */
    xOffset: number;

    /**
     * default 0
     */
    yOffset: number;

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView
     * default: Uint8Array
     */
    data: TypedArrayFormat;

    /**
     * 指示下一帧是否释放资源
     */
    neddsFree: boolean;

    /** 
     * 指示是否需要复制到下一framebuffer中
     */
    neddsCopy: boolean;
}

/**
 * create default TexImage setting
 * @returns 
 */
const createTexImage = (): ITexImage => {
    return {
        xOffset: 0,
        yOffset: 0,
        data: null,
        neddsCopy: false,
        neddsFree: false
    }
}

/**
 * 
 */
class TexImagePool {
    /**
     * 
     */
    private texImageQueue: ITexImage[] = [];

    /**
     * 
     * @returns 
     */
    allocImage = (): ITexImage => {
        if (this.texImageQueue.length > 0)
            return this.texImageQueue.pop();
        const A = createTexImage(), B = createTexFlag();
        return getExtend(A, B) as ITexImage;
    }

    /**
     * 
     * @param texImage 
     */
    freeImage = (texImage: ITexImage): void => {
        if (texImage.neddsFree) bufferPool0.free(texImage.data);
        getExtend(texImage, createTexImage());
        this.texImageQueue.push(texImage);
    }
}

/**
 * 
 */
const texImagePool0 = new TexImagePool();

export {
    type ITexImage,
    texImagePool0
}