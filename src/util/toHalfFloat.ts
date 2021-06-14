/**
 * https://github.com/regl-project/regl/blob/5da46ee05f5de420031a53ab394bc52b0f34669d/lib/util/to-half-float.js#L8
 */
const GL_UNSIGNED_SHORT = 5123;
const FLOAT = new Float32Array(1);
const INT = new Uint32Array(FLOAT.buffer);

const toHalfFloat = (array: any) => {
    const ushorts = Bufferpool
}