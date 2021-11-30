import { PipeGL, Props, TAttribute, TProps, TUniform } from '../src/index';

interface IPropOffset extends TProps {
    offset: number,
    position: number[][]
}

interface Attribute extends TAttribute {
    // position: number[][];
    position: Props<IPropOffset>
}

interface Uniform extends TUniform {
    color: number[];
    offset: Props<IPropOffset>;
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
        uniform float offset;
        void main(){
            gl_Position = vec4(position.x+offset, position.y+offset, 0, 1);
        }
    `,

    attributes: {
        position: new Props<IPropOffset>('position')
    },

    uniforms: {
        color: [1, 0.5, 0, 1],
        offset: new Props<IPropOffset>('offset')
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


let last = 1;

const anim = (framestamp:number) => {
    console.log(1000/(framestamp - last));
    last = framestamp;
    const rand = 400;
    const batch = [];
    for (let k = 0; k < rand; k++) {
        const pos: number[][] = [];
        for (let i = 0; i < 5; i++) {
            const theta = 2.0 * Math.PI * i / k;
            pos.push([Math.sin(theta), Math.cos(theta)]);
        }
        batch.push({ position: pos, offset: 0 })
    }
    draw0.batch<IPropOffset>(batch);
    requestAnimationFrame(anim);
}

anim(0);
