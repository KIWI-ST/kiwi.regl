import { check } from "./../util/check";
import { CWebGLStatusFLAG, CWebGLStatusVariable } from "./Constant";
import { SWebGLStatusFLAG, SWebGLStatusVariable } from "./Support";

/**
 * @author axmand
 * @description WebGL状态管理器
 */
class Status {
    /**
     * 
     */
    private static CURRENT_FLAG_SET: Map<SWebGLStatusFLAG, boolean> = new Map();

    /**
     * 
     */
    private static CURRENT_VARIABLE_SET: Map<SWebGLStatusVariable, any[]> = new Map();

    /**
     * 
     */
    public NEXT_FLAG_SET: Map<SWebGLStatusFLAG, boolean> = new Map();

    /**
     * 
     */
    public NEXT_VARIABLE_SET: Map<SWebGLStatusVariable, any[]> = new Map();

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 记录需要变更的webgl状态集
     */
    private statusList: (SWebGLStatusVariable | SWebGLStatusFLAG)[] = [];

    /**
    *  webgl状态集
    */
    get StatusList(): (SWebGLStatusVariable | SWebGLStatusFLAG)[] {
        return this.statusList;
    }

    /**
     * 
     * @param gl 
     */
    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;
        //默认
        //1.dither
        this.setFlag('DITHER', false);
        //2.blending
        this.setFlag('BLEND', false);
        this.setVariable('blendColor', [0, 0, 0, 0]);
        this.setVariable('blendEquationSeparate', [gl.FUNC_ADD, gl.FUNC_ADD]);
        this.setVariable('blendFuncSeparate', [gl.ONE, gl.ZERO, gl.ONE, gl.ZERO]);
        //3.depth
        this.setFlag('DEPTH_TEST', true);
        this.setVariable('depthFunc', [gl.LESS]);
        this.setVariable('depthRange', [0, 1]);
        this.setVariable('depthMask', [true]);
        //4.color mask
        this.setVariable('colorMask', [true, true, true, true]);
        //5.cull face
        this.setFlag('CULL_FACE', false);
        this.setVariable('cullFace', [gl.BACK]);
        this.setVariable('frontFace', [gl.CCW]);
        //6.line width
        this.setVariable('lineWidth', [1]);
        //7.polygon offset
        this.setFlag('POLYGON_OFFSET_FILL', false);
        this.setVariable('polygonOffset', [0, 0]);
        //8.sample coverage
        this.setFlag('SAMPLE_ALPHA_TO_COVERAGE', false);
        this.setFlag('SAMPLE_COVERAGE', false);
        this.setVariable('sampleCoverage', [1, false]);
        //9.stencil
        this.setFlag('STENCIL_TEST', false);
        this.setVariable('stencilMask', [-1]);
        this.setVariable('stencilOpSeparate', [gl.FRONT, gl.KEEP, gl.KEEP, gl.KEEP]);
        //}{debug stencilOpSeparate方法是否需要重设两次
        // this.setVariable('stencilOpSeparate', [gl.BACK, gl.KEEP, gl.KEEP, gl.KEEP]);
        //10.scissor
        this.setFlag('SCISSOR_TEST', false);
        this.setVariable('scissor', [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]);
        this.setVariable('viewport', [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]);
    }

    needRefresh = (key: SWebGLStatusFLAG | SWebGLStatusVariable): boolean => {
        if (CWebGLStatusFLAG[key]) {
            const k = key as SWebGLStatusFLAG;
            const cur = Status.CURRENT_FLAG_SET.get(k);
            const next = this.NEXT_FLAG_SET.get(k);
            return cur != next;
        }
        else if (CWebGLStatusVariable[key]) {
            const k = key as SWebGLStatusVariable;
            const cur = Status.CURRENT_VARIABLE_SET.get(k);
            const next = this.NEXT_VARIABLE_SET.get(k);
            if (!cur) return true;
            else if (cur.length !== next.length) return true
            else return cur.join() !== next.join();
        }
        else check(false, `错误：Status-不支持的webgl状态修改，请检查状态是否合法`);
    }

    /**
     * 更新状态
     * @param key
     */
    refresh = (key: SWebGLStatusVariable | SWebGLStatusFLAG) => {
        const gl = this.gl;
        if (CWebGLStatusFLAG[key]) {
            const k = key as SWebGLStatusFLAG;
            const v = this.NEXT_FLAG_SET.get(k);
            v ? gl.enable(gl[k]) : gl.disable(gl[k]);
            Status.CURRENT_FLAG_SET.set(k, v);
        }
        else if (CWebGLStatusVariable[key]) {
            const k = key as SWebGLStatusVariable;
            const v = this.NEXT_VARIABLE_SET.get(k);
            gl[k as unknown as string].apply(gl, v);
            Status.CURRENT_VARIABLE_SET.set(k, v);
        }
        else check(false, `错误：Status-不支持的webgl状态修改，请检查状态是否合法`);
    }

    /**
     * 记录flag型
     * @param key 
     * @param v 
     */
    setFlag = (key: SWebGLStatusFLAG, v: boolean): void => {
        this.NEXT_FLAG_SET.set(key, v);
        this.statusList.push(key);
    }

    /**
     * 记录变量型
     * @param key 
     * @param v 
     */
    setVariable = (key: SWebGLStatusVariable, v: any[]): void => {
        this.NEXT_VARIABLE_SET.set(key, v.slice());
        this.statusList.push(key);
    }

}

export { Status }