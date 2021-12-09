
/**
 * reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/blendEquation
 */
const CBlendFunc = {
    /**
     * des = source + target
     */
    FUNC_ADD: 0x8006,

    /**
     * des = source - target
     */
    FUNC_SUBTRACT: 0x800A,

    /**
     * des = target - source
     */
    FUNC_REVERSE_SUBTRACT: 0x800B,

    /**
     * EXT_blend_minmax, min(v0, v1)
     */
    MIN_EXT: 0x8007,

    /**
     * EXT_blend_minmax, max(v1, v1)
     */
    MAX_EXT: 0x8008
}

/**
 * component data type gl enum
 */
const CComponent = {
    /**
     * 5120
     */
    BYTE: 0x1400,

    /**
     * 5121
     */
    UNSIGNED_BYTE: 0x1401,

    /**
     * 5122
     */
    SHORT: 0x1402,

    /**
     * 5123
     */
    UNSIGNED_SHORT: 0x1403,

    /**
     * 5124
     */
    INT: 0x1404,

    /**
     * 5125
     */
    UNSIGNED_INT: 0x1405,

    /**
     * 5126
     */
    FLOAT: 0x1406,
}

/**
 * supported render type
 */
const CPrimitive = {
    /**
     * draw points
     */
    POINTS: 0,

    /**
     * draw line
     */
    LINES: 1,

    /**
     * close line
     */
    LINE_LOOP: 2,

    /**
     * draw end to end n lines using n+1 points
     */
    LINE_STRIP: 3,

    /**
     * draw triangle, most common
     */
    TRIANGLES: 4,

    /**
     * draw triangles
     */
    TRIANGLE_STRIP: 5,

    /**
     * draw triangle with the first point as the center and the other points around it
     */
    TRIANGLE_FAN: 6,
}

/**
 * Texture enum, TextureCube:
 * 
 *          |----| 
 *          | -y |
 * ----|----|----|----|
 *  -z | -x | +z | +x |
 * ----|----|----|----|
 *          | +y |
 *          |----|
 * 
 */
const CTextureMapTarget = {
    /**
     * 
     */
    TEXTURE_2D: 0x0DE1,

    /**
     * cube map texture
     */
    TEXTURE_CUBE_MAP: 0x8513,

    /**
     * +x face
     */
    TEXTURE_CUBE_MAP_POSITIVE_X: 0x8515,

    /**
     * -x face
     */
    TEXTURE_CUBE_MAP_NEGATIVE_X: 0x8516,

    /**
     * 
     */
    TEXTURE_CUBE_MAP_POSITIVE_Y: 0x8517,

    /**
     * 
     */
    TEXTURE_CUBE_MAP_NEGATIVE_Y: 0x8518,

    /**
     * 
     */
    TEXTURE_CUBE_MAP_POSITIVE_Z: 0x8519,

    /**
     * 
     */
    TEXTURE_CUBE_MAP_NEGATIVE_Z: 0x851A,
}

/**
 * shader type
 */
const CShaderTarget = {
    /**
     * fragment shader
     */
    FRAGMENT_SHADER: 0x8B30,

    /**
     * vertex shader
     */
    VERTEX_SHADER: 0x8B31,
}

/**
 * arraybuffer obejct
 */
const CArraybufferTarget = {
    /**
     * 
     */
    ARRAY_BUFFER: 0x8892,

    /**
     * 
     */
    ELEMENT_ARRAY_BUFFER: 0x8893,
}

/**
 * draw type, the different areas of memory alloc data
 */
const CUsage = {
    /**
     * common use, don't often change
     */
    STATIC_DRAW: 0x88E4,

    /**
     * don't often change
     */
    STREAM_DRAW: 0x88E0,

    /**
     * common use, often changed
     */
    DYNAMIC_DRAW: 0x88E8,
}

/**
 * element buffer data dimension
 */
const CDimension = {
    /**
     * 
     */
    POINTS: 1,

    /**
     * 
     */
    LINES: 2,

    /**
     * 
     */
    TRIANGLES: 3
}

/**
 * active type
 */
const CActiveTarget = {
    /**
     * actived attribute in linked program
     */
    ACTIVE_ATTRIBUTES: 0x8B89,

    /**
     * actived uniforms in linked program
     */
    ACTIVE_UNIFORMS: 0x8B86,
}

/**
 * vector type (size)
 */
