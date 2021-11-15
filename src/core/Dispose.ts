import { getIdx } from "../utils/getIdx";

/**
 * @date 2021/8/16
 * @author axmand
 * @description basic disposable object class
 * @example
 * 
 * class Buffer extends Dispose{
 *      dispose():void=>{
 *      }
 * }
 * 
 */
abstract class Dispose {
    /**
     * @description ID
     */
    private id: number = getIdx();

    /**
    * @description get disposable object ID
    */
    get ID(): number {
        return this.id;
    }

    /**
     * @description reference count
     */
    protected refCount: number = 0;

    /**
     * @description dispose resource
     */
    abstract dispose(): void;
    
    /**
     * 降低引用
     */
    abstract deRef():void;
}

export { Dispose }