import {PipeGL, TAttribute, TUniform} from './../src/index';

interface Attribute extends TAttribute{
    position:number[][];
}

interface Uniform extends TUniform{
    color:number[];
}

const pipegl0 = new PipeGL({
    width:800,
    height:600,
    extensions:['ANGLE_instanced_arrays', 'OES_vertex_array_object']
});

const draw0 = pipegl0.compile<Attribute, Uniform>({
    frag:`
        precision mediump float;
        uniform vec4 color;
        void main(){
            gl_FragColor = color;
        }`,

    vert:`
        precision mediump float;
        attribute vec2 position;
        void main(){
            gl_Position = vec4(position, 0, 1);
        }
    `,

    attributes:{
        position:[
            [-1, 0],
            [0, -1],
            [1, 1]
        ]
    },

    uniforms:{
        color: [1, 0.5, 0, 1]
    },

    count:3,
});

const anim = ()=>{
    draw0.draw();
    requestAnimationFrame(anim);
}

anim();

