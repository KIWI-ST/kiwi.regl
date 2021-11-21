/**
 * 合并target/exts所有对象都包含的属性
 * @param target 
 * @param exts 
 * @returns 
 */
const getExtend = (target: object, ...exts: object[]): object => {
    exts.forEach((ext: object) => {
        const keys = Object.keys(ext);
        for (let i = 0, len = keys.length; i < len; ++i)
            target[keys[i]] = ext[keys[i]];
    });
    return target;
}

/**
 * 以target对象为核心，只覆盖target对象中包含的属性
 * @param target 
 * @param exts 
 * @returns 
 */
const getCopy = (target: object, ...exts: object[]): object => {
    exts.forEach((ext: object) => {
        Object.keys(target)?.forEach((key:string)=>{
            target[key] = ext[key] || target[key];
        });  
    });
    return target;
}

export { 
    getExtend,
    getCopy 
}