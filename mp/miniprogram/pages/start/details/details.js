const util = require('../../../utils/util')

const watch = require("../../../utils/watch.js");

import {
  player_dics,
  player_dic
} from './names.js'

import {
  $wuxCountDown,
  $wuxDialog,
  $wuxActionSheet,
} from '../../../dist/index'

const {
  Client,
  Message
} = require('../../../utils/paho-mqtt')

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    is_image: false,
    is_detail_mode: true,
    debug: false,
    imageUrl: '',
    richText: '',
    show_orders: [0],
    show_decs: [0],
    randomColor: [],
    isSignuping: false,
    onShare: false,
    show_sign_info: false,
    current: '1',
    spinning: true,
    hassignup: 0,
    iscreator: false,
    isfull: false,
    isend: false,
    currentMaxNum: 100,
    currentSignupNum: 0,
    orders: [],
    orders_items: [],
    orders_items_is_done: false,
    total_num: 0,
    currentIndex: 0,
    act_id: '',
    colors: ['light', 'stable', 'positive', 'calm', 'balanced', 'energized', 'assertive', 'royal', 'dark'],
    colorIndex: 4,
    position: 'bottomLeft',
    theme: 'positive',
    days: '00',
    hours: '00',
    min: '00',
    sec: '00',
    locks: false,
    onshare_text: {
      title_text: '报名成功',
      footer_text: '你已成功报名，分享给好友吧~'
    },
    onshare_text_items: [{
      title_text: '创建成功',
      footer_text: '活动创建成功，分享给好友吧~'
    }, {
      title_text: '报名成功',
      footer_text: '你已成功报名，分享给好友吧~'
    }, ],
    act: {
      is_active: false
    },
    act_is_loading: true,
    flag: true,
    show_sign_up: false,
    params: {
      act_id: '',
      member_id: '',
      order_items: [{
        type: 'male',
        num: 1,
        price: 0,
        discount: 0
      }, {
        type: 'women',
        num: 0,
        price: 0,
        discount: 0
      }],
      order_amount: 0,
      total_num: 0,
      contact_info: {
        name: '',
        cellphone: ''
      },
      status: 0,
      is_sign_in: false,
      order_sort: 0,
    },
    destructiveText: '取消活动',
    admin_option: [{
        text: '停止报名',
        action: 'stop_add',
        url: '',
        status: true
      },
      // {
      //   text: '费用结算',
      //   action: 'clear_expense',
      //   url: '',
      //   status: true
      // },
      // {
      //   text: '到场统计',
      //   action: '',
      //   url: '',
      //   status: true
      // }, {
      //   text: '编辑活动',
      //   action: '',
      //   url: '',
      //   status: true
      // },
    ]
  },
  MakeSign(data) {

  },
  to_pay() {
    let t = new Date().getTime()
    wx.requestOrderPayment({
      orderInfo: {},
      timeStamp: String(t / 1000),
      nonceStr: '1234',
      package: 'prepay_id=42526234625',
      signType: 'MD5',
      paySign: '',
      success(res) {
        console.debug(res)
      },
      fail(res) {
        console.error(res)
      }
    })

  },
  show_image() {
    wx.navigateTo({
      url: '/pages/start/tiwtter/index',
    })
  },
  //预览图片，放大预览
  preview() {
    wx.previewImage({
      current: 'cloud://test-958d13.2fb3-test-958d13-1251176925/tools/ledongmao_pay.png', // 当前显示图片的http链接
      urls: ['cloud://test-958d13.2fb3-test-958d13-1251176925/tools/ledongmao_pay.png', ] // 需要预览的图片http链接列表
    })
  },
  get_settings() {
    wx.getSetting({
      success: res => {
        console.debug('[getSetting]', res)
      }
    })
  },
  get_order_text: async function (act_data, act_msg) {
    let res = await wx.cloud.callFunction({
      name: 'act',
      data: {
        action: 'get_order_text',
        act_data,
        act_msg
      }
    })

    console.debug(res)

    return res.result.msg
  },
  copytext: function (e) {
    console.log(e)
    wx.setClipboardData({
      data: e.currentTarget.dataset.text,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制成功'
            })
          }
        })
      },
      fail: function (err) {
        console.error(err)
      }
    })
  },
  show_detele() {
    this.setData({
      is_delete: !this.data.is_delete
    })
  },
  onLoad(ops) {

    console.log('onLoad=====', ops)

    this.data.ops = ops

    this.setData({
      fr: ops.fr,
      is_active: ops.is_active || '',
      act_id: ops.id,
      group_info: app.globalData.group_info || {},
      act_openGid: ops.opengid || '',
      cur_time: new Date().getTime()
    })

    var that = this
    that.get_settings()
    watch.setWatcher(this); // 设置监听器，建议在onLoad下调用

    app.setConfig(function (CONFIG) {
      that.setData({
        CONFIG
      })
    })

    console.log('[onload]', ops)

    if (ops.fr == 'add') {
      that.setData({
        onshare_text: that.data.onshare_text_items[0]
      })
    }

    wx.showShareMenu({
      withShareTicket: true
    })

    app.getShareTiket(function (openGid, openid) {
      if (openGid) {
        db.collection('member').doc(openGid + '-' + openid).set({
          data: {
            openGid,
            create_time: new Date().getTime(),
            create_time_utc: new Date()
          }
        }).then(res => {
          console.debug('更新member成功')
          app.getGroups(function (groups, groups_id, members) {

            app.globalData.groups_has_new = false

          })
        })
      }

      that.setData({
        openGid
      })

    })

  },
  not_in_group(e) {
    console.debug('用户不在此群组中', e)
    var that = this
    app.getOpenid(function (openid, user) {
      that.remove_member(that.data.act_openGid + '-' + openid)

      wx.showModal({
        title: '提示',
        content: '你不是该群成员，无法查看内容',
        success(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }

          wx.switchTab({
            url: '/pages/start/relatedlist/index',
          })
        }

      })


    })

  },
  remove_member(_id) {
    db.collection('member').doc(_id)
      .remove()
      .then(res => {
        console.debug('remove======', _id)
      })
      .catch(err => {
        console.error(err)
      })
  },
  onChangesetboysnum(e) {
    console.log(e)
    this.setData({
      'params.order_items[0].num': e.detail.value,
    })
  },
  onChangesetgirlsnum(e) {
    console.log(e)
    this.setData({
      'params.order_items[1].num': e.detail.value,
    })
  },
  setCellPhone(e) {
    console.log(e)
    var cellPhone = e.detail.value
    this.setData({
      'params.contact_info.cellphone': cellPhone
    })
  },
  setRealName(e) {
    console.log(e)
    var realName = e.detail.value
    console.log(realName)
    this.setData({
      'params.contact_info.name': realName
    })
  },
  onClickButton() {

    var that = this
    var params = this.data.params

    params = util.add_time('c', params)
    if (that.data.isSignuping) {
      wx.showToast({
        title: '正在提交',
      })
    } else if (!params.contact_info.name) {
      wx.showToast({
        title: '姓名必填',
      })
    } else if (!params.contact_info.cellphone) {
      wx.showToast({
        title: '手机号必填',
      })
    } else if (that.data.act.maximum <= that.data.total_num && false) {
      wx.showToast({
        title: '报名已满',
      })
    } else {

      if (params.order_items[0].num + params.order_items[1].num == 0) {
        wx.showToast({
          title: '至少添加一人',
        })
      } else if (params.order_items[0].num + params.order_items[1].num > that.data.act.maximum - that.data.total_num && false) {
        wx.showToast({
          title: '名额不足',
        })
      } else {
        that.data.isSignuping = true

        delete params._id
        delete params._openid


        db.collection('order').doc(that.data.act_id + '-' + that.data.openid).set({
          data: params,
          success: res => {
            wx.showToast({
              title: '报名成功',
            })

            console.log('报名成功', res._id)

            var order_info = params

            order_info._id = res._id
            order_info._openid = app.globalData.openid

            app.globalData.order_info = order_info
            this.setData({
              order_info
            })

            this.to_sub_msg()

            app.globalData.sign_up_done = true
            var act_data = {
              total_num: params.order_items[0].num + params.order_items[1].num
            }

            that.data.isSignuping = false
            that.update_act('update_total_num', params.act_id, act_data)
            that.setData({
              show_sign_info: false,
              locks: true,
              'onshare_text.title_text': '报名成功'
            })



            if (app.globalData.user.real_name != params.contact_info.mame || app.globalData.user.cellphone != params.contact_info.cellphone) {

              var new_user = app.globalData.user
              new_user.real_name = params.contact_info.mame
              new_user.cellphone = params.contact_info.cellphone
              app.globalData.user = new_user
              wx.setStorage({
                key: "user",
                data: new_user,
                success: res => {
                  console.debug('[缓存] [设置用户user] 成功：', res)
                },
                fail: err => {
                  console.error('[缓存] [设置用户user] 失败：', err)
                }
              })

              delete new_user._id
              delete new_user._openid

              db.collection('user').doc(app.globalData.openid).update({
                data: new_user,
                success: res => {
                  console.debug('更新会员名称成功')

                },
                fail: err => {
                  console.debug('更新会员名称失败')

                }
              })



            }

            if (that.data.member_info) {
              db.collection('member').doc(that.data.member_info._id).update({
                data: {
                  group_nickname: params.contact_info.name,
                  cellphone: params.contact_info.cellphone || '',
                  status: 0
                },
                success: res => {
                  console.debug('更新会员名称成功')

                },
                fail: err => {
                  console.debug('更新会员名称失败')

                }
              })
            }


          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '报名失败'
            })
            console.error('报名失败', err)
          }
        })

      }
    }

  },
  set_sub_msg() {

    var that = this
    wx.requestSubscribeMessage({
      tmplIds: ['qbDPA0sV9pMchxqvHkQmGby-FEUiWi7JPvsVZwfGLZM'],
      success(res) {
        console.debug('订阅成功', res)

      },
      fail(err) {
        console.error('订阅失败', err)
      },
      complete(daone) {
        console.debug('订阅完成', daone)
        if (daone['qbDPA0sV9pMchxqvHkQmGby-FEUiWi7JPvsVZwfGLZM'] == 'accept') {
          that.setData({
            show_set_msg: false
          })
        } else {
          that.setData({
            show_set_msg: true
          })
        }
      }
    })
  },
  update_act(action, act_id, act_data) {
    var that = this
    wx.cloud.callFunction({
      name: 'act',
      data: {
        action,
        act_data,
        act_id
      },
      success: res => {
        console.log('[恢复活动操作] 成功：', res)
        if (action != 'update_total_num') {
          wx.showToast({
            title: '操作成功',
          })
        }
        if (action == 'update_is_active' && that.data.act.status == 0) {
          // that.doConnect('update_is_active')
        }

      },
      fail: err => {
        console.error('[恢复活动操作] 失败：', err)
        if (action != 'update_total_num') {
          wx.showToast({
            title: '操作失败',
          })
        }
      }
    })


  },
  update_act_status: async function () {

    let that = this
    let status = that.data.act.status == 0 ? 1 : 0

    let update_act = await wx.cloud.callFunction({
      name: 'act',
      data: {
        action: 'update_act_status',
        act_id: that.data.act._id,
        status
      }
    })
    util.print(update_act)

    that.setData({
      'act.status': status
    }, res => {
      wx.showToast({
        title: '更新成功',
      })
      if (that.data.act.is_active) {
        // that.doConnect('update_act_status')
      }
    })

  },
  to_scoreboard(e) {
    let i = e.currentTarget.dataset.i
    app.globalData.cur_scoreboard = this.data.scoreboards[i]
    wx.navigateTo({
      url: '/pages/start/tools/index?fr=list',
    })
  },
  to_sub_msg() {
    console.debug('发送订阅消息========')
    var that = this
    var rec_list = [that.data.openid]
    var msg_data = {}
    msg_data.page = '/pages/start/details/details?fr=share&id=' + that.data.act_id
    msg_data.data = {
      thing2: {
        value: that.data.act.decs.substr(0, 12)
      },
      thing3: {
        value: that.data.act.location_name || '--'
      },
      date4: {
        value: that.data.act.act_date.text ? that.data.act.act_date.date[0] + '年' + (that.data.act.act_date.date[1] + 1) + '月' + that.data.act.act_date.date[2] + '日' + ' ' + that.data.act.act_time.text : '00年0月0日 0:00'
      },
      thing5: {
        value: that.data.act.location_name || '--'
      },
      name1: {
        value: that.data.order_info.contact_info.name
      }
    }
    msg_data.action = 'sign_in_success'

    console.debug('msg_data===============', msg_data)

    wx.cloud.callFunction({
      name: 'wxmessage',
      data: {
        rec_list: rec_list,
        msg_data: msg_data
      },
      success: res => {
        console.log('[订阅消息发布] 成功：', res)

      },
      fail: err => {
        console.error('[订阅消息发布] 失败：', err)

      }
    })
  },
  watch: {
    act: function (newVal, oldVal) {
      console.log(newVal, oldVal);
      if (newVal) {
        this.formatDatas(newVal)
      }
    },
    orders: function (orders, oldVal) {
      console.log(orders, oldVal);
      if (orders.length && orders[0].wxid) {
        console.debug(orders)
      } else {
        this.setOrders(orders)
      }
    },
  },
  formatDatas(act) {
    var that = this
    var admin_option = that.data.admin_option
    var destructiveText = that.data.destructiveText

    if (act.is_active == false) {
      admin_option[0].text = '开启报名'
    } else {
      admin_option[0].text = '停止/截止报名'
    }
    if (act.status == 1) {
      destructiveText = '恢复活动'
    } else if (act.status == 0) {
      destructiveText = '取消活动'
    } else {

    }

    that.setData({
      admin_option,
      destructiveText
    })

  },
  upload(event) {
    const {
      key
    } = event.currentTarget.dataset;
    console.debug('event.detail=========', event.detail)
    this.setData({
      [key]: event.detail
    });
  },
  onShow() {
    var ops = this.data.ops
    console.debug('onshow ops========', ops)
    var that = this

    if (app.globalData.sign_up_done) {
      app.globalData.sign_up_done = false
    }

    app.getOpenid(function (openid, user) {

      console.debug('ops.id-------------', ops.id)

      that.onQuery(openid, ops.id)

      that.setData({
        openid,
        user
      })

    })

  },
  get_or_create_member(group_id, openid, userInfo, e) {

    var that = this
    db.collection('member')
      .where({
        group_id: group_id,
        _openid: openid
      })
      .get({
        success: res => {

          console.debug('查询会员结果', res)
          if (res.data.length > 0) {
            app.globalData.member_info = res.data[0]

            that.setData({
              member_info: res.data[0]
            }, () => {
              that.to_show(openid, userInfo, e)
            })
          } else {

            var memberdata = {}
            memberdata.group_id = group_id
            memberdata = util.add_time('c', memberdata)
            memberdata.group_nickname = that.data.user.real_name || userInfo.nickName
            memberdata.init_nickname = userInfo.nickName

            memberdata.cellphone = that.data.user.cellphone || ''
            memberdata.role = 'user'
            memberdata.status = 0
            memberdata.balance = 0
            memberdata.total_consumption = 0
            memberdata.total_recharge = 0
            memberdata.total_count = 0

            db.collection('member').add({
              data: memberdata,
              success: res_mem => {

                console.log(res_mem);
                console.log('[创建者开卡成功] 成功，记录 _id: ', res_mem._id)
                memberdata._id = res_mem._id
                memberdata._openid = that.data.openid
                that.setData({
                  member_info: memberdata
                }, () => {
                  that.to_show(openid, userInfo, e)
                  app.globalData.groups_has_new = true
                  app.globalData.groups = ''
                  app.getGroups(function (groups, groups_id, members) {
                    console.debug('更新全局变量groups成功=================')
                  })
                })

              },
              fail: err => {
                console.error('[开卡] 失败：', err)
              }
            })

          }
        }
      })



  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  get_all_orders() {
    var that = this
    console.debug('页面渲染完成')

    const order_watcher = db.collection('order').where({
        act_id: this.data.act_id
      }).orderBy('is_bench', 'asc')
      .orderBy('create_time', 'asc')
      .watch({
        onChange: function (snapshot) {
          console.debug('docs\'s changed events', snapshot.docChanges)
          console.debug('query result snapshot after the event', snapshot.docs)
          console.debug('is init data', snapshot.type === 'init')

          var orders = snapshot.docs
          let j_orders = JSON.parse(JSON.stringify(orders))
          that.setData({
            orders,
            j_orders
          }, res => {
            that.order_text(j_orders)
          })
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })

    this.order_watcher = order_watcher
  },
  get_all_scoreboards(act_id) {
    var that = this
    console.debug('页面渲染完成')

    const scoreboard_watcher = db.collection('scoreboard').where({
        act_id
      })
      .orderBy('create_time', 'asc')
      .watch({
        onChange: function (snapshot) {
          console.debug('docs\'s changed events', snapshot.docChanges)
          console.debug('query result snapshot after the event', snapshot.docs)
          console.debug('is init data', snapshot.type === 'init')

          var scoreboards = snapshot.docs
          that.setData({
            scoreboards
          }, res => {

          })
        },
        onError: function (err) {
          console.error('the watch closed because of error', err)
        }
      })

    this.scoreboard_watcher = scoreboard_watcher
  },
  // 活动报名信息拼接
  order_text(orders) {
    let that = this
    let new_orders = []
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].total_num == 0 || orders[i].total_num == 1) {
        new_orders.push(orders[i])
      } else {
        for (let j = 0; j < orders[i].total_num; j++) {
          let new_order = orders[i]
          new_order = JSON.parse(JSON.stringify(new_order))

          new_order.nick = j == 0 ? new_order.nick : (new_order.nick + ' 挂' + j)

          new_order.alias = j == 0 ? (new_order.alias ? new_order.alias : '') : (new_order.alias ? (new_order.alias + ' 挂' + j) : '')

          new_orders.push(new_order)
        }
      }
    }
    app.globalData.j_orders = new_orders
    app.globalData.act = that.data.act

    this.setData({
      j_orders: new_orders
    })

  },
  // 获取或更新相关的全部活动
  onQuery: function (openid, activitiesId) {
    var that = this
    var is_owner = false
    console.log('[读取活动详情请求参数]', openid, activitiesId)

    const act_watcher = db.collection('activity')
      .doc(activitiesId)
      .watch({

        onChange: function (snapshot) {
          console.debug('docs\'s changed events', snapshot.docChanges)
          console.debug('query result snapshot after the event', snapshot.docs)
          console.debug('is init data', snapshot.type === 'init')

          var act = snapshot.docs ? snapshot.docs[0] : ''


          if (!act) {
            wx.navigateBack({})
            return
          }


          app.globalData.act = act

          that.setData({
            act,
            act_is_loading: false
          }, res => {
            if (snapshot.type === 'init') {
              if (that.data.fr == 'add' && that.data.is_active) {
                // that.doConnect('add_act')
              }
            }
          })

          if (act.group_id) {
            db.collection('group').doc(act.group_id).get({
              success: res_group => {
                var group_info = res_group.data
                app.globalData.group_info = group_info
                is_owner = group_info.owner == openid

                that.setData({
                  group_info,
                  is_owner
                })
              }
            })
          }



          if (snapshot.type === 'init') {
            console.debug('初始化活动成功===========')

            var is_detail_mode = true

            var act_snapshot = {}
            act_snapshot.title = act.title || ''
            act_snapshot.location_name = act.location_name || ''
            act_snapshot.group_name = act.group_name || ''
            act_snapshot.act_time = act.act_time || ''
            act_snapshot.group_id = act.group_id || ''
            act_snapshot._openid = act._openid || ''
            act_snapshot.decs = act.decs
            act_snapshot.contact_info = act.contact_info

            console.debug('活动快照===========', act_snapshot)

            if (act.act_mode == 'advanced') {
              act_snapshot.act_mode = 'advanced'

              var cur_time = new Date().getTime()

              if (cur_time < act.start_time) {
                // 初始化倒计时
                var startTime = new Date(act.start_time)
                console.debug('开始时间=======', startTime)
                this.c1 = new $wuxCountDown({
                  // date: 'June 7, 2019 15:03:25',
                  date: startTime,
                  render(date) {
                    const years = this.leadingZeros(date.years, 4)
                    const days = this.leadingZeros(date.days, 2)
                    const hours = this.leadingZeros(date.hours, 2)
                    const min = this.leadingZeros(date.min, 2)
                    const sec = this.leadingZeros(date.sec, 2)
                    that.setData({
                      c1: days + hours + min + sec,
                      days: days,
                      hours: hours,
                      min: min,
                      sec: sec,
                      cur_time: new Date().getTime()
                    })
                  },
                })
              } else {
                that.setData({
                  cur_time: new Date().getTime()
                })
              }

            } else {

              act_snapshot.act_mode = 'simple'
              is_detail_mode = false
              is_owner = act._openid == openid
              that.setData({
                is_owner
              })


            }
            console.debug('活动快照===========', act_snapshot)

            app.globalData.is_owner = is_owner

            that.setData({
              is_detail_mode,
              'params.act_id': act._id,
              'params.act_snapshot': act_snapshot,
            }, () => {
              that.get_order(openid, activitiesId)
            })

          } else {
            console.debug('更新活动成功===========')

          }

        },
        onError: function (err) {
          // console.error('the watch closed because of error', err)
          console.error('[查询活动详情] 失败：', err)
        }

      })

    this.act_watcher = act_watcher

  },
  get_order(openid, act_id) {
    var that = this
    db.collection('order').where({
        act_id: act_id,
        _openid: openid,
        status: 0
      })
      .get()
      .then(res => {
        console.debug('获取的订单信息', res)
        that.setData({
          order_info: res.data[0] || {
            status: 2
          }
        }, () => {
          this.get_all_orders()
          this.get_all_scoreboards(act_id)
        })


      })
      .catch()
  },
  manger() {
    var that = this

    this.setData({
      is_manger: true
    })

    var buttons = that.data.admin_option

    var destructiveText = that.data.destructiveText
    //0正常，1截止报名，2活动取消

    $wuxActionSheet().showSheet({
      theme: 'wx',
      titleText: '选择操作',
      buttons: buttons,
      buttonClicked(index, item) {
        console.log(index, item)

        that.setData({
          is_manger: false
        })

        if (that.data.admin_option[index].action == 'stop_add') {
          var data = {
            is_active: !that.data.act.is_active
          }
          that.set_is_active()
        } else if (that.data.admin_option[index].action == 'clear_expense') {
          // var data = {
          //   is_active: !that.data.act.is_active
          // }
          // that.update_act('update_is_active', that.data.act._id, data)
          app.globalData.act = that.data.act
          app.globalData.orders = that.data.orders
          app.globalData.user = that.data.user


          console.debug('费用结算')
          wx.navigateTo({
            url: './clearexpense/index'
          })

        } else {
          wx.showToast({
            title: '功能开发中',
          })
        }

        // if (index == 0) {
        //   console.log('点击了停止报名')


        //   if (that.data.act.status == 0) {
        //     db.collection('activity').doc(that.data.act._id).update({
        //       data: {
        //         status: 1
        //       },
        //       success: res => {
        //         that.setData({
        //           'act.status': 1,
        //           isstop: true
        //         })
        //         wx.showToast({
        //           title: '已停止报名',
        //         })
        //         console.log('[停止报名操作] 成功！ ')
        //       },
        //       fail: err => {
        //         console.error('[停止报名操作] 失败：', err)
        //       }
        //     })
        //   } else if (that.data.act.status == 1) {
        //     db.collection('activity').doc(that.data.act._id).update({
        //       data: {
        //         status: 0
        //       },
        //       success: res => {
        //         that.setData({
        //           'act.status': 0,
        //           isstop: false
        //         })
        //         wx.showToast({
        //           title: '已恢复报名',
        //         })
        //         console.log('[恢复报名操作] 成功！ ')
        //       },
        //       fail: err => {
        //         console.error('[恢复报名操作] 失败：', err)
        //       }
        //     })
        //   } else {
        //     wx.showToast({
        //       title: '活动已取消',
        //     })
        //   }


        // } else {
        //   console.log('点击了编辑活动')
        //   wx.showToast({
        //     title: '暂不支持',
        //   })
        // }

        return true
      },
      cancelText: '关闭',
      cancel() {
        that.setData({
          is_manger: false
        })
      },
      destructiveText: destructiveText,
      destructiveButtonClicked() {
        console.log("点击了取消活动")


        // wx.showModal({
        //   title: '操作提示',
        //   showCancel: true,
        //   content: '取消活动后报名自动停止，恢复活动可继续报名',
        //   success(res) {
        //     if (res.confirm) {
        //       console.log('用户点击确定')

        //     } else if (res.cancel) {
        //       console.log('用户点击取消')
        //     }
        //   }
        // })


        that.setData({
          is_manger: false
        })

        var data = {}

        if (that.data.act.status == 0) {
          data = {
            status: 1
          }

        } else {
          data = {
            status: 0
          }
        }
        that.update_act_status()
        // that.update_act('update_status', that.data.act._id, data)
        return true
      },
    })

  },
  set_is_active() {
    let that = this
    var data = {
      is_active: !that.data.act.is_active
    }
    that.update_act('update_is_active', that.data.act._id, data)

  },
  change_mode() {
    this.setData({
      is_detail_mode: !this.data.is_detail_mode
    })
  },
  buttonClicked(e) {
    console.log('buttonClicked', e.detail)
    const {
      index
    } = e.detail

    // index === 0 && wx.showModal({
    //   title: 'Thank you for your support!',
    //   showCancel: !1,
    // })
    index === 0 && wx.switchTab({
      url: '/pages/start/usercenter'
    })

    index === 1 && wx.switchTab({
      url: '/pages/start/relatedlist/index'
    })

    index === 2 && wx.switchTab({
      url: '/pages/start/vipcard/index'
    })
  },
  bindchange(e) {
    console.log('bindchange', e.detail.value)
  },
  setOrders(orders) {
    var that = this
    var t0 = new Date().getTime()
    var signups = []
    var temorder = {}
    var currentSignupNum = 0

    var total_num = 0

    var signnum = 0
    for (var i = 0; i < orders.length; i++) {
      total_num = total_num + orders[i].order_items[0].num + orders[i].order_items[1].num

      temorder = Object.create(orders[i])
      if (orders[i].status === 0) {
        signnum = orders[i].order_items[0].num + orders[i].order_items[1].num
        currentSignupNum = currentSignupNum + signnum

        for (var male = 0; male < orders[i].order_items[0].num; male++) {
          var realName = /^[a-zA-Z]+$/.test(temorder.contact_info.name) ? temorder.contact_info.name.substr(0, 12) : temorder.contact_info.name.substr(0, 6)
          var gender = 1
          var realName_full = ''
          var _openid = temorder._openid
          if (male != 0) {
            realName = temorder.contact_info.name.substr(0, 5) + male
            realName_full = temorder.contact_info.name + "+" + male
          } else {
            realName_full = realName
          }
          // console.log('[格式化的signup.name]', temorder.nickName) 
          var newtemorder = {
            realName,
            gender,
            realName_full,
            _openid,
            create_time_utc: orders[i].create_time_utc
          }
          // console.log('[newtemorder.realName]', newtemorder.realName) 
          signups.push(newtemorder)
        }
        for (var women = 0; women < orders[i].order_items[1].num; women++) {
          var realName = /^[a-zA-Z]+$/.test(temorder.contact_info.name) ? temorder.contact_info.name.substr(0, 12) : temorder.contact_info.name.substr(0, 6)
          var gender = 2
          var _openid = temorder._openid
          var realName_full = ''
          if (women + orders[i].order_items[0].num == 0 && women == 0) {
            realName_full = realName
          } else {
            realName = temorder.contact_info.name.substr(0, 5) + (women + orders[i].order_items[0].num)
            realName_full = temorder.contact_info.name + "+" + (women + orders[i].order_items[0].num)
          }
          // console.log('[格式化的signup.name]', temorder.nickName) 
          var newtemorder = {
            realName,
            gender,
            realName_full,
            _openid
          }
          // console.log('[newtemorder.realName]', newtemorder.realName) 
          signups.push(newtemorder)
        }

      }
    }

    console.log('[最终格式化的signups]', signups)
    this.setData({
      orders_items: signups,
      orders_items_is_done: true,
      total_num
    }, () => {
      this.create_image(signups)
    })

  },
  create_image(signups) {
    console.debug(signups)

    var that = this
    var signupsold = signups
    var signup_new = signups
    var total_num = that.data.total_num

    signup_new = signup_new.concat(player_dic.slice(0, 32 - total_num))

    // console.debug('补全后的名单', signup_new)

    // 使用 wx.createContext 获取绘图上下文 context
    var context = wx.createCanvasContext('springCanvas')
    var dy = 0
    var row_h = [10, 20, 30, 40, 50, 60]
    context.setFillStyle('#ffffff')
    context.fillRect(0, 0, 500, 400)
    context.setStrokeStyle("#2b2b2b")

    var x = 5
    var y = 5
    var w = 485
    var h = 390
    var r = 5

    // 绘制左上角圆弧 Math.PI = 180度
    // 圆心x起点、圆心y起点、半径、以3点钟方向顺时针旋转后确认的起始弧度、以3点钟方向顺时针旋转后确认的终止弧度
    context.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

    // 绘制border-top
    // 移动起点位置 x终点、y终点
    context.moveTo(x + r, y)
    // 画一条线 x终点、y终点
    context.lineTo(x + w - r, y)
    // self.data.ctx.lineTo(x + w, y + r)

    // 绘制右上角圆弧
    context.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

    // 绘制border-right
    context.lineTo(x + w, y + h - r)
    // self.data.ctx.lineTo(x + w - r, y + h)

    // 绘制右下角圆弧
    context.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

    // 绘制border-bottom
    context.lineTo(x + r, y + h)
    // self.data.ctx.lineTo(x, y + h - r)

    // 绘制左下角圆弧
    context.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

    // 绘制border-left
    context.lineTo(x, y + r)

    // context.rect(5, 5, 485, 390)
    // 绘制标题

    context.setFillStyle('#2b2b2b')
    // context.setFontSize(30)
    // dy += row_h[3]
    // context.fillText(that.data.act.title.replace(/[\r\n]/g, " "), 20, dy, 460)
    // 绘制活动正文
    context.setFontSize(20)

    const details_text = that.data.act.decs.replace(/[\r\n]/g, " ")
    // console.log('【活动详情】', details_text)
    const metrics = context.measureText(details_text)
    // console.log('【活动详情长度为】', metrics.width)

    var chr = details_text.split(""); //这个方法是将一个字符串分割成字符串数组
    var temp = "";
    var row = [];
    for (var a = 0; a < chr.length; a++) {
      if (context.measureText(temp).width < 490) {
        temp += chr[a];
      } else {
        a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
        row.push(temp);
        temp = "";
      }
    }
    row.push(temp);
    //如果数组长度大于2 则截取前两个
    if (row.length > 2) {
      var rowCut = row.slice(0, 2);
      var rowPart = rowCut[1];
      var test = "";
      var empty = [];
      for (var a = 0; a < rowPart.length; a++) {
        if (context.measureText(test).width < 460) {
          test += rowPart[a];
        } else {
          break;
        }
      }
      empty.push(test);
      var group = empty[0] + "..." //这里只显示两行，超出的用...表示
      rowCut.splice(1, 1, group);
      row = rowCut;
    }
    dy += row_h[2]
    if (row.length == 2) {
      context.fillText(row[0], 5, dy, 490);
      dy += row_h[2]
      context.fillText(row[1], 5, dy, 490);
    } else {
      context.fillText(row[0], 5, dy, 490);
    }

    console.debug('1===============================================================')

    // 绘制标签
    context.setFontSize(20)
    context.setFillStyle('#2b2b2b')
    dy += row_h[2]
    var sign_info = that.data.act.act_mode == 'simple' ? '已报名 [' + total_num + ']' : '已报名 [' + total_num + '/' + that.data.act.maximum + ']'
    context.fillText(sign_info, 5, dy, 490)
    // dy += row_h[0]
    context.setFillStyle('#2b2b2b')
    console.debug('2===============================================================')


    // dy += row_h[3]
    var arr = [20, 30, 40, 50, 60, 70]
    var left = Math.floor(Math.random() * 30 + 5)
    // arr.splice(arr.indexOf(left), 1)
    var dx = left
    var right = Math.floor(Math.random() * 30 + 5)
    var temp_name = "";
    // context.setFontSize(25)

    // if (signupsold.length) {
    //   signupsold = signupsold.slice(0, 20)
    //   var rows_num = 1
    //   for (var a = 0; a < signupsold.length && rows_num < 6; a++) {
    //     temp_name += signupsold[a].realName;
    //     if (context.measureText(temp_name).width + 10 * a < 500 - left - 1) {
    //       context.setFillStyle(signupsold[a].text_color)
    //       context.fillText(signupsold[a].realName, dx, dy, context.measureText(signupsold[a].realName).width)
    //       dx = dx + context.measureText(signupsold[a].realName).width + 10
    //     } else {

    //       left = Math.floor(Math.random() * 50 + 20)
    //       right = Math.floor(Math.random() * 30 + 20)
    //       dx = left
    //       dy += row_h[3]
    //       rows_num += 1
    //       temp_name = "";
    //       temp_name += signupsold[a].realName;
    //       context.setFillStyle(signupsold[a].text_color)
    //       context.fillText(signupsold[a].realName, dx, dy, context.measureText(signupsold[a].realName).width)
    //       dx = dx + context.measureText(signupsold[a].realName).width + 10
    //     }
    //   }
    // } else {
    //   dy += 60
    //   context.setFontSize(35)
    //   context.fillText('点击进入，一键报名！', 50, dy, 460)
    //   context.setFontSize(25)
    // }

    console.debug('3===============================================================')


    // 绘制报名列表
    context.setFontSize(20)
    if (signup_new.length) {
      signupsold = signup_new.slice(0, 32)
      var rowsnum = Math.ceil(signupsold.length / 8)
      // console.log('[signupsold]', signupsold)
      for (var i = 0; i < rowsnum; i++) {
        var dx = 5 + 125 * i
        var rowlong = (i + 1) * 8 - signupsold.length >= 0 ? signupsold.length - 8 * i : 8
        for (var j = 0; j < rowlong; j++) {
          var index = 8 * i + j
          dy = dy + row_h[3] - 5
          // console.log('[index]', index)
          // console.log('[signupsold[index].realName]', signupsold[index].realName)
          // context.setFillStyle(signupsold[index].text_color)
          if (signupsold[index].for_place) {
            context.setFillStyle('#D3D3D3')
          } else {
            context.setFillStyle('#444')
          }
          context.fillText((index + 1) + '. ', dx, dy, 15)
          context.fillText(signupsold[index].realName.substr(0, 5), dx + 15, dy, 95)
          // console.log('dx, dy', dx, dy)
        }
        dy = dy - 8 * (row_h[3] - 5)
      }
    } else {
      dy += 80
      context.setFontSize(35)
      context.fillText('Act now, you are the first！', 50, dy, 460)
      context.setFontSize(25)
    }

    context.setFillStyle('#2b2b2b')
    context.setStrokeStyle("#2b2b2b")
    var x = 150
    var y = 300
    var w = 200
    var h = 50
    var r = 10
    context.moveTo(x, y + r)

    // 绘制左上角圆弧 Math.PI = 180度
    // 圆心x起点、圆心y起点、半径、以3点钟方向顺时针旋转后确认的起始弧度、以3点钟方向顺时针旋转后确认的终止弧度
    context.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)

    // 绘制border-top
    // 移动起点位置 x终点、y终点
    context.moveTo(x + r, y)
    // 画一条线 x终点、y终点
    context.lineTo(x + w - r, y)
    // self.data.ctx.lineTo(x + w, y + r)

    // 绘制右上角圆弧
    context.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2)

    // 绘制border-right
    context.lineTo(x + w, y + h - r)
    // self.data.ctx.lineTo(x + w - r, y + h)

    // 绘制右下角圆弧
    context.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5)

    // 绘制border-bottom
    context.lineTo(x + r, y + h)
    // self.data.ctx.lineTo(x, y + h - r)

    // 绘制左下角圆弧
    context.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI)

    // 绘制border-left
    context.lineTo(x, y + r)

    // context.setFontSize(30)
    // context.fillText('立即报名', x + 40, y + 40, 250)

    console.debug('4===============================================================')
    that.setData({
      imageUrl: ''
    }, () => {
      context.draw(false, function () {
        wx.canvasToTempFilePath({
          canvasId: 'springCanvas',
          fileType: "jpg",
          success: function (res) {
            var imageUrl = res.tempFilePath
            console.log('[获得的分享背景图片]', imageUrl)

            that.setData({
              imageUrl
            })
          },
          fail: function (res) {
            console.log('[获取分享图片失败]', res)
          }
        })
      })
    })


  },
  signup_batch(e) {
    var that = this

    var cur_time = new Date().getTime()
    if (cur_time > this.data.act.start_time && this.data.act.act_mode == 'advanced') {
      wx.showToast({
        title: '活动已开始',
      })
      this.setData({
        cur_time
      })
    } else if (that.data.act.status != 0) {
      wx.showToast({
        title: '活动已取消',
      })
    } else if (!that.data.act.is_active) {
      wx.showToast({
        title: '已停止报名',
      })
    } else {

      app.getOpenid(function (openid) {

        wx.getSetting({
          success: res => {
            console.debug('[getSetting]', res)
            if (res.authSetting['scope.userInfo']) {
              console.debug('已授权过用户信息，直接获取===========')

              wx.getUserInfo({
                success: res => {
                  console.debug('获取信息成功，报名活动===========', res)
                  var userInfo = res.userInfo
                  app.globalData.userInfo = userInfo
                  that.update_user(openid, userInfo)

                  if (that.data.act.act_mode == 'advanced') {
                    that.get_or_create_member(that.data.act.group_id, openid, userInfo, e)
                  } else {
                    that.to_show(openid, userInfo, e)
                  }

                },
                fail: res => {
                  console.debug('获取信息失败===========')
                }
              })
            } else {
              console.debug('未授权过用户信息，跳转到授权登陆页面===========')

              wx.navigateTo({
                url: '/pages/start/login',
                success: function (res) {},
                fail: function (res) {},
                complete: function (res) {},
              })
            }
          }
        })
      })
    }

  },
  to_show(openid, userInfo, e) {
    var that = this

    var user = that.data.user
    var order_items = that.data.params.order_items

    if (userInfo.gender == 2) {
      order_items[0].num = 0
      order_items[0].num = 1
    }



    that.setData({
      'params.member_id': that.data.member_info ? that.data.member_info._id : '',
      'params.contact_info.name': that.data.member_info ? that.data.member_info.group_nickname : user.real_name,
      'params.contact_info.cellphone': that.data.member_info ? that.data.member_info.cellphone : user.cellphone || '',
      'params.order_items': order_items
    }, () => {
      this.setData({
        show_sign_info: true
      })
    })


  },
  update_user(openid, userInfo) {
    var that = this
    var user = app.globalData.user
    console.debug('user\n', user)
    user.userInfo = userInfo
    user.real_name = user.real_name || userInfo.nickName
    user.last_login = util.get_time()[0]
    user.last_login_utc = util.get_time()[1]

    app.globalData.user = user
    that.setData({
      user
    })

    // 更新缓存信息
    wx.setStorage({
      key: "user",
      data: user,
      success: res => {
        console.debug('[缓存] [设置用户user] 成功：', res)
      },
      fail: err => {
        console.error('[缓存] [设置用户user] 失败：', err)
      }
    })

    // 更新用户头像
    var avatarUrl = userInfo.avatarUrl;
    wx.getImageInfo({
      src: avatarUrl,
      success: function (sres) {
        const cloudPath = 'avatars/' + openid + '.jpg'
        var filePath = sres.path
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[更新头像] 成功：', res)
          },
          fail: e => {
            console.error('[更新头像] 失败：', e)
          },
          complete: () => {

          }
        })
      }
    })

    delete user._id
    delete user._openid
    // 更新用户信息
    db.collection('user')
      .doc(openid)
      .update({
        data: user,
        success: res => {
          console.debug('更新用户信息成功', res)
        },
        fail: err => {
          console.error('更新用户信息失败：', err)
        }
      })
  },
  cancel_order() {
    var that = this
    var total_num = -that.data.order_info.order_items[0].num - that.data.order_info.order_items[1].num

    wx.showModal({
      title: '操作提示',
      content: '确定要取消报名吗？',
      showCancel: true,
      cancelText: '再想想',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          db.collection('order').doc(that.data.order_info._id)
            .update({
              data: {
                status: 1
              },
              success: res => {
                app.globalData.order_info = {
                  status: 2
                }
                that.setData({
                  order_info: {
                    status: 2
                  },
                  locks: true,
                  'onshare_text.title_text': '取消报名成功'
                })
                var act_data = {
                  total_num
                }
                that.update_act('update_total_num', that.data.act._id, act_data)
                wx.showToast({
                  title: '取消成功',
                })
                console.debug('订单更新成功')
              },
              fail: err => {}

            })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },
  to_sign_in() {
    var that = this
    var order_data = {
      is_sign_in: true
    }

    wx.showModal({
      title: '操作提示',
      content: '请到达现场后再签到，确定现在签到吗？',
      showCancel: true,
      confirmText: '现在签到',
      cancelText: '取消',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          db.collection('order').doc(that.data.order_info._id).update({
            data: order_data,
            success: res => {
              console.log('[签到] 成功：', res)

              wx.showToast({
                title: '操作成功',
              })
              that.setData({
                'order_info.is_sign_in': true
              })

            },
            fail: err => {
              console.error('[签到] 失败：', err)
              wx.showToast({
                title: '操作失败',
              })

            }
          })


        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })



  },
  signup(e) {
    console.log('点击了立即报名按钮')
    if (this.data.orders == 0) {
      this.set_order_info()
    } else {
      this.cancel_order()
    }
  },
  onGetUserInfo: function (e) {

    var that = this
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    if (e.detail.userInfo) {

      app.globalData.userInfo = e.detail.userInfo
      that.setData({

        userInfo: e.detail.userInfo
      })

    }
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {


    if (this.c1) {
      this.c1.stop()
      console.log('[定时器停止了]')
    } else {
      console.log('[页面没有定时器]')
    }

  },
  onHide() {
    // 等到需要关闭监听的时候调用 close() 方法
    console.debug('关闭watcher')
    this.order_watcher.close()
    this.scoreboard_watcher.close()
    this.act_watcher.close()
  },
  onChange(e) {
    console.log('onChange', e)
    this.setData({
      current: e.detail.key,
    })
  },
  set_order_info() {
    this.setData({
      show_sign_info: true,
    })
  },
  onClose() {
    console.log('onClose')
    this.setData({
      locks: false
    })


  },
  onClickAlert() {

    this.onClose2()

    wx.showModal({
      title: '免责声明',
      showCancel: false,
      content: '本小程序为非盈利软件，旨在为用户提供一个方便简便的报名管理工具，活动为用户自行组织与本小程序无关，活动中可能造成的一切损失和伤害，开发者不承担任何责任，特此声明！',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  submit_order() {
    this.onSignup()
  },
  onClose2() {
    this.setData({
      show_sign_info: false
    })
  },
  onShareAppMessage: function (res) {

    var that = this;
    var shareMsg = {}
    var path = ''

    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log('来自页面内转发按钮')
    }

    path = '/pages/start/details/details?fr=share&id=' + that.data.act_id

    if (that.data.act.group_name) {
      path = '/pages/start/details/details?fr=share&id=' + that.data.act_id + '&opengid=' + that.data.act.group_name
    }

    console.log('[转发的path]', path)

    var imageUrl = that.data.imageUrl

    var title = that.data.act.act_mode == 'simple' ? '报名啦~' : '报名啦~\n' + that.data.act.title.replace(/[\r\n]/g, " ")

    return {
      title,
      path,
      imageUrl
    }

  },
  call(e) {
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.cellphone //仅为示例，并非真实的电话号码
    })
  },
  toList() {
    wx.navigateTo({
      url: 'signupList?realorders=' + JSON.stringify(this.data.realorders) + '&group=' + this.data.act.group,
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    })
  },
  toGroupDetail() {

    wx.navigateTo({
      url: '../vipcard/detail/index?fr=actdetail&id=' + this.data.act.group_id + '&group_name=' + this.data.act.group_name
    })

  },
  to_call() {
    wx.makePhoneCall({
      phoneNumber: this.data.act.contact_info.cellphone
    })
  },
  // 建立连接
  doConnect: function (action) {
    var that = this;

    if (that.data.client && that.data.client.isConnected()) {
      wx.showToast({
        title: '不要重复连接'
      })
      return
    } else {
      console.debug('开始连接============')
      that.setData({
        is_connect: false
      })
    }

    var host = ''
    var password = ''
    var userName = ''
    var client_id = that.data.openid + new Date().getTime()

    console.debug('连接准备完成=============', host, client_id, password, userName)

    var client = new Client(host, 443, client_id);

    client.connect({
      password,
      userName,
      useSSL: true,
      cleanSession: true,
      keepAliveInterval: 60,
      timeout: 120,
      onSuccess: async function () {

        app.globalData.is_connect = true
        console.debug('mqtt连接成功', client)
        that.setData({
          is_connect: true
        })

        that.data.client = client
        that.setOnConnectionLost(that.connectionLost)
        client.onConnectionLost = function (responseObject) {
          wx.closeSocket();
          if (typeof that.data.onConnectionLost === 'function') {
            return that.data.onConnectionLost(responseObject)
          }
          if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
          }
        }
        let wxKey = 'ledongmao'
        console.debug(wxKey)
        let msg = ''
        let p_res = ''
        let act = that.data.act
        act._id = that.data.act_id
        if (action == 'update_act_status') {
          msg = act.status == 1 ? '@所有人 活动取消了！\n\n' : '@所有人 活动恢复了！回复 报名 立即参加~\n\n'

          let msg_new = await wx.cloud.callFunction({
            name: 'act',
            data: {
              action: 'get_order_text',
              act_data: act,
              act_msg: msg
            }
          })
          console.debug(msg_new)
          msg = msg_new.result.msg

          p_res = util.get_wx_say_req(wxKey, 'Text', msg, that.data.act.roomid, '')
          console.debug('p_res-------------', p_res)
          that.publish(p_res[0], p_res[1])
          wx.showToast({
            title: '已同步到群',
          })
        } else if (action == 'update_is_active') {

          msg = !that.data.act.is_active ? '@所有人 报名截止了！\n\n' : '@所有人 报名开启了！回复 报名 立即参加~\n\n'

          let msg_new = await wx.cloud.callFunction({
            name: 'act',
            data: {
              action: 'get_order_text',
              act_data: act,
              act_msg: msg
            }
          })
          console.debug(msg_new)
          msg = msg_new.result.msg

          p_res = util.get_wx_say_req(wxKey, 'Text', msg, that.data.act.roomid, '')
          console.debug('p_res-------------', p_res)
          that.publish(p_res[0], p_res[1])
          wx.showToast({
            title: '已同步到群',
          })
        } else if (action == 'add_act' &&
          that.data.act.status == 0 && that.data.act.is_active) {
          msg = '@所有人 报名啦！回复 报名 立即参加~\n\n'

          let msg_new = await wx.cloud.callFunction({
            name: 'act',
            data: {
              action: 'get_order_text',
              act_data: act,
              act_msg: msg
            }
          })
          console.debug(msg_new)
          msg = msg_new.result.msg

          p_res = util.get_wx_say_req(wxKey, 'Text', msg, that.data.act.roomid, '')
          console.debug('p_res-------------', p_res)
          that.publish(p_res[0], p_res[1])
          wx.showToast({
            title: '已同步到群',
          })
          that.setData({
            fr: ''
          })
        } else {

        }

        that.dodisConnect()


      },
      onFailure: err => {
        console.debug('连接失败fail=========', err)
        // wx.showToast({
        //   title: '连接失败'
        // })
        that.setData({
          is_connect: false
        }, res => {
          // wx.showToast({
          //   title: '上线连接失败!',
          // })
        })
      }
    });
  },
  // 主动断开连接
  dodisConnect: function (e) {
    var that = this
    // console.debug(that.data.client)
    that.data.client.disconnect()
  },
  publish: function (topic, msg, qos = 1, retained = false) {
    console.debug(topic)
    console.debug(msg)

    var that = this
    // 发布
    var client = this.data.client;
    if (client && client.isConnected()) {
      var message = new Message(msg);
      message.destinationName = topic;
      message.qos = qos;
      message.retained = retained;
      console.debug('publish发送成功============')
      // wx.showToast({
      //   title: '下发成功!',
      // })
      return client.send(message);
    }
    console.debug('publish发送失败')
    wx.showToast({
      title: '消息发布失败!',
    })

  },
  setOnConnectionLost: function (onConnectionLost) {
    var that = this
    if (typeof onConnectionLost === 'function') {
      this.data.onConnectionLost = onConnectionLost

    }
  },
  connectionLost(e) {
    var that = this
    app.globalData.is_connect = false

    // wx.showToast({
    //   title: '应用离线了!',
    // })

    console.debug('失去连接', e)
    that.setData({
      is_connect: false
    })

  }
})