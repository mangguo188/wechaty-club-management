const {
  Contact,
  log,
  Message,
  ScanStatus,
  Wechaty,
  UrlLink,
  MiniProgram
} = require("wechaty");
const {
  FileBox
} = require('file-box')
const request = require('request');

const {
  PuppetXp
} = require('wechaty-puppet-xp')

const name = 'wechat-group';
const wxKey = 'mangguo185943'

const puppet = new PuppetXp()
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
    let url = `https://service-a00jv7f3-1305916954.sh.apigw.tencentcs.com:443/bot/${wxKey}/message` //换成自己的后端服务地址

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
    cur_to = await bot.Room.find({
      id: obj.roomid
    })
  } else {
    cur_to = await bot.Contact.find({
      id: obj.wxid
    })
  }
  if (obj.msgType == 'Text') {
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
  } else {
    console.debug('不支持的消息类型')
  }
}

let actInfo = {
  description: '6月4日 周五 14:00-16:00<br/>康羽朗健·李宁羽毛球网球健身中心<br/>限18人<br/>水平要求：男生3级及以上，女生2级及以上<br/>费用:60元/人<br/>'
}

let registrationList = []

function callServer(payload) {
  let text = payload.text
  let nickName = payload.user.nickName
  let msg = ''
  if (/^报名$/i.test(text)) {
    registrationList.push(nickName)
    msg = '@' + nickName + ' 报名成功!<br/><br/>' + actInfo.description + `<br/>已报${registrationList.length}人<br/>`
    for (let i = 0; i < registrationList.length; i++) {
      let index = i + 1
      msg = msg + index + ' ' + registrationList[i] + '<br/>'
    }
  }

  if (/^取消$/i.test(text)) {
    msg = contact.name() + '取消成功'
  }

  if (/^活动$/i.test(text)) {
    msg = '报名啦！回复 报名 马上参加~<br/><br/>' + actInfo.description + `<br/>已报${registrationList.length}人<br/>`
    for (let i = 0; i < registrationList.length; i++) {
      let index = i + 1
      msg = msg + index + ' ' + registrationList[i] + '<br/>'
    }
  }

  if (/^帮助$/i.test(text)) {
    let keywords_base = {
      '【报名】': '报名活动1人',
      '【取消】': '取消报名1人',
      '【活动】': '查询活动详情'
    }
    msg = '回复括号内指令即可完成操作：\n--------------------------------\n'

    for (let key in keywords_base) {
      msg = msg + key + keywords_base[key] + '\n'
    }
  }
  return msg
}

bot.
on("scan", (qrcode, status) => {
    if (status === ScanStatus.Waiting && qrcode) {
      const qrcodeImageUrl = [
        'https://wechaty.js.org/qrcode/',
        encodeURIComponent(qrcode),
      ].join('')

      log.info("TestBot", `onScan: ${ScanStatus[status]}(${status}) - ${qrcodeImageUrl}`);

      require('qrcode-terminal').generate(qrcode, {
        small: true
      }) // show qrcode on console
    } else {
      log.info("TestBot", `onScan: ${ScanStatus[status]}(${status})`);
    }

  })
  .on("login", (user) => {
    log.info("TestBot", `${user} login`);
  })
  .on("logout", (user, reason) => {
    log.info("TestBot", `${user} logout, reason: ${reason}`);
  })
  .on("heartbeat", (data) => {

  })
  .on("ready", async () => {

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
    print('room', room)
    const user = {
      'wxid': contact.id,
      'gender': contact.gender(),
      'nickName': contact.name()
    }
    try {
      if (room && room.id) {
        print('room', '有roomowner信息')
        room_info = {
          roomid: room.id,
          topic: await room.topic()
        }
      } else {
        print('room', '没有roomowner信息')
        room_info = {
          roomid: '',
          nick: ''
        }
      }
    } catch (err) {
      console.error(err)
    }

    let payload = {
      user,
      room: room_info,
      text,
      create_time: new Date().getTime()
    }
    // console.debug(payload)
    payload = JSON.stringify(payload)
    payload = JSON.parse(payload)

    print('payload', payload)

    // 模拟后端返回
    // const msg = callServer(payload)
    // if (msg) {
    //     await message.say(msg)
    // }

    // 请求后端接口，后端接口开发完成前注释掉
    pub_msg(getEventsMsg('message', payload))

    // 1. send Image
    if (/^ding$/i.test(message.text())) {
      await message.say('dong')
    }
  })
  .on('room-join', async (room, inviteeList, inviter) => {
    const nameList = inviteeList.map(c => c.name()).join(',')
    console.log(`Room ${await room.topic()} got new member ${nameList}, invited by ${inviter}`)
    pub_msg(getEventsMsg('room-join', {
      room,
      inviteeList,
      inviter
    }))

    let msg = `欢迎@${nameList} 加入群~`
    room.say(msg)
  })
  .on("error", (error) => {
    log.error("TestBot", 'on error: ', error.stack);
    // pub_msg(getEventsMsg('error', { error }))
  })


bot
  .start()
  .then(() => {
    log.info("TestBot", "started.");
  });
