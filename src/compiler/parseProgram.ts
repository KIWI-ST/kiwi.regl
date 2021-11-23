import { GProgram } from "../res/GProgram";
import { GShader } from "../res/GShader";
import { ProgramState } from "../state/ProgramState";
import { ShaderState } from "../state/ShaderState";
import { StringState } from "../state/StringState";

/**
 * create REGLProgram
 * @param opts 
 * @param locations 
 * @returns 
 */
const parseProgram = (
    opts: {
        frag: string,
        vert: string,
        stringState: StringState,
        shaderState: ShaderState,
        programState: ProgramState
    },
    locations: string[]
): {
    fragId?: number,
    vertId?: number,
    fragShader?: GShader,
    vertShader?: GShader,
    program?: GProgram
} => {

    const { frag, vert, stringState, shaderState, programState } = opts;
    const fragId = stringState.id(frag), fragShader = shaderState.createShader('FRAGMENT_SHADER', fragId);
    const vertId = stringState.id(vert), vertShader = shaderState.createShader('VERTEX_SHADER', vertId);
    const program = programState.createProgram(frag, vert, locations);
    return {
        fragId,
        vertId,
        fragShader,
        vertShader,
        program
    }
}

export {
    parseProgram
}