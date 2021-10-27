let id: number = 0;

/**
 * @author axmand 
 * @description get auto-increase id (number)
 * @example
 * const id = getIdx(); // "1"
 * @returns {number}
 */
const getIdx = (): number => {
    return id++;
}

export { getIdx }