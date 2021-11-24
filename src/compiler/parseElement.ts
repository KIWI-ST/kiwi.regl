import { ShapedArrayFormat } from "../core/Format";
import { SPrimitive } from "../core/Support";
import { GElementsbuffer } from "../res/GElementsbuffer";
import { ElementsState } from "../state/ElementState";
import { isNDArray } from "../util/isNDArray";

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