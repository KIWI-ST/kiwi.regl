import { PipeGL, TAttribute, TUniform } from "../../src";

interface Attribute extends TAttribute {
    position: number[][];
}

interface Uniform extends TUniform {
    color: number[];
}

const RADIUS = 700;

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS,
    extensions: ['OES_vertex_array_object']  //需开启VAO插件
});


const vao0 = pipegl0.vao<Attribute>({
    position: [
        [-1, 0],
        [0, -1],
        [1, 1]
    ]
},
    {
        count: 3
    }
)

const draw0 = pipegl0.compile<Attribute, Uniform>({

    vert:`precision mediump float;

    attribute vec2 position;

    void main(){
        gl_Position = vec4(position, 0, 1);
    }`,

    frag:`precision mediump float;

    uniform vec4 color;

    void main(){
        gl_FragColor = color;
    }`,

    uniforms:{
        color:[1,0,0,1],
    },

    vao:vao0
});

const anim = ()=>{
    draw0.draw();
    requestAnimationFrame(anim);
}

anim();
