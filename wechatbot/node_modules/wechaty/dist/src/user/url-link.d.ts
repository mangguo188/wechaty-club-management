import { UrlLinkPayload } from 'wechaty-puppet';
declare class UrlLink {
    readonly payload: UrlLinkPayload;
    /**
     *
     * Create from URL
     *
     */
    static create(url: string): Promise<UrlLink>;
    constructor(payload: UrlLinkPayload);
    toString(): string;
    url(): string;
    title(): string;
    thumbnailUrl(): undefined | string;
    description(): undefined | string;
}
declare function wechatifyUrlLink(_: any): typeof UrlLink;
export { UrlLink, wechatifyUrlLink, };
//# sourceMappingURL=url-link.d.ts.map