import { Extension } from "../core/Extension";
import { Limit } from "../core/Limit";
import { SRenderbufferColor, STextureComponent } from "../core/Support";
import { REGLAttachment } from "../res/REGLAttachment";
import { FRAMEBUFFER_SET, REGLFramebuffer } from "../res/REGLFramebuffer";
import { REGLRenderbuffer } from "../res/REGLRenderbuffer";
import { REGLTexture } from "../res/REGLTexture";
import { IStats } from "../util/createStats";
import { RenderbufferState } from "./RenderbufferState";
import { TextureState } from "./TextureState";

/**
 * empty uint8array 
 */
const UINT8EMPTY0 = new Uint8Array(0);

/**
 * 
 */
class FramebufferState {
    /**
     * 
     */
    static FRAMEBUFFER_SET: Map<number, REGLFramebuffer> = FRAMEBUFFER_SET;

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private textureState: TextureState;

    /**
     * 
     */
    private renderbufferState: RenderbufferState;

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
     */
    private current: REGLFramebuffer;

    /**
     * 
     */
    private next: REGLFramebuffer;

    /**
     * 
     */
    set Current(v: REGLFramebuffer) {
        this.current = v;
    }

    /**
     * 
     */
    get Current(): REGLFramebuffer {
        return this.current;
    }

    /**
     * 
     */
    set Next(v: REGLFramebuffer) {
        this.next = v;
    }

    /**
     * 
     */
    get Next(): REGLFramebuffer {
        return this.next;
    }

    /**
     * 
     * @param gl 
     * @param textureState 
     * @param renderbufferState 
     * @param extLib 
     * @param limLib 
     * @param stats 
     */
    constructor(
        gl: WebGLRenderingContext,
        textureState: TextureState,
        renderbufferState: RenderbufferState,
        extLib: Extension,
        limLib: Limit,
        stats: IStats
    ) {
        this.gl = gl;
        this.textureState = textureState;
        this.renderbufferState = renderbufferState;
        this.extLib = extLib;
        this.limLib = limLib;
        this.stats = stats;
    }

    /**
     * 
     */
    private allocAttachment = (
        opts: {
            w: number,
            h: number,
            c: number,
            isTexture: boolean,
            format: SRenderbufferColor,
            component: STextureComponent
        }
    ): REGLAttachment => {
        const gl = this.gl;
        if (opts.isTexture) {
            const texture = this.textureState.createTexture2D(
                UINT8EMPTY0,
                opts.w,
                opts.h,
                opts.c
            );
            //texutre.refCount = 0;
            return new REGLAttachment(gl, 'TEXTURE_2D', texture);
        }
        else {
            const rbo = this.renderbufferState.createRenderbuffer({
                w: opts.w,
                h: opts.h,
                format: opts.format || 'RGBA4'
            });
            // rbo.refCount = 0;
            return new REGLAttachment(gl, 'RENDERBUFFER', rbo);
        }
    }

    public createFramebuffer = (
        opts: {
            colors?: (REGLTexture | REGLRenderbuffer)[],
            depth?: REGLRenderbuffer,
            stencil?: REGLRenderbuffer,
            depthStencil?: REGLRenderbuffer
        }
    ): REGLFramebuffer => {
        const gl = this.gl;
        const fbo = new REGLFramebuffer(gl, this.limLib, this.stats);
        //1.colors
        const colorAttachments: REGLAttachment[] = [];
        opts.colors?.forEach((color: REGLTexture | REGLRenderbuffer) => {
            const TYPE = color instanceof REGLTexture ? 'TEXTURE_2D' : 'RENDERBUFFER';
            colorAttachments.push(new REGLAttachment(gl, TYPE, color));
        });
        //2.depth
        const depthAttachment: REGLAttachment = !opts.depth ? null : new REGLAttachment(gl, 'RENDERBUFFER', opts.depth);
        //3.stencil
        const stencilAttachment: REGLAttachment = !opts.stencil ? null : new REGLAttachment(gl, 'RENDERBUFFER', opts.stencil);
        //4.depthStencil
        const depthStencilAttachment: REGLAttachment = !opts.depthStencil ? null : new REGLAttachment(gl, 'RENDERBUFFER', opts.depthStencil);
        //5.refresh attachment
        fbo.refreshAttachment({
            colorAttachments,
            depthAttachment,
            stencilAttachment,
            depthStencilAttachment
        });
        fbo.updateFramebuffer();
        return fbo;
    }
}

export { FramebufferState }