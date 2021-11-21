import { isNDArray } from "./isNDArray"
import { isTypedArray } from "./isTypedArray"

/**
 * 判断是否为缓冲对象（或可转换为缓冲对象）
 * @param v 
 * @returns 
 */
const isBufferArray = (v: any) => {
    return Array.isArray(v) || isTypedArray(v) || isNDArray(v);
}

export { isBufferArray }