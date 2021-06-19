
let idx = 1;

/**
 * 全局自增唯一ID
 */
const getIdx = () => {
    return idx++;
}

export { getIdx }