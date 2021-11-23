
import { Extension } from "../core/Extension";
import { Limit } from "../core/Limit";
import { SRenderbufferColor } from "../core/Support";
import { GRenderbuffer, RENDERBUFFER_SET } from "../res/GRenderbuffer";
import { check } from "../util/check";
import { IStats } from "../util/createStats";

/**
 * @author axmand
 */
class RenderbufferState {

    /**
     * 
     */
    static RENDERBUFFER_SET: Map<number, GRenderbuffer> = RENDERBUFFER_SET;

    /**
     * 
     */
    private gl: WebGLRenderingContext;

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
     * @param gl 
     * @param extLib 
     * @param limLib 
     * @param stats 
     */
    constructor(
        gl: WebGLRenderingContext,
        extLib: Extension,
        limLib: Limit,
        stats: IStats
    ) {
        this.gl = gl;
        this.extLib = extLib;
        this.limLib = limLib;
        this.stats = stats;
    }

    /**
     * 
     * @param opts 
     * @returns 
     */
    public createRenderbuffer = (
        opts: {
            w: number,
            h: number,
            format: SRenderbufferColor
        }
    ): GRenderbuffer => {
        const gl = this.gl, w = opts.w || 0, h = opts.h || 0, f = opts.format || 'RGBA4';
        check(w > 0 && h > 0 && w <= this.limLib.maxTextureSize && h <= this.limLib.maxTextureSize, `Renderbuffer error: 分辨率错误`);
        const rbo = new GRenderbuffer(gl, w, h, f, this.stats);
        rbo.bind();
        return rbo;
    }
}

export { RenderbufferState }