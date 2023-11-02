const min = -0.5, max = 0.5;

const createQuads = (quadCountSqrt: number) => {
    const quadPositions: number[][] = [];
    const quadIndices: number[][] = [];
    const quadUvs: number[][] = [];

    const vCount1d = Math.abs(quadCountSqrt);
    const vCount2d = vCount1d*vCount1d;
    const scale = max - min;
    const lerp = scale / vCount1d;



    for (let i = 0; i <= vCount1d; i++) {
        for (let j = 0; j <= vCount1d; j++) {
            // pos
            const point: number[] = [min + j * lerp, min + i * lerp, 0.0];
            quadPositions.push(point);
            // uv
            const uv: number[] = [j / vCount1d, i / vCount1d];
            quadUvs.push(uv);
        }
    }

    for (let k = 0; k < vCount2d; k++) {
        const offset = Math.floor(k / vCount1d);
        const p0 = k + offset;
        const p1 = p0 + 1;
        const p2 = p0 + vCount1d + 2;
        const p3 = p0 + vCount1d + 1;
        const indices: number[] = [p0, p1, p2, p2, p3, p0];
        quadIndices.push(indices);
    }

    return {
        quadPositions,
        quadIndices,
        quadUvs
    }
}

export {
    createQuads
}