
/**
 * 
 * IBL
 * 基于图像的光照（Image based lighting, IBL)是一类光照技术的集合，其光源不是直接光源，而是将周围环境视为一个大光源。
 * 技术：通常使用环境立方体贴图（cubemap)实现
 * 原理：视立方体贴图每个像素为光源，再渲染方程中直接使用
 * 
 * 此示例构造环境光贴图的漫反射积分结果
 * 
 */

import { Mat4, Vec3 } from "kiwi.matrix";
import { GTexture, PipeGL, TAttribute, TUniform } from "../../src";

import { createRGBA } from "../createRGBA";

interface IrradianceAttribute extends TAttribute {
    position: number[][]
}

interface IrradianceUniform extends TUniform {
    invertView:number[];
    texture:GTexture;
}

const RADIUS = 700;

const CAMERAPOSITION = [0, 0, 5];

const CameraMatrix = new Mat4().lookAt(new Vec3().set(CAMERAPOSITION[0], CAMERAPOSITION[1], CAMERAPOSITION[2]), new Vec3().set(0, 0.0, 0), new Vec3().set(0, 1, 0));

const pipegl0 = new PipeGL({ width: RADIUS, height: RADIUS });

const cubeSource = [
    createRGBA('/assets/cube/negx.jpg', 'negx'),
    createRGBA('/assets/cube/negy.jpg', 'negy'),
    createRGBA('/assets/cube/negz.jpg', 'negz'),
    createRGBA('/assets/cube/posx.jpg', 'posx'),
    createRGBA('/assets/cube/posy.jpg', 'posy'),
    createRGBA('/assets/cube/posz.jpg', 'posz'),
];

Promise.all(cubeSource).then(cubeFaces => {

    const w = 2048, h = 2048, c = 4;

    const faces: {
        posx: Uint8Array,
        negx: Uint8Array,
        posy: Uint8Array,
        negy: Uint8Array,
        posz: Uint8Array,
        negz: Uint8Array,
    } = {
        posx: null,
        negx: null,
        posy: null,
        negy: null,
        posz: null,
        negz: null,
    };

    cubeFaces.forEach(face => {
        faces[face.key] = face.buf;
    });

    //环境光立方体纹理
    const cubeTexture = pipegl0.textureCube(
        faces,
        w,
        h,
        c,
        {
            min: 'LINEAR_MIPMAP_LINEAR',
            mag: 'LINEAR',
        }
    );

    const w0 = 512, h0 = 512;

    //辐射立方体纹理, 存储环境贴图漫反射采样结果
    const irradianceCubeTexuture = pipegl0.textureCube(
        {
            posx: new Uint8Array(w0 * h0 * 4),
            posy: new Uint8Array(w0 * h0 * 4),
            posz: new Uint8Array(w0 * h0 * 4),
            negx: new Uint8Array(w0 * h0 * 4),
            negy: new Uint8Array(w0 * h0 * 4),
            negz: new Uint8Array(w0 * h0 * 4),
        },
        w0,
        h0,
        4,
        {
            min: 'LINEAR_MIPMAP_LINEAR',
            mag: 'LINEAR',
        }
    );

    //输入的color attachment是
    const irradianceFramebuffer = pipegl0.framebuffer({
        colors: [irradianceCubeTexuture]
    });

    const irradianceGenerate = pipegl0.compile<IrradianceAttribute, IrradianceUniform>({
        vert:`precision mediump float;

        attribute vec2 position;

        uniform mat4 invertView;

        varying vec3 vReflectDir;

        void main(){
            vReflectDir = (invertView*vec4(position, 1.0, 0.0)).xyz;    //记录摄像头出射向量
            gl_Position = vec4(position, 1.0, 1.0);
        }`,

        frag:`precision mediump float;

        const float PI = 3.14159265359;

        uniform samplerCube texture;

        varying vec3 vReflectDir;

        void main(){
            vec3 N = normalize(vReflectDir);                            //摄像头观察世界的射线
            vec3 irradiance = vec3(0.0);                                //辐射量（颜色值）

            vec3 up = vec3(0.0, 1.0, 0.0);
            vec3 right = normalize(cross(up,N));
            up = normalize(cross(N, right));

            const float sampleDelta = 0.025;
            float nrSamples = 0.0;

            for(float phi = 0.0; phi < 2.0 * PI; phi += sampleDelta)
            {
                for(float theta = 0.0; theta < 0.5 * PI; theta += sampleDelta)
                {
                    // spherical to cartesian (in tangent space)
                    vec3 tangentSample = vec3(sin(theta) * cos(phi),  sin(theta) * sin(phi), cos(theta));
                    // tangent space to world
                    vec3 sampleVec = tangentSample.x * right + tangentSample.y * up + tangentSample.z * N; 
                    irradiance += textureCube(texture, sampleVec).rgb * cos(theta) * sin(theta);
                    nrSamples++;
                }
            } 

            irradiance = PI * irradiance * (1.0 / nrSamples);
            gl_FragColor = vec4(irradiance, 1.0);
        }`,

        attributes:{
            position:[
                [-1,-1],
                [1,-1],
                [-1,1],
                [-1,1],
                [1,-1],
                [1,1]
            ]
        },

        uniforms:{
            invertView:CameraMatrix.value,
            texture:cubeTexture
        },

        count:6,

        framebuffer:{
            framebuffer:irradianceFramebuffer
        },

        status:{
            DEPTH_TEST:true,
            depthFunc:[0x0203]      //参考值小于或等于模板值时通过
        }
    });

    irradianceGenerate.draw();

    const irradiancePASS0 = pipegl0.compile<IrradianceAttribute, IrradianceUniform>({
        vert:`precision mediump float;

        attribute vec2 position;

        uniform mat4 invertView;

        varying vec3 vReflectDir;

        void main(){
            vReflectDir = (invertView*vec4(position, 1.0, 0.0)).xyz; //记录摄像头出射向量
            gl_Position = vec4(position, 1.0, 1.0);
        }`,

        frag:`precision mediump float;

        uniform samplerCube texture;

        varying vec3 vReflectDir;

        void main(){
            gl_FragColor = textureCube(texture, normalize(vReflectDir.xyz));
        }`,

        attributes:{
            position:[
                [-1,-1],
                [1,-1],
                [-1,1],
                [-1,1],
                [1,-1],
                [1,1]
            ]
        },

        uniforms:{
            invertView:CameraMatrix.value,
            texture:irradianceCubeTexuture,                 //环境光漫反射结果
        },

        count:6,

        status:{
            DEPTH_TEST:true,
            depthFunc:[0x0203]                              //参考值小于或等于模板值时通过
        }
    });

    irradiancePASS0.draw();
});