/**
 * @author axmand
 * @date 2021/6/7
 * 用于限定输入数据类型，强化类型的概念便于理解和维护
 */

/**
 * 限定输入类型必须是typedArray
 */
 type TypedArrayFormate = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;

/**
 * RGB颜色表示Texture，Image颜色读取规则
 */
enum ImageFormate {
    /**
     * R-G-B formate
     */
    RGB = 0x1907,

    /**
     * R-G-B-A formate
     */
    RGBA = 0x1908,
}

/**
 * Texture类型
 * https://blog.csdn.net/huangzhipeng/article/details/7957233
 * 
 *              |------|
 *              |  -Y  |   
 * ------|------|------|------|
 *   -Z  |  -X  |  +Z  |  +X  |
 * ------|------|------|------|
 *              |  +Y  |
 *              |------|
 */
enum TextureFormate {
    /**
     * 表示整张纹理（非立方体）
     */
    TEXTURE_2D = 0x0DE1,

    /**
     * 表示立方体纹理 +X 面
     */
    TEXTURE_CUBE_MAP_POSITIVE_X = 0x8515,

    /**
     * 表示立方体纹理 -X 面
     */
    TEXTURE_CUBE_MAP_NEGATIVE_X = 0x8516,

    /**
     * 表示立方体纹理 +Y 面
     */
    TEXTURE_CUBE_MAP_POSITIVE_Y = 0x8517,

    /**
     * 表示立方体纹理 -Y 面
     */
    TEXTURE_CUBE_MAP_NEGATIVE_Y = 0x8518,

    /**
    * 表示立方体纹理 +Z 面
    */
    TEXTURE_CUBE_MAP_POSITIVE_Z = 0x8519,

    /**
     * 表示立方体纹理 +Z 面
     */
    TEXTURE_CUBE_MAP_NEGATIVE_Z = 0x851A,
}

/**
 * 缓冲对象
 */
enum BufferFormate {
    /**
     * 顶点缓冲
     */
    ARRAY_BUFFER = 0x8892,

    /**
     * 索引缓冲
     */
    ELEMENT_ARRAY_BUFFER = 0x8893
}

/**
 * 绘制方式，指示数据存放在显存的不同区域
 */
enum DrawFormate {
    /**
     * 常用且不常变动的数据的绘制方式
     */
    STATIC_DRAW = 0x88E4,

    /**
     * 不常用的数据
     */
    STREAM_DRAW = 0x88E0,

    /**
     * 常用且长变动的顶点数据绘制方式
     */
    DYNAMIC_DRAW = 0x88E8
}

/**
 * 着色器类型
 */
enum ShaderFormate {
    /**
     * 片源着色器
     */
    FRAGMENT_SHADER = 0x8B30,

    /**
     * 顶点着色器
     */
    VERTEX_SHADER = 0x8B31,
}
/**
 * 指示WebGL Program中激活的类型枚举
 */
enum ActiveFormate {
    /**
     * Program中激活的attributes
     */
    ACTIVE_ATTRIBUTES = 0x8B89,

    /**
     * Program中激活的Uniforms
     */
    ACTIVE_UNIFORMS = 0x8B86
}

/**
 * 指示矢量类型
 */
enum VectorFormate {
    /**
     * 点向量
     */
    SCALAR = 'SCALAR',

    /**
     * 线向量
     */
    VEC2 = 'VEC2',

    /**
     * 三维空间线向量
     */
    VEC3 = 'VEC3',

    /**
     * 齐次表示三维空间向量
     */
    VEC4 = 'VEC4',

    /**
     * 2x2矩阵
     */
    MAT2 = 'MAT2',

    /**
     * 3x3矩阵
     */
    MAT3 = 'MAT3',

    /**
     * 4x4矩阵
     */
    MAT4 = 'MAT4'
}

/**
 * webgl元数据类型，例如 FLOAT, INT等
 */
enum ComponentFormate{

    /**
     * gl.BYTE, 5120
     */
    BYTE = 0x1400,

    /**
     * gl.UNSIGNED_BYTE, 5121
     */
    UNSIGNED_BYTE = 0x1401, 

    /**
     * gl.SHORT, 5122
     */
    SHORT = 0x1402,

    /**
     * gl.UNSIGNED_SHORT, 5123
     */
    UNSIGNED_SHORT = 0x1403,

    /**
     * gl.INT, 5124
     */
    INT = 0x1404,

    /**
     * gl.UNSIGNED_INT, 5125
     */
    UNSIGNED_INT = 0x1405,

    /**
     * gl.FLOAT, 5126
     */
    FLOAT = 0x1406,

    /**
     * 半精度浮点
     * gl.HALF_FLOAT_OES
     */
    HALF_FLOAT_OES = 0x8D61
}

export {
    TypedArrayFormate,
    ImageFormate,
    TextureFormate,
    BufferFormate,
    DrawFormate,
    ActiveFormate,
    VectorFormate,
    ShaderFormate,
    ComponentFormate
}