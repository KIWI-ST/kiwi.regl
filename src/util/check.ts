/**
 * @author axmmand
 * @description check pred, throw erro if !pred is true
 * @param pred condition
 * @param message error message
 */
const check = (pred: any, message: string) => {
    if (!pred){
        throw new Error(`pipegl:${message}`);
    }
}

export { check }