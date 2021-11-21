import { IAttributeBuffer, TAttribute } from "../compiler/parseAttribute";
import { CColorSpace, CComponent } from "../core/Constant";
import { Extension } from "../core/Extension";
import { ShapedArrayFormat } from "../core/Format";
import { Limit } from "../core/Limit";
import { SPrimitive } from "../core/Support";
import { REGLBuffer } from "../res/REGLBuffer";
import { REGLElementbuffer } from "../res/REGLElementbuffer";
import { IAttributeRecord, REGLVertexArrayObject, VAO_SET } from "../res/REGLVertexArrayObject";
import { check } from "../util/check";
import { checkAttribute } from "../util/checkAttribute";
import { IStats } from "../util/createStats";
import { isBufferArray } from "../util/isBufferArray";
import { BufferState } from "./BufferState";
import { ElementState } from "./ElementState";
import { ProgramState } from "./ProgramState";

/**
 * 
 */
class AttributeState {
    /**
     * 
     */
    static VAO_SET: Map<number, REGLVertexArrayObject> = VAO_SET;

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
    private attributeBindings: IAttributeRecord[];

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private bufferState: BufferState;

    /**
     * 
     */
    private elementState: ElementState;

    /**
     * 
     */
    private programState: ProgramState;

    /**
     * 
     */
    private extLib: Extension;

    /**
     * 
     */
    private limLib: Limit;

    /**
     * 
     */
    private current: REGLVertexArrayObject;

    /**
     * 
     */
    private stats: IStats;

    /**
     * 
     */
    get Current(): REGLVertexArrayObject {
        return this.current;
    }

    /**
     * 
     * @param gl 
     * @param extLib 
     * @param limLib 
     * @param bufferState 
     * @param elementState 
     * @param programState 
     * @param stats 
     */
    constructor(
        gl: WebGLRenderingContext,
        extLib: Extension,
        limLib: Limit,
        bufferState: BufferState,
        elementState: ElementState,
        programState: ProgramState,
        stats: IStats
    ) {
        this.gl = gl;
        this.extLib = extLib;
        this.limLib = limLib;
        this.bufferState = bufferState;
        this.elementState = elementState;
        this.programState = programState;
        this.current = null;
        this.extVAO = extLib.getByForce('OES_vertex_array_object') as OES_vertex_array_object;
        this.extITA = extLib.getByForce('ANGLE_instanced_arrays') as ANGLE_instanced_arrays;
        this.attributeBindings = new Array(limLib.maxAttributes);
        for (let i = 0; i < limLib.maxAttributes; i++)
            this.attributeBindings[i] = {};
        this.stats = stats;
    }

    /**
     * 
     * @param i 
     * @returns 
     */
    public getAttribute = (i: number): IAttributeRecord => {
        return this.attributeBindings[i];
    }

    /**
     * 
     * @param attrs 
     * @returns 
     */
    private applyAttribute = <TA extends TAttribute>(attrs: TA): Map<string, IAttributeRecord> => {
        const RECORD_SET: Map<string, IAttributeRecord> = new Map();
        Object.keys(attrs)?.forEach((key: string) => {
            const v = attrs[key];
            checkAttribute(v);
            const record: IAttributeRecord = { name: key };
            /**
             * @description 数组处理
             * @example
             * 
             * attributes:{
             *      color:{
             *          constant: [1, 0, 1, 1]
             *      }
             * }
             * 
             */
            if (isBufferArray(v)) {
                const v0: ShapedArrayFormat = v as ShapedArrayFormat;
                const buf = this.bufferState.createBuffer({
                    data: v0,
                    target: 'ARRAY_BUFFER'
                });
                //buffer需要绑定是因为buf直接被vao使用，不需要初始化与各program重复绑定
                record.buffer = buf;
                record.component = buf.Component;
                record.divisor = 0;
                record.offset = 0;
                record.stride = 0;
                record.normalized = false;
            }
            /**
             * 处理带其他属性的attribute
             * @example
             * attributes:{
             *  normals:{
             *      buffer:new REGLBuffer(),
             *      offset:0,
             *      stride:12,
             *      normalized:false,
             *      divisor:0 
             *  }
             * }
             */
            else if ((v as IAttributeBuffer).buffer) {
                const v0 = v as IAttributeBuffer;
                const buf = isBufferArray(v0.buffer) ? this.bufferState.createBuffer({
                    data: v0.buffer as ShapedArrayFormat,
                    target: 'ARRAY_BUFFER',
                }) : v0.buffer as REGLBuffer;
                //record属性设置
                record.offset = v0.offset | 0;
                check(record.offset >= 0, `offset只能是大于等于0的数字`);
                record.stride = v0.stride | 0;
                check(record.stride >= 0 && record.stride < 256, `扫描线宽取值范围必须[0,255]`);
                record.normalized = !!v0.normalized;
                record.component = CComponent[v0.component] || buf.Component;
                check(Object.values(CComponent).indexOf(record.component) !== -1, `数据类型只能是${Object.values(CComponent)}`);
                check(v0.divisor === 0 || this.extLib.get('ANGLE_instanced_arrays'), `不支持ANGLE_instanced_arrays插件，不能设置实例化参数divisor`);
                check(v0.divisor >= 0, `不支持的divisor值`);
                //record buffer属性
                record.buffer = buf;
                record.component = buf.Component;
            }
            RECORD_SET.set(record.name, record);
        });
        return RECORD_SET;
    }

    /**
     * 
     * @param attrs 
     * @param opts 
     * @returns 
     */
    public createREGLVertexArrayObject = <TA extends TAttribute>(
        attrs: TA,
        opts: {
            elements?: REGLElementbuffer | ShapedArrayFormat,
            offset?: number,
            count?: number,
            instances?: number,
            primitive?: SPrimitive
        } = {}
    ): REGLVertexArrayObject => {
        const RECORD_SET = this.applyAttribute(attrs);
        let ELEMENTS: REGLElementbuffer = null;
        if (opts.elements) {
            if (opts.elements instanceof REGLElementbuffer)
                ELEMENTS = opts.elements;
            else
                ELEMENTS = this.elementState.createElementbuffer({
                    data: opts.elements,
                    component: 'UNSIGNED_SHORT',
                    primitive: opts.primitive || 'TRIANGLES'
                });
        }
        const vertexArrayObject = new REGLVertexArrayObject(
            {
                gl: this.gl,
                extVAO: this.extVAO,
                extITA: this.extITA,
                programState: this.programState,
                stats: this.stats
            }
        );
        vertexArrayObject.refresh({
            recordSet: RECORD_SET,
            elements: ELEMENTS,
            offset: opts.offset,
            count: opts.count,
            instances: opts.instances,
            primitive: opts.primitive
        });
        return vertexArrayObject;
    }

    /**
     * 
     * @param vao 
     */
    public setVAO = (vao: REGLVertexArrayObject): void => {
        if (vao) this.current = vao;
        else {
            this.Current?.decRef();
            this.current = null;
        }
    }
}

export { AttributeState }