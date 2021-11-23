import { Block } from "kiwi.codegen";
import { Extension } from "../core/Extension";
import { Pipeline } from "../core/Pipeline";
import { GFramebuffer } from "../res/GFramebuffer";
import { IPerformance } from "../util/createPerformance";

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
    framebuffer: GFramebuffer | { (performance: IPerformance, batchId: number): GFramebuffer },
    extLib: Extension
): void => {
    const GL_NAME = pipeline.getVariable('gl'),
        FRAMEBUFFERSTATE_NAME = pipeline.getVariable('framebufferState'),
        EXT_DRAWBUFFERS_NAME = extLib.get('WEBGL_draw_buffers') ? pipeline.def(`${pipeline.getVariable('extLib')}.get('WEBGL_draw_buffers')`) : null,
        CONSTANT_NAME = pipeline.getVariable('pipeConstant'),
        DRAWBUFFER_NAME = `${CONSTANT_NAME}.drawBuffer`,
        BACKBUFFER_NAME = `${CONSTANT_NAME}.backBuffer`,
        NEXT_NAME = `${FRAMEBUFFERSTATE_NAME}.Next`,
        CURRENT_NAME = `${FRAMEBUFFERSTATE_NAME}.Current`;
    //如果fbo存在，则使用fbo
    if (framebuffer instanceof GFramebuffer) {
        const FRAMEBUFFER_NAME = pipeline.link(framebuffer);
        const NEXT_FRAMEBUFFER_CACHED_NAME = iBlock.def(`${NEXT_NAME}`);
        iBlock.push(`${NEXT_NAME}=${FRAMEBUFFER_NAME}`);
        oBlock.push(`${NEXT_NAME}=${NEXT_FRAMEBUFFER_CACHED_NAME}`);
        //判断当前framebuffer是否和framebufferState.Current一样
        const cond0 = iBlock.createConditionT(`${FRAMEBUFFER_NAME}!==${CURRENT_NAME}`);
        const cond0_1 = cond0.Then.createConditionTE(`${FRAMEBUFFER_NAME}`);
        cond0_1.Then.push(`${FRAMEBUFFER_NAME}.bind()`);

        if (EXT_DRAWBUFFERS_NAME) cond0_1.Then.push(`${EXT_DRAWBUFFERS_NAME}.drawBuffersWEBGL(${DRAWBUFFER_NAME}[${NEXT_NAME}.ColorAttachments.length])`);
        cond0_1.Else.push(`${GL_NAME}.bindFramebuffer(${GL_NAME}.FRAMEBUFFER, null)`);

        if (EXT_DRAWBUFFERS_NAME) iBlock.push(`${EXT_DRAWBUFFERS_NAME}.drawBuffersWEBGL(${BACKBUFFER_NAME})`);

        iBlock.push(`${FRAMEBUFFERSTATE_NAME}.Current=${NEXT_NAME}`);
    }
    //动态framebuffer
    else if (framebuffer) {
        const FN_NAME = pipeline.link(framebuffer);
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
        if(EXT_DRAWBUFFERS_NAME) cond0_1.Then.push(`${EXT_DRAWBUFFERS_NAME}.drawBuffersWEBGL(${DRAWBUFFER_NAME}[${NEXT_NAME}.ColorAttachments.length])`);
        cond0_1.Else.push(`${GL_NAME}.bindFramebuffer(${GL_NAME}.FRAMEBUFFER, null)`);

        if(EXT_DRAWBUFFERS_NAME) iBlock.push(`${EXT_DRAWBUFFERS_NAME}.drawBuffersWEBGL(${BACKBUFFER_NAME})`);

        iBlock.push(`${FRAMEBUFFERSTATE_NAME}.Current=${NEXT_NAME}`);
    }
    //framebuffer不存在， 但是current包含值，需要清理framebuffer
    else {
        const cond0 = iBlock.createConditionT(`${CURRENT_NAME}!==null`);
        cond0.Then.push(`${GL_NAME}.bindFramebuffer(${GL_NAME}.FRAMEBUFFER, null)`);
        cond0.Then.push(`${CURRENT_NAME}=null`);
    }
}

export { emitFramebuffer }