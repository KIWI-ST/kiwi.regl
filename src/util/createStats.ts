/**
 * webgl object/resource stats
 */
interface IStats {
    /**
     * vertex array object count
     */
    vaoCount: number;

    /**
     * arraybuffer count
     */
    bufferCount: number;

    /**
     * elemnet arraybuffer count
     */
    elementsCount: number;

    /**
     * framebuffer(FBO) count
     */
    framebufferCount: number;

    /**
     * shader count
     */
    shaderCount: number;

    /**
     * texture count
     */
    textureCount: number;

    /**
     * cube texture count
     */
    cubeCount: number;

    /**
     * renderbuffer(RBO) count
     */
    renderbufferCount: number;

    /**
     * maximum texture unit count
     */
    maxTextureUnits: number;
}

/**
 * create global stats object
 * @example
 * const stats:IStats = createStats();
 * @returns 
 */
const createStats = (): IStats => {
    const stats: IStats = {
        vaoCount: 0,
        bufferCount: 0,
        elementsCount: 0,
        framebufferCount: 0,
        shaderCount: 0,
        textureCount: 0,
        cubeCount: 0,
        renderbufferCount: 0,
        maxTextureUnits: 0       //assign by limLib.maxTextureUnits
    };
    return stats;
}

export { 
    IStats,
    createStats 
}