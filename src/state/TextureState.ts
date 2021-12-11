import { check } from "../util/check";
import { Limit } from "../core/Limit";
import { IStats } from "../util/createStats";
import { getCopy } from "../util/getExtendCopy";
import { ITexFlag } from "../util/createTexFlag";
import { Extension } from "../core/Extension";
import { Transpose } from "../core/Transpose";
import { detectComponent } from "../util/detectComponent";
import { TypedArrayFormat } from "../core/Format";
import { checkMipmapTexture2D } from "../util/checkTexture";
import { IMipmap, mipmapPool0 } from "../pool/MipmapPool";
import { ITexImage, texImagePool0 } from "../pool/TexImagePool";
import { ITexInfo, GTexture, TEXTURE_SET } from "../res/GTexture";
import { SMipmapHint, STextureFillTarget, STextureMAGFilter, STextureMapTarget, STextureMINFilter } from "../core/Support";
import { CColorSpace, CMipmapHint, CTextureColor, CTextureComponent, CTextureFillTarget, CTextureMAGFilter, CTextureMapTarget, CTextureMINFilter } from "../core/Constant";

/**
 * Int8Array:       // 8为有符号整数，长度1个字节
 * Uint8Array:      // 8，1
 * Int16Array:      // 16，2
 * Uint16Array:     // 16，2
 * Int32Array:      // 32，4
 * Uint32Array:     // 32，4
 * Float32Array:    // 32，4
 * Float64Array:    // 64，8
 * BYTES_PRE_ELEMENT 得到的占用字节数
 */
const GL_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FE;

/**
 * 
 */
const CHANNEL_TEX_COLOR = {
    1: 'LUMINANCE',
    2: 'LUMINANCE_ALPHA',
    3: 'RGB',
    4: 'RGBA'
};

/**
 * 
 */
class TextureState {
    /**
     * 
     */
    static TEXTURE_SET: Map<number, GTexture> = TEXTURE_SET;

    /**
     * 
     */
    static MIPMAP_FILTERS: number[] = [0x2700, 0x2702, 0x2701, 0x2703];

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private extLib: Extension;

    /**
     * 
     */
    private limLib: Limit;

    /**
     * 
     */
    private stats: IStats;

    /**
     * 
     * @param gl 
     * @param extLib 
     * @param limLib 
     * @param stats 
     */
    constructor(
        gl: WebGLRenderingContext,
        extLib: Extension,
        limLib: Limit,
        stats: IStats
    ) {
        this.gl = gl;
        this.extLib = extLib;
        this.limLib = limLib;
        this.stats = stats;
    }

    /**
     * 
     * @param info 
     * @param target 
     * @param mipLevel 
     */
    private setImage = (info: ITexImage, target: STextureMapTarget, mipLevel: number): void => {
        const gl = this.gl,
            data = info.data,
            inTexColor = info.inTexColor,
            texColor = info.texColor,
            component = info.component,
            width = info.width,
            height = info.height,
            target0 = CTextureMapTarget[target];
        if (info.compressed) {
            gl.compressedTexImage2D(
                target0,
                mipLevel,
                CTextureColor[inTexColor],
                width,
                height,
                0,
                data || null);
        }
        else if (info.neddsCopy) {
            gl.copyTexImage2D(
                target0,
                mipLevel,
                CTextureColor[texColor],
                info.xOffset,
                info.yOffset,
                width,
                height,
                0);
        }
        else {
            gl.texImage2D(
                target0,
                mipLevel,
                CTextureColor[inTexColor],
                width,
                height,
                0,
                CTextureColor[texColor],
                CTextureComponent[component],
                data || null);
        }
    }

    /**
     * 
     * @param mimap 
     * @param target 
     * @returns 
     */
    private setMipmap = (mimap: IMipmap, target: STextureMapTarget): void => {
        const images = mimap.images;
        for (let i = 0, len = images.length; i < len; i++) {
            const image = images[i];
            if (!image) return;
            this.setImage(image, target, i);
        }
    }

