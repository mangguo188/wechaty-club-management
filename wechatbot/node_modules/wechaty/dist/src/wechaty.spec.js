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
const mod_1 = require("./mod");
const wechaty_puppet_1 = require("wechaty-puppet");
class WechatyTest extends wechaty_1.Wechaty {
    wechatifyUserModulesTest(puppet) {
        return this.wechatifyUserModules(puppet);
    }
}
blue_tape_1.default('Export of the Framework', async (t) => {
    t.ok(mod_1.Contact, 'should export Contact');
    t.ok(mod_1.Friendship, 'should export Friendship');
    t.ok(mod_1.IoClient, 'should export IoClient');
    t.ok(mod_1.Message, 'should export Message');
    t.ok(wechaty_puppet_1.Puppet, 'should export Puppet');
    t.ok(mod_1.Room, 'should export Room');
    t.ok(wechaty_1.Wechaty, 'should export Wechaty');
    t.ok(mod_1.log, 'should export log');
});
blue_tape_1.default('static VERSION', async (t) => {
    t.true('VERSION' in wechaty_1.Wechaty, 'Wechaty should has a static VERSION property');
});
blue_tape_1.default('Config setting', async (t) => {
    t.ok(mod_1.config, 'should export Config');
    // t.ok(config.default.DEFAULT_PUPPET  , 'should has DEFAULT_PUPPET')
});
blue_tape_1.default('event:start/stop', async (t) => {
    const wechaty = new wechaty_1.Wechaty({ puppet: 'wechaty-puppet-mock' });
    const startSpy = sinon_1.default.spy();
    const stopSpy = sinon_1.default.spy();
    wechaty.on('start', startSpy);
    wechaty.on('stop', stopSpy);
    await wechaty.start();
    await wechaty.stop();
    // console.log(startSpy.callCount)
    t.ok(startSpy.calledOnce, 'should get event:start once');
    t.ok(stopSpy.calledOnce, 'should get event:stop once');
});
//
// FIXME: restore this unit test !!!
//
// test.only('event:scan', async t => {
//   const m = {} as any
//   const asyncHook = asyncHooks.createHook({
//     init(asyncId: number, type: string, triggerAsyncId: number, resource: Object) {
//       m[asyncId] = type
//     },
//     before(asyncId) {
//       // delete m[asyncId]
//     },
//     after(asyncId) {
//       // delete m[asyncId]
//     },
//     destroy(asyncId) {
//       delete m[asyncId]
//     },
//   })
//   asyncHook.enable()
//   const wechaty = Wechaty.instance()
//   const spy = sinon.spy()
//   wechaty.on('scan', spy)
//   const scanFuture  = new Promise(resolve => wechaty.once('scan', resolve))
//   // wechaty.once('scan', () => console.log('FAINT'))
//   await wechaty.start()
//   await scanFuture
//   // await new Promise(r => setTimeout(r, 1000))
//   await wechaty.stop()
//   t.ok(spy.calledOnce, 'should get event:scan')
//   asyncHook.disable()
//   console.log(m)
// })
blue_tape_1.default.skip('SKIP DEALING WITH THE LISTENER EXCEPTIONS. on(event, Function)', async (t) => {
    const spy = sinon_1.default.spy();
    const wechaty = wechaty_1.Wechaty.instance();
    const EXPECTED_ERROR = new Error('testing123');
    wechaty.on('message', () => { throw EXPECTED_ERROR; });
    // wechaty.on('scan',    () => 42)
    wechaty.on('error', spy);
    const messageFuture = new Promise(resolve => wechaty.once('message', resolve));
    wechaty.emit('message', {});
    await messageFuture;
    await wechaty.stop();
    t.ok(spy.calledOnce, 'should get event:error once');
    t.equal(spy.firstCall.args[0], EXPECTED_ERROR, 'should get error from message listener');
});
blue_tape_1.default.skip('SKIP DEALING WITH THE LISTENER EXCEPTIONS. test async error', async (t) => {
    // Do not modify the global Wechaty instance
    class MyWechatyTest extends wechaty_1.Wechaty {
    }
    const EXPECTED_ERROR = new Error('test');
    const bot = new MyWechatyTest({
        puppet: new wechaty_puppet_mock_1.PuppetMock(),
    });
    const asyncErrorFunction = function () {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                reject(EXPECTED_ERROR);
            }, 100);
            // tslint ask resolve must be called,
            // so write a falsy value, so that it never called
            if (+new Date() < 0) {
                resolve();
            }
        });
    };
    bot.on('message', async () => {
        await asyncErrorFunction();
    });
    bot.on('error', (e) => {
        t.ok(e.message === EXPECTED_ERROR.message);
    });
    bot.emit('message', {});
    await bot.stop();
});
blue_tape_1.default('use plugin', async (t) => {
    // Do not modify the gloabl Wechaty instance
    class MyWechatyTest extends wechaty_1.Wechaty {
    }
    let result = '';
    const myGlobalPlugin = function () {
        return function (bot) {
            bot.on('message', () => (result += 'FROM_GLOBAL_PLUGIN:'));
        };
    };
    const myPlugin = function () {
        return function (bot) {
            bot.on('message', () => (result += 'FROM_MY_PLUGIN:'));
        };
    };
    MyWechatyTest.use(myGlobalPlugin());
    const bot = new MyWechatyTest({
        puppet: new wechaty_puppet_mock_1.PuppetMock(),
    });
    bot.use(myPlugin());
    bot.on('message', () => (result += 'FROM_BOT'));
    bot.emit('message', {});
    await bot.stop();
    t.ok(result === 'FROM_GLOBAL_PLUGIN:FROM_MY_PLUGIN:FROM_BOT');
});
blue_tape_1.default('initPuppetAccessory()', async (t) => {
    const wechatyTest = new WechatyTest();
    const puppet = new wechaty_puppet_mock_1.PuppetMock();
    t.doesNotThrow(() => wechatyTest.wechatifyUserModulesTest(puppet), 'should not throw for the 1st time init');
    t.throws(() => wechatyTest.wechatifyUserModulesTest(puppet), 'should throw for the 2nd time init');
});
// TODO: add test for event args
blue_tape_1.default('Wechaty restart for many times', async (t) => {
    const wechaty = new wechaty_1.Wechaty({
        puppet: new wechaty_puppet_mock_1.PuppetMock(),
    });
    try {
        for (let i = 0; i < 3; i++) {
            await wechaty.start();
            await wechaty.stop();
            t.pass('start/stop-ed at #' + i);
        }
        t.pass('Wechaty start/restart successed.');
    }
    catch (e) {
        t.fail(e);
    }
});
blue_tape_1.default('@event ready', async (t) => {
    const puppet = new wechaty_puppet_mock_1.PuppetMock();
    const wechaty = new wechaty_1.Wechaty({ puppet });
    const sandbox = sinon_1.default.createSandbox();
    const spy = sandbox.spy();
    wechaty.on('ready', spy);
    t.true(spy.notCalled, 'should no ready event with new wechaty instance');
    await wechaty.start();
    t.true(spy.notCalled, 'should no ready event right start wechaty started');
    puppet.emit('ready', { data: 'test' });
    t.true(spy.calledOnce, 'should fire ready event after puppet ready');
    await wechaty.stop();
    await wechaty.start();
    puppet.emit('ready', { data: 'test' });
    t.true(spy.calledTwice, 'should fire ready event second time after stop/start wechaty');
    await wechaty.stop();
});
blue_tape_1.default('ready()', async (t) => {
    const puppet = new wechaty_puppet_mock_1.PuppetMock();
    const wechaty = new wechaty_1.Wechaty({ puppet });
    const sandbox = sinon_1.default.createSandbox();
    const spy = sandbox.spy();
    wechaty.ready()
        .then(spy)
        .catch(e => t.fail('rejection: ' + e));
    t.true(spy.notCalled, 'should not ready with new wechaty instance');
    await wechaty.start();
    t.true(spy.notCalled, 'should not ready after right start wechaty');
    puppet.emit('ready', { data: 'test' });
    await new Promise(resolve => setImmediate(resolve));
    t.true(spy.calledOnce, 'should ready after puppet ready');
    await wechaty.stop();
    await wechaty.start();
    wechaty.ready()
        .then(spy)
        .catch(e => t.fail('rejection: ' + e));
    puppet.emit('ready', { data: 'test' });
    await new Promise(resolve => setImmediate(resolve));
    t.true(spy.calledTwice, 'should ready again after stop/start wechaty');
    await wechaty.stop();
});
blue_tape_1.default('on/off event listener management', async (t) => {
    const puppet = new wechaty_puppet_mock_1.PuppetMock();
    const wechaty = new wechaty_1.Wechaty({ puppet });
    const onMessage = (_) => { };
    t.equal(wechaty.listenerCount('message'), 0, 'should no listener after initializing');
    wechaty.on('message', onMessage);
    t.equal(wechaty.listenerCount('message'), 1, 'should +1 listener after on(message)');
    wechaty.off('message', onMessage);
    t.equal(wechaty.listenerCount('message'), 0, 'should -1 listener after off(message)');
});
//# sourceMappingURL=wechaty.spec.js.map