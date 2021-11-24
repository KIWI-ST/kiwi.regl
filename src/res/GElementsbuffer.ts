import { CPrimitive } from "../core/Constant";
import { Dispose } from "../core/Dispose";
import { ShapedArrayFormat, TypedArrayFormat } from "../core/Format";
import { SComponent, SPrimitive, SUsage } from "../core/Support";
import { GBuffer } from "./GBuffer";

/**
 * 
 */
const REGLELEMENTBUFFER_SET: Map<number, GElementsbuffer> = new Map();

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
    private reglBuffer: GBuffer;

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
        return this.reglBuffer.Component;
    }

    /**
     * 
     * @param reglBuffer 
     * @param primitive 
     */
    constructor(
        reglBuffer: GBuffer,
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
    GElementsbuffer
}