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
const wechaty_1 = require("./wechaty");
blue_tape_1.default('Wechaty Plugin uninstaller should be called after wechaty.stop()', async (t) => {
    const spyPluginInstall = sinon_1.default.spy();
    const spyPluginUninstall = sinon_1.default.spy();
    const bot = new wechaty_1.Wechaty({ puppet: new wechaty_puppet_mock_1.PuppetMock() });
    const plugin = (_bot) => {
        spyPluginInstall();
        return () => {
            spyPluginUninstall();
        };
    };
    t.true(spyPluginInstall.notCalled, 'should be clean for install spy');
    t.true(spyPluginUninstall.notCalled, 'should be clean for uninstall spy');
    bot.use(plugin);
    t.true(spyPluginInstall.called, 'should called install spy after use()');
    t.true(spyPluginUninstall.notCalled, 'should not call uninstall spy after use()');
    await bot.start();
    await bot.stop();
    t.true(spyPluginUninstall.called, 'should called uninstall spy after stop()');
});
//# sourceMappingURL=plugin.spec.js.map