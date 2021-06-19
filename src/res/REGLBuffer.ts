import { getIdx } from "../util/getIdx";
import { Disposeable } from './Disposeable';
import { BufferFormate, ComponentFormate, DimensionTypeFormate } from "./Fromate";


/**
 * 普通封装
 */
class REGLBuffer extends Disposeable {

    idx: number = getIdx();

    buffer: WebGLBuffer;

    /**
     * 指示是顶点缓冲ARRAY_BUFFER，还是片段索引缓冲ELEMENT_ARRAY_BUFFER 
     */
    btype: BufferFormate;

    /**
     * 数据类型
     */
    dtype: ComponentFormate;

    /**
     * 数据维度，默认为1
     * 2和3用在ELEMENT_ARRAY_BUFFER类型下
     */
    dimension: DimensionTypeFormate;

    /**
     * 实体三维上下文
     */
    gl: WebGLRenderingContext;

    /**
     * 
     */
    byteLength: number;

    /**
     * 
     */
    stats: { size: number };

    /**
     * 
     * @param gl 
     * @param btype 指示是顶点缓冲ARRAY_BUFFER，还是片段索引缓冲ELEMENT_ARRAY_BUFFER 
     */
    constructor(gl: WebGLRenderingContext, btype: BufferFormate) {
        super();
        this.gl = gl;
        this.btype = btype;
        this.byteLength = 0;
        this.dtype = ComponentFormate.UNSIGNED_BYTE;
        this.stats.size = 0;
    }


    paddingWithData =()=>{
        
    }

    bind = () => {
        this.gl.bindBuffer(this.btype, this.buffer);
    }

    dispose(): void {
        throw new Error("Method not implemented.");
    }
}

export { REGLBuffer, }