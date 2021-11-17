import { bufferPool0 } from './../pool/BufferPool';
import { TypedArrayFormat } from "../core/Format";

const FLOAT = new Float32Array(1), INT = new Uint32Array(FLOAT.buffer);

/**
 * 转换成半精度数组
 * @param array 
 * @returns 
 */
const toHalfFloat = (array: TypedArrayFormat | number[]): TypedArrayFormat => {
    const len = array.length;
    const ushorts = bufferPool0.allocType('UNSIGNED_SHORT', len);
    for (let i = 0; i < len; ++i) {
        if (isNaN(array[i])) ushorts[i] = 0xffff;
        else if (array[i] === Infinity) ushorts[i] = 0x7c00;
        else if (array[i] === -Infinity) ushorts[i] = 0xfc00;
        else {
            FLOAT[0] = array[i];
            const x = INT[0];
            const sgn = (x >>> 31) << 15;
            const exp = ((x << 1) >>> 24) - 127;
            const frac = (x >> 13) & ((1 << 10) - 1);
            if (exp < -24) ushorts[i] = sgn;
            else if (exp < -14) {
                const s = -14 - exp;
                ushorts[i] = sgn + ((frac + (1 << 10)) >> s);
            }
            else if (exp > 15) ushorts[i] = sgn + 0x7c00;
            else ushorts[i] = sgn + ((exp + 15) << 10) + frac;
        }
    }
    return ushorts;
}

export { toHalfFloat }