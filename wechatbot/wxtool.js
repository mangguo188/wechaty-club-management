const {
    Contact, log, Message, ScanStatus, Wechaty, UrlLink, MiniProgram
} = require("wechaty");
const { PuppetPadlocal } = require('wechaty-puppet-padlocal');
const { FileBox } = require('file-box')
const request = require('request');
const mqtt = require('mqtt')

const name = 'wechat-group';
const wxKey = '机器人的微信号' //换成自己的微信号

// 1、如果没有token请使用以下代码
const puppet = 'wechaty-puppet-wechat'

// 2、如果有Padlocal token请使用一下配置
// const puppet = new PuppetPadlocal({
//     token:"获得的token",
// });

const bot = new Wechaty({
    name,
    puppet,
});

function print(msg, res) {
    console.debug(msg + '------------------------------------\n')
    console.debug(res)
    console.debug('\n')
}

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function getEventsMsg(eventName, msg) {
    let events = {}
    events[eventName] = msg
    let payload = {
        "reqId": guid,
        "method": "thing.event.post",
        "version": "1.0",
        "timestamp": new Date().getTime(),
        "events": events
    }
    payload = JSON.stringify(payload)
    // console.debug(eventName)
    // print(eventName, payload)
    return payload
}

function pub_msg(datas_jsonstr) {
    let body = JSON.parse(datas_jsonstr)
    try {
        // 群组大师小程序提供的log接口
        let url = `https://1251176925.sh.apigw.tencentcs.com:443/bot/${wxKey}/message` //换成自己的后端服务地址

        request({
            url,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body
        }, function (error, response, body) {
            console.error('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            try {
                console.log('body:', body); // Print the HTML for the Google homepage.
                if (body.constructor == Array) {
                    for (let i = 0; i < body.length; i++) {
                        let obj = body[i]
                        if (obj.name == 'pubMessage') {
                            // 小程序返回的活动报名信息发送到群
                            do_say(bot, obj)
                        }
                    }
                } else {
                    if (body.name == 'pubMessage') {
                        // 小程序返回的活动报名信息发送到群
                        do_say(bot, body)
                    }
                }



            } catch (err) {
                console.error(err)
            }
        })



    } catch (err) {
        print('pub_msg', err)
    }
}

async function do_say(bot, message_json) {
    let obj = message_json.params
    console.debug(obj)
    let cur_to = ''
    if (obj.wxKey == wxKey && obj.roomid) {
        cur_to = await bot.Room.find({ id: obj.roomid })
    } else {
        cur_to = await bot.Contact.find({ id: obj.wxid })
    }
    if (obj.msgType == 'Image') {
        // 1. send Image
        //   {
        //     "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        //     "method":"thing.command.invoke",
        //     "version":"1.0",
        //     "timestamp":1610430718000,
        //     "name":"pubMessage",
        //     "params":{
        //         "id":"tyutluyc",
        //         "msg":"https://wechaty.github.io/wechaty/images/bot-qr-code.png",
        //         "roomid":"5550027590@chatroom",
        //         "wxKey":"choogoo",
        //         "msgType":"Image"
        //     }
        // }
        const fileBox = FileBox.fromUrl(obj.msg || 'https://wechaty.github.io/wechaty/images/bot-qr-code.png')
        await cur_to.say(fileBox)
    } else if (obj.msgType == 'Text') {
        // 2. send Text
        //   {
        //     "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        //     "method":"thing.command.invoke",
        //     "version":"1.0",
        //     "timestamp":1610430718000,
        //     "name":"pubMessage",
        //     "params":{
        //         "id":"tyutluyc",
        //         "msg":"dingdingding",
        //         "roomid":"5550027590@chatroom",
        //         "wxKey":"choogoo",
        //         "msgType":"Text"
        //     }
        // }
        if (obj.wxid && obj.roomid) {
            let atUserIdList = []

            if (obj.wxid instanceof Array) {
                atUserIdList = obj.wxid
            } else {
                atUserIdList = [obj.wxid]
            }
            const atUserList = [];
            for (const userId of atUserIdList) {
                const cur_contact = await bot.Contact.load(userId);
                atUserList.push(cur_contact);
            }
            await cur_to.say(obj.msg, ...atUserList)
        } else {
            await cur_to.say(obj.msg || 'dingdingding')
        }
    } else if (obj.msgType == 'Contact') {
        // 3. send Contact
        //   {
        //     "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        //     "method":"thing.command.invoke",
        //     "version":"1.0",
        //     "timestamp":1610430718000,
        //     "name":"pubMessage",
        //     "params":{
        //         "id":"tyutluyc",
        //         "msg":"tyutluyc",
        //         "roomid":"5550027590@chatroom",
        //         "wxKey":"choogoo",
        //         "msgType":"Contact"
        //     }
        // }
        const contactCard = await bot.Contact.find({ id: obj.msg || 'tyutluyc' })
        if (!contactCard) {
            console.log('not found')
            return
        }
        await cur_to.say(contactCard)

    } else if (obj.msgType == 'UrlLink') {
        // 4. send UrlLink
        //   {
        //     "reqId":"442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
        //     "method":"thing.command.invoke",
        //     "version":"1.0",
        //     "timestamp":1610430718000,
        //     "name":"pubMessage",
        //     "params":{
        //         "id":"tyutluyc",
        //         "msg":{
        //             "description":"测试卡片",
        //             "thumbnailUrl":"http://mmbiz.qpic.cn/mmbiz_jpg/mLJaHznUd7O4HCW51IPGVarcVwAAAuofgAibUYIct2DBPERYIlibbuwthASJHPBfT9jpSJX4wfhGEBnqDvFHHQww/0",
        //             "title":"欢迎使用群组大师小程序",
        //             "url":"https://mp.weixin.qq.com/s/m6qbYo6eFR8RbIj25Xm4rQ"
        //         },
        //         "roomid":"5550027590@chatroom",
        //         "wxKey":"choogoo",
        //         "msgType":"UrlLink"
        //     }
        // }
        const urlLink = new UrlLink(obj.msg || {
            description: '微信群活动自动化管理工具，点击链接进入小程序',
            thumbnailUrl: 'http://mmbiz.qpic.cn/mmbiz_jpg/mLJaHznUd7O4HCW51IPGVarcVwAAAuofgAibUYIct2DBPERYIlibbuwthASJHPBfT9jpSJX4wfhGEBnqDvFHHQww/0',
            title: '欢迎使用群组大师小程序',
            url: 'https://mp.weixin.qq.com/s/m6qbYo6eFR8RbIj25Xm4rQ',
        });
        await cur_to.say(urlLink);

    } else if (obj.msgType == 'MiniProgram') {
        // 5. send MiniProgram (only supported by `wechaty-puppet-macpro`)
        if (obj.wxid && obj.roomid) {
            const miniProgramPayload = obj.msg
            console.debug(miniProgramPayload)
            const miniProgram = new MiniProgram(miniProgramPayload);
            await cur_to.say(miniProgram)
        } else {
            await cur_to.say(obj.msg || 'dingdingding')
        }

    } else {
        console.debug('不支持的消息类型')
    }

}

