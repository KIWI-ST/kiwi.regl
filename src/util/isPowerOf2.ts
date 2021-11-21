/**
 * 判断输入n是否是2的幂
 * @param n 
 * @returns 
 */
const isPowerOf2 = (n: number): boolean => {
    return n > 0 && (n & (n - 1)) == 0;
}
export { isPowerOf2 }