import { Disposeable } from './../util/Disposeable';

/**
 * 顶点Buffer，提供
 * - 顶点Buffer创建（从bufferPool里创建）
 * - 资源管理
 * - bind
 * - dispose
 */
class Buffers extends Disposeable {

    dispose(): void {
        throw new Error('Method not implemented.');
    }

    constructor() {
        super()
    }

}

export { Buffers }