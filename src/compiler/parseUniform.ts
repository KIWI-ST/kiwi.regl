import { isFunction } from "../util/isFunction";
import { GTexture } from "../res/GTexture";
import { IPerformance } from "../util/createPerformance";
import { Props, TProps } from "../core/Props";
import { IPipelineLink, Pipeline } from "../core/Pipeline";

/**
 * @author axmand
 */
interface IUniformRecord extends IPipelineLink {
    /**
     * 
     */
    key: string;

    /**
     * 
     */
    p?: Props<TProps>;

    /**
     * 
     */
    v?: boolean | number | number[] | GTexture;

    /**
     * 
     */
    f?: { (performance: IPerformance, batchId: number): number } | { (performance: IPerformance, batchId: number): number[] } | { (performance: IPerformance, batchId: number): GTexture }
}

/**
 * @description
 * uniform 结构约束
 * @example
 * new (performance:IPerformance, batchId:number):number[]
 */
type TUniform = {
    [propName in string]: Props<TProps> | boolean | number | number[] | GTexture | { (performance: IPerformance, batchId: number): number } | { (performance: IPerformance, batchId: number): number[] } | { (performance: IPerformance, batchId: number): GTexture }
}

/**
 * @description
 * uniforms:{
 *    color:[1, 0, 0, 1]
 * }
 * @param opts 
 * @returns 
 */
const parseUniform = <TU extends TUniform>(
    opts:{
        pipeline:Pipeline,
        uniforms:TU
    }
):Map<string, IUniformRecord>=>{
    const {uniforms} = opts;
    const UNIFORMS:Map<string, IUniformRecord> = new Map();
    uniforms && Object.keys(uniforms)?.forEach((key:string)=>{
        const v = uniforms[key];
        const record:IUniformRecord = {key:key};
        if(isFunction(v)) record.f = v;
        else if(v instanceof Props) record.p = v;
        else record.v = v;
        UNIFORMS.set(key, record);
    });
    return UNIFORMS;
}

export {
    IUniformRecord,
    TUniform,
    parseUniform
}