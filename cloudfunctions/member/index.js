// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env: 'cloud1-9g9f1jcs9740dca9'})

const db = cloud.database()
const _ = db.command
const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var openid = wxContext.OPENID

  let group_id = event.group_id
  let roomid = event.roomid

  if (group_id) {

    console.info('携带了group_id================')

    // 先取出集合记录总数
    const countResult = await db.collection('member')
      .where(_.or([{
        group_id
      }, {
        roomid
      }]))
      .count()
    const total = countResult.total
    // 计算需分几次取
    const batchTimes = Math.ceil(total / 100)
    // 承载所有读操作的 promise 的数组
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('member')
        .where(_.or([{
          group_id
        }, {
          roomid
        }]))
        .orderBy('alias', 'asc')
        .orderBy('nick', 'asc')
        .skip(i * MAX_LIMIT)
        .limit(MAX_LIMIT).get()
      tasks.push(promise)
    }
    // 等待所有
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      console.info('携带了group_id==================')
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    })
  } else {
    console.info('没有携带group_id================')

    const countResult = await db.collection('member')
      .where({
        _openid: openid,
        status: 0
      })
      .count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / 20)

    if (batchTimes <= 1) {
      const res = await db.collection('member')
        .aggregate()
        .match({
          _openid: openid,
          status: 0
        })
        .lookup({
          from: 'group',
          localField: 'group_id',
          foreignField: '_id',
          as: 'group_info',
        })
        .limit(20)
        .end()
      console.info(res)
      return {
        members: res.list,
        errMsg: res.errMsg
      }

    } else {
      // 承载所有读操作的 promise 的数组
      const tasks = []

      for (let i = 0; i < batchTimes; i++) {
        console.info('需要循环次数', batchTimes)
        const promise = db.collection('member')
          .aggregate()
          .match({
            _openid: openid,
            status: 0
          })
          .lookup({
            from: 'group',
            localField: 'group_id',
            foreignField: '_id',
            as: 'group_info',
          })
          .skip(i * 20)
          .limit(20)
          .end()

        tasks.push(promise)
      }


      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        console.info(acc)
        console.info(cur)
        var list = acc.list.concat(cur.list)
        if (acc.members) {
          var members = acc.members.concat(cur.members)
        } else {
          var members = cur.list
        }

        var errMsg = acc.errMsg

        return {
          members,
          errMsg
        }
      })
    }


  }
}
