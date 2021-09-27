"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomEventEmitter = exports.ROOM_EVENT_DICT = void 0;
const events_1 = require("events");
exports.ROOM_EVENT_DICT = {
    invite: 'tbw',
    join: 'tbw',
    leave: 'tbw',
    message: 'message that received in this room',
    topic: 'tbw',
};
exports.RoomEventEmitter = events_1.EventEmitter;
//# sourceMappingURL=room-events.js.map