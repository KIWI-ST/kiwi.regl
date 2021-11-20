import { CMipmapHint } from "../core/Constant";
import { createTexFlag, ITexFlag } from "../util/createTexFlag";
import { ITexImage, texImagePool0 } from "./TexImagePool";

/**
 * 
 */
interface IMipmap extends ITexFlag {
    /**
     * 指代是否自动生成mipmap image
     */
    genMipmaps?: boolean;

    /**
     * mipmapHint
     * default 0x1100 = gl.DONT_CARE
     */
    mipmapHint?: number;

    /**
     * default 0
     */
    mipmask?: number;

    /**
     * TexImages
     * default Array(16)
     */
    images?: ITexImage[];
}

/**
 * 
 */
class MipmapPool {
    /**
     * 
     */
    private mipmapQueue: IMipmap[] = [];

    /**
     * 
     * @returns 
     */
    allocMipmap = (): IMipmap => {
        const mipmap: IMipmap = this.mipmapQueue.pop() || createTexFlag as IMipmap;
        mipmap.genMipmaps = false;
        mipmap.mipmapHint = CMipmapHint['DONT_CARE'];
        mipmap.mipmask = 0;
        mipmap.images = new Array(16);
        return mipmap;
    }

    /**
     * 
     * @param mipmap 
     */
    freeMipmap = (mipmap: IMipmap): void => {
        const texImages = mipmap.images;
        for (let i = 0, len = texImages.length; i < len; ++i) {
            const texImage = texImages[i];
            if (texImage) texImagePool0.freeImage(texImage);
            texImages[i] = null;
        }
        this.mipmapQueue.push(mipmap);
    }
}

const mipmapPool0 = new MipmapPool();

export {
    IMipmap,
    mipmapPool0
}