// pages/start/add/add.js
const util = require('../../../utils/util')
const chooseLocation = requirePlugin('chooseLocation');
const watch = require("../../../utils/watch.js");

import {
  $wuxCalendar,
  $wuxToptips
} from '../../../dist/index'
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const DAYS = ['日', '一', '二', '三', '四', '五', '六']

// 报名活动
const sign_in_act = async (act, member, add_num, is_bench, create_time) => {
  let ts = new Date().getTime()
  return await db.collection('order').add({
    data: {
      act_id: act._id,
      roomid: act.roomid,
      wxid: member.wxid,
      nick: member.nick,
      alias: member.alias,
      status: 0,
      total_num: add_num,
      update_time: ts,
      create_time,
      act_decs: act.decs,
      utc_time: util.formatTime_md2(ts)[5],
      is_bench,
      member
    }
  })


}


Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkeds: {},
    checkeds_num: 0,
    templates: [
      '水平要求：男生3级及以上，女生2级及以上\n费用:60元/人',
      '1⃣报退请在规定时间之前，否则正常收取鸽子费。\n2⃣ 拒绝空降！\n3⃣ 一局一换！\n4⃣ 前场队员别回头😱\n5⃣ 球前勿🍻， 场边不🚬\n6⃣ 注意保管好个人财物💰\n7⃣ 有疾病者请量力而行， 如运动中出现任何意外事故责任自负⚠',
      '凡是报名的球友请在报名时把活动费（30元)以微信红包转到盟主豆你玩（缪戎)。否则报名无效，感谢大家的理解和支持。'
    ],
    time: '12:01',
    date: '2021-3-6',
    is_group_show: false,
    group_index: 'null',
    act_mode: 2,
    show_set_group: false,
    show_view_portlet: false,
    show_set_act_type: false,
    show_set_time: false,
    cycle_datas: [],
    current_date: [],
    current: 0,
    filter(type, options) {
      if (type === 'minute') {
        return options.filter(option => option % 5 === 0);
      }
      return options;
    },
    // 活动类型选项
    act_types: [{
      name: '羽毛球',
      code: 0
    }, {
      name: '聚餐',
      code: 1
    }, {
      name: '其他',
      code: 2
    }],
    // 开始时间选项
    multiArray: [
      ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
      ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
    ],
    multiIndex: [14, 0],
    view_portlets: [{
      name: '任何人可见',
      code: 0
    }, {
      name: '仅会员可见',
      code: 1
    }],
    added_info: '',
    params: {
      open_now: true,
      act_mode: 'advanced',
      // 俱乐部
      group_id: '',
      // 俱乐部名称
      group_name: '',
      // 活动类型
      type: {
        code: 0,
        name: '羽毛球'
      },
      // 活动日期
      act_date: {
        date: [2019, 8, 30],
        text: '',
        text_ch: ''
      },
      // 开始时间
      act_time: {
        hour: [14, 0],
        text: '14:00',
        end_hour: [16, 0],
        end_text: '16:00'
      },
      // 活动时长
      duration: 2,
      hour_in_advance: 0,
      open_time: 0,
      start_time: 0,
      end_time: 0,
      // 人数限制
      maximum: 18,
      // 地点
      location: {},
      // 地点名称
      location_name: '',
      // 收费标准
      price: {
        type: 0,
        type_text: '固定收费',
        male_price: 0,
        women_price: 0
      },
      // 只允许会员报名
      only_allow_members: true,
      // 非会员加价
      nonmember_extra: 0,
      // 单人最大报名人数
      single_upper_limit: 9,
      // 开启替补报名
      open_waitlist: true,
      // 报名截止时间
      deadline: 0,
      // 活动名称
      title: '9月22日 周六 14:00-17:00',
      // 活动说明
      decs: '',
      // 是否周期活动
      is_cycle: false,
      // 可见范围
      visible: {
        code: 1,
        text: '仅会员可见'
      },
      // 联系人信息
      contact_info: {
        name: '',
        cellphone: ''
      },
      total_num: 0,
      // 活动状态,0正常、1已取消
      status: 0,
      is_active: true
    }
  },
  switch_open_now: function (e) {
    this.setData({
      'params.open_now': e.detail.value
    });
  },
  showModal() {
    this.setData({
      is_show_modal: !this.data.is_show_modal
    })
  },
  to_add_init_member() {
    wx.navigateTo({
      url: '/pages/start/vipcard/cardlist/index?fr=add_act&&id=' + this.data.room._id + '&roomid=' + this.data.room._id,
    })
  },

  use_this(e) {
    console.debug(e)
    let that = this
    let index = e.currentTarget.dataset.index
    that.setData({
      'params.decs': that.data.templates[index],
      'params.remarks': that.data.templates[index]
    }, res => {
      that.showModal()
    })
  },
  TimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },
  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  set_added_info() {
    var that = this
    var added_info = ''
    if (that.data.params.location_name) {
      added_info = added_info + that.data.params.location_name + ' '
    }
    if (that.data.params.act_date.text) {
      added_info = added_info + that.data.params.act_date.text + ' '
    }
    if (that.data.params.act_time.text) {
      added_info = added_info + that.data.params.act_time.text + ' '
    }
    if (that.data.params.group_name) {
      added_info = added_info + that.data.params.group_name + ' '
    }
    that.setData({
      added_info
    })
  },
  set_group_show() {
    let that = this
    this.setData({
      is_group_show: !that.data.is_group_show
    })
  },
  set_group(e) {
    console.debug(e)
    let that = this
    let group_index = e.currentTarget.dataset.index
    this.setData({
      group_index,
      'params.group_id': that.data.wx_groups[group_index]._id,
      'params.group_name': that.data.wx_groups[group_index].name

    }, res => {
      that.set_group_show()
    })
  },
  clear_group() {
    this.setData({
      group_index: 'null'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    console.debug('页面载入携带的数据', ops)
    console.debug(app.globalData.act_info)
    var that = this

    watch.setWatcher(this); // 设置监听器，建议在onLoad下调用
    app.setConfig(function (CONFIG) {
      that.setData({
        CONFIG
      })
    })

    if (!app.globalData.act_info) {
      that.init_data()
    } else {
      that.setData({
        params: app.globalData.act_info
      })
    }

    this.setData({
      act_mode: ops.type_code ? Number(ops.type_code) : 2,
      'params.act_mode': ops.type_code && ops.type_code == '1' ? 'advanced' : 'simple',
      fr: ops.fr || '',
      ops,
      cur_group: app.globalData.cur_group || '',
      room: app.globalData.room
    }, () => {
      // that.get_groups()
      let multiIndex = that.data.multiIndex
      if (app.globalData.act_info) {
        let new_multiIndex = []
        new_multiIndex.push(that.data.params.act_time.hour[0])
        new_multiIndex.push(Math.ceil(that.data.params.act_time.hour[1] / 5))
        multiIndex = new_multiIndex
      }
      that.setData({
        multiIndex
      })


      if (ops.type_code && ops.type_code == '1') {
        that.setData({
          'params.price.type': 3
        })
        wx.setNavigationBarTitle({
          title: '创建活动'
        })
      } else if (ops.type_code && ops.type_code == '4') {
        wx.setNavigationBarTitle({
          title: '关联微信群'
        })
      } else if (ops.type_code && ops.type_code == '2') {
        wx.setNavigationBarTitle({
          title: '创建接龙'
        })
      } else if (ops.type_code && ops.type_code == '3') {
        wx.setNavigationBarTitle({
          title: '创建通知'
        })
      }

    })

    that.set_added_info()

    if (!app.globalData.act_info) {
      var cur_time = new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
      var cur_date = [cur_time.getFullYear(), cur_time.getMonth(), cur_time.getDate()]

      var cur_text = cur_time.getFullYear() + '-' + (cur_time.getMonth() + 1) + '-' + cur_time.getDate() + ' 周' + DAYS[cur_time.getDay()]

      that.setData({
        'params.act_time': {
          hour: [14, 0],
          text: '14:00',
          end_hour: [16, 0],
          end_text: '16:00'
        },
        'params.act_date': {
          date: cur_date,
          text: cur_text,
          text_ch: (cur_time.getMonth() + 1) + '月' + cur_time.getDate() + '日 周' + DAYS[cur_time.getDay()]
        },
        time: (cur_time.getHours() + 1) + ':00'
      }, () => {
        that.setStartTime()
      })
    }

  },
  watch: {
    params: function (newVal, oldVal) {
      console.log(newVal, oldVal);
      this.set_added_info()
    }
  },
  get_member() {
    var that = this
    db.collection('member').where({
        group_id: this.data.params.group_id,
        _openid: app.globalData.openid
      }).get()
      .then(res => {
        var member_info = res.data[0]
        app.globalData.member_info = member_info
        var user = app.globalData.user
        if (member_info.group_nickname) {
          that.setData({
            'params.contact_info.name': member_info.group_nickname,
            'params.contact_info.cellphone': member_info.cellphone || user.cellphone || ''
          })
        }
        this.setData({
          member_info: res.data[0]
        })
      })
  },
  init_data() {
    var that = this
    let cur_time = this.dateFormat("YYYY-mm-dd HH:MM", new Date())
    cur_time = cur_time.split(' ')
    this.setData({
      time: cur_time[1],
      date: cur_time[0]
    })

    if (app.globalData.user) {
      var user = app.globalData.user
      that.setData({
        'params.contact_info.name': user.real_name || user.userInfo.nickName || '',
        'params.contact_info.cellphone': user.cellphone || '',
        user
      })
    }
  },
  dateFormat(fmt, date) {
    console.debug(date)
    // let ret;
    // const opt = {
    //   "Y+": date.getFullYear().toString(), // 年
    //   "m+": (date.getMonth() + 1).toString(), // 月
    //   "d+": date.getDate().toString(), // 日
    //   "H+": date.getHours().toString(), // 时
    //   "M+": date.getMinutes().toString(), // 分
    //   "S+": date.getSeconds().toString() // 秒
    //   // 有其他格式化字符需求可以继续添加，必须转化成字符串
    // };
    // for (let k in opt) {
    //   ret = new RegExp("(" + k + ")").exec(fmt);
    //   if (ret) {
    //     fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
    //   };
    // };
    // console.debug(fmt)
    // return fmt;

    var d = date
    var year = d.getFullYear();
    var month = change(d.getMonth() + 1);
    var day = change(d.getDate());
    var hour = change(d.getHours());
    var minute = change(d.getMinutes());
    var second = change(d.getSeconds());

    function change(t) {
      if (t < 10) {
        return "0" + t;
      } else {
        return t;
      }
    }
    var time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
    console.debug(time)

    return time


  },
  get_groups() {
    console.debug('获取当前用户管理的全部俱乐部')
    var that = this

    app.getOpenid(function (openid, user) {

      app.getGroups(function (groups, groups_id, members) {
        console.debug(groups)
        console.debug(members)

        var self_groups = []
        var wx_groups = []
        for (var i = 0; i < members.length; i++) {
          if (members[i].role == 'admin' && members[i].status == 0) {
            self_groups.push(groups[i])
          }
          if (members[i].openGid) {
            wx_groups.push({
              name: members[i].openGid,
              _id: members[i]._id
            })
          }
        }

        that.setData({
          groups: self_groups,
          openid,
          wx_groups
        }, () => {
          console.debug('获取俱乐部成功')
          if (self_groups.length == 0) {

            that.setData({
              show_set_group: false
            })

            wx.showModal({
              title: '没有可用俱乐部',
              content: '先去创建一个俱乐部吧？',
              cancelText: '返回',
              confirmText: '去创建',
              success(res) {

                if (res.confirm) {
                  console.log('用户点击确定')

                  wx.redirectTo({
                    url: '/pages/start/vipcard/add/index',
                  })
                } else if (res.cancel) {
                  console.log('用户点击取消')
                  wx.navigateBack({

                  })
                }


              }
            })


          } else {
            if (that.data.ops.type_code == '1') {

              if (that.data.ops.fr === "groupdetail") {
                console.debug('来源为groupdetail，设置来源群信息')
                that.setData({
                  'params.group_id': that.data.ops.group_id || '',
                  'params.group_name': that.data.ops.group_name || '',
                }, () => {
                  that.get_member()
                })
              } else {

                that.setData({
                  'params.group_id': self_groups[0]._id,
                  'params.group_name': self_groups[0].name,
                })

              }

            }
          }
        })
      })
    })

  },
  not_in_group(e) {
    console.debug('not_in_groupe', e)
    var wx_groups_on = this.data.wx_groups
    var index = e.currentTarget.dataset.index
    wx_groups_on.splice(index, 1)

    this.setData({
      wx_groups: wx_groups_on
    })
    this.remove_member(e.currentTarget.dataset.id)

  },
  remove_member(_id) {
    db.collection('member').doc(_id).remove().then(res => {
      console.debug('remove======', _id)
    })
  },
  toggleActionSheet(e) {
    console.debug('关闭选择窗口')

    this.setData({
      show_set_group: false,
      show_view_portlet: false,
      show_set_act_type: false
    })
  },
  select_one(e) {
    console.debug('选择了一个选项', e)

    var that = this
    if (that.data.show_set_group) {
      that.setData({
        'params.group_id': e.detail._id,
        'params.group_name': e.detail.name
      }, () => {
        that.get_member()
      })
    } else if (that.data.show_view_portlet) {
      that.setData({
        'params.visible.code': e.detail.code,
        'params.visible.text': e.detail.name
      })
    } else if (that.data.show_set_act_type) {
      var act_type = {}
      act_type.code = e.detail.code
      act_type.name = e.detail.name

      that.setData({
        'params.type': act_type
      })
    } else {
      console.debug('选择一个选项，位置选项')
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.debug('页面显示===========', app.globalData)
    var that = this

    let checkeds = {}
    if (app.globalData.checkeds) {
      checkeds = app.globalData.checkeds
      that.setData({
        checkeds,
        checkeds_num: Object.keys(checkeds).length
      })
    }

    // 刷新活动地点
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    if (location != null) {
      that.setData({
        'params.location': db.Geo.Point(location.longitude, location.latitude),
        'params.location_name': location.name
      })
    }

    // 刷新活动周期数据
    console.debug('刷新活动周期数据app.globalData.cycle', app.globalData.cycle)
    if (app.globalData.cycle_datas && app.globalData.cycle_datas.length) {
      var cycle_datas = app.globalData.cycle_datas
      var cycle_datas_text = ''
      for (var i = 0; i < cycle_datas.length; i++) {
        cycle_datas_text = cycle_datas_text + '每周' + cycle_datas[i].cycle_day.join("、") + '【' + cycle_datas[i].act_time.text + '】~~~'
      }
      that.setData({
        cycle_datas_text: cycle_datas_text,
        cycle_datas: app.globalData.cycle_datas,
        'params.is_cycle': true
      })
    }

    // 刷新活动说明
    console.debug('刷新活动说明app.globalData.act_details', app.globalData.act_details)
    if (app.globalData.act_details) {
      that.setData({
        'params.decs': app.globalData.act_details
      })
    }

    // 刷新收费标准
    console.debug('刷新收费标准app.globalData.charge_datas', app.globalData.charge_datas)
    if (app.globalData.charge_datas) {
      that.setData({
        'params.price': app.globalData.charge_datas
      })
    }
    // 刷新联系信息
    console.debug('获取用户信息app.globalData.contact_info', app.globalData.contact_info)
    if (app.globalData.contact_info) {
      that.setData({
        'params.contact_info': app.globalData.contact_info
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  // 选择活动俱乐部
  set_act_group() {

    if (this.data.wx_groups.length > 0) {
      this.setData({
        show_set_group: true
      })
      app.globalData.wx_groups = this.data.wx_groups
      // wx.navigateTo({
      //   url: 'setting/index?action=set_act_group',
      // })

    } else {
      // this.get_groups()
      wx.showModal({
        title: '没有可选群',
        content: '先创建活动==>将活动分享到群===>点击群内分享卡片进入，即可完成加入群，之后可以再创建活动时选择关联微信群',
      })
    }
  },
  clear_act_group() {
    this.setData({
      'params.group_id': '',
      'params.group_name': ''
    })
  },
  // 设置活动类型
  set_act_type() {
    this.setData({
      show_set_act_type: true
    })

  },
  // 设置活动日期
  openCalendar() {
    var that = this
    const now = new Date()
    const minDate = now.getTime() - 24 * 60 * 60 * 1000
    const maxDate = minDate + 24 * 60 * 60 * 1000 * 30
    $wuxCalendar().open({
      value: '',
      minDate,
      maxDate,
      onChange: (values, displayValues) => {
        console.log('onChange', values, displayValues)
        var t0 = new Date(displayValues[0])

        that.set_act_date([t0.getFullYear(), t0.getMonth(), t0.getDate()])

      },
    })
  },
  clear_act_date() {
    this.setData({
      'params.act_date.text': ''
    })
  },
  set_act_date(date) {
    var that = this
    var new_date = new Date()
    new_date.setFullYear(date[0], date[1], date[2])

    var act_date_text = new_date.getFullYear() + '-' + (new_date.getMonth() + 1) + '-' + new_date.getDate() + ' 周' + DAYS[new_date.getDay()]

    var act_date = {}
    act_date.text = act_date_text
    act_date.text_ch = `${(new_date.getMonth() + 1)}月${new_date.getDate()}日 周${DAYS[new_date.getDay()]}`
    act_date.date = date


    that.setData({
      'params.act_date': act_date,
      date: `${date[0]}-${date[1]}-${date[2]}`
    })
    that.setStartTime()

  },
  // 设置开始时间
  to_set_act_time() {
    this.setData({
      show_set_time: true
    })
  },
  clear_act_time() {
    this.setData({
      'params.act_time.text': ''
    })
  },
  bindendTimeChange: function (e) {
    console.log('bindendTimeChange，设置的时间数据：', e.detail.value)
    let that = this
    var multiIndex = []
    multiIndex = e.detail.value
    var hour = [
      Number(that.data.multiArray[0][multiIndex[0]]),
      Number(that.data.multiArray[1][multiIndex[1]]),
    ]
    console.log('设置的时间数据：', hour)

    that.setData({
      multiIndex
    }, res => {
      that.set_act_time(hour)
    })

  },
  set_act_time(hour) {
    var that = this
    var hh = hour[0]
    var mm = hour[1]

    if (mm < 10) {
      mm = '0' + mm
    }
    var starthhmm = hh + ':' + mm
    var act_time = {}
    act_time.hour = hour
    act_time.text = starthhmm

    that.setData({
      'params.act_time': act_time,
      time: act_time.text
    }, () => {
      this.setStartTime()
    })


  },
  // 更新活动开始时间
  setStartTime() {

    var that = this
    var act_date = that.data.params.act_date.date
    var act_time_hour = that.data.params.act_time.hour
    var cur_time = new Date()

    console.log('设置日期')
    cur_time.setFullYear(act_date[0], act_date[1], act_date[2])

    // cur_time = new Date(cur_time)
    console.log('设置时间')
    cur_time.setHours(act_time_hour[0], act_time_hour[1], 0, 0)
    cur_time = cur_time.getTime()
    var end_time = cur_time + that.data.params.duration * 60 * 60 * 1000

    var hour = [new Date(end_time).getHours(), new Date(end_time).getMinutes()]
    var hh = hour[0]
    var mm = hour[1]

    if (mm < 10) {
      mm = '0' + mm
    }
    var starthhmm = hh + ':' + mm
    let open_time = cur_time - that.data.params.hour_in_advance * 60 * 60 * 1000
    that.setData({
      current_date: [cur_time],
      'params.start_time': cur_time,
      'params.end_time': end_time,
      'params.title': that.data.params.act_date.text_ch + ' ' + that.data.params.act_time.text + '-' + starthhmm,
      'params.act_time.end_hour': hour,
      'params.act_time.end_text': starthhmm,
      'params.open_time': open_time,
      'params.open_time_utc': that.dateFormat("YYYY-mm-dd HH:MM", new Date(open_time))
    })

  },
  // 设置时长
  set_duration(e) {
    var duration = e.detail.value
    var end_time = this.data.start_time + duration * 60 * 60 * 1000
    this.setData({
      'params.duration': duration
    }, () => {
      this.setStartTime()
    })
  },
  // 设置自动生效时间
  set_open_time(e) {
    let that = this
    var hour_in_advance = e.detail.value
    var open_time = this.data.params.start_time - hour_in_advance * 60 * 60 * 1000
    this.setData({
      'params.hour_in_advance': hour_in_advance,
      'params.open_time': open_time,
      'params.open_time_utc': that.dateFormat("YYYY-mm-dd HH:MM", new Date(open_time))
    }, () => {
      // this.setStartTime()
    })
  },
  // 设置最大人数
  set_maximum(e) {
    this.setData({
      'params.maximum': e.detail.value
    })
  },
  // 设置活动地点
  add_location() {
    var that = this
    const key = that.data.CONFIG.tm_key; //使用在腾讯位置服务申请的key
    const referer = that.data.CONFIG.referer; //调用插件的app的名称
    // const location = JSON.stringify({
    //   latitude: 39.89631551,
    //   longitude: 116.323459711
    // });
    // & location=${ location }

    const category = '羽毛球馆,运动健身';
    wx.navigateTo({
      url: `plugin://chooseLocation/index?key=${key}&referer=${referer}&category=${category}`
    });
  },
  clear_location() {
    this.setData({
      'params.location': {},
      'params.location_name': ''
    })
  },
  // 设置收费标准
  set_charge_type() {
    app.globalData.charge_datas = this.data.params.price

    wx.navigateTo({
      url: 'setting/index?action=set_charge_type',
    })
  },
  clear_act_price() {
    this.setData({
      'params.price.type': 3
    })
  },
  // 设置是否允许非会员报名
  set_only_allow_members(e) {
    this.setData({
      'params.only_allow_members': !e.detail.value
    })
  },
  // 设置是否是周期活动
  set_is_cycle(e) {
    this.setData({
      'params.is_cycle': e.detail.value
    })
  },
  // 设置非会员加价
  set_nonmember_extra(e) {
    this.setData({
      'params.nonmember_extra': e.detail.value
    })
  },
  // 设置单人最大报名人数
  set_single_upper_limit(e) {
    this.setData({
      'params.single_upper_limit': e.detail.value
    })
  },
  // 设置是否开启替补报名
  set_open_waitlist(e) {
    this.setData({
      'params.open_waitlist': e.detail.value
    })
  },
  // 设置报名截止时间
  set_deadline(e) {
    this.setData({
      'params.deadline': e.detail.value
    })
  },
  // 设置价格
  set_price(e) {
    let price = {
      type: 0,
      type_text: '固定收费',
      male_price: e.detail.value,
      women_price: e.detail.value
    }
    this.setData({
      'params.price': price
    })
  },
  // 设置活动名称
  set_title() {
    wx.navigateTo({
      url: 'setting/index?action=set_title',
    })
  },
  // 设置活动说明
  set_decs() {
    wx.navigateTo({
      url: 'setting/index?action=set_decs',
    })
  },
  // 设置活动周期
  set_cycle() {
    wx.navigateTo({
      url: 'setting/index?action=set_cycle',
    })
  },
  // 设置可见范围
  set_visible() {
    this.setData({
      show_view_portlet: true
    })
  },
  // 设置联系信息
  set_contact_info() {
    wx.navigateTo({
      url: 'setting/index?action=set_contact_info',
    })
  },
  // 上一步下一步
  pre_step() {
    const current = this.data.current - 1 < 0 ? 2 : this.data.current - 1
    this.setData({
      current
    })
  },
  next_step() {
    const current = this.data.current + 1 > 2 ? 0 : this.data.current + 1
    this.setData({
      current
    })
  },
  // 发布俱乐部活动
  onAdd: function () {
    console.log('add')
    var that = this
    if (!that.data.params.group_name) {
      that.showToptips('请选择一个群')
    } else if (!that.data.params.title) {
      that.showToptips('活动名称必填')
    } else if (!that.data.params.decs) {
      that.showToptips('活动详情必填')
    } else if (!that.data.params.contact_info.cellphone) {
      that.showToptips('电话必填')
    } else if (!that.data.params.contact_info.name) {
      that.showToptips('联系人必填')
    } else if (!that.data.params.is_cycle && that.data.params.start_time < new Date().getTime()) {
      that.showToptips('开始时间必须晚于当前')
    } else {



      wx.serviceMarket.invokeService({
        service: 'wxee446d7507c68b11',
        api: 'msgSecCheck',
        data: {
          "Action": "TextApproval",
          "Text": that.data.params.decs
        },
      }).then(res => {
        console.log(res)
        if (res.data.Response.EvilTokens.length > 0) {
          that.showToptips('内容不合规【' + res.data.Response.EvilTokens[0].EvilKeywords[0] + '】')
        } else {

          var params = that.data.params
          params = util.add_time('c', params)


          db.collection('user').doc(app.globalData.openid).update({
            data: {
              real_name: params.contact_info.name,
              cellphone: params.contact_info.cellphone
            }
          }).then(res => {
            console.debug('更新用户real_name成功')
          }).catch(console.error)

          if (!that.data.params.is_cycle) {
            db.collection('activity').add({
              data: params,
              success: res => {
                wx.showToast({
                  title: '发布成功',
                })
                console.log('活动创建成功', res._id)
                app.globalData.reload = true
                var act_id = res._id


                wx.redirectTo({
                  url: '/pages/start/details/details?fr=add&id=' + act_id,
                })

              },
              fail: err => {
                wx.showToast({
                  icon: 'none',
                  title: '发布失败'
                })
                console.error('活动保存失败：', err)
              }
            })
          } else {

            params.cycle_datas = that.data.cycle_datas

            db.collection('activity_template').add({
              data: params,
              success: res => {
                console.log('模板保存成功', res._id)
              },
              fail: err => {
                console.error('模板保存失败：', err)
              }
            })


            var d = new Date()
            var day = d.getDay() == 0 ? 7 : d.getDay()
            var date = d.getDate()

            var cycle_datas = that.data.cycle_datas

            for (var i = 0; i < 8; i++) {

              var cur_day = day + i
              if (cur_day > 7) {
                cur_day = cur_day - 7
              }

              for (var j = 0; j < cycle_datas.length; j++) {

                if (cycle_datas[j].cycle_day.indexOf(String(cur_day)) >= 0) {

                  var act = that.act_formatter(params, d, date + i, cycle_datas[j])

                  console.debug('act', act)
                  db.collection('activity').add({
                    data: act,
                    success: res => {
                      console.log('周期活动创建成功cur_day', cur_day)
                      console.log('周期活动创建成功j', j)
                      console.log('周期活动创建成功', res._id)
                    },
                    fail: err => {
                      console.error('周期活动创建失败', err)
                    }
                  })
                }
              }


            }

            wx.redirectTo({
              url: '/pages/start/vipcard/detail/index?fr=add&id=' + params.group_id
            })

          }

        }
      }).catch(err => {
        console.error('未通过', err)
      })


    }
  },
  // 发布接龙活动
  create_simple_act() {
    var that = this
    var simple_params = that.data.params
    simple_params.act_mode = 'simple'
    simple_params.act_type = '活动'
    if (that.data.room) {
      simple_params.roomid = that.data.room._id
      simple_params.roomnick = that.data.room.topic
      simple_params.ownerid = that.data.room.ownerid
    }

    simple_params.status = 0
    let start_time = simple_params.start_time
    let cur_time = new Date().getTime()

    if (simple_params.hour_in_advance == 0) {
      simple_params.open_time = 0
      simple_params.is_active = true
    } else {
      simple_params.open_time = simple_params.start_time - simple_params.hour_in_advance * 60 * 60 * 1000
      simple_params.is_active = false
    }

    simple_params.close_time = simple_params.start_time - simple_params.deadline * 60 * 60 * 1000


    if (simple_params.start_time < new Date().getTime()) {
      that.showToptips('开始时间不能早于现在')
    } else if (!simple_params.is_active && simple_params.open_time < cur_time) {
      that.showToptips('开放时间不能早于现在')
    } else if (simple_params.close_time + 5 * 60 * 1000 < cur_time) {
      that.showToptips('报名截止时间不能早于现在')
    } else if (simple_params.decs.length < 4) {
      that.showToptips('描述必须大于4个字')
    } else if (!simple_params.maximum) {
      that.showToptips('须设置人数限制')
    } else
    if (!simple_params.contact_info.name) {
      that.showToptips('联系人必填')
    } else if (!simple_params.contact_info.cellphone) {
      that.showToptips('电话必填')
    } else {
      // let cur_time = new Date(start_time)
      // simple_params.decs = cur_time.getFullYear() + '年' + (cur_time.getMonth() + 1) + '月' + cur_time.getDate() + '日周' + DAYS[cur_time.getDay()] + ' ' + that.data.time + '\n' + simple_params.location_name + '\n限' + simple_params.maximum + '人\n' + simple_params.decs

      simple_params.decs = `${simple_params.title}\n${simple_params.location_name}\n限${simple_params.maximum}人\n${simple_params.deadline==0?'':'取消已报名必须提前'+simple_params.deadline+'小时'}\n${simple_params.decs}`

      that.setData({
        is_adding: true
      })

      simple_params = util.add_time('c', simple_params)

      db.collection('activity').add({
        data: simple_params,
        success: res => {

          console.log('活动创建成功', res._id)
          simple_params._id = res._id

          // 更新联系人信息
          db.collection('user').doc(app.globalData.openid).update({
            data: {
              real_name: simple_params.contact_info.name,
              cellphone: simple_params.contact_info.cellphone
            }
          }).then(res => {
            console.debug('更新用户real_name成功')
          })

          let checkeds = that.data.checkeds
          if (Object.keys(checkeds).length) {
            for (let item in checkeds) {
              let sign_init = sign_in_act(simple_params, checkeds[item], 1, false, cur_time)
              console.debug(sign_init)
            }
          }

          // 更新截止报名时间
          if (simple_params.is_active) {
            let data = {
              is_active: true
            }
            that.update_act('update_is_active', res._id, data)
          }

          // 跳转到详情页
          wx.redirectTo({
            url: `/pages/start/details/details?fr=add&&is_active=${simple_params.is_active}&id=${res._id}`
          })
        },
        fail: err => {
          console.error('接龙活动创建失败', err)
        }
      })




    }
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
        console.log('[更新活动] 成功：', res)

      },
      fail: err => {
        console.error('[更新活动] 失败：', err)

      }
    })


  },
  update_act_status: async function (act_id, roomid) {

    let that = this
    let status = 0
    let update_act = await wx.cloud.callFunction({
      name: 'act',
      data: {
        action: 'update_act_status',
        act_id,
        status,
        roomid
      }
    })

  },

  set_name(e) {
    console.debug(e)
    this.setData({
      'params.contact_info.name': e.detail.value
    })
  },
  set_cellphone(e) {
    console.debug(e)
    this.setData({
      'params.contact_info.cellphone': e.detail.value
    })
  },
  // 设置接龙活动详情
  set_simple_act_decs(e) {
    console.log(e)
    var details = e.detail.value
    this.setData({
      'params.decs': details,
      'params.remarks': details
    })
  },
  // 格式化活动数据
  act_formatter(act_tem, d, cur_date, cycle_data) {
    var act = act_tem
    act.tem_id = act._id
    delete act.cycle_datas

    var act_time = d.setDate(cur_date)
    console.info('act_time', act_time)
    act_time = new Date(act_time)
    var year = act_time.getFullYear()
    var month = act_time.getMonth()
    var month_text = month + 1
    var date = act_time.getDate()

    act.act_date = {
      "text": year + "-" + month_text + '-' + date + " 周" + DAYS[act_time.getDay()],
      text_ch: month_text + '月' + date + "日 周" + DAYS[act_time.getDay()],
      "date": [
        year,
        month,
        date
      ]
    }
    act.act_time = cycle_data.act_time
    act.duration = cycle_data.duration

    act.title = act.act_date.text_ch + ' ' + act.act_time.text + '-' + act.act_time.end_text
    var start_time = new Date(year, month, date, act.act_time.hour[0], act.act_time.hour[1], 0, 0)
    act.start_time = start_time.getTime()

    act.end_time = start_time.getTime() + act.duration * 60 * 60 * 1000

    act.create_time_utc = new Date()
    act.create_time = act.create_time_utc.getTime()

    return act
  },
  // 错误提示组件
  showToptips(text) {
    $wuxToptips().show({
      icon: 'cancel',
      hidden: false,
      text: text,
      duration: 2000,
      success() {},
    })
  },
  // ++++++++++++++++++++++++++++++++++++++++++++++++++
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    app.globalData.checkeds = false
    app.globalData.members_f = false
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