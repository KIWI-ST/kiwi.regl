import { Mat4, Vec2, Vec3 } from "kiwi.matrix";
import { fetchTexture } from "../util/createTexture";
import { createQuads } from "../util/createQuads";
import { GTexture, IPerformance, IPipeCommand, PipeGL, TAttribute, TUniform } from "../../src";
import { createTerrainV1, fetchCreateTerrainV1 } from "../util/createTerrainV1";

const W:number = 1200;
const H:number = 600;
const CAMERAPOSITION = [0, 0, 2];
const ProjectionMatrix = Mat4.perspective(Math.PI / 4, W / H, 0.01, 100);
const ViewMatrix = new Mat4().lookAt(new Vec3().set(CAMERAPOSITION[0], CAMERAPOSITION[1], CAMERAPOSITION[2]), new Vec3().set(0, 0.0, 0), new Vec3().set(0, 1, 0)).invert();
const ModelMatrix = new Mat4().identity();

const pipegl0 = new PipeGL({
    width: W,
    height: H
});

const createTerrainPass = (uri:string, rangeMin:Vec2, rangeMax:Vec2)=>{
    
    const quad1d:number = 64;
    const { quadPositions, quadIndices, quadUvs } = createQuads(quad1d, rangeMin, rangeMax);

    interface Attribute extends TAttribute {
        position: number[][];   //顶点坐标
        uv: number[][];          //纹理坐标
    }

    interface Uniform extends TUniform {
        texture: GTexture;
        projection: number[];                                               //投影矩阵
        view: number[];                                                     //世界矩阵（摄像头方向）
        model: { (performance: IPerformance, batchId: number): number[] };  //模型矩阵
    
        // 光照相关
        ambient: number;         //light相关：环境光
        lightColor: number[];    //light相关：光颜色
        lightPosition: { (performance: IPerformance, batchId: number): number[] }; //light相关：光源位置
        specular: number;        //light相关：镜面反射率
        viewPosition: number[];   //light相关：摄像头位置
    }

    return fetchCreateTerrainV1(uri).then(t=>{

        const tex0 = pipegl0.texture2D(
            t.buf,
            t.w,
            t.h,
            t.c,
            {
                mag: 'NEAREST',
                min: 'NEAREST',
                flipY: true
            }
        );

        return pipegl0.compile<Attribute, Uniform>({
    
            vert: `precision mediump float;
        
            attribute vec3 position;
            attribute vec2 uv;
        
            const float lerp = ${1.0/quad1d};
    
            uniform sampler2D texture;
        
            uniform mat4 projection, view, model;
        
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
        
            float decode_elevation(float r, float g, float b){
                float f = (r* 256.0 * 256.0 + g * 256.0 + b) * 255.0 * 0.1;
                return -10000.0 + f;
            }
        
            float get_z(float u, float v){
                vec2 uv0 = vec2(clamp(u, 0.0, 1.0), clamp(v, 0.0, 1.0));
                // vec2 uv0 = vec2(u, v);
                vec4 v4 = texture2D(texture, uv0);
                return decode_elevation(v4.x, v4.y, v4.z);
            }
        
            // 计算以pos为起点三角形的面法线
            // unity
            vec3 get_normal(vec3 p0, vec3 p1, vec3 p2){
                vec3 a = p0 - p1;
                vec3 b = p0 - p2;
                vec3 n = cross(a, b);
                return normalize(n);
            }
        
            // 采取9个偏移点计算顶点法向量的方法增强精度
            // |p8|p7|p6|
            // ----------
            // |p1|p0|p5|
            // -----------
            // |p2|p3|p4|
            vec3 get_vertex_normal(vec3 p0, vec2 uv0){
        
                float px1 = p0.x - lerp;
                float px2 = p0.x;
                float px3 = p0.x + lerp;
        
                float py1 = p0.y - lerp;
                float py2 = p0.y;
                float py3 = p0.y + lerp;
        
                float u1 = uv0.x - lerp;
                float u2 = uv0.x;
                float u3 = uv0.x + lerp;
        
                float v1 = uv0.y - lerp;
                float v2 = uv0.y;
                float v3 = uv0.y + lerp;
        
                vec3 p1 = vec3(px1, py1, get_z(u1, v1));
                vec3 p2 = vec3(px2, py1, get_z(u2, v1));
                vec3 p3 = vec3(px3, py1, get_z(u3, v1));
        
                vec3 p4 = vec3(px1, py2, get_z(u1, v2));
                vec3 p5 = vec3(px3, py2, get_z(u3, v2));
        
                vec3 p6 = vec3(px1, py3, get_z(u1, v3));
                vec3 p7 = vec3(px2, py3, get_z(u2, v3));
                vec3 p8 = vec3(px3, py3, get_z(u3, v3));
        
                vec3 n = vec3(0.0, 0.0, 0.0);
        
                // 四个三角形法线求和
                n += get_normal(p0, p1, p2);
                n += get_normal(p0, p3, p4);
                n += get_normal(p0, p5, p6);
                n += get_normal(p0, p7, p8);
                n = normalize(n);
    
                return n;
            }
        
            void main(){
                float h = get_z(uv.x, uv.y);
                vPosition = vec3(position.x, position.y, h * 0.15);
                vNormal = get_vertex_normal(vPosition, uv);
                vUv = uv;
                gl_Position = projection * view * model * vec4(vPosition, 1.0);
            }`,
        
            frag: `precision mediump float;
        
            uniform float ambient;  //环境光
            uniform float specular; //镜面光
            uniform vec3 lightColor;
            uniform vec3 lightPosition;
            uniform vec3 viewPosition;
        
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vUv;
        
            void main(){
                //计算环境光结果
                vec3 ambient0 = ambient * lightColor;                       
                //计算漫反射
                vec3 lightDir = normalize(lightPosition - vPosition);       
                float diff = max(dot(vNormal, lightDir), 0.0);
                vec3 diffuse0 = diff * lightColor;
                //镜面反射
                vec3 viewDir = normalize(viewPosition - vPosition);
                vec3 reflectDir= reflect(-lightDir, vNormal);
                float spec = max(dot(viewDir, reflectDir), 0.0);
                //注意这里pow(float, float), 参数必须是float类型
                float spec32 = pow(spec, 32.0);                  
                vec3 specular0 = specular * spec32 * lightColor;
                // 颜色汇总
                gl_FragColor=vec4(ambient0 + diffuse0 + specular0, 1.0);
                // gl_FragColor=vec4(vUv, 1.0, 1.0);
            }`,
        
            attributes: {
                position: quadPositions,
                uv: quadUvs
            },
        
            uniforms: {
                texture: tex0,
                projection: ProjectionMatrix.value,
                view: ViewMatrix.value,
                model: (performance: IPerformance, batchId: number): number[] => {
                    return ModelMatrix.rotateZ(0.000).value;
                },
                //视角位置
                viewPosition: CAMERAPOSITION,        
                //镜面反射率
                specular: 0.6,                       
                //环境光
                ambient: 0.1,                        
                //白光
                lightColor: [1, 1, 1],                 
                //光源位置
                lightPosition: (performance: IPerformance, batchId: number): number[] => {
                    const t0 = Math.cos(performance.count * 0.01);
                    const t1 = Math.sin(performance.count * 0.01);
                    const p0 = [t0 * 3.5, t1 * 3, -10.0];
                    return p0;
                },       
            },
        
            elements: quadIndices
        })

    });
 
}

const queue:IPipeCommand[] = [];

createTerrainPass("assets/terrain/0_0.png", new Vec2().set(-0.5, 0.0), new Vec2().set(0.0, 0.5)).then(pass=>{
    queue.push(pass);
});

createTerrainPass("assets/terrain/1_0.png", new Vec2().set(0.0, 0.0), new Vec2().set(0.5, 0.5)).then(pass=>{
    queue.push(pass);
});

createTerrainPass("assets/terrain/0_1.png", new Vec2().set(-0.5, -0.5), new Vec2().set(0.0, 0.0)).then(pass=>{
    queue.push(pass);
});

createTerrainPass("assets/terrain/1_1.png", new Vec2().set(0.0, -0.5), new Vec2().set(0.5, 0.0)).then(pass=>{
    queue.push(pass);
});

const anim = () => {
    for(let i=0;i<queue.length;i++){
        queue[i].draw();
    }
    requestAnimationFrame(anim);
}

anim();