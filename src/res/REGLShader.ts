
import { check } from './../util/check';
import { Dispose } from './../core/Dispose';
import { CShaderTarget } from '../core/Constant';
import { SShaderTarget } from './../core/Support';

/**
 * 
 */
const FRAGSHADER_SET: Map<number, REGLShader> = new Map();

/**
 * 
 */
const VERTSHADER_SET: Map<number, REGLShader> = new Map();

/**
 * @author axamnd
 * @example
 * const shader = new REGLShader(gl, id);
 */
class REGLShader extends Dispose {
    /**
     * 
     */
    dispose(): void {
        throw new Error('Method not implemented.');
    }

    /**
     * 
     */
    decRef(): void {
        throw new Error('Method not implemented.');
    }

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private shader: WebGLShader;

    /**
     * shader type: FRAG/VERT
     */
    private target: number;

    /**
     * 
     */
    private source: string;

    /**
     * 
     */
    get Shader(): WebGLShader {
        return this.shader;
    }

    constructor(
        gl: WebGLRenderingContext,
        id: number,
        source: string,
        target: SShaderTarget
    ) {
        super();
        this.id = id;
        this.gl = gl;
        this.target = CShaderTarget[target];
        this.shader = gl.createShader(this.target);
        this.source = source;
        gl.shaderSource(this.shader, source);
        gl.compileShader(this.shader);
        check(gl.getShaderParameter(this.shader, gl.COMPILE_STATUS), `shader编译错误 - ${gl.getShaderInfoLog(this.shader)}`);
        this.target === CShaderTarget['FRAGMENT_SHADER'] ? FRAGSHADER_SET.set(this.ID, this) : VERTSHADER_SET.set(this.ID, this);
    }
}

export {
    VERTSHADER_SET,
    FRAGSHADER_SET,
    REGLShader
}