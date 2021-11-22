import { Block } from "kiwi.codegen";
import { Pipeline } from "../core/Pipeline";
import { Status } from "../core/Status";
import { SWebGLStatusFLAG, SWebGLStatusVariable } from "../core/Support";

/**
 * 检查webgl状态是否一致
 * 如不一致则更新
 * @param pipeline 
 * @param iBlock 
 * @param status 
 */
const emitStatus = (pipeline: Pipeline, iBlock: Block, status: Status) => {
    if (status) {
        const STATUS_NAME = pipeline.link(status);
        status.StatusList.forEach((v: SWebGLStatusFLAG | SWebGLStatusVariable) => {
            const cond = iBlock.createConditionT(`${STATUS_NAME}.needRefresh('${v}')`);
            cond.Then.push(`${STATUS_NAME}.refresh('${v}')`);
        });
    }
}

export { emitStatus }