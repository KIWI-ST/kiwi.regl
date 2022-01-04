import { Block } from "kiwi.codegen";
import { Extension } from "../core/Extension";
import { IPipelineData, Pipeline } from "../core/Pipeline";
import { emitAttribute } from "./emitAttribute";
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
    const LOOP_BATCH_NAME = batchBlock.def(0);
    const P0_NAME = `p0[${LOOP_BATCH_NAME}]`;
    //创建for循环体
    batchBlock.push(`for(${LOOP_BATCH_NAME};${LOOP_BATCH_NAME}<p0.length;++${LOOP_BATCH_NAME}){`);
    const scope0 = batchBlock.createScope(), iBlock = scope0.Entry, oBlock = scope0.Exit;
    //2.处理attribute
    emitAttribute(pipeline, iBlock, extLib, pipelineData.vao, pipelineData.program.Attributes, pipelineData.attributeRecordSet,P0_NAME);
    //2.处理uniform
    emitUniform(pipeline, iBlock, oBlock, pipelineData.program.Uniforms, pipelineData.uniformRecordSet, P0_NAME);
    //3.batch draw
    emitElement(pipeline, extLib, pipelineData.vao, iBlock, pipelineData.element, instances);
    //4.循环体结束
    batchBlock.push(`}`);
}

export { emitBatch }