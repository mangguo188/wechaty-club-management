// pages/start/list/list.js
const config = require('../../../config')
const util = require('../../../utils/util')
const db = wx.cloud.database()
const _ = db.command

const app = getApp()
Page({
  data: {
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    TabCur: 0,
    scrollLeft: 0,
    iconList: [{
      icon: 'picfill',
      color: 'yellow',
      badge: 0,
      name: '活动'
    }, {
      icon: 'cardboardfill',
      color: 'red',
      badge: 120,
      name: '场馆'
    }, {
      icon: 'noticefill',
      color: 'olive',
      badge: 22,
      name: '比赛'
    }, {
      icon: 'recordfill',
      color: 'orange',
      badge: 1,
      name: '教练'
    }, {
      icon: 'upstagefill',
      color: 'cyan',
      badge: 0,
      name: '排行榜'
    }, {
      icon: 'clothesfill',
      color: 'blue',
      badge: 0,
      name: '皮肤'
    }, {
      icon: 'discoverfill',
      color: 'purple',
      badge: 0,
      name: '发现'
    }, {
      icon: 'questionfill',
      color: 'mauve',
      badge: 0,
      name: '帮助'
    }, {
      icon: 'commandfill',
      color: 'purple',
      badge: 0,
      name: '问答'
    }, {
      icon: 'brandfill',
      color: 'mauve',
      badge: 0,
      name: '版权'
    }],
    gridCol: 4,
    filterbar: false,
    fr: '',
    handle_items: [
      // {
      //   "name": "发布",
      // "pageUrl": "/pages/start/index",
      //   "image": "app_turntable128.png"
      // }, 
      {
        "name": "活动",
        "pageUrl": "/pages/start/list/list",
        "image": "app_event128.png"
      },
      {
        "name": "俱乐部",
        "pageUrl": "/pages/start/vipcard/index",
        "image": "app_announcement128.png"
      },
      {
        "name": "签到",
        "pageUrl": "../startPage/startPage",
        "image": "app_turntable128.png"
      },
      // {
      //   "name": "消息",
      //   "pageUrl": "../notice/noticeList",
      //   "image": "app_system128.png"
      // },
      // {
      //   "name": "账本",
      //   "pageUrl": "../startPage/startPage",
      //   "image": "app_vip128.png"
      // },
      // {
      //   "name": "会费",
      //   "pageUrl": "../startPage/startPage",
      //   "image": "app_vip128.png"
      // },
      // {
      //   "name": "结算",
      //   "pageUrl": "../startPage/startPage",
      //   "image": "app_vip128.png"
      // }
    ],
    current: 'tab1',
    index: 0,
    tabs: [
      // {
      //   key: 'tab0',
      //   title: '最近一周\n14日~21日',
      //   content: 'Content of tab 1',
      // },
      {
        key: 'tab1',
        title: '今天\n9月14日',
        content: 'Content of tab 1',
      },
      {
        key: 'tab2',
        title: '明天\n9月15日',
        content: 'Content of tab 2',
      }, {
        key: 'tab3',
        title: '后天\n9月16日',
        content: 'Content of tab 1',
      },
      {
        key: 'tab4',
        title: '两天后\n9月17日~',
        content: 'Content of tab 1',
      }
    ],
    batchTimes: 0,
    pagenum: 0,
    relatedBatchTimes: 0,
    relatedPagenum: 0,
    createdBatchTimes: 0,
    createdPagenum: 0,
    datas: 1,
    relateddatas: 1,
    selfdatas: 1,
    msg: {
      icon: '../../assets/images/iconfont-order.png',
      title: '暂无活动推荐~',
      text: '',
      buttons: [],
    },
    fulldatas: [],
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
  to_room_details(e) {
    console.log(e)
    var id = e.currentTarget.dataset.roomid

    wx.navigateTo({
      url: '/pages/start/vipcard/detail/index?fr=room_list&roomid=' + id
    })
  },
  getUserProfile(e) {
    let that = this
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      lang: 'zh_CN',
      desc: '用于匹配用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.debug(res)
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        }, res => {
          that.update_user(that.data.openid, that.data.userInfo)
        })
      }
    })
  },
  update_user: async function (openid, userInfo) {
    var that = this
    var user = app.globalData.user
    console.debug('user\n', user)
    user.userInfo = userInfo
    user.real_name = user.real_name || userInfo.nickName
    user.last_login = util.get_time()[0]
    user.last_login_utc = util.get_time()[1]

    app.globalData.user = user

    console.debug(userInfo)

    if (that.data.ops.user_hash) {
      let user_hash_res = await wx.cloud.callFunction({
        name: 'user',
        data: {
          action: 'get_user_hash',
          body: userInfo
        }
      })
      let user_hash = user_hash_res.result
      if (that.data.ops.user_hash == user_hash) {
        user.wait_peer = true
        user.wxid = that.data.ops.wxid
      } else {
        that.setData({
          peer_list: []
        })
      }

    } else {
      let wx_user_res = await db.collection('wx_user').where({
        nickName: userInfo.nickName,
        gender: userInfo.gender
      }).get()

      console.debug('匹配到的用户', wx_user_res)
      if (wx_user_res.data.length) {
        user.peer_list = wx_user_res.data
        user.wait_peer = true
        user.wxid = wx_user_res.data[0].wxid
      }
      that.setData({
        peer_list: wx_user_res.data
      })
    }

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
          app.globalData.roomids = ''
          if (user.wxid) {
          that.get_hot_acts(user.wxid, 0)
          }
          that.setData({
            user
          })
        },
        fail: err => {
          console.error('更新用户信息失败：', err)
        }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    util.print(options)
    var that = this

    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    app.setConfig(function (CONFIG) {
      that.setData({
        CONFIG
      })
    })
    this.init()
    wx.showShareMenu({
      withShareTicket: true
    })
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    that.setData({
      fr: options.fr || '',
      ops: options
    })
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  },
  get_hot_acts: async function (wxid, page) {
    let acts = await wx.cloud.callFunction({
      name: 'act',
      data: {
        action: 'get_hot_acts',
        wxid,
        page
      }
    })
    util.print(acts)
    this.setData({
      relateddatas: acts.result.data
    })
  },
  toGroupDetail(e) {
    console.log(e)
    var group_id = e.currentTarget.dataset.aid
    wx.navigateTo({
      url: '/pages/start/vipcard/detail/index?fr=act_list&id=' + group_id + '&group_name=' + group_id
    })
  },
  get_opengid() {
    var that = this
    app.getShareTiket(function (globalData) {
      if (globalData.openGid) {
        console.debug('[get_opengid] :', globalData.openGid)
        var openGid = globalData.openGid
        var datas = {
          openGid
        }

        datas = util.add_time('c', datas)

        var member_id = openGid + '_' + app.globalData.openid

        db.collection('member').doc(member_id).set({
          data: datas,
          success: res => {
            console.debug('[数据库][查询member记录]', res)
          },
          fail: err => {
            console.debug('[数据库][查询member记录]', err)
          }

        })
      }
      that.setData({
        openGid: globalData.openGid
      })
    })
  },
  init() {
    // console.debug('开始初始化------------------')
    var that = this
    var cur_time = new Date()
    cur_time.setHours(0, 0, 0, 0)
    console.debug('当前时间', cur_time)
    cur_time = cur_time.getTime()
    console.debug('当前时间戳', cur_time)

    var tabs = [
      // {
      //   key: 'tab0',
      //   title: '最近一周\n' + util.formatTime_md(cur_time + 60 * 60 * 24 * 1000 * 7)[0] + '前',
      //   content: 'Content of tab 1',
      //   start: util.formatTime_md(cur_time)[1],
      //   end: util.formatTime_md(cur_time + 60 * 60 * 24 * 1000 * 8)[1]
      // },
      {
        key: 'tab1',
        title: '今天\n' + util.formatTime_md(cur_time)[0],
        content: 'Content of tab 1',
        start: util.formatTime_md(cur_time)[1],
        end: util.formatTime_md(cur_time)[2]
      },
      {
        key: 'tab2',
        title: '明天\n' + util.formatTime_md(cur_time + 60 * 60 * 24 * 1000)[0],
        content: 'Content of tab 2',
        start: util.formatTime_md(cur_time + 60 * 60 * 24 * 1000)[1],
        end: util.formatTime_md(cur_time + 60 * 60 * 24 * 1000)[2]
      }, {
        key: 'tab3',
        title: '后天\n' + util.formatTime_md(cur_time + 60 * 60 * 24 * 1000 * 2)[0],
        content: 'Content of tab 1',
        start: util.formatTime_md(cur_time + 60 * 60 * 24 * 1000 * 2)[1],
        end: util.formatTime_md(cur_time + 60 * 60 * 24 * 1000 * 2)[2]
      },
      {
        key: 'tab4',
        title: util.formatTime_md(cur_time + 60 * 60 * 24 * 1000 * 3)[3] + '后\n' + util.formatTime_md(cur_time + 60 * 60 * 24 * 1000 * 3)[0] + '~',
        content: 'Content of tab 1',
        start: util.formatTime_md(cur_time + 60 * 60 * 24 * 1000 * 3)[1],
        end: util.formatTime_md(cur_time + 60 * 60 * 24 * 1000 * 30)[2]
      }
    ]

    that.setData({
      tabs: tabs,
      cur_time
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    var that = this
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
    var that = this
    app.getOpenid(function (openid, user) {
      // 获取来源群组
      that.get_opengid()
      that.setData({
        openid,
        user: app.globalData.user,
        wxid: app.globalData.user.wxid || '',
        cur_time: new Date().getTime()
      }, res => {
        if (user.wxid) {
          that.get_hot_acts(app.globalData.user.wxid, 0)
        } else {
          that.setData({
            relateddatas: []
          })
        }
      })
    })
    app.getGroups(function (rooms, roomids, rooms_dic) {
      that.setData({
        owner_rooms: rooms,
        rooms_dic,
        roomids,
        groups_is_done: true,
      }, res => {

      })
    })
  },
  onTabsChange(e) {
    var that = this
    console.log('onTabsChange', e)
    const {
      key
    } = e.detail
    const index = this.data.tabs.map((n) => n.key).indexOf(key)
    this.setData({
      key,
      index,
      current: key
    }, () => {

    })
  },
  todetails(e) {
    console.log(e)
    var id = e.currentTarget.dataset.aid
    var i = e.currentTarget.dataset.index
    console.log(id)
    wx.navigateTo({
      url: '/pages/start/details/details?fr=list&id=' + id
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this
    app.getOpenid(function (openid) {
      that.setData({
        openid,
        user: app.globalData.user,
        wxid: app.globalData.user.wxid || ''
      }, res => {
        that.get_hot_acts(app.globalData.user.wxid, 0)
      })
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  buttonClicked(e) {
    wx.navigateTo({
      url: '/pages/start/add/add',
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    })
  }
})