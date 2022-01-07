/**
 * IBL(二)：镜面反射部分
 * 
 * 镜面反射部分在整个积分上不是常数，不仅受入射方向影响，还受视角影响。
 * Epic Games提出近似解决方案：预计算镜面部分的卷积，为实时计算作了一些妥协，这种方案被称为“分割求和近似法”。
 * 技术：镜面反射积分依赖DFG分量，拆分镜面反射积分部分（分割近似）
 * 
 * 步骤：
 *      1. 预滤波HRD环境贴图生成，基础mip为128x128，如果场景里有大量光滑材料可能需要提高分辨率
 *         针对镜面反射构成的形状为镜面波瓣，随着粗糙度的增加，镜面波瓣的大小增加与漫反射的半球面积分模型不太一样
 *         （可能是镜面，区域为反射向量；可能是椭球面，区域为气球状；也可能是半球面，粗糙度很高如毛茸茸（猫猫）的表面）
 *          理论：采用拟蒙特卡洛方法，先生成随机低差异序列（Hammersley序列），对生成序列的位置采样求和模拟HRD环境贴图
 * 
 *      2. brdf
 *
 */

import { Mat4, Vec3 } from "kiwi.matrix";

import { createRGBA } from "../createRGBA";

import { GTexture, PipeGL, TAttribute, TUniform } from "../../src";

interface IrradianceAttribute extends TAttribute {
    position: number[][]
}

interface IrradianceUniform extends TUniform {
    cameraMatrix: number[];
    texture: GTexture;
    roughness:number;
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
            flipY:true,
        }
    );

    const w0 = 128, h0 = 128;

    //辐射立方体纹理, 存储环境贴图漫反射采样结果
    const hdrTexture = pipegl0.textureCube(
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
    const hrdFramebuffer = pipegl0.framebuffer({
        colors: [hdrTexture]
    });

    //预过滤HDR环境贴图(镜面反射分量), 基于Hammersley随机生成采样点序方法
    //还有位运算符版本：
    //https://learnopengl-cn.github.io/07%20PBR/03%20IBL/02%20Specular%20IBL/#hdr
    const hrd0 = pipegl0.compile<IrradianceAttribute, IrradianceUniform>({
        vert: `precision mediump float;
 
         attribute vec2 position;
 
         uniform mat4 cameraMatrix;
 
         varying vec3 vReflectDir;
 
         void main(){
             vReflectDir = (cameraMatrix*vec4(position, 1.0, 0.0)).xyz;    //记录摄像头出射向量
             gl_Position = vec4(position, 1.0, 1.0);
         }`,

        frag: `precision mediump float;
 
         const float PI = 3.14159265359;
         const int SAMPLE_CPUNT = 1024;  //生成低差异序列数量（大循环）

         uniform samplerCube texture;
         uniform float roughness;
 
         varying vec3 vReflectDir;
 

         //预过滤HDR环境贴图（镜面反射分量）

         //基于Vander Corput方法生成随机采样序列
         float VanDerCorput(int n, int base){
            float invBase = 1.0/float(base);
            float denom = 1.0;
            float r = 0.0;
            //
            for(int i=0; i<32; ++i){
                if(n>0){
                    denom = mod(float(n),2.0);
                    r += denom * invBase;
                    invBase = invBase /2.0;
                    n = int(float(n)/2.0);
                }
            }
            //
            return r;
         }

         // i:第i个采样点; 
         // N:总样点点数
         // 返回采样点纹理位置，即Xi
         vec2 Hammersley(int i, int N){
             return vec2(float(i)/float(N), VanDerCorput(i, 2));
         }

         //重要性采样，基于Hammersley方法生的随机序列进行采样
         //计算: 1.特定粗糙度对采样位置的影响 2.基于低差异序列Xi采样
         //Epic Games使用了平方粗糙度获取了更好的视觉效果
         vec3 ImportanceSampleGGX(vec2 Xi, vec3 N, float roughness){
            float a = roughness*roughness;

            float phi = 2.0 * PI * Xi.x;
            float cosTheta = sqrt((1.0-Xi.y)/(1.0+(a*a-1.0)*Xi.y));
            float sinTheta = sqrt(1.0-cosTheta*cosTheta);

            //球上坐标转换笛卡尔坐标
            vec3 H;
            H.x = cos(phi)*sinTheta;
            H.y = sin(phi)*sinTheta;
            H.z = cosTheta;

            //切线->空间坐标
            vec3 up = abs(N.z)<0.999? vec3(0.0,0.0,1.0):vec3(1.0,0.0,0.0);
            vec3 tangent = normalize(cross(up,N));
            vec3 bitangent = cross(N,tangent);
            
            //采样坐标换算
            vec3 sampleVec = tangent*H.x + bitangent*H.y + N*H.z;
            return normalize(sampleVec);
         }


         void main(){
             vec3 N = normalize(vReflectDir);                            //摄像头观察世界的射线
             vec3 R = N;
             vec3 V = R;

             float totalWeight = 0.0;
             vec3 prefilterColor = vec3(0.0);

             for(int i=0;i<SAMPLE_CPUNT;++i){
                 vec2 Xi = Hammersley(i, SAMPLE_CPUNT);
                 vec3 H = ImportanceSampleGGX(Xi, N, roughness);
                 vec3 L = normalize(2.0 * dot(V,H) * H - V);

                 float NdotL = max(dot(N,L), 0.0);
                 if(NdotL>0.0){
                    prefilterColor += textureCube(texture, L).rgb*NdotL;
                    totalWeight += NdotL;
                 }
             }

             prefilterColor = prefilterColor/totalWeight;
             gl_FragColor = vec4(prefilterColor, 1.0);
         }`,

        attributes: {
            position: [
                [-1, -1],
                [1, -1],
                [-1, 1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        },

        uniforms: {
            cameraMatrix: CameraMatrix.value,
            texture: cubeTexture,
            roughness:0.1,
        },

        count: 6,

        framebuffer: {
            framebuffer: hrdFramebuffer
        },

        status: {
            viewport:[0, 0, w0, h0],
            DEPTH_TEST: true,
            depthFunc: [0x0203]      //参考值小于或等于模板值时通过
        }
    });

    hrd0.draw();

    const hdrPASS0 = pipegl0.compile<IrradianceAttribute, IrradianceUniform>({
        vert: `precision mediump float;
 
         attribute vec2 position;
 
         uniform mat4 cameraMatrix;
 
         varying vec3 vReflectDir;
 
         void main(){
             vReflectDir = (cameraMatrix*vec4(position, 1.0, 0.0)).xyz; //记录摄像头出射向量
             gl_Position = vec4(position, 1.0, 1.0);
         }`,

        frag: `precision mediump float;
 
         uniform samplerCube texture;
 
         varying vec3 vReflectDir;
 
         void main(){
             gl_FragColor = textureCube(texture, normalize(vReflectDir.xyz));
         }`,

        attributes: {
            position: [
                [-1, -1],
                [1, -1],
                [-1, 1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ]
        },

        uniforms: {
            cameraMatrix: CameraMatrix.value,
            texture: hdrTexture,                 //环境光漫反射结果
            roughness:0.4,
        },

        count: 6,

        status: {
            DEPTH_TEST: true,
            depthFunc: [0x0203]                              //参考值小于或等于模板值时通过
        }
    });

    hdrPASS0.draw();
});