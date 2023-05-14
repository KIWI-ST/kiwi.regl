/**
 * 基于IBL的PBR渲染过程：
 * 1. 计算漫反射，存储到cubemap中（radiance)
 * 2. 计算镜面反射，
 *    A. 预过滤环境镜面贴图（HDR）
 *    B. BRDF查找图（LUT）
 * 3. 应用预计算数据环境贴图
 */

import { Mat4, Vec3 } from "kiwi.matrix";

import { createRGBA } from "../createRGBA";
import { createNormals } from "../createNormals";
import { cubeElements, cubePositions, cubeUvs } from "../createCube";

import { GTexture, PipeGL, Props, TAttribute, TProps, TUniform } from "../../src";

const RADIUS = 700;

const CAMERA_POSITION = new Vec3().set(0, 0, 5);

const CAMERA_MATRIX = new Mat4().lookAt(CAMERA_POSITION, new Vec3().set(0.0, 0.0, 0.0), new Vec3().set(0.0, 1.0, 0.0));

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS,
});

//立方体贴图数据（环境贴图）
const cubeSource = [
    createRGBA('/example/assets/cube/negx.jpg', 'negx'),
    createRGBA('/example/assets/cube/negy.jpg', 'negy'),
    createRGBA('/example/assets/cube/negz.jpg', 'negz'),
    createRGBA('/example/assets/cube/posx.jpg', 'posx'),
    createRGBA('/example/assets/cube/posy.jpg', 'posy'),
    createRGBA('/example/assets/cube/posz.jpg', 'posz'),
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

    //
    cubeFaces.forEach(face => {
        faces[face.key] = face.buf;
    });

    //环境光立方体纹理
    const skyboxTexture = pipegl0.textureCube(
        faces,
        w,
        h,
        c,
        {
            min: 'LINEAR_MIPMAP_LINEAR',
            mag: 'LINEAR',
            flipY: false,                     //计算辐照图时保持贴图Y方向正常
        }
    );

    //环境光立方体纹理
    const cubeTexture = pipegl0.textureCube(
        faces,
        w,
        h,
        c,
        {
            min: 'LINEAR_MIPMAP_LINEAR',
            mag: 'LINEAR',
            flipY: true,                     //计算辐照图时保持贴图Y方向正常
        }
    );




    interface AttirbuteSkybox extends TAttribute {
        position: number[][];
    }

    interface UniformSkeybox extends TUniform {
        cameraMatrix: number[];
        texture: GTexture;
    }


    const skeybox = pipegl0.compile<AttirbuteSkybox, UniformSkeybox>({

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
            cameraMatrix: CAMERA_MATRIX.value,
            texture: skyboxTexture
        },

        count: 6,

        status: {
            DEPTH_TEST: true,
            depthFunc: [0x0203]      //参考值小于或等于模板值时通过
        }
    });

    //1.radiance-attribute 辐照贴图预计算
    interface radianceAttribute extends TAttribute {
        position: number[][];
    }

    //1.radiance-uniform 辐照贴图预计算
    interface radianceUniform extends TUniform {
        cameraMatrix: number[];
        texture: GTexture;
    }

    const w0 = 32, h0 = 32;

    const irradianceCubeTexture = pipegl0.textureCube(
        {
            posx: new Uint8Array(w0 * h0 * c),
            posy: new Uint8Array(w0 * h0 * c),
            posz: new Uint8Array(w0 * h0 * c),
            negx: new Uint8Array(w0 * h0 * c),
            negy: new Uint8Array(w0 * h0 * c),
            negz: new Uint8Array(w0 * h0 * c),
        },
        w0,
        h0,
        c,
        {
            min: 'LINEAR_MIPMAP_LINEAR',
            mag: 'LINEAR',
        }
    );

    //绘制方程1：辐照度计算

    //输入的color attachment是
    const irradianceFramebuffer = pipegl0.framebuffer({
        colors: [irradianceCubeTexture]
    });

    const radiance0 = pipegl0.compile<radianceAttribute, radianceUniform>({
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
            cameraMatrix: CAMERA_MATRIX.value,
            texture: cubeTexture
        },

        count: 6,

        framebuffer: {
            framebuffer: irradianceFramebuffer
        },

        status: {
            DEPTH_TEST: true,
            depthFunc: [0x0203]      //参考值小于或等于模板值时通过
        }
    });

    radiance0.draw();

    //2.镜面反射部分
    //2.1 镜面反射HDR预过滤

    // hdr-attribute 预过滤计算
    interface hdrAttribute extends TAttribute {
        position: number[][];
    }

    // hdr-uniform 辐照贴图预计算
    interface hdrUniform extends TUniform {
        cameraMatrix: number[];
        texture: GTexture;
        roughness: number;
    }

    const w1 = 512, h1 = 512;

    //辐射立方体纹理, 存储环境贴图漫反射采样结果
    const hdrTexture = pipegl0.textureCube(
        {
            posx: new Uint8Array(w1 * h1 * c),
            posy: new Uint8Array(w1 * h1 * c),
            posz: new Uint8Array(w1 * h1 * c),
            negx: new Uint8Array(w1 * h1 * c),
            negy: new Uint8Array(w1 * h1 * c),
            negz: new Uint8Array(w1 * h1 * c),
        },
        w1,
        h1,
        c,
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
    const hrd0 = pipegl0.compile<hdrAttribute, hdrUniform>({
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
            cameraMatrix: CAMERA_MATRIX.value,
            texture: cubeTexture,
            roughness: 0.01,
        },

        count: 6,

        framebuffer: {
            framebuffer: hrdFramebuffer
        },

        status: {
            viewport: [0, 0, w1, h1],
            DEPTH_TEST: true,
            depthFunc: [0x0203]      //参考值小于或等于模板值时通过
        }
    });

    hrd0.draw();

    //预过滤HDR环境贴图(镜面反射分量), 基于Hammersley随机生成采样点序方法
    //还有位运算符版本：
    //https://learnopengl-cn.github.io/07%20PBR/03%20IBL/02%20Specular%20IBL/#hdr
    interface brdfAttribute extends TAttribute {
        position: number[][];
        uv: number[][];
    }

    interface brdfUniform extends TUniform {
        roughness: number;
    }

    const brdfTexutre = pipegl0.texture2D(new Uint8Array(RADIUS * RADIUS * 4), RADIUS, RADIUS, 4);

    const brdfFramebuffer = pipegl0.framebuffer({ colors: [brdfTexutre] });

    const brdf0 = pipegl0.compile<brdfAttribute, brdfUniform>({
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
            for(int i=0; i<32; ++i){
                if(n>0){
                    denom = mod(float(n),2.0);
                    r += denom * invBase;
                    invBase = invBase /2.0;
                    n = int(float(n)/2.0);
                }
            }
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
            uv: [
                [0, 1],
                [1, 1],
                [0, 0],
                [0, 0],
                [1, 1],
                [1, 0]
            ]
        },

        uniforms: {
            roughness: 0.5,
        },

        count: 6,

        framebuffer: {
            framebuffer: brdfFramebuffer,
        },

        status: {
            viewport: [0, 0, RADIUS, RADIUS],
            DEPTH_TEST: true,
            depthFunc: [0x0203]      //参考值小于或等于模板值时通过
        }
    });

    brdf0.draw();

    //3.拼合绘制PBR
    const LIGHT_POSITION = new Vec3().set(1, 0, 1);
    const PROJECTION = Mat4.perspective(Math.PI / 3, RADIUS / RADIUS, 0.01, 1000);
    const VIEW_MATRIX = new Mat4().lookAt(CAMERA_POSITION, new Vec3().set(0, 0, 0), new Vec3().set(0, 1, 0)).invert();

    interface IProps extends TProps {
        metallic: number;
        roughness: number;
        model: number[];
    }

    interface pbrAttribute extends TAttribute {
        position: number[][];
        normal: number[][];
        uv: number[][];
    }

    interface pbrUniform extends TUniform {
        projection: number[];
        view: number[];
        model: Props<IProps>;
        //材质设定
        albedo: number[];
        metallic: Props<IProps>;
        roughness: Props<IProps>;
        ao: number;
        //
        lightPosition: number[];
        cameraPosition: number[];
        lightColor: number[];
        //IBL属性
        irradianceCubeTexture: GTexture;
        hdrCubeTexture: GTexture;
        brdfTexture: GTexture;
    }

    //结合IBL的PBR渲染
    const pbr0 = pipegl0.compile<pbrAttribute, pbrUniform>({

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
    
        //IBL
        uniform samplerCube hdrCubeTexture;
        uniform sampler2D brdfTexture;
        uniform samplerCube irradianceCubeTexture;

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

        vec3 F_Fresnel_Roughness(float cosTheta, vec3 F0, float roughness){
            return F0 + (max(vec3(1.0-roughness),F0)-F0)*pow(clamp(1.0-cosTheta,0.0,1.0),5.0);
        }
    
        void main(){
            vec3 N = normalize(vNormal);                               //法线
            vec3 V = normalize(cameraPosition - vPosition);            //物体->视角 方向向量
            vec3 R = reflect(-V, N);

            //计算入射管线反射反向，得到菲涅尔系数
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
    
            //使用IBL处理后期处理1: 漫反射
            vec3 IBL_F = F_Fresnel_Roughness(max(dot(N,V),0.0), F0, roughness);
            vec3 IBL_KS = IBL_F;
            vec3 IBL_KD = 1.0-IBL_KS;
            IBL_KD *= 1.0-metallic;

            vec3 irradiance = textureCube(irradianceCubeTexture, N).rgb;
            vec3 diffuse = irradiance * albedo;

            //使用IBL处理后期处理2: 镜面反射
            vec3 hdr = textureCube(hdrCubeTexture, R).rgb;
            vec2 brdf = texture2D(brdfTexture, vec2(max(dot(N,V),0.0), roughness)).rg;
            vec3 IBL_specular = hdr*(F*brdf.x+brdf.y);

            //后期处理
            vec3 ambient = (IBL_KD*diffuse+IBL_specular)*ao;                 //环境光
            vec3 color = ambient + L0;
            color = color / (color + vec3(1.0));                            //HDR处理
            color = pow(color, vec3(1.0 / 2.2));                            //gamma矫正
            gl_FragColor = vec4(color, 1.0);
        }`,

        attributes: {
            position: cubePositions,
            normal: createNormals(cubeElements, cubePositions),
            uv: cubeUvs,
        },

        uniforms: {
            projection: PROJECTION.value,
            view: VIEW_MATRIX.value,
            model: new Props('model'),
            lightColor: [1.0, 1.0, 1.0],                    //光照颜色（总能量）
            lightPosition: LIGHT_POSITION.value,
            cameraPosition: CAMERA_POSITION.value,
            //PBR属性设置
            albedo: [0.5, 0.5, 0.5],                        //材质反射率
            ao: 0.5,                                        //环境光
            roughness: new Props('roughness'),              //粗糙度
            metallic: new Props('metallic'),                //金属度
            offset: new Props('offset'),
            //
            brdfTexture: brdfTexutre,
            hdrCubeTexture: hdrTexture,
            irradianceCubeTexture: irradianceCubeTexture
        },

        elements: cubeElements,
    });

    //循环绘制
    const IDENTITY0 = new Mat4().identity().translate(new Vec3().set(1.5, 0, 0));
    const IDENTITY1 = new Mat4().identity();
    const IDENTITY2 = new Mat4().identity().translate(new Vec3().set(-1.5, 0, 0));

    const anim = () => {
        pbr0.batch<IProps>([
            { model: IDENTITY0.rotateY(0.001).value, roughness: 0.6, metallic: 0.1 },
            { model: IDENTITY1.rotateY(0.001).value, roughness: 0.3, metallic: 0.6 },
            { model: IDENTITY2.rotateY(0.001).value, roughness: 0.2, metallic: 0.5 },
        ]);
        skeybox.draw();
        requestAnimationFrame(anim);
    }

    anim();
});