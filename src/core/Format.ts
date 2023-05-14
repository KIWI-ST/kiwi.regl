/**
 * webgl ext type
 */
type ExtensionFormat = EXT_blend_minmax | EXT_frag_depth | EXT_texture_filter_anisotropic | ANGLE_instanced_arrays | EXT_shader_texture_lod | OES_vertex_array_object | WEBGL_compressed_texture_astc | WEBGL_debug_shaders | WEBGL_draw_buffers | WEBGL_depth_texture | WEBGL_debug_renderer_info | WEBGL_compressed_texture_s3tc | OES_texture_half_float_linear | OES_texture_half_float | OES_texture_float | OES_standard_derivatives | OES_element_index_uint |OES_texture_float_linear;

/**
 * type array
 */
type TypedArrayFormat = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;

/**
 * support flatten array type
 */
type ShapedArrayFormat = number[][][] | number[][] | number[] | TypedArrayFormat;

export {
    type ExtensionFormat,
    type TypedArrayFormat,
    type ShapedArrayFormat
}