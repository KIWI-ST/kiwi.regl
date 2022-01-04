
import { check } from "../util/check";
import { Limit } from "./Limit";
import { TProps } from "./Props";
import { GBuffer } from "../res/GBuffer";
import { TUniform } from "../compiler/parseUniform";
import { GTexture } from "../res/GTexture";
import { Extension } from "./Extension";
import { TAttribute } from "../compiler/parseAttribute";
import { ShaderState } from "../state/ShaderState";
import { StringState } from "../state/StringState";
import { BufferState } from "../state/BufferState";
import { TextureState } from "../state/TextureState";
import { GFramebuffer } from "../res/GFramebuffer";
import { ProgramState } from "../state/ProgramState";
import { GRenderbuffer } from "../res/GRenderbuffer";
import { ElementsState } from "../state/ElementState";
import { AttributeState } from "../state/AttributeState";
import { GElementsbuffer } from "../res/GElementsbuffer";
import { FramebufferState } from "../state/FramebufferState";
import { RenderbufferState } from "../state/RenderbufferState";
import { GVertexArrayObject } from "../res/GVertexArrayObject";
import { createStats, IStats } from "../util/createStats";
import { IConfigure, parseConfigure } from "../compiler/parseConfigure";
import { CompilerCore, ICompileOption } from "../compiler/CompilerCore";
import { createPerformance, IPerformance } from "../util/createPerformance";
import { ShapedArrayFormat, TypedArrayFormat } from "./Format";
import { SArraybufferTarget, SComponent, SDimension, SMipmapHint, SPrimitive, SRenderbufferColor, STextureFillTarget, STextureMAGFilter, STextureMINFilter, SUsage } from "./Support";

/**
 * 
 */
interface IPipeCommand {
    /**
     * 常规一次绘制
     */
    draw(): void;

    /**
     * 动态property绘制，批量绘制
     * @param props 
     */
    batch<T extends TProps>(props: T[]): void;
}

/**
 * @author axmand
 */
class PipeGL {
    /**
     * compile core object
     */
    private compilerCore: CompilerCore;

    /**
     * 
     */
    private configure: IConfigure;

    /**
     * 
     */
    private limLib: Limit;

    /**
    * 
    */
    private extLib: Extension;

    /**
     * 
     */
    private stats: IStats;

    /**
     * 
     */
    private bufferState: BufferState;

    /**
     * 
     */
    private elementState: ElementsState;

    /**
     * 
     */
    private attributeState: AttributeState;

    /**
     * 
     */
    private stringState: StringState;

    /**
     * 
     */
    private textureState: TextureState;

    /**
     * 
     */
    private shaderState: ShaderState;

    /**
     * 
     */
    private programState: ProgramState;

    /**
     * 
     */
    private renderbufferState: RenderbufferState;

    /**
     * 
     */
    private framebufferState: FramebufferState;

    /**
     * 
     */
    private performance: IPerformance;

    /**
     * get webgl rendering context in private
     */
    private get gl(): WebGLRenderingContext {
        return this.configure.gl;
    }

