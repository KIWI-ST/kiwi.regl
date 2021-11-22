import { check } from "../util/check";
import { Status } from "../core/Status";
import { CWebGLStatusFLAG, CWebGLStatusVariable } from "../core/Constant";
import { SWebGLStatus, SWebGLStatusFLAG, SWebGLStatusVariable } from "../core/Support";

/**
 * 计数webgl状态更新
 * @param opts 
 * @returns 
 */
const parseStatus = (
    opts: {
        gl: WebGLRenderingContext,
        status?: SWebGLStatus
    }
): Status => {
    const { gl, status } = opts;
    const s0 = new Status(gl);
    Object.keys(status)?.forEach((key) => {
        const v = status[key];
        if (CWebGLStatusFLAG[key])
            s0.setFlag(key as SWebGLStatusFLAG, v);
        else if (CWebGLStatusVariable[key])
            s0.setVariable(key as SWebGLStatusVariable, v);
        else check(false, `ParseStatus error:不支持的WebGL状态设置${key}`);
    });
    return s0;
}

export { parseStatus }