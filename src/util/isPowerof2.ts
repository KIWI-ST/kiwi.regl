/**
 * * 判断数值是否是2次幂
 * @param n 
 */
 const isPowerOf2 = function (n: number): boolean {
    return n > 0 && (n & (n - 1)) == 0;
};

export { isPowerOf2 }