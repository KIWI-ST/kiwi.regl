import { ShapedArrayFormat } from "../core/Format";
import { SPrimitive } from "../core/Support";
import { GElementbuffer } from "../res/GElementbuffer";
import { ElementState } from "../state/ElementState";
import { isNDArray } from "../util/isNDArray";

/**
 * @description
 * 处理 element，生成elementbuffer
 * @param opts 
 * @returns 
 */
const praseElement = (
    opts: {
        element?: ShapedArrayFormat,
        elementState?: ElementState,
        primitive?: SPrimitive
    }
): GElementbuffer | null => {
    const { element, elementState } = opts;
    //}{先处理shapedArrayformt时数据
    if (element && isNDArray(element)) {
        return elementState.createElementbuffer({
            data: element,
            component: 'UNSIGNED_SHORT',
            primitive: opts.primitive || 'TRIANGLES'
        });
    }
}

export { praseElement }