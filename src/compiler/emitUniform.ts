import { Block } from "kiwi.codegen";
import { Pipeline } from "../core/Pipeline";
import { IActiveInfo } from "../res/GProgram";
import { GTexture } from "../res/GTexture";
import { check } from "../util/check";
import { isNDArray } from "../util/isNDArray";
import { IUniformRecord } from "./parseUniform";

interface IUC {
    prefix: string,
    isMatrix: boolean
}

const UComponent = (component: number): IUC => {
    const UTYPE: IUC = {
        prefix: '',
        isMatrix: false
    };
    switch (component) {
        case 5126://float
            UTYPE.prefix = '1f';
            break;
        case 35664://float_vec2
            UTYPE.prefix = '2f';
            break;
        case 35665://float_vec3
            UTYPE.prefix = '3f';
            break;
        case 35666://float_vec4
            UTYPE.prefix = '4f';
            break;
        case 35674://float_mat2
            UTYPE.prefix = 'Matrix2f';
            UTYPE.isMatrix = true;
            break;
        case 35675://float_mat3
            UTYPE.prefix = 'Matrix3f';
            UTYPE.isMatrix = true;
            break;
        case 35676://float_mat4
            UTYPE.prefix = 'Matrix4f';
            UTYPE.isMatrix = true;
            break;
        case 35670://bool
        case 5124://int
            UTYPE.prefix = '1i';
            break;
        case 35671://bool_vec2
        case 35667://int_vec2
            UTYPE.prefix = '2i';
            break;
        case 35672://bool_vec3
        case 35668://int_vec3
            UTYPE.prefix = '3i';
            break;
        case 35673://bool_vec4
        case 35669://int_vec4
            UTYPE.prefix = '4i';
            break;
        case 35678://texture_sample_2d
        case 35680://0x8B60
            UTYPE.prefix = '1i';
        default:
            check(false, `emitUniforms error:不支持的uniform类型${component}`);
    }
    return UTYPE;
}

/**
 * 
 * @param pipeline 
 * @param iBlock 
 * @param oBlock 
 * @param uniforms 
 * @param uniformRecordSet 
 * @param input0 
 */
const emitUniform = (
    pipeline: Pipeline,
    iBlock: Block,
    oBlock: Block,
    uniforms: IActiveInfo[],
    uniformRecordSet: Map<string, IUniformRecord>,
    input0: string
): void => {
    const GL_NAME = pipeline.getVariable('gl');
    const PERFORMANCE_NAME = pipeline.getVariable('performance');
    const ISNDARRAY_NAME = pipeline.getVariable('isNDArray');
    const ISNUMBER_NAME = pipeline.getVariable('isNumber');
    const ISTEXTURE_NAME = pipeline.getVariable('isTexture');
    uniforms?.forEach((u: IActiveInfo) => {
        const name = u.name;
        const component = u.info.type;
        const size = u.info.size;
        const record = uniformRecordSet.get(name);
        check(record, `emitUniform error:应用unifrom错误，${name}和TAttribute定义不一致，请检查`);
        //当uniform是数组时，例如uniform[0]
        if (size > 1) {
            //debug 待处理
        }
        //加入link大军
        record.ln = pipeline.link(u);
        const { prefix, isMatrix } = UComponent(component);
        //获取后缀，处理静态值
        if (record.v) {
            if (record.v instanceof GTexture) {
                //bind regltexture
                record.dn = pipeline.link(record.v);
                iBlock.push(`${GL_NAME}.uniform${prefix}(${record.ln}.location, ${record.dn}.bind())`);
                //末尾销毁
                oBlock.push(`${record.dn}.unbind()`);
            }
            else {
                const sufix = isNDArray(record.v) ? `${prefix}v` : prefix;
                record.dn = iBlock.def(record.v);
                iBlock.push(`${GL_NAME}.uniform${sufix}(${record.ln}.location, ${isMatrix ? 'false,' : ''}${record.dn})`);
            }
        }
        //获取后缀，动态处理FN
        else if (record.f) {
            record.dn = pipeline.link(record.f);
            //获取处理器时间
            record.dyn = iBlock.def(`${record.dn}.call(this, ${PERFORMANCE_NAME},${pipeline.BatchID})`);
            //根据函数返回值累心动态构造uniform方法
            //情况1，传递静态数组如[9,1,2,3], 使用uniformXXXv
            const cond0 = iBlock.createConditionT(`${ISNDARRAY_NAME}(${record.dyn})`);
            cond0.Then.push(`${GL_NAME}.uniform${prefix}v(${record.ln}.location, ${isMatrix ? 'false,' : ''}${record.dyn})`);
            //情况2，传递标量，使用uniformXXX
            const cond1 = iBlock.createConditionT(`${ISNUMBER_NAME}(${record.dyn})`);
            cond1.Then.push(`${GL_NAME}.uniform${prefix}(${record.ln}.location, ${isMatrix ? 'false,' : ''}${record.dyn})`);
            //情况3，传递texture （sampler2d)
            const cond2 = iBlock.createConditionT(`${ISTEXTURE_NAME}(${record.dyn})`);
            cond2.Then.push(`${GL_NAME}.uniform${prefix}(${record.ln}.location, ${record.dyn}.bind())`);
            //末尾取消绑定
            const cond2_0 = oBlock.createConditionT(`${ISTEXTURE_NAME}(${record.dyn})`);
            cond2_0.Then.push(`${record.dyn}.unbind()`);
        }
        //处理property
        else if (record.p) {
            //指定使用入参p0作为读取Prop.KEY的内容
            record.dyn = iBlock.def(`${input0}${record.p.KEY}`);
            const cond0 = iBlock.createConditionTE(`${ISNDARRAY_NAME}(${record.dyn})`);
            cond0.Then.push(`${GL_NAME}.uniform${prefix}v(${record.ln}.location, ${isMatrix ? 'false,' : ''}${record.dyn})`);
            cond0.Else.push(`${GL_NAME}.uniform${prefix}(${record.ln}.location, ${isMatrix ? 'false,' : ''}${record.dyn})`);
        }
    });
}

export { emitUniform }