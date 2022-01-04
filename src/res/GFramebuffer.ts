import { Limit } from "../core/Limit";
import { check } from "../util/check";
import { IStats } from "../util/createStats";
import { Dispose } from "../core/Dispose";
import { GAttachment } from "./GAttachment";

/**
 * 
 */
const COLOR_ATTACHMENT0_WEBGL = 0x8CE0;

/**
 * 
 */
const TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515;

/**
 * 全局FBO资源统计
 */
const FRAMEBUFFER_SET: Map<number, GFramebuffer> = new Map();

/**
 * @author axmand
 * @description
 * - Framebuffer对象实际上不是缓冲区，而是包含一个或多个附件的WebGL对象，
 * 而这些附件是实际的缓冲区，可用把Framebuffer理解为C语言的结构体，其中
 * 每个成员都是指向缓冲区的指针
 * 
 * -Framebuffer对象占用空间非常小，链接到Framebuffer的每个缓冲区可以是RBO
 * 或texture
 * 
 * -Renderbuffer是实际缓冲区（可存储字节数组、整数、像素）。RBO以原生格式
 * 存储像素值，因此针对屏幕外渲染进行了优化。也就是说绘制到RBO比绘制到纹理
 * 快得多。缺点是像素使用原生格式依赖于实现的格式，因此RBO的去读比纹理要困难
 * 
 * -一旦绘制了RBO，就可以使用像素传输操作将其内容直接复制到屏幕，即基于RBO的
 * 双缓冲技术
 * 
 * -RBO是一个相对较新的概念，在此值钱FBO用于渲染到texture，由于纹理使用标准
 * 因此写入可能较慢，当然依然可以使用FBO渲染到纹理，当需要在像素上执行多次传递以
 * 构建场景，或在一个场景的表面上绘制场景时，是十分有用的
 */
class GFramebuffer extends Dispose {
    /**
     * 
     */
    dispose(): void {
        const gl = this.gl;
        check(this.framebuffer, `REGLFramebuffer 错误: 请不要重复清理FBO`);
        gl.deleteFramebuffer(this.framebuffer);
        this.framebuffer = null;
        this.stats.framebufferCount--;
        FRAMEBUFFER_SET.delete(this.ID);
    }

    /**
     * 
     */
    decRef(): void {
        this.colorAttachments?.forEach((attachment) => {
            attachment.decRef();
        });
        this.depthAttachment.decRef();
        this.stencilAttachment.decRef();
        this.depthStencilAttachment.decRef();
        if (--this.refCount <= 0) this.dispose();
    }

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 普通texture2d下framebuffer对象
     */
    private framebuffer: WebGLFramebuffer;

    /**
     * cube map framebuffer
     */
    private framebufferCube: WebGLFramebuffer[];

    /**
     * 
     */
    private width: number;

    /**
     * 
     */
    private height: number;

    /**
     * 
     */
    private colorAttachments: GAttachment[] = [];


    /**
     * 
     */
    private colorDrawbuffers: number[];

    /**
     * 
     */
    private depthAttachment: GAttachment = null;

    /**
     * 
     */
    private stencilAttachment: GAttachment = null;

    /**
     * 
     */
    private depthStencilAttachment: GAttachment = null;

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
     */
    get ColorAttachments(): GAttachment[] {
        return this.colorAttachments;
    }

    /**
     * 
     */
    get ColorDrawbuffers(): number[] {
        return this.colorDrawbuffers;
    }

    /**
     * 判断framebuffer的colorattachment是否是cubemap
     */
    get IsCubeMapAttachment(): boolean {
        return this.colorAttachments[0]?.Texture.IsCubeTexture;
    }

    /**
     * 兼容cube map形式，统一使用FBO
     */
    get FBO(): WebGLFramebuffer[] {
        return this.IsCubeMapAttachment ? this.framebufferCube : [this.framebuffer];
    }

    /**
     * 
     * @param gl 
     * @param limLib 
     * @param stats 
     */
    constructor(
        gl: WebGLRenderingContext,
        limLib: Limit,
        stats: IStats
    ) {
        super();
        this.gl = gl;
        this.framebuffer = gl.createFramebuffer();
        this.width = 0;
        this.height = 0;
        this.limLib = limLib;
        this.stats = stats;
        //全局统计fbo计数
        this.stats.framebufferCount++;
        FRAMEBUFFER_SET.set(this.ID, this);
    }

