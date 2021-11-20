import { REGLFramebuffer } from "../res/REGLFramebuffer";
import { REGLShader } from "../res/REGLShader";
import { REGLTexture } from "../res/REGLTexture";
import { isNDArray } from "../util/isNDArray";
import { REGLProgram } from './../res/REGLProgram';
import { Status } from './Status';
import { IPerformance } from './../util/createPerformance';
import { REGLElementbuffer } from './../res/REGLElementbuffer';
import { Extension } from "./Extension";
import { Limit } from "./Limit";

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
    isTexture: (v: any) => v instanceof REGLTexture,

    /**
     * 
     * @param v 
     * @returns 
     */
    isFramebuffer: (v: any) => v instanceof REGLFramebuffer,

    /**
     * 使用draw buffer插件时调用
     */
    backBuffer: [1029],

    /**
     * 在draw buffer插件下调用
     */
    drawBuffer: [[0]],
}

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
    program: REGLProgram;

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
    fragShader: REGLShader;

    /**
     * 
     */
    vertShader: REGLShader;

    /**
     * 
     */
    performance: IPerformance;

    /**
     * 
     */
    vao?: REGLVertexArrayObject;

    /**
     * 
     */
    element?: REGLElementbuffer;

    /**
     * 
     */
    framebuffer?: REGLFramebuffer | { (performance: IPerformance, batchId: number): REGLFramebuffer };
}

interface IPipelineSchema{

    gl:WebGLRenderingContext;

    extLib:Extension;

    limLib:Limit;

    // attributeState:AttributeShate
}

export{
    IPipelineLink
}