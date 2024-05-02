import { Vec2 } from "kiwi.matrix";

const createQuads = (quadCountSqrt: number, min:Vec2, max:Vec2) => {
    const quadPositions: number[][] = [];
    const quadIndices: number[][] = [];
    const quadUvs: number[][] = [];

    const vCount1d = Math.abs(quadCountSqrt);
    const vCount2d = vCount1d * vCount1d;
    const scaleX = max.x - min.x;
    const scaleY = max.y - min.y;
    const lerpX = scaleX / vCount1d;
    const lerpY = scaleY / vCount1d;

    for (let i = 0; i <= vCount1d; i++) {
        for (let j = 0; j <= vCount1d; j++) {
            // pos
            const point: number[] = [min.x + j * lerpX, min.y + i * lerpY, 0.0];
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
        const p2 = p1 + vCount1d;
        const p3 = p2 + 1;
        const indices: number[] = [p0, p2, p3, p3, p1, p0];
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