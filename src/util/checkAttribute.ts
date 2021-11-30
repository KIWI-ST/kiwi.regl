import { check } from "./check";
import { isNDArray } from "./isNDArray";
import { IAttributeBuffer } from "../compiler/parseAttribute";
import { Props } from "..";

/**
 * 
 * @param v 
 */
const checkAttribute = (v: any) => {
    let checkResult = false;
    if (isNDArray(v))
        checkResult = true;
    if ((v as IAttributeBuffer).buffer)
        checkResult = true;
    if(v instanceof Props)
        checkResult = true;
    check(checkResult, `不支持的attribute类型，当前仅支持number[], number[][], number[][][], Props<T>, IAttributeBuffer类型`);
}

export { checkAttribute }