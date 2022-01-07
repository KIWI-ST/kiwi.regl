/**
 * IBL(二)：镜面反射部分
 * 
 * 镜面反射部分在整个积分上不是常数，不仅受入射方向影响，还受视角影响。
 * Epic Games提出近似解决方案：预计算镜面部分的卷积，为实时计算作了一些妥协，这种方案被称为“分割求和近似法”。
 * 技术：镜面反射积分依赖DFG分量，拆分镜面反射积分部分（分割近似）
 * 
 * 步骤：
 *      1. 预滤波HRD环境贴图生成 (参见benchmark.specular.hdr.ts实现)
 * 
 *      2. hdr。 BRDF方程求卷积。
 *      原理：输入的是法线、夹角、粗糙度，并将卷积的结果存储在纹理中。一般该纹理存储成2D查找纹理(Look up texture, LUT)。
 * 
 */

import { Mat4, Vec3 } from "kiwi.matrix";

import { GTexture, PipeGL, TAttribute, TUniform } from "../../src";

interface IrradianceAttribute extends TAttribute {
    position: number[][];
    uv:number[][];
}

interface IrradianceUniform extends TUniform {
    roughness: number;
}

const RADIUS = 700;

const CAMERAPOSITION = [0, 0, 5];

const CameraMatrix = new Mat4().lookAt(new Vec3().set(CAMERAPOSITION[0], CAMERAPOSITION[1], CAMERAPOSITION[2]), new Vec3().set(0, 0.0, 0), new Vec3().set(0, 1, 0));

const pipegl0 = new PipeGL({ width: RADIUS, height: RADIUS });

//预过滤HDR环境贴图(镜面反射分量), 基于Hammersley随机生成采样点序方法
//还有位运算符版本：
//https://learnopengl-cn.github.io/07%20PBR/03%20IBL/02%20Specular%20IBL/#hdr
const brdf0 = pipegl0.compile<IrradianceAttribute, IrradianceUniform>({
    vert: `precision mediump float;

         attribute vec2 position;
         attribute vec2 uv;
 
         varying vec2 vUv;
 
         void main(){
             vUv = uv;
             gl_Position = vec4(position, 1.0, 1.0);
         }`,

    frag: `precision mediump float;
 
         const float PI = 3.14159265359;
         const int SAMPLE_CPUNT = 1024;  //生成低差异序列数量（大循环）

         uniform float roughness;
 
         varying vec2 vUv;
 
         float GeometrySchlickGGX(float NdotV, float roughness){
             float a = roughness;
             float k = (a*a)/2.0;
             float nom = NdotV;
             float denom = NdotV*(1.0-k)+k;
             return nom/denom;
         }

         float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness){
             float NdotV = max(dot(N,V), 0.0);
             float NdotL = max(dot(N,L), 0.0);
             float ggx2 = GeometrySchlickGGX(NdotV, roughness);
             float ggx1 = GeometrySchlickGGX(NdotL, roughness);

             return ggx1*ggx2;
         }

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

         //2D查找纹理
         vec2 IntegrateBRDF(float NdotV, float roughness){
             vec3 V;

             V.x = sqrt(1.0 - NdotV*NdotV);
             V.y = 0.0;
             V.z = NdotV;

             float A = 0.0;
             float B = 0.0;

             vec3 N = vec3(0.0, 0.0, 1.0);

             for(int i=0; i<SAMPLE_CPUNT; ++i){
                 vec2 Xi = Hammersley(i, SAMPLE_CPUNT);
                 vec3 H = ImportanceSampleGGX(Xi, N, roughness);
                 vec3 L = normalize(2.0*dot(V, H)*H - V);

                 float NdotL = max(L.z, 0.0);
                 float NdotH = max(H.z, 0.0);
                 float VdotH = max(dot(V,H), 0.0);

                 if(NdotL>0.0){
                     float G = GeometrySmith(N, V, L, roughness);
                     float G_Vis = (G*VdotH)/(NdotH*NdotV);
                     float Fc = pow(1.0-VdotH, 5.0);                   //菲涅尔系数

                     A += (1.0-Fc)*G_Vis;
                     B +=Fc*G_Vis;
                 }
             }
             A /= float(SAMPLE_CPUNT);
             B /= float(SAMPLE_CPUNT);
             return vec2(A, B);
         }

         void main(){
             vec2 brdf = IntegrateBRDF(vUv.x, vUv.y);
             gl_FragColor = vec4(brdf.x, brdf.y, 0.0, 1.0);
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
        uv:[
            [0,1],
            [1,1],
            [0,0],
            [0,0],
            [1,1],
            [1,0]
        ]
    },

    uniforms: {
        roughness: 0.5,
    },

    count: 6,

    status: {
        // viewport: [0, 0, RADIUS, RADIUS],
        DEPTH_TEST: true,
        depthFunc: [0x0203]      //参考值小于或等于模板值时通过
    }
});

brdf0.draw();