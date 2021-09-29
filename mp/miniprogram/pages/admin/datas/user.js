// miniprogram/pages/admin/datas/user.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    users: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    let fr = options.fr || ''
    that.setData({
      fr
    })
    if (fr == 'user') {
      that.get_wait_users()
    } else if (fr == 'bot') {
      that.get_bot()
    } else if (fr == 'room') {
      that.get_room()
    } else {

    }
  },
  bind(e) {
    console.debug(e)
    let that = this
    let info = e.currentTarget.dataset
    let update_user_info = {
      openid: info.openid,
      data: {
        wxid: info.wxid,
        wait_peer: false
      }
    }

    wx.cloud.callFunction({
      name: 'user',
      data: {
        update_user_info
      },
      success: res => {
        console.log('[更新user] 成功：', res)
        let users = that.data.users
        users[info.index].wait_peer = false
        that.setData({
          users
        })

      },
      fail: err => {
        console.error('[更新user] 失败：', err)

      }
    })

  },
  get_room(){
    db.collection('room')
    .orderBy('update_time','desc')
    .get().then(res=>{
      this.setData({
        rooms: res.data
      })
    })
  },
  get_bot(wxKey) {
    wxKey = wxKey || 'ledongmao'
    db.collection('bot')
      .where({
        wxKey
      })
      .get()
      .then(res => {
        this.setData({
          bot: res.data[0]
        })
      })
  },
  get_wait_users() {
    let that = this
    db.collection('user').where({
      wait_peer: true
    })
      .orderBy('create_time', 'desc')
      .get()
      .then(res => {
        that.setData({
          users: res.data
        })
      })
  },
  to_done(e) {
    console.debug(e)
    let that = this
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