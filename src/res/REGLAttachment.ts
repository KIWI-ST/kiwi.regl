import { Dispose } from "../core/Dispose";
import { REGLTexture } from "./REGLTexture";
import { REGLRenderbuffer } from './REGLRenderbuffer';
import { SAttachmentTarget } from "../core/Support";
import { CAttachmentTarget } from "../core/Constant";

/**
 * @author axmand
 */
class REGLAttachment extends Dispose {
    /**
     * 
     */
    dispose(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 
     */
    decRef(): void {
        if (--this.refCount <= 0)
            this.dispose();
    }

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private reglTexture: REGLTexture;

    /**
     * 
     */
    private reglRenderbuffer: REGLRenderbuffer;

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
    private target: number;

    /**
     * 
     */
    get Texture(): REGLTexture {
        return this.reglTexture;
    }

    constructor(
        gl: WebGLRenderingContext,
        target: SAttachmentTarget,
        attach: REGLTexture | REGLRenderbuffer
    ) {
        super();
        this.gl = gl;
        this.target = CAttachmentTarget[target || 'TEXTURE_2D'] || 0;
        if (attach instanceof REGLTexture)
            this.reglTexture = attach;
        else if (attach instanceof REGLRenderbuffer)
            this.reglRenderbuffer = attach;
        this.width = this.reglTexture?.Width || this.reglRenderbuffer?.Width || 0;
        this.height = this.reglTexture?.Height || this.reglRenderbuffer?.Height || 0;
    }

    /**
     * 
     * @param location 
     */
    public attach = (location: number): void => {
        const gl = this.gl;
        if (this.reglTexture) gl.framebufferTexture2D(gl.FRAMEBUFFER, location, this.target, this.reglTexture.Texutre, 0);
        else gl.framebufferRenderbuffer(gl.FRAMEBUFFER, location, this.target, this.reglRenderbuffer.Renderbuffer);
    }
}

export {
    REGLAttachment
}