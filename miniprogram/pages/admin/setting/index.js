// miniprogram/pages/admin/setting/index.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    setting_info: {},
    cur_version: '1.1.8',
    show_set_version: false
  },
  onChange(e) {
    console.debug(e)
    var action = e.currentTarget.dataset.action
    var checked = e.detail
    var setting_info = this.data.setting_info
    setting_info[action] = checked
    var setting_info_id = setting_info._id

    db.collection('config')
      .doc(setting_info_id)
      .update({
        data: {
          [action]: checked
        }
      })
      .then(res => {
        this.setData({
          setting_info
        })
        wx.showToast({
          icon: 'none',
          title: '设置成功'
        })
      })
      .catch(err => {
        console.error(err)
        wx.showToast({
          icon: 'none',
          title: '设置失败'
        })
      })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this

    app.setConfig(function(CONFIG) {
      that.setData({
        CONFIG
      })
      db.collection('config')
        .where({
          code: 'setting_info'
        })
        .get()
        .then(res => {
          console.debug(res)
          var all_version = res.data

          for (var i = 0; i < res.data.length; i++) {
            all_version[i].name = all_version[i].version
          }

          that.setData({
            setting_info: all_version[0],
            all_version
          })
        })
        .catch(console.error)
    })
  },
  set_version() {
    this.setData({
      show_set_version: true
    })
  },
  toggleActionSheet(e) {
    console.debug('关闭选择窗口')

    this.setData({
      show_set_version: false
    })
  },
  select_one(e) {
    console.debug('选择了一个选项', e)

    var that = this

    that.setData({
      setting_info: e.detail
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})