import { GBuffer, PipeGL, Props, TAttribute, TProps, TUniform } from '../../src/index';

interface IProp extends TProps {
    offset: number,
    position: GBuffer
}

interface Attribute extends TAttribute {
    // position: number[][];
    position: Props<IProp>
}

interface Uniform extends TUniform {
    color: number[];
    offset: Props<IProp>;
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
        position: new Props<IProp>('position')
    },

    uniforms: {
        color: [1, 0.5, 0, 1],
        offset: new Props<IProp>('offset')
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

const batch: IProp[] = [];
const rand = 300;

for (let k = 1; k <= rand; k++) {
    const arr: number[][] = [];
    for (let i = 0; i < 81; i++) {
        const theta = 2.0 * Math.PI * i / k;
        arr.push([Math.sin(theta), Math.cos(theta)]);
    }
    const buf = pipegl0.buffer(arr.slice(), { target: 'ARRAY_BUFFER', component:'FLOAT'});
    batch.push({ position: buf, offset: 0 })
}

const anim = (framestamp: number) => {
    pipegl0.clear({color:[0, 0, 0, 1.0]});
    draw0.batch<IProp>(batch);
    requestAnimationFrame(anim);
};

anim(0);
