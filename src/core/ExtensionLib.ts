import { ExtensionFormat } from "./Format";

interface IExtensionLib {
    EXT_blend_minmax?:EXT_blend_minmax,
    EXT_texture_filter_anisotropic?:EXT_texture_filter_anisotropic,
    EXT_frag_depth?:EXT_frag_depth,
    ANGLE_instanced_arrays?:ANGLE_instanced_arrays
    EXT_shader_texture_lod?:EXT_shader_texture_lod,
    EXT_sRGB?:EXT_sRGB,
    OES_vertex_array_object?:OES_vertex_array_object,
    WEBGL_compressed_texture_astc?:WEBGL_compressed_texture_astc,
    WEBGL_debug_shaders?:WEBGL_debug_shaders,
    WEBGL_draw_buffers?:WEBGL_draw_buffers,
    WEBGL_depth_texture?:WEBGL_depth_texture,
    WEBGL_debug_renderer_info?:WEBGL_debug_renderer_info,   //查此插件用途
    WEBGL_compressed_texture_s3tc?:WEBGL_compressed_texture_s3tc,
    OES_texture_half_float_linear?:OES_texture_half_float_linear,
    OES_texture_half_float?:OES_texture_half_float
    OES_texture_float?:OES_texture_float,
    OES_standard_derivatives?:OES_standard_derivatives,
    OES_element_index_uint?:OES_element_index_uint
}

type SExtension = keyof {
    [key in keyof IExtensionLib]: string
}

/**
 * @deate 2021/8/16
 * @author axmand
 * @description rendering context management
 */
class ExtensionLib {
    /**
     * rendering context
     */
    private gl:WebGLRenderingContext;

    /**
     * extension library
     */
    private extensions:IExtensionLib;

    /**
     * 
     * @param gl 
     * @param extNames extension array
     */
    constructor(gl:WebGLRenderingContext, ...extNames:SExtension[]){
        this.gl = gl;
        this.extensions = {};
        for(let i=0, len = extNames.length;i<len;i++){
            const extName = extNames[i] as SExtension;
            const ext = gl.getExtension(extName);
            if(!!ext){
                this.extensions[extName] = ext;
                console.log(`pipegl extension ${extName} load successful`);
            }else{
                console.log(`pipegl extension ${extName} load fail`);
            }
        }
    }

    /**
     * @description get extension by extName
     * @param extName 
     * @returns 
     */
    get = (extName:SExtension):ExtensionFormat|undefined =>{
        return this.extensions[extName] as ExtensionFormat;
    }

    getByForce = (extName:SExtension):ExtensionFormat|undefined=>{
        const gl = this.gl, extensions = this.extensions;
        const ext:ExtensionFormat = extensions[extName] = extensions[extName] || gl.getExtension(extName);
        return ext;
    }
}

export {
    IExtensionLib,
    SExtension,
    ExtensionLib
}