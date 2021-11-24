import { Extension } from "./Extension";
import { bufferPool0 } from './../pool/BufferPool';
import { CComponent, CTextureMapTarget } from './Constant';

/**
 * 各项异性过滤插件
 */
const MAX_TEXTURE_MAX_ANISOTROPY_EXT = 0x84FF;

/**
 * 多目标渲染
 */
const MAX_DRAW_BUFFERS_WEBGL = 0x8824;

/**
 * 延迟着色配套
 */
const MAX_COLOR_ATTACHMENTS_WEBGL = 0x8CDF;

/**
  * 版本信息汇总
  */
interface Info {
    /**
     * glsl language version
     */
    glsl?: number;

    /**
     * renderer version
     */
    renderer?: number;

    /**
     * 不同浏览器对插值有牵制prefix，vendor为插值前置变量
     */
    vendor?: string;

    /**
     * webgl 版本
     */
    version?: string;
}

/**
 * https://developer.mozila.org/zh-CN/docs/Web/API/WebGL_API/Constants
 * @author axmand
 * @description 读取设备限制信息
 */
class Limit {
    /**
     * 各项异性过滤，基于mipmap得扩展，用于优化在非正交视角下材质显示模糊得问题
     * 例如：通过三线性过滤，gl.LINEAR_MIPMAP_LINEAR 离相机越远得部分便来越来越模糊
     * 但是使用了各项异性过滤后，这些特殊场景下mipmap采样使图像更清晰
     */
    public maxAnisotropic: number = 1;

    /**
     * 多实例绘制
     */
    public maxDrawbuffers: number = 1;

    /**
     * 多实例绘制，支持的最大着色片段数量支持
     */
    public maxColorAttachments: number = 1;

    /**
     * 支持浮点型纹理（需要插件）
     */
    public readFloat: boolean = false;

    /**
     * 支持非2次幂分辨率纹理
     */
    public npotTextureCube: boolean = true;

    /**
     * draw buffer颜色深度，
     * 排序为：[red, green, bule, alpha]
     */
    public colorBits: number[] = new Array(4);

    /**
     * 深度纹理位
     */
    public depthBits: number;

    /**
     * 模板缓冲深度
     */
    public stencilBits: number;

    /**
     * debug}{ 还不清楚干啥用
     */
    public subpixelBits: number;

    /**
     * 点大小范围设置
     */
    public pointSizeDims: Float32Array;

    /**
     * 线宽设置范围
     */
    public lineWidthDims: Float32Array;

    /**
     * 视域取值范围
     */
    public maxViewportDims: Int32Array;

    /**
     * 设备支持的纹理分辨率上限
     */
    public maxTextureSize: number;

    /**
     * 可用纹理单元上限
     */
    public maxTextureUnits: number;

    /**
     * vertex shader中能使用的纹理单元上限
     */
    public maxVertexTextureUnits: number;

    /**
     * 可用纹理单元上限（vertex和fragment shader中可用纹理单元上限)
     */
    public maxCombineTextureUnits: number;

    /**
     * CUBE_MAP_TEXTURE_SIZE
     * 立方体纹理贴图分辨率支持上限
     */
    public maxCubeMapSize: number;

    /**
     * 支持的rbo最大分辨率
     */
    public maxRenderbufferSize: number;

    /**
     * 支持的顶点属性上限(attributes上限)
     * the maximum number of vertex attributes depends on the graphics card, and you can call
     * gl.getParameter(gl.MAX_VERTEX_ATTRIBS) to get this value
     * on high-end graphics cards, the maximum is 16, on lower-end graphics cards, the value will be lower.
     */
    public maxAttributes: number;

    /**
     * uniforms被空间顶点着色其和片段着色器分享，被分享在硬件存储常量值的空间中
     * 因此uniform的数量是受限的
     * 指示顶点着色其程序中的uniform数量上限
     */
    public maxVertexUniforms: number;

    /**
     * 片元着色器中Uniform可用数量上限
     */
    public maxFragmentUniforms: number;

    /**
     * 顶点着色器中varying变量数量上限
     */
    public maxVaryingVectors: number;

    /**
     * 支支持的texture compress压缩格式
     */
    public textureFormats: string[];

    /**
     * webgl 版本信息
     */
    public info: Info = {};