    /**
     * 
     * @param opts 
     */
    public refreshAttachment = (
        opts: {
            colorAttachments: GAttachment[],
            depthAttachment?: GAttachment,
            stencilAttachment?: GAttachment,
            depthStencilAttachment?: GAttachment
        }
    ) => {
        this.colorDrawbuffers = [];
        this.colorAttachments = opts.colorAttachments;
        this.depthAttachment = opts.depthAttachment;
        this.stencilAttachment = opts.stencilAttachment;
        this.depthStencilAttachment = opts.depthStencilAttachment;
        this.colorAttachments.forEach((attachment, index) => this.colorDrawbuffers.push(COLOR_ATTACHMENT0_WEBGL + index));
    }

    /**
     * 
     */
    public bind = (target:number = 0): void => {
        if(!this.IsCubeMapAttachment){
            check(target === 0, `GFramebuffer Error: 非cube map FBO时只允许绑定0号fbo。`);
            this.refCount++;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        }
        else{
            check(target >= 0&&target<6, `GFramebuffer Error: cube map FBO只允许绑定0-5号FBO。`);
            this.refCount++;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebufferCube[target]);
        }
    }

    /**
     * 
     */
    public unbind = (): void => {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    /**
     * 
     * @param gl 
     */
    private updateStencilDetphBuffer = (gl: WebGLRenderingContext) => {
        for (let i = this.colorAttachments.length; i < this.limLib.maxColorAttachments; ++i) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, null, 0);
        }
        //depth attachment
        if (this.depthAttachment) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, null, 0);
            this.depthAttachment.attach(gl.DEPTH_ATTACHMENT);
        }
        //stencil attachment
        if (this.stencilAttachment) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.STENCIL_ATTACHMENT, gl.TEXTURE_2D, null, 0);
            this.depthAttachment.attach(gl.STENCIL_ATTACHMENT);
        }
        //depth stencil attachment
        if (this.depthStencilAttachment) {
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, null, 0);
            this.depthAttachment.attach(gl.DEPTH_STENCIL_ATTACHMENT);
        }
    }

    /**
     * 
     * @param gl 
     */
    private chechFramebufferStatus = (gl: WebGLRenderingContext) => {
        //check fbo status
        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        check(!gl.isContextLost() && status === gl.FRAMEBUFFER_COMPLETE, `GFramebuffer 错误: 错误码${status}`);
        //不再需要fbo更新
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        //get error为0表示无错误
        const ERROR = gl.getError();
        check(ERROR === gl.NO_ERROR, `GFramebuffer 错误: gl上下文错误, 错误码 ${ERROR}`);
        check(ERROR !== gl.INVALID_ENUM, `GFramebuffer 错误: 请检查是否使用了多个颜色附件，多颜色附件必须开启插件WEBGL_draw_buffers`);
    }

    /**
     * 错误码参考：
     * https://neslib.github.io/Ooogles.Net/html/0e1349ae-da69-6e5e-edd6-edd8523101f8.htm
     */
    public updateFramebuffer = (): void => {
        const gl = this.gl;
        if (!this.IsCubeMapAttachment) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            //color attchment
            this.colorAttachments?.forEach((colorAttachment: GAttachment, i: number) => {
                colorAttachment.attach(gl.COLOR_ATTACHMENT0 + i);
            });
            this.updateStencilDetphBuffer(gl);
            this.chechFramebufferStatus(gl);
        }
        else {
            //针对cubemap需要遍历6次
            check(this.colorAttachments.length === 1, `GFramebuffer Error: cube map贴图时仅支持colorAttachment0为cube map Attachment`);
            const cubeAttachment = this.colorAttachments[0];
            this.framebufferCube = [gl.createFramebuffer(),gl.createFramebuffer(),gl.createFramebuffer(),gl.createFramebuffer(),gl.createFramebuffer(),gl.createFramebuffer()];
            this.framebufferCube.forEach((fb, i: number) => {
                gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
                cubeAttachment.attach(gl.COLOR_ATTACHMENT0, TEXTURE_CUBE_MAP_POSITIVE_X + i);
                this.updateStencilDetphBuffer(gl);
                this.chechFramebufferStatus(gl);
            });
        }
    }
}

export {
    FRAMEBUFFER_SET,
    GFramebuffer,
}