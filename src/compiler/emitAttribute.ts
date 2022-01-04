import { Block } from "kiwi.codegen";
import { Pipeline } from "../core/Pipeline";
import { Extension } from "../core/Extension";
import { IActiveInfo } from "../res/GProgram";
import { CArraybufferTarget, CAttributeTS } from "../core/Constant";
import { IAttributeRecord, GVertexArrayObject } from "../res/GVertexArrayObject";

/**
 * 
 * @param pipeline 
 * @param iBlock 
 * @param attribute 
 * @param record 
 * @param extLib 
 */
const emitBuffer = (
    pipeline: Pipeline,
    iBlock: Block,
    attribute: IActiveInfo,
    record: IAttributeRecord,
    extLib: Extension,
    input0: string
) => {
    const GL_NAME = pipeline.getVariable('gl'),
        ATTRIBUTE_NAME = pipeline.link(attribute),
        BUFFER_NAME = record.ln,
        LOCATION_NAME = iBlock.def(`${ATTRIBUTE_NAME}.location`),
        SIZE_NAME = iBlock.def(`${record.size || CAttributeTS[attribute.info.type]}`),
        BINDING_NAME = iBlock.def(`${pipeline.getVariable('attributeState')}.getAttribute(${attribute.location})`);
    //判断0，如果全局支持的attribute已有buffer,直接绑定并开始绘制
    //判断1，写入buffer
    //写入buffer信息，如果buffer没生成，则binding buffer
    const cond1 = iBlock.createConditionT(`!${BINDING_NAME}.buffer`);
    cond1.Then.push(`${GL_NAME}.enableVertexAttribArray(${LOCATION_NAME})`);
    // iBlock.push(`${GL_NAME}.enableVertexAttribArray(${LOCATION_NAME})`);
    //判断2，如果buffer是prop记录，则实时生成
    if (record.p) {
        const BUFFERSTATE_NAME = pipeline.getVariable('bufferState');
        const ISNDARRAY_NAME = pipeline.getVariable('isNDArray');
        record.dyn = iBlock.def(`${input0}${record.p.KEY}`);
        //2.1 buffer不存在
        const cond3 = iBlock.createConditionTE(`!${BINDING_NAME}.buffer`);
        //2.1-1, dyn是数组, 基于该数组创建buffer
        const cond3_0 = cond3.Then.createConditionTE(`${ISNDARRAY_NAME}(${record.dyn})`);
        cond3_0.Then.push(`${BINDING_NAME}.buffer=${BUFFERSTATE_NAME}.createBuffer({data:${record.dyn},target: 'ARRAY_BUFFER'})`);
        //2.1-1，dyn是reglbuffer
        cond3_0.Else.push(`${BINDING_NAME}.buffer=${record.dyn}`);
        //2.1余下逻辑：正常设置buffer属性
        cond3.Then.push(`${BINDING_NAME}.component=${BINDING_NAME}.buffer.component`);
        cond3.Then.push(`${BINDING_NAME}.size=${SIZE_NAME}`);
        cond3.Then.push(`${BINDING_NAME}.normalized=${record.normalized || false}`);
        cond3.Then.push(`${BINDING_NAME}.offset=${record.offset || 0}`);
        cond3.Then.push(`${BINDING_NAME}.stride=${record.stride || 0}`);
        cond3.Then.push(`${BINDING_NAME}.divisor=${record.divisor || 0}`);
        cond3.Then.push(`${BINDING_NAME}.buffer.bind()`);
        cond3.Then.push(`${GL_NAME}.vertexAttribPointer(${LOCATION_NAME},${BINDING_NAME}.size,${BINDING_NAME}.component, ${BINDING_NAME}.normalized, ${BINDING_NAME}.offset, ${BINDING_NAME}.stride)`);
        //2.2 buffer存在，
        //2.2-1 reocord.p是数组，替换buffer数据
        const cond3_1 = cond3.Else.createConditionTE(`${ISNDARRAY_NAME}(${record.dyn})`);
        cond3_1.Then.push(`${BINDING_NAME}.buffer.subData(${record.dyn})`);
        cond3_1.Else.push(`${BINDING_NAME}.buffer=${record.dyn}`);
        cond3_1.Else.push(`${BINDING_NAME}.buffer.bind()`);
        cond3_1.Else.push(`${GL_NAME}.vertexAttribPointer(${LOCATION_NAME},${BINDING_NAME}.size,${BINDING_NAME}.component, ${BINDING_NAME}.normalized, ${BINDING_NAME}.offset, ${BINDING_NAME}.stride)`);
        // cond3_1.Else.push(`${GL_NAME}.enableVertexAttribArray(${LOCATION_NAME})`);
    } 
    //buffer是存在的，只需要应用并赋值
    else {
        //判断2，可行条件下执行buffer赋值操作
        const cond2 = iBlock.createConditionT(`${BINDING_NAME}.component!==${BUFFER_NAME}.component||${BINDING_NAME}.size!==${SIZE_NAME}||${BINDING_NAME}.buffer!==${BUFFER_NAME}||${BINDING_NAME}.normalized!==${record.normalized || false}||${BINDING_NAME}.offset!==${record.offset || 0}||${BINDING_NAME}.stride!==${record.stride || 0}`);
        cond2.Then.push(`${BINDING_NAME}.component=${BUFFER_NAME}.component`);
        cond2.Then.push(`${BINDING_NAME}.size=${SIZE_NAME}`);
        cond2.Then.push(`${BINDING_NAME}.buffer=${BUFFER_NAME}`);
        cond2.Then.push(`${BINDING_NAME}.normalized=${record.normalized || false}`);
        cond2.Then.push(`${BINDING_NAME}.offset=${record.offset || 0}`);
        cond2.Then.push(`${BINDING_NAME}.stride=${record.stride || 0}`);
        cond2.Then.push(`${GL_NAME}.bindBuffer(${CArraybufferTarget['ARRAY_BUFFER']},${BUFFER_NAME}.buffer)`);
        cond2.Then.push(`${GL_NAME}.vertexAttribPointer(${LOCATION_NAME},${BINDING_NAME}.size,${BINDING_NAME}.component, ${BINDING_NAME}.normalized, ${BINDING_NAME}.offset, ${BINDING_NAME}.stride)`);
    }
    //判断3.是否需要实例化绘制（增加angle标记）
    if (extLib.get('ANGLE_instanced_arrays')) {
        const DIVISOR = record.divisor || 0;
        const cond4 = iBlock.createConditionT(`${BINDING_NAME}.divisor!==${DIVISOR}`);
        cond4.Then.push(`${pipeline.getVariable('extLib')}.get('ANGLE_instanced_arrays').vertexAttribDivisorANGLE(${LOCATION_NAME}, ${DIVISOR})`);
        cond4.Then.push(`${BINDING_NAME}.divisor=${DIVISOR}`);
    }
}

