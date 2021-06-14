/**
 * 矢量类型长度
 */
enum VectorFormateSize {
    /**
     * 点向量
     */
    SCALAR = 1,

    /**
     * 线向量
     */
    VEC2 = 2,

    /**
     * 三维空间线向量
     */
    VEC3 = 3,

    /**
     * 齐次表示三维空间向量
     */
    VEC4 = 4,

    /**
     * 2x2矩阵
     */
    MAT2 = 4,

    /**
     * 3x3矩阵
     */
    MAT3 = 9,

    /**
     * 4x4矩阵
     */
    MAT4 = 16
}

/**
 * webgl元数据类型size
 */
const ComponentFormateSize = {

    /**
     * gl.unsinged_byte
     */
    0x1401: 1,

    /**
     * GL_UNSIGNED_SHORT
     */

    0x1403: 2,

    /**
    * GL_UNSIGNED_INT
    */
    0x1405: 4,

    /**
     * gl.float
     */
    0x1406: 4,

    /**
     * 需要扩展支持，半精度浮点
     * GL_HALF_FLOAT_OES
     */
    0x8D61: 2
}

export {
    VectorFormateSize,
    ComponentFormateSize
}