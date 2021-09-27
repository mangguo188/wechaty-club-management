// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

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
          new_order.nickName = new_order.nickName
        } else {
          new_order.nickName = j == 0 ? new_order.nickName : ((new_order.nickName) + ' 挂' + j)
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
      msg = msg + String(i + 1) + '. ' + orders[i].nickName + '\n'
    } else if (i == (act.maximum - 1)) {
      msg = msg + String(i + 1) + '. ' + orders[i].nickName + '\n' + '报名已满！\n'
    } else if (i == act.maximum) {
      msg = msg + '\n替补报名' + (orders.length - act.maximum) + '人:\n' + String(i + 1) + '. ' + (orders[i].alias || orders[i].nickName) + '\n'
    } else if (i == (orders.length - 1)) {
      msg = msg + String(i + 1) + '. ' + orders[i].nickName + '\n'
    } else {
      msg = msg + String(i + 1) + '. ' + orders[i].nickName + '\n'
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
// 更新会员信息
const update_member = async (data) => {
  console.info('更新会员信息')
  let docid = data.room.roomid + '_' + data.user.wxid
  console.info(docid)
  return await db.collection('member').doc(docid).set({
    data: {
      roomid: data.room.roomid,
      wxid: data.user.wxid,
      nickName: data.user.nickName,
      update_time: new Date().getTime()
    }
  })
}
// 更新或创建群组
const update_or_create_room = async (data) => {
  console.info('更新群组信息')
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

  } else {
    room_update_or_create = await db.collection('room')
      .doc(data.room.roomid)
      .set({
        data: room_data
      })
  }
  return room_update_or_create
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
        nickName: member.nickName,
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
          nickName: member.nickName,
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
// 取消报名或替补
const cancel_sign_in_act = async (act, cur_orders, add_num, create_time) => {
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
// 更新报名信息
const update_sing_in = async (cur_order, add_num) => {
  return await db.collection('order').doc(cur_order._id).update({
    data: {
      total_num: cur_order.total_num + add_num
    }
  })
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

    if (body.events && body.events.message) {
      let data = body.events.message

      // message消息示例
      //   {
      //     "user":{
      //         "wxid":"xxxx",
      //         "gender":2,
      //         "nickName":"xxx"
      //     },
      //     "room":{
      //         "roomid":"xxx",
      //         "topic":"xxx"
      //     },
      //     "text":"xxxx",
      //     "create_time":1111111
      // }

      if (data.room && data.room.roomid) {
        // 更新群组信息
        await update_or_create_room(data)

        // 更新会员信息
        await update_member(data)
      }

      let cur_time = new Date().getTime()
      let room = data.room
      let user = data.user
      let wxid = data.user.wxid
      let roomid = data.room.roomid
      let nickName = data.user.nickName
      let content = data.text
      let create_time = data.create_time
      let member = {
        _id: roomid + '_' + wxid,
        roomid,
        nickName: data.user.nickName,
        gender: data.user.gender,
        wxid
      }

      let msg = ''

      if (content.replace(/\s*/g, "") == '帮助') {
        let keywords_base = {
          '【报名】': '报名活动1人',
          '【取消】': '取消报名1人',
          '【活动】': '查询活动详情'
        }
        msg = '回复括号内指令即可完成操作：\n--------------------------------\n'

        for (let key in keywords_base) {
          msg = msg + key + keywords_base[key] + '\n'
        }
        req = get_req(wxKey, 'Text', msg, roomid, '')

      } else if (content.replace(/\s*/g, "") == '查看' || content.replace(/\s*/g, "") == '活动') {
        // 查看活动
        let act = await get_act(data)
        if (act._id) {
          let orders = await get_act_orders(act)
          msg = '报名啦！回复 报名 马上参加~\n\n'
          msg = order_text(act, orders, msg)
          req = get_req(wxKey, 'Text', msg, roomid, '')

        } else {
          msg = "群内没有可报名活动"
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

              let cancel_num = await cancel_sign_in_act(act, cur_orders, add_num, create_time)

              // 获取全部订单
              let orders = await get_act_orders(act)

              if (cancel_num[1].length) {
                msg = '【 ' + nickName + '】取消' + cancel_num[2] + '人成功,替补转正!\n\n'
                msg = order_text(act, orders, msg)
                let atUserIdList = cancel_num[1]
                atUserIdList.push(cur_orders[0].wxid)
                req = get_req(wxKey, 'Text', msg, roomid, atUserIdList)
              } else {
                msg = '【' + nickName + '】取消' + cancel_num[2] + '人成功!\n\n'
                msg = order_text(act, orders, msg)
                req = get_req(wxKey, 'Text', msg, roomid, member.wxid)
              }

            } else {
              msg = '未报名活动'
              req = get_req(wxKey, 'Text', msg, roomid, wxid)
            }

          }

        }

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
    } else {
      // 不是微信消息
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
    // 非post请求，返回错误信息
    console.info
    req = def_req
    req.data = event
  }
  return req
}