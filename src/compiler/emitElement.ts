import { Block } from "kiwi.codegen";
import { CComponent } from "../core/Constant";
import { Extension } from "../core/Extension";
import { Pipeline } from "../core/Pipeline";
import { REGLElementbuffer } from "../res/REGLElementbuffer";
import { REGLVertexArrayObject } from "../res/REGLVertexArrayObject";

/**
 * 
 * @param pipeline 
 * @param extLib 
 * @param vao 
 * @param iBlock 
 * @param element 
 * @param instances 
 */
const emitElement = (
    pipeline: Pipeline,
    extLib: Extension,
    vao: REGLVertexArrayObject,
    iBlock: Block,
    element: REGLElementbuffer,
    instances: number
): void => {
    //1.根据vao是否存在判断直接只用值或使用变量
    const GL_NAME = pipeline.getVariable('gl');
    const COUNT_NAME = !vao ? pipeline.getVariable('count') : vao.Count;
    const PRIMITIVE_NAME = !vao ? pipeline.getVariable('primitive') : vao.Primitive;
    const OFFSET_NAME = !vao ? pipeline.getVariable('offset') : vao.Offset;
    const INSTANCES_NAME = !vao ? pipeline.getVariable('instances') : vao.Instances;
    //2.使用实例化绘制
    if (extLib.get('ANGLE_instanced_arrays') && instances > 0) {
        if (element) {
            const ELEMENT_NAME = iBlock.def(`${pipeline.getVariable('elementState')}.getElementbuffer(${element.ID})`);
            iBlock.push(`${ELEMENT_NAME}.bind()`);
            iBlock.push(`${pipeline.getVariable('extLib')}.get('ANGLE_instanced_arrays').drawElementsInstancedANGLE(${ELEMENT_NAME}.Primitive, ${ELEMENT_NAME}.VertCount,${ELEMENT_NAME}.Component, ${OFFSET_NAME}<<(${ELEMENT_NAME}.Component - ${CComponent.UNSIGNED_BYTE})>>1, ${INSTANCES_NAME})`);
        }
        else iBlock.push(`${pipeline.getVariable('extLib')}.get('ANGLE_instanced_arrays').drawArraysInstancedANGLE(${PRIMITIVE_NAME}, ${OFFSET_NAME},${COUNT_NAME}, ${INSTANCES_NAME})`);
    }
    //3.drawElement绘制
    else if (element) {
        const ELEMENT_NAME = iBlock.def(`${pipeline.getVariable('elementState')}.getElementbuffer(${element.ID})`);
        iBlock.push(`${ELEMENT_NAME}.bind()`);
        //字节单位，指定元素数组缓冲区中的偏移量。必须是给定类型大小的有效倍数
        iBlock.push(`${GL_NAME}.drawElements(${ELEMENT_NAME}.Primitive, ${ELEMENT_NAME}.VertCount,${ELEMENT_NAME}.Component, ${OFFSET_NAME}<<(${ELEMENT_NAME}.Component - ${CComponent.UNSIGNED_BYTE})>>1)`);
    }
    //4.直接drawArrays
    else {
        iBlock.push(`${GL_NAME}.drawArrays(${PRIMITIVE_NAME}, ${OFFSET_NAME}, ${COUNT_NAME})`);
    }
    //5.如果绑定过vao，需要在最后取消绑定
    if (vao) iBlock.push(`${pipeline.getVariable('attributeState')}.setVAO(null)`);
    //6.性能计数器更新
    const PERFORMANCE_NAME = pipeline.getVariable('performance');
    iBlock.push(`${PERFORMANCE_NAME}.count++`);
}

export { emitElement }