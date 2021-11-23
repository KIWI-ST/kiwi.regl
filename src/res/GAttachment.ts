import { Dispose } from "../core/Dispose";
import { GTexture } from "./GTexture";
import { GRenderbuffer } from './GRenderbuffer';
import { SAttachmentTarget } from "../core/Support";
import { CAttachmentTarget } from "../core/Constant";

/**
 * @author axmand
 */
class GAttachment extends Dispose {
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
    private reglTexture: GTexture;

    /**
     * 
     */
    private reglRenderbuffer: GRenderbuffer;

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
    get Texture(): GTexture {
        return this.reglTexture;
    }

    /**
     * 
     * @param gl 
     * @param target 
     * @param attach 
     */
    constructor(
        gl: WebGLRenderingContext,
        target: SAttachmentTarget,
        attach: GTexture | GRenderbuffer
    ) {
        super();
        this.gl = gl;
        this.target = CAttachmentTarget[target || 'TEXTURE_2D'] || 0;
        if (attach instanceof GTexture)
            this.reglTexture = attach;
        else if (attach instanceof GRenderbuffer)
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
        if (this.reglTexture) 
            gl.framebufferTexture2D(gl.FRAMEBUFFER, location, this.target, this.reglTexture.Texutre, 0);
        else 
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, location, this.target, this.reglRenderbuffer.Renderbuffer);
    }
}

export { GAttachment }