const CVector = {
    /**
     * point
     */
    SCALAR: 1,

    /**
     * line
     */
    VEC2: 2,

    /**
     * line in 3d
     */
    VEC3: 3,

    /**
     * homogeneous vector
     */
    VEC4: 4,

    /**
     * 2x2 matrix
     */
    MAT2: 4,

    /**
     * 3x2 matrix
     */
    MAT3: 9,

    /**
     * 3x3 matrix
     */
    MAT4: 16,
}

/**
 * framebuffer attachment target
 */
const CAttachmentTarget = {
    /**
     * color/depth/stencil
     */
    TEXTURE_2D: 0x0DE1,

    /**
     * render buffer object
     */
    RENDERBUFFER: 0x8D41,
}

/**
 * fill texture mode
 */
const CTextureFillTarget = {
    /**
     * repeat
     */
    REPEAT: 0x2901,

    /**
     * clamp mode, extend to edge
     */
    CLAMP_TO_EDGE: 0x812F,

    /**
     * mirror repreat
     */
    MIRRORED_REPEAT: 0x8370,
}

/**
 * interpretation mode
 */
const CMipmapHint = {
    /**
     * there is on preference for this behavior
     */
    DONT_CARE: 0x1100,

    /**
     * the most efficient behavior should be used
     */
    FASTEST: 0x1101,

    /**
     * the most correct or the highest quality option should be used
     */
    NICEST: 0x1102
}

/**
 *    wrap_T
 *    |
 *    |
 *    |_ _ _ _  warp_S
 *  (0,0)
 * 
 */
const CTextureWrapTarget = {
    /**
     * horizon
     */
    TEXTURE_WRAP_S: 0x2802,

    /**
     * vertical
     */
    TEXTURE_WRAP_T: 0x2803,
}

/**
 * MAG filter
 */
const CTextureMAGFilter = {
    /**
     * 
     */
    NEAREST: 0x2600,

    /**
     * 
     */
    LINAR: 0x2601,
}

/**
 * min filter
 */
const CTextureMINFilter = {
    /**
     * 
     */
    NEAREST: 0x2600,

    /**
     * 
     */
    LINEAR: 0x2601,

    /**
     * 
     */
    NEAREST_MIPMAP_NEAREST: 0x2700,

    /**
     * 
     */
    LINEAR_MIPMAP_NEAREST: 0x2701,

    /**
     * 
     */
    NEAREST_MIPMAP_LINEAR: 0x2702,

    /**
     * 
     */
    LINEAR_MIPMAP_LINEAR: 0x2703,
}

/**
 * color space
 */
const CColorSpace = {
    /**
     * 
     */
    NONE: 0,

    /**
     * 
     */
    BROWSER_DEFAULT_WEBGL: 0x9244,
}

const CTextureComponent = {
    /**
     * 0-255
     */
    BYTE: 0x1400,

    /**
     * 0-127
     */
    UNSIGNED_BYTE: 0x1401,

    /**
     * Int16Array, no support Texture
     */
    SHORT: 0x1402,

    /**
     * uint 16
     */
    UNSIGNED_SHORT: 0x1403,

    /**
     * int32 array, not support texture
     */
    INT: 0x1404,

    /**
     * uint 32
     */
    UNSIGNED_INT: 0x1405,

    /**
     * float
     */
    FLOAT: 0x1406,

    /**
     * 
     */
    UNSIGNED_SHORT_4_4_4_4: 0x8033,

    /**
     * 
     */
    UNSIGNED_SHORT_5_5_5_1: 0x8034,

    /**
     * 
     */
    UNSIGNED_SHORT_5_6_5: 0x8363,

    /**
     * float 16
     */
    HALF_FLOAT_OES: 0x8D61,

    /**
     * depth stencil default
     */
    UNSIGNED_INT_24_8_WEBGL: 0x84FA,
}

/**
 * indicate texture channels
 */
const CTextureColor = {
    /**
     * 
     */
    ALPHA: 0x1906,

    /**
     * 
     */
    RGB: 0x1907,

    /**
     * 
     */
    RGBA: 0x1908,

    /**
     * 
     */
    RGBA4: 0x8056,

    /**
     * 
     */
    RGB5_A1: 0x8057,

    /**
     * 
     */
    RGB565: 0x8D62,

    /**
     * 
     */
    LUMINANCE: 0x1909,

    /**
     * 
     */
    LUMINANCE_ALPHA: 0x190A,

    /**
     * unsized sRGB format that leaves the precision up to the driver
     */
    SRGB_EXT: 0x8c40,

    /**
     * unsized sRGB format with unsized alpha component
     */
    SRGB_ALPHA_EXT: 0x8c42,

    /**
     * pixel formats, support depth component
     */
    DEPTH_COMPONENT: 0x1902,

    /**
     *  common used in bufferStorage, support depth/rbo
     */
    DEPTH_STENCIL: 0x84F9,
}

