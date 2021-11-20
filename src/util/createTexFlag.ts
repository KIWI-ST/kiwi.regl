import { SColorSpace, STextureColor, STextureComponent, STextureCompressed } from "../core/Support";

/**
 * 纹理超参数
 * -描述纹理texture源数据信息，包括数据格式、类型等
 */
interface ITexFlag {
    /**
     * 目标纹理输出类型（输出转换）
     * 默认值：gl.RGBA
     */
    texColor?: STextureColor | STextureCompressed,

    /**
     * 输入文件纹理数据类型
     * 默认值：gl.RGBA
     */
    inTexColor?: STextureColor | STextureCompressed,

    /**
     * 纹理数据类型
     * 默认值：gl.BYTE
     */
    component?: STextureComponent,

    /**
     * 指示纹理是否压缩
     * 不需要显式指定，自动根据输入输出格式判断
     */
    compressed?: boolean,

    /**
     * 预乘alpha，告诉gl上下文该纹理的颜色值已预先乘过alpha通道值
     * 进行后续blending操作时，RGB无需再与alpha通道相乘
     * 用处1：提高一些效率，减少一次乘法
     * 用处2：应用透明度相乘后的颜色做线性插值时，颜色更符合直觉
     * https://segmentfault.com/a/1190000002990030
     * 默认值：false
     */
    premultiplyAlpha?: boolean,

    /**
     * Y轴翻转,标识纹理坐标Y是否翻转
     * 默认值：false
     * 0-------- 1.0               1.0
     * |                           |
     * |                           |
     * |                           |-------- 1.0
     * 1.0                         0
     *              翻转后
     */
    flipY?: boolean;

    /**
     * 应对gl.DrawPixel设置，考虑效率
     * 要求drawPixel时每一行byte大小（读取像素纹理方式）
     */
    unpackAlignment?: 1 | 2 | 4 | 8,

    /**
     * GL_BROWSER_DEFAULT_WEBGL
     * 指示WebGL是否允许浏览器应用色彩空间转换
     * 默认值：gl.NONE
     */
    colorSpace?: SColorSpace,

    /**
     * shape - width
     */
    width?: number,

    /**
     * shape -height
     */
    height?: number,

    /**
     * shape - channel 通道数量
     * 支持数量<=4 (RGBA)
     */
    channels?: number
}

/**
 * 构造默认texture超参数，描述纹理信息
 */
const createTexFlag = (): ITexFlag => {
    const texFlags: ITexFlag = {
        inTexColor: 'RGBA',
        texColor: 'RGBA',
        component: 'UNSIGNED_BYTE',
        compressed: false,
        premultiplyAlpha: false,                //未进行alpha通道压缩
        flipY: false,
        unpackAlignment: 1,                     //字节对齐
        colorSpace: 'BROWSER_DEFAULT_WEBGL',    //0x9244, 支持浏览器色彩空间转换
        width: 0,                               //默认纹理宽度0像素
        height: 0,                              //默认纹理高度0像素
        channels: 0                             //默认纹理深度0
    }
    return texFlags
}

export { 
    ITexFlag,
    createTexFlag 
}