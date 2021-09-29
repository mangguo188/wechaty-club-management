#!/usr/bin/env ts-node
"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blue_tape_1 = __importDefault(require("blue-tape"));
const net_1 = __importDefault(require("net"));
const get_port_1 = require("./get-port");
blue_tape_1.default('getPort() for an available socket port', async (t) => {
    let port = await get_port_1.getPort();
    let ttl = 17;
    const serverList = [];
    while (ttl-- > 0) {
        try {
            const server = net_1.default.createServer(socket => {
                console.info(socket);
            });
            await new Promise(resolve => server.listen(port, resolve));
            serverList.push(server);
            port = await get_port_1.getPort();
        }
        catch (e) {
            t.fail('should not exception: ' + e.message + ', ' + e.stack);
        }
    }
    serverList.map(server => server.close());
    t.pass('should has no exception after loop test');
});
//# sourceMappingURL=get-port.spec.js.map