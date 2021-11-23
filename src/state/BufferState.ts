import { IStats } from "../util/createStats";
import { ShapedArrayFormat } from "../core/Format";
import { GBuffer, BUFFER_SET } from "../res/GBuffer";
import { CArraybufferTarget, CUsage } from "../core/Constant";
import { SArraybufferTarget, SComponent, SDimension, SUsage } from "../core/Support";

/**
 * 
 */
class BufferState{
    /**
     * 
     */
    static REGLBUFFER_SET: Map<number, GBuffer> = BUFFER_SET;

    /**
     *  
     */
    private streamPool: GBuffer[] = [];

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private reglBuffer: GBuffer;

    /**
     * 
     */
    private stats: IStats;

    /**
     * 
     * @param gl 
     * @param stats 
     */
    constructor(
        gl: WebGLRenderingContext,
        stats: IStats
    ) {
        this.gl = gl;
        this.stats = stats;
    }

    /**
     * 
     * @param opts 
     * @param [opts.data] buffer数据
     * @param [opts.byteLength] 数据长度
     * @param [opts.usage] 指示STATIC_DRAW/DYNAMIC_DRAW/STREAM_DRAW
     * @param [opts.dtype] 数组类型
     * @param [opts.dimension] 数据维度，顶点数据类型默认为1，片段数据 1.POINTS 2.LINES 3.TRIANGLES
     * @param [opts.target] 指示ARRAY_BUFFER或ELEMENT_ARRAY_BUFFER
     * @returns 
     */
    public createBuffer = (
        opts: {
            target: SArraybufferTarget,
            usage?: SUsage,
            component?: SComponent,
            dimension?: SDimension,
            data?: ShapedArrayFormat,
            byteLength?: number
        }
    ): GBuffer => {
        const data = opts.data,
            byteLength = opts.byteLength || 0,
            usage = opts.usage || 'STATIC_DRAW',
            component = opts.component || 'FLOAT',
            dimension = opts.dimension || 'POINTS',
            target = opts.target || 'ARRAY_BUFFER';
        const buffer = new GBuffer(this.gl, target, usage, component, dimension);
        buffer.bind();
        if (!data && byteLength > 0)
            this.gl.bufferData(CArraybufferTarget[target], byteLength, CUsage[usage]);
        else
            buffer.paddingWithData(data, usage, component);
        this.reglBuffer = buffer;
        this.stats.bufferCount++;
        return buffer;
    }

    /**
     * create STREAM_DRAW buffer
     * @param data 
     * @param target 
     * @returns 
     */
    public createStreambuffer = (data: ShapedArrayFormat, target: SArraybufferTarget): GBuffer => {
        const usage = 'STREAM_DRAW', component = 'FLOAT', dimension = 'POINTS';
        const buffer = this.streamPool.pop() || new GBuffer(this.gl, target, usage, component, dimension);
        buffer.bind();
        buffer.paddingWithData(data, usage, component);
        this.reglBuffer = buffer;
        return buffer;
    }

    /**
     * 
     * @param streambuffer 
     */
    public destoryStreambuffer = (streambuffer: GBuffer): void => {
        this.streamPool.push(streambuffer);
    }
}

export { BufferState }

