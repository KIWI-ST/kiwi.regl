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
    private gTexture: GTexture;

    /**
     * 
     */
    private gRenderbuffer: GRenderbuffer;

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
        return this.gTexture;
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
            this.gTexture = attach;
        else if (attach instanceof GRenderbuffer)
            this.gRenderbuffer = attach;
        this.width = this.gTexture?.Width || this.gRenderbuffer?.Width || 0;
        this.height = this.gTexture?.Height || this.gRenderbuffer?.Height || 0;
    }

    /**
     * 
     * @param location 
     */
    public attach = (location: number, textureTarget: number = -1): void => {
        const gl = this.gl, target = textureTarget === -1 ? this.target : textureTarget;
        if (this.gTexture)
            gl.framebufferTexture2D(gl.FRAMEBUFFER, location, target, this.gTexture.Texutre, 0);
        else
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, location, target, this.gRenderbuffer.Renderbuffer);
    }
}

export { GAttachment }