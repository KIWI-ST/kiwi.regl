import { TypedArrayFormat } from '../core/Format';
import { SComponent } from '../core/Support';

/**
 * @param v search 16 pow of 2
 * @returns 
 */
const nextPow16 = (v: number) => {
    for (let i: number = 16, max: number = (1 << 28); i <= max; i *= 16)
        if (v <= i)
            return i;
    return 0;
}

/**
 * 
 * @param v 
 * @returns 
 */
const nextLog2 = (v: number): number => {
    let shift: number = 0;
    let r: number = +(v > 0xFFFF) << 4;
    v >>>= r;
    shift = +(v > 0xFF) << 3;
    v >>>= shift;
    r |= shift;
    shift = +(v > 0xF) << 2;
    v >>>= shift;
    r |= shift;
    shift = +(v > 0x3) << 1;
    v >>>= shift;
    r |= shift;
    return r | (v >> 1);
}

/**
 * 
 * @param n construct new N loop, fill array with empty []
 * @returns 
 */
const interLoop = (n: number): ArrayBuffer[][] => {
    const r: ArrayBuffer[][] = [];
    for (let i: number = 0; i < n; i++)
        r[i] = [];
    return r;
}

/**
 * @class BufferPool
 * @description alloc buffer
 */
class BufferPool {
    /**
     * 
     */
    private bufferPool: ArrayBuffer[][] = interLoop(8);

    /**
     * @param size alloc new memory for arraybuffer
     * @returns 
     */
    public alloc = (size: number): ArrayBuffer => {
        const bufferPool = this.bufferPool,
            actualSize = nextPow16(size),
            bin = bufferPool[nextLog2(actualSize) >> 2];
        return bin.length > 0 ? bin.pop() : new ArrayBuffer(actualSize);
    }

    /**
     * @param scomponent allocation typed array
     * @param size 
     * @returns 
     */
    public allocType = (scomponent: SComponent, size: number): TypedArrayFormat => {
        const alloc = this.alloc;
        let arr: TypedArrayFormat = null;
        switch (scomponent) {
            case 'BYTE':
                arr = new Int8Array(alloc(size), 0, size);
                break;
            case 'UNSIGNED_BYTE':
                arr = new Uint8Array(alloc(size), 0, size);
                break;
            case 'SHORT':
                arr = new Int16Array(alloc(2 * size), 0, size);
                break;
            case 'UNSIGNED_SHORT':
                arr = new Uint16Array(alloc(2 * size), 0, size);
                break;
            case 'INT':
                arr = new Int32Array(alloc(4 * size), 0, size);
                break;
            case 'UNSIGNED_INT':
                arr = new Uint32Array(alloc(4 * size), 0, size);
                break;
            case 'FLOAT':
                arr = new Float32Array(alloc(4 * size), 0, size);
                break;
        }
        if (arr.length !== size) arr = arr.subarray(0, size);
        return arr;
    }

    /**
     * @description free arraybuffer
     * @param buffer 
     * @returns 
     */
    public free = (buffer: ArrayBuffer): void => {
        if (!buffer) return;
        const bufferPool = this.bufferPool;
        bufferPool[nextLog2(buffer.byteLength) >> 2].push(buffer);
    }

    /**
     * @description free typed arraybuffer
     * @param typedArraybuffer 
     */
    public freeType = (typedArraybuffer: TypedArrayFormat): void => {
        this.free(typedArraybuffer.buffer);
    }
}

/**
 * global variable
 */
const bufferPool0 = new BufferPool();

export { bufferPool0 }