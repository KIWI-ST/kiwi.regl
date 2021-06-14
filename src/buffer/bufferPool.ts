import { ComponentFormate, TypedArrayFormate } from "../core/Fromate";

/**
 * 搜索大于v的最小16的幂次数
 * @param v 
 * @returns 
 */
const nextPow16 = (v: number) => {
    for (let i = 16; i <= (1 << 28); i *= 16)
        if (v <= i)
            return i;
    return 0;
}

/**
 * 搜索v的对数（最接近）
 * @param v 
 */
const nextLog2 = (v: number): number => {
    let r: number, shift: number;
    r = +(v > 0xFFFF) << 4
    v >>>= r
    shift = +(v > 0xFF) << 3
    v >>>= shift;
    r |= shift
    shift = +(v > 0xF) << 2
    v >>>= shift; r |= shift
    shift = +(v > 0x3) << 1
    v >>>= shift; r |= shift
    return r | (v >> 1)
}


class BufferPool {

    /**
     * 
     */
    private _pool: Array<Array<ArrayBuffer>>;

    constructor() {
        const len = 8;
        this._pool = new Array(len);
        for (let i = 0; i < len; i++) {
            this._pool = []
        }
    }

    /**
     * alloc n length ArrayBuffer
     * @param n 
     * @returns 
     */
    public alloc = (n: number): ArrayBuffer => {
        const sz = nextPow16(n)
        const bin = this._pool[nextLog2(sz) >> 2]
        return bin.length > 0 ? bin.pop() : new ArrayBuffer(sz);
    }

    public free = (buf: ArrayBuffer): void => {
        this._pool[nextLog2(buf.byteLength) >> 2].push(buf);
    }

    public allocType = (type: ComponentFormate, n: number): TypedArrayFormate => {
        let result = null;
        switch ()
    }

    }

    const bufferPool = new BufferPool();

export { bufferPool }