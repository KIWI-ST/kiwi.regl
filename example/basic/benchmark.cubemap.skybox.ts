import { Mat4, Vec3 } from "kiwi.matrix";

import { cubeElements, cubePositions, cubeUvs } from "../util/createCube";

import { GTexture, IPerformance, PipeGL, TAttribute, TUniform } from "../../src";
import { createNormals } from "../util/createNormals";
import { fetchTexture } from "../util/createTexture";


interface AttributeCube extends TAttribute {
    position: number[][];       //顶点坐标
    normal: number[][];             //纹理坐标
}

interface UniformCube extends TUniform {
    projection: number[];                                               //投影矩阵
    view: number[];                                                     //世界矩阵（摄像头方向）
    model: { (performance: IPerformance, batchId: number): number[] };  //模型矩阵
    cameraPosition: number[];                                            //摄像头位置
    texture: GTexture;                                                   //立方体纹理
}

const RADIUS: number = 700;

const CAMERAPOSITION = [0, 0, 5];

const ProjectionMatrix = Mat4.perspective(Math.PI / 4, RADIUS / RADIUS, 0.01, 100);

const InvertViewMatrix = new Mat4().lookAt(new Vec3().set(CAMERAPOSITION[0], CAMERAPOSITION[1], CAMERAPOSITION[2]), new Vec3().set(0, 0.0, 0), new Vec3().set(0, 1, 0));

const ViewMatrix = new Mat4().lookAt(new Vec3().set(CAMERAPOSITION[0], CAMERAPOSITION[1], CAMERAPOSITION[2]), new Vec3().set(0, 0.0, 0), new Vec3().set(0, 1, 0)).invert();

const ModelMatrix = new Mat4().identity();

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS
});

const cubeSource = [
    fetchTexture('/example/assets/cube/negx.jpg', 'negx'),
    fetchTexture('/example/assets/cube/negy.jpg', 'negy'),
    fetchTexture('/example/assets/cube/negz.jpg', 'negz'),
    fetchTexture('/example/assets/cube/posx.jpg', 'posx'),
    fetchTexture('/example/assets/cube/posy.jpg', 'posy'),
    fetchTexture('/example/assets/cube/posz.jpg', 'posz'),
];

Promise.all(cubeSource).then(cubeFaces => {

    const w = 512, h = 512, c = 4;
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

    cubeFaces.forEach(face=>{
        faces[face.key]=face.buf;
    });

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

    const cube = pipegl0.compile<AttributeCube, UniformCube>({

        vert: `precision mediump float;
    
        attribute vec3 position;
        attribute vec3 normal;
    
        uniform mat4 projection,view,model;
    
        varying vec3 vPosition;
        varying vec3 vNormal;
    
        void main(){
            vPosition = (model*vec4(position,1.0)).xyz;
            vNormal = mat3(model)*normal;
            gl_Position = projection*view*model*vec4(position,1.0);
        }
        `,

        frag: `precision mediump float;
        
        uniform samplerCube texture;
        uniform vec3 cameraPosition;
    
        varying vec3 vPosition; //物体坐标（扭转后）
        varying vec3 vNormal;   //法线坐标（扭转后）
    
        void main(){
            vec3 eDir = normalize(vPosition-cameraPosition);    //入射方向: 摄像机->物体
            vec3 rDir = reflect(eDir, normalize(vNormal));      //反射光线方向向量
            gl_FragColor = textureCube(texture,rDir);                 //物体表面取反射方向指向得cubemap纹理值
        }
        `,

        attributes: {
            position: cubePositions,
            normal: createNormals(cubeElements, cubePositions)
        },

        uniforms: {
            projection: ProjectionMatrix.value,
            view: ViewMatrix.value,
            model: (performance: IPerformance, batchId: number): number[] => ModelMatrix.rotateY(0.0001).rotateX(0.0003).value,
            cameraPosition: CAMERAPOSITION,
            texture: cubeTexture,
        },

        elements: cubeElements,

        status:{
            DEPTH_TEST:true,
            depthFunc:[0x0201], //gl.LESS 
        }
    })

    interface AttirbuteSkybox extends TAttribute{
        position:number[][];
    }

    interface UniformSkeybox extends TUniform{
        invertView:number[];
        texture:GTexture;
    }


    const skeybox = pipegl0.compile<AttirbuteSkybox, UniformSkeybox>({

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
            invertView:InvertViewMatrix.value,
            texture:cubeTexture
        },

        count:6,

        status:{
            DEPTH_TEST:true,
            depthFunc:[0x0203]      //参考值小于或等于模板值时通过
        }
    });


    const anim = () => {
        cube.draw();
        skeybox.draw();
        requestAnimationFrame(anim);
    }

    anim();
});
