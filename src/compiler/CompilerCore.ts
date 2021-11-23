import { CPrimitive } from "../core/Constant";
import { Extension } from "../core/Extension";
import { ShapedArrayFormat } from "../core/Format";
import { Limit } from "../core/Limit";
import { IPipelineData, Pipeline } from "../core/Pipeline";
import { SPrimitive, SWebGLStatus } from "../core/Support";
import { GElementbuffer } from "../res/GElementbuffer";
import { GFramebuffer } from "../res/GFramebuffer";
import { IAttributeRecord, GVertexArrayObject } from "../res/GVertexArrayObject";
import { AttributeState } from "../state/AttributeState";
import { BufferState } from "../state/BufferState";
import { ElementState } from "../state/ElementState";
import { FramebufferState } from "../state/FramebufferState";
import { ProgramState } from "../state/ProgramState";
import { RenderbufferState } from "../state/RenderbufferState";
import { ShaderState } from "../state/ShaderState";
import { StringState } from "../state/StringState";
import { TextureState } from "../state/TextureState";
import { IPerformance } from "../util/createPerformance";
import { IStats } from "../util/createStats";
import { emitAttribute } from "./emitAttribute";
import { emitBatch } from "./emitBatch";
import { emitElement } from "./emitElement";
import { emitFramebuffer } from "./emitFramebuffer";
import { emitProgram } from "./emitProgram";
import { emitStatus } from "./emitStatus";
import { emitUniform } from "./emitUniform";
import { parseAttribute, TAttribute } from "./parseAttribute";
import { praseElement } from "./parseElement";
import { parseProgram } from "./parseProgram";
import { parseStatus } from "./parseStatus";
import { parseUniform, TUniform } from "./parseUniform";

/**
 * 
 */
interface ICompileOption<TA extends TAttribute, TU extends TUniform> {
    /**
     * 
     */
    vert?: string;

    /**
     * 
     */
    frag: string;

    /**
     * 
     */
    attributes?: TA;

    uniforms?: TU;

    /**
     * 
     */
    elements?: ShapedArrayFormat;

    /**
     * 
     */
    count?: number;

    /**
     * 
     */
    offset?: number;

    /**
     * 
     */
    primitive?: SPrimitive;

    /**
     * 
     */
    framebuffer?: { (performance: IPerformance, batchId: number): GFramebuffer } | GFramebuffer;

    /**
     * 
     */
    instances?: number;

    /**
     * 
     */
    status?: SWebGLStatus;

    /**
     * 
     */
    vao?: GVertexArrayObject;
}

class CompilerCore {

    private gl: WebGLRenderingContext;

    private limLib: Limit;

    /**
    * 
    */
    private extLib: Extension;

    private stats: IStats;

    private bufferState: BufferState;

    private elementState: ElementState;

    private attributeState: AttributeState;

    private stringState: StringState;

    private textureState: TextureState;

    private shaderState: ShaderState;

    private programState: ProgramState;

    private renderbufferState: RenderbufferState;

    private framebufferState: FramebufferState;

    private performance: IPerformance;

    /**
     * 
     * @param opts 
     */
    constructor(
        opts: {
            gl: WebGLRenderingContext,
            stats: IStats,
            performance: IPerformance,
            extLib: Extension,
            limLib: Limit,
            bufferState: BufferState,
            textureState: TextureState,
            elementState: ElementState,
            attributeState: AttributeState,
            stringState: StringState,
            shaderState: ShaderState,
            programState: ProgramState,
            renderbufferState: RenderbufferState,
            framebufferState: FramebufferState
        }
    ) {

        this.gl = opts.gl;
        this.stats = opts.stats;
        this.performance = opts.performance;
        this.extLib = opts.extLib;
        this.limLib = opts.limLib;
        this.bufferState = opts.bufferState;
        this.textureState = opts.textureState;
        this.elementState = opts.elementState;
        this.attributeState = opts.attributeState;
        this.stringState = opts.stringState;
        this.shaderState = opts.shaderState;
        this.programState = opts.programState;
        this.renderbufferState = opts.renderbufferState;
        this.framebufferState = opts.framebufferState;
    }

    /**
     * 
     * @param opts 
     */
    private perparePipelineData = <TA extends TAttribute, TU extends TUniform>(
        opts: {
            gl: WebGLRenderingContext,
            pipeline: Pipeline,
            attributes: TA,
            uniforms: TU,
            vert: string,
            frag: string,
            extLib: Extension,
            limLib: Limit,
            bufferState: BufferState,
            textureState: TextureState,
            elementState: ElementState,
            attributeState: AttributeState,
            stringState: StringState,
            shaderState: ShaderState,
            programState: ProgramState,
            renderbufferState: RenderbufferState,
            framebufferState: FramebufferState,
            vao?: GVertexArrayObject,
            primitive?: SPrimitive,
            framebuffer?: { (performance: IPerformance, batchId: number): GFramebuffer } | GFramebuffer,
            elements?: ShapedArrayFormat,
            offset?: number,
            count?: number,
            instance?: number,
            status?: SWebGLStatus
        }
    ): IPipelineData => {
        let elementbuffer: GElementbuffer = null, attributeRecordSet: Map<string, IAttributeRecord> = null;
        //解析attribute, 为VAO准备资源
        // const attributeLocations = parseAttribLocation();
        const status = parseStatus(opts);
        if (!opts.vao) {
            elementbuffer = praseElement(opts);
            //解析attributes和unifroms后构造record数组备用
            attributeRecordSet = parseAttribute(opts);
        }
        //2.解析uniform
        const uniformRecordSet = parseUniform(opts);
        //3.构造program
        // const program = parseProgram(opts, attributeLocations)
        const program = parseProgram(opts, null);
        //4.资源准备完毕，构造darwProce
        const pipelineData: IPipelineData = {
            attributeRecordSet,
            uniformRecordSet,
            program: program.program,
            fragShader: program.fragShader,
            vertShader: program.vertShader,
            fragId: program.fragId,
            vertId: program.vertId,
            status,
            vao: opts.vao,
            element: elementbuffer,
            performance: this.performance,
            framebuffer: opts.framebuffer
        }
        //5.资源Link到pipeline
        opts.pipeline.append(pipelineData);
        //6.resource集中放在proce，只有draw时调取
        return pipelineData;
    }

