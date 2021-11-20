import { IStats } from "../util/createStats";
import { Dispose } from "../core/Dispose";
import { SRenderbufferColor } from "../core/Support";
import { CRenderbufferColor } from "../core/Constant";

/**
 * RBO 资源集
 */
const RENDERBUFFER_SET: Map<number, REGLRenderbuffer> = new Map();

/**
 * @author axmand
 * @description
 * 1. renderbuffer是由应用程序分配的2d图像缓冲区，渲染缓冲可用于：
 * -分配和存储
 * -用于缓冲区对象FBO中的颜色、深度、或模板附件
 * 
 * 2.渲染缓冲器类似于提供可绘制的离屏窗口系统，例如pbuffer。但是渲染缓冲区不能直接用作webgl的纹理对象
 * -RBO和texture都可用被attach到fbo
 * -Color、Depth和Stencil提供附着点
 * -对FBO操作
 * 
 * 3.清理屏幕调用 gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT)彻底清理FBO附着类型
 * 
 */
class REGLRenderbuffer extends Dispose {
    /**
     * 
     */
    dispose(): void {
        const gl = this.gl;
        const handler = this.renderbuffer;
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.deleteRenderbuffer(handler);
        this.renderbuffer = null;
        this.refCount = 0;
        RENDERBUFFER_SET.delete(this.ID);
        this.stats.renderbufferCount--;
    }

    /**
     * 
     */
    decRef(): void {
        if (--this.refCount <= 0) this.dispose();
    }

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * actual webgl rbo
     */
    private renderbuffer: WebGLRenderbuffer;

    /**
     * RBO数据组织方式，如gl.RGBA4
     */
    private format: SRenderbufferColor;

    /**
     * RBO - pixel width
     */
    private width: number;

    /**
     * RBO - pixel height
     */
    private height: number;

    /**
     * global stats
     */
    private stats: IStats;

    /**
     * RBO - pixel width
     */
    get Width(): number {
        return this.width;
    }

    /**
     * RBO - pixel height
     */
    get Height(): number {
        return this.height;
    }

    /**
     * actual webgl rbo
     */
    get Renderbuffer(): WebGLRenderbuffer {
        return this.renderbuffer;
    }

    /**
     * 
     */
    get Format(): number {
        return CRenderbufferColor[this.format];
    }

    /**
     * 
     * @param gl 
     * @param width 
     * @param height 
     * @param format 
     * @param stats 
     */
    constructor(
        gl: WebGLRenderingContext,
        width: number,
        height: number,
        format: SRenderbufferColor,
        stats: IStats,
    ) {
        super();
        this.gl = gl;
        this.renderbuffer = gl.createRenderbuffer();
        this.format = format || 'RGBA4';
        this.width = width;
        this.height = height;
        this.stats = stats;
        this.stats.renderbufferCount++;
        RENDERBUFFER_SET.set(this.ID, this);
    }

    /**
     * 
     */
    public bind = (): void => {
        const gl = this.gl;
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, this.Format, this.width, this.height);
        this.refCount++;
    }
}

export { REGLRenderbuffer }