// pages/start/list/list.js
const db = wx.cloud.database()
const app = getApp()
const _ = db.command

const util = require('../../../utils/util')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    peer_list: [],
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    hot_rooms: [],
    rooms: [],
    owner_rooms: [],
    setting_info: {},
    batchTimes: 0,
    pagenum: 0,
    groups_is_done: false,
    members: [],
    msg2: {
      icon: '../../assets/images/iconfont-order.png',
      title: '还没有加入任何群组哦~',
      text: '',
      buttons: [],
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    that.setData({
      fr: options.fr || '',
      setting_info: app.globalData.setting_info
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
  getUserInfo(e) {
    let that = this
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    that.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    }, res => {
      console.debug(res)
      that.update_user(that.data.openid, that.data.userInfo)
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    var that = this
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
    app.getOpenid(function (openid, user) {
      that.setData({
        openid,
        user: app.globalData.user,
        wxid: app.globalData.user.wxid || ''
      }, res => {
        // that.get_hot_rooms()
        that.get_owner_rooms()
        if (user.wxid == 'tyutluyc') {
          that.get_all_rooms()
        }
      })
    })
  },
  remove_member(_id) {
    db.collection('member').doc(_id).remove().then(res => {
      console.debug('remove======', _id)
    })
  },
  get_hot_rooms: async function () {

    let res_hot_rooms = await wx.cloud.callFunction({
      name: 'group',
      data: {
        action: 'get_hot_rooms'
      }
    })
    util.print(res_hot_rooms)

    this.setData({
      hot_rooms: res_hot_rooms.result.data,
      groups_is_done: true
    })

  },
  // 获取或更新相关的全部活动
  get_owner_rooms: function () {
    var that = this
    app.getGroups(function (rooms, roomids) {
      that.setData({
        owner_rooms: rooms,
        roomids,
        groups_is_done: true,
      }, res => {

      })
    })
  },
  get_all_rooms() {
    let that = this

    wx.cloud.callFunction({
        name: 'group',
        data: {
          action: 'get_all_rooms'
        }
      }).then(res => {
        util.print('全部群组')
        console.debug(res)
        this.setData({
          rooms: res.result.data
        })

      })
      .catch(err => {
        console.error(err)
      })
  },
  todetails(e) {
    console.log(e)
    var index = e.currentTarget.dataset.index

    // wx.navigateTo({
    //   url: '/pages/start/vipcard/detail/index?fr=list' + '&group_name=' + this.data.groups[index].openGid + '&_id=' + this.data.groups[index]._id
    // })


    console.debug('app.globalData.room---------------------------', app.globalData.room)

    wx.navigateTo({
      url: '/pages/start/vipcard/detail/index?fr=list' + '&roomid=' + this.data.rooms[index].roomid + '&_id=' + this.data.rooms[index]._id
    })

  },

  to_room_details(e) {
    console.log(e)
    var id = e.currentTarget.dataset.id

    wx.navigateTo({
      url: '/pages/start/vipcard/detail/index?fr=room_list&roomid=' + id
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
    console.log("page上拉触底")
    var that = this;
    var pagenum = that.data.pagenum

    if (pagenum < that.data.batchTimes - 1) {
      pagenum = pagenum + 1

      this.setData({
        pagenum
      })
      that.get_all_rooms()


    } else {

    }



  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onChange(e) {
    const {
      checkedItems,
      items
    } = e.detail
    const params = {}

    console.log('checkedItems, items')

    console.log(checkedItems, items, items)

    checkedItems.forEach((n) => {
      if (n.checked) {
        if (n.value === 'updated') {
          const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(' ')
          params.sort = n.value
          params.order = selected
        } else if (n.value === 'stars') {
          params.sort = n.value
          params.order = n.sort === 1 ? 'asc' : 'desc'
        } else if (n.value === 'forks') {
          params.sort = n.value
        } else if (n.value === 'filter') {
          n.children.filter((n) => n.selected).forEach((n) => {
            if (n.value === 'language') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(' ')
              params.language = selected
            } else if (n.value === 'query') {
              const selected = n.children.filter((n) => n.checked).map((n) => n.value).join(' ')
              params.query = selected
            }
          })
        }
      }
    })

    this.getRepos(params)
  },
  getRepos(params = {}) {
    const language = params.language || 'javascript'
    const query = params.query || 'react'
    const q = `${query}+language:${language}`
    const data = Object.assign({
      q,
    }, params)

    wx.showLoading()
    wx.request({
      url: `https://api.github.com/search/repositories`,
      data,
      success: (res) => {
        console.log(res)

        wx.hideLoading()

        this.setData({
          repos: res.data.items.map((n) => Object.assign({}, n, {
            date: n.created_at.substr(0, 7),
          })),
        })
      },
    })
  },
  onOpen(e) {
    this.setData({
      pageStyle: 'height: 100%; overflow: hidden',
    })
  },
  onClose(e) {
    console.log('确定')
    this.setData({
      pageStyle: '',
    })
  },
  buttonClicked(e) {
    wx.switchTab({
      url: '/pages/start/index',
      success: function (res) {},
      fail: function (res) {},
      complete: function (res) {},
    })
  },
  add() {
    var that = this
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


    let wx_user_res = await db.collection('wx_user').where({
      nickName: userInfo.nickName
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


    // wx.navigateTo({
    //   url: '/pages/start/vipcard/add/index',
    //   success: function (res) {

    //   },
    //   fail: function (res) {},
    //   complete: function (res) {
    //     console.log(res)
    //   },
    // })


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
          that.get_owner_rooms()
          that.setData({
            user
          })
        },
        fail: err => {
          console.error('更新用户信息失败：', err)
        }
      })
  },
})