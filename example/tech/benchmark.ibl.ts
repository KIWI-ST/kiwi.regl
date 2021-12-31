
/**
 * 前文：PBR
 * 参考：
 * https://learnopengl-cn.github.io/07%20PBR/01%20Theory/
 * 
 * 基于物理的渲染 (Physically Based Rendering)，基于物理得渲染必须满足三个条件
 * 1. 基于微平面(Microfacet)得表面模型 
 * 2. 能量守恒
 * 3. 基于物理得BRDF
 * 
 * 微平面模型：
 * 理论：达到微观尺度之后任何平面都可以用被称为微平面得细小镜面来描绘，根据平面粗糙度得不同，这些细小镜面得去向排列可以相当不一致。
 * 效果：平面越粗糙，表面微平面排列月混乱。
 * 参数：粗糙度（Roughness)
 * 构造过程：计算某个方向与微平面平均去向方向得一致概率。该向量成为中间向量(Halfway Vector), 表示光线向量与视线向量之间得中间向量。
 * 
 * 能量守恒：
 * 理论：出射光线不能超过入射光线得能量（发光面除外）。
 * 
 * BRDF:
 * 理论：双向反射分布函数，接受入射光、出射光、平面法线和粗糙度作为函数得输入参数。
 * 构造过程：D,(Normal Distribution Function),估算在受到表面粗糙度得影响下，取向方向与中间向量一致得微平面数量。
 *          F,(Fresnel Rquation),在不同表面角度下所反射得光线所占得比率。
 *          G,(Geometry Function),描述微平面自成阴影得属性，当一个平面相对比较粗糙时，平面表面上得微平面有可能挡住其他平面从而减少表面所反射的光线。
 * 
 * 新增：IBL
 * 基于图像的光照（Image based lighting, IBL)是一类光照技术的集合，其光源不是直接光源，而是将周围环境视为一个大光源。
 * 技术：通常使用环境立方体贴图（cubemap)实现
 * 原理：视立方体贴图每个像素为光源，再渲染方程中直接使用
 * 
 */

import { Mat4, Vec3 } from "kiwi.matrix";

import { createNormals } from "../createNormals";
import { cubeElements, cubePositions, cubeUvs } from "../createCube";

import { IPerformance, PipeGL, Props, TAttribute, TProps, TUniform } from "../../src";

interface IProps extends TProps {
    metallic: number;
    roughness: number;
    model: number[];
}

interface Attribute extends TAttribute {
    position: number[][];        //顶点
    normal: number[][];          //法线
    uv: number[][];        //纹理坐标
}

interface Uniform extends TUniform {
    projection: number[];
    view: number[];
    model: Props<IProps>;
    //
    albedo: number[];
    metallic: Props<IProps>;
    roughness: Props<IProps>;
    ao: number;
    //

    lightPosition: number[];
    cameraPosition: number[];
    lightColor: number[];
}

const RADIUS: number = 700;

const CAMERA_POSITION = new Vec3().set(5, 0, 0);
const LIGHT_POSITION = new Vec3().set(1, 0, 1);

const PROJECTION = Mat4.perspective(Math.PI / 3, RADIUS / RADIUS, 0.01, 1000);
const VIEW = new Mat4().lookAt(CAMERA_POSITION, new Vec3().set(0, 0, 0), new Vec3().set(0, 1, 0)).invert();

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS,
});

