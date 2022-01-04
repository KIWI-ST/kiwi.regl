import { isNDArray } from "../util/isNDArray";
import { SPrimitive } from "../core/Support";
import { ElementsState } from "../state/ElementState";
import { GElementsbuffer } from "../res/GElementsbuffer";
import { ShapedArrayFormat } from "../core/Format";

/**
 * @description
 * 处理 element，生成elementbuffer
 * @param opts 
 * @returns 
 */
const praseElements = (
    opts: {
        elements?: ShapedArrayFormat,
        elementState?: ElementsState,
        primitive?: SPrimitive
    }
): GElementsbuffer | null => {
    const { elements, elementState } = opts;
    //}{先处理shapedArrayformt时数据
    if (elements && isNDArray(elements)) {
        return elementState.createElementsbuffer({
            data: elements,
            component: 'UNSIGNED_SHORT',
            primitive: opts.primitive || 'TRIANGLES'
        });
    }
}

export { praseElements }