    constructor(
        gl: WebGLRenderingContext,
        extLib: Extension
    ) {
        /**
         * 发掘显卡支持的各项异性过滤能力
         * }{debug 开启后有性能损失
         */
        if (extLib.get('EXT_texture_filter_anisotropic'))
            this.maxAnisotropic = gl.getParameter(MAX_TEXTURE_MAX_ANISOTROPY_EXT);

        /**
         * 延迟着色, deferred shading
         * 支持多目标draw buffers, 例如
         * gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
         */
        if (extLib.get('WEBGL_draw_buffers')) {
            this.maxDrawbuffers = gl.getParameter(MAX_DRAW_BUFFERS_WEBGL);
            this.maxColorAttachments = gl.getParameter(MAX_COLOR_ATTACHMENTS_WEBGL);
        }

        /**
         * 浮点纹理测试
         */
        if (extLib.get('OES_texture_float')) {
            this.readFloat = true;
            const readFloatTexture = gl.createTexture();
            gl.bindTexture(CTextureMapTarget.TEXTURE_2D, readFloatTexture);
            gl.texImage2D(CTextureMapTarget.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, CComponent.FLOAT, null);
            const fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, CTextureMapTarget.TEXTURE_2D, readFloatTexture, 0);
            gl.bindTexture(CTextureMapTarget.TEXTURE_2D, null);
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
                this.readFloat = false;
            else {
                gl.viewport(0, 0, 1, 1);
                gl.clearColor(1.0, 0.0, 0.0, 1.0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                const pixels = bufferPool0.allocType('FLOAT', 4);
                gl.readPixels(0, 0, 1, 1, gl.RGBA, CComponent.FLOAT, pixels);
                if (gl.getError())
                    this.readFloat = false;
                else {
                    gl.deleteFramebuffer(fbo);
                    gl.deleteTexture(readFloatTexture);
                    this.readFloat = pixels[0] === 1.0;
                }
                bufferPool0.freeType(pixels);
            }
        }

        /**
         * detect non power of two cube textures support (IE doesn't support)
         */
        const cubeTexture = gl.createTexture();
        const data = bufferPool0.allocType('UNSIGNED_BYTE', 36);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(CTextureMapTarget.TEXTURE_CUBE_MAP, cubeTexture);
        gl.texImage2D(CTextureMapTarget.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 3, 3, 0, gl.RGBA, CComponent.UNSIGNED_BYTE, data);
        bufferPool0.freeType(data);
        gl.bindTexture(CTextureMapTarget.TEXTURE_CUBE_MAP, null);
        gl.deleteTexture(cubeTexture);
        this.npotTextureCube = !gl.getError();

        /**
         * color bits
         */
        this.colorBits.push(...[gl.getParameter(gl.RED_BITS), gl.getParameter(gl.GREEN_BITS), gl.getParameter(gl.BLUE_BITS), gl.getParameter(gl.ALPHA_BITS)]);

        /**
         * 深度缓冲
         */
        this.depthBits = gl.getParameter(gl.DEPTH_BITS);

        /**
         * 模板缓冲
         */
        this.stencilBits = gl.getParameter(gl.STENCIL_BITS);

        /**
         * point size 取值范围
         */
        this.pointSizeDims = gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE);

        /**
         * line width 取值范围
         */
        this.lineWidthDims = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);

        /**
         * 视域取值范围
         */
        this.maxViewportDims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);

        /**
         * 可纹理单元上限
         */
        this.maxCombineTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

        /**
         * 立方体纹理贴图分辨率上限
         */
        this.maxCubeMapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

        /**
         * RBO分辨率上限
         */
        this.maxRenderbufferSize = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE);

        /**
         * 纹理单元上限
         */
        this.maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

        /**
         * 设备支持的最大纹理分辨率
         */
        this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

        /**
         * 与显卡强相关，一般是16
         */
        this.maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

        /**
         * 指示顶点着色程序中可支持的uniform上限
         */
        this.maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);

        /**
         * 指示片元着色程序中可支持的uniform上限
         */
        this.maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

        /**
         * 顶点着色器中支持的纹理单元上限
         */
        this.maxVertexTextureUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);

        /**
         * 支持的varying矢量上限
         */
        this.maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);

        /**
         * glsl 版本
         */
        this.info.glsl = gl.getParameter(gl.SHADING_LANGUAGE_VERSION);

        /**
         * 浏览器prefix
         */
        this.info.vendor = gl.getParameter(gl.VENDOR);

        /**
         * webgl版本信息
         */
        this.info.version = gl.getParameter(gl.VERSION);

        /**
         * 渲染版本信息
         */
        this.info.renderer = gl.getParameter(gl.RENDERER);
    }
}

export { Limit }