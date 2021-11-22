import { CComponent } from "../core/Constant";
import { Extension } from "../core/Extension";
import { ShapedArrayFormat } from "../core/Format";
import { Pipeline } from "../core/Pipeline";
import { SComponent } from "../core/Support";
import { REGLBuffer } from "../res/REGLBuffer";
import { IAttributeRecord } from "../res/REGLVertexArrayObject";
import { BufferState } from "../state/BufferState";
import { check } from "../util/check";
import { checkAttribute } from "../util/checkAttribute";
import { isBufferArray } from "../util/isBufferArray";

/**
 * 
 */
interface IAttributeBuffer {
    /**
     * 数组对象（缓冲）
     */
    buffer: REGLBuffer | ShapedArrayFormat;

    /**
     * 顶点属性偏移量，按byte位偏移
     */
    offset?: number;

    /**
     * 扫描线跳跃byte位
     */
    stride?: number;

    /**
     * 实例化绘制时指定通用听顶一次绘制几次
     */
    divisor?: number;

    /**
     * 每个点size，例如Vec3的size为3, vec2的size为2
     */
    size?: number;

    /**
     * 输入数据是否已归一化
     */
    normalized?: boolean;

    /**
     * 输入数据类型，如BYTE/FLOAT等
     */
    component?: SComponent;
}

/**
 * 限定attribute接口约定类型范围
 */
type TAttribute = {
    [propName in string | number]: ShapedArrayFormat | IAttributeBuffer;
}

/**
 * @description
 * 解析输入的attribute类型得到record, 需要注意：
 * -解析得到的reglbuffer作为资源Link到当前pipeline中
 * -record解析只记录link后的名称, 不记录buffer资源
 * -draw操作时根据buffer资源存在与否，对record资源赋值
 * 
 * @example
 * const recordSet = parseAttributeRecord();
 * 
 * @param opts 
 * @returns 
 */
const parseAttribute = <TA extends TAttribute>(
    opts: {
        pipeline: Pipeline,
        attributes: TA,
        extLib: Extension,
        bufferState: BufferState
    }
): Map<string, IAttributeRecord> => {
    const { pipeline, attributes, extLib, bufferState } = opts;
    const RECORD_SET: Map<string, IAttributeRecord> = new Map();
    Object.keys(attributes)?.forEach((key: string) => {
        const v = attributes[key];
        checkAttribute(v);
        const record: IAttributeRecord = { name: key };
        /**
         * @description 数组处理
         * @example
         * 
         * attributes:{
         *      color:{
         *          constant: [1, 0, 1, 1]
         *      }
         * }
         * 
         */
        if (isBufferArray(v)) {
            const v0: ShapedArrayFormat = v as ShapedArrayFormat;
            const buf = bufferState.createBuffer({
                data: v0,
                target: 'ARRAY_BUFFER'
            });
            //buffer需要绑定是因为buf直接被vao使用，不需要初始化与各program重复绑定
            record.buffer = buf;
            record.component = buf.Component;
            record.divisor = 0;
            record.offset = 0;
            record.stride = 0;
            record.normalized = false;
            record.ln = pipeline.link(buf);
        }
        /**
         * 处理带其他属性的attribute
         * @example
         * attributes:{
         *  normals:{
         *      buffer:new REGLBuffer(),
         *      offset:0,
         *      stride:12,
         *      normalized:false,
         *      divisor:0 
         *  }
         * }
         */
        else if ((v as IAttributeBuffer).buffer) {
            const v0 = v as IAttributeBuffer;
            const buf = isBufferArray(v0.buffer) ? bufferState.createBuffer({
                data: v0.buffer as ShapedArrayFormat,
                target: 'ARRAY_BUFFER',
            }) : v0.buffer as REGLBuffer;
            //record属性设置
            record.offset = v0.offset | 0;
            check(record.offset >= 0, `offset只能是大于等于0的数字`);
            record.stride = v0.stride | 0;
            check(record.stride >= 0 && record.stride < 256, `扫描线宽取值范围必须[0,255]`);
            record.normalized = !!v0.normalized;
            record.component = CComponent[v0.component] || buf.Component;
            check(Object.values(CComponent).indexOf(record.component) !== -1, `数据类型只能是${Object.values(CComponent)}`);
            check(v0.divisor === 0 || extLib.get('ANGLE_instanced_arrays'), `不支持ANGLE_instanced_arrays插件，不能设置实例化参数divisor`);
            check(v0.divisor >= 0, `不支持的divisor值`);
            //record buffer属性
            record.buffer = buf;
            record.component = buf.Component;
            record.ln = pipeline.link(buf);
        }
        RECORD_SET.set(record.name, record);
    });
    return RECORD_SET;
}

export {
    IAttributeBuffer,
    TAttribute,
    parseAttribute
}