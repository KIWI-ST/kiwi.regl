/**
 * 判断是否为类型数组
 * @example
 * const r1 = isTypedArray(new Float32Array()) //true
 * const r2 = isTypedArray([1,2]) //false
 * @param v 
 * @returns 
 */
const isTypedArray = (v: any): boolean => {
    return v instanceof Uint8Array || v instanceof Uint16Array || v instanceof Uint32Array || v instanceof Int8Array || v instanceof Int16Array || v instanceof Int32Array || v instanceof Float32Array || v instanceof Float64Array || v instanceof Uint8ClampedArray;
}

export { isTypedArray }