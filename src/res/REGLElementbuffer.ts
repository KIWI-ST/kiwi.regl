import { CPrimitive } from "../core/Constant";
import { Dispose } from "../core/Dispose";
import { ShapedArrayFormat, TypedArrayFormat } from "../core/Format";
import { SComponent, SPrimitive, SUsage } from "../core/Support";
import { REGLBuffer } from "./REGLBuffer";

/**
 * 
 */
const REGLELEMENTBUFFER_SET: Map<number, REGLElementbuffer> = new Map();

/**
 * @author axmand
 */
class REGLElementbuffer extends Dispose {
    /**
     * 
     */
    dispose(): void {
        this
    }

    /**
     * 
     */
    deRef(): void {
        throw new Error("Method not implemented.");
    }

    /**
     * vertex count
     */
    private vertCount: number;

    /**
     * primitive type
     */
    private primitive: number;

    /**
     * 
     */
    private reglBuffer: REGLBuffer;

    /**
     * 
     */
    get Dimension(): number {
        return this.reglBuffer.Dimension
    }

    /**
     * 
     */
    get ByteLength(): number {
        return this.reglBuffer.ByteLength;
    }

    /**
     * 
     */
    get Primitive(): number {
        return this.primitive;
    }

    /**
     * 
     */
    get VertCount(): number {
        return this.vertCount;
    }

    /**
     * 
     */
    set VertCount(v: number) {
        this.vertCount = v;
    }

    /**
     * 
     */
    get Component(): number {
        return this.reglBuffer.Component;
    }

    /**
     * 
     * @param reglBuffer 
     * @param primitive 
     */
    constructor(
        reglBuffer: REGLBuffer,
        primitive: SPrimitive = 'TRIANGLES'

    ) {
        super();
        this.vertCount = 0;
        this.reglBuffer = reglBuffer;
        this.primitive = CPrimitive[primitive || 'TRIANGLES'];
        REGLELEMENTBUFFER_SET.set(this.ID, this);
    }

    /**
     * 
     * @param data 
     * @param offset 
     */
    subData = (data: TypedArrayFormat, offset: number): void => {
        this.reglBuffer.subData(data, offset);
    }

    /**
     * 
     * @param data 
     * @param usage 
     * @param component 
     */
    paddingWithData = (data: ShapedArrayFormat, usage: SUsage, component: SComponent): void => {
        this.reglBuffer.paddingWithData(data, usage, component);
    }

    /**
     * 
     */
    bind = (): void => {
        this.reglBuffer.bind();
    }
}

export {
    REGLELEMENTBUFFER_SET,
    REGLElementbuffer
}