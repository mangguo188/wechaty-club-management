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
import { Tag } from './tag';
import { Wechaty } from '../wechaty';
declare class Favorite {
    static get wechaty(): Wechaty;
    get wechaty(): Wechaty;
    static list(): Favorite[];
    /**
     * Get tags for all favorites
     *
     * @static
     * @returns {Promise<Tag[]>}
     * @example
     * const tags = await wechaty.Favorite.tags()
     */
    static tags(): Promise<Tag[]>;
    constructor();
    tags(): Promise<Tag[]>;
    findAll(): Promise<void>;
}
declare function wechatifyFavorite(wechaty: Wechaty): typeof Favorite;
export { Favorite, wechatifyFavorite, };
//# sourceMappingURL=favorite.d.ts.map