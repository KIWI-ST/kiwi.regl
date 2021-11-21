import { IAttributeBuffer } from "../compiler/parseAttribute";
import { check } from "./check";
import { isNDArray } from "./isNDArray";

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
    check(checkResult, `不支持的attribute类型，当前仅支持number[], number[][], number[][][], IAttributeBuffer类型`);
}

export { checkAttribute }