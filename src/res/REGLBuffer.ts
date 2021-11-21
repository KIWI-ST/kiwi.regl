import { check } from '../util/check';
import { Dispose } from './../core/Dispose';
import { bufferPool0 } from '../pool/BufferPool';
import { detectComponent } from './../util/detectComponent';
import { ShapedArrayFormat, TypedArrayFormat } from './../core/Format';
import { flattenArrayWithShape, getArrayShape } from '../util/getFlatten';
import { CArraybufferTarget, CComponent, CDimension, CUsage } from '../core/Constant';
import { SArraybufferTarget, SComponent, SDimension, SUsage } from './../core/Support';

/**
 * 全局存储buffer
 */
const BUFFER_SET: Map<number, REGLBuffer> = new Map();

/**
 * 
 */
class REGLBuffer extends Dispose {
    /**
     * 
     */
    decRef(): void {
        this.refCount--;
    }

    /**
     * 
     */
    dispose(): void {
        throw new Error('Method not implemented.');
    }

    /**
     *
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private buffer: WebGLBuffer;

    /**
     * 
     */
    private byteLength: number;

    /**
     * Draw方法，包括：static draw / dynamic draw / stream draw
     */
    private usage: number;

    /**
     * POINTS/LINES/TRIANGLES
     */
    private dimension: number;

    /**
     * FLOAT/BYTE/SHORT等
     */
    private component: number;

    /**
     * 指示顶点buffer, 片元buffer
     * ELEMENT_ARRAY_BUFFER / ARRAY_BUFFER
     */
    private target: number;

    /**
     * 
     */
    get Dimension():number{
        return this.dimension;
    }

    /**
     * 
     */
    get ByteLength():number{
        return this.byteLength;
    }

    /**
     * 
     */
    get Component():number{
        return this.component;
    }

    /**
     * 
     * @param gl 
     * @param target 
     * @param usage 
     * @param component 
     * @param dimension 
     */
    constructor(
        gl: WebGLRenderingContext,
        target: SArraybufferTarget,
        usage: SUsage = 'STATIC_DRAW',
        component: SComponent = 'FLOAT',
        dimension: SDimension = 'POINTS'
    ) {
        super();
        this.gl = gl;
        this.byteLength = 0;
        this.buffer = gl.createBuffer();
        this.target = CArraybufferTarget[target];
        this.usage = CUsage[usage || 'STATIC_DRAW'];
        this.dimension = CDimension[dimension || 'POINTS'];
        this.component = CComponent[component || 'UNSIGNED_BYTE'];
        BUFFER_SET.set(this.ID, this);
    }

    /**
     * 
     * @param data 
     * @param offset 
     */
    private setSubData = (data: TypedArrayFormat, offset: number) => {
        const gl = this.gl, size = offset + data.byteLength;
        check(size <= this.byteLength, `subdata错误，写入数据长度${size}超过原始长度${this.byteLength},写入失败`);
        gl.bufferSubData(this.target, offset, data);
    }

    /**
     * 
     * @param data 
     */
    private bufferTypedArray = (data: TypedArrayFormat) => {
        this.byteLength = data.byteLength;
        this.gl.bufferData(this.target, data, this.usage);
    }

    /**
     * 
     * @param data 
     * @param usage 
     * @param component 
     * @returns 
     */
    public paddingWithData = (data: ShapedArrayFormat, usage: SUsage, component: SComponent): REGLBuffer => {
        this.usage = CUsage[usage || 'STATIC_DRAW'];
        const shape = getArrayShape(data);
        //获取d0, 用于判断dtype
        const d0 = shape.length === 1 ? data[0] : shape.length === 2 ? data[0][0] : shape.length === 3 ? data[0][0][0] : 0;
        component = component || detectComponent(d0) || 'FLOAT';
        this.component = CComponent[component];
        const flatData = flattenArrayWithShape(data, shape, component);
        this.bufferTypedArray(flatData);
        //持久化存储或释放
        bufferPool0.freeType(flatData);
        return this;
    }

    /**
     * 
     * @param data 
     * @param offset 
     */
    public subData = (data: ShapedArrayFormat, offset: number = 0) => {
        this.bind();
        const shape = getArrayShape(data);
        //获取d0，判断dtype
        const d0 = shape.length === 1 ? data[0] : shape.length === 2 ? data[0][0] : shape.length === 3 ? data[0][0][0] : 0;
        const scomponent = detectComponent(d0) || 'FLOAT';
        this.component = CComponent[scomponent];
        const flatData = flattenArrayWithShape(data, shape, scomponent);
        this.setSubData(flatData, offset);
        //持久化存储或释放
        bufferPool0.freeType(flatData);
    }

    /**
     * bind buffer
     */
    public bind = () => {
        this.gl.bindBuffer(this.target, this.buffer);
    }
}

export { 
    BUFFER_SET,
    REGLBuffer 
}