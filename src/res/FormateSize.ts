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
     * gl.BYTE, 5120, (int8)
     */
    0x1400: 1,

    /**
     * gl.unsinged_byte, 5121 (uint8)
     */
    0x1401: 1,

    /**
     * gl.SHORT, 5122 (int16)
     */
    0x1402: 2,

    /**
     * GL_UNSIGNED_SHORT, 5123 (uint16)
     */

    0x1403: 2,

    /**
     * gl.INT, 5124, (int32)
     */
    0x1404: 4,

    /**
    * GL_UNSIGNED_INT, 5125, (uint32)
    */
    0x1405: 4,

    /**
     * gl.FLOAT, 5126, (float32)
     */
    0x1406: 4,

    /**
     * 需要扩展支持，半精度浮点
     * gl.GL_HALF_FLOAT_OES (float16)
     */
    0x8D61: 2
}

export {
    VectorFormateSize,
    ComponentFormateSize
}