import { Mat4, Vec3 } from "kiwi.matrix";
import { createRGBA } from "../createRGBA";
import { createQuads } from "../createQuads";
import { GTexture, IPerformance, PipeGL, TAttribute, TUniform } from "../../src";

const RADIUS: number = 700;
const CAMERAPOSITION = [0, 6, -3];
const ProjectionMatrix = Mat4.perspective(Math.PI / 4, RADIUS / RADIUS, 0.01, 100);
const ViewMatrix = new Mat4().lookAt(new Vec3().set(CAMERAPOSITION[0], CAMERAPOSITION[1], CAMERAPOSITION[2]), new Vec3().set(0, 0.0, 0), new Vec3().set(0, 1, 0)).invert();
const ModelMatrix = new Mat4().identity();
const { quadPositions, quadIndices, quadUvs } = createQuads(64);

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS
});

createRGBA('/example/assets/terrain/0_0.png').then(t => {

    interface Attribute extends TAttribute {
        position: number[][];   //顶点坐标
        uv: number[][];          //纹理坐标
    }

    interface Uniform extends TUniform {
        texture: GTexture;
        projection: number[];                                                //投影矩阵
        view: number[];                                                    //世界矩阵（摄像头方向）
        model: { (performance: IPerformance, batchId: number): number[] };  //模型矩阵
    }

    const tex0 = pipegl0.texture2D(
        t.buf,
        t.w,
        t.h,
        t.c,
        {
            mag: 'LINEAR',
            min: 'LINEAR',
            flipY: false
        }
    );

    const terrain0 = pipegl0.compile<Attribute, Uniform>({

        vert: `precision mediump float;

        attribute vec3 position;
        attribute vec2 uv;

        uniform sampler2D texture;

        uniform mat4 projection,view ,model;

        varying vec2 vUv;
        varying vec3 vPosition;

        void main(){
            vUv = uv;
            vec4 offset = texture2D(texture, vUv);
            vPosition = vec3(position.x, position.y, position.z+offset.z/10.0);
            gl_Position = projection * view * model * vec4(vPosition, 1.0);
        }`,

        frag: `precision mediump float;

        varying vec2 vUv;

        void main(){
            gl_FragColor = vec4(abs(vUv),0,1.0);
        }`,

        attributes: {
            position: quadPositions,
            uv: quadUvs
        },

        uniforms: {
            texture: tex0,
            projection: ProjectionMatrix.value,
            view: ViewMatrix.value,
            model: (performance: IPerformance, batchId: number): number[] => ModelMatrix.rotateZ(0.01).value,
        },

        elements: quadIndices
    })


    const anim = () => {
        terrain0.draw();
        requestAnimationFrame(anim);
    }

    anim();

});

