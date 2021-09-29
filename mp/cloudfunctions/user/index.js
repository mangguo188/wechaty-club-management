// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: 'cloud1-9g9f1jcs9740dca9'})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const {
  createHash
} = require('crypto');


// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.info(event)

  let {
    action,
    body,
    update_user_info
  } = event

  let res = ''

  if (update_user_info) {
    let update_res = await db.collection('user').doc(update_user_info.openid).update({
      data: update_user_info.data
    })
    res = update_res
  } else if (action == 'get_user_hash') {
    let hash = createHash('sha256');
    hash.update(`${body.nickName}${body.gender}`);
    let user_hash = hash.digest('hex')
    console.log(user_hash);
    res = user_hash
  } else {
    res = event
  }

  return res
}
