import { Dispose } from './../core/Dispose';

class REGLBuffer extends Dispose {

    deRef(): void {
        this.refCount--;
    }

    dispose(): void {
        throw new Error('Method not implemented.');
    }

    constructor() {
        super();
    }
}


export { REGLBuffer }