import { ComponentFormate, TypedArrayFormate } from './Fromate';

/**
 * 寻找最接近v的16幂指数（大于v）
 * @param v 
 * @returns 
 */
const nextPow16 = (v: number) => {
    for (let i = 16, len = (1 << 28); i <= len; i *= 16)
        if (v <= i)
            return i
    return 0
}

/**
 * 求v的对数（2为底），并取整
 * @param v 
 * @returns 
 */
const log2 = (v: number) => {
    let r: number = +(v > 0xFFFF) << 4
    v >>>= r
    let shift: number = +(v > 0xFF) << 3
    v >>>= shift;
    r |= shift
    shift = +(v > 0xF) << 2
    v >>>= shift; r |= shift
    shift = +(v > 0x3) << 1
    v >>>= shift; r |= shift
    return r | (v >> 1)
}

/**
 * 
 */
class BufferPool {

    /**
     * 缓冲池
     */
    private pool: Array<Array<ArrayBuffer>> = new Array(8);

    /**
     * 
     */
    constructor() {
        for (let i = 0, len = this.pool.length; i < len; i++)
            this.pool[i] = [];
    }

    /**
     * 
     * @param buf 
     */
    public free = (buf: ArrayBuffer): void => {
        this.pool[log2(buf.byteLength) >> 2].push(buf);
    }

    /**
     * free TypedArray
     * @param array 
     */
    public freeType = (array: TypedArrayFormate): void => {
        this.free(array.buffer);
    }

    /**
     * 分配内存空间
     * @param n buffer length
     */
    public alloc = (n: number): ArrayBuffer => {
        const size = nextPow16(n);
        const bin = this.pool[log2(size) >> 2];
        return bin.length > 0 ? bin.pop() : new ArrayBuffer(size);
    }

    /**
     * 分配指定类型空间
     * @param dtype 
     * @param n 
     */
    public allocType = (dtype: ComponentFormate, n: number): TypedArrayFormate => {
        let result: TypedArrayFormate = null;
        switch (dtype) {
            case ComponentFormate.BYTE:
                result = new Int8Array(this.alloc(n), 0, n);
                break;
            case ComponentFormate.UNSIGNED_BYTE:
                result = new Uint8Array(this.alloc(n), 0, n);
                break;
            case ComponentFormate.SHORT:
                result = new Int16Array(this.alloc(2 * n), 0, n);
                break;
            case ComponentFormate.UNSIGNED_SHORT:
                result = new Uint16Array(this.alloc(2 * n), 0, n);
                break;
            case ComponentFormate.INT:
                result = new Int32Array(this.alloc(4 * n), 0, n);
                break;
            case ComponentFormate.UNSIGNED_INT:
                result = new Uint32Array(this.alloc(4 * n), 0, n);
                break;
            case ComponentFormate.FLOAT:
                result = new Float32Array(this.alloc(4 * n), 0, n);
                break;
            default: //默认为float32array
                result = new Float32Array(this.alloc(4 * n), 0, n);
                break;
        }
        return result.length !== n ? result.subarray(0, n) : result;
    }
}

const bufferPool0 = new BufferPool();

export { BufferPool, bufferPool0 }