    /**
     * 设置texture flags
     * http://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixlelStorei
     * @param flags 
     */
    private setTexFlags = (flags: ITexFlag): void => {
        const gl = this.gl;
        //Y轴翻转，flas表示不翻转
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flags.flipY);
        //预乘alpha通道
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, flags.premultiplyAlpha);
        //指示浏览器应用色彩空间转换
        gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, CColorSpace[flags.colorSpace]);
        //应对gl.DrawPixel设置，考虑效率要求drawPixel字节对齐
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, flags.unpackAlignment);
    }

    /**
     * 
     * @param info 
     * @param target GLEnum, Texture2D
     */
    private setTexInfo = (info: ITexInfo, target: STextureMapTarget): void => {
        const extLib = this.extLib, gl = this.gl, target0 = CTextureMapTarget[target];
        if (info.minFilter) gl.texParameteri(target0, gl.TEXTURE_MIN_FILTER, CTextureMINFilter[info.minFilter]);
        if (info.magFilter) gl.texParameteri(target0, gl.TEXTURE_MAG_FILTER, CTextureMAGFilter[info.magFilter]);
        if (info.wrapS) gl.texParameteri(target0, gl.TEXTURE_WRAP_S, CTextureFillTarget[info.wrapS]);
        if (info.wrapT) gl.texParameteri(target0, gl.TEXTURE_WRAP_T, CTextureFillTarget[info.wrapT]);
        if (info.anisotropic && extLib.get('EXT_texture_filter_anisotropic'))
            gl.texParameteri(target0, GL_TEXTURE_MAX_ANISOTROPY_EXT, info.anisotropic);
        if (info.genMipmaps) {
            gl.hint(gl.GENERATE_MIPMAP_HINT, info.mimmapHint);
            gl.generateMipmap(target0);
        }
    }

    /**
     * 
     * @param opts 
     */
    private fixTexInfo = (
        opts: {
            min?: STextureMINFilter,
            mag?: STextureMAGFilter,
            wrapS?: STextureFillTarget,
            wrapT?: STextureFillTarget,
            mipmap?: SMipmapHint,
            anisotropic?: 1 | 2 | 3,
            // faces?:any[]
        }
    ): ITexInfo => {
        const texInfo: ITexInfo = {
            minFilter: 'NEAREST',
            magFilter: 'NEAREST',
            wrapS: 'CLAMP_TO_EDGE',
            wrapT: 'CLAMP_TO_EDGE',
            anisotropic: 1,
            genMipmaps: false,
            mimmapHint: CMipmapHint['DONT_CARE']
        };
        //1.min filter type
        if (opts.min) {
            texInfo.minFilter = opts.min;
            //}{debugs faces 尚未支持
            if (TextureState.MIPMAP_FILTERS.indexOf(CTextureMINFilter[texInfo.minFilter]) >= 0)
                texInfo.genMipmaps = true;
        }
        //2.mag filter type
        if (opts.mag) {
            texInfo.magFilter = opts.mag;
        }
        //3.wrapS
        if (opts.wrapS) {
            texInfo.wrapS = opts.wrapS;
        }
        //4.warpT
        if (opts.wrapT) {
            texInfo.wrapT = opts.wrapT;
        }
        //5.各项异性过滤检查
        if (opts.anisotropic) {
            const num = opts.anisotropic;
            check(num >= 1 && num <= this.limLib.maxAnisotropic, `TextureState error: 各项异性过滤不在可用范围[${1}, ${this.limLib.maxAnisotropic}]`);
            texInfo.anisotropic = num;
        }
        //6.记录mipmap.minFilter
        if (opts.mipmap && !opts.min)
            texInfo.minFilter = 'NEAREST_MIPMAP_NEAREST'; // MIPMAP_FILTERS[0]吗，默认0x2700
        //7.返回texInfo对象
        return texInfo;
    }

    /**
     * 
     * @param mipmap 
     * @param arr 
     * @param shape 
     * @param stride 
     * @param offset 
     * @returns 
     */
    private fixMipmap = (mipmap: IMipmap, arr: TypedArrayFormat, shape: number[], stride: number[], offset: number): IMipmap => {
        const imageData = mipmap.images[0] = texImagePool0.allocImage();
        getCopy(imageData, mipmap);
        check(!imageData.compressed || arr instanceof Uint8Array, `TextureState error: 压缩纹理必须以Uint8Array格式传输`);
        imageData.component = mipmap.component = detectComponent(arr);
        const w = shape[0], h = shape[1], c = shape[2];
        imageData.width = w;
        imageData.height = h;
        imageData.channels = c;
        imageData.texColor = imageData.inTexColor = CHANNEL_TEX_COLOR[c];
        imageData.neddsFree = true;
        Transpose.TransposeData(imageData, arr, stride[0], stride[1], stride[2], offset);
        getCopy(mipmap, mipmap.images[0]);
        return mipmap;
    }

    /**
     * 
     * @param data 
     * @param w 
     * @param h 
     * @param c 
     * @param stride 
     * @param offset 
     * @param opts 
     * @returns 
     */
    public createTexture2D = (
        data: TypedArrayFormat,
        w: number,
        h: number,
        c: number,
        opts: {
            stride?: number[],
            offset?: number,
            min?: STextureMINFilter,             //minFilter
            mag?: STextureMAGFilter,             //magFilter
            wrapS?: STextureFillTarget,          //wrapS
            wrapT?: STextureFillTarget,          //wrapT
            mipmap?: SMipmapHint,                 //mipmap采样方式
            anisotropic?: 1 | 2 | 3,                 //各项异性过滤
        } = {}
    ): GTexture => {
        const gl = this.gl;
        const offset: number = opts.offset || 0;
        const stride: number[] = opts.stride || [0, 0, 0];
        //parse options to get reglTexInfo
        const reglTexture = new GTexture(gl, this.limLib, 'TEXTURE_2D', this.stats);
        //1.texInfo
        const texInfo = this.fixTexInfo(opts);
        reglTexture.TexInfo = texInfo;
        //2.build mipdata by width/height
        const mipmap = mipmapPool0.allocMipmap();
        const imageData = mipmap.images[0] = texImagePool0.allocImage();
        mipmap.mipmask = 1;
        imageData.width = mipmap.width = w;
        imageData.height = mipmap.height = h;
        imageData.channels = mipmap.channels = c || 4;
        //3.自动配置stride, 指定纹理扫描线size，默认size=1
        if (stride[0] === 0 && stride[1] === 0 && stride[2] === 0) {
            stride[0] = imageData.channels;
            stride[1] = imageData.channels * imageData.width;
            stride[2] = 1;
        }
        check(imageData.channels >= 1 && imageData.channels <= 4, `TextureState error: 纹理通道必须在1-4之间`);
        if (reglTexture.TexInfo.genMipmaps)
            mipmap.mipmask = (mipmap.width << 1) - 1;
        //4.缓存gl.flags相关信息， copyFlags
        reglTexture.TexFlag = mipmap as ITexFlag;
        //5.解析data
        reglTexture.Mipmap = this.fixMipmap(mipmap, data, [imageData.width, imageData.height, imageData.channels], stride, offset);
        //6.check texture2d
        checkMipmapTexture2D(texInfo, mipmap, this.extLib, this.limLib);
        if (texInfo.genMipmaps)
            reglTexture.Mipmap.mipmask = (mipmap.width << 1) - 1;
        //7.纹理绑定
        reglTexture.tempBind();
        this.setMipmap(reglTexture.Mipmap, 'TEXTURE_2D');
        this.setTexInfo(reglTexture.TexInfo, 'TEXTURE_2D');
        reglTexture.tempRestore();
        mipmapPool0.freeMipmap(mipmap);
        return reglTexture;
    }

    /**
     * 待补充
    //  */
    // public createTextureCube = () => {

    // }
}

export { TextureState }