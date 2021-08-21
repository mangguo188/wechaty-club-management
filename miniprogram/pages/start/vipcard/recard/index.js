// miniprogram/pages/start/vipcard/recard/index.js
const config = require('../../../../config')
const util = require('../../../../utils/util')

const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pagenum: 0,
    iscreator: false,
    costs: 1,
    datas: 1,
    msg2: {
      icon: '../../assets/images/iconfont-order.png',
      title: '还没有记录~',
      text: '',
      buttons: [],
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(options)
    var that = this
    app.setConfig(function (CONFIG) {
      that.setData({
        CONFIG
      })
    })

    this.setData({
      member_info: app.globalData.member_info,
      group_info: app.globalData.group_info,
      user: app.globalData.user,
      member_info: app.globalData.member_info
    }, res => {
      this.getOrders()
      this.onQueryPagenum()
      db.collection('room')
        .where({
          roomid: that.data.member_info.roomid
        })
        .get().then(res => {
          that.setData({
            room: res.data.length > 0 ? res.data[0] : {}
          })
        })

    })


    if (options.iscreator == "true") {
      this.setData({
        iscreator: true
      })
    }



  },
  todetails(e) {
    console.log(e)
    var id = e.currentTarget.dataset.aid
    console.log(id)

    wx.navigateTo({
      url: '/pages/start/details/details?fr=recard&id=' + id
    })
  },
  getOrders() {
    var that = this
    // 获取全部订单
    console.log(app.globalData.openid)

    var orderQuery = {}
    orderQuery = {
      roomid: that.data.member_info.roomid,
      wxid: that.data.user.wxid
    }


    // 按分页查询订单
    db.collection('order')
      .where(orderQuery)
      .orderBy('create_time', 'desc')
      .skip(that.data.pagenum * 20)
      .limit(20)
      .get({
        success: res_orders => {
          console.log('[查询到的全部活动订单]', res_orders.data)
          // 判断是否已报名活动
          var orders = res_orders.data
          let datas = 0
          if (res_orders.data.length > 0) {
            datas = res_orders.data
          }
          that.setData({
            datas,
            orders
          })

        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '查询记录失败'
          })
          console.error('[数据库查询记录] 失败：', err)
        }
      })








  },
  formatDatas(datas) {
    var that = this

    var perCost = 0
    for (var i = 0; i < datas.length; i++) {
      perCost = datas[i].act.perCost || 0
      datas[i].cost = (datas[i].boysNum + datas[i].girlsNum) * perCost
      datas[i].createdTimeAPP = util.formatTime(new Date(datas[i].create_time))

    }

    if (that.data.pagenum == 0) {
      that.setData({
        datas: datas
      })
    } else {
      that.setData({
        datas: that.data.datas.concat(datas)
      })
    }


  },
  onQueryPagenum: function () {
    var that = this

    // 查询已报名订单，计算总页数
    db.collection('order')
      .where({
        roomid: that.data.member_info.roomid,
        wxid: that.data.user.wxid
      })
      .count()
      .then(res => {
        console.log('当前用户全部已参加活动数量', res.total)
        // 设置需分几次取
        that.setData({
          batchTimes: Math.ceil(res.total / 20),
          total_count: res.total
        })
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

  },


})