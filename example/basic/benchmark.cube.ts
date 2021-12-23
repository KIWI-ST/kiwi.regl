import { Mat4, Vec3 } from "kiwi.matrix";

import { cubeElements, cubePositions, cubeUvs } from "../createCube";

import { IPerformance, PipeGL, TAttribute, TUniform } from "../../src";


interface Attribute extends TAttribute {
    position: number[][];   //顶点坐标
    uv: number[][];          //纹理坐标
}

interface Uniform extends TUniform {
    projection: number[];                                                //投影矩阵
    view: number[];                                                    //世界矩阵（摄像头方向）
    model: { (performance: IPerformance, batchId: number): number[] };  //模型矩阵
}

const RADIUS: number = 700;

const CAMERAPOSITION = [0, 0, 5];

const ProjectionMatrix = Mat4.perspective(Math.PI / 4, RADIUS / RADIUS, 0.01, 100);

const ViewMatrix = new Mat4().lookAt(new Vec3().set(CAMERAPOSITION[0], CAMERAPOSITION[1], CAMERAPOSITION[2]), new Vec3().set(0, 0.0, 0), new Vec3().set(0, 1, 0)).invert();

const ModelMatrix = new Mat4().identity();

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS
});

const draw0 = pipegl0.compile<Attribute, Uniform>({

    vert: `precision mediump float;

    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 projection,view ,model;

    varying vec2 vUv;


    void main(){
        vUv = uv;
        gl_Position = projection*view*model*vec4(position, 1.0);
    }
    `,

    frag: `precision mediump float;

    varying vec2 vUv;

    void main(){
        gl_FragColor = vec4(abs(vUv),0,1.0);
    }
    `,

    attributes: {
        position: cubePositions,
        uv: cubeUvs
    },

    uniforms: {
        projection: ProjectionMatrix.value,
        view: ViewMatrix.value,
        model: (performance: IPerformance, batchId: number): number[] => ModelMatrix.rotateY(0.005).value,
    },

    elements: cubeElements
})

const anim = () => {
    draw0.draw();
    requestAnimationFrame(anim);
}

anim();