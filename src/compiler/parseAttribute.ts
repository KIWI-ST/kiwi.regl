import { ShapedArrayFormat } from "../core/Format";
import { SComponent } from "../core/Support";
import { REGLBuffer } from "../res/REGLBuffer";

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

type TAttribute = {
    [propName in string | number]: ShapedArrayFormat | IAttributeBuffer;
}

export{
    IAttributeBuffer,
    TAttribute
}