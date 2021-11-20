import { check } from "../util/check";
import { ShaderState } from "./ShaderState";
import { StringState } from "./StringState";
import { PROGRAM_SET, REGLProgram } from "../res/REGLProgram";

/**
 * @author axmand
 */
class ProgramState {
    /**
     * 
     */
    static PROGRAM_SET: Map<number, REGLProgram> = PROGRAM_SET;

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private shaderState: ShaderState;

    /**
     * 
     */
    private stringState: StringState;

    /**
     * 
     */
    private reglProgram: REGLProgram;

    /**
     * 
     */
    get Current(): REGLProgram {
        return this.reglProgram;
    }

    /**
     * 
     * @param gl 
     * @param shaderState 
     * @param stringState 
     */
    constructor(
        gl: WebGLRenderingContext,
        shaderState: ShaderState,
        stringState: StringState,
    ) {
        this.gl = gl;
        this.shaderState = shaderState;
        this.stringState = stringState;
    }

    /**
     * 
     * @param frag 
     * @param vert 
     * @param attribLocations 
     * @returns 
     */
    public createProgram = (
        frag: string,
        vert: string,
        attribLocations: string[]
    ): REGLProgram => {
        check(vert.length >= 0, `ProgramState error: vertex shader is missing`);
        check(frag.length >= 0, `ProgramState error: fragment shader is missing`);
        const gl = this.gl, shaderState = this.shaderState, stringState = this.stringState;
        const fragShader = shaderState.createShader('FRAGMENT_SHADER', stringState.id(frag));
        const vertShader = shaderState.createShader('VERTEX_SHADER', stringState.id(vert));
        const reglProgram = new REGLProgram(gl, shaderState, stringState, fragShader.ID, vertShader.ID, attribLocations);
        return reglProgram;
    }

    /**
     * switch program
     * @param reglProgramId 
     */
    public useProgram = (reglProgramId: number): void => {
        const reglProgram = ProgramState.PROGRAM_SET.get(reglProgramId);
        reglProgram.use();
        this.reglProgram = reglProgram;
    }
}

export { ProgramState }