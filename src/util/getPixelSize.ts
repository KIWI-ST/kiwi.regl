import { STextureComponent } from "../core/Support";
import { CTextureComponent, CTextureComponentSize } from "../core/Constant";

/**
 * 计算纹理类型的像素值存储所需字节数
 * @param component 
 * @param channels 
 * @returns 
 */
const getPixelSize = (component: STextureComponent, channels: number): number => {
    switch (component) {
        case 'UNSIGNED_SHORT_4_4_4_4':
        case 'UNSIGNED_SHORT_5_5_5_1':
        case 'UNSIGNED_SHORT_5_6_5':
            return 2;
        case 'UNSIGNED_INT_24_8_WEBGL':
            return 4;
        default:
            return CTextureComponentSize[CTextureComponent[component]] * channels;
    }
}

export { getPixelSize }