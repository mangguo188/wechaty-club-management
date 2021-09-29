#!/usr/bin/env ts-node
"use strict";
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
const tstest_1 = require("tstest");
const file_box_1 = require("file-box");
const loose_instance_of_class_1 = require("./loose-instance-of-class");
tstest_1.test('looseInstanceOfClass: instanceof', async (t) => {
    class Test {
    }
    const looseInstanceOfTest = loose_instance_of_class_1.looseInstanceOfClass(Test);
    const test = new Test();
    t.true(looseInstanceOfTest(test), 'should be true for a real Test');
});
tstest_1.test('looseInstanceOfClass: constructor.name', async (t) => {
    class Test {
    }
    const looseInstanceOfTest = loose_instance_of_class_1.looseInstanceOfClass(Test);
    const OrigTest = Test;
    t.equal(Test, OrigTest, 'should be the same class reference at beginning');
    {
        class Test {
        }
        t.notEqual(OrigTest, Test, 'should has a new Test class different to the original Test class');
        const f = new Test();
        t.true(looseInstanceOfTest(f), 'should be true for the same name class like Test');
    }
});
tstest_1.test('looseInstanceOfClass: n/a', async (t) => {
    class Test {
    }
    const looseInstanceOfTest = loose_instance_of_class_1.looseInstanceOfClass(Test);
    const o = {};
    t.false(looseInstanceOfTest(o), 'should be false for non-Test: {}');
});
tstest_1.test('looseInstanceOfClass for FileBox', async (t) => {
    const f = file_box_1.FileBox.fromQRCode('test');
    const looseInstanceOfFileBox = loose_instance_of_class_1.looseInstanceOfClass(file_box_1.FileBox);
    const OrigFileBox = file_box_1.FileBox;
    {
        class FileBox {
        }
        t.notEqual(OrigFileBox, FileBox, 'should be two different FileBox class');
        t.true(f instanceof OrigFileBox, 'should be instanceof OrigFileBox');
        t.false(f instanceof FileBox, 'should not instanceof another FileBox class for one FileBox instance');
        t.true(looseInstanceOfFileBox(f), 'should be true for looseInstanceOfFileBox because the class has the same name');
    }
});
//# sourceMappingURL=loose-instance-of-class.spec.js.map