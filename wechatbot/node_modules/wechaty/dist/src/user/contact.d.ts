import { ContactGender, ContactPayload, ContactQueryFilter, ContactType, FileBox } from 'wechaty-puppet';
import { Wechaty } from '../wechaty';
import { Sayable } from '../types';
import { Message } from './message';
import { MiniProgram } from './mini-program';
import { Tag } from './tag';
import { UrlLink } from './url-link';
import { ContactEventEmitter } from '../events/contact-events';
export declare const POOL: unique symbol;
/**
 * All wechat contacts(friend) will be encapsulated as a Contact.
 * [Examples/Contact-Bot]{@link https://github.com/wechaty/wechaty/blob/1523c5e02be46ebe2cc172a744b2fbe53351540e/examples/contact-bot.ts}
 *
 * @property {string}  id               - Get Contact id.
 * This function is depending on the Puppet Implementation, see [puppet-compatible-table](https://github.com/wechaty/wechaty/wiki/Puppet#3-puppet-compatible-table)
 */
declare class Contact extends ContactEventEmitter implements Sayable {
    readonly id: string;
    static get wechaty(): Wechaty;
    get wechaty(): Wechaty;
    static Type: typeof ContactType;
    static Gender: typeof ContactGender;
    protected static [POOL]: Map<string, Contact>;
    protected static get pool(): Map<string, Contact>;
    protected static set pool(newPool: Map<string, Contact>);
    /**
     * @ignore
     * About the Generic: https://stackoverflow.com/q/43003970/1123955
     *
     * Get Contact by id
     * > Tips:
     * This function is depending on the Puppet Implementation, see [puppet-compatible-table](https://github.com/wechaty/wechaty/wiki/Puppet#3-puppet-compatible-table)
     *
     * @static
     * @param {string} id
     * @returns {Contact}
     * @example
     * const bot = new Wechaty()
     * await bot.start()
     * const contact = bot.Contact.load('contactId')
     */
    static load<T extends typeof Contact>(this: T, id: string): T['prototype'];
    /**
     * The way to search Contact
     *
     * @typedef    ContactQueryFilter
     * @property   {string} name    - The name-string set by user-self, should be called name
     * @property   {string} alias   - The name-string set by bot for others, should be called alias
     * [More Detail]{@link https://github.com/wechaty/wechaty/issues/365}
     */
    /**
     * Try to find a contact by filter: {name: string | RegExp} / {alias: string | RegExp}
     *
     * Find contact by name or alias, if the result more than one, return the first one.
     *
     * @static
     * @param {ContactQueryFilter} query
     * @returns {(Promise<Contact | null>)} If can find the contact, return Contact, or return null
     * @example
     * const bot = new Wechaty()
     * await bot.start()
     * const contactFindByName = await bot.Contact.find({ name:"ruirui"} )
     * const contactFindByAlias = await bot.Contact.find({ alias:"lijiarui"} )
     */
    static find<T extends typeof Contact>(this: T, query: string | ContactQueryFilter): Promise<T['prototype'] | null>;
    /**
     * Find contact by `name` or `alias`
     *
     * If use Contact.findAll() get the contact list of the bot.
     *
     * #### definition
     * - `name`   the name-string set by user-self, should be called name
     * - `alias`  the name-string set by bot for others, should be called alias
     *
     * @static
     * @param {ContactQueryFilter} [queryArg]
     * @returns {Promise<Contact[]>}
     * @example
     * const bot = new Wechaty()
     * await bot.start()
     * const contactList = await bot.Contact.findAll()                      // get the contact list of the bot
     * const contactList = await bot.Contact.findAll({ name: 'ruirui' })    // find all of the contacts whose name is 'ruirui'
     * const contactList = await bot.Contact.findAll({ alias: 'lijiarui' }) // find all of the contacts whose alias is 'lijiarui'
     */
    static findAll<T extends typeof Contact>(this: T, query?: string | ContactQueryFilter): Promise<Array<T['prototype']>>;
    static delete(contact: Contact): Promise<void>;
    /**
     * Get tags for all contact
     *
     * @static
     * @returns {Promise<Tag[]>}
     * @example
     * const tags = await wechaty.Contact.tags()
     */
    static tags(): Promise<Tag[]>;
    /**
     *
     * Instance properties
     * @ignore
     *
     */
    protected payload?: ContactPayload;
    /**
     * @hideconstructor
     */
    protected constructor(id: string);
    /**
     * @ignore
     */
    toString(): string;
    say(text: string): Promise<void | Message>;
    say(num: number): Promise<void | Message>;
    say(message: Message): Promise<void | Message>;
    say(contact: Contact): Promise<void | Message>;
    say(file: FileBox): Promise<void | Message>;
    say(mini: MiniProgram): Promise<void | Message>;
    say(url: UrlLink): Promise<void | Message>;
    /**
     * Get the name from a contact
     *
     * @returns {string}
     * @example
     * const name = contact.name()
     */
    name(): string;
    alias(): Promise<null | string>;
    alias(newAlias: string): Promise<void>;
    alias(empty: null): Promise<void>;
    /**
     * GET / SET / DELETE the phone list for a contact
     *
     * @param {(none | string[])} phoneList
     * @returns {(Promise<string[] | void>)}
     * @example <caption> GET the phone list for a contact, return {(Promise<string[]>)}</caption>
     * const phoneList = await contact.phone()
     * if (phone.length === 0) {
     *   console.log('You have not yet set any phone number for contact ' + contact.name())
     * } else {
     *   console.log('You have already set phone numbers for contact ' + contact.name() + ':' + phoneList.join(','))
     * }
     *
     * @example <caption>SET the phoneList for a contact</caption>
     * try {
     *   const phoneList = ['13999999999', '13888888888']
     *   await contact.alias(phoneList)
     *   console.log(`change ${contact.name()}'s phone successfully!`)
     * } catch (e) {
     *   console.log(`failed to change ${contact.name()} phone!`)
     * }
     */
    phone(): Promise<string[]>;
    phone(phoneList: string[]): Promise<void>;
    corporation(): Promise<string | null>;
    corporation(remark: string | null): Promise<void>;
    description(): Promise<string | null>;
    description(newDescription: string | null): Promise<void>;
    title(): string | null;
    coworker(): boolean;
    /**
     * Check if contact is friend
     *
     * > Tips:
     * This function is depending on the Puppet Implementation, see [puppet-compatible-table](https://github.com/wechaty/wechaty/wiki/Puppet#3-puppet-compatible-table)
     *
     * @returns {boolean | null}
     *
     * <br>True for friend of the bot <br>
     * False for not friend of the bot, null for unknown.
     * @example
     * const isFriend = contact.friend()
     */
    friend(): null | boolean;
    /**
     * Enum for ContactType
     * @enum {number}
     * @property {number} Unknown    - ContactType.Unknown    (0) for Unknown
     * @property {number} Personal   - ContactType.Personal   (1) for Personal
     * @property {number} Official   - ContactType.Official   (2) for Official
     */
    /**
     * Return the type of the Contact
     * > Tips: ContactType is enum here.</br>
     * @returns {ContactType.Unknown | ContactType.Personal | ContactType.Official}
     *
     * @example
     * const bot = new Wechaty()
     * await bot.start()
     * const isOfficial = contact.type() === bot.Contact.Type.Official
     */
    type(): ContactType;
    /**
     * @ignore
     * TODO
     * Check if the contact is star contact.
     *
     * @returns {boolean | null} - True for star friend, False for no star friend.
     * @example
     * const isStar = contact.star()
     */
    star(): null | boolean;
    /**
     * Contact gender
     * > Tips: ContactGender is enum here. </br>
     *
     * @returns {ContactGender.Unknown | ContactGender.Male | ContactGender.Female}
     * @example
     * const gender = contact.gender() === bot.Contact.Gender.Male
     */
    gender(): ContactGender;
    /**
     * Get the region 'province' from a contact
     *
     * @returns {string | null}
     * @example
     * const province = contact.province()
     */
    province(): null | string;
    /**
     * Get the region 'city' from a contact
     *
     * @returns {string | null}
     * @example
     * const city = contact.city()
     */
    city(): null | string;
    /**
     * Get avatar picture file stream
     *
     * @returns {Promise<FileBox>}
     * @example
     * // Save avatar to local file like `1-name.jpg`
     *
     * const file = await contact.avatar()
     * const name = file.name
     * await file.toFile(name, true)
     * console.log(`Contact: ${contact.name()} with avatar file: ${name}`)
     */
    avatar(): Promise<FileBox>;
    /**
     * Get all tags of contact
     *
     * @returns {Promise<Tag[]>}
     * @example
     * const tags = await contact.tags()
     */
    tags(): Promise<Tag[]>;
    /**
     * Force reload data for Contact, Sync data from low-level API again.
     *
     * @returns {Promise<this>}
     * @example
     * await contact.sync()
     */
    sync(): Promise<void>;
    /**
     * `ready()` is For FrameWork ONLY!
     *
     * Please not to use `ready()` at the user land.
     * If you want to sync data, use `sync()` instead.
     *
     * @ignore
     */
    ready(forceSync?: boolean): Promise<void>;
    /**
     * @ignore
     */
    isReady(): boolean;
    /**
     * Check if contact is self
     *
     * @returns {boolean} True for contact is self, False for contact is others
     * @example
     * const isSelf = contact.self()
     */
    self(): boolean;
    /**
     * Get the weixin number from a contact.
     *
     * Sometimes cannot get weixin number due to weixin security mechanism, not recommend.
     *
     * @ignore
     * @returns {string | null}
     * @example
     * const weixin = contact.weixin()
     */
    weixin(): null | string;
}
declare function wechatifyContact(wechaty: Wechaty): typeof Contact;
export { Contact, wechatifyContact, };
//# sourceMappingURL=contact.d.ts.map