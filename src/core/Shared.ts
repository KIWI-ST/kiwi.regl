import { CWebGLStatusFLAG, CWebGLStatusVariable } from "./Constant";

/**
 * WebGL状态/切换接口
 * @example
 * //记录
 * gl.enable/disable类型，如 gl.enable(gl.dither);
 * //转义
 * SharedGLStatus.next['dither']?gl.enable(gl.dither):gl.disable(gl.dither);
 */
interface ISharedGLStatus {

    /**
     * 下一帧webgl状态
     */
    next: {
        flags: {
            [key in keyof typeof CWebGLStatusFLAG]?: number | number[]
        },
        variables: {
            [key in keyof typeof CWebGLStatusVariable]?: number | number[]
        }
    }

    /**
     * 当前webgl状态
     */
    current: {
        flags: {
            [key in keyof typeof CWebGLStatusFLAG]?: number | number[]
        },
        variables: {
            [key in keyof typeof CWebGLStatusVariable]?: number | number[]
        }
    }

}

export { ISharedGLStatus }