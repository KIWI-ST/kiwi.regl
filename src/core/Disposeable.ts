/**
 * 三维对象资源销毁接口
 */
abstract class Disposeable {
    /**
     * 资源销毁
     */
    abstract dispose(): void
}


export { Disposeable }