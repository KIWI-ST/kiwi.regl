import { Block } from "kiwi.codegen";
import { IPipelineData, Pipeline } from "../core/Pipeline";

/**
 * 通过pipeline注入program/current切换program
 * @param pipeline 
 * @param iBlock 
 * @param pipelineData 
 */
const emitProgram = (
    pipeline: Pipeline,
    iBlock: Block,
    pipelineData: IPipelineData
) => {
    const PROGRAMSTATE_NAME = pipeline.getVariable('programState');
    //判断program是否需要切换
    //优化点：program切换是比较耗性能的操作
    const cond = iBlock.createConditionT(`!${PROGRAMSTATE_NAME}.Current||${PROGRAMSTATE_NAME}.Current.ID!==${pipelineData.program.ID}`);
    cond.Then.push(`${PROGRAMSTATE_NAME}.useProgram(${pipelineData.program.ID})`);
}

export { emitProgram }