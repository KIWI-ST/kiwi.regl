/**
 * performance stats attributes
 */
interface IPerformance {
    gupTime: number,
    cpuTime: number,
    count: number
}

/**
 * create performance object in each compiler core
 * @returns 
 */
const createPerformance = (): IPerformance => {
    const stats: IPerformance = {
        gupTime: 0.0,
        cpuTime: 0.0,
        count: 0
    };
    return stats;
}

export {
    IPerformance,
    createPerformance
}