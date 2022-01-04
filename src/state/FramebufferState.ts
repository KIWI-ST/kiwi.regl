import { Limit } from "../core/Limit";
import { IStats } from "../util/createStats";
import { GTexture } from "../res/GTexture";
import { Extension } from "../core/Extension";
import { GAttachment } from "../res/GAttachment";
import { TextureState } from "./TextureState";
import { GRenderbuffer } from "../res/GRenderbuffer";
import { RenderbufferState } from "./RenderbufferState";
import { FRAMEBUFFER_SET, GFramebuffer } from "../res/GFramebuffer";
import { SRenderbufferColor, STextureComponent } from "../core/Support";

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
    static FRAMEBUFFER_SET: Map<number, GFramebuffer> = FRAMEBUFFER_SET;

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
    private current: GFramebuffer;

    /**
     * 
     */
    private next: GFramebuffer;

    /**
     * 
     */
    set Current(v: GFramebuffer) {
        this.current = v;
    }

    /**
     * 
     */
    get Current(): GFramebuffer {
        return this.current;
    }

    /**
     * 
     */
    set Next(v: GFramebuffer) {
        this.next = v;
    }

    /**
     * 
     */
    get Next(): GFramebuffer {
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
    ): GAttachment => {
        const gl = this.gl;
        if (opts.isTexture) {
            const texture = this.textureState.createTexture2D(
                UINT8EMPTY0,
                opts.w,
                opts.h,
                opts.c
            );
            //texutre.refCount = 0;
            return new GAttachment(gl, 'TEXTURE_2D', texture);
        }
        else {
            const rbo = this.renderbufferState.createRenderbuffer({
                w: opts.w,
                h: opts.h,
                format: opts.format || 'RGBA4'
            });
            // rbo.refCount = 0;
            return new GAttachment(gl, 'RENDERBUFFER', rbo);
        }
    }

    public createFramebuffer = (
        opts: {
            colors?: (GTexture | GRenderbuffer)[],
            depth?: GRenderbuffer,
            stencil?: GRenderbuffer,
            depthStencil?: GRenderbuffer
        }
    ): GFramebuffer => {
        const gl = this.gl;
        const fbo = new GFramebuffer(gl, this.limLib, this.stats);
        //1.colors
        const colorAttachments: GAttachment[] = [];
        opts.colors?.forEach((color: GTexture | GRenderbuffer) => {
            const TYPE = color instanceof GTexture ? 'TEXTURE_2D' : 'RENDERBUFFER';
            colorAttachments.push(new GAttachment(gl, TYPE, color));
        });
        //2.depth
        const depthAttachment: GAttachment = !opts.depth ? null : new GAttachment(gl, 'RENDERBUFFER', opts.depth);
        //3.stencil
        const stencilAttachment: GAttachment = !opts.stencil ? null : new GAttachment(gl, 'RENDERBUFFER', opts.stencil);
        //4.depthStencil
        const depthStencilAttachment: GAttachment = !opts.depthStencil ? null : new GAttachment(gl, 'RENDERBUFFER', opts.depthStencil);
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