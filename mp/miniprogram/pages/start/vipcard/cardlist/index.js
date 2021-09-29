// miniprogram/pages/start/vipcard/cardlist/index.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

import util from '../../../../utils/util'
import Pinyin from '../../../../utils/pinyin'


Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkeds: {},
    checkeds_num: 0,
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    hidden: true,
    member_name: '',
    members: [],
    members_loading: true,
    is_cearter: true,
    handle_items: [
      // {
      //   "name": "+ 接龙报名",
      //   "pageUrl": "/pages/start/add/add?type_code=2",
      //   icon: 'cluster-o',
      //   "image": "app_turntable128.png"
      // },
      // {
      //   "name": "+ 高级活动",
      //   "pageUrl": "/pages/start/add/add?type_code=1",
      //   icon: 'friends-o',
      //   "image": "app_turntable128.png"
      // },
      {
        name: "会员 15 人",
        pageUrl: "/pages/start/list/list",
        image: "app_event128.png",
        icon: 'friends'
      },
      {
        name: "会费余额 1300.00 元",
        pageUrl: "/pages/start/vipcard/index",
        image: "app_announcement128.png",
        icon: 'gold-coin'
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    console.log(options)

    var that = this
    app.setConfig(function (CONFIG) {
      that.setData({
        CONFIG
      })
    })

    this.setData({
      SystemInfo: app.globalData.SystemInfo
    })

    this.setData({
      member_info: app.globalData.member_info,
      group_info: app.globalData.group_info,
      group_id: options.id,
      roomid: options.roomid,
      fr: options.fr
    }, res => {})
    let checkeds = {}
    if (app.globalData.checkeds) {
      checkeds = app.globalData.checkeds

      that.setData({
        checkeds,
        checkeds_num: Object.keys(checkeds).length
      })
    }
    if (app.globalData.members_f) {
      let members_f = app.globalData.members_f
      that.setData({
        members_f,
        listCur: members_f[0].title
      })
    } else {
      this.get_all_members(options.id, options.roomid)
    }


  },
  do_checked(e) {
    console.debug(e)
    let i = e.currentTarget.dataset.i
    let sub = e.currentTarget.dataset.sub
    let members_f = this.data.members_f
    members_f[i].datas[sub].checked = !members_f[i].datas[sub].checked
    let checkeds = this.data.checkeds
    let key = i + '_' + sub
    if (members_f[i].datas[sub].checked) {
      checkeds[key] = members_f[i].datas[sub].member
    } else {
      delete checkeds[key]
    }
    app.globalData.checkeds = checkeds
    app.globalData.members_f = members_f
    this.setData({
      members_f,
      checkeds,
      checkeds_num: Object.keys(checkeds).length
    })
  },
  pinyinSort(name) {
    var pinyinArray = new Array()
    for (var bukn = 0; bukn < name.length; bukn++) {
      var o = new Object()
      var ken = Pinyin.getSpell(name[bukn].alias || name[bukn].nick, function (charactor, spell) {
        console.log(charactor, spell);
        return spell[1];
      });
      o.name = name[bukn].alias || name[bukn].nick
      o.pinyin = ken.split(',').join('')
      o.member = name[bukn]
      pinyinArray.push(o)
    }
    console.log("pinyinArray")
    console.log(pinyinArray)
    // pinyinArray = pinyinArray.sort(compare("pinyin"))
    let map = {
      title: '',
      datas: []
    }
    pinyinArray.forEach((item, index) => {
      if (!map[item.pinyin[0].toUpperCase()]) {
        map[item.pinyin[0].toUpperCase()] = {
          title: item.pinyin[0].toUpperCase(),
          datas: []
        }
      }
      map[item.pinyin[0].toUpperCase()].datas.push({
        name: item.name,
        pinyin: item.pinyin,
        member: item.member
      })
    })
    console.log("map")
    console.log(map)
    var turn = new Array()
    var letters = "*ABCDEFGHIJKLNMOPQRSTUVWXYZ".split('');
    for (var i = 1; i < letters.length; i++) {
      if (map[letters[i]]) {
        var obj = new Object()
        //自己改改命名改成自己需要的
        obj.title = letters[i]
        obj.datas = map[letters[i]].datas
        turn.push(obj)
      }
    }
    console.log("trun")
    console.log(turn)
    return turn;
  },
  get_all_members(group_id, roomid) {
    var that = this
    wx.cloud.callFunction({
      name: 'member',
      data: {
        group_id,
        roomid
      },
      success: res => {
        console.debug('get_all_members: ', res.result)
        var members = res.result.data
        let members_f = that.pinyinSort(members)
        that.setData({
          members,
          members_loading: false,
          members_f,
          listCur: members_f[0].title
        }, res => {

        });
      },
      fail: err => {
        console.error('调用失败', err)
      }
    })
  },
  onChange(e) {
    console.debug(e)
    this.setData({
      member_name: e.detail
    })
  },
  onClear() {
    var that = this
    this.setData({
      member_name: ''
    })
    that.get_all_members(that.data.group_id, that.data.roomid)
  },
  onSearch(e) {
    console.debug(e)
    var that = this
    if (that.data.member_name) {

      db.collection('member')
        .where({
          group_nickname: db.RegExp({
            regexp: that.data.member_name,
            options: 'i',
          }),
          group_id: that.data.group_id
        })
        // .where(_.or[{
        //   group_nickname: db.RegExp({
        //     regexp: that.data.member_name,
        //     options: 'i',
        //   })

        // }, {
        //     cellphone: db.RegExp({
        //       regexp: that.data.member_name,
        //       options: 'i',
        //     })
        //   }])
        .get()
        .then(res => {
          console.debug(res)
          if (res.data.length == 0) {
            wx.showToast({
              title: '无相关记录',
              icon: 'none'
            });
          } else {
            that.setData({
              members: res.data
            })
          }
        })

    } else {
      that.get_all_members(that.data.group_id, that.data.roomid)
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    let that = this;
    // wx.createSelectorQuery().select('.indexBar-box').boundingClientRect(function (res) {
    //   that.setData({
    //     boxTop: res.top
    //   })
    // }).exec();
    // wx.createSelectorQuery().select('.indexes').boundingClientRect(function (res) {
    //   that.setData({
    //     barTop: res.top
    //   })
    // }).exec()
  },
  //获取文字信息
  getCur(e) {
    this.setData({
      hidden: false,
      listCur: this.data.members_f[e.target.id].title,
    })
  },
  setCur(e) {
    this.setData({
      hidden: true,
      listCur: this.data.listCur
    })
  },
  //滑动选择Item
  tMove(e) {
    let y = e.touches[0].clientY,
      offsettop = this.data.boxTop,
      that = this;
    //判断选择区域,只有在选择区才会生效
    if (y > offsettop) {
      let num = parseInt((y - offsettop) / 20);
      this.setData({
        listCur: that.data.members_f[num]
      })
    };
  },
  //触发全部开始选择
  tStart() {
    this.setData({
      hidden: false
    })
  },
  //触发结束选择
  tEnd() {
    this.setData({
      hidden: true,
      listCurID: this.data.listCur
    })
  },
  indexSelect(e) {
    let that = this;
    let barHeight = this.data.barHeight;
    let members_f = this.data.members_f;
    let scrollY = Math.ceil(members_f.length * e.detail.y / barHeight);
    for (let i = 0; i < members_f.length; i++) {
      if (scrollY < i + 1) {
        that.setData({
          listCur: members_f[i].title,
          movableY: i * 20
        })
        return false
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this
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
  todetails(e) {
    console.log(e)
    var index = e.currentTarget.dataset.index
    var id = e.currentTarget.dataset.aid
    var group_id = e.currentTarget.dataset.group_id
    console.log(id)
    app.globalData.member_info = this.data.members[index]
    wx.navigateTo({
      url: '../recard/index?fr=cardlist&id=' + id + '&group_id=' + group_id
    })
  },
})