import baseComponent from '../helpers/baseComponent'
import classNames from '../helpers/classNames'
import styleToCssString from '../helpers/styleToCssString'
import CONFIG from '../../config'

baseComponent({
  properties: {
    prefixCls: {
      type: String,
      value: 'wux-media',
    },
    thumb: {
      type: String,
      value: '',
    },
    thumbStyle: {
      type: [String, Object],
      value: '',
      observer(newVal) {
        this.setData({
          extStyle: styleToCssString(newVal),
        })
      },
    },
    outStyle: {
      type: String,
      value: '',
    },
    title: {
      type: String,
      value: '',
    },
    label: {
      type: String,
      value: '',
    },
    align: {
      type: String,
      value: 'center',
    },
  },
  data: {
    extStyle: '',
  },
  computed: {
    classes: ['prefixCls, align', function(prefixCls, align) {
      const wrap = classNames(prefixCls, {
        [`${prefixCls}--align-${align}`]: align,
      })
      const hd = `${prefixCls}__hd`
      const thumb = `${prefixCls}__thumb`
      const bd = `${prefixCls}__bd`
      const title = `${prefixCls}__title`
      const desc = `${prefixCls}__desc`

      return {
        wrap,
        hd,
        thumb,
        bd,
        title,
        desc,
      }
    }],
  },
  methods: {
    imgOnerror(e) {
      console.log(e)

      this.setData({
        thumb: CONFIG.IN_CLOUD_URL + '/avatars/youyuelogo.png'
      })
    },
    not_in_group(e) {
      console.debug('not_in_groupe', e)
      // var wx_groups_on = this.data.wx_groups
      // var index = wx_groups_on.indexOf(e.currentTarget.dataset.index)
      // wx_groups_on.splice(index, 1)
  
      // this.setData({
      //   wx_groups: wx_groups_on
      // })
      // this.remove_member(e.currentTarget.dataset.id)
  
    },
  }



})