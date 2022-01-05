import { Mat4, Vec3 } from 'kiwi.matrix';

import { createRGBA } from '../createRGBA';
import { cubeElements, cubePositions, cubeUvs } from '../createCube';

import { GTexture, IPerformance, PipeGL, Props, TAttribute, TProps, TUniform } from '../../src/index';

interface IProp extends TProps {
    texture: GTexture;
    offset: number;
}

interface Attribute extends TAttribute {
    position: number[][];
    uv: number[][];
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

createRGBA('/assets/texture0.jpg').then(t => {

    const draw0 = pipegl0.compile<Attribute, Uniform>({

        vert: `
        precision mediump float;
        attribute vec3 position;
        attribute vec2 uv;

        uniform float offset;
        uniform mat4 projection, view;

        varying vec2 vUv;

        void main(){
            vUv = uv;
            gl_Position = projection * view * vec4(position.x+offset, position.y, position.z, 1);
        }`,

        frag: `precision mediump float;
        uniform sampler2D texture;

        varying vec2 vUv;

        void main(){
            gl_FragColor = texture2D(texture,vUv);
        }`,

        attributes: {
            position: cubePositions,
            uv: cubeUvs,
        },

        uniforms: {
            view: (performance: IPerformance, batchId: number): number[] => {
                const t = 0.001 * performance.count;
                return new Mat4().lookAt(
                    new Vec3().set(5 * Math.cos(t), 2.5 * Math.sin(t), 5 * Math.sin(t)),
                    new Vec3().set(0, 0.0, 0),
                    new Vec3().set(0, 1, 0)
                ).invert().value;
            },
            projection: (performance: IPerformance, batchId: number): number[] => {
                return Mat4.perspective(180 / 4, 800 / 600, 0.01, 100).value;
            },
            texture: new Props<IProp>('texture'),
            offset: new Props<IProp>('offset')
        },

        elements: cubeElements
    });

    const batch: IProp[] = [];

    const tex0 = pipegl0.texture2D(
        t.buf,
        t.w,
        t.h,
        t.c,
        {
            mag: 'LINEAR',
            min: 'LINEAR',
            flipY:true,
        });

    const tex1 = pipegl0.texture2D(
        t.buf,
        t.w,
        t.h,
        t.c,
        {
            mag: 'NEAREST',
            min: 'NEAREST',
        });

    batch.push({ texture: tex0, offset: 0 });

    batch.push({ texture: tex1, offset: 2 });

    const anim = () => {
        // draw0.draw();
        draw0.batch(batch);
        requestAnimationFrame(anim);
    }

    anim();
});