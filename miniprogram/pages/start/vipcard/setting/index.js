// miniprogram/pages/start/vipcard/setting/index.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    app.setConfig(function (CONFIG) {
      that.setData({
        CONFIG
      })
    })
    this.setData({
      group_info: app.globalData.group_info || '',
      member_info: app.globalData.member_info || '',
      iscreator: options.iscreator,
      room: app.globalData.room,
      openid: app.globalData.openid,
      user: app.globalData.user
    });

  },
  open_bot() {
    let that = this
    wx.cloud.callFunction({
      name: 'group',
      data: {
        action: 'update_bot',
        roomid: that.data.room.roomid,
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
            title: '更新成功',
          })
        })
      },
      fail: console.error
    })
  },
  to_quit() {
    var that = this
    db.collection('member').doc(that.data.member_info._id).update({
      data: {
        status: 1
      },
      success: res => {
        app.globalData.member_info.status = 1
        app.globalData.has_quit = true
        app.globalData.groups = ''
        wx.showToast({
          icon: 'none',
          title: '退出成功',
          success: wx.navigateBack({})
        })

      },
      fail: console.error
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