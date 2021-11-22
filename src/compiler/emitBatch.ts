import { Block } from "kiwi.codegen";
import { Extension } from "../core/Extension";
import { IPipelineData, Pipeline } from "../core/Pipeline";
import { emitElement } from "./emitElement";
import { emitFramebuffer } from "./emitFramebuffer";
import { emitUniform } from "./emitUniform";

/**
 * 
 * @param pipeline 
 * @param batchBlock 
 * @param pipelineData 
 * @param extLib 
 * @param instances 
 */
const emitBatch = (
    pipeline: Pipeline,
    batchBlock: Block,
    pipelineData: IPipelineData,
    extLib: Extension,
    instances: number
) => {
    const LOOP_NAME = batchBlock.def(0);
    const P0_NAME = `p0[${LOOP_NAME}]`;
    //创建for循环体
    batchBlock.push(`for(${LOOP_NAME};${LOOP_NAME}<p0.length;++${LOOP_NAME}){`);
    const scope0 = batchBlock.createScope(), iBlock = scope0.Entry, oBlock = scope0.Exit;
    //1.处理framebuffer
    emitFramebuffer(pipeline, iBlock, oBlock, pipelineData.framebuffer, extLib);
    //2.处理uniform
    emitUniform(pipeline, iBlock, oBlock, pipelineData.program.Uniforms, pipelineData.uniformRecordSet, P0_NAME);
    //3.batch draw
    emitElement(pipeline, extLib, pipelineData.vao, iBlock, pipelineData.element, instances);
    batchBlock.push(`}`);
}

export { emitBatch }