    /**
     * 批次合并绘制
     * @param opts 
     */
    private applyBatchProcPipelineData = (
        opts: {
            pipeline: Pipeline,
            pipelineData: IPipelineData,
            extLib: Extension,
            instances: number,
            count: number
        }
    ): void => {
        const { pipeline, pipelineData, extLib, instances } = opts;
        const drawProc = pipeline.proc('batch', 1);
        const scope0 = drawProc.Entry.createScope();
        const iBlock = scope0.Entry;    //作batch block输入
        //更新webgl上下文状态
        emitStatus(pipeline, iBlock, pipelineData.status);
        //处理program
        emitProgram(pipeline, iBlock, pipelineData);
        //处理attribute
        emitAttribute(pipeline, iBlock, extLib, pipelineData.vao, pipelineData.program.Attributes, pipelineData.attributeRecordSet);
        //批量绘制
        emitBatch(pipeline, iBlock, pipelineData, extLib, instances);
    }

    /**
     * 
     * @param opts 
     */
    private applyDrawProcPipelineData = (
        opts: {
            pipeline: Pipeline,
            pipelineData: IPipelineData,
            extLib: Extension,
            instances: number,
            count: number
        }
    ): void => {
        const { pipeline, pipelineData, extLib } = opts;
        const drawProc = pipeline.proc('draw', 1);
        const scope0 = drawProc.Entry.createScope();
        const scope1 = drawProc.Exit.createScope();
        const iBlock = scope0.Entry;
        const oBlock = scope1.Exit;
        const P0_NAME = `p0`;
        //更新webgl状态
        emitStatus(pipeline, iBlock, pipelineData.status);
        //处理framebuffer
        emitFramebuffer(pipeline, iBlock, oBlock, pipelineData.framebuffer, extLib);
        //处理attribute
        emitProgram(pipeline, iBlock, pipelineData);
        //处理attribute
        emitAttribute(pipeline, iBlock, extLib, pipelineData.vao, pipelineData.program.Attributes, pipelineData.attributeRecordSet);
        //处理uniform
        emitUniform(pipeline, iBlock, oBlock, pipelineData.program.Uniforms, pipelineData.uniformRecordSet, P0_NAME);
        //处理绘制
        emitElement(pipeline, extLib, pipelineData.vao, iBlock, pipelineData.element, opts.instances);
    }

    /**
     * 
     * @param opts 
     */
    compile = <TA extends TAttribute, TU extends TUniform>(opts: ICompileOption<TA, TU>) => {
        const count = opts.count || 0,
            offset = opts.offset || 0,
            instances = opts.instances || 0,
            framebuffer = opts.framebuffer || null,
            primitive = CPrimitive[opts.primitive || 'TRIANGLES'],
            status = opts.status || {}
        //渲染上下文管线
        const pipeline = new Pipeline({
            gl: this.gl,
            extLib: this.extLib,
            limLib: this.limLib,
            attributeState: this.attributeState,
            bufferState: this.bufferState,
            elementState: this.elementState,
            programState: this.programState,
            shaderState: this.shaderState,
            stringState: this.stringState,
            textureState: this.textureState,
            renderbufferState: this.renderbufferState,
            framebufferState: this.framebufferState,
            performance: this.performance,
            offset,
            count,
            primitive,
            instances
        });
        //资源解析
        //-解析attributes->record
        //-解析unifrom->unifrom record
        //-解析frag,vert
        //-解析vao
        //-framebuffer
        const pipelineData = this.perparePipelineData({
            gl: this.gl,
            pipeline: pipeline,
            attributes: opts.attributes,
            uniforms: opts.uniforms,
            elements: opts.elements,
            frag: opts.frag,
            vert: opts.vert,
            extLib: this.extLib,
            limLib: this.limLib,
            attributeState: this.attributeState,
            bufferState: this.bufferState,
            elementState: this.elementState,
            programState: this.programState,
            shaderState: this.shaderState,
            stringState: this.stringState,
            textureState: this.textureState,
            renderbufferState: this.renderbufferState,
            framebufferState: this.framebufferState,
            vao: opts.vao,
            primitive: opts.primitive || 'TRIANGLES',
            framebuffer,
            status
        });
        //生成draw proc
        this.applyDrawProcPipelineData({
            pipeline,
            pipelineData,
            extLib: this.extLib,
            count,
            instances
        });
        //生成draw batch
        this.applyBatchProcPipelineData({
            pipeline,
            pipelineData,
            extLib: this.extLib,
            count,
            instances
        });
        //编译
        return pipeline.compile();
    }
}

export { 
    ICompileOption,
    CompilerCore 
}