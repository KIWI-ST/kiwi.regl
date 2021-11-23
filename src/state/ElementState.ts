import { check } from "../util/check";
import { IStats } from "../util/createStats";
import { Extension } from "../core/Extension";
import { CPrimitive } from "../core/Constant";
import { BufferState } from "./BufferState";
import { ShapedArrayFormat } from "../core/Format";
import { GElementbuffer, REGLELEMENTBUFFER_SET } from "../res/GElementbuffer";
import { SComponent, SDimension, SPrimitive, SUsage } from "../core/Support";

/**
 * @author axmand
 * @description 构造 ELEMENT_ARRAY_BUFFER缓冲
 */
class ElementState {
    /**
     * 
     */
    static ELEMENTBUFFER_SET: Map<number, GElementbuffer> = REGLELEMENTBUFFER_SET;

    /**
     * 
     */
    private streamPool: GElementbuffer[] = [];

    /**
     * 
     */
    private gl: WebGLRenderingContext;

    /**
     * 
     */
    private extLib: Extension;

    /**
     * 
     */
    private bufferState: BufferState;

    /**
     * 
     */
    stats: IStats;

    /**
     * 
     * @param gl 
     * @param extLib 
     * @param bufferState 
     * @param stats 
     */
    constructor(
        gl: WebGLRenderingContext,
        extLib: Extension,
        bufferState: BufferState,
        stats: IStats
    ) {
        this.gl = gl;
        this.extLib = extLib;
        this.bufferState = bufferState;
        this.stats = stats;
    }

    /**
     * 初始化buffer属性，支持 UNSIGNED_BYTE/BYTE/UNSIGNED_SHORT/SHORT/UNSIGNED_INT/INT
     * @param opts 
     * @returns 
     */
    private initElement = (
        opts: {
            reglElementbuffer: GElementbuffer,
            data: ShapedArrayFormat,
            component: SComponent,
            usage: SUsage,
            primitive: SPrimitive,
            count?: number
        }
    ): GElementbuffer => {
        opts.reglElementbuffer.bind();
        opts.reglElementbuffer.paddingWithData(opts.data, opts.usage, opts.component);
        //推断primitive类型
        if (!opts.primitive) {
            opts.reglElementbuffer.Primitive = opts.reglElementbuffer.Dimension === 1 ?
                CPrimitive['POINTS'] : opts.reglElementbuffer.Dimension === 2 ?
                    CPrimitive['LINES'] : opts.reglElementbuffer.Dimension === 3 ?
                        CPrimitive['TRIANGLES'] : CPrimitive[opts.primitive];
        }
        else opts.reglElementbuffer.Primitive = CPrimitive[opts.primitive || 'TRIANGLES'];
        //修正vertcount
        opts.count = opts.count || opts.reglElementbuffer.ByteLength;
        if (opts.component === 'UNSIGNED_SHORT')
            opts.count >>= 1;
        else if (opts.component === 'UNSIGNED_INT')
            opts.count >>= 2;
        //
        opts.reglElementbuffer.VertCount = opts.count;
        return opts.reglElementbuffer;
    }

    /**
     * 修正webgl支持的element buffer数据类型
     * @param component 
     * @returns 
     */
    private fixComponent = (component: SComponent): SComponent => {
        switch (component) {
            case 'UNSIGNED_BYTE':
            case 'BYTE':
                component = 'UNSIGNED_BYTE';
                break;
            case 'UNSIGNED_INT':
            case 'SHORT':
                component = 'UNSIGNED_SHORT';
                break;
            case 'UNSIGNED_INT':
            case 'INT':
                component = this.extLib.get('OES_element_index_uint') ? 'UNSIGNED_INT' : 'UNSIGNED_SHORT';
                break;
            default:
                check(false, `ElementState Error: unvilade paramter ${component}`);
        }
        return component;
    }

    /**
     * 根据id获取REGLElementbuffer对象
     * @param id 
     * @returns 
     */
    public getElementbuffer = (id: number): GElementbuffer => {
        return ElementState.ELEMENTBUFFER_SET.get(id);
    }

    /**
     * 
     * @param opts 
     * @returns 
     */
    public createElementbuffer = (
        opts: {
            data: ShapedArrayFormat,
            component: SComponent,
            usage?: SUsage,
            primitive?: SPrimitive,
            dimension?: SDimension,
            count?: number
        }
    ): GElementbuffer => {
        const data = opts.data,
            count = opts.count || 0,
            usage = opts.usage || 'STATIC_DRAW',
            target = 'ELEMENT_ARRAY_BUFFER',
            component = this.fixComponent(opts.component) || 'UNSIGNED_SHORT',
            dimension = opts.dimension || 'TRIANGLES',
            primitive = opts.primitive || 'TRIANGLES', //绘制类型
            byteLength = opts.data.length;
        const reglbuffer = this.bufferState.createBuffer({
            target: target,
            data: data,
            usage: usage,
            component: component,
            dimension: dimension,
            byteLength: byteLength
        });
        const reglElementbuffer = new GElementbuffer(reglbuffer, primitive);
        this.stats.elementsCount++;
        return this.initElement({
            reglElementbuffer: reglElementbuffer,
            data: data,
            component: component,
            usage: usage,
            primitive: primitive,
            count: count
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     */
    public createStreamElementbuffer = (
        opts: {
            data: ShapedArrayFormat,
            component: SComponent,
            usage?: SUsage,
            primitive?: SPrimitive,
            dimension?: SDimension,
            count?: number
        }
    ): GElementbuffer => {
        const data = opts.data,
            count = opts.count || 0,
            usage = opts.usage || 'STREAM_DRAW',
            target = 'ELEMENT_ARRAY_BUFFER',
            component = this.fixComponent(opts.component) || 'UNSIGNED_SHORT',
            dimension = opts.dimension || 'TRIANGLES',
            primitive = opts.primitive || 'TRIANGLES', //绘制类型
            byteLength = opts.data.length;
        const reglbuffer = this.bufferState.createBuffer({
            target: target,
            data: data,
            usage: usage,
            component: component,
            dimension: dimension,
            byteLength: byteLength
        });
        const reglElementbuffer = new GElementbuffer(reglbuffer, primitive);
        this.stats.elementsCount++;
        return this.initElement({
            reglElementbuffer: reglElementbuffer,
            data: data,
            component: component,
            usage: usage,
            primitive: primitive,
            count: count
        });
    }

    /**
     * 
     * @param streamElementbuffer 
     */
    public destoryStreamElementbuffer = (streamElementbuffer:GElementbuffer):void=>{
        this.streamPool.push(streamElementbuffer);
    }
}

export { ElementState }