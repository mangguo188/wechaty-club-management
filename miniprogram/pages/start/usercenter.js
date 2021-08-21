// miniprogram/pages/start/usercenter.js
var config = require('../../config')
var debug = config.debug
const util = require('../../utils/util')

const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    setting_info: {},
    debug: debug,
    debug_num: 0,
    handle_items: [
      {
        "name": "我发布的",
        "pageUrl": "/pages/start/list/list",
        icon: 'cuIcon-attentionfill',
        "image": "app_turntable128.png"
      }, {
        "name": "我收藏的",
        // "pageUrl": "/pages/start/list/favorite",
        icon: 'cuIcon-favorfill',
        "image": "app_turntable128.png"
      },
      // {
      //   "name": "活动",
      //   "pageUrl": "/pages/start/list/list",
      //   "image": "app_event128.png",
      //   icon: 'coupon'
      // },
      // {
      //   "name": "俱乐部",
      //   "pageUrl": "/pages/start/vipcard/index",
      //   "image": "app_announcement128.png",
      //   icon: 'vip-card'
      // },
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
      //   "name": "签到",
      //   "pageUrl": "../startPage/startPage",
      //   "image": "app_turntable128.png"
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
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    var that = this

    var that = this
    app.setConfig(function (CONFIG) {
      that.setData({
        CONFIG
      })
    })






  },
  update_user(openid, userInfo, e) {
    var that = this
    var user = app.globalData.user
    console.debug('user\n', user)
    user.userInfo = userInfo
    user.real_name = user.real_name || userInfo.nickName
    user.last_login = util.get_time()[0]
    user.last_login_utc = util.get_time()[1]

    app.globalData.user = user


    var url = e.currentTarget.dataset.url

    wx.navigateTo({
      url,
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })


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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this

    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }

  },
  to_add(e) {
    var that = this

    app.getOpenid(function (openid, user) {

      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              success: res => {
                that.update_user(app.globalData.openid, res.userInfo, e)

              }
            })
          } else {
            wx.navigateTo({
              url: 'login',
              success: function (res) { },
              fail: function (res) { },
              complete: function (res) { },
            })

          }
        }
      })

    })


    // 获取用户信息

  },
  debug_bt() {
    var debug_num = 0
    if (this.data.debug_num < 15) {
      debug_num = this.data.debug_num + 1
    } else {
      debug_num = 0
    }

    this.setData({
      debug_num: debug_num
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})