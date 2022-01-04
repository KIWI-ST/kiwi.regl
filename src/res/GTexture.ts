import { check } from '../util/check';
import { Limit } from '../core/Limit';
import { IStats } from '../util/createStats';
import { Dispose } from '../core/Dispose';
import { IMipmap } from '../pool/MipmapPool';
import { ITexFlag } from '../util/createTexFlag';
import { CTextureMapTarget } from '../core/Constant';
import { STextureFillTarget, STextureMAGFilter, STextureMapTarget, STextureMINFilter } from "../core/Support";

/**
 * @description 
 * texture paramater 记录，应用在输入传入时对GPU如何插值补全
 */
interface ITexInfo {
    /**
     * 
     */
    wrapS?: STextureFillTarget;

    /**
     * 
     */
    wrapT?: STextureFillTarget;

    /**
     * 
     */
    magFilter?: STextureMAGFilter;

    /**
     * 
     */
    minFilter?: STextureMINFilter;

    /**
     * 各向异性过滤
     * 处理视角变化导致3D物体表面倾斜时为u能力错误
     * 原理：记录相邻像素及彼此相对关系，在视角改变时读取绘制
     * 三线性过滤采集范围更大，计算更准确（更耗性能）
     */
    anisotropic?: 1 | 2 | 3;

    /**
     * 加速贴图渲染和减少图形抗拒着
     * 贴图被处理成由一系列被预先计算和优化过的图片组成的文件
     * mip，希腊语，multum in parv，意思是“放置很多小东西的空间”
     * mipmap遵循小波压缩规则，每一层按照四分之一大小等比例压缩，例如
     *      0           1          2
     *   256x256     128x128     64x64
     */
    genMipmaps?: boolean;

    /**
     * 
     */
    mimmapHint?: number;
}

/**
 * 纹理资源映射
 */
const TEXTURE_SET: Map<number, GTexture> = new Map();

/**
 * 当前设备维护的总纹理资源
 */
const TEXTURE_UNIT_ARR: GTexture[] = [];

/**
 * 临时用来active绑定纹理的纹理单元  
 */
const TEXTURE0$1: number = 0x84C0;

/**
 * 临时用来active绑定纹理的纹理单元（tmp)
 */
const TEXTURE2D$1: number = 0x0DE1;

/**
 * 
 */
class GTexture extends Dispose {
    /**
     * 
     */
    dispose(): void {
        throw new Error('Method not implemented.');
    }

    /**
     * 
     */
    decRef(): void {
        if (--this.refCount <= 0)
            this.dispose();
    }

    /**
     * WebGL绘制上下文
     */
    private gl: WebGLRenderingContext;

    /**
     * tex info
     */
    private texInfo: ITexInfo;

    /**
     * 如果纹理包含mipmap. 则设置成mipmap/mask一致
     */
    private mipmap: IMipmap;

    /**
     * 
     */
    private texFlag: ITexFlag;

    /**
     * 
     */
    private limLib: Limit;

    /**
     * actual webgl texture object
     */
    private texture: WebGLTexture;

    /**
     * 纹理类型，包含texture2d, textureCube等
     */
    private target: number;

    /**
     * 纹理内部格式，如 RGB/RGBA
     */
    private textureColor: number;

    /**
     * 当前使用纹理单元号
     */
    private unit: number;

    /**
     * texture 绑定次数（计数）
     */
    private bindCount: number;

    /**
     * 
     */
    private isCubeTexture: boolean = false;

    /**
     * 
     */
    private stats: IStats;

    /**
     * 
     */
    set TexInfo(v: ITexInfo) {
        this.texInfo = v;
    }

    /**
     * 纹理信息
     */
    get TexInfo(): ITexInfo {
        return this.texInfo;
    }

    /**
     * 
     */
    set TexFlag(v: ITexFlag) {
        this.texFlag = v;
    }

    /**
     * 
     */
    get TexFlag(): ITexFlag {
        return this.texFlag;
    }

    /**
     * 
     */
    set Mipmap(v: IMipmap) {
        this.mipmap = v;
    }

    /**
     * 
     */
    get Mipmap(): IMipmap {
        return this.mipmap;
    }

    /**
     * 像素宽度
     */
    get Width(): number {
        return this.mipmap.width;
    }

    /**
     * 像素高度
     */
    get Height(): number {
        return this.mipmap.height;
    }

    /**
     * 通道
     */
    get Channels(): number {
        return this.mipmap.channels;
    }

    /**
     * 
     */
    get Texutre(): WebGLTexture {
        return this.texture;
    }

    /**
     * 返回是否是立方体贴图
     */
    get IsCubeTexture(): boolean {
        return this.isCubeTexture;
    }

    /**
     * 
     * @param gl 
     * @param limLib 
     * @param target 
     * @param stats 
     */
    constructor(
        gl: WebGLRenderingContext,
        limLib: Limit,
        target: STextureMapTarget,
        stats: IStats
    ) {
        super();
        this.gl = gl;
        this.target = CTextureMapTarget[target || 'TEXTURE_2D'];
        this.bindCount = 0;
        this.unit = -1;
        this.limLib = limLib;
        this.refCount = 1;
        this.texture = gl.createTexture();
        this.stats = stats;
        if (this.target === CTextureMapTarget.TEXTURE_2D)
            this.stats.textureCount++;
        else if (this.target === CTextureMapTarget.TEXTURE_CUBE_MAP) {
            this.isCubeTexture = true;
            this.stats.cubeCount++;
        }
        TEXTURE_SET.set(this.ID, this);
    }

    /**
     * 
     * @returns 
     */
    public bind = (): number => {
        const gl = this.gl, target = this.target;
        const numTexUnits = this.limLib.maxTextureUnits;
        this.bindCount++;
        if (this.unit < 0) {
            for (let i = 0; i < numTexUnits; ++i) {
                const other = TEXTURE_UNIT_ARR[i];
                if (other) {
                    if (other.bindCount > 0) continue;
                    other.unit = -1;
                }
                TEXTURE_UNIT_ARR[i] = this;
                this.unit = i;
                break;
            }
            check(this.unit < numTexUnits, `REGLTexture错误：使用纹理超过设备支持上限${this.limLib.maxTextureUnits}`);
            gl.activeTexture(gl.TEXTURE0 + this.unit);
            gl.bindTexture(target, this.texture);
        }
        return this.unit;
    }

    /**
     * 
     * @returns 
     */
    public unbind = (): number => {
        return this.bindCount--;
    }

    /**
     * 
     */
    tempBind = (): void => {
        const gl = this.gl, target = this.target;
        gl.activeTexture(TEXTURE0$1);
        gl.bindTexture(target, this.texture);
    }

    /**
     * 
     */
    tempRestore = (): void => {
        const gl = this.gl, prev = TEXTURE_UNIT_ARR[0];
        if (prev) {
            const target = prev.target;
            gl.bindTexture(target, prev.texture);
        }
        else
            gl.bindTexture(TEXTURE2D$1, null);
    }
}

export {
    TEXTURE_UNIT_ARR,
    TEXTURE_SET,
    ITexInfo,
    GTexture
}