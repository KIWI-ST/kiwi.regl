import { SComponent } from "../core/Support";

/**
 * @description detecte number type
 * @param data 
 * @returns 
 */
const detectComponent = (data: any): SComponent => {
    const ne = Object.prototype.toString.call(data);
    switch (ne) {
        case `[object Int8Array]`:
            return 'BYTE';           //5120
        case `[object ArrayBuffer]`:
        case `[object Float64Array]`:
        case `[object Uint8ClampedArray]`:
        case `[object Uint8Array]`:
            return 'UNSIGNED_BYTE';  //5121
        case `[object Int16Array]`:
            return 'SHORT';          //5122
        case `[object Uint16Array]`:
            return 'UNSIGNED_SHORT'; //5123
        case `[object Int32Array]`:
            return 'INT';            //5124
        case `[object Uint32Array]`:
            return 'UNSIGNED_INT';   //5125
        case `[object Float32Array]`:
            return 'FLOAT';          //5126
        default: //[object Number]
            return 'FLOAT';
    }
}
export { detectComponent }