/**
 * convert texture type to component type
 */
const CTextureColor2Component = {
    /**
     * ox8033
     */
    RGBA4: 'UNSIGNED_SHORT_4_4_4_4',

    /**
     * 0x8034
     */
    RGB5_A1: 'UNSIGNED_SHORT_5_5_5_1'
}

/**
 * compress algorithm 
 */
const CTextureCompressed = {
    /**
     * rgb s3tc dxt1
     */
    COMPRESSED_RGB_S3TC_DXT1_EXT: 0x83F0,

    /**
     * rbga s3tc dxt1
     */
    COMPRESSED_RGBA_S3TC_DXT1_EXT: 0x83F1,

    /**
     * rgba s3tc dxt3
     */
    COMPRESSED_RGBA_S3TC_DXT3_EXT: 0x83F2,

    /**
     * rgba s3tc dxt5
     */
    COMPRESSED_RGBA_S3TC_DXT5_EXT: 0x83F3,
}

/**
 * texture component to size
 */
const CTextureComponentSize = {
    /**
     * byte, 5120
     */
    0x1400: 1,

    /**
     * unsigned_byte, 5121
     */
    0x1401: 1,

    /**
     * short, 5122
     */
    0x1402: 2,

    /**
     * unsigned_short, 5123
     */
    0x1403: 2,

    /**
     * int, 5124
     */
    0x1404: 4,

    /**
     * unsigned_int, 5125
     */
    0x1405: 4,

    /**
     * float, 5126
     */
    0x1406: 4,

    /**
     * half float (EXT)
     */
    0x8D61: 2,

    /**
     * UNSIGNED_SHORT_5_6_5
     */
    0x8363: 2,

    /**
     * UNSIGNED_SHORT_4_4_4_4
     */
    0x8033: 2,

    /**
     * UNSIGNED_SHORT_5_5_5_1
     */
    0x8034: 2,

    /**
     * UNSIGNED_INT_24_8_WEBGL
     */
    0x84FA: 4,
}

/**
 * combine texture channel count
 */
const CTextureChannelCount = {
    /**
     * lumiance
     */
    0x1909: 1,

    /**
     * alpha
     */
    0x1906: 1,

    /**
     * depth
     */
    0x1902: 1,

    /**
     * depth stencil, common used in bufferStorage, support depth/stencil buffer
     */
    0x84F9: 2,

    /**
     * luminance_alpha
     */
    0x190A: 2,

    /**
     * rbg
     */
    0x1907: 3,

    /**
     * SRGB_EXT, unsized sRGB format that leaves the precision up to the driver
     */
    0x8c40: 3,

    /**
     * RGBA
     */
    0x1908: 4,

    /**
     * SRGB_ALPHA_EXT, unsized sRGB format with unsized alpha compinent
     */
    0x8c42: 4,
}

/**
 * renderbuffer support color type
 */
const CRenderbufferColor = {
    /**
     * rgba4
     */
    RGBA4: 0x8056,

    /**
     * rgb565
     */
    RGB565: 0x8D62,

    /**
     * rgb5 a1
     */
    RGB5_A1: 0x8057,

    /**
     * depth
     */
    DEPTH_COMPONENT16: 0x81A5,

    /**
     * stencil
     */
    STENCIL_INDEX8: 0x8D48,

    /**
     * depth stencil, common used in bufferStorage, support depth/stencil rbo
     */
    DEPTH_STENCIL: 0x84F9,

    /**
     * srgba
     */
    SRGB8_ALPHA8_EXT: 0x8c43,

    /**
     * rgb16
     */
    RGB16F_EXT: 0x881B,

    /**
     * rgba16f
     */
    RGBA16F_EXT: 0x881A,

    /**
     * rgba32f
     */
    RGBA32F_EXT: 0x8814,
}

/**
 * 
 */
const CWebGLStatusTYPE = {
    /**
     * webgl status flag 
     * gl.enable, gl.disable
     */
    FLAG: 1,

    /**
     * 
     */
    BOOLEAN: 2,

    /**
     * 
     */
    ARRAY: 3,

    /**
     * deconsturcted array
     */
    DECARRAY: 4,

    /**
     * 
     */
    NUMBER: 5,
}

/**
 * 
 */
