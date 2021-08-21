// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: 'test-958d13'
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
const {
  createHash
} = require('crypto');
// const { use } = require('puppeteer-extra')

// 消息类型码
const HEART_BEAT = 5005
const RECV_TXT_MSG = 1
const RECV_PIC_MSG = 3
const USER_LIST = 5000
const GET_USER_LIST_SUCCSESS = 5001
const GET_USER_LIST_FAIL = 5002
const TXT_MSG = 555
const PIC_MSG = 500
const AT_MSG = 550
const CHATROOM_MEMBER = 5010
const CHATROOM_MEMBER_NICK = 5020
const PERSONAL_INFO = 6500
const DEBUG_SWITCH = 6000
const PERSONAL_DETAIL = 6550
const DESTROY_ALL = 9999

let is_new_group = 1

// 生成时间戳ID
const getid = function () {
  return new Date().getTime()
}
// 活动报名信息拼接
const order_text = function (act, orders, msg) {
  let new_orders = []
  for (let i = 0; i < orders.length; i++) {
    if (orders[i].total_num == 0 || orders[i].total_num == 1) {
      new_orders.push(orders[i])
    } else {
      for (let j = 0; j < orders[i].total_num; j++) {
        let new_order = orders[i]
        new_order = JSON.parse(JSON.stringify(new_order))
        if (new_order.is_bench) {
          new_order.alias = new_order.alias || new_order.nick
        } else {
          new_order.alias = j == 0 ? (new_order.alias || new_order.nick) : ((new_order.alias || new_order.nick) + ' 挂' + j)
        }
        new_orders.push(new_order)
      }
    }
  }
  orders = new_orders
  act.decs = `${act.title}\n${act.location_name}\n限${act.maximum}人\n${act.deadline == 0 ? '' : '取消已报名必须提前' + act.deadline + '小时\n'}${act.remarks}`

  msg = msg + act.decs + '\n已报' + (orders.length <= act.maximum ? orders.length : act.maximum) + '/' + act.maximum + '人\n'

  for (let i = 0; i < orders.length; i++) {


    if (i < (act.maximum - 1)) {
      msg = msg + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + (orders[i].order_amount_text ? (orders[i].paid ? ' 【已付】' : (' 【待付' + orders[i].order_amount_text + '】')) : '') + '\n'
    } else if (i == (act.maximum - 1)) {
      msg = msg + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + (orders[i].order_amount_text ? (orders[i].paid ? ' 【已付】' : (' 【待付' + orders[i].order_amount_text + '】')) : '') + '\n' + '报名已满！\n'
    } else if (i == act.maximum) {
      msg = msg + '\n替补报名' + (orders.length - act.maximum) + '人:\n' + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + '\n'
    } else if (i == (orders.length - 1)) {
      msg = msg + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + '\n'
    } else {
      msg = msg + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + '\n'
    }

  }
  console.info(msg)
  return msg
}
// 时间格式化
const formatTime_md = timestamp => {
  var cur_date = new Date(timestamp)
  const year = cur_date.getFullYear()
  const month = cur_date.getMonth() + 1
  const date = cur_date.getDate()
  const hour = cur_date.getHours()
  const minute = cur_date.getMinutes()
  const second = cur_date.getSeconds()
  const day = cur_date.getDay()

  const start_timestamp = cur_date.setHours(0, 0, 0, 0)
  const end_timestamp = start_timestamp + 60 * 60 * 24 * 1000
  var weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
  var day_text = '周' + weeks_ch[day]
  let time_text = (hour < 10 ? ('0' + hour) : hour) + ':' + (minute < 10 ? ('0' + minute) : minute) + ':' + (second < 10 ? ('0' + second) : second)
  let ymd = month + '月' + date + '日'
  let tmdhms = year + '-' + month + '-' + date + ' ' + day_text + ' ' + time_text
  return [ymd, start_timestamp, end_timestamp, day_text, time_text, tmdhms]
}
// 生成响应消息
const get_req = (wxKey, msgType, msg, roomid, wxid) => {
  let time = new Date().getTime()

  if (msgType == 'Image') {
    // 1. send Image
    return {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": time,
      "name": "pubMessage",
      "params": {
        wxid,
        msg,
        roomid,
        wxKey,
        msgType
      }
    }
  } else if (msgType == 'Text') {
    // 2. send Text
    return {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": time,
      "name": "pubMessage",
      "params": {
        wxid,
        msg,
        roomid,
        wxKey,
        msgType
      }
    }
  } else if (msgType == 'Contact') {
    // 3. send Contact
    return {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": time,
      "name": "pubMessage",
      "params": {
        wxid,
        msg,
        roomid,
        wxKey,
        msgType
      }
    }
  } else if (msgType == 'UrlLink') {
    // 4. send UrlLink
    // {
    //   "description": "测试卡片",
    //   "thumbnailUrl": "http://mmbiz.qpic.cn/mmbiz_jpg/mLJaHznUd7O4HCW51IPGVarcVwAAAuofgAibUYIct2DBPERYIlibbuwthASJHPBfT9jpSJX4wfhGEBnqDvFHHQww/0",
    //   "title": "欢迎使用群组大师小程序",
    //   "url": "https://mp.weixin.qq.com/s/m6qbYo6eFR8RbIj25Xm4rQ"
    // }
    return {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": 1610430718000,
      "name": "pubMessage",
      "params": {
        wxid,
        msg,
        roomid,
        wxKey,
        msgType
      }
    }

  } else if (msgType == 'MiniProgram') {
    return {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": 1610430718000,
      "name": "pubMessage",
      "params": {
        wxid,
        msg,
        roomid,
        wxKey,
        msgType
      }
    }
  } else {
    return {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": 1610430718000,
      "name": "pubMessage",
      "params": {
        code: 200,
        'msg': 'success',
        data: ''
      }
    }

  }
}
// 获取会员信息
const get_member_info = async (roomid, wxid) => {
  let res = await db.collection('member').where({
    roomid,
    wxid,
    nick: _.exists(true)
  }).get()

  return res.data.length ? res.data[0] : {}
}
// 更新会员信息
const update_member = async (data) => {
  console.info('更新会员信息')
  // await db.collection('log').add({
  //   data
  // })
  let docid = data.room.roomid + '_' + data.user.wxid
  console.info(docid)
  return await db.collection('member').doc(docid).set({
    data: {
      roomid: data.room.roomid,
      wxid: data.user.wxid,
      nick: data.user.nickName,
      alias: data.alias,
      update_time: new Date().getTime(),
      avatar: data.user.avatar
    }
  })
}
// 更新或创建群组
const update_or_create_room = async (data) => {
  console.info('更新群组信息')
  let to = []
  let room_get = await db
    .collection('room')
    .where({
      _id: data.room.roomid
    })
    .get()

  let room_update_or_create = {}
  let room_data = data.room
  room_data.update_time = new Date().toLocaleString()
  if (room_get.data.length > 0) {
    room_update_or_create = await db.collection('room')
      .doc(data.room.roomid)
      .update({
        data: room_data
      })

    if (room_get.data[0].to) {
      to = room_get.data[0].to
    }

  } else {
    room_update_or_create = await db.collection('room')
      .doc(data.room.roomid)
      .set({
        data: room_data
      })
  }
  return [room_update_or_create, to]
}
// 查询群组是否存在
const get_is_new_group = async (data) => {
  let res = await db.collection('room').where({
    _id: data.room.roomid
  }).get()
  return res.data.length
}
// 获取活动信息
const get_act = async (data) => {
  let res = await db.collection('activity')
    .where({
      roomid: data.room.roomid,
      act_type: '活动',
      status: 0,
      is_active: true
    })
    .orderBy('start_time', 'asc')
    .orderBy('create_time', 'asc')
    .get()

  return res.data.length ? res.data[0] : {}
}
// 报名活动
const sign_in_act = async (act, member, add_num, is_bench, create_time) => {
  let ts = new Date().getTime()

  if (is_bench) {
    return await db.collection('order').add({
      data: {
        act_id: act._id,
        roomid: act.roomid,
        wxid: member.wxid,
        nick: member.nick,
        alias: member.alias,
        status: 0,
        total_num: add_num,
        update_time: ts,
        create_time,
        act_decs: act.decs,
        utc_time: formatTime_md(ts)[5],
        is_bench,
        member
      }
    })
  } else {
    let old_order = await get_cur_order(act, member)

    if (old_order._id) {
      return await update_sing_in(old_order, add_num)
    } else {
      return await db.collection('order').add({
        data: {
          act_id: act._id,
          roomid: act.roomid,
          wxid: member.wxid,
          nick: member.nick,
          alias: member.alias,
          status: 0,
          total_num: add_num,
          update_time: ts,
          create_time,
          act_decs: act.decs,
          utc_time: formatTime_md(ts)[5],
          is_bench,
          member
        }
      })
    }
  }


}
// 报名活动或替补
const sign_in_act2 = async (act, member, add_num, create_time) => {
  // 获取当前用户全部订单
  let cur_orders = await get_cur_all_orders(act, member)
  let cur_total_num = 0
  let msg = ''

  if (cur_orders.length) {
    for (let i = 0; i < cur_orders.length; i++) {
      cur_total_num = cur_total_num + cur_orders[i].total_num
    }
  }

  if (cur_total_num + add_num > (act.single_upper_limit || 9)) {
    msg = '名额超限，本活动限制每人累计最多报名' + (act.single_upper_limit || 9) + '人'
  } else {
    // 获取当前活动全部报名信息，计算总报名人数
    let total_num = await get_act_total_num(act)

    if (total_num >= act.maximum) { // 报名已满

      await sign_in_act(act, member, add_num, true, create_time)
      let orders = await get_act_orders(act)
      msg = '【替补报名】' + add_num + '人成功' + '!\n\n'
      msg = order_text(act, orders, msg)

    } else { //名额充足
      let bench_num = 0
      if (total_num + add_num > act.maximum) { // 判断报名是否超出最大可报人数
        bench_num = total_num + add_num - act.maximum
        await sign_in_act(act, member, bench_num, true, create_time)
        add_num = act.maximum - total_num
      }
      await sign_in_act(act, member, add_num, false, create_time)
      let orders = await get_act_orders(act)
      if (bench_num > 0) {
        msg = '报名' + add_num + '人,替补' + bench_num + '人成功' + '!\n\n'
      } else {
        msg = '报名' + add_num + '人成功' + '!\n\n'
      }
      msg = order_text(act, orders, msg)
    }
  }

  return msg

}
// 取消报名活动
const cancel_sign_in_act = async (act, cur_order, add_num, create_time) => {
  let res = ''
  let cancel_num = 0
  let new_adder = []
  if (cur_order.total_num > add_num) {
    res = await db.collection('order').doc(cur_order._id).update({
      data: {
        total_num: cur_order.total_num - add_num
      }
    })
    cancel_num = add_num
  } else {
    res = await db.collection('order').doc(cur_order._id).remove()
    cancel_num = cur_order.total_num
  }

  // 替补转正
  let res_benchs = await db.collection('order')
    .where({
      is_bench: true,
      act_id: cur_order.act_id
    })
    .orderBy('create_time', 'asc')
    .get()

  let benchs = res_benchs.data

  if (benchs.length > 0) {
    let new_add_num = cancel_num

    for (let key in benchs) {
      let res_member = await db
        .collection('member')
        .doc(act.roomid + '_' + benchs[key].wxid)
        .get()
      let member = res_member.data

      if (benchs[key].total_num <= new_add_num) {

        await sign_in_act(act, member, benchs[key].total_num, false, create_time)
        new_adder.push(member.wxid)
        let del_order = await db.collection('order')
          .doc(benchs[key]._id)
          .remove()

        new_add_num = new_add_num - benchs[key].total_num

        if (new_add_num == 0) {
          break
        }

      } else {

        await sign_in_act(act, member, new_add_num, false, create_time)
        new_adder.push(member.wxid)
        let update_order = await db
          .collection('order')
          .doc(benchs[key]._id)
          .update({
            data: {
              total_num: benchs[key].total_num - new_add_num
            }
          })

        break
      }

    }
  }

  return [cancel_num, new_adder]

}
// 取消报名或替补
const cancel_sign_in_act2 = async (act, cur_orders, add_num, create_time) => {
  let res = ''
  let cancel_num = 0
  let cancel_num_total = 0
  let new_adder = []
  let new_add_num_all = add_num

  for (let key in cur_orders) {
    let cur_order = cur_orders[key]

    if (cur_order.is_bench) {
      if (cur_order.total_num <= new_add_num_all) {
        await db.collection('order').doc(cur_order._id).remove()

        new_add_num_all = new_add_num_all - cur_order.total_num
        cancel_num_total = cancel_num_total + cur_order.total_num

        if (new_add_num_all == 0) {
          break
        }

      } else {
        await db.collection('order').doc(cur_order._id).update({
          data: {
            total_num: cur_order.total_num - new_add_num
          }
        })
        cancel_num_total = cancel_num_total + new_add_num
        new_add_num_all = 0
        break
      }
    } else {
      if (cur_order.total_num > new_add_num_all) {
        res = await db.collection('order').doc(cur_order._id).update({
          data: {
            total_num: cur_order.total_num - new_add_num_all
          }
        })
        cancel_num = new_add_num_all
        cancel_num_total = cancel_num_total + new_add_num_all

      } else {
        res = await db.collection('order').doc(cur_order._id).remove()
        cancel_num = cur_order.total_num
        cancel_num_total = cancel_num_total + cur_order.total_num
      }
    }
  }

  if (cancel_num > 0) {
    // 替补转正
    let res_benchs = await db.collection('order')
      .where({
        is_bench: true,
        act_id: act._id
      })
      .orderBy('create_time', 'asc')
      .get()

    let benchs = res_benchs.data

    if (benchs.length > 0) {

      let new_add_num = cancel_num

      for (let key in benchs) {
        let res_member = await db
          .collection('member')
          .doc(act.roomid + '_' + benchs[key].wxid)
          .get()
        let member = res_member.data

        if (benchs[key].total_num <= new_add_num) {

          await sign_in_act(act, member, benchs[key].total_num, false, create_time)
          new_adder.push(member.wxid)
          let del_order = await db.collection('order')
            .doc(benchs[key]._id)
            .remove()

          new_add_num = new_add_num - benchs[key].total_num

          if (new_add_num == 0) {
            break
          }

        } else {

          await sign_in_act(act, member, new_add_num, false, create_time)
          new_adder.push(member.wxid)
          let update_order = await db
            .collection('order')
            .doc(benchs[key]._id)
            .update({
              data: {
                total_num: benchs[key].total_num - new_add_num
              }
            })

          break
        }

      }
    }
  }


  return [cancel_num, new_adder, cancel_num_total]

}
// 替补转正
const bench_sign_in_act = async (act, add_num, create_time) => {
  let res = ''
  let cancel_num = add_num
  let new_adder = []
  // 替补转正
  let res_benchs = await db.collection('order')
    .where({
      is_bench: true,
      act_id: act._id
    })
    .orderBy('create_time', 'asc')
    .get()

  let benchs = res_benchs.data

  if (benchs.length > 0) {
    let new_add_num = cancel_num

    for (let key in benchs) {
      let res_member = await db
        .collection('member')
        .doc(act.roomid + '_' + benchs[key].wxid)
        .get()
      let member = res_member.data

      if (benchs[key].total_num <= new_add_num) {

        await sign_in_act(act, member, benchs[key].total_num, false, create_time)
        new_adder.push(member.wxid)
        let del_order = await db.collection('order')
          .doc(benchs[key]._id)
          .remove()

        new_add_num = new_add_num - benchs[key].total_num

        if (new_add_num == 0) {
          break
        }

      } else {

        await sign_in_act(act, member, new_add_num, false, create_time)
        new_adder.push(member.wxid)
        let update_order = await db
          .collection('order')
          .doc(benchs[key]._id)
          .update({
            data: {
              total_num: benchs[key].total_num - new_add_num
            }
          })

        break
      }

    }
  }

  return [cancel_num, new_adder]

}
// 更新报名信息
const update_sing_in = async (cur_order, add_num) => {
  return await db.collection('order').doc(cur_order._id).update({
    data: {
      total_num: cur_order.total_num + add_num
    }
  })
}
// 取消替补报名
const cancel_bench = async (cur_bench_orders, add_num) => {
  let new_add_num = add_num

  for (let key in cur_bench_orders) {
    if (cur_bench_orders[key].total_num <= new_add_num) {
      await db.collection('order').doc(cur_bench_orders[key]._id).remove()

      new_add_num = new_add_num - cur_bench_orders[key].total_num
      if (new_add_num == 0) {
        break
      }

    } else {
      await db.collection('order').doc(cur_bench_orders[key]._id).update({
        data: {
          total_num: cur_bench_orders[key].total_num - new_add_num
        }
      })
      new_add_num = 0
      break
    }
  }

  return add_num - new_add_num

}
// 获取全部订单
const get_act_orders = async (act) => {
  let res = await db.collection('order').where({
    act_id: act._id
  })
    .orderBy('is_bench', 'asc')
    .orderBy('create_time', 'asc')
    .get()
  return res.data
}
// 获取活动报名人数
const get_act_total_num = async (act) => {
  let res = await db
    .collection('order')
    .aggregate()
    .match({
      act_id: act._id,
      is_bench: false
    })
    .group({
      _id: null,
      total_num: $.sum('$total_num')
    })
    .end()
  return res.list.length > 0 ? res.list[0].total_num : 0
}
// 获取当前用户订单
const get_cur_order = async (act, member) => {
  let res = await db.collection('order').where({
    act_id: act._id,
    wxid: member.wxid,
    is_bench: false
  }).get()
  return res.data.length ? res.data[0] : {}
}
// 获取当前用户订单
const get_cur_all_orders = async (act, member) => {
  let res = await db.collection('order')
    .where({
      act_id: act._id,
      wxid: member.wxid
    })
    .orderBy('create_time', 'desc')
    .get()
  return res.data
}
// 获取当前用户替补订单
const get_cur_bench_order = async (act, member) => {
  let res = await db.collection('order').where({
    act_id: act._id,
    wxid: member.wxid,
    is_bench: true
  }).orderBy('create_time', 'desc').get()
  return res.data
}
// 更新或创建用户
const update_or_create_user = async (data) => {
  console.info('更新用户信息')
  return await db
    .collection('wx_user')
    .doc(data.user.wxid)
    .set({
      data: data.user
    })
}
// 创建活动
const create_act = async (data) => {

  let decs = data.text
  let maximum = 0
  let ts = data.create_time + 8 * 60 * 60 * 1000
  let contact_info = {}
  contact_info.cellphone = data.timenlp.phone_list && data.timenlp.phone_list.length ? data.timenlp.phone_list[0] : ''
  contact_info.name = data.user.nickName
  let _id = data.room.roomid + '-' + data.user.wxid
  await db.collection('activity').doc(_id).set({
    data: {
      contact_info,
      roomid: data.room.roomid,
      roomnick: data.room.nick,
      ownerid: data.room.ownerid,
      act_type: data.type,
      status: 0,
      is_active: true,
      decs,
      create_time: data.create_time,
      maximum,
      act_mode: 'simple',
      utc_time: formatTime_md(ts)[5],
      nickName: data.user.nickName,
      wxid: data.user.wxid,
      timenlp: data.timenlp,
      data
    }
  })
  await db.collection('log').add({
    data: {
      type: data.type,
      msg: {
        contact_info,
        roomid: data.room.roomid,
        roomnick: data.room.nick,
        ownerid: data.room.ownerid,
        act_type: data.type,
        status: 0,
        is_active: true,
        decs,
        create_time: data.create_time,
        maximum,
        act_mode: 'simple',
        utc_time: formatTime_md(ts)[5],
        nickName: data.user.nickName,
        wxid: data.user.wxid,
        timenlp: data.timenlp,
        data
      }
    }
  })

  console.info('新创建活动成功')
}


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.info('event------------------------------------------------')
  console.info(event)
  console.info('requestContext------------------------------------------------')
  console.info(event.requestContext)

  let {
    action,
    act_data,
    act_id,
    requestContext,
    queryStringParameters,
    pathParameters,
    body
  } = event
  let wxKey = pathParameters.wxKey
  let to = []
  let def_req = {
    code: 200,
    'msg': 'success',
    data: {}
  }
  let req = {}

  if (requestContext.httpMethod == 'POST') {

    body = JSON.parse(body)
    console.info('body', body)

    if (body.events && body.events['room-join'] && ['ledongmao'].includes(wxKey)) {
      let join_in_info = body.events['room-join']
      let inviteeList = join_in_info.inviteeList
      let atUserIdList = []

      for (let user in inviteeList) {
        let data = {}
        data.room = {
          roomid: join_in_info.room.id
        }
        data.user = inviteeList[user].payload
        data.user.wxid = data.user.id
        data.user.nickName = data.user.name
        data.alias = ''
        // 更新会员信息
        await update_member(data)
        atUserIdList.push(data.user.id)
      }

      let res_white_list = await db.collection('room').where({
        roomid: join_in_info.room.id,
        is_vip: true,
        boot_open: true
      }).count()

      if (res_white_list.total > 0) {
        let welcome_info = '欢迎加入，回复<帮助>二字获取指令集，快速学习如何参加群内活动；回复<绑定>可激活进入小程序查看历史活动~'
        let welcome = get_req(wxKey, 'Text', welcome_info, join_in_info.room.id, atUserIdList)
        return welcome
      }
    }

    if (body.events && body.events.message && ['ledongmao'].includes(wxKey)) {
      let data = body.events.message

      // 更新或创建用户
      await update_or_create_user(data)

      if (data.room && data.room.roomid) {
        // is_new_group = await get_is_new_group(data)

        // 更新群组信息
        let res_update_or_create_room = await update_or_create_room(data)
        to = res_update_or_create_room[1]
        console.info('待转发的群', to)

        // 更新会员信息
        await update_member(data)

        // if (data.room.announce && data.room.announce.length > 6 && data.room.announce.replace(/\s*/g, "").slice(0, 4) == '活动限【') {
        //   await create_act(data)
        // } else {
        //   console.info('公告内容不符合活动发布要求或无公告')
        // }

        if (data.type == "车找人" || data.type == "人找车") {
          await create_act(data)
        } else {
          console.info('不包含顺风车信息~')
        }
      }

      let cur_time = new Date().getTime()
      let room = data.room
      let user = data.user
      let wxid = data.user.wxid
      let roomid = data.room.roomid
      let nick = data.alias || data.user.nickName
      let content = data.text
      let text = data.text
      let create_time = data.create_time
      let member = {
        _id: roomid + '_' + wxid,
        roomid,
        nick: data.user.nickName,
        gender: data.user.gender,
        wxid,
        alias: data.alias,
        avatar: data.user.avatar || ''
      }

      let res_white_list = await db.collection('room').where({
        roomid,
        is_vip: true,
        boot_open: true
      }).count()

      if (res_white_list.total == 0) {
        content = '群不在白名单中或未开启机器人功能...'
      }


      let msg = ''

      if (content.replace(/\s*/g, "").slice(0, 2) == '代@' && content.replace(/\s*/g, "").slice(-2) == '取消' && room.ownerid == wxid) {
        nick = content.replace(/\s*/g, "").slice(2).slice(0, -2).replace(/^\s*|\s*$/g, "")
        let member_info = await db.collection('member').where(_.or({
          nick,
          roomid
        }, {
          alias: nick,
          roomid
        })).get()
        console.debug(member_info)
        if (member_info.data.length > 0) {
          member = member_info.data[0]
          let add_num = 1
          let act = await get_act(data)

          if (!act._id) {
            msg = "群内无可报名活动，可查看历史活动https://mp.weixin.qq.com/s/m6qbYo6eFR8RbIj25Xm4rQ"

          } else {

            let cur_orders = await get_cur_all_orders(act, member)

            if (cur_orders.length) {

              let cancel_num = await cancel_sign_in_act2(act, cur_orders, add_num, create_time)

              // 获取全部订单
              let orders = await get_act_orders(act)

              if (cancel_num[1].length) {
                msg = '【 ' + nick + '】取消' + cancel_num[2] + '人成功,替补转正!\n\n'
                msg = order_text(act, orders, msg)
                let atUserIdList = cancel_num[1]
                atUserIdList.push(cur_orders[0].wxid)
                req = get_req(wxKey, 'Text', msg, roomid, atUserIdList)
              } else {
                msg = '【' + nick + '】取消' + cancel_num[2] + '人成功!\n\n'
                msg = order_text(act, orders, msg)
                req = get_req(wxKey, 'Text', msg, roomid, member.wxid)
              }

            } else {
              msg = nick + ' 未报名活动'
              req = get_req(wxKey, 'Text', msg, roomid, wxid)
            }

          }
        } else {
          msg = nick + ' 未报名活动'
          req = get_req(wxKey, 'Text', msg, roomid, wxid)
        }
      } else if (content.replace(/\s*/g, "").slice(0, 2) == '代@' && (content.replace(/\s*/g, "").slice(-2) == '取消' || content.replace(/\s*/g, "").slice(-2) == '报名') && room.ownerid != wxid) {
        msg = '不要淘气，只有群主可以代报名/取消哦~'
        req = get_req(wxKey, 'Text', msg, roomid, wxid)
      } else if (content.replace(/\s*/g, "").slice(0, 4) == '@大师加' && content.replace(/\s*/g, "").slice(-2) == '名额' && room.ownerid == wxid) {

        let more_num = Number(content.replace(/\s*/g, "").slice(4, 5))
        let act = await get_act(data)
        if (!act._id) { //no act is active
          msg = "群内没有可报名/调整的活动，点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动"
          req = get_req(wxKey, 'Text', msg, roomid, wxid)
        } else {

          let update_act_maximum = await db.collection('activity').doc(act._id).update({
            data: {
              maximum: act.maximum + more_num
            }
          })

          act.maximum = act.maximum + more_num

          let cancel_num = await bench_sign_in_act(act, more_num, create_time)
          // 获取全部订单
          let orders = await get_act_orders(act)

          if (cancel_num[1].length) {
            msg = '活动新增' + cancel_num[0] + '个名额,替补转正!\n\n'
            msg = order_text(act, orders, msg)

            let atUserIdList = cancel_num[1]
            // atUserIdList.push(wxid)
            req = get_req(wxKey, 'Text', msg, roomid, atUserIdList)
          } else {
            msg = '@所有人 活动新增' + cancel_num[0] + '个名额!\n\n'

            msg = order_text(act, orders, msg)
            req = get_req(wxKey, 'Text', msg, roomid, wxid)
          }

        }
      } else if (content.replace(/\s*/g, "").slice(0, 2) == '代@' && content.replace(/\s*/g, "").slice(-2) == '报名' && room.ownerid == wxid) {
        nick = content.replace(/\s*/g, "").slice(2).slice(0, -2).replace(/^\s*|\s*$/g, "")
        let member_info = await db.collection('member').where(_.or({
          nick,
          roomid
        }, {
          alias: nick,
          roomid
        })).get()
        console.debug(member_info)
        if (member_info.data.length > 0) {
          member = member_info.data[0]
          let add_num = 1
          // 查询俱乐部活动信息
          let act = await get_act(data)
          if (!act._id) { //no act is active
            msg = "群内没有可报名的活动，点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动"
          } else { //have active act
            msg = await sign_in_act2(act, member, add_num, create_time)
          }
          req = get_req(wxKey, 'Text', msg, roomid, member.wxid)
        } else {
          msg = nick + ' 未查询到该成员'
          req = get_req(wxKey, 'Text', msg, roomid, wxid)
        }
      } else if ((/报名\d人成功!/g.test(content.replace(/\s*/g, "")) || /取消\d人成功!/g.test(content.replace(/\s*/g, ""))) && !['wxid_0o1t51l3f57221',].includes(wxid)) {
        msg = '复制粘贴报名无效！请直接回复 报名 或 报名2人 完成报名~'
        req = get_req(wxKey, 'Text', msg, roomid, wxid)
      } else if (content.replace(/\s*/g, "") == '帮助') {
        let keywords_base = {
          '【报名】': '报名活动1人',
          '【取消】': '取消报名1人',
          // '【替补】': '替补报名',
          // '【取消替补】': '取消替补报名',
          '【报名2人】': '报名2人',
          '【取消2人】': '取消2人报名',
          '【活动】': '查询活动详情',
          '【绑定】': '会员信息同步到小程序'
          // '<签到>': '活动签到',
          // '#加入': '加入俱乐部',
          // '#活动结束': '结束当前活动',
          // '#报名开启': '恢复活动报名',
          // '#活动模板': '获取发布活动模板',
        }
        let keywords_e = {
          // '#创建俱乐部': '群关联为俱乐部',
          // '#关闭': '禁言超小哥',
          // '#开启': '恢复超小哥发言',
          // '#找车': '获取群内[顺风车]信息',
          // '#找人': '获取群内[搭车人]信息',
          // '#取消行程': '删除本人发布的信息',
        }
        msg = '回复括号内指令即可完成操作：\n--------------------------------\n'

        for (let key in keywords_base) {
          msg = msg + key + keywords_base[key] + '\n'
        }
        // msg = msg + '----------------\n拓展功能：\n'
        // for (let key in keywords_e) {
        //   msg = msg + key + ' ' + keywords_e[key] + '\n'
        // }
        msg = msg + '--------------------------------\n点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动'

        req = get_req(wxKey, 'Text', msg, roomid, '')

      } else if (content.replace(/\s*/g, "") == '绑定') {
        let hash = createHash('sha256');
        hash.update(`${user.nickName}${user.gender}`);
        let user_hash = hash.digest('hex')
        console.log(user_hash);
        let card = {
          appid: "wx36027ed8c62f675e",
          description: `@${user.nickName}专属绑定激活卡片`,
          title: `@${user.nickName}专属绑定激活卡片`,
          pagePath: `pages/start/relatedlist/index.html?wxid=${wxid}&uuid=${wxid}&user_hash=${user_hash}`,
          thumbKey: undefined,
          thumbUrl: user.avatar.remoteUrl, // 推荐在 200K 以内，比例 5：4，宽度不大于 1080px
          username: "gh_6c52e2baeb2d@app"
        }

        //   const miniProgramPayload = {
        //     appid: "wx36027ed8c62f675e",
        //     description: "群组大师群管理工具",
        //     title: "活动报名自动化管理助手~",
        //     pagePath: "pages/start/relatedlist/index.html",
        //     thumbKey: undefined,
        //     thumbUrl: "http://mmbiz.qpic.cn/mmbiz_jpg/mLJaHznUd7O4HCW51IPGVarcVwAAAuofgAibUYIct2DBPERYIlibbuwthASJHPBfT9jpSJX4wfhGEBnqDvFHHQww/0", // 推荐在 200K 以内，比例 5：4，宽度不大于 1080px
        //     username: "gh_6c52e2baeb2d@app"
        // };

        let info_card = get_req(wxKey, 'MiniProgram', card, roomid, wxid)
        return info_card
      } else if (content.replace(/\s*/g, "") == '群组大师') {
        let hash = createHash('sha256');
        hash.update(`${user.nickName}${user.gender}`);
        let user_hash = hash.digest('hex')
        console.log(user_hash);
        let card = {
          appid: "wx36027ed8c62f675e",
          description: `@${user.nickName}专属卡片`,
          title: `@${user.nickName}专属卡片`,
          pagePath: `pages/start/relatedlist/index.html?wxid=${wxid}&uuid=${wxid}&user_hash=${user_hash}`,
          thumbKey: undefined,
          thumbUrl: user.avatar.remoteUrl, // 推荐在 200K 以内，比例 5：4，宽度不大于 1080px
          username: "gh_6c52e2baeb2d@app"
        }

        //   const miniProgramPayload = {
        //     appid: "wx36027ed8c62f675e",
        //     description: "群组大师群管理工具",
        //     title: "活动报名自动化管理助手~",
        //     pagePath: "pages/start/relatedlist/index.html",
        //     thumbKey: undefined,
        //     thumbUrl: "http://mmbiz.qpic.cn/mmbiz_jpg/mLJaHznUd7O4HCW51IPGVarcVwAAAuofgAibUYIct2DBPERYIlibbuwthASJHPBfT9jpSJX4wfhGEBnqDvFHHQww/0", // 推荐在 200K 以内，比例 5：4，宽度不大于 1080px
        //     username: "gh_6c52e2baeb2d@app"
        // };

        let info_card = get_req(wxKey, 'MiniProgram', card, roomid, wxid)
        return info_card
      } else if (content.replace(/\s*/g, "") == '查看' || content.replace(/\s*/g, "") == '活动') {
        // 查看活动
        let act = await get_act(data)
        if (act._id) {
          let orders = await get_act_orders(act)
          msg = '报名啦！回复 报名 马上参加~\n\n'
          msg = order_text(act, orders, msg)
          req = get_req(wxKey, 'Text', msg, roomid, '')

        } else {
          msg = "群内没有可报名活动，点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动"
          req = get_req(wxKey, 'Text', msg, roomid, wxid)

        }

      } else if (['报名', '报名活动', '参加', '打卡', '签到'].includes(content.replace(/\s*/g, "")) || /^报名\d人/g.test(content.replace(/\s*/g, ""))) {

        let add_num = 0
        if (['报名', '报名活动', '参加', '打卡', '签到'].includes(content.replace(/\s*/g, ""))) {
          add_num = 1
        } else {
          add_num = Number(content.replace(/\s*/g, "").slice(2, 3))
        }


        if (add_num < 3) {
          // 查询俱乐部活动信息
          let act = await get_act(data)
          if (!act._id) {
            msg = "群内没有可报名的活动，点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动"
          } else {

            msg = await sign_in_act2(act, member, add_num, create_time)

            // // 获取当前活动全部报名信息，计算总报名人数
            // let total_num = await get_act_total_num(act)
            // if (total_num >= act.maximum) { // 报名已满

            //   let cur_orders = await get_cur_all_orders(act, member)

            //   let cur_total_num = 0

            //   if (cur_orders.length) {
            //     for (let i = 0; i < cur_orders.length; i++) {
            //       cur_total_num = cur_total_num + cur_orders[i].total_num
            //     }
            //   }

            //   if (cur_total_num + add_num > (act.single_upper_limit || 9)) {
            //     msg = '名额超限，本活动限制每人累计最多报名' + (act.single_upper_limit || 9) + '人'
            //   } else {
            //     await sign_in_act(act, member, add_num, true, create_time)
            //     let orders = await get_act_orders(act)
            //     msg = '【替补报名】' + add_num + '人成功' + '!\n\n'
            //     msg = order_text(act, orders, msg)
            //   }

            // } else if (total_num + add_num > act.maximum) { // 判断报名是否超出最大可报人数
            //   msg = '名额不足，剩余名额' + (act.maximum - total_num) + '人'
            // } else { //名额充足
            //   // 获取当前用户报名信息
            //   let cur_order = await get_cur_order(act, member)
            //   let cur_num = 0
            //   if (cur_order._id) {
            //     cur_num = cur_order.total_num
            //   }

            //   if (cur_num + add_num > (act.single_upper_limit || 9)) {
            //     msg = '名额超限，本活动限制每人累计最多报名' + (act.single_upper_limit || 9) + '人'
            //   } else {
            //     await sign_in_act(act, member, add_num, false, create_time)

            //     let orders = await get_act_orders(act)
            //     msg = '报名' + add_num + '人成功' + '!\n\n'
            //     msg = order_text(act, orders, msg)
            //   }



            // }

          }
        } else {
          msg = '名额超限，一次回复最多报2人，可多次回复'
        }
        req = get_req(wxKey, 'Text', msg, roomid, wxid)



      } else if (['取消', '取消报名', '报名取消', '取消参加'].includes(content.replace(/\s*/g, "")) || /^取消\d人/g.test(content.replace(/\s*/g, ""))) {
        let add_num = 0
        if (['取消', '取消报名', '报名取消', '取消参加'].includes(content.replace(/\s*/g, ""))) {
          add_num = 1
        } else {
          add_num = Number(content.replace(/\s*/g, "").slice(2, 3))
        }

        let act = await get_act(data)


        if (!act._id) {
          msg = "群内没有可取消报名的活动，点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动"
          req = get_req(wxKey, 'Text', msg, roomid, wxid)


        } else {

          if (act.close_time && create_time > act.close_time) {
            msg = '已超出最后取消报名时间，无法取消报名'
            req = get_req(wxKey, 'Text', msg, roomid, wxid)

          } else {


            let cur_orders = await get_cur_all_orders(act, member)

            if (cur_orders.length > 0) {

              let cancel_num = await cancel_sign_in_act2(act, cur_orders, add_num, create_time)

              // 获取全部订单
              let orders = await get_act_orders(act)

              if (cancel_num[1].length) {
                msg = '【 ' + nick + '】取消' + cancel_num[2] + '人成功,替补转正!\n\n'
                msg = order_text(act, orders, msg)
                let atUserIdList = cancel_num[1]
                atUserIdList.push(cur_orders[0].wxid)
                req = get_req(wxKey, 'Text', msg, roomid, atUserIdList)
              } else {
                msg = '【' + nick + '】取消' + cancel_num[2] + '人成功!\n\n'
                msg = order_text(act, orders, msg)
                req = get_req(wxKey, 'Text', msg, roomid, member.wxid)
              }

            } else {
              msg = '未报名活动'
              req = get_req(wxKey, 'Text', msg, roomid, wxid)
            }

          }

        }

      } else if (content.replace(/\s*/g, "") == '替补' || /^替补\d人/g.test(content.replace(/\s*/g, ""))) {
        let add_num = 0
        if (content.replace(/\s*/g, "") == '替补') {
          add_num = 1
        } else {
          add_num = Number(content.replace(/\s*/g, "").slice(2, 3))
        }
        let act = await get_act(data)

        if (add_num < 3) {
          if (!act._id) {
            msg = "群内没有可报名的活动，点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动"

          } else {

            let total_num = await get_act_total_num(act)
            if (total_num >= act.maximum) {

              let res_cur_orders = await db.collection('order')
                .where({
                  act_id: act._id,
                  wxid: member.wxid
                })
                .get()

              let cur_orders = res_cur_orders.data

              let cur_total_num = 0

              if (cur_orders.length) {
                for (let i = 0; i < cur_orders.length; i++) {
                  cur_total_num = cur_total_num + cur_orders[i].total_num
                }
              }

              if (cur_total_num + add_num > (act.single_upper_limit || 9)) {
                msg = '名额超限，本活动限制每人累计最多报名' + (act.single_upper_limit || 9) + '人'
              } else {
                await sign_in_act(act, member, add_num, true, create_time)
                let orders = await get_act_orders(act)
                msg = '替补报名' + add_num + '人成功' + '!\n\n'
                msg = order_text(act, orders, msg)
              }

            } else {
              // 还有剩余名额
              msg = "还有" + (act.maximum - total_num) + '个名额，可直接<报名>'
            }

          }
        } else {
          msg = '名额超限，一次回复最多报2人，可多次回复'
        }

        req = get_req(wxKey, 'Text', msg, roomid, wxid)

      } else if (content.replace(/\s*/g, "") == '取消替补' || /^取消替补\d人/g.test(content.replace(/\s*/g, ""))) {
        let add_num = 0
        if (content.replace(/\s*/g, "") == '取消替补') {
          add_num = 1
        } else {
          add_num = Number(content.replace(/\s*/g, "").slice(4, 5))
        }

        let act = await get_act(data)

        if (!act._id) {
          msg = "群内没有可取消报名的活动，点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动"

        } else {

          let cur_bench_orders = await get_cur_bench_order(act, member)

          if (cur_bench_orders.length) {
            let cancel_num = await cancel_bench(cur_bench_orders, add_num)

            let orders = await get_act_orders(act)
            msg = '取消替补' + cancel_num + '人成功' + '!\n\n'
            msg = order_text(act, orders, msg)

          } else {
            msg = '未报名替补'

          }

        }
        req = get_req(wxKey, 'Text', msg, roomid, wxid)

      } else if (content.replace(/\s*/g, "") == '签到x' || content.replace(/\s*/g, "") == '打卡x') {

        let member = await get_member_info(roomid, wxid)

        let act = await get_act(data)

        if (!act._id) {
          msg = '群内没有签到中的活动，点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动'

        } else {
          let cur_order = await get_cur_order(act, member)

          if (cur_order._id) {

            if (cur_order.signin) {
              msg = "无需重复签到"

            } else {

              let del_cur_order = await db.collection('order').doc(cur_order._id).update({
                data: {
                  signin: true
                }
              })

              let orders = await get_act_orders(act)

              // console.debug('订单+++++++++++++++', orders)

              msg = '签到' + '成功!\n\n'

              msg = order_text(act, orders, msg)

            }

          } else {
            msg = '未报名活动'

          }

        }
        req = get_req(wxKey, 'Text', msg, roomid, wxid)

      } else if (content == '取消行程') {
        // 删除车找人信息

        let del_acts = await db.collection('activity').where(_.or([{
          roomid,
          wxid,
          start_time: _.gt(new Date().getTime()),
          act_type: '人找车'
        }, {
          roomid,
          wxid,
          start_time: _.gt(new Date().getTime()),
          act_type: '车找人'
        }])).get()

        if (del_acts.data.length > 0) {
          let del_act = await db.collection('activity').where(_.or([{
            roomid,
            wxid,
            start_time: _.gt(new Date().getTime()),
            act_type: '人找车'
          }, {
            roomid,
            wxid,
            start_time: _.gt(new Date().getTime()),
            act_type: '车找人'
          }])).remove()
          req = {
            "code": 200,
            "data": {
              "id": "20210304231703",
              "type": 555,
              "content": "你的行程信息已删除",
              "wxid": roomid
            }
          }
        } else {
          req = {
            "code": 200,
            "data": {
              "id": "20210304231703",
              "type": 555,
              "content": "24小时内您没有发布过行程信息",
              "wxid": roomid
            }
          }
        }

      } else if (wxid == 'gh_3dfda90e39d6') {
        let pay_order_res = await db.collection('order')
          .where({
            order_amount_text: content.replace(/\s*/g, ""),
            paid: false
          })
          .get()
        if (pay_order_res.data.length) {
          let pay_order = pay_order_res.data[0]

          let update_order_res = await db.collection('order')
            .doc(pay_order._id)
            .update({
              data: {
                paid: true
              }
            })

          msg = '【' + (pay_order.alias || pay_order.nick) + '】已完成活动缴费' + content.replace(/\s*/g, "")
          req = get_req(wxKey, 'Text', msg, pay_order.roomid, pay_order.wxid)

        } else {
          msg = '收到款项但未匹配到订单\n金额' + content.replace(/\s*/g, "")
          req = get_req(wxKey, 'Text', msg, '', 'tyutluyc')
        }

      } else if (wxid != 'wxid_0o1t51l3f57221' && to.length) {

        msg = text
        req = get_req(wxKey, 'Text', msg, to[0], '')

      } else {
        // 不在指令范围
        req = {
          code: 200,
          'msg': 'all消息',
          data: {
            is_new_group
          },
          queryStringParameters
        }
      }


    } else if (body.events.ready) {
      let msg = body.events.ready
      let contactList = msg.contactList
      console.info('contactList-------------', contactList.length)
      let friend_contactList = []
      for (let contact in contactList) {
        if (contactList[contact].payload.friend) {
          friend_contactList.push(contactList[contact])
        }
      }
      console.info('friend_contactList-------------', friend_contactList.length)

      msg.contactList = friend_contactList
      msg.last_login = new Date().getTime()
      let bot_res = await db.collection('bot').doc(wxKey).update({
        data: msg
      })
    } else {
      def_req.data.wxKey = wxKey
      def_req.data.events = Object.keys(body.events)
      req = def_req
    }

    let res = await db.collection('log').add({
      data: {
        wxKey,
        msg: body
      }
    })

  } else {
    console.info
    req = def_req
    req.data = event
  }
  return req
}