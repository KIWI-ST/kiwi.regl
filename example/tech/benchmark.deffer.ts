/**
 * 延迟着色
 * 
 * 背景：一般光照模型是正向渲染（Forward Rendering)或正向着色法（Forward Shading)，但是当场景中光源特别多的时候，程序渲染每一个片段
 *      都需要对全部的光源带入计算。
 * 
 * 处理阶段：
 * 
 * 1. 几何处理阶段(Geometry Pass), 该阶段先渲染场景一次，之后获取对象的各种几何信息并存储在缓冲区中（一般是color attachment),包括：
 *    A. 位置 
 *    B. 颜色
 *    C. 法线向量
 *    D. 镜面向量
 * 
 * 2. 光照处理阶段（Lighting Pass)，该阶段渲染一个屏幕大小的片段。
 * 
 */

import { Mat4, Vec3 } from "kiwi.matrix";

import { createNormals } from "../createNormals";
import { cubeElements, cubePositions, cubeUvs } from "../createCube";

import { GTexture, IPerformance, PipeGL, Props, TAttribute, TProps, TUniform } from "../../src";

//几何处理阶段(Attribute)
interface GeometryAttribute extends TAttribute {
    position: number[][];
    normal: number[][];
}

//几何处理阶段(Uniform)
interface GeometryUniform extends TUniform {
    projection: number[];
    view: number[];
    model: { (performance: IPerformance, batchId: number): number[] };
    itModel: { (performance: IPerformance, batchId: number): number[] };
}

const RADIUS = 700;

const CAMERA_POSITION = new Vec3().set(0, 0, 5);

const CAMERA_MATRIX = new Mat4().lookAt(CAMERA_POSITION, new Vec3().set(0.0, 0.0, 0.0), new Vec3().set(0.0, 1.0, 0.0));

const VIEW_MATRIX = CAMERA_MATRIX.clone().invert();

const PROJECTION_MATRIX = Mat4.perspective(Math.PI / 3, RADIUS / RADIUS, 0.01, 1000);

const MODEL_MATRIX = new Mat4().identity().rotateY(0.3).rotateX(0.2);

const IT_MODEL_MATRIX = MODEL_MATRIX.clone().invert().transpose();

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS,
    extensions: ['WEBGL_draw_buffers']
});


const pTexture = pipegl0.texture2D(new Uint8Array(RADIUS * RADIUS * 4), RADIUS, RADIUS, 4);

const nTexture = pipegl0.texture2D(new Uint8Array(RADIUS * RADIUS * 4), RADIUS, RADIUS, 4);

const aTexture = pipegl0.texture2D(new Uint8Array(RADIUS * RADIUS * 4), RADIUS, RADIUS, 4);

const depthBuffer = pipegl0.renderbuffer({ w: RADIUS, h: RADIUS, format: 'DEPTH_COMPONENT16' });

const defferFramebuffer = pipegl0.framebuffer({ colors: [pTexture, nTexture, aTexture], depth: depthBuffer });

//1.几何处理阶段

const GeometryPASS = pipegl0.compile<GeometryAttribute, GeometryUniform>({

    vert: `precision highp float;

    attribute vec3 position;                            //顶点
    attribute vec3 normal;                              //法线

    uniform mat4 projection, view, model;               //投影x视觉矩阵, webgl 1.0没有inverse函数，需要额外传入model的逆矩阵
    uniform mat4 itModel;                               //inverst and transpose of model matrix

    varying vec3 vPosition;
    varying vec3 vNormal;

    void main(){
        vPosition = vec3(model*vec4(position,1.0));
        vNormal = vec3(itModel*vec4(normal,1.0));
        gl_Position = projection * view * model * vec4(position, 1.0);
    }`,

    frag: `precision mediump float;

    #extension GL_EXT_draw_buffers:require              //开启drawbuffer能力

    varying vec3 vPosition;
    varying vec3 vNormal;

    void main(){
        //位置片段存储
        gl_FragData[0] = vec4(vPosition, 1.0);
        //法线片段存储
        gl_FragData[1] = vec4(normalize(vNormal), 1.0);
        //漫反射片段存储
        gl_FragData[2].rgb = vec3(0.2, 0.2, 0.2);       //可以从纹理材质中读取该分量
        //镜面反射存储到a分量   
        gl_FragData[2].a = 0.2;                         //可以从纹理材质中读取该分量
    }`,

    attributes: {
        position: cubePositions,
        normal: createNormals(cubeElements, cubePositions),
    },

    uniforms: {
        projection: PROJECTION_MATRIX.value,
        view: VIEW_MATRIX.value,
        model: (performance: IPerformance, batch: number): number[] => MODEL_MATRIX.value,
        itModel: (performance: IPerformance, batch: number): number[] => IT_MODEL_MATRIX.value,
    },

    elements: cubeElements,

    framebuffer: {
        clear: { color: [0, 0, 0, 0], depth: true, stencil: true },
        framebuffer: defferFramebuffer
    },

    status: {
        DEPTH_TEST: true,
        viewport: [0, 0, RADIUS, RADIUS]
    }
});


//2.光照处理阶段

interface LightAttribute extends TAttribute {
    position: number[][];
    uv: number[][];
}

