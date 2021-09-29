const app = getApp()
Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [{
        "pagePath": "/pages/start/relatedlist/index",
        "iconPath": "cuIcon-homefill",
        "selectedIconPath": "assets/images/iconfont-vip-active.png",
        "text": "活动"
      },
      {
        "pagePath": "/pages/start/vipcard/index",
        "iconPath": "cuIcon-upstagefill",
        "selectedIconPath": "assets/images/iconfont-group-active.png",
        "text": "群组"
      },
      // {
      //   "pagePath": "/pages/start/usercenter",
      //   "iconPath": "cuIcon-myfill",
      //   "selectedIconPath": "assets/images/iconfont-about1-active.png",
      //   "text": "我的"
      // }
    ]
  },
  attached() {

  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      console.debug(data)
      this.setData({
        selected: data.index
      }, res => {
        wx.switchTab({
          url
        })
      })


    }
  }
})

// {
//   "pagePath": "/pages/start/index",
//   "iconPath": "cuIcon-add",
//   "selectedIconPath": "assets/images/iconfont-add-active.png",
//   "text": "创建"
// },

// {
//   "pagePath": "pages/start/index",
//   "iconPath": "assets/images/iconfont-add.png",
//   "selectedIconPath": "assets/images/iconfont-add-active.png",
//   "text": "发布"
// },