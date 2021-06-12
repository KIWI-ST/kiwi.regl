/**
 * @description default webgl option
 * https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext
 */
const GLOption: WebGLContextAttributes = {
    alpha: true,                         //指示canvas包含alpha缓冲区
    antialias: false,                    //默认不开抗锯齿
    depth: true,                         //默认开启16位深度缓冲，
    failIfMajorPerformanceCaveat: true,  //表明在一个系统性能低的环境是否创建该上下文的
    powerPreference: 'high-performance', //指示浏览器在运行WebGL上下文时使用相应的GPU电源配置
    premultipliedAlpha: false,           //表明排版引擎将假设绘制缓冲区包含预混合alpha通道的boolean值
    preserveDrawingBuffer: false,        //表示缓冲区会被清除
    stencil: true,                       //表示默认开启8位深的末班缓冲
    //desynchronized: boolean;
}

export {
    GLOption
}