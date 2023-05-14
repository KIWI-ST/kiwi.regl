import { SExtension } from "../core/Extension";

/**
 * https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext
 */
const defaultWebGLOptions: WebGLContextAttributes = {
    alpha: true,                                         //默认开启alpha缓冲
    antialias: false,                                    //默认不开抗锯齿
    depth: true,                                         //默认开启16位深度缓冲
    failIfMajorPerformanceCaveat: true,                  //表面在一个系统性能低的环境下是否创建该上下文
    powerPreference: 'high-performance',                 //指示浏览器运行WebG时相应的GPU电源配置
    premultipliedAlpha: false,                           //排版引擎假设绘制是否已包含预混alpha通道
    preserveDrawingBuffer: false,                        //表面缓冲区会不会被清除
    stencil: true,                                       //表示默认开启8位深度模板缓冲
    // desynchronized: 
}

/**
 * 初始化支持的输入参数
 */
interface IConfigure {
    /**
     * WebGL绘制上下文
     */
    gl?: WebGLRenderingContext;

    /**
     * 页面画布元素
     */
    canvas?: HTMLCanvasElement;

    /**
     * 容器元素
     */
    container?: HTMLElement;

    /**
     * webgl上下文创建初始化属性
     */
    webglOptions?: WebGLContextAttributes;

    /**
     * 扩展
     */
    extensions?: SExtension[];

    /**
     * 设备ratio比率
     */
    devicePixelRatio?: number;

    /**
     * 像素宽度
     */
    width?: number;

    /**
     * 像素高度
     */
    height?: number;

    /**
     * }{ 还不清楚干啥用的
     */
    profile?: boolean;
}

/**
 * 
 * @param container 
 * @param width 
 * @param height 
 * @param devicePixelRatio 
 */
const createCanvasElement = (
    container: HTMLElement,
    width: number,
    height: number,
    devicePixelRatio: number
): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const w = width || container.clientWidth || window.innerWidth;
    const h = height || container.clientHeight || window.innerHeight;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.border = `0px`;
    canvas.style.margin = `0px`;
    canvas.style.padding = `0px`;
    canvas.style.top = `0px`;
    canvas.style.left = `0px`;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    container === document.body ? canvas.style.position = 'absolute' : null;
    container.appendChild(canvas);
    return canvas;
}

/**
 * @description
 * -webgl option
 * -container
 * -canvas
 * -gl
 * -width
 * -height
 * @param opts 
 */
const parseConfigure = (opts: IConfigure = {}): IConfigure => {
    opts.devicePixelRatio = opts.devicePixelRatio || devicePixelRatio || 1.0;
    opts.webglOptions = opts.webglOptions || defaultWebGLOptions;
    opts.container = opts.container || document.body;
    opts.canvas = opts.gl ? opts.gl.canvas as HTMLCanvasElement : opts.canvas ? opts.canvas : createCanvasElement(opts.container, opts.width, opts.height, opts.devicePixelRatio);
    opts.width = parseInt(opts.canvas.style.width);
    opts.height = parseInt(opts.canvas.style.height);
    opts.gl = opts.gl || opts.canvas.getContext('webgl', opts.webglOptions);
    opts.extensions = opts.extensions || [];
    opts.profile = false;
    return opts;
}

export {
    defaultWebGLOptions,
    type IConfigure,
    parseConfigure
}