//app.js
const config = require('./config');
const util = require('./utils/util');
App({
  globalData: {
    openid: '',
    SystemInfo: '',
    shareTicket: '',
    openGid: '',
    userInfo: null,
    config: '',
    groups_has_new: false,
    groups: '',
    groups_id: '',
    members: '',
    ColorList: [{
        title: '嫣红',
        name: 'red',
        color: '#e54d42'
      },
      {
        title: '桔橙',
        name: 'orange',
        color: '#f37b1d'
      },
      {
        title: '明黄',
        name: 'yellow',
        color: '#fbbd08'
      },
      {
        title: '橄榄',
        name: 'olive',
        color: '#8dc63f'
      },
      {
        title: '森绿',
        name: 'green',
        color: '#39b54a'
      },
      {
        title: '天青',
        name: 'cyan',
        color: '#1cbbb4'
      },
      {
        title: '海蓝',
        name: 'blue',
        color: '#576b95'
      },
      {
        title: '姹紫',
        name: 'purple',
        color: '#6739b6'
      },
      {
        title: '木槿',
        name: 'mauve',
        color: '#9c26b0'
      },
      {
        title: '桃粉',
        name: 'pink',
        color: '#e03997'
      },
      {
        title: '棕褐',
        name: 'brown',
        color: '#a5673f'
      },
      {
        title: '玄灰',
        name: 'grey',
        color: '#8799a3'
      },
      {
        title: '草灰',
        name: 'gray',
        color: '#aaaaaa'
      },
      {
        title: '墨黑',
        name: 'black',
        color: '#333333'
      },
      {
        title: '雅白',
        name: 'white',
        color: '#ffffff'
      },
    ]
  },
  onLaunch: function (ops) {
    var that = this
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let capsule = wx.getMenuButtonBoundingClientRect();
        if (capsule) {
          this.globalData.Custom = capsule;
          this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
        } else {
          this.globalData.CustomBar = e.statusBarHeight + 50;
        }
      }
    })

    // 获取场景值
    util.print("[onLaunch] 场景值:")
    console.debug(ops.scene)
    // util.print(config)

    wx.clearStorageSync()
    that.globalData.scene = ops.scene;
    this.globalData.config = config

    // 获取客户端操作系统信息
    wx.getSystemInfo({
      success: function (res) {
        // console.debug(res)
        that.globalData.SystemInfo = res
      },
    })

    // 判断客户端是否支持云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {

      wx.cloud.init({
        traceUser: true,
      })
    }

    //  判断是否有程序更新
    if (wx.getUpdateManager) {
      const updateManager = wx.getUpdateManager()

      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        util.print('请求完新版本信息的回调hasUpdate')
        console.debug(res.hasUpdate)
      })

      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，请重启小程序',
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })

      })

      updateManager.onUpdateFailed(function () {
        // 新的版本下载失败
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，小程序部分功能无法使用，建议升级到最新微信版本后使用。'
      })
    }
  },
  onShow: function (ops) {
    util.print("[onShow] 本次场景值:")
    console.debug(ops.scene)
    var that = this
    if (ops && ops.scene == 1044) {
      //获取shareTicket
      that.globalData.shareTicket = ops.shareTicket

    }
    if (ops.scene) {
      this.globalData.scene = ops.scene
    }
  },
  getShareTiket: function (cb) {
    console.debug('开始获取opengid++++++++')
    var that = this
    if (that.globalData.openGid && that.globalData.openid) {
      typeof cb == "function" && cb(that.globalData.openGid, that.globalData.openid)
    } else if (that.globalData.shareTicket) {
      console.debug('that.globalData.shareTicket存在')


      wx.login({
        success: function (res1) {
          //获取code
          // console.debug('code-->' + res1)
          //调用云函数，破解opengid


          wx.getShareInfo({
            shareTicket: that.globalData.shareTicket,
            success: function (res) {
              // console.debug('getShareInfo-->', res)
              //获取encryptedData、iv

              var js_encryptedData = res.encryptedData
              var js_iv = res.iv
              var datas = {
                js_code: res1.code,
                encryptedData: js_encryptedData,
                iv: js_iv
              }

              console.debug(datas)


              wx.cloud.callFunction({
                name: 'opengid',
                data: datas,
                success: function (res2) {
                  // console.debug('打印opengid============================' + res2);
                  // console.debug('opengid is============================' + JSON.stringify(res2));
                  that.globalData.openGid = res2.result.data.openGId
                  that.globalData.openid = res2.result.openid
                  console.debug('openGid========================================' + that.globalData.openGid)
                  typeof cb == "function" && cb(that.globalData.openGid, that.globalData.openid)
                },
                fail: function (err) {
                  console.error('getShareTiket---err' + err)
                }
              })

            },
            fail: err => {
              console.error('getShareInfo', err)
            }
          })

        },
        fail: err => {
          console.error('login=========', err)
        }
      })

    } else {
      console.debug('不存在shareTicket')
      typeof cb == "function" && cb('', '')

    }
  },
  getOpenid: function (cb) {
    var that = this
    if (this.globalData.openid) {
      typeof cb == "function" && cb(this.globalData.openid, this.globalData.user)
    } else {
      // 从缓存中获取openid
      wx.getStorage({
        key: 'openid',
        success(res) {
          console.debug('[缓存] [获取用户openid] 成功：', res.data)
          that.globalData.openid = res.data
          that.globalData.user = wx.getStorageSync('user')
          typeof cb == "function" && cb(that.globalData.openid, that.globalData.user)
        },
        fail: err => {
          console.error('[缓存] [获取用户openid] 失败：', err)
          // 从云函数获取用户openid
          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
              util.print('[app.js] [getOpenid] user openid')
              console.debug(res.result)

              that.globalData.openid = res.result.openid
              that.globalData.user = res.result.user
              wx.setStorage({
                key: "openid",
                data: res.result.openid,
                success: res => {
                  console.debug('[缓存] [设置用户openid] 成功：', res)
                },
                fail: err => {
                  console.error('[缓存] [设置用户openid] 失败：', err)
                }
              })
              wx.setStorage({
                key: "user",
                data: res.result.user,
                success: res => {
                  console.debug('[缓存] [设置用户user] 成功：', res)
                },
                fail: err => {
                  console.error('[缓存] [设置用户user] 失败：', err)
                }
              })
              typeof cb == "function" && cb(that.globalData.openid, that.globalData.user)
            },
            fail: err => {
              console.error('[app.js] [getOpenid] 调用失败', err)
            }
          })
        }
      })
    }
  },
  getGroups: function (cb) {
    var that = this
    if (that.globalData.rooms && that.globalData.roomids && that.globalData.rooms_dic) {
      util.print('全部变量获取了rooms')
      typeof cb == "function" && cb(that.globalData.rooms, that.globalData.roomids, that.globalData.rooms_dic)
    } else {

      // 从云函数获取用户groups
      wx.cloud.callFunction({
        name: 'group',
        data: {
          action: 'get'
        },
        success: res => {
          util.print('[app.js][getGroups] user rooms: ')
          console.debug(res.result)

          var rooms = res.result.data
          that.globalData.rooms = rooms
          let rooms_dic = {}
          for (let i = 0; i < rooms.length; i++) {
            rooms_dic[rooms[i]._id] = rooms[i]
          }
          that.globalData.rooms_dic = rooms_dic
          var roomids = util.get_list(rooms, '_id')[0]
          that.globalData.roomids = roomids

          typeof cb == "function" && cb(rooms, roomids, rooms_dic)
        },
        fail: err => {
          console.error('[app.js] [getGroups] 调用失败', err)
        }
      })

    }
  },
  setConfig: function (cb) {
    if (this.globalData.config) {
      typeof cb == "function" && cb(this.globalData.config)
    } else {
      this.globalData.config = config
      typeof cb == "function" && cb(this.globalData.config)
    }
  },
  clear_storage() {
    wx.clearStorage({
      success: res => {
        console.debug('[缓存] [清除缓存] 成功: ', res)
      },
      fail: err => {
        console.error('[缓存] [清除缓存] 失败', err)
      }
    })
  },
})