interface LightUniform extends TUniform {
    projection?: number[];
    view?: number[];
    model?: { (performance: IPerformance, batchId: number): number[] };
    //
    cameraPosition?: number[];
    //
    pTexture?: GTexture;
    nTexture?: GTexture;
    aTexture?: GTexture;
}

const LightCount = 15;

//组织unifrom对象(根据light数量动态组织)

const lightUinformObject: LightUniform = {};

let lightsBatch: IProps[] = [];

for (let k = 0; k <= LightCount; k++) {
    lightUinformObject[`lights[${k}].position`] = (performance: IPerformance, batchId: number): number[] => {
        const t0 = Math.cos(k + performance.count * (k+1) * 0.0001);
        const t1 = Math.sin(k + performance.count * (k+1) * 0.0001);
        const p0 = [t0 * 2, 1, t1 * 2];
        lightsBatch.push({ position: p0 })
        return p0;
    }
    lightUinformObject[`lights[${k}].color`] = (performance: IPerformance, batchId: number): number[] => {
        return [1, 1, 1];
    }
}

//
lightUinformObject['cameraPosition'] = CAMERA_POSITION.value;
//
lightUinformObject['projection'] = PROJECTION_MATRIX.value;
lightUinformObject['view'] = VIEW_MATRIX.value;
lightUinformObject['model'] = (performance: IPerformance, batchId: number) => MODEL_MATRIX.value;
//
lightUinformObject['pTexture'] = pTexture;
lightUinformObject['nTexture'] = nTexture;
lightUinformObject['aTexture'] = aTexture;

const LightPASS = pipegl0.compile<LightAttribute, LightUniform>({
    vert: `precision mediump float;

    attribute vec2 position;
    attribute vec2 uv;

    varying vec2 vUv;

    void main(){
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
    }`,

    frag: `precision mediump float;

    struct Light{
        vec3 position;
        vec3 color;
    };

    const int LightCount = ${LightCount};

    uniform Light lights[LightCount];

    uniform vec3 cameraPosition;    //相机位置

    uniform sampler2D pTexture;     //position texture
    uniform sampler2D nTexture;     //normal texture
    uniform sampler2D aTexture;     //albedo texture

    varying vec2 vUv;

    void main(){

        //从framebuffer里获取position、normal、diffuse、sepcular
        vec3 position = texture2D(pTexture, vUv).rgb;
        vec3 normal = texture2D(nTexture, vUv).rgb;
        vec3 diffuse = texture2D(aTexture, vUv).rgb;
        float specular = texture2D(aTexture, vUv).a;

        //计算高光
        vec3 lighting = diffuse*0.5;
        vec3 viewDir = normalize(cameraPosition-position);          //物体->摄像机向量
        for(int i=0;i<LightCount;i++){

            //漫反射计算
            vec3 lightDir = normalize(lights[i].position-position);
            vec3 diffuse = max(dot(normal, lightDir), 0.0)*diffuse*lights[i].color;

            //镜面反射计算
            vec3 halfwayDir = normalize(lightDir+cameraPosition);
            float spec = pow(max(dot(normal, halfwayDir), 0.0), 16.0);
            vec3 spec0 = lights[i].color *spec *specular;

            //光照衰减
            float distance = length(lights[i].position-cameraPosition);
            float attenuation = 1.0/distance;

            //应用衰减
            diffuse *= attenuation;
            spec0 *= attenuation;
            lighting += diffuse + spec0;
        }
        //
        gl_FragColor = vec4(lighting, 1.0);
    }`,

    attributes: {
        position: [
            [-1, 1],
            [1, 1],
            [-1, -1],
            [-1, -1],
            [1, 1],
            [1, -1]
        ],
        uv: [
            [0, 1],
            [1, 1],
            [0, 0],
            [0, 0],
            [1, 1],
            [1, 0]
        ]
    },

    uniforms: lightUinformObject,

    primitive: 'TRIANGLES',

    count: 6,

    status: {
        DEPTH_TEST: true,
    }

});

interface IProps extends TProps {
    position: number[];
}

interface LightPositionUniform extends TUniform {
    projection: number[];
    view: number[];
    position: Props<IProps>;
}

const Light0 = pipegl0.compile<TAttribute, LightPositionUniform>({

    vert: `precision mediump float;
    
    uniform vec3 position;

    uniform mat4 projection, view;

    void main(){
        gl_PointSize = 10.0;
        gl_Position = projection * view * vec4(position, 1.0);
    }`,

    frag: `precision mediump float;

    void main(){
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }`,

    attributes: {},

    uniforms: {
        projection: PROJECTION_MATRIX.value,
        view: VIEW_MATRIX.value,
        position: new Props<IProps>('position'),
    },

    primitive: 'POINTS',

    count: 1,

    status: {
        DEPTH_TEST: false,
    }
});


let lastStamp: number = 0;

const anim = (stamp: number) => {
    lightsBatch = [];
    // MODEL_MATRIX.rotateY(0.003);
    // IT_MODEL_MATRIX.rotateY(0.003);
    GeometryPASS.draw();
    LightPASS.draw();
    Light0.batch<IProps>(lightsBatch);
    console.log(1000.0 / (stamp - lastStamp));
    lastStamp = stamp;
    requestAnimationFrame(anim);
}

anim(0);