const CWebGLStatusFLAG = {
    /**
     * 
     */
    DITHER: CWebGLStatusTYPE.FLAG,

    /**
     * 
     */
    BLEND: CWebGLStatusTYPE.FLAG,

    /**
     * 
     */
    DEPTH_TEST: CWebGLStatusTYPE.FLAG,

    /**
     * 
     */
    CULL_FACE: CWebGLStatusTYPE.FLAG,

    /**
     * 
     */
    POLYGON_OFFSET_FILL: CWebGLStatusTYPE.FLAG,

    /**
     * 
     */
    SAMPLE_ALPHA_TO_COVERAGE: CWebGLStatusTYPE.FLAG,

    /**
     * 
     */
    SAMPLE_COVERAGE: CWebGLStatusTYPE.FLAG,

    /**
     * 
     */
    STENCIL_TEST: CWebGLStatusTYPE.FLAG,

    /**
     * lock pixel
     */
    SCISSOR_TEST: CWebGLStatusTYPE.FLAG,
}

/**
 * 
 */
const CWebGLStatusVariable = {
    /**
     * 
     */
    blendColor: CWebGLStatusTYPE.ARRAY,

    /**
     * 
     */
    scissor: CWebGLStatusTYPE.DECARRAY,

    /**
     * 
     */
    blendEquationSeparate: CWebGLStatusTYPE.DECARRAY,

    /**
     * 
     */
    blendFuncSeparate: CWebGLStatusTYPE.DECARRAY,

    /**
     * blend func
     */
    blendFunc:CWebGLStatusTYPE.DECARRAY,

    /**
     * 
     */
    depthFunc: CWebGLStatusTYPE.NUMBER,

    /**
     * 
     */
    depthRange: CWebGLStatusTYPE.DECARRAY,

    /**
     * 
     */
    depthMask: CWebGLStatusTYPE.BOOLEAN,

    /**
     * 
     */
    colorMask: CWebGLStatusTYPE.DECARRAY,

    /**
     * 
     */
    cullFace: CWebGLStatusTYPE.NUMBER,

    /**
     * 
     */
    frontFace: CWebGLStatusTYPE.NUMBER,

    /**
     * 
     */
    lineWidth: CWebGLStatusTYPE.NUMBER,

    /**
     * 
     */
    polygonOffset: CWebGLStatusTYPE.DECARRAY,

    /**
     * 
     */
    sampleCoverage:CWebGLStatusTYPE.DECARRAY,

    /**
     * 
     */
    stencilMask: CWebGLStatusTYPE.NUMBER,

    /**
     * 
     */
    stencilFunc: CWebGLStatusTYPE.DECARRAY,

    /**
     * 
     */
    stencilOpSeparate: CWebGLStatusTYPE.DECARRAY,

    /**
     * 模板缓冲后的操作方式
     */
    stencilOp:CWebGLStatusTYPE.DECARRAY,

    /**
     * 
     */
    viewport: CWebGLStatusTYPE.DECARRAY,
}

/**
 * active attribute info type size
 */
const CAttributeTS={
    /**
     * FLOAT
     */
    5126:1,     //float

    /**
     * FLOAT_VEC2
     */
    35664:2,

    /**
     * FLOAT_VEC3
     */
    35665:3,  

    /**
     * FLOAT_VEC4
     */
    35666:4,

    /**
     * INT_VEC2
     */
    35667:2,    

    /**
     * INT_VEC3
     */
    35668:3,    

    /**
     * INT_VEC4
     */
    35669:4,

    /**
     * BOOL_VEC2
     */
    35671:2,   

    /**
     * BOOL_VEC3
     */
    35672:3,   

    /**
     * BOOL_VEC4
     */
    35673:4,
}

export {
    CWebGLStatusTYPE,
    CWebGLStatusFLAG,
    CWebGLStatusVariable,

    CColorSpace,
    CTextureColor,
    CRenderbufferColor,
    CTextureColor2Component,
    CTextureCompressed,
    CTextureComponentSize,
    CTextureMAGFilter,
    CTextureComponent,
    CTextureMINFilter,
    CTextureChannelCount,
    CTextureWrapTarget,

    CDimension,
    CComponent,
    CPrimitive,
    CUsage,
    CVector,

    CBlendFunc,
    CMipmapHint,

    CShaderTarget,
    CArraybufferTarget,
    CActiveTarget,
    CAttachmentTarget,
    CTextureFillTarget,
    CTextureMapTarget,

    CAttributeTS,
}