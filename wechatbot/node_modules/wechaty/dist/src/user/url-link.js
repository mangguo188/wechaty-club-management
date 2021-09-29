"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wechatifyUrlLink = exports.UrlLink = void 0;
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
const url_1 = __importDefault(require("url"));
const config_1 = require("../config");
const open_graph_1 = require("../helper-functions/impure/open-graph");
class UrlLink {
    /*
     * @hideconstructor
     */
    constructor(payload) {
        this.payload = payload;
        config_1.log.verbose('UrlLink', 'constructor()');
    }
    /**
     *
     * Create from URL
     *
     */
    static async create(url) {
        config_1.log.verbose('UrlLink', 'create(%s)', url);
        const meta = await open_graph_1.openGraph(url);
        let description;
        let imageUrl;
        let title;
        if (meta.image) {
            if (typeof meta.image === 'string') {
                imageUrl = meta.image;
            }
            else if (Array.isArray(meta.image)) {
                imageUrl = meta.image[0];
            }
            else {
                if (Array.isArray(meta.image.url)) {
                    imageUrl = meta.image.url[0];
                }
                else if (meta.image.url) {
                    imageUrl = meta.image.url;
                }
            }
        }
        if (Array.isArray(meta.title)) {
            title = meta.title[0];
        }
        else {
            title = meta.title;
        }
        if (Array.isArray(meta.description)) {
            description = meta.description[0];
        }
        else if (meta.description) {
            description = meta.description;
        }
        else {
            description = title;
        }
        if (!imageUrl || !description) {
            throw new Error(`imageUrl(${imageUrl}) or description(${description}) not found!`);
        }
        if (!imageUrl.startsWith('http')) {
            const resolvedUrl = new url_1.default.URL(imageUrl, url);
            imageUrl = resolvedUrl.toString();
        }
        const payload = {
            description,
            thumbnailUrl: imageUrl,
            title,
            url,
        };
        return new UrlLink(payload);
    }
    toString() {
        return `UrlLink<${this.payload.url}>`;
    }
    url() {
        return this.payload.url;
    }
    title() {
        return this.payload.title;
    }
    thumbnailUrl() {
        return this.payload.thumbnailUrl;
    }
    description() {
        return this.payload.description;
    }
}
exports.UrlLink = UrlLink;
function wechatifyUrlLink(_) {
    return UrlLink;
}
exports.wechatifyUrlLink = wechatifyUrlLink;
//# sourceMappingURL=url-link.js.map