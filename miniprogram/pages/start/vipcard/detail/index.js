import {
  $wuxCountDown,
  $wuxDialog,
  $wuxActionSheet,
  $wuxBackdrop
} from '../../../../dist/index'
import util from '../../../../utils/util'
// import {
//   $wuxDialog
// } from '../../../dist/index'
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    filterbar: false,
    member_info: '',
    visible: false,
    avatar: '',
    userInfo: '',
    onShare: false,
    iscreator: false,
    currentIndex: 0,
    group_id: '',
    group_info: 0,
    locks: 0,
    activities: 1,
    msg2: {
      icon: '../../assets/images/iconfont-order.png',
      title: '近期没有活动哦~',
      text: '',
      buttons: [],
    },
    buttons: [{
        name: '发布活动',
        icon: '',
        url: '',
        action: 'to_create_act',
        action_code: 0
      },
      {
        name: '管理活动',
        icon: '',
        url: '',
        action: 'to_actlist',
        action_code: 0
      }, {
        name: '活动模板',
        icon: '',
        url: '',
        action: 'to_actlist',
        action_code: 1
      },
      // {
      //   name: '会员会费',
      //   icon: '',
      //   url: '',
      //   action: 'to_cardlist',
      //   action_code: 0
      // },
      // {
      //   name: '财物账本',
      //   icon: '',
      //   url: '',
      //   action: 'to_account_book',
      //   action_code: 0
      // },
      {
        name: '设置',
        icon: '',
        action: 'to_setting',
        action_code: 0
      }
    ],
    items: [{
        type: 'radio',
        label: '状态',
        value: 'updated',
        children: [{
            label: '全部',
            value: 'all',
          },
          {
            label: '报名中',
            value: 'online',
          },
          {
            label: '已截止',
            value: 'offline',
          },
        ],
        groups: ['001'],
      },
      {
        type: 'text',
        label: '创建的',
        value: 'forks',
        groups: ['002'],
      },
      {
        type: 'sort',
        label: '最新',
        value: 'startTime',
        groups: ['003'],
      },
      {
        type: 'filter',
        label: '筛选',
        value: 'filter',
        children: [{
            type: 'radio',
            label: '时间区间',
            value: 'language',
            children: [{
                label: '本周',
                value: 'javascript',
              },
              {
                label: '本月',
                value: 'html',
              },
              {
                label: '最近三个月',
                value: 'css',
              },
              {
                label: '最近半年',
                value: 'typescript',
              },
            ],
          },
          {
            type: 'checkbox',
            label: '来源',
            value: 'query',
            children: [{
                label: '创建的',
                value: 'angular',
              },
              {
                label: '参加的',
                value: 'vue',
              },
            ],
          },
        ],
        groups: ['001', '002', '003'],
      },
    ],
  },
  open_bot() {
    let that = this
    wx.cloud.callFunction({
      name: 'group',
      data: {
        action: 'update_bot',
        roomid: that.data.roomid,
        params: {
          boot_open: !that.data.room.boot_open
        }
      },
      success: function (res) {
        console.log('[调用云函数:]', res.result)
        that.setData({
          'room.boot_open': !that.data.room.boot_open
        }, res => {
          wx.showToast({
            title: '启用成功',
          })
        })
      },
      fail: console.error
    })
  },
  to_add() {
    app.globalData.cur_group = this.data.group
    app.globalData.room = this.data.room
    wx.navigateTo({
      url: '/pages/start/add/add',
    })
  },
  on_click(e) {
    var that = this
    var index = e.currentTarget.dataset.index
    var action_code = that.data.buttons[index].action_code
    that.setData({
      action_code
    }, () => {
      that[that.data.buttons[index].action]()
    })

  },
  onChange(e) {
    console.log('onChange', e)
    if (!this.data.visible) {
      this.retain()
    } else {
      this.release()
    }
    this.setData({
      visible: !this.data.visible
    })
  },
  retain() {
    this.$wuxBackdrop.retain()
    this.setData({
      locks: this.$wuxBackdrop.backdropHolds
    })
  },
  release() {
    this.$wuxBackdrop.release()
    this.setData({
      locks: this.$wuxBackdrop.backdropHolds
    })
  },
  onLoad(ops) {
    var that = this
    this.data.ops = ops
    this.$wuxBackdrop = $wuxBackdrop()



    app.setConfig(function (CONFIG) {
      that.setData({
        CONFIG
      })
    })


    console.log('[onload]', ops)

    app.getOpenid(function (openid, user) {

      that.setData({
        openid,
        user,
        fr: ops.fr,
        group_id: ops._id || '',
        group_name: ops.group_name || '',
        roomid: ops.roomid || ''
      }, res => {
        db.collection('room').doc(that.data.roomid).get().then(res => {
          that.setData({
            room: res.data
          }, res => {
            that.getCardNum()
            that.get_member_info()
            that.init_view()
            app.globalData.room = that.data.room
          })
        })

      })

    })

    // wx.showShareMenu({
    //   withShareTicket: true
    // })

  },
  onShow() {
    var that = this
    console.log('[onshow]')

    that.init_view()
    that.onQuery()

    if (app.globalData.room) {
    that.setData({
      room: app.globalData.room
    })
    }

  },
  init_view() {

    var that = this
    var cur_time = new Date().getTime()
    db.collection('activity')
      .where(_.or([{
          roomid: that.data.roomid,
          // start_time: _.gte(cur_time)
        },
        // {
        //   group_name: that.data.group_name,
        //   start_time: _.gte(cur_time)
        // },
      ]))
      .orderBy('is_active', 'desc')
      .orderBy('status', 'asc')
      .orderBy('create_time', 'desc')
      .get({
        success: res => {
          console.log('[查询到的全部活动]', res.data)
          // 判断是否已报名活动
          if (res.data.length > 0) {
            // that.formatDatas(res.data)
            that.setData({
              activities: res.data,
              cur_time
            })
          } else {
            that.setData({
              activities: 0,
              cur_time
            })
          }
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询失败'
          })
          console.error('[数据库查询记录] 失败：', err)
        }
      })
  },
  set_vip: async function () {
    let that = this
    let room = that.data.room
    let content = `确定要为「${room.nick}」开通VIP？`

    if (room.is_vip) {
      content = `确定要取消「${room.nick}」的VIP？`
    }

    wx.showModal({
      title: '添加白名单',
      content,
      showCancel: true, //是否显示取消按钮
      cancelText: "否", //默认是“取消”
      confirmText: "是", //默认是“确定”
      success: function (res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } else {
          //点击确定

          wx.cloud.callFunction({
            name: 'group',
            data: {
              action: 'update_bot',
              roomid: room.roomid,
              params: {
                is_vip: !room.is_vip
              }
            },
            success: function (res) {
              console.log('[调用云函数:]', res.result)
              that.setData({
                'room.is_vip': !that.data.room.is_vip
              }, res => {
                wx.showToast({
                  title: '更新成功',
                })
              })
            },
            fail: console.error
          })
        }
      },
      fail: function (res) {}, //接口调用失败的回调函数
      complete: function (res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
    })
  },
  to_setting() {

    wx.navigateTo({
      url: '../setting/index?iscreator=true'
    })
  },
  to_cardlist() {

    wx.navigateTo({
      url: '../cardlist/index?id=' + (this.data.group_id || this.data.room._id) + '&roomid=' + this.data.roomid,
    })
  },
  to_record() {
    wx.navigateTo({
      url: "../recard/index?id=" + this.data.member_info._id + "&&group_id=" + this.data.group_id + "&&iscreator=" + this.data.iscreator
    })
  },

  to_actlist() {
    wx.navigateTo({
      url: '../actlist/index?fr=groupdetail&group_id=' + this.data.group_id + '&group_name=' + this.data.group_info.name + '&action_code=' + this.data.action_code,
    })
  },
  to_account_book() {
    wx.showToast({
      title: '功能开发中',
    })
  },
  to_create_act() {
    wx.navigateTo({
      url: '/pages/start/add/add?fr=groupdetail&group_id=' + this.data.group_id + '&group_name=' + this.data.group_info.name + '&type_code=1',
    })
  },
  formatDatas(datas) {
    var that = this
    var t0 = new Date().getTime()
    for (var i = 0; i < datas.length; i++) {

      datas[i].details = datas[i].details.length > 40 ? datas[i].details.substr(0, 40) + '...' : datas[i].details
      datas[i].realName = datas[i].realName.length > 8 ? datas[i].realName.substr(0, 8) + '...' : datas[i].realName
      datas[i].formatDatas = new Date(datas[i].createdTime + 8 * 60 * 60 * 1000)

      // console.log('[开始时间]：', datas[i].startTime, t0)
      if (!datas[i].startTime || datas[i].startTime <= t0) {
        datas[i].extra = '已截止'
      } else {
        datas[i].extra = '报名中'
      }
    }

    that.setData({
      activities: datas
    })


  },
  get_member_info() {
    var that = this

    db.collection('member')
      .where({
        roomid: that.data.roomid,
        wxid: app.globalData.user.wxid
      })
      .get()
      .then(res => {
        console.debug('查询会员信息成功', res)
        if (res.data.length > 0) {
          app.globalData.member_info = res.data[0]
          that.setData({
            member_info: res.data[0]
          })
          db.collection('order').where({
            roomid: that.data.roomid,
            wxid: app.globalData.user.wxid
          }).count().then(res => {
            util.print(res)
            that.setData({
              orders_count: res.total
            })
          })
        }
      }).catch(err => {
        console.error('查询会员信息失败', err)
      })
  },
  getCardNum: function () {
    var that = this
    var openid = app.globalData.openid

    // 查询已开卡数量
    db.collection('member')
      .where({
        roomid: that.data.roomid
      })
      .count()
      .then(res => {
        console.log('当前用户创建活动数量', res.total)
        that.setData({
          memberNum: res.total
        })
      })

  },
  todetails(e) {
    console.log(e)
    var id = e.currentTarget.dataset.aid
    console.log(id)

    wx.navigateTo({
      url: '/pages/start/details/details?fr=list&id=' + id
    })
  },
  copy_and_add(e) {
    console.log(e)
    let that = this
    var index = e.currentTarget.dataset.index
    let act = that.data.activities[index]
    delete act._id
    delete act._openid
    act.decs = act.remarks || act.decs

    app.globalData.act_info = act

    wx.navigateTo({
      url: '/pages/start/add/add?fr=room'
    })
  },
  getuser(openid) {
    var realName = ''
    var cellPhone = ''
    if (!this.data.userInfo) {
      // userinfo
      db.collection('users').where({
        _openid: openid
      }).get({
        success: res => {
          console.log('[获取的用户信息]', res.data)
          // 如果用户没有信息，添加用户
          if (res.data.length == 0) {
            wx.getSetting({
              success: res => {
                if (res.authSetting['scope.userInfo']) {
                  // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                  wx.getUserInfo({
                    success: res => {
                      app.globalData.userInfo = res.userInfo

                      var user = {
                        realName: res.userInfo.nickName,
                        cellPhone: '',
                        userInfo: res.userInfo
                      }
                      realName = res.userInfo.nickName
                      db.collection('users').add({
                        data: user,
                        success: res => {
                          console.log('[用户信息入库] 成功，记录 _id: ', res._id)
                          this.setData({
                            userInfo: app.globalData.userInfo,
                            userid: res.data
                          })
                        },
                        fail: err => {
                          wx.showToast({
                            icon: 'none',
                            title: '操作失败'
                          })
                          console.error('[数据库] [新增记录] 失败：', err)
                        }
                      })
                    }
                  })
                } else {
                  console.log('[用户未授权过个人信息]')
                }
              }
            })

          } else {
            console.log('[用户信息已存在]')
            realName = res.data[0].realName
            cellPhone = res.data[0].cellPhone ? res.data[0].cellPhone : ''
            this.setData({
              userInfo: res.data[0].userInfo,
              userid: res.data[0]._id
            })
          }
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询失败'
          })
          console.error('[数据库] [查询记录] 失败：', err)
        }
      })

    } else {

    }
  },
  createact() {
    var that = this
    wx.navigateTo({
      url: '../../add/add?fr=groupdetail&group_id=' + that.data.group_id + '&group_name=' + that.data.group_info.name,
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    })


  },

  onReady: function () {


  },
  getOpenGId: function (shareTicket) {
    var that = this
    wx.getShareInfo({
      shareTicket: shareTicket,
      success: function (res) {

        console.log('getOpenGId 拉取ShareInfo成功', res)

        var iv = res.iv;
        var encryptedData = res.encryptedData;
        // wx.login({
        //   success: function(r) {
        //     if (r.code) {
        //       var code = r.code; //登录凭证 
        //       if (code) {
        //         //2、调用获取用户信息接口 
        //         console.log('[获取code成功:]', code) // 3
        //         wx.cloud.callFunction({
        //           // 云函数名称
        //           name: 'decrypt',
        //           // 传给云函数的参数
        //           data: {
        //             code,
        //             iv,
        //             encryptedData
        //           },
        //           success: function(res) {
        //             console.log('[调用云函数接口decrypt:]', res.result) // 3
        //           },
        //           fail: console.error
        //         })

        //       } else {
        //         console.log('获取用户登录态失败！' + r.errMsg)
        //       }

        //     } else {}
        //   }
        // })

      },
      fail: function (err) {

        console.log('拉取ShareInfo失败', err)

      }
    })
  },
  // 获取或更新相关的全部活动
  onQuery: function () {
    var that = this
    var openid = that.data.openid
    var group_id = that.data.group_id

    console.log('[请求参数]', openid, group_id)


    var iscreator = false
    db.collection('group').doc(group_id).get({
      success: res => {
        console.debug('获取俱乐部信息', res)
        var group_info = res.data
        app.globalData.group_info = group_info

        var iscreator = group_info.owner == openid ? true : false


        var avatar = that.data.CONFIG.CLOUD_URL + '/logos/' + group_info._id + '.jpg'
        if (iscreator) {
          that.getCardNum()
        }
        // that.get_member_info()
        that.setData({
          group_info,
          iscreator,
          avatar
        })

      },
      fail: err => {
        // console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  onGetUserInfo: function (e) {

    var that = this
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      that.setData({
        userInfo: e.detail.userInfo,

      })

    }
  },

  onShareAppMessage: function (res) {
    var that = this;
    var shareMsg = {}
    var path = ''

    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log('来自页面内转发按钮')
    }

    var datas = JSON.stringify(that.data.act)

    path = '/pages/start/details/details?fr=share&id=' + that.data.group_id + '&datas=' + datas
    console.log('[转发的path]', path)

    var imageUrl = that.data.imageUrl

    return {
      title: '报名啦~\n' + that.data.group_info.title.replace(/[\r\n]/g, " "),
      path: path,
      imageUrl: imageUrl
    }

  },
  call(e) {
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.cellphone //仅为示例，并非真实的电话号码
    })
  }
})