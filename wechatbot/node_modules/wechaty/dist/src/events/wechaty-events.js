"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WechatyEventEmitter = void 0;
const events_1 = require("events");
const wechaty_puppet_1 = require("wechaty-puppet");
const WECHATY_EVENT_DICT = {
    ...wechaty_puppet_1.CHAT_EVENT_DICT,
    dong: 'Should be emitted after we call `Wechaty.ding()`',
    error: "Will be emitted when there's an Error occurred.",
    heartbeat: 'Will be emitted periodically after the Wechaty started. If not, means that the Wechaty had died.',
    puppet: 'Will be emitted when the puppet has been set.',
    ready: 'All underlined data source are ready for use.',
    start: 'Will be emitted after the Wechaty had been started.',
    stop: 'Will be emitted after the Wechaty had been stopped.',
};
exports.WechatyEventEmitter = events_1.EventEmitter;
//# sourceMappingURL=wechaty-events.js.map