    /**
     * 
     * @param opts 
     */
    constructor(opts: IConfigure) {
        //statics
        this.stats = createStats();
        this.performance = createPerformance();
        //rendering context
        this.configure = parseConfigure(opts);
        this.extLib = new Extension(this.gl, ...this.configure.extensions);
        this.limLib = new Limit(this.gl, this.extLib);
        //state manager
        this.stringState = new StringState();
        this.bufferState = new BufferState(this.gl, this.stats);
        this.textureState = new TextureState(this.gl, this.extLib, this.limLib, this.stats);
        this.elementState = new ElementsState(this.gl, this.extLib, this.bufferState, this.stats);
        this.shaderState = new ShaderState(this.gl, this.stringState, this.stats);
        this.programState = new ProgramState(this.gl, this.shaderState, this.stringState);
        this.attributeState = new AttributeState(this.gl, this.extLib, this.limLib, this.bufferState, this.elementState, this.programState, this.stats);
        this.renderbufferState = new RenderbufferState(this.gl, this.extLib, this.limLib, this.stats);
        this.framebufferState = new FramebufferState(this.gl, this.textureState, this.renderbufferState, this.extLib, this.limLib, this.stats);
        //build compiler core
        this.compilerCore = new CompilerCore({
            gl: this.gl,
            stats: this.stats,
            performance: this.performance,
            extLib: this.extLib,
            limLib: this.limLib,
            bufferState: this.bufferState,
            textureState: this.textureState,
            elementState: this.elementState,
            attributeState: this.attributeState,
            stringState: this.stringState,
            shaderState: this.shaderState,
            programState: this.programState,
            renderbufferState: this.renderbufferState,
            framebufferState: this.framebufferState
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     */
    public compile = <TA extends TAttribute, TU extends TUniform>(opts: ICompileOption<TA, TU>): IPipeCommand => {
        return this.compilerCore.compile(opts) as unknown as IPipeCommand;
    }

    /**
     * 
     * @param atts 
     * @param opts 
     * @returns 
     */
    public vao = <TA extends TAttribute>(
        atts: TA,
        opts: {
            elements?: GElementsbuffer | ShapedArrayFormat,
            offset?: number,
            count?: number,
            instances?: number,
            primitive?: SPrimitive
        } = {}
    ): GVertexArrayObject => {
        return this.attributeState.createREGLVertexArrayObject(atts, opts);
    }

    /**
     * 创建2D纹理
     * @param data 
     * @param w 
     * @param h 
     * @param c 
     * @param stride 
     * @param offset 
     * @param opts 
     * @returns 
     */
    public texture2D = (
        data: TypedArrayFormat,
        w: number,
        h: number,
        c: number,
        opts: {
            stride?: number[],
            offset?: number,
            min?: STextureMINFilter,             //minFilter
            mag?: STextureMAGFilter,             //magFilter
            wrapS?: STextureFillTarget,          //wrapS
            wrapT?: STextureFillTarget,          //wrapT
            mipmap?: SMipmapHint,                 //mipmap采样方式
            anisotropic?: 1 | 2 | 3,                 //各项异性过滤
        } = {}
    ): GTexture => {
        return this.textureState.createTexture2D(data, w, h, c, opts)
    }

    /**
     * 创建空的2D纹理
     * @param w 
     * @param h 
     * @param c 
     * @param opts 
     */
    public texture2DEmpty = (
        w: number,
        h: number,
        c: number,
        opts: {
            stride?: number[],
            offset?: number,
            min?: STextureMINFilter,             //minFilter
            mag?: STextureMAGFilter,             //magFilter
            wrapS?: STextureFillTarget,          //wrapS
            wrapT?: STextureFillTarget,          //wrapT
            mipmap?: SMipmapHint,                 //mipmap采样方式
            anisotropic?: 1 | 2 | 3,                 //各项异性过滤
        } = {}
    ): GTexture => {
        const emptyData = new Uint8Array(w * h * c);
        return this.texture2D(emptyData, w, h, c, opts);
    }

    /**
     * 
     * @param faces 
     * @param w 
     * @param h 
     * @param c 
     * @param opts 
     * @returns 
     */
    public textureCube = (      faces:{
        posx:TypedArrayFormat,
        negx:TypedArrayFormat,
        posy:TypedArrayFormat,
        negy:TypedArrayFormat,
        posz:TypedArrayFormat,
        negz:TypedArrayFormat,
    },
    w:number,
    h:number,
    c:number,
    opts: {
        stride?: number[],
        offset?: number,
        min?: STextureMINFilter,                 //minFilter
        mag?: STextureMAGFilter,                 //magFilter
        wrapS?: STextureFillTarget,              //wrapS
        wrapT?: STextureFillTarget,              //wrapT
        mipmap?: SMipmapHint,                    //mipmap采样方式
        anisotropic?: 1 | 2 | 3,                 //各项异性过滤
    } = {}):GTexture =>{
        return this.textureState.createTextureCube(faces, w, h, c, opts);
    }

    /**
     * 
     * @param opts 
     * @returns 
     */
    public renderbuffer = (
        opts: {
            w: number,
            h: number,
            format: SRenderbufferColor   //format
        }
    ): GRenderbuffer => {
        return this.renderbufferState.createRenderbuffer(opts);
    }

    /**
     * 
     * @param data 
     * @param opts 
     * @returns 
     */
    public buffer = (
        data: ShapedArrayFormat,
        opts: {
            target?: SArraybufferTarget,
            usage?: SUsage,
            component?: SComponent,
            dimension?: SDimension,
            byteLength?: number
        } = {}
    ): GBuffer => {
        return this.bufferState.createBuffer({
            data,
            usage: opts.usage,
            component: opts.component,
            target: opts.target,
            dimension: opts.dimension,
            byteLength: opts.byteLength
        });
    }

    /**
     * 
     * @param opts 
     * @returns 
     */
    public framebuffer = (
        opts: {
            colors?: (GTexture | GRenderbuffer)[],
            depth?: GRenderbuffer,
            stencil?: GRenderbuffer,
            depthStencil?: GRenderbuffer
        }
    ): GFramebuffer => {
        return this.framebufferState.createFramebuffer(opts);
    }

    /**
     * 
     * @param opts 
     */
    public clear = (
        opts: {
            color: number[],
            depth?: boolean,
            stencil?: boolean
        }
    ) => {
        const gl = this.gl;
        const { color, depth, stencil } = opts;
        check(color.length === 4, `Error: clear color must consist of 4`);
        //clear to black, fluuy opaque
        gl.clearColor(color[0], color[1], color[2], color[3]);
        let bit = gl.COLOR_BUFFER_BIT;
        if (depth) bit = bit | gl.DEPTH_BUFFER_BIT;
        if (stencil) bit = bit | gl.STENCIL_BUFFER_BIT;
        //clear
        gl.clear(bit);
    }
}

export {
    IPipeCommand,
    PipeGL
}