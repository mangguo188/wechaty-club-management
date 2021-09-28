/**
 * Huan(202011)
 *  Create a `looseInstanceOfClass` to check `FileBox` and `Puppet` instances #2090
 *    https://github.com/wechaty/wechaty/issues/2090
 */
declare function looseInstanceOfClass<T extends {
    new (...args: any): any;
}>(klass: T): (o: any) => o is InstanceType<T>;
export { looseInstanceOfClass };
//# sourceMappingURL=loose-instance-of-class.d.ts.map