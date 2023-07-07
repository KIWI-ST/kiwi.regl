import { GBuffer } from "./GBuffer";
import { Dispose } from "../core/Dispose";
import { CPrimitive } from "../core/Constant";
import { SComponent, SPrimitive, SUsage } from "../core/Support";
import { ShapedArrayFormat, TypedArrayFormat } from "../core/Format";

/**
 * 
 */
const GELEMENTBUFFER_SET: Map<number, GElementsbuffer> = new Map();

/**
 * @author axmand
 */
class GElementsbuffer extends Dispose {
    /**
     * 
     */
    dispose(): void {
        this
    }

    /**
     * 
     */
    decRef(): void {
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
    private gBuffer: GBuffer;

    /**
     * 
     */
    get Dimension(): number {
        return this.gBuffer.Dimension
    }

    /**
     * 
     */
    get ByteLength(): number {
        return this.gBuffer.ByteLength;
    }

    /**
     * 
     */
    set Primitive(v: number) {
        this.primitive = v;
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
        return this.gBuffer.Component;
    }

    /**
     * 
     * @param gBuffer 
     * @param primitive 
     */
    constructor(
        gBuffer: GBuffer,
        primitive: SPrimitive = 'TRIANGLES'

    ) {
        super();
        this.vertCount = 0;
        this.gBuffer = gBuffer;
        this.primitive = CPrimitive[primitive || 'TRIANGLES'];
        GELEMENTBUFFER_SET.set(this.ID, this);
    }

    /**
     * 
     * @param data 
     * @param offset 
     */
    subData = (data: TypedArrayFormat, offset: number): void => {
        this.gBuffer.subData(data, offset);
    }

    /**
     * 
     * @param data 
     * @param usage 
     * @param component 
     */
    paddingWithData = (data: ShapedArrayFormat, usage: SUsage, component: SComponent): void => {
        this.gBuffer.paddingWithData(data, usage, component);
    }

    /**
     * 
     */
    bind = (): void => {
        this.gBuffer.bind();
    }
}

export {
    GELEMENTBUFFER_SET,
    GElementsbuffer
}