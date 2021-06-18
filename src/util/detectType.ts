import { ComponentFormate } from "../res/Fromate";

/**
 * 
 * @param v 
 * @returns 探测数据类型，如果不属于任何一类则默认为Float
 */
const detectType = (v: any): ComponentFormate => {
    const protoName = Object.prototype.toString.call(v);
    switch (protoName) {
        case `[object Int8Array]`:
            return ComponentFormate.BYTE;
        case `[object Uint8Array]`:
        case `[object Float64Array]`:
        case `[object ArrayBuffer]`:
        case `[object Uint8ClampedArray]`:
            return ComponentFormate.UNSIGNED_BYTE;
        case `[object Int16Array]`:
            return ComponentFormate.SHORT;
        case `[object Uint16Array]`:
            return ComponentFormate.UNSIGNED_SHORT;
        case `[object Int32Array]`:
            return ComponentFormate.INT;
        case `[object Uint32Array]`:
            return ComponentFormate.UNSIGNED_INT;
        case `[object Float32Array]`:
            return ComponentFormate.FLOAT;
        default:
            return ComponentFormate.FLOAT;
    }
}

export { detectType }