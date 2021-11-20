import { CArraybufferTarget, CAttributeTS, CPrimitive } from "../core/Constant";
import { Dispose } from "../core/Dispose";
import { IPipelineLink } from "../core/Pipeline";
import { SPrimitive } from "../core/Support";
import { IStats } from "../util/createStats";
import { REGLBuffer } from "./REGLBuffer";
import { REGLElementbuffer } from "./REGLElementbuffer";
import { defaultValue } from './../util/defaultValue';
import { check } from "../util/check";
import { ProgramState } from "../state/ProgramState";

/**
 * 
 */
interface IAttributeRecord extends IPipelineLink {
    /**
     * attribute location name
     */
    name?: string;

    /**
     * 每个顶点属性组成的数量，例如vec3为3
     */
    size?: number;

    /**
     * Attribute记录的缓冲对象（数据）
     */
    buffer?: number[] | REGLBuffer | REGLElementbuffer;

    /**
     * 指示数据归一化
     * defalut:false
     */
    normalized?: boolean;

    /**
     * 数据类型
     */
    component?: number;

    /**
     * 数据偏移量
     * default: 0
     */
    offset?: number;

    /**
     * 扫描线宽
     * default:0
     */
    stride?: number;

    /**
     * 表示实例化绘制时，每个属性绘制的次数
     * default:0，表示每个属性不使用实例化绘制
     */
    divisor?: number;
}

/**
 * VertexArrayObject MAP
 */
const VAO_SET: Map<number, REGLVertexArrayObject> = new Map();

/**
 * 
 */
class REGLVertexArrayObject extends Dispose {
    /**
     * 
     */
    dispose(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 
     */
    decRef(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 构建attribute集
     */
    private attributeSet: Map<string, IAttributeRecord> = new Map();

    /**
     * element arraybuffer 
     */
    private elements: REGLElementbuffer;

    /**
     * 
     */
    private count: number;

    /**
     * 
     */
    private offset: number;

    /**
     * 
     */
    private instances: number;

    /**
     * 
     */
    private primitive: number;

    /**
     * 
     */
    private extVAO: OES_vertex_array_object;

    /**
     * 
     */
    private extITA: ANGLE_instanced_arrays;

    /**
     * 
     */
    private vao: WebGLVertexArrayObjectOES;

    /**
     * 
     */
    private stats: IStats;

    /**
     * 
     */
    private programState: ProgramState;

    /**
     * 指示vao是否已绑定属性
     */
    private bindings: boolean;

    /**
     * 
     */
    set Elements(v: REGLElementbuffer) {
        this.elements = v;
    }

    /**
     * element arraybuffer
     */
    get Elements(): REGLElementbuffer {
        return this.elements;
    }

    /**
     * 
     */
    get Offset() {
        return this.offset;
    }

    /**
     * 
     */
    get Count() {
        return this.count;
    }

    /**
     * 
     */
    get Instances() {
        return this.instances;
    }

    /**
     * 
     */
    get Primitive() {
        return this.primitive;
    }

    constructor(
        opts: {
            gl: WebGLRenderingContext,
            extVAO: OES_vertex_array_object,
            extITA: ANGLE_instanced_arrays,
            programState: ProgramState,
            stats: IStats
        }
    ) {
        super();
        this.gl = opts.gl;
        this.extVAO = opts.extVAO;
        this.extITA = opts.extITA;
        this.programState = opts.programState;
        this.instances = -1;
        this.offset = 0;
        this.count = 0;
        this.bindings = false;
        this.primitive = CPrimitive['TRIANGLES'];
        this.stats = opts.stats;
        this.vao = this.extVAO.createVertexArrayOES();
        this.stats.vaoCount++;
        VAO_SET.set(this.ID, this);
    }

    public refresh = (
        opts: {
            recordSet?: Map<string, IAttributeRecord>,
            elements?: REGLElementbuffer,
            offset?: number,
            count?: number,
            instances?: number,
            primitive?: SPrimitive
        }
    ) => {
        this.attributeSet = opts.recordSet || this.attributeSet;
        this.elements = opts.elements || this.elements;
        this.offset = defaultValue(opts.offset, this.offset);
        this.count = defaultValue(opts.count, this.count);
        this.instances = defaultValue(opts.instances, this.instances);
        this.primitive = defaultValue(CPrimitive[opts.primitive], this.primitive);
        //刷新bindings状态
        this.bindings = false;
    }

    /**
     * 
     */
    public bindAttrs = () => {
        this.refCount++;
        this.extVAO.bindVertexArrayOES(this.vao);
        if (this.bindings) return;
        const gl = this.gl;
        this.attributeSet?.forEach((att: IAttributeRecord, loc: string) => {
            if (att.buffer) {
                //顶点缓冲
                if (att.buffer instanceof REGLBuffer) {
                    const act = this.programState.Current.AttActiveInfo.get(loc);
                    check(act, `VAO错误：VAO绑定属性与当前Program不一致`);
                    const pos = act.location as number;
                    const size = CAttributeTS[act.info.type];
                    //告诉显卡从当前绑定的缓冲区读取顶点数据
                    gl.vertexAttribPointer(pos, size, att.component, att.normalized, att.stride, att.offset);
                    gl.enableVertexAttribArray(pos);
                    //实例化绘制设置
                    if (this.extITA && att.divisor)
                        this.extITA.vertexAttribDivisorANGLE(pos, att.divisor);
                } else if (Array.isArray(att.buffer)) {
                    const act = this.programState.Current.AttActiveInfo.get(loc);
                    check(act, `VAO错误：VAO绑定属性与当前Program不一致`);
                    const pos = act.location as number;
                    gl.disableVertexAttribArray(pos);
                    //使用fv代替float verctor, 要求buffer长度是4
                    gl.vertexAttrib4fv(pos, att.buffer);
                }
            }
        });
        //最后绑定element arraybuffer
        this.elements ? gl.bindBuffer(CArraybufferTarget['ELEMENT_ARRAY_BUFFER'], this.elements) : gl.bindBuffer(CArraybufferTarget['ELEMENT_ARRAY_BUFFER'], null);
        this.bindings = true;
    }
}

export {
    VAO_SET,
    IAttributeRecord,
    REGLVertexArrayObject
}