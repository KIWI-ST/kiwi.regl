import { check } from '../util/check';
import { Dispose } from '../core/Dispose';
import { ShaderState } from '../state/ShaderState';
import { StringState } from '../state/StringState';
import { CActiveTarget } from '../core/Constant';

/**
 * program set
 */
const PROGRAM_SET: Map<number, GProgram> = new Map();

/**
 * actived uniform or attribute
 */
interface IActiveInfo {
    /**
     * attribute/uniform name
     */
    name: string,

    /**
     * store in stingStore's str id
     */
    id: number;

    /**
     * 
     */
    location: WebGLUniformLocation | number,

    /**
     * original info (WebGL Active Info)
     */
    info: WebGLActiveInfo
}

/**
 * @author axmand
 */
class GProgram extends Dispose {
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
     * stringStore.id()
     */
    private fragId: number;

    /**
     * stringStore.id()
     */
    private vertId: number;

    /**
     * 
     */
    private program: WebGLProgram;

    /**
     * 
     */
    private uniforms: IActiveInfo[];

    /**
     * 
     */
    private attributes: IActiveInfo[];

    /**
     * 
     */
    private attPosition: Map<string, IActiveInfo>;

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
    get Uniforms(): IActiveInfo[] {
        return this.uniforms;
    }

    /**
     * 
     */
    get Attributes(): IActiveInfo[] {
        return this.attributes;
    }

    /**
     * 获取激活的attribute信息，包含name/location, 为vao对象绑定备用
     */
    get AttActiveInfo(): Map<string, IActiveInfo> {
        if (!this.attPosition) {
            this.attPosition = new Map();
            this.attributes.forEach((att: IActiveInfo) => {
                this.attPosition.set(att.name, att);
            })
        }
        return this.attPosition;
    }

    constructor(
        gl: WebGLRenderingContext,
        shaderState: ShaderState,
        stringState: StringState,
        fragShaderId: number,
        vertShaderId: number,
        attribLocations: string[]
    ) {
        super();
        this.gl = gl;
        this.fragId = fragShaderId;
        this.vertId = vertShaderId;
        this.program = null;
        this.uniforms = [];
        this.attributes = [];
        this.shaderState = shaderState;
        this.stringState = stringState;
        this.link(attribLocations);
        PROGRAM_SET.set(this.ID, this);
    }

    /**
     * switch to this program
     */
    use = () => {
        check(this.program, `Program错误，空的program无法切换使用`)
        this.gl.useProgram(this.program);
    }

    /**
     * link program
     * @param attributeLocations 
     */
    private link = (attributeLocations: string[]) => {
        const gl = this.gl, shaderState = this.shaderState, fragId = this.fragId, vertId = this.vertId;
        const fragShader = shaderState.createShader('FRAGMENT_SHADER', fragId);
        const vertShader = shaderState.createShader('VERTEX_SHADER', vertId);
        const program = this.program = gl.createProgram();
        gl.attachShader(program, fragShader.Shader);
        gl.attachShader(program, vertShader.Shader);
        attributeLocations?.forEach((v: any, i: number) => {
            const binding = attributeLocations[i];
            gl.bindAttribLocation(program, i, binding);
        });
        gl.linkProgram(program);
        check(gl.getProgramParameter(program, gl.LINK_STATUS), `Program错误，编译错误${gl.getProgramInfoLog(program)}`);
        this.activeUniforms();
        this.activeAttributes();
    }

    /**
     * get actived uniforms
     */
    private activeUniforms = () => {
        const insertActvieInfo = (info: IActiveInfo) => {
            for (let i = 0, len = this.uniforms.length; i < len; i++) {
                if (this.uniforms[i].id === info.id) {
                    this.uniforms[i].location = info.location;
                    return
                }
            }
            this.uniforms.push(info);
        }
        const gl = this.gl, program = this.program, stringState = this.stringState;
        //uniforms
        const numUniforms = gl.getProgramParameter(program, CActiveTarget['ACTIVE_UNIFORMS']);
        for (let i = 0; i < numUniforms; ++i) {
            const info = gl.getActiveUniform(program, i);
            if (info) {
                if (info.size > 1) {
                    for (let j = 0, len = info.size; j < len; ++j) {
                        const name = info.name.replace(`[0]`, `[${j}]`);
                        insertActvieInfo({
                            name: name,
                            id: stringState.id(name),
                            location: gl.getUniformLocation(program, name),
                            info: info
                        });
                    }
                }
                let uniName = info.name;
                if (info.size > 1) {
                    uniName = uniName.replace('[0]', '');
                }
                insertActvieInfo({
                    name: uniName,
                    id: stringState.id(uniName),
                    location: gl.getUniformLocation(program, uniName),
                    info: info
                })
            }
        }
    }

    /**
     * get actived attributes
     */
    private activeAttributes = () => {
        const insertActiveInfo = (info: IActiveInfo) => {
            for (let i = 0, len = this.attributes.length; i < len; i++) {
                if (this.attributes[i].id === info.id) {
                    this.attributes[i].location = info.location;
                    return;
                }
            }
            this.attributes.push(info);
        }
        const gl = this.gl, program = this.program;
        const numAttributes = gl.getProgramParameter(program, CActiveTarget['ACTIVE_ATTRIBUTES']);
        for (let i = 0; i < numAttributes; ++i) {
            const info = gl.getActiveAttrib(program, i);
            if (info)
                insertActiveInfo({
                    name: info.name,
                    id: this.stringState.id(info.name),
                    location: gl.getAttribLocation(program, info.name),
                    info
                });
        }
    }
}

export {
    PROGRAM_SET,
    type IActiveInfo,
    GProgram
}