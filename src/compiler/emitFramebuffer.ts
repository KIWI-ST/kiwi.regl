import { Block } from "kiwi.codegen";
import { Pipeline } from "../core/Pipeline";
import { Extension } from "../core/Extension";
import { GFramebuffer } from "../res/GFramebuffer";
import { IPerformance } from "../util/createPerformance";
import { IFramebufferInfo } from "./parseFramebuffer";

/**
 * 
 * @param pipeline 
 * @param iBlock 
 * @param oBlock 
 * @param framebuffer 
 * @param extLib 
 */
const emitFramebuffer = (
    pipeline: Pipeline,
    iBlock: Block,
    oBlock: Block,
    framebuffer: IFramebufferInfo,
    extLib: Extension
): void => {
    const GL_NAME = pipeline.getVariable('gl'),
        FRAMEBUFFERSTATE_NAME = pipeline.getVariable('framebufferState'),
        EXT_DRAWBUFFERS_NAME = extLib.get('WEBGL_draw_buffers') ? pipeline.def(`${pipeline.getVariable('extLib')}.get('WEBGL_draw_buffers')`) : null,
        NEXT_NAME = `${FRAMEBUFFERSTATE_NAME}.Next`,
        CURRENT_NAME = `${FRAMEBUFFERSTATE_NAME}.Current`;
    //如果fbo存在，则使用fbo
    //Version 0.1.5 起支持cube map framebuffer贴图
    if (framebuffer && framebuffer.framebuffer instanceof GFramebuffer) {
        const FRAMEBUFFER_NAME = pipeline.link(framebuffer.framebuffer);
        const NEXT_FRAMEBUFFER_CACHED_NAME = iBlock.def(`${NEXT_NAME}`);
        iBlock.push(`${NEXT_NAME}=${FRAMEBUFFER_NAME}`);
        oBlock.push(`${NEXT_NAME}=${NEXT_FRAMEBUFFER_CACHED_NAME}`);

        //支持多FBO绑定
        const LOOP_FBO_NAME = iBlock.def(0);
        iBlock.push(`for(${LOOP_FBO_NAME};${LOOP_FBO_NAME}<${FRAMEBUFFER_NAME}.FBO.length;++${LOOP_FBO_NAME}){`);

        //判断当前framebuffer是否和framebufferState.Current一样
        const cond0 = iBlock.createConditionT(`${FRAMEBUFFER_NAME}!==${CURRENT_NAME}`);
        const cond0_1 = cond0.Then.createConditionTE(`${FRAMEBUFFER_NAME}`);
        cond0_1.Then.push(`${FRAMEBUFFER_NAME}.bind(${LOOP_FBO_NAME})`);

        if (EXT_DRAWBUFFERS_NAME) cond0_1.Then.push(`${EXT_DRAWBUFFERS_NAME}.drawBuffersWEBGL(${FRAMEBUFFER_NAME}.ColorDrawbuffers)`);
        cond0_1.Else.push(`${GL_NAME}.bindFramebuffer(${GL_NAME}.FRAMEBUFFER, null)`);

        iBlock.push(`${FRAMEBUFFERSTATE_NAME}.Current=${NEXT_NAME}`);

        //FBO_SCOPE结束
        oBlock.push(`}`);
    }
    //动态framebuffer
    else if (framebuffer && framebuffer.framebuffer) {
        const FN_NAME = pipeline.link(framebuffer.framebuffer as { (performance: IPerformance, batchId: number): GFramebuffer });
        const FRAMEBUFFER_NAME = iBlock.def(`${FN_NAME}.call(this, ${pipeline.getVariable('performance')}, ${pipeline.BatchID})`);
        //缓冲当前next fbo, 执行尾部填回
        const NEXT_FRAMEBUFFER_CACHED_NAME = iBlock.def(`${FRAMEBUFFERSTATE_NAME}.Next`);
        oBlock.push(`${FRAMEBUFFERSTATE_NAME}.Next=${NEXT_FRAMEBUFFER_CACHED_NAME}`);
        //
        iBlock.push(`${FRAMEBUFFERSTATE_NAME}.Next=${NEXT_FRAMEBUFFER_CACHED_NAME}`);
        const cond0 = iBlock.createConditionT(`${FRAMEBUFFER_NAME}&&${NEXT_NAME}!==${FRAMEBUFFERSTATE_NAME}.Current`);
        const cond0_1 = cond0.Then.createConditionTE(`${FRAMEBUFFER_NAME}`);
        cond0_1.Then.push(`${FRAMEBUFFER_NAME}.bind()`);
        //
        if (EXT_DRAWBUFFERS_NAME) cond0_1.Then.push(`${EXT_DRAWBUFFERS_NAME}.drawBuffersWEBGL(${FRAMEBUFFER_NAME}.ColorDrawbuffers)`);
        cond0_1.Else.push(`${GL_NAME}.bindFramebuffer(${GL_NAME}.FRAMEBUFFER, null)`);
        //
        iBlock.push(`${FRAMEBUFFERSTATE_NAME}.Current=${NEXT_NAME}`);
    }
    //framebuffer不存在， 但是current包含值，需要清理framebuffer
    else {
        const cond0 = iBlock.createConditionT(`${CURRENT_NAME}!==null`);
        cond0.Then.push(`${GL_NAME}.bindFramebuffer(${GL_NAME}.FRAMEBUFFER, null)`);
        cond0.Then.push(`${CURRENT_NAME}=null`);
    }
    //framebuffer into 其他设置
    if (framebuffer && framebuffer.color)
        iBlock.push(`${GL_NAME}.clearColor(${framebuffer.color})`);
    if (framebuffer && framebuffer.clearBit)
        iBlock.push(`${GL_NAME}.clear(${framebuffer.clearBit})`);
}

export { emitFramebuffer }