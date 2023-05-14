import { GBuffer } from "../res/GBuffer";
import { GTexture } from "../res/GTexture";

/**
 * prop对象抽象类型
 */
type TProps = {
    /**
     * 指代vec2/vec3/mat等
     */
    [propName in string]: number | number[] | number[][] | GBuffer | GTexture
}

/**
 * @author axmand
 * @example
 * interface IPorps extends TProps{
 *      offset:number[]
 * }
 * // offset 作为IProps属性列中一个，指定后续使用该属性列如何取batch中输入的类型
 * const prop = new Porps<IPorps, 'offset'>('offset');
 * //指示使用
 * prop.KEY作为读取batch内数据的索引属性
 */
class Props<T extends TProps>{
    /**
     * 存储 prop 索引属性
     */
    private key: string;

    /**
     * 公开索引，使用时例如 p0[0]['offset']获取batchDraw内的offeset值
     */
    get KEY(): string {
        return this.key;
    }

    constructor(key: keyof { [key in keyof T]: string }) {
        this.key = `['${String(key)}']`;
    }
}

export {
    type TProps,
    Props
}