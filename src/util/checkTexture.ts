import { check } from "./check";
import { Limit } from "../core/Limit";
import { IMipmap } from "../pool/MipmapPool";
import { ITexInfo } from "../res/GTexture";
import { Extension } from "../core/Extension";
import { isPowerOf2 } from "./isPowerOf2";
import { getPixelSize } from "./getPixelSize";
import { STextureColor, STextureComponent, STextureCompressed } from "../core/Support";
import { CTextureChannelCount, CTextureColor, CTextureCompressed } from "../core/Constant";

/**
 * 
 * @param opts 
 * @param extLib 
 * @param limLib 
 */
const checkTexture2D = (
    opts: {
        texColor?: STextureColor | STextureCompressed,
        inTexColor?: STextureColor | STextureCompressed,
        component?: STextureComponent,
        width?: number,
        height?: number,
        channels?: number,
        compressed?: boolean                                //默认不写入，根据texColor判断
    },
    extLib: Extension,
    limLib: Limit
): void => {
    opts.component = opts.component || 'BYTE';
    opts.width = opts.width || 1;
    opts.height = opts.height || 1;
    opts.texColor = opts.texColor || 'RGBA';
    opts.channels = opts.channels || CTextureChannelCount[CTextureColor[opts.texColor]];
    opts.compressed = CTextureCompressed[opts.texColor] ? true : false;
    check(opts.component === 'FLOAT' && extLib.get('OES_texture_float'), `CheckTexture2D error: 指定纹理类型需要启用OES_texture_float插件`);
    check(opts.component === 'HALF_FLOAT_OES' && extLib.get('OES_texture_float'), `CheckTexture2D error: 指定纹理类型需要启用OES_texture_float插件`)
    check((opts.component === 'UNSIGNED_SHORT' || opts.component === 'UNSIGNED_INT' || opts.component === 'UNSIGNED_INT_24_8_WEBGL') && extLib.get('WEBGL_depth_texture'), `CheckTexture2D error: 指定纹理类型需要启用WEBGL_depth_texture插件`)
    check(opts.channels > 0 && opts.channels <= 4, `CheckTexture2D error: 纹理通道数错误`);
    check(opts.width > 0 && opts.width <= limLib.maxTextureSize && opts.height > 0 && opts.height <= limLib.maxTextureSize, `CheckTexture2D error: 纹理分辨率错误，长或宽超过设备支持上限${limLib.maxTextureSize}`);
}

/**
 * 
 * @param texInfo 
 * @param mipData 
 * @param extLib 
 * @param limLib 
 */
const checkMipmapTexture2D = (
    texInfo: ITexInfo,
    mipData: IMipmap,
    extLib: Extension,
    limLib: Limit,
): void => {
    //1.检查分辨率信息
    const w = mipData.width, h = mipData.height, c = mipData.channels;
    check(w > 0 && w <= limLib.maxTextureSize && h > 0 && h <= limLib.maxTextureSize, `CheckTexture2D error: 纹理分辨率错误，长或宽超过设备支持上限${limLib.maxTextureSize}`);
    //2.检查纹理拉伸
    if (texInfo.wrapS !== 'CLAMP_TO_EDGE' || texInfo.wrapT !== 'CLAMP_TO_EDGE')
        check(isPowerOf2(w) && isPowerOf2(h), `CheckTexture2D error: 纹理模式非CLAMP时要求分辨率为2的幂`)
    //3.检查mipmap信息
    if (mipData.mipmask === 1) {
        if (w !== 1 && h !== 1)
            check(texInfo.minFilter !== 'LINEAR_MIPMAP_LINEAR' && texInfo.minFilter !== 'LINEAR_MIPMAP_NEAREST' && texInfo.minFilter !== 'NEAREST_MIPMAP_LINEAR' && texInfo.minFilter !== 'NEAREST_MIPMAP_NEAREST', `CheckTexture2D error: min filter必须是mimap类型`);
    }
    else {
        check(isPowerOf2(w) && isPowerOf2(h), `CheckTexture2D error:纹理模式非CLAMP时要求分辨率为2的幂`);
        check(mipData.mipmask === (w << 1) - 1, `CheckTexture2D error:丢失/不合法的mipmask`)
    }
    //4.数据类型检查
    if(mipData.component === 'FLOAT'){
        check(extLib.get('OES_texture_float'), `CheckTexture2D error: FLOAT类型纹理需要开启OES_texture_float`);
        check((texInfo.minFilter!=='NEAREST' || texInfo.magFilter !== 'NEAREST') && extLib.get('OES_texture_float_linear'), `CheckTexture2D error: filter 不支持非NEAREST插值，需开启OES_texture_float_linear`);
        check(!texInfo.genMipmaps, `CheckTexture2D error: mipmap生成不支持float纹理类型`);
    }
    //5.检查图片是否处理完成
    for(let i=0;i<16;++i){
        const mipimg = mipData.images[i];
        if(mipimg){
            const mw = w>>i, mh = h>>i;
            check(mipData.mipmask & (1<<i), `CheckTexture2D error: mipmap数据缺失`);
            check(mipimg.width === mw && mipimg.height === mh, `CheckTexture2D error: 错误的mipmap images shape信息`);
            check(mipimg.texColor === mipData.texColor && mipimg.inTexColor === mipData.inTexColor && mipimg.component ===mipData.component, `CheckTexture2D error: 不合适的mipmap image数据类型`);
            //compressed
            if(mipimg.compressed){
                //check size for compressed images
            }  
            else if(mipimg.data){
                const rowSize = Math.ceil(getPixelSize(mipimg.component, c)*mw/mipimg.unpackAlignment)*mipimg.unpackAlignment;
                check(mipimg.data.byteLength === rowSize*mh, `CheckTexture2D error: 数据缓冲的大小与image格式对应的数据长度不一致`);
            }
        }
    }
    //6.检查压缩纹理
    if(mipData.compressed)
        check(!mipData.genMipmaps, `CheckTexture2D error: 纹理压缩格式不支持生成mipmap`);
}

export {
    checkTexture2D,
    checkMipmapTexture2D
}