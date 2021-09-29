"use strict";
/**
 * Huan(202011)
 *  Create a `looseInstanceOfClass` to check `FileBox` and `Puppet` instances #2090
 *    https://github.com/wechaty/wechaty/issues/2090
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.looseInstanceOfClass = void 0;
function looseInstanceOfClass(klass) {
    return (o) => {
        if (o instanceof klass) {
            return true;
        }
        else if (o && o.constructor && o.constructor.name === klass.name) {
            return true;
        }
        return false;
    };
}
exports.looseInstanceOfClass = looseInstanceOfClass;
//# sourceMappingURL=loose-instance-of-class.js.map