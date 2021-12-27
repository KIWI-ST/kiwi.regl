import { Mat4, Vec3 } from "kiwi.matrix";
import { IPerformance, PipeGL, TAttribute, TUniform } from "../../src";
import { cubeElements, cubePositions } from "../createCube";
import { createNormals } from "../createNormals";

const RADIUS = 700;

const LIGHT_POSITION0 = [-3.5, 2.5, -3.5];

const CAMERA_POSTION0 = [5, 2.5, 5];

const VIEW: Mat4 = new Mat4()
    .lookAt(
        new Vec3().set(CAMERA_POSTION0[0], CAMERA_POSTION0[1], CAMERA_POSTION0[2]),
        new Vec3().set(0, 0, 0),
        new Vec3().set(0, 1, 0)
    ).invert();

const PROJECTION = Mat4.perspective(Math.PI / 4, RADIUS / RADIUS, 0.1, 100);

const MODEL = new Mat4().identity();

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS
});

interface LightUniform extends TUniform {
    projection: number[];
    view: number[];
    position: number[];
}

const light0 = pipegl0.compile<TAttribute, LightUniform>({

    vert: `precision mediump float;

    uniform vec3 position;

    uniform mat4 view, projection;

    void main(){
        gl_PointSize = 10.0;
        gl_Position = projection * view *vec4(position, 1.0);
    }`,

    frag: `precision mediump float;

    void main(){
        gl_FragColor = vec4(1,1,1,1);
    }`,

    attributes: {

    },

    uniforms: {
        position: LIGHT_POSITION0,
        projection: PROJECTION.value,
        view: VIEW.value
    },

    primitive: "POINTS",

    count: 1
});


interface CubeAttribute extends TAttribute {
    position: number[][];
    normal: number[][];
}

interface CubeUniform extends TUniform {
    projection: number[];
    view: number[];
    model: { (performance: IPerformance, batchId: number): number[] };
    ambient: number;         //light相关：环境光
    lightColor: number[];    //light相关：光颜色
    lightPosition: number[]; //light相关：光源位置
    specular: number;        //light相关：镜面反射率
    viewPosition: number[];   //light相关：摄像头位置
}


const cube0 = pipegl0.compile<CubeAttribute, CubeUniform>({

    vert: `precision mediump float;

    attribute vec3 position;
    attribute vec3 normal;

    uniform mat4 projection, view, model;

    varying vec3 vNormal;       //物体法线
    varying vec3 vPosition;     //世界物体位置
    
    void main(){
        float scale = 1.0;
        vPosition = (model*vec4(position,1.0)).xyz;     //应用position后世界坐标
        vNormal = mat3(model)*normal;                   //应用model后的法线
        gl_Position = projection*view*model*vec4(scale*position, 1.0);
    }`,

    frag: `precision mediump float;

    uniform float ambient;  //环境光
    uniform float specular; //镜面光

    uniform vec3 lightColor;
    uniform vec3 lightPosition;
    uniform vec3 viewPosition;

    varying vec3 vNormal;
    varying vec3 vPosition;     //世界物体位置
    
    void main(){
        //计算环境光结果
        vec3 ambient0=ambient*lightColor;                       
        //计算漫反射
        vec3 lightDir=normalize(lightPosition-vPosition);       
        float diff=max(dot(vNormal,lightDir),0.0);
        vec3 diffuse0=diff*lightColor;
        //镜面反射
        vec3 viewDir=normalize(viewPosition-vPosition);
        vec3 reflectDir=reflect(-lightDir,vNormal);
        float spec=max(dot(viewDir,reflectDir),0.0);
        float spec32=pow(spec,32.0);                  //注意这里pow(float, float), 参数必须是float类型
        vec3 specular0=specular*spec32*lightColor;
        //颜色汇总
        gl_FragColor=vec4(ambient0+diffuse0+specular0,1.0);
    }
    `,

    attributes: {
        position: cubePositions,
        normal: createNormals(cubeElements, cubePositions),
    },

    uniforms: {
        projection: PROJECTION.value,
        view: VIEW.value,
        model: (performance: IPerformance, batchId: number): number[] => {
            return MODEL.rotateY(0.003).rotateX(0.002).value;
        },
        viewPosition: CAMERA_POSTION0,        //视角位置
        specular: 0.5,                       //镜面反射率
        ambient: 0.1,                        //环境光
        lightColor: [1, 1, 1],                 //白光
        lightPosition: LIGHT_POSITION0,       //光源位置
    },

    elements: cubeElements,

    status: {
        DEPTH_TEST: true,
        CULL_FACE: true,
        cullFace: [0x0404],
        frontFace: [0x0900]
    }
});

const anim = () => {
    pipegl0.clear({
        color: [0, 0, 0, 1],
        depth: true,
    })
    light0.draw();
    cube0.draw();
    requestAnimationFrame(anim);
}

anim();