import { Wechaty } from '../wechaty';
import { FileBox } from '../config';
declare class Image {
    id: string;
    static get wechaty(): Wechaty;
    get wechaty(): Wechaty;
    constructor(id: string);
    static create(id: string): Image;
    thumbnail(): Promise<FileBox>;
    hd(): Promise<FileBox>;
    artwork(): Promise<FileBox>;
}
declare function wechatifyImage(wechaty: Wechaty): typeof Image;
export { Image, wechatifyImage, };
//# sourceMappingURL=image.d.ts.map