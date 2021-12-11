import { GTexture, IPerformance, PipeGL, TAttribute, TUniform } from './../src/index';

const RADIUS: number = 512;

interface Attribute extends TAttribute {
    position: number[][];
}

interface Uniform extends TUniform {
    color: number[];
    offset: { (performance: IPerformance, batId: number): number }
}

const pipegl0 = new PipeGL({
    width: RADIUS,
    height: RADIUS,
    extensions: ['WEBGL_draw_buffers', 'ANGLE_instanced_arrays', 'OES_vertex_array_object']
});

const textureData = new Uint8Array(RADIUS * RADIUS * 4);

const texture0 = pipegl0.texture2D(textureData, RADIUS, RADIUS, 4);

const texture1 = pipegl0.texture2D(textureData, RADIUS, RADIUS, 4);

const texture2 = pipegl0.texture2D(textureData, RADIUS, RADIUS, 4);

const framebuffer0 = pipegl0.framebuffer({
    colors: [texture0, texture1, texture2]
});

const draw0 = pipegl0.compile<Attribute, Uniform>({

    frag: `
        precision mediump float;

        #extension GL_EXT_draw_buffers : require

        uniform vec4 color;

        void main(){
            gl_FragData[0] = color;
            gl_FragData[1] = vec4(color.x, color.y, 1.0, 1.0);
            gl_FragData[2] = vec4(1.0, 1.0, color.z, 1.0);;
        }`,

    vert: `
        precision mediump float;
        attribute vec2 position;

        uniform float offset;

        void main(){
            gl_Position = vec4(position.x+offset, position.y+offset, 0, 1);
        }
    `,

    attributes: {
        position: [
            [-1, 0],
            [0, -1],
            [1, 1]
        ]
    },

    uniforms: {
        color: [1, 0.5, 0, 1],
        offset: (performance: IPerformance, batId: number): number => { return Math.sin(performance.count * 0.01); }
    },

    framebuffer: {
        framebuffer: framebuffer0,
        clear: {
            color:[0,0,0,1],
            depth: true
        }
    },

    count: 3,
});


interface PASS1Attribute extends TAttribute {
    position: number[][];
    texCoord: number[][];
}

interface PASSUniform extends TUniform {
    texture: GTexture;
}

const PASS0 = pipegl0.compile<PASS1Attribute, PASSUniform>({

    vert: `precision mediump float;
    attribute vec2 position;
    attribute vec2 texCoord;

    varying vec2 vTexCoord;

    void main(){
        vTexCoord = texCoord;
        gl_Position = vec4(position, 0, 1.0);
    }
    `,

    frag: `precision mediump float;

    uniform sampler2D texture;

    varying vec2 vTexCoord;

    void main(){
        gl_FragColor = texture2D(texture, vTexCoord);
    }
    `,

    primitive: 'TRIANGLES',

    attributes: {
        position: [
            [-1, 1],
            [1, 1],
            [1, -1],
            [-1, -1],
            [1, 1]
        ],
        texCoord: [
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 0],
            [1, 1]
        ]
    },

    uniforms: {
        texture: texture2
    },

    count: 6

});


const anim = () => {
    pipegl0.clear(
        {
            color:[1,0,1,1],
            depth:true,
            stencil:true
        }
    )
    draw0.draw();
    PASS0.draw();
    requestAnimationFrame(anim);
}

anim();