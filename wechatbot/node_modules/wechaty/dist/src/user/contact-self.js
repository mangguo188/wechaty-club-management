"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wechatifyContactSelf = exports.ContactSelf = void 0;
/**
 *   Wechaty Chatbot SDK - https://github.com/wechaty/wechaty
 *
 *   @copyright 2016 Huan LI (李卓桓) <https://github.com/huan>, and
 *                   Wechaty Contributors <https://github.com/wechaty>.
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */
const wechaty_puppet_1 = require("wechaty-puppet");
const guard_qr_code_value_1 = require("../helper-functions/pure/guard-qr-code-value");
const contact_1 = require("./contact");
/**
 * Bot itself will be encapsulated as a ContactSelf.
 *
 * > Tips: this class is extends Contact
 * @example
 * const bot = new Wechaty()
 * await bot.start()
 * bot.on('login', (user: ContactSelf) => {
 *   console.log(`user ${user} login`)
 * })
 */
class ContactSelf extends contact_1.Contact {
    /**
     * GET / SET bot avatar
     *
     * @param {FileBox} [file]
     * @returns {(Promise<void | FileBox>)}
     *
     * @example <caption> GET the avatar for bot, return {Promise<FileBox>}</caption>
     * // Save avatar to local file like `1-name.jpg`
     *
     * bot.on('login', (user: ContactSelf) => {
     *   console.log(`user ${user} login`)
     *   const file = await user.avatar()
     *   const name = file.name
     *   await file.toFile(name, true)
     *   console.log(`Save bot avatar: ${contact.name()} with avatar file: ${name}`)
     * })
     *
     * @example <caption>SET the avatar for a bot</caption>
     * import { FileBox }  from 'wechaty'
     * bot.on('login', (user: ContactSelf) => {
     *   console.log(`user ${user} login`)
     *   const fileBox = FileBox.fromUrl('https://wechaty.github.io/wechaty/images/bot-qr-code.png')
     *   await user.avatar(fileBox)
     *   console.log(`Change bot avatar successfully!`)
     * })
     *
     */
    async avatar(file) {
        wechaty_puppet_1.log.verbose('Contact', 'avatar(%s)', file ? file.name : '');
        if (!file) {
            const filebox = await super.avatar();
            return filebox;
        }
        if (this.id !== this.wechaty.puppet.selfId()) {
            throw new Error('set avatar only available for user self');
        }
        await this.wechaty.puppet.contactAvatar(this.id, file);
    }
    /**
     * Get bot qrcode
     *
     * @returns {Promise<string>}
     *
     * @example
     * import { generate } from 'qrcode-terminal'
     * bot.on('login', (user: ContactSelf) => {
     *   console.log(`user ${user} login`)
     *   const qrcode = await user.qrcode()
     *   console.log(`Following is the bot qrcode!`)
     *   generate(qrcode, { small: true })
     * })
     */
    async qrcode() {
        wechaty_puppet_1.log.verbose('Contact', 'qrcode()');
        let puppetId;
        try {
            puppetId = this.wechaty.puppet.selfId();
        }
        catch (e) {
            throw Error('Can not get qrcode, user might be either not logged in or already logged out');
        }
        if (this.id !== puppetId) {
            throw new Error('only can get qrcode for the login userself');
        }
        const qrcodeValue = await this.wechaty.puppet.contactSelfQRCode();
        return guard_qr_code_value_1.guardQrCodeValue(qrcodeValue);
    }
    name(name) {
        wechaty_puppet_1.log.verbose('ContactSelf', 'name(%s)', name || '');
        if (typeof name === 'undefined') {
            return super.name();
        }
        let puppetId;
        try {
            puppetId = this.wechaty.puppet.selfId();
        }
        catch (e) {
            throw Error('Can not set name for user self, user might be either not logged in or already logged out');
        }
        if (this.id !== puppetId) {
            throw new Error('only can set name for user self');
        }
        return this.wechaty.puppet.contactSelfName(name).then(this.sync.bind(this));
    }
    /**
     * Change bot signature
     *
     * @param signature The new signature that the bot will change to
     *
     * @example
     * bot.on('login', async user => {
     *   console.log(`user ${user} login`)
     *   try {
     *     await user.signature(`Signature changed by wechaty on ${new Date()}`)
     *   } catch (e) {
     *     console.error('change signature failed', e)
     *   }
     * })
     */
    async signature(signature) {
        wechaty_puppet_1.log.verbose('ContactSelf', 'signature()');
        let puppetId;
        try {
            puppetId = this.wechaty.puppet.selfId();
        }
        catch (e) {
            throw Error('Can not set signature for user self, user might be either not logged in or already logged out');
        }
        if (this.id !== puppetId) {
            throw new Error('only can change signature for user self');
        }
        return this.wechaty.puppet.contactSelfSignature(signature).then(this.sync.bind(this));
    }
}
exports.ContactSelf = ContactSelf;
function wechatifyContactSelf(wechaty) {
    class WechatifiedContactSelf extends ContactSelf {
        static get wechaty() { return wechaty; }
        get wechaty() { return wechaty; }
    }
    return WechatifiedContactSelf;
}
exports.wechatifyContactSelf = wechatifyContactSelf;
//# sourceMappingURL=contact-self.js.map