const draw0 = pipegl0.compile<Attribute, Uniform>({
    vert: `precision mediump float;
  
      attribute vec3 position;
      attribute vec3 normal;
      attribute vec2 uv;
  
      uniform mat4 projection, view, model;
 
      //batch偏移
      uniform float offset;
  
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
      
      void main(){
          vUv = uv;
          vPosition = vec3(model * vec4(position.x,position.y,position.z,1.0));
          vNormal = mat3(model) * normal;
          gl_Position = projection * view * model * vec4(position.x,position.y,position.z, 1.0);
      }`,

    frag: `precision mediump float;
  
      const float PI = 3.141592653;
  
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec2 vUv;
  
      //光照，点光源
      uniform vec3 lightPosition;
      uniform vec3 lightColor;
  
      //view位置
      uniform vec3 cameraPosition;
 
      //PBR材质属性
      uniform float metallic;         //金属度
      uniform float roughness;        //粗糙度
      uniform float ao;               //环境光分量
      uniform vec3 albedo;            //材质反射率，分辨对三个颜色分量的反射率
      
      //参数roughness: 微平面表面镜面与Halfway Vector一致性比率
      float D_GGX(vec3 N, vec3 H, float roughness){
          float a = roughness * roughness;
          float a2 = a * a;
          float NH = max(dot(N, H), 0.0);
          float NH2 = NH * NH;
          float nom = a2;
          float denom = (NH2 * (a2 - 1.0) + 1.0);
          denom = PI * denom * denom;
          return nom/denom;
      }
  
      //参数roughness: 应用roughness计算几何遮蔽
      float G_GGX0(float theta, float roughness){
          float r = roughness + 1.0;
          float k = (r * r)/8.0;
          float nom = theta;
          float denom = theta * (1.0 -k) + k;
          return nom/denom;
      }
  
      //参数roughness: 几何遮蔽
      float G_GGX(vec3 N, vec3 V, vec3 L, float roughness){
          float NV = max(dot(N, V), 0.0);
          float NL = max(dot(N, L), 0.0);
          float ggx1 = G_GGX0(NV, roughness);
          float ggx2 = G_GGX0(NL, roughness);
          return ggx1 * ggx2;
      }
  
      //菲涅尔方程
      vec3 F_Fresnel(float cosTheta, vec3 F0){
          return F0 + (1.0 - F0) * pow(clamp(1.0-cosTheta, 0.0, 1.0), 5.0);
      }
  
      void main(){
          vec3 N = normalize(vNormal);                               //法线
          vec3 V = normalize(cameraPosition - vPosition);            //物体->视角 方向向量
          vec3 F0 = vec3(0.04);                                      //经验值，菲涅尔方程下绝缘体的表面反射力为0.04（不反射），表示入射光反射比率
          F0 = mix(F0, albedo, metallic);                            //应用金属度，材质反射率参数后的菲涅尔表面反射参数
          
          //能量衰减
          vec3 L = normalize(lightPosition - vPosition);             //
          vec3 H = normalize(V + L);                                 //halfway vector
          float distance = length(lightPosition - vPosition);        //光源到物体的距离
          float attenuation = 1.0/(distance*distance);               //指数能量衰减
          vec3 radiance = lightColor * attenuation;                  //衰减后光源到物体顶点上的辐射通量
  
          //DFG分量
          float D = D_GGX(N, H, roughness);                          //微平面一致率
          float G = G_GGX(N, V, L, roughness);                       //几何遮蔽
          vec3 F = F_Fresnel(clamp(dot(H, V), 0.0, 1.0), F0);        //菲涅尔参数
  
          //计算总辐射量L0
          vec3 numerator = D * G * F;
          //归一化参数，加偏移量防止除以0
          float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
          vec3 specular = numerator / denominator;
          vec3 ks = F;                                               //菲涅尔系数，反射比率
          vec3 kd = vec3(1.0)-ks;                                    //菲涅尔系数，折射比率
          kd *= 1.0-metallic;                                        //仅为金属不会折射光线，因此不会有漫反射
          float NL = max(dot(N, L), 0.0);
          vec3 L0 = (kd * albedo / PI + specular) * radiance;        //BRDF完成
  
          //后期处理
          vec3 ambient = vec3(0.03) * albedo * ao;                   //环境光
          vec3 color = ambient + L0;
          color = color / (color + vec3(1.0));                       //HDR处理
          color = pow(color, vec3(1.0 / 2.2));                       //gamma矫正
  
          gl_FragColor = vec4(color, 1.0);
      }`,

    attributes: {
        position: cubePositions,
        normal: createNormals(cubeElements, cubePositions),
        uv: cubeUvs,
    },

    uniforms: {
        projection: PROJECTION.value,
        view: VIEW.value,
        model: new Props('model'),
        lightColor: [1.0, 1.0, 1.0],                    //光照颜色（总能量）
        lightPosition: LIGHT_POSITION.value,
        cameraPosition: CAMERA_POSITION.value,
        //PBR属性设置
        albedo: [1.0, 0.0, 0.0],                        //材质反射率
        ao: 0.5,                                        //环境光
        roughness: new Props('roughness'),              //粗糙度
        metallic: new Props('metallic'),                //金属度
        offset: new Props('offset'),
    },

    elements: cubeElements,
});

const IDENTITY0 = new Mat4().identity().translate(new Vec3().set(0, 0, 1.5));
const IDENTITY1 = new Mat4().identity();
const IDENTITY2 = new Mat4().identity().translate(new Vec3().set(0, 0,-1.5));

const anim = () => {
    pipegl0.clear({
        color:[0,0,0,1],
        depth:true,
    });

    draw0.batch<IProps>([
        { model: IDENTITY0.rotateY(0.005).value, roughness: 0.6, metallic: 0.1 },
        { model: IDENTITY1.rotateY(0.005).value, roughness: 0.3, metallic: 0.1 },
        { model: IDENTITY2.rotateY(0.005).value, roughness: 0.2, metallic: 0.9 },
    ]);
    requestAnimationFrame(anim);
}

anim();