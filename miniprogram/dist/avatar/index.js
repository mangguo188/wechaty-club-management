import baseComponent from '../helpers/baseComponent'
import classNames from '../helpers/classNames'
import styleToCssString from '../helpers/styleToCssString'
import CONFIG from '../../config'
baseComponent({
  properties: {
    prefixCls: {
      type: String,
      value: 'wux-avatar',
    },
    shape: {
      type: String,
      value: 'circle',
    },
    size: {
      type: String,
      value: 'default',
    },
    src: {
      type: String,
      value: '',
    },
    userAvatarUrl: {
      type: Boolean,
      value: false
    },
    bodyStyle: {
      type: [String, Object],
      value: '',
      observer(newVal) {
        this.setData({
          extStyle: styleToCssString(newVal),
        })
      },
    },
    scale: {
      type: Boolean,
      value: false,
    },
  },
  data: {
    extStyle: '',
    childrenStyle: '',
  },
  computed: {
    classes: ['prefixCls, shape, size, src', function(prefixCls, shape, size, src) {
      const wrap = classNames(prefixCls, {
        [`${prefixCls}--${shape}`]: shape,
        [`${prefixCls}--${size}`]: size,
        [`${prefixCls}--thumb`]: src,
      })
      const string = `${prefixCls}__string`

      return {
        wrap,
        string,
      }
    }],
  },
  methods: {
    setScale() {
      const {
        prefixCls
      } = this.data
      const query = wx.createSelectorQuery().in(this)
      query.select(`.${prefixCls}`).boundingClientRect()
      query.select(`.${prefixCls}__string`).boundingClientRect()
      query.exec((rects) => {
        if (rects.filter((n) => !n).length) return

        const [parent, child] = rects
        const offset = parent.width - 8 < child.width
        const childrenScale = offset ? (parent.width - 8) / child.width : 1
        const childrenStyle = childrenScale !== 1 ? `position: absolute; display: inline-block; transform: scale(${childrenScale}); left: calc(50% - ${Math.round(child.width / 2)}px)` : ''

        this.setData({
          childrenStyle,
        })
      })
    },
    imgOnerror(e) {
      console.log('图片载入失败，使用默认图片', e)

      this.setData({
        src: CONFIG.IN_CLOUD_URL + '/avatars/youyuelogo.png'
      })
    }
  },
  ready() {
    if (!this.data.src && this.data.scale) {
      this.setScale()
    }
  },
})