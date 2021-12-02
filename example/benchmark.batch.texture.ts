import { Mat4, Vec3 } from 'kiwi.matrix';
import { GBuffer, GTexture, IPerformance, PipeGL, Props, TAttribute, TProps, TUniform } from '../src/index';

import * as baboon from 'baboon-image';

interface IProp extends TProps {
    texture: GTexture;
    offset: number;
}

interface Attribute extends TAttribute {
    position: number[][];
    normal: number[][];
}

interface Uniform extends TUniform {
    projection: { (erformance: IPerformance, batchId: number): number[] };
    view: { (performance: IPerformance, batchId: number): number[] };
    texture: Props<IProp>;
    offset: Props<IProp>;
}

const pipegl0 = new PipeGL({
    width: 800,
    height: 600,
    extensions: ['ANGLE_instanced_arrays', 'OES_vertex_array_object']
});

var position = [
    [-0.5, +0.5, +0.5], [+0.5, +0.5, +0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5], // positive z face.
    [+0.5, +0.5, +0.5], [+0.5, +0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], // positive x face
    [+0.5, +0.5, -0.5], [-0.5, +0.5, -0.5], [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], // negative z face
    [-0.5, +0.5, -0.5], [-0.5, +0.5, +0.5], [-0.5, -0.5, +0.5], [-0.5, -0.5, -0.5], // negative x face.
    [-0.5, +0.5, -0.5], [+0.5, +0.5, -0.5], [+0.5, +0.5, +0.5], [-0.5, +0.5, +0.5], // top face
    [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5]  // bottom face
]

var normal = [
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // positive z face.
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // positive x face.
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // negative z face.
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // negative x face.
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0], // top face
    [0.0, 0.0], [1.0, 0.0], [1.0, 1.0], [0.0, 1.0]  // bottom face
]

const elements = [
    [2, 1, 0], [2, 0, 3],       // positive z face.
    [6, 5, 4], [6, 4, 7],       // positive x face.
    [10, 9, 8], [10, 8, 11],    // negative z face.
    [14, 13, 12], [14, 12, 15], // negative x face.
    [18, 17, 16], [18, 16, 19], // top face.
    [20, 21, 22], [23, 20, 22]  // bottom face
]


const draw0 = pipegl0.compile<Attribute, Uniform>({
    frag: `
        precision mediump float;
        uniform sampler2D texture;
        varying vec2 v_normal;
        void main(){
            gl_FragColor = texture2D(texture,v_normal);
        }`,

    vert: `
        precision mediump float;
        attribute vec3 position;
        attribute vec2 normal;

        uniform float offset;
        uniform mat4 projection, view;

        varying vec2 v_normal;

        void main(){
            v_normal = normal;
            gl_Position = projection * view * vec4(position.x+offset, position.y, position.z, 1);
        }
    `,

    attributes: {
        position: position,
        normal: normal
    },

    uniforms: {
        view: (performance: IPerformance, batchId: number): number[] => {
            const t = 0.01 * performance.count;
            return new Mat4().lookAt(
                new Vec3().set(5 * Math.cos(t), 2.5 * Math.sin(t), 5 * Math.sin(t)),
                new Vec3().set(0, 0.0, 0),
                new Vec3().set(0, 1, 0)
            ).invert().value;
        },
        projection: (performance: IPerformance, batchId: number): number[] => {
            return Mat4.perspective(180 / 4, 800 / 600, 0.01, 10).value;
        },
        texture: new Props<IProp>('texture'),
        offset: new Props<IProp>('offset')
    },

    elements: elements
});

const batch: IProp[] = [];

const tex0 = pipegl0.texture2D(
    baboon.data,
    512,
    512,
    4,
    baboon.stride,
    baboon.offset,
    {
        mag: 'LINAR',
        min: 'LINEAR'
    });
const tex1 = pipegl0.texture2D(
    baboon.data,
    512,
    512,
    4,
    baboon.stride,
    baboon.offset,
    {
        mag: 'NEAREST',
        min: 'NEAREST'
    });

batch.push({ texture: tex0, offset: 0 });
batch.push({ texture: tex1, offset: 2 });

const anim = (framestamp: number) => {
    // draw0.draw();
    draw0.batch(batch);
    requestAnimationFrame(anim);
}

anim(0);
