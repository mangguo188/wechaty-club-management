#!/usr/bin/env ts-node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const blue_tape_1 = __importDefault(require("blue-tape"));
const sinon_1 = __importDefault(require("sinon"));
const wechaty_puppet_mock_1 = require("wechaty-puppet-mock");
const wechaty_1 = require("../wechaty");
const contact_1 = require("./contact");
blue_tape_1.default('findAll()', async (t) => {
    const EXPECTED_CONTACT_ID = 'test-id';
    const EXPECTED_CONTACT_NAME = 'test-name';
    const EXPECTED_CONTACT_ID_LIST = [EXPECTED_CONTACT_ID];
    const sandbox = sinon_1.default.createSandbox();
    const puppet = new wechaty_puppet_mock_1.PuppetMock();
    const wechaty = new wechaty_1.Wechaty({ puppet });
    await wechaty.start();
    sandbox.stub(puppet, 'contactSearch').resolves(EXPECTED_CONTACT_ID_LIST);
    sandbox.stub(puppet, 'contactPayload').callsFake(async () => {
        await new Promise(resolve => setImmediate(resolve));
        return {
            name: EXPECTED_CONTACT_NAME,
        };
    });
    const contactList = await wechaty.Contact.findAll();
    t.equal(contactList.length, 1, 'should find 1 contact');
    t.equal(contactList[0].name(), EXPECTED_CONTACT_NAME, 'should get name from payload');
    await wechaty.stop();
});
blue_tape_1.default('Should not be able to instanciate directly', async (t) => {
    t.throws(() => {
        const c = contact_1.Contact.load('xxx');
        t.fail(c.name());
    }, 'should throw when `Contact.load()`');
    t.throws(() => {
        const c = contact_1.Contact.load('xxx');
        t.fail(c.name());
    }, 'should throw when `Contact.load()`');
});
blue_tape_1.default('Should not be able to instanciate through cloneClass without puppet', async (t) => {
    t.throws(() => {
        const c = contact_1.Contact.load('xxx');
        t.fail(c.name());
    }, 'should throw when `MyContact.load()` without puppet');
    t.throws(() => {
        const c = contact_1.Contact.load('xxx');
        t.fail(c.name());
    }, 'should throw when `MyContact.load()` without puppet');
});
blue_tape_1.default('should throw when instanciate the global class', async (t) => {
    t.throws(() => {
        const c = contact_1.Contact.load('xxx');
        t.fail('should not run to here');
        t.fail(c.toString());
    }, 'should throw when we instanciate a global class');
});
//# sourceMappingURL=contact.spec.js.map