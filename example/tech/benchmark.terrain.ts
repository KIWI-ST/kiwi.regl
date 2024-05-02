import { Mat4, Vec2, Vec3 } from "kiwi.matrix";
import { fetchTexture } from "../util/createTexture";
import { createQuads } from "../util/createQuads";
import { GTexture, IPerformance, IPipeCommand, PipeGL, TAttribute, TUniform } from "../../src";
import { createTerrainV1, fetchCreateTerrainV1 } from "../util/createTerrainV1";

const W:number = 700;
const H:number = 700;
const CAMERAPOSITION = [0, -3, 2];
const ProjectionMatrix = Mat4.perspective(Math.PI / 4, W / H, 0.01, 100);
const ViewMatrix = new Mat4().lookAt(new Vec3().set(CAMERAPOSITION[0], CAMERAPOSITION[1], CAMERAPOSITION[2]), new Vec3().set(0, 0.0, 0), new Vec3().set(0, 1, 0)).invert();
const ModelMatrix = new Mat4().identity();

const pipegl0 = new PipeGL({
    width: W,
    height: H,
    extensions:["OES_standard_derivatives"]
});

const createTerrainPass = (uri:string, rangeMin:Vec2, rangeMax:Vec2)=>{
    
    const quad1d:number = 16;
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
                mag: "LINEAR",
                min: "LINEAR",
                flipY: true
            }
        );

        return pipegl0.compile<Attribute, Uniform>({
    
            vert: `
            precision mediump float;

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
                return decode_elevation(v4.x, v4.y, v4.z) / 16.0;
            }
        
            // 计算以pos为起点三角形的面法线
            // unity
            vec3 get_normal(vec3 p0, vec3 p1, vec3 p2){
                vec3 a = p0 - p1;
                vec3 b = p0 - p2;
                vec3 n = cross(a, b);
                return normalize(n);
            }
        
            // 采取5个点计算顶点法向量的方法增强精度
            // |  |pu|  |
            // ----------
            // |pl|po|pr|
            // -----------
            // |  |pd|  |
            vec3 get_vertex_normal(vec3 p0, vec2 uv0){
                vec3 po = p0;

                vec3 pu = vec3(po.x, po.y + lerp, get_z(uv0.x, uv0.y + lerp));
                vec3 pd = vec3(po.x, po.y - lerp, get_z(uv0.x, uv0.y - lerp));

                vec3 pl = vec3(po.x - lerp, po.y, get_z(uv0.x - lerp, uv0.y));
                vec3 pr = vec3(po.x + lerp, po.y, get_z(uv0.x + lerp, uv0.y));

                vec3 n = vec3(0.0, 0.0, 0.0);
                n += get_normal(po, pu, pr);
                n += get_normal(po, pd, pl);

                return normalize(n);
            }
        
            void main(){
                float h = get_z(uv.x, uv.y);
                vPosition = vec3(position.x, position.y, h);
                vNormal = get_vertex_normal(vPosition, uv);
                vec3 v3 = vec3(vPosition);
                gl_Position = projection * view * model * vec4(vPosition, 1.0);
            }`,
        
            frag: `
            #extension GL_OES_standard_derivatives : enable

            precision mediump float;
        
            uniform float ambient;  //环境光
            uniform float specular; //镜面光
            uniform vec3 lightColor;
            uniform vec3 lightPosition;
            uniform vec3 viewPosition;
        
            varying vec3 vNormal;
            varying vec3 vPosition;
        
            void main(){
                //计算环境光结果
                vec3 ambient0 = ambient * lightColor;                       
                //计算漫反射
                // vec3 vFaceNormal = vNormal;
                vec3 vFaceNormal = normalize(cross(dFdy(vPosition), dFdx(vPosition)));
                vec3 lightDir = normalize(lightPosition - vPosition);       
                float diff = max(dot(vFaceNormal, lightDir), 0.0);
                // float diff = dot(vFaceNormal, lightDir) > 0.0 ? 1.0 : -1.0;
                // diff = smoothstep(0.5, 1.0, diff);
                diff = mod(diff, 15.0);
                diff = diff/15.0;
                // diff = smoothstep(0.0, 1.0, diff);
                // float diff = dot(vFaceNormal, lightDir);
                vec3 diffuse0 = diff * lightColor;
                //镜面反射
                vec3 viewDir = normalize(viewPosition - vPosition);
                vec3 reflectDir= reflect(-lightDir, vFaceNormal);
                float spec = max(dot(viewDir, reflectDir), 0.0);
                //注意这里pow(float, float), 参数必须是float类型
                float spec32 = pow(spec, 32.0);                  
                vec3 specular0 = specular * spec32 * lightColor;
                // 颜色汇总
                vec4 color4 = vec4(ambient0 + diffuse0, 1.0);
                gl_FragColor= pow(color4, vec4(2.2));
                // gl_FragColor = color4;
                // gl_FragColor=vec4(ambient0 + diffuse0 + specular0, 1.0);
                // gl_FragColor=vec4(diffuse0 , 1.0);
                // gl_FragColor=vec4(diff, diff, diff, 1.0);
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
                ambient: 0.9,                        
                //白光
                lightColor: [1, 1, 1],                 
                //光源位置
                lightPosition: (performance: IPerformance, batchId: number): number[] => {
                    const t0 = Math.cos(performance.count * 0.001);
                    const t1 = Math.sin(performance.count * 0.001);
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
    pipegl0.clear({
        color: [0, 0, 0, 1],
        depth: true,
    });
    for(let i=0;i<queue.length;i++){
        queue[i].draw();
    }
    requestAnimationFrame(anim);
}

anim();