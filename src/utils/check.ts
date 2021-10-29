/**
 * @author axmmand
 * @description check pred, throw erro if !pred is true
 * @param pred condition
 * @param message error message
 */
const check = (pred: any, message: string) => {
    if (!pred) {
        const error = new Error(`pipegl:${message}`);
        //}{debug
        console.log(error);
        throw error;
    }
}

export { check }