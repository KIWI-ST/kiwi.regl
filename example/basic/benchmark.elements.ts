import { PipeGL, TAttribute, TUniform } from '../../src/index';

const pos: number[][] = [];

for (let i = 0; i < 5; i++) {
    const theta = 2.0 * Math.PI * i / 5.0;
    pos.push([Math.sin(theta), Math.cos(theta)]);
}

interface Attribute extends TAttribute {
    position: number[][];
}

interface Uniform extends TUniform {
    color: number[];
}

const pipegl0 = new PipeGL({
    width: 800,
    height: 600,
    extensions: ['ANGLE_instanced_arrays', 'OES_vertex_array_object']
});

const draw0 = pipegl0.compile<Attribute, Uniform>({
    frag: `
        precision mediump float;
        uniform vec4 color;
        void main(){
            gl_FragColor = color;
        }`,

    vert: `
        precision mediump float;
        attribute vec2 position;
        void main(){
            gl_Position = vec4(position, 0, 1);
        }
    `,

    attributes: {
        position: pos
    },

    uniforms: {
        color: [1, 0.5, 0, 1]
    },

    primitive: 'LINES',

    elements: [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4]
    ]
});

const anim = () => {
    draw0.draw();
    requestAnimationFrame(anim);
}

anim();

