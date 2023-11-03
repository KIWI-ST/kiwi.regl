/**
 * 
 */

import { Vec2, Vec3 } from "kiwi.matrix"
import { emitElement } from "../../src/compiler/emitElement";
import { fetchTexture } from "./createTexture";

/**
 * struct Terrain{
 *  float16 height;
 *  uint8 
 * }
 * 
 * encode / decode Elevation
 * encode: https://github.com/mapbox/mapbox-gl-js/blob/d88d4b06415dda3183c71cf0af905bbddd488694/test/unit/data/dem_tree.test.js#L8k
 * decode: https://docs.mapbox.com/data/tilesets/reference/mapbox-terrain-dem-v1/#elevation-data
 * 
 * pricesion: 0.1m
 * 
 */

interface TerrainQuad {
    height: number;
    landCover: number;
}

interface TerrainTileSchema {
    quadNum: number; // 64*64
    quadVec: TerrainQuad[];
}

const decodeElevation = (elevationV3: Vec3): number => {
    const f = ((elevationV3.x * 256.0 * 256.0 + elevationV3.y * 256.0 + elevationV3.z) * 0.1);
    return -10000.0 + f;
};

const encodeElevation = (elevation: number): Vec3 => {
    const unpackVector = [65536, 256, 1];
    const r: number[] = [];
    elevation = (elevation + 10000.0) * 10.0;
    for (let i = 0; i < 3; i++) {
        r[i] = Math.floor(elevation / unpackVector[i]);
        elevation -= r[i] * unpackVector[i];
    }
    return new Vec3().set(r[0], r[1], r[2]);
};

const createTerrainV1 = (quad1d: number = 64): { buf: Uint8Array, w: number, h: number, c: number } => {
    const quad2d: number = quad1d * quad1d;
    const C = 4;
    const SIZE = quad2d * C;
    const buf: Uint8Array = new Uint8Array(SIZE);
    for (let i = 0; i < quad1d; i++) {
        for (let j = 0; j < quad1d; j++) {
            let elevation = Math.random();
            if (elevation < 0.8) {
                elevation = 0.0;
            }
            const elevationV3 = encodeElevation(elevation * 0.2);
            const k = (i * quad1d + j) * C;
            buf[k] = elevationV3.x;
            buf[k + 1] = elevationV3.y;
            buf[k + 2] = elevationV3.z;
            buf[k + 3] = 1;
        }
    }
    return {
        buf: buf,
        w: quad1d,
        h: quad1d,
        c: C
    }
}

const fetchCreateTerrainV1 = (uri: string, quad1d: number = 64, key: string = ``) => {
    return fetchTexture(uri, key).then(t => {
        const quad2d: number = quad1d * quad1d;
        const C = 4;
        const SIZE = quad2d * C;
        const buf: Uint8Array = new Uint8Array(SIZE);
        for (let i = 0; i < quad1d; i++) {
            for (let j = 0; j < quad1d; j++) {
                const k = (i * quad1d + j) * C;
                let elevation = t.buf[k]/100.0;
                const elevationV3 = encodeElevation(elevation);
                buf[k] = elevationV3.x;
                buf[k + 1] = elevationV3.y;
                buf[k + 2] = elevationV3.z;
                buf[k + 3] = 1;
            }
        }
        return {
            buf: buf,
            w: quad1d,
            h: quad1d,
            c: C
        }
    });
}

export {
    encodeElevation,
    decodeElevation,
    createTerrainV1,
    fetchCreateTerrainV1
}