bot.on("scan", (qrcode, status) => {
        if (status === ScanStatus.Waiting && qrcode) {
            const qrcodeImageUrl = [
                'https://wechaty.js.org/qrcode/',
                encodeURIComponent(qrcode),
            ].join('')

            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);

            require('qrcode-terminal').generate(qrcode, { small: true })  // show qrcode on console
        } else {
            log.info("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
        }
        pub_msg(getEventsMsg('scan', { qrcode, status }))

    })
    .on("login", (user) => {
        log.info("TestBot", `${user} login`);
        pub_msg(getEventsMsg('login', { user }))

    })
    .on("logout", (user, reason) => {
        log.info("TestBot", `${user} logout, reason: ${reason}`);
        pub_msg(getEventsMsg('logout', { user, reason }))
    })
    .on("heartbeat", (data) => {

    })
    .on("ready", async () => {
        let contactList = await bot.Contact.findAll()
        let friend_contactList = []
        let unfriend_contactList = []

        for (let i = 0; i < contactList.length; i++) {
            if (contactList[i].friend()) {
                // console.debug(contactList[i])
                friend_contactList.push(contactList[i])
            } else {
                // console.debug(contactList[i].id)
                unfriend_contactList.push(contactList[i])
            }
        }
        // console.debug(unfriend_contactList)

        console.debug(friend_contactList.length, unfriend_contactList.length)

        contactList = friend_contactList
        const roomList = await bot.Room.findAll()
        const userSelf = bot.userSelf()
        pub_msg(getEventsMsg('ready', { contactList, roomList, userSelf }))
    })
    .on("message", async (message) => {
        print('message', message)
        const contact = message.talker()
        let text = message.text()
        let room_info = {}
        let alias = ''
        let member = ''
        print('text', text)
        print('message.talker()', message.talker())
        print('message.talker().id', message.talker().id)
        let room = message.room()
        print('room',room)
        const user = {
            'wxid': contact.id,
            'gender': contact.gender(),
            'type': contact.type(),
            'nickName': contact.name(),
            'avatar': await (await contact.avatar()).toJSON(),
            'city': contact.city(),
            'province': contact.province()
        }
        try {
            if (room && room.id) {
                print('room', '有roomowner信息')
                try {
                    alias = await room.alias(message.talker()) || ''
                    member = await room.member(contact.name()) || ''
                    room_info = {
                        ownerid: room.owner().id,
                        roomid: room.id,
                        nick: await room.topic(),
                        announce: await room.announce(),
                        avatar: await (await room.avatar()).toJSON(),
                        alias: await room.alias(message.talker()) || ''
                    }
                    // print('await room.memberAll()',await room.memberAll())
                } catch {
                    room_info = {
                        ownerid: room.owner().id,
                        roomid: room.id,
                        nick: await room.topic(),
                        announce: await room.announce(),
                        alias: await room.alias(message.talker()) || ''
                        // member: await room.member(contact.name())
                        // qrcode: await room.qrCode()
                    }
                    // print('await room.memberAll()',await room.memberAll())
                }

            } else {
                print('room', '没有roomowner信息')
                room_info = {
                    roomid: '',
                    nick: await room.topic() || ''
                }
            }
        } catch (err) {
            console.error(err)
        }

        let payload = {
            user,
            from: message.talker(),
            to: message.to(),
            type: message.type(),
            // message,
            text,
            room: room_info,
            wxKey,
            // content: 'X' + message.text(),
            alias,
            member,
            create_time: new Date().getTime()
        }
        // console.debug(payload)
        payload = JSON.stringify(payload)
        payload = JSON.parse(payload)

        print('payload', payload)
        pub_msg(getEventsMsg('message', payload))

        // 1. send Image

        if (/^ding$/i.test(message.text())) {
            const fileBox = FileBox.fromUrl('https://wechaty.github.io/wechaty/images/bot-qr-code.png')
            await message.say(fileBox)
        }

        // 2. send Text

        if (/^dong$/i.test(message.text())) {
            await message.say('dingdingding')
        }

        // 4. send UrlLink
        if (/^彪悍的超哥$/i.test(message.text())) {
            const urlLink = new UrlLink({
                description: '微信群活动自动化管理工具，点击链接进入小程序',
                thumbnailUrl: 'http://mmbiz.qpic.cn/mmbiz_jpg/mLJaHznUd7O4HCW51IPGVarcVwAAAuofgAibUYIct2DBPERYIlibbuwthASJHPBfT9jpSJX4wfhGEBnqDvFHHQww/0',
                title: '欢迎使用群组大师小程序',
                url: 'https://mp.weixin.qq.com/s/m6qbYo6eFR8RbIj25Xm4rQ',
            });

            await message.say(urlLink);
        }


    })
    .on('friendship', async (friendship) => {
        let contact = friendship.contact()
        if (friendship.type() === bot.Friendship.Type.Receive) { // 1. receive new friendship request from new contact
            let result = await friendship.accept()
            if (result) {
                console.log(`Request from ${contact.name()} is accept succesfully!`)
                let msg = `小程序相关问题可直接留言描述问题，看到后超哥会第一时间回复，特别紧急的问题可回复<紧急>二字联系超哥~`
                await contact.say(msg)
                contact = await bot.Contact.find({ name: contact.name() })
                await contact.say(msg)

            } else {
                console.log(`Request from ${contact.name()} failed to accept!`)
                let msg = `小程序相关问题可直接留言描述问题，看到后超哥会第一时间回复，特别紧急的问题可回复<紧急>二字联系超哥~`
                await contact.say(msg)
            }

        } else if (friendship.type() === bot.Friendship.Type.Confirm) { // 2. confirm friendship
            console.log(`New friendship confirmed with ${contact.name()}`)
            let msg = `nice to meet you~`
        }

        pub_msg(getEventsMsg('friendship', { friendship }))
    })
    .on('room-join', async (room, inviteeList, inviter) => {
        const nameList = inviteeList.map(c => c.name()).join(',')
        console.log(`Room ${await room.topic()} got new member ${nameList}, invited by ${inviter}`)
        pub_msg(getEventsMsg('room-join', { room, inviteeList, inviter }))

        let msg = `热烈欢迎@${nameList} 加入群~`
        // room.say(msg)
    })
    .on('room-leave', async (room, leaverList, remover) => {
        const nameList = leaverList.map(c => c.name()).join(',')
        console.log(`Room ${await room.topic()} lost member ${nameList}, the remover is: ${remover}`)
        pub_msg(getEventsMsg('room-leave', { room, leaverList, remover }))

        let msg = `很遗憾，${nameList}离开了群~`
        // room.say(msg)

    })
    .on('room-topic', async (room, topic, oldTopic, changer) => {
        console.log(`Room ${await room.topic()} topic changed from ${oldTopic} to ${topic} by ${changer.name()}`)
        pub_msg(getEventsMsg('room-topic', { room, topic, oldTopic, changer }))

    })
    .on('room-invite', async roomInvitation => {
        try {
            console.log(`received room-invite event.`)
            await roomInvitation.accept()
            pub_msg(getEventsMsg('room-invite', { roomInvitation: await roomInvitation.accept() }))

        } catch (e) {
            console.error(e)
            pub_msg(getEventsMsg('room-invite', { roomInvitation: e }))

        }
    })
    .on("error", (error) => {
        log.error("TestBot", 'on error: ', error.stack);
        pub_msg(getEventsMsg('error', { error }))

    })


bot
    .start()
    .then(() => {
        log.info("TestBot", "started.");
    });