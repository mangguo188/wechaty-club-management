import { Wechaty } from '../wechaty';
import { Contact } from './contact';
import { Favorite } from './favorite';
declare class Tag {
    readonly id: string;
    static get wechaty(): Wechaty;
    get wechaty(): Wechaty;
    protected static pool: Map<string, Tag>;
    /**
     * @hideconstructor
     */
    constructor(id: string);
    /**
     * @private
     * About the Generic: https://stackoverflow.com/q/43003970/1123955
     *
     * Get Tag by id
     * > Tips:
     * This function is depending on the Puppet Implementation, see [puppet-compatible-table](https://github.com/Chatie/wechaty/wiki/Puppet#3-puppet-compatible-table)
     *
     * @static
     * @param {string} id
     * @returns {Tag}
     * @example
     * const bot = new Wechaty()
     * await bot.start()
     * const tag = bot.Tag.load('tagId')
     */
    static load<T extends typeof Tag>(this: T, id: string): T['prototype'];
    /**
     * Get a Tag instance for "tag"
     *
     * > Tips:
     * This function is depending on the Puppet Implementation, see [puppet-compatible-table](https://github.com/Chatie/wechaty/wiki/Puppet#3-puppet-compatible-table)
     *
     * @static
     * @param {string} [tag] the tag name which want to create
     * @returns {Promise<Tag>}
     * @example
     * const bot = new Wechaty()
     * await bot.Tag.get('TagName')
     */
    static get<T extends typeof Tag>(this: T, tag: string): Promise<T['prototype']>;
    /**
     * Delete a tag from Wechat
     *
     * If you want to delete a tag, please make sure there's no more Contact/Favorite(s) are using this tag.
     * If this tag is be used by any Contact/Favorite, then it can not be deleted.
     * (This is for protecting the tag being deleted by mistake)
     *
     * @static
     * @returns {Promise<Tag[]>}
     * @example
     * const tag = wechaty.Tag.get('tag')
     * await wechaty.Tag.delete(tag)
     */
    static delete(tag: Tag, target?: typeof Contact | typeof Favorite): Promise<void>;
    /**
     * Add tag for contact
     *
     * > Tips:
     * This function is depending on the Puppet Implementation, see [puppet-compatible-table](https://github.com/Chatie/wechaty/wiki/Puppet#3-puppet-compatible-table)
     *
     * @param {Contact} [to] the contact which need to add tag
     * @returns {Promise<void>}
     * @example
     * await tag.add(contact)
     */
    add(to: Contact | Favorite): Promise<void>;
    /**
     * Remove this tag from Contact/Favorite
     *
     * > Tips:
     * This function is depending on the Puppet Implementation, see [puppet-compatible-table](https://github.com/Chatie/wechaty/wiki/Puppet#3-puppet-compatible-table)
     *
     * @returns {Promise<void>}
     * @example
     * await tag.remove(contact)
     */
    remove(from: Contact | Favorite): Promise<void>;
}
declare function wechatifyTag(wechaty: Wechaty): typeof Tag;
export { Tag, wechatifyTag, };
//# sourceMappingURL=tag.d.ts.map