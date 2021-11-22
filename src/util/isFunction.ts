/**
 * 判断对象是否是函数
 * @param v 
 * @returns 
 */
const isFunction = (v: any): v is Function => typeof v === 'function';

export { isFunction }