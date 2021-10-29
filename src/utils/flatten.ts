import { SComponent } from "../core/Support";
import { bufferPool0 } from "../pool/BufferPool";
import { ShapedArrayFormat, TypedArrayFormat } from "../core/Format";

/**
 * @description get shape of array
 * @param array 
 * @returns 
 */
const getArrayShape = (array: ShapedArrayFormat): number[] => {
    const shape = [];
    let arr: any = array;
    while (arr.length > 0) {
        shape.push(arr.length);
        arr = arr[0];
    }
    return shape;
}

/**
 * @description get array shape dimension
 * @param shape 
 * @returns 
 */
const getDimension = (shape: number[]): number => {
    return shape.reduce((pre: number, cur: number) => {
        return cur * pre;
    }) || 0;
}

/**
 * @description copy 1d array directly, copy to 'out'
 * @param arr 
 * @param len0 
 * @param out 
 */
const flatten1D = (arr: number[] | TypedArrayFormat, len0: number, out: TypedArrayFormat): void => {
    for (let i = 0; i < len0; ++i)
        out[i] = arr[i]
}

/**
 * @description convert 2d array to 1d array, copy to 'out'
 * @param arr 
 * @param len0 
 * @param len1 
 * @param out 
 */
const flatten2D = (arr: number[][], len0: number, len1: number, out: TypedArrayFormat): void => {
    let ptr = 0;
    for (let i = 0; i < len0; ++i) {
        const row = arr[i];
        for (let j = 0; j < len1; ++j)
            out[ptr++] = row[j];
    }
}

/**
 * @description convert 3d array to 1d array, copy to 'out'
 * @param arr 
 * @param len0 
 * @param len1 
 * @param len2 
 * @param out 
 * @param ptr_ 
 */
const flatten3D = (arr:number[][][], len0:number, len1:number, len2:number, out:TypedArrayFormat, ptr_:number = 0):void =>{
    let ptr = ptr_;
    for(let i=0;i<len0;++i){
        let row = arr[i];
        for(let j=0;j<len1;++j)
        {
            let col = row[j];
            for(let k=0;k<len2;++k)
                out[ptr++] = col[k];
        }
    }
}

/**
 * @description flatteran array
 * @param array 
 * @param shape 
 * @param scomponent 
 * @param out_ 
 * @returns 
 */
const flattenArrayWithShape = (array:ShapedArrayFormat, shape:number[], scomponent:SComponent, out_:TypedArrayFormat = null):TypedArrayFormat=>{
    const size = getDimension(shape);
    const out = out_ || bufferPool0.allocType(scomponent, size);
    switch(shape.length){
        case 0:
            break;
        case 1:
            flatten1D(array as number[]|TypedArrayFormat, shape[0], out);
            break;
        case 2:
            flatten2D(array as number[][], shape[0], shape[1], out);
            break;
        case 3:
            flatten3D(array as number[][][], shape[0], shape[1], shape[2], out, 0);
            break;
        default:
            throw new Error(`pipegl: flatten did't support ${shape.length} D array`)
    }
    return out;
}

/**
 * @description auto get shape, flatten array to 1d array
 * @param array 
 * @param scomponent 
 * @param out_ 
 * @returns 
 */
const flattenArray = (array:ShapedArrayFormat, scomponent:SComponent, out_:TypedArrayFormat=null):TypedArrayFormat=>{
    const shape = getArrayShape(array);
    return flattenArrayWithShape(array, shape, scomponent, out_);
}

export{
    getDimension,
    getArrayShape,
    flattenArrayWithShape,
    flattenArray
}