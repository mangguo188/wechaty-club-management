// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: 'cloud1-9g9f1jcs9740dca9'})

const db = cloud.database()
const _ = db.command

const get_list = (obj_list, key) => {
  var key_list = []
  var list = []
  for (var i = 0; i < obj_list.length; i++) {
    // console.debug(obj_list[i][key])
    if (obj_list[i][key]) {
      key_list.push(obj_list[i][key])
      list.push(obj_list[i])
    }
  }
  return [key_list, list]
}

// 活动报名信息拼接
const order_text = async function (act, msg) {

  let res = await db.collection('order').where({
      act_id: act._id
    })
    .orderBy('is_bench', 'asc')
    .orderBy('create_time', 'asc')
    .get()

  let orders = res.data

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
      msg = msg + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + (orders[i].signin ? ' 已签到' : '') + '\n'
    } else if (i == (act.maximum - 1)) {
      msg = msg + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + (orders[i].signin ? ' 已签到' : '') + '\n' + '报名已满！\n'
    } else if (i == act.maximum) {
      msg = msg + '替补报名' + (orders.length - act.maximum) + '人:\n' + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + (orders[i].signin ? ' 已签到' : '') + '\n'
    } else if (i == (orders.length - 1)) {
      msg = msg + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + (orders[i].signin ? ' 已签到' : '') + '\n'
    } else {
      msg = msg + String(i + 1) + '. ' + (orders[i].alias || orders[i].nick) + (orders[i].signin ? ' 已签到' : '') + '\n'
    }

  }
  msg = msg + '\n点击链接 qr14.cn/E8eqXc 进入 #群组大师小程序 查看更多活动\n'
  console.info(msg)
  return msg
}
// 报名活动
const sign_in_act = async (act, member, add_num, is_bench, create_time) => {
  let ts = create_time

  if (is_bench) {
    let res = await db.collection('order').add({
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
    return res
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
// 更新报名信息
const update_sing_in = async (cur_order, add_num) => {
  return await db.collection('order').doc(cur_order._id).update({
    data: {
      total_num: cur_order.total_num + add_num
    }
  })
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
// 获取当前用户订单
const get_cur_order = async (act, member) => {
  let res = await db.collection('order').where({
    act_id: act._id,
    wxid: member.wxid,
    is_bench: false
  }).get()
  return res.data.length ? res.data[0] : {}
}

// 更新用户订单
update_orders = async (orders) => {

  for (let i in orders) {
    let old_order = orders[i]
    let _id = old_order._id
    let order = JSON.parse(JSON.stringify(old_order))
    delete order._id
    console.info(order)
    let res_update_order = await db.collection('order')
      .doc(_id)
      .update({
        data: order
      })
    console.info(res_update_order)
  }

  return orders
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const _openid = wxContext.OPENID

  let {
    action,
    act_data,
    act_id,
    wxid,
    page,
    status,
    act_msg,
    orders
  } = event
  console.info(event)
  let res = ''
  let data = ''
  let msg = ''

  if (action == 'get_hot_acts') {
    let res_members = await db.collection('member')
      .where({
        wxid
      })
      .get()
    if (res_members.data.length > 0) {

      let roomids = get_list(res_members.data, 'roomid')[0]
      let res_acts = await db.collection('activity')
        .where({
          roomid: _.in(roomids),
          act_type: '活动'
        })
        .orderBy('is_active', 'desc')
        .orderBy('status', 'asc')
        .orderBy('create_time', 'desc')
        .get()
      data = res_acts.data

    } else {
      data = []
    }

  } else if (action == 'get_orders') {
    let res_orders = await db.collection('order').where({
      wxid
    }).orderBy('create_time', 'desc').get()
    data = res_orders.data

  } else if (action == 'update_act_status') {
    res = await db.collection('activity').doc(act_id).update({
      data: {
        status
      }
    })
    data = res
    msg = 'ok'
  } else if (action == 'update_total_num') {
    res = await db.collection('activity').doc(act_id).update({
      data: {
        total_num: _.inc(act_data.total_num)
      }
    })
  } else if (action == 'update_is_active') {
    console.info(act_data)
    if (act_data.is_active) {

      let res_act = await db.collection('activity').doc(act_id).get()

      let acts_update = await db.collection('activity').where({
        roomid: res_act.data.roomid
      }).update({
        data: {
          is_active: false
        }
      })
      console.info(acts_update)
    }

    res = await db.collection('activity').doc(act_id).update({
      data: act_data
    })

  } else if (action == 'get_order_text') {
    msg = await order_text(act_data, act_msg)
  } else if (action == 'cancel_sign_in_act') {

  } else if (action == 'update_orders') {

    // res = await update_orders(orders)

    for (let i in orders) {
      let old_order = orders[i]
      let _id = old_order._id
      let order = JSON.parse(JSON.stringify(old_order))
      delete order._id
      console.info(order)
      let res_update_order = await db.collection('order')
        .doc(_id)
        .update({
          data: order
        })
      console.info(res_update_order)
    }

    res = orders

  } else {
    res = await db.collection('activity').doc(act_id).update({
      data: act_data
    })
  }

  return {
    msg,
    res,
    data
  }
}
