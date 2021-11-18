import { IStats } from './../util/createStats';
import { StringState } from './StringState';
import { SShaderTarget } from '../core/Support';
import { REGLShader, FRAGSHADER_SET, VERTSHADER_SET } from './../res/REGLShader';

/**
 * 
 */
class ShaderState {
    /**
     * frag shader map
     */
    private static FRAGSHADER_SET: Map<number, REGLShader> = FRAGSHADER_SET;

    /**
     * vertex shader map
     */
    private static VERTSHADER_SET: Map<number, REGLShader> = VERTSHADER_SET;

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private stats: IStats;

    /**
     * 
     */
    private stringState: StringState;

    /**
     * create new reglshader object
     * @example
     * const reglShader = shaderState.createShader('FRAGMENT_SHADER', this.stringState.id(FragRawSourceText));
     * @param target 
     * @param id 
     * @returns 
     */
    public createShader = (target: SShaderTarget, id: number): REGLShader => {
        const SHADER_SET = target === 'FRAGMENT_SHADER' ? ShaderState.FRAGSHADER_SET : ShaderState.VERTSHADER_SET;
        let shader = SHADER_SET.get(id);
        if (!shader) {
            const source = this.stringState.str(id);
            shader = new REGLShader(this.gl, id, source, target);
        }
        return shader;
    }
}

export { ShaderState }