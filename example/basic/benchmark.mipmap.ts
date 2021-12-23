import { GTexture, IPerformance, PipeGL, TAttribute, TUniform } from "../../src";

interface Attribute extends TAttribute {
    position: number[];
}

interface Uniform extends TUniform {
    tick: { (performance: IPerformance, batchId: number): number };
    texture: GTexture;
}

const RADIUS = 700;

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS
});

const u8arr = new Uint8Array([
    255, 255, 255, 255, 0, 0, 0, 0,
    255, 255, 255, 255, 0, 0, 0, 0,
    255, 255, 255, 255, 0, 0, 0, 0,
    255, 255, 255, 255, 0, 0, 0, 0,
    0, 0, 0, 0, 255, 255, 255, 255,
    0, 0, 0, 0, 255, 255, 255, 255,
    0, 0, 0, 0, 255, 255, 255, 255,
    0, 0, 0, 0, 255, 255, 255, 255,
]);

const texture0 = pipegl0.texture2D(u8arr, 8, 8, 1, { min: "LINEAR_MIPMAP_LINEAR", mag: 'NEAREST', wrapS: 'REPEAT', wrapT: 'REPEAT', anisotropic: 1 });

const draw0 = pipegl0.compile<Attribute, Uniform>({

    vert: `precision mediump float;

    attribute vec2 position;

    varying vec2 uv;

    void main(){
        uv=position;
        gl_Position=vec4(1.0-2.0*position,0,1);
    }
    `,

    frag: `precision mediump float;
    
    uniform sampler2D texture;
    uniform float tick;

    varying vec2 uv;

    void main(){
        mat3 m = mat3(
            cos(tick), sin(tick), -1.1+cos(tick),
            -sin(tick), cos(tick), 0,
            0, 0, 1);
        vec3 p = m*vec3(uv,1);
        gl_FragColor = texture2D(texture, p.xy/p.z);
    }
    `,

    attributes: {
        position: [-2, 0, 0, -2, 2, 2]
    },

    uniforms: {
        tick: (performance: IPerformance, batchId: number): number => 0.003 * performance.count,
        texture: texture0
    },

    count: 3
});

const anim = () => {
    draw0.draw();
    requestAnimationFrame(anim);
}

anim();