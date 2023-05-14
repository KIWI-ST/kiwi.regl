import { check } from "../util/check";
import { GFramebuffer } from "../res/GFramebuffer";
import { IPerformance } from "../util/createPerformance";

/**
 * Framebuffer对象参数设置
 */
interface IFramebufferSetting {
    /**
     * 核心framebuffer对象
     */
    framebuffer: GFramebuffer | { (performance: IPerformance, batchId: number): GFramebuffer };

    /**
     * framebuffer清理策略
     */
    clear?: {
        color?: number[]; //RGBA四元素组
        depth?: boolean;
        stencil?: boolean;
    }
}

interface IFramebufferInfo {
    /**
     * 
     */
    framebuffer?: GFramebuffer | { (performance: IPerformance, batchId: number): GFramebuffer }

    /**
     * 
     */
    color?: number[];

    /**
     * 
     */
    clearBit?: number;
}

/**
 * 
 * @param opts 
 * @returns 
 */
const parseFramebuffer = (
    opts: {
        gl: WebGLRenderingContext;
        framebuffer?: IFramebufferSetting
    }
): IFramebufferInfo => {
    if (!opts.framebuffer) return null;
    const fb = opts.framebuffer, gl = opts.gl;
    //check(fb.framebuffer.ColorAttachments.length === fb.framebuffer.ColorDrawbuffers.length, `parseFamebuffer Error: color attachments num and color drawbuffers num must be the same!`);
    const response: IFramebufferInfo = {};
    response.framebuffer = opts.framebuffer.framebuffer;
    const bit: number = gl.COLOR_BUFFER_BIT;
    //解析clear设置
    if (fb.clear && fb.clear.color) {
        const color = fb.clear.color;
        check(color.length === 4, `Error: clear color must consist of 4`);
        response.color = color;
        response.clearBit = bit;
    }
    if (fb.clear && fb.clear.depth)
        response.clearBit = (response.clearBit || bit) | gl.DEPTH_BUFFER_BIT;
    if (fb.clear && fb.clear.stencil)
        response.clearBit = (response.clearBit || bit) | gl.STENCIL_BUFFER_BIT;
    return response;
}

export {
    type IFramebufferSetting,
    type IFramebufferInfo,
    parseFramebuffer
}