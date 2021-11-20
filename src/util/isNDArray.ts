import { getArrayShape } from './getFlatten';
import { ShapedArrayFormat } from '../core/Format';

/**
 * 判断是否是多维数组
 * @param v 
 * @returns 
 */
const isNDArray = (v: any): boolean => {
    if (Array.isArray(v)) {
        const shape = getArrayShape(v as ShapedArrayFormat);
        if (shape.length > 0 && shape.length < 3) return true;
    }
    return false;
}

export { isNDArray }