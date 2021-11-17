/**
 * 存放shader text的仓库
 * @example
 * const stringState = new StringState();
 * stringState.id(`112`);
 * stringState.str(1);
 */
class StringState {
    /**
     * 存储string的key-value对应值
     */
    private static STRINGSTATE_SET: Map<string, number> = new Map();

    /**
     * 数组长度作为stringState map对象的key
     */
    private stringValues: string[] = [];

    /**
     * 
     * @param str 
     * @returns 
     */
    id = (str: string) => {
        let result = StringState.STRINGSTATE_SET.get(str);
        if (result) return result;
        result = StringState.STRINGSTATE_SET[str] = this.stringValues.values.length;
        this.stringValues.push(str);
        return result;
    }

    /**
     * 
     * @param id 
     * @returns 
     */
    str = (id: number) => {
        return this.stringValues[id];
    }
}

export { StringState }