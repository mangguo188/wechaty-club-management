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
const try_wait_1 = require("./try-wait");
const promiseRetry = require("promise-retry");
blue_tape_1.default('promiseRetry()', async (t) => {
    const EXPECTED_RESOLVE = 'Okey';
    const EXPECTED_REJECT = 'NotTheTime';
    function delayedFactory(timeout) {
        const startTime = Date.now();
        return () => {
            const nowTime = Date.now();
            if (nowTime - startTime > timeout) {
                return Promise.resolve(EXPECTED_RESOLVE);
            }
            return Promise.reject(EXPECTED_REJECT);
        };
    }
    const thenSpy = sinon_1.default.spy();
    const delay500 = delayedFactory(500);
    await promiseRetry({
        minTimeout: 1,
        retries: 1,
    }, (retry) => {
        return delay500().catch(retry);
    }).catch((e) => {
        thenSpy(e);
    });
    t.true(thenSpy.withArgs(EXPECTED_REJECT).calledOnce, 'should got EXPECTED_REJECT when wait not enough');
    thenSpy.resetHistory();
    const anotherDelay50 = delayedFactory(50);
    await promiseRetry({
        minTimeout: 1,
        retries: 100,
    }, (retry) => {
        return anotherDelay50().catch(retry);
    })
        .then((r) => {
        return thenSpy(r);
    });
    t.true(thenSpy.withArgs(EXPECTED_RESOLVE).calledOnce, 'should got EXPECTED_RESOLVE when wait enough');
});
blue_tape_1.default('retry()', async (t) => {
    const EXPECTED_RESOLVE = 'Okey';
    const EXPECTED_REJECT = 'NotTheTime';
    function delayedFactory(timeout) {
        const startTime = Date.now();
        return () => {
            const nowTime = Date.now();
            if (nowTime - startTime > timeout) {
                return Promise.resolve(EXPECTED_RESOLVE);
            }
            return Promise.reject(EXPECTED_REJECT);
        };
    }
    const thenSpy = sinon_1.default.spy();
    const anotherDelay50 = delayedFactory(50);
    await try_wait_1.tryWait((retry) => {
        return anotherDelay50().catch(retry);
    })
        .then((r) => {
        return thenSpy(r);
    });
    t.true(thenSpy.withArgs(EXPECTED_RESOLVE).calledOnce, 'should got EXPECTED_RESOLVE when wait enough');
});
//# sourceMappingURL=try-wait.spec.js.map