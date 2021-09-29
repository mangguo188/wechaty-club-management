// 云函数入口文件
const cloud = require('wx-server-sdk')
var util = require('./util')

cloud.init({env: 'cloud1-9g9f1jcs9740dca9'})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID


  var datas = {}
  var user = {}
  var get_user = await db.collection('user')
    .where({
      _id: openid
    })
    .get()

  console.debug('user========', get_user)

  if (get_user.data.length > 0) {
    user = get_user.data[0]
  } else {

    datas.create_time = util.get_time()[0]
    datas.create_time_utc = util.get_time()[1]
    datas.last_login = datas.create_time
    datas.last_login_utc = datas.create_time_utc
    datas.userInfo = {}
    datas.cellphone = ''
    datas.locations = []
    datas.real_name = ''
    datas.role = 'user'
    datas._openid = openid

    var add_user = await db.collection('user').doc(openid)
      .set({
        data: datas
      })
    datas._id = openid
    user = datas
  }

  return {
    errorCode: 200,
    user,
    openid
  }
}
