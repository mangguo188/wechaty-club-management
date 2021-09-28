// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = cloud.database().command
const MAX_LIMIT = 100

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


exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const _openid = wxContext.OPENID
  let {
    action,
    act_data,
    act_id,
    wxid,
    page,
    roomid,
    params
  } = event

  let res = ''
  let data = ''
  let msg = ''

  if (action == 'get_hot_rooms') {
    let res_user = await db.collection('user').doc(_openid).get()
    let user = res_user.data
    wxid = user.wxid
    nick = user.userInfo ? user.userInfo.nickName : '未获得到昵称'

    let res_members = await db.collection('member')
      .where({
        wxid
      })
      .get()
    let roomids = get_list(res_members.data, 'roomid')[0]
    let res_rooms = await db.collection('room')
      .where({
        _id: _.in(roomids)
      })
      .orderBy('is_vip', 'asc')
      .get()
    data = res_rooms.data

  } else if (action == 'set_room_owner') {
    let room = await db.collection('room').doc(roomid).update({
      data: {
        owner: wxid
      }
    })
    data = room
    msg = 'ok'
  } else if (action == 'update_bot') {
    let room = await db.collection('room').doc(roomid).update({
      data: params
    })
    data = room
    msg = 'ok'

  } else if (action == 'get_all_rooms') {

    let res_rooms = await db.collection('room')
      .orderBy('boot_open', 'asc')
      .orderBy('is_vip', 'asc')
      .get()
    data = res_rooms.data
    msg = 'get all rooms success'
  } else {
    let user = await db.collection('user')
      .where({
        _id: _openid
      })
      .get()

    if (user.data.length > 0 && user.data[0].wxid) {
      let wxid = user.data[0].wxid
      const res_members = await db.collection('member')
        .where({
          wxid
        })
        .get()
      let roomids = get_list(res_members.data, 'roomid')[0]
      let res_rooms = await db.collection('room').where({
          _id: _.in(roomids)
        })
        .orderBy('is_vip', 'desc')
        .orderBy('boot_open', 'desc')
        .get()
      data = res_rooms.data
      msg = 'get user rooms success'
    } else {
      data = []
      msg = 'get user rooms success'
    }
  }

  return {
    data,
    msg
  }
}