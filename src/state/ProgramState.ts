import { check } from "../util/check";
import { ShaderState } from "./ShaderState";
import { StringState } from "./StringState";
import { PROGRAM_SET, GProgram } from "../res/GProgram";

/**
 * @author axmand
 */
class ProgramState {
    /**
     * 
     */
    static PROGRAM_SET: Map<number, GProgram> = PROGRAM_SET;

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
    private gProgram: GProgram;

    /**
     * 
     */
    get Current(): GProgram {
        return this.gProgram;
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
        this.gProgram = null;
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
    ): GProgram => {
        check(vert.length >= 0, `ProgramState error: vertex shader is missing`);
        check(frag.length >= 0, `ProgramState error: fragment shader is missing`);
        const gl = this.gl, shaderState = this.shaderState, stringState = this.stringState;
        const fragShader = shaderState.createShader('FRAGMENT_SHADER', stringState.id(frag));
        const vertShader = shaderState.createShader('VERTEX_SHADER', stringState.id(vert));
        const gProgram = new GProgram(gl, shaderState, stringState, fragShader.ID, vertShader.ID, attribLocations);
        return gProgram;
    }

    /**
     * switch program
     * @param gProgramId 
     */
    public useProgram = (gProgramId: number): void => {
        const gProgram = ProgramState.PROGRAM_SET.get(gProgramId);
        gProgram.use();
        this.gProgram = gProgram;
    }
}

export { ProgramState }