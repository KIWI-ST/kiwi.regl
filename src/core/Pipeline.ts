import { Limit } from "./Limit";
import { Status } from './Status';
import { GBuffer } from "../res/GBuffer";
import { GShader } from "../res/GShader";
import { GTexture } from "../res/GTexture";
import { Extension } from "./Extension";
import { isNDArray } from "../util/isNDArray";
import { ShaderState } from "../state/ShaderState";
import { StringState } from "../state/StringState";
import { BufferState } from "../state/BufferState";
import { ProgramState } from "../state/ProgramState";
import { TextureState } from "../state/TextureState";
import { ElementsState } from "../state/ElementState";
import { GFramebuffer } from "../res/GFramebuffer";
import { IPerformance } from './../util/createPerformance';
import { IUniformRecord } from "../compiler/parseUniform";
import { AttributeState } from "../state/AttributeState";
import { GElementsbuffer } from '../res/GElementsbuffer'
import { FramebufferState } from "../state/FramebufferState";
import { IFramebufferInfo } from "../compiler/parseFramebuffer";
import { RenderbufferState } from "../state/RenderbufferState";
import { Procedure, Template } from 'kiwi.codegen';
import { IActiveInfo, GProgram } from '../res/GProgram';
import { IAttributeRecord, GVertexArrayObject } from "../res/GVertexArrayObject";


/**
 * 全局静态值，包含属性/对象/函数
 */
const PipelineConstant = {
    /**
     * 
     */
    isNDArray: isNDArray,

    /**
     * 
     * @param v 
     * @returns 
     */
    isNumber: (v: any) => !isNaN(parseFloat(v)) && isFinite(v),

    /**
     * 
     * @param v 
     * @returns 
     */
    isTexture: (v: any) => v instanceof GTexture,

    /**
     * 
     * @param v 
     * @returns 
     */
    isFramebuffer: (v: any) => v instanceof GFramebuffer,
};

/**
 * 指示资源会被link到pipeline，需要保存资源id
 */
interface IPipelineLink {
    /**
     * 记录进pipeline中的link变量名
     * link name
     */
    ln?: string;

    /**
     * 记录pipeline中def数值变量名
     * define name
     * dynamic name
     */
    dn?: string;

    /**
     * 为dynamic uniform保存函数输入属性预留用
     * -funciton计算得到的uniform值
     * -prop计算得到的uniform值
     */
    dyn?: string;
}

/**
 * 管道资源
 * - parese处理后生成的资源缓存进pipeline后备用
 */
interface IPipelineData {
    /**
     * 
     */
    attributeRecordSet: Map<string, IAttributeRecord>;

    /**
     * 
     */
    uniformRecordSet: Map<string, IUniformRecord>;

    /**
     * 
     */
    program: GProgram;

    /**
     * 
     */
    fragId: number;

    /**
     * 
     */
    vertId: number;

    /**
     * 
     */
    status: Status;

    /**
     * 
     */
    fragShader: GShader;

    /**
     * 
     */
    vertShader: GShader;

    /**
     * 
     */
    performance: IPerformance;

    /**
     * 
     */
    vao?: GVertexArrayObject;

    /**
     * 
     */
    element?: GElementsbuffer;

    /**
     * 
     */
    framebuffer?: IFramebufferInfo;
}

/**
 * 构造pipeline时必须的资源准备
 */
interface IPipelineSchema {
    /**
     * 
     */
    gl: WebGLRenderingContext;

    /**
     * 
     */
    extLib: Extension;

    /**
     * 
     */
    limLib: Limit;

    /**
     * 
     */
    attributeState: AttributeState;

    /**
     * 
     */
    bufferState: BufferState;

    /**
     * 
     */
    elementState: ElementsState;

    /**
     * 
     */
    programState: ProgramState;

    /**
     * 
     */
    shaderState: ShaderState;

    /**
     * 
     */
    stringState: StringState;

    /**
     * 
     */
    textureState: TextureState;

    /**
     * 
     */
    renderbufferState: RenderbufferState;

    /**
     * 
     */
    framebufferState: FramebufferState;

    /**
     * 性能统计
     */
    performance: IPerformance;

    /**
     * 
     */
    primitive: number;

    /**
     * draw Count
     */
    count: number;

    /**
     * draw Offset
     */
    offset: number;

    /**
     * 实例绘制次数
     */
    instances?: number;
}

/**
 * 存储的全局变量对应的codegen生成的变量名
 */
type SVariable =
    | keyof {
        [key in keyof typeof PipelineConstant]: string
    }
    | keyof {
        [key in keyof IPipelineSchema]: string
    }
    | keyof {
        [key in keyof IPipelineData]: string
    }
    | keyof {
        /**
         * 常量
         */
        pipeConstant?: string;

        /**
         * 数据集合
         */
        pipeData?: string;

        /**
         * 各种管理类型state的数据集合
         */
        pipeState?: string
    };

/**
 * @@author axmand
 * Pipeline设计思想：
 * -隔离webgl上下文
 * -记录draw状态
 * -共享context
 * 
 * 通过codegen->compiler->function从形态上和逻辑上保持各个绘制流程(draw pipeline)的隔离
 */
class Pipeline {
    /**
     * 
     */
    private template: Template;

    /**
     * 记录管道数据
     */
    private pipelineSchema: IPipelineSchema;

    /**
     * 缓存变量对应的pipeline/link等
     */
    private variableNameSet: Map<SVariable | string, string> = new Map();

    /**
     * 
     */
    private batchId: number;

    /**
     * 绘制批次id，在一阵内返回
     */
    get BatchID(): number {
        return this.batchId;
    }

    /**
     * 
     * @param v 
     * @returns 
     */
    public getVariable = (v: SVariable): string => {
        return this.variableNameSet.get(v);
    }

    /**
     * 
     * @param pipelineSchema 
     */
    constructor(pipelineSchema: IPipelineSchema) {
        this.template = new Template();
        this.pipelineSchema = pipelineSchema;
        this.batchId = 0;
        //处理state数据
        this.append(pipelineSchema);
        //处理constant数据
        this.link(PipelineConstant, 'pipeConstant');
        Object.keys(PipelineConstant)?.forEach((key: string) => {
            this.variableNameSet.set(key, this.template.def(`${this.getVariable('pipeConstant')}.${key}`));
        });
    }

    /**
     * 
     * @param v 
     * @param linkName 
     */
    private appendData = (v: IPipelineSchema | IPipelineData, linkName: SVariable): void => {
        this.link(v, linkName);
        Object.keys(v)?.forEach((key: string) => {
            this.variableNameSet.set(key, this.template.def(`${this.getVariable(linkName)}.${key}`));
        });
    }

    /**
     * 
     * @param v 
     */
    public append = (v: IPipelineSchema | IPipelineData): void => {
        const ne: SVariable = ((v as IPipelineSchema).attributeState !== undefined) && ((v as IPipelineSchema).bufferState !== undefined) ? 'pipeState' : 'pipeData';
        this.appendData(v, ne);
    }

    /**
     * carete closure function
     * @param name 
     * @param parameterCount 
     * @returns 
     */
    public proc = (name: string, parameterCount: number): Procedure => {
        return this.template.procedure(name, parameterCount);
    }

    /**
     * define value
     * @param v 
     * @returns 
     */
    public def = (v: string | number | boolean | number[] | string[]): string => {
        return this.template.def(v);
    }

    /**
     * link as function input variables
     * @param v 
     */
    public link(v: { (performance: IPerformance, batchId: number): number } | { (performance: IPerformance, batchId: number): number[] } | { (performance: IPerformance, batchId: number): GTexture } | { (performance: IPerformance, batchId: number): GFramebuffer }): string
    public link(v: number[] | IActiveInfo | GBuffer | GElementsbuffer | GTexture | GFramebuffer | Status): string
    public link(v: Object, name: SVariable): string
    public link(v?: any, name?: any): string {
        const v0 = this.template.link(v);
        if (name) this.variableNameSet.set(name, v0);
        else this.variableNameSet.set(v0, v0);
        return v0;
    }

    /**
     * 
     * @returns soruce code
     */
    public compile = (): string => {
        return this.template.compile();
    }
}

export {
    IPipelineLink,
    IPipelineData,
    IPipelineSchema,
    Pipeline,
}