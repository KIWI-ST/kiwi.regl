import { IAttributeBuffer, PipeGL, TAttribute, TUniform } from "../../src";

//准备N*N个数据
const N = 5;
const offset: number[][] = [], color: number[][] = [], angle: number[] = [];

for (let i = 0, len = N * N; i < len; i++) {
    const x = -1 + 2 * Math.floor(i / N) / N + 0.1, y = -1 + 2 * (i % N) / N + 0.1;
    offset.push([x, y]);
    const r = Math.floor(i / N) / N, g = (i % N) / N, b = r * g + 0.2;
    color.push(([r, g, b]));
    const a = Math.random() * (2 * Math.PI);
    angle[i] = a;
}

const RADIUS = 700;

const pipegl0 = new PipeGL({
    width: 700,
    height: 700,
    extensions: ['ANGLE_instanced_arrays']
});

interface Attribute extends TAttribute {
    position: number[][];
    offset: IAttributeBuffer,
    color: IAttributeBuffer,
    angle: IAttributeBuffer,
}

const oBuf = pipegl0.buffer(angle);

const draw0 = pipegl0.compile<Attribute, TUniform>({

    vert: `precision mediump float;
    
    attribute vec2 position;
    attribute vec3 color;
    attribute vec2 offset;
    attribute float angle;

    varying vec3 vColor;

    void main(){
        vColor=color;
        gl_Position = vec4(
            cos(angle)*position.x+sin(angle)*position.y+offset.x,
            -sin(angle)*position.x+cos(angle)*position.y+offset.y,
            0,
            1);
    }`,

    frag: `precision mediump float;

    varying vec3 vColor;

    void main(){
        gl_FragColor = vec4(vColor,1.0);
    }`,

    attributes: {
        position: [[0.0, -0.05], [-0.05, 0.0], [0.05, 0.05]],

        color: {
            buffer: pipegl0.buffer(color),
            divisor: 1,
        },

        offset: {
            buffer: pipegl0.buffer(offset),
            divisor: 1,
        },

        angle: {
            buffer: oBuf,
            divisor: 1,
        }
    },

    status: {
        DEPTH_TEST: true,
        BLEND: true,
    },

    count: 3,

    instances: N * N,
});

const anim = () => {
    for (let i = 0; i < N * N; i++)
        angle[i] += 0.01;
    oBuf.subData(angle);
    draw0.draw();
    requestAnimationFrame(anim);
}

anim();