/**
 * 
 * @param pipeline 
 * @param iBlock 
 * @param extLib 
 * @param vao 
 * @param attributes 
 * @param attributeRecordSet 
 */
const emitAttribute = (
    pipeline: Pipeline,
    iBlock: Block,
    extLib: Extension,
    vao: GVertexArrayObject,
    attributes: IActiveInfo[],
    attributeRecordSet: Map<string, IAttributeRecord>,
    input0: string
): void => {
    //1.判断是否使用VAO
    const cond0 = iBlock.createConditionTE(`${pipeline.getVariable('vao')}`);
    //如果使用则使用VAO，绑定
    cond0.Then.push(`${pipeline.getVariable('attributeState')}.setVAO(${pipeline.getVariable('vao')})`);
    cond0.Then.push(`${pipeline.getVariable('vao')}.bindAttrs()`);
    //如果未使用，则绑定att属性
    cond0.Else.push(`${pipeline.getVariable('attributeState')}.setVAO(null)`);
    //如果不存在VAO绑定，则显式绑定属性
    if (!vao) {
        attributes.forEach((att: IActiveInfo) => {
            const name = att.name;
            const record = attributeRecordSet.get(name);
            emitBuffer(pipeline, iBlock, att, record, extLib, input0);
        })
    }
}

export { emitAttribute }