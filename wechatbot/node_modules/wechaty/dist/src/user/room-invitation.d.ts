import { Wechaty } from '../wechaty';
import { Acceptable } from '../types';
import { Contact } from './contact';
import { RoomInvitationPayload } from 'wechaty-puppet';
/**
 *
 * accept room invitation
 */
declare class RoomInvitation implements Acceptable {
    readonly id: string;
    static get wechaty(): Wechaty;
    get wechaty(): Wechaty;
    static load<T extends typeof RoomInvitation>(this: T, id: string): T['prototype'];
    /**
     * @hideconstructor
     * Instance Properties
     *
     */
    constructor(id: string);
    toString(): string;
    /**
      * @ignore
     */
    toStringAsync(): Promise<string>;
    /**
     * Accept Room Invitation
     *
     * @returns {Promise<void>}
     *
     * @example
     * const bot = new Wechaty()
     * bot.on('room-invite', async roomInvitation => {
     *   try {
     *     console.log(`received room-invite event.`)
     *     await roomInvitation.accept()
     *   } catch (e) {
     *     console.error(e)
     *   }
     * }
     * .start()
     */
    accept(): Promise<void>;
    /**
     * Get the inviter from room invitation
     *
     * @returns {Contact}
     * @example
     * const bot = new Wechaty()
     * bot.on('room-invite', async roomInvitation => {
     *   const inviter = await roomInvitation.inviter()
     *   const name = inviter.name()
     *   console.log(`received room invitation event from ${name}`)
     * }
     * .start()
     */
    inviter(): Promise<Contact>;
    /**
     * Get the room topic from room invitation
     *
     * @returns {string}
     * @example
     * const bot = new Wechaty()
     * bot.on('room-invite', async roomInvitation => {
     *   const topic = await roomInvitation.topic()
     *   console.log(`received room invitation event from room ${topic}`)
     * }
     * .start()
     */
    topic(): Promise<string>;
    memberCount(): Promise<number>;
    /**
     * List of Room Members that you known(is friend)
      * @ignore
     */
    memberList(): Promise<Contact[]>;
    /**
     * Get the invitation time
     *
     * @returns {Promise<Date>}
     */
    date(): Promise<Date>;
    /**
     * Returns the roopm invitation age in seconds. <br>
     *
     * For example, the invitation is sent at time `8:43:01`,
     * and when we received it in Wechaty, the time is `8:43:15`,
     * then the age() will return `8:43:15 - 8:43:01 = 14 (seconds)`
     * @returns {number}
     */
    age(): Promise<number>;
    /**
     * Load the room invitation info from disk
     *
     * @returns {RoomInvitation}
     * @example
     * const bot = new Wechaty()
     * const dataFromDisk // get the room invitation info data from disk
     * const roomInvitation = await bot.RoomInvitation.fromJSON(dataFromDisk)
     * await roomInvitation.accept()
     */
    static fromJSON(payload: string | RoomInvitationPayload): Promise<RoomInvitation>;
    /**
     * Get the room invitation info when listened on room-invite event
     *
     * @returns {string}
     * @example
     * const bot = new Wechaty()
     * bot.on('room-invite', async roomInvitation => {
     *  const roomInvitation = bot.RoomInvitation.load(roomInvitation.id)
     *  const jsonData = await roomInvitation.toJSON(roomInvitation.id)
     *  // save the json data to disk, and we can use it by RoomInvitation.fromJSON()
     * }
     * .start()
     */
    toJSON(): Promise<string>;
}
declare function wechatifyRoomInvitation(wechaty: Wechaty): typeof RoomInvitation;
export { RoomInvitation, wechatifyRoomInvitation, };
//# sourceMappingURL=room-invitation.d.ts.map