var config = require('../config')
var debug = config.debug
const app = getApp()

// 时间格式化
const formatTime_md2 = timestamp => {
  var cur_date = new Date(timestamp)
  const year = cur_date.getFullYear()
  const month = cur_date.getMonth() + 1
  const date = cur_date.getDate()
  const hour = cur_date.getHours()
  const minute = cur_date.getMinutes()
  const second = cur_date.getSeconds()
  const day = cur_date.getDay()

  const start_timestamp = cur_date.setHours(0, 0, 0, 0)
  const end_timestamp = start_timestamp + 60 * 60 * 24 * 1000
  var weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
  var day_text = '周' + weeks_ch[day]
  let time_text = (hour < 10 ? ('0' + hour) : hour) + ':' + (minute < 10 ? ('0' + minute) : minute) + ':' + (second < 10 ? ('0' + second) : second)
  let ymd = month + '月' + date + '日'
  let tmdhms = year + '-' + month + '-' + date + ' ' + day_text + ' ' + time_text
  return [ymd, start_timestamp, end_timestamp, day_text, time_text, tmdhms]
}

const get_time = date => {
  var d = new Date();
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
  var time = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  return [d.getTime(), time]
}

function add_time(type, datas) {
  var time = get_time()
  if (type == 'c') {
    datas.create_time = time[0]
    datas.create_time_utc = time[1]
  } else if (type == 'u') {
    datas.update_time = time[0]
    datas.update_time_utc = time[1]
  } else if (type == 'b') {
    datas.create_time = time[0]
    datas.create_time_utc = time[1]
    datas.update_time = time[0]
    datas.update_time_utc = time[1]
  } else {

  }
  return datas
}


// 获取随机颜色，可指定色域
function getColor(hr, hg, hb) {

  var str0 = Math.ceil((Math.random() * hr)).toString(16); //把数字转换成16进制
  var str1 = Math.ceil((Math.random() * hg)).toString(16); //把数字转换成16进制
  var str2 = Math.ceil((Math.random() * hb)).toString(16); //把数字转换成16进制

  var z_num = 0
  var g = 0

  if (str0.length < 2) {
    z_num = 2 - str0.length
    for (g = 0; g < z_num; g++) {
      str0 = "0" + str0;
    }
    z_num = 0
    g = 0
  }
  if (str1.length < 2) {
    z_num = 2 - str1.length
    for (g = 0; g < z_num; g++) {
      str1 = "0" + str1;
    }
    z_num = 0
    g = 0
  }
  if (str2.length < 2) {
    z_num = 2 - str.length
    for (g = 0; g < z_num; g++) {
      str2 = "0" + str2;
    }
    z_num = 0
    g = 0
  }

  var str = str0 + str1 + str2
  console.log('text_color', str)
  if (str.length < 6) {
    var z_num = 6 - str.length
    for (var g = 0; g < z_num; g++) {
      str = "0" + str;
    }
  }
  str = '#' + str
  console.log('getColor()', str)

  return str;
}

// 格式化时间为年月日时分秒
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 格式化时间为月日及始终时间戳
const formatTime_md = timestamp => {
  var cur_date = new Date(timestamp)
  const year = cur_date.getFullYear()
  const month = cur_date.getMonth() + 1
  const date = cur_date.getDate()
  const hour = cur_date.getHours()
  const minute = cur_date.getMinutes()
  const second = cur_date.getSeconds()
  const day = cur_date.getDay()

  const start_timestamp = cur_date.setHours(0, 0, 0, 0)
  const end_timestamp = start_timestamp + 60 * 60 * 24 * 1000
  var weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
  var day_text = '周' + weeks_ch[day]
  return [month + '月' + date + '日', start_timestamp, end_timestamp, day_text]
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


const formatDate = date => {
  // 设置格式化的时间格式
  var res = {}
  res.form = {}
  date = new Date(date)

  var weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
  var months_ch = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  // 获取传入时间戳的年月日时分秒
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var day_is = date.getDay()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  var date0 = date.getTime()

  if (hour > 12) {
    res.alerttimetext = '下午 ' + [hour - 12, minute].map(formatNumber).join(':')
  } else if (hour > 11) {
    res.alerttimetext = '中午 ' + [hour, minute].map(formatNumber).join(':')
  } else {
    res.alerttimetext = '上午 ' + [hour, minute].map(formatNumber).join(':')
  }

  // 月日十分秒小于10时前边加0
  month = formatNumber(month)
  day = formatNumber(day)
  hour = formatNumber(hour)
  minute = formatNumber(minute)
  second = formatNumber(second)


  // 获取当前时间对象
  var t0 = new Date()
  // 当前时间13点的时间戳
  var t011 = t0.setHours(13, 0, 0, 0);
  // 当前时间12点的时间戳
  var t01 = t0.setHours(12, 0, 0, 0);
  // 当前时间0点的时间戳
  var t02 = t0.setHours(0, 0, 0, 0);
  // 当前时间前一天0点的时间戳
  var t03 = new Date(t02).setDate(t0.getDate() - 1)
  // 获取当前时间的星期
  var day_is0 = t0.getDay() - 1

  if (day_is > 2) {
    // 如果星期大于周二，设置当前时间向前推已经最早到周一
    var t04 = new Date(t02).setDate(t0.getDate() - day_is0)
  } else if (day_is == 0) {
    // 当前星期为周日，设置当前时间向前推最早到周一
    var t04 = new Date(t02).setDate(t0.getDate() - 6)
  } else {
    // 设置为当前时间
    var t04 = t0.getTime()
  }

  res.alerttext = ''
  res.alerttextwithhm = ''

  // console.log('date0', date0)
  // console.log('t011', t011)
  // console.log('t01', t01)
  // console.log('t02', t02)
  // console.log('t03', t03)
  // console.log('t04', t04)

  if (date0 >= t011) {
    // dolog(true,"+++++++++++++++++++++++++++++++++++++++++++")
    // dolog(true, 'date0 >= t011', date0,t011)
    var hour1 = hour - 12
    res.alerttext = '下午 ' + [hour1, minute].map(formatNumber).join(':')
    res.alerttextwithhm = '下午 ' + [hour - 12, minute].map(formatNumber).join(':')
  } else if (date0 >= t01) {
    res.alerttext = '中午 ' + [hour, minute].map(formatNumber).join(':')
    res.alerttextwithhm = '中午 ' + [hour, minute].map(formatNumber).join(':')
  } else if (date0 >= t02) {
    res.alerttext = '上午 ' + [hour, minute].map(formatNumber).join(':')
    res.alerttextwithhm = '上午 ' + [hour, minute].map(formatNumber).join(':')
  } else if (date0 >= t03) {
    res.alerttext = '昨天'
    res.alerttextwithhm = '昨天 ' + [hour, minute].map(formatNumber).join(':')
  } else if (date0 >= t04) {
    res.alerttext = '星期' + weeks_ch[day_is]
    res.alerttextwithhm = '星期' + weeks_ch[day_is] + ' ' + [hour, minute].map(formatNumber).join(':')
  } else if (new Date(t0).getFullYear() != year) {
    res.alerttext = year + '年' + month + '月' + day + '日'
    res.alerttextwithhm = year + '年' + month + '月' + day + '日' + ' ' + [hour, minute].map(formatNumber).join(':')
  } else {
    res.alerttext = month + '月' + day + '日'
    res.alerttextwithhm = month + '月' + day + '日' + ' ' + [hour, minute].map(formatNumber).join(':')
  }

  // 全格式时间形式2018年4月22日 星期六 
  var date0_is = month + '月' + day + '日' + ' ' + '星期' + weeks_ch[day_is]



  res.form.year = year
  res.form.month = month
  res.form.month_b = months_ch[month - 1]
  res.form.day = day
  res.form.day_is = weeks_ch[day_is]
  res.form.hour = hour
  res.form.minute = minute
  res.form.second = second
  var date1_is = year + '-' + month + '-' + day
  var date_is = year + '-' + month + '-' + day + ' ' + '星期' + weeks_ch[day_is]
  var time1_is = [hour, minute, second].map(formatNumber).join(':')
  var time2_is = [hour, minute].map(formatNumber).join(':')
  var time3_is = [hour, 0].map(formatNumber).join(':')

  res.date0 = date0_is
  res.date1 = date1_is
  res.date = date_is
  res.time = time1_is
  res.hour_mm = time2_is
  res.hour_hh = time3_is

  var next_hour = new Date(date.getTime() + 60 * 60 * 1000);
  var next_hour_hh = next_hour.getHours() < 10 ? "0" + next_hour.getHours() : next_hour.getHours();
  var next_hour_mm = next_hour.getMinutes() < 10 ? "0" + next_hour.getMinutes() : next_hour.getMinutes();

  var next_3hour = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  var next_3hour_hh = next_3hour.getHours() < 10 ? "0" + next_3hour.getHours() : next_3hour.getHours();
  var next_3hour_mm = next_3hour.getMinutes() < 10 ? "0" + next_3hour.getMinutes() : next_3hour.getMinutes();

  // 小时分钟小于10前边加0

  res.next_hour_hh = [next_hour_hh, 0].map(formatNumber).join(':');
  res.next_hour_mm = [next_hour_hh, next_hour_mm].map(formatNumber).join(':');
  // 下一个整点的时间戳
  res.timestamp = new Date(date.setHours(next_hour_hh, 0, 0, 0)).getTime();

  res.next_3hour_hh = [next_3hour_hh, 0].map(formatNumber).join(':');
  res.next_3hour_mm = [next_3hour_hh, next_3hour_mm].map(formatNumber).join(':');
  // 下第三个整点的时间戳
  res.next_3hour_timestamp = new Date(date.setHours(next_3hour_hh, 0, 0, 0)).getTime();

  return res
}



// 指定排序的比较函数
const compareDes = property => {
  return function (obj1, obj2) {
    var value1 = obj1[property];
    var value2 = obj2[property];
    return value2 - value1; // 降序
  }
}
const compareAse = property => {
  return function (obj1, obj2) {
    var value1 = obj1[property];
    var value2 = obj2[property];
    return value1 - value2; // 升序
  }
}

// 显示繁忙提示
var showBusy = text => wx.showToast({
  title: text,
  icon: 'loading',
  duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
  title: text,
  icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
  wx.hideToast();

  // wx.showModal({
  //   title,
  //   content: JSON.stringify(content),
  //   showCancel: false
  // })
  dolog(true, title, content)

  wx.showModal({
    title: '出错了...',
    content: '服务出现了问题，请返回后重试！',
    showCancel: false
  })



}
/**
 * 打印日志
 */
const dolog = (debug, url, text, res) => {
  if (debug) {
    console.log('start------------------------------')
    console.log('##########-----' + url + '-----##########')
    if (text) {
      console.log(text)
    }
    if (res) {
      console.log(res)
    }
    console.log('------------------------------end')
    console.log('-')
    console.log('-')
  }
}

const get_list = (obj_list, key) => {
  var key_list = []
  var list = []

  for (var i = 0; i < obj_list.length; i++) {

    // console.debug(obj_list[i][key])

    if (obj_list[i][key]) {
      key_list.push(obj_list[i][key])
      list.push(obj_list[i])
    }

  }
  return [key_list, list]
}



//输入的是否为数组或空数组  
var nullArray = function (arr) {
  if (Array.isArray(arr)) {
    if (arr.length === 0) return false
    return true
  }
  return false;
}


//去掉重复项  
var arrayUnique = function (arr) {
  var result = [];
  var l = arr.length;
  if (nullArray(arr)) {
    for (var i = 0; i < l; i++) {
      var temp = arr.slice(i + 1, l)
      if (temp.indexOf(arr[i]) == -1) {
        result.push(arr[i]);
      } else {
        continue;
      }
    }
  }
  return result;
}


//数组排序按数字 ，也可以降序  
//flag不存在默认升序  
//flag存在降序  
var arraySortByNum = function (arr, flag) {
  if (flag) {
    return arr.sort(function (x, y) {
      return y - x
    })
  } else {
    return arr.sort(function (x, y) {
      return x - y
    })
  }
}


//求交集  
var arrayIntersection = function (arr1, arr2) {
  var result = [];
  if (nullArray(arr1) && nullArray(arr2)) {
    arrayUnique(arr1).forEach(function (x) {
      arr2.forEach(function (y) {
        if (x === y) result.push(x);
      })
    })
    return result;
  } else {
    return [];
  }
}


//求差集arr1-arr2  
var arrayMinus = function (arr1, arr2) {
  var result = [];
  arr1.forEach(function (x) {
    if (arr2.indexOf(x) === -1) {
      result.push(x);
    } else {
      return;
    }
  })
  return result;
}



//求并集  
var arrayUnion = function (arr1, arr2) {
  //    var result=arr2;  
  //    arr1.forEach(function(x){  
  //        result.push(x)  
  //    })  
  return arrayUnique(arr1.concat(arr2));
  //    return arr1.concat(arr2);  
}

// 对象数组快速排序  
var sortObj = function (arr, key, dir) {
  key = key || 'id';
  dir = dir || null;
  if (arr.length == 0) return [];

  var left = new Array();
  var right = new Array();
  var pivot = arr[0][key]; //分割值  
  var pivotObj = arr[0]; //存储值  

  if (dir === null) { //升序  
    for (var i = 1; i < arr.length; i++) {
      arr[i][key] < pivot ? left.push(arr[i]) : right.push(arr[i]);
    }
  } else { //降序  
    for (var i = 1; i < arr.length; i++) {
      arr[i][key] > pivot ? left.push(arr[i]) : right.push(arr[i]);
    }
  }
  return sortObj(left, key, dir).concat(pivotObj, sortObj(right, key, dir));
}

// 两个条件降序排序
var sortObjByTwo = function (arr, key1, key2) {
  arr.sort(function (a, b) {
    if (a[key1] === b[key1]) {
      if (a[key2] > b[key2]) {
        return -1;
      } else if (a[key2] < b[key2]) {
        return 1;
      } else {
        return 0;
      }
    } else {
      if (a[key1] > b[key1]) {
        return -1;
      } else {
        return 1;
      }
    }
  })
  return arr
}


//对象数组多条件排序
var sortObjByMany = function (arr, field, order) {
  field = field || [];
  order = order || [];
  if (arr.length == 0) {
    return []
  } else {
    msort(arr, field, order)
    return arr
  }

  function isArr(data) {
    return ({}).toString.call(data) == '[object Array]';
  }

  function getIndex(arr) {
    var i = 0,
      len = arr.length
    keys = [];
    while (i < len) {
      keys.push(i++);
    }
    return keys;
  }

  // 检测数组最大维数，非数组则返回-1，如果有num则表明检测数组是否为指定维数
  function checkArrDim(arr, num) {
    var dimension = -1,
      num = parseInt(num),
      isCheck = isNaN(num) ? false : true,
      dm = [0],
      i, len, mx;
    if (isArr(arr) && (len = arr.length) > 0) {
      dimension = 1; // 任何一个数组，只要有数据，至少是个1维
      for (i = 0; i < len; i++) {
        dm.push(checkArrDim(arr[i])); // 递归获取每个元素的维数，如果dm数组中全是-1则说明arr是1维数组
      }
      dimension = (mx = Math.max.apply(null, dm)) === -1 ? dimension : dimension + mx;
    }
    // 如果dm数组长度 <= 1则说明arr压根不是数组，或者是空数组
    // 当dm数组长度 > 1，且dimension == 1，说明arr是1维数组
    // 或者dimension <> 1，因为dm默认填充1个0，只要所有元素的和 / dm去掉0后的长度 == num - 1，即说明是n维数组
    return isCheck ? (dm.length > 1 ? (dimension == 1 && num == 1) || eval(dm.join('+')) / (dm.length - 1) == num - 1 : false) : dimension;
  }

  function msort(arr, field, order) {
    if (!checkArrDim(arr, 2) || !checkArrDim(field, 1) || !checkArrDim(order, 1)) {
      return;
    }
    var key, tmp, val, sa, sk, pre;
    var i, ilen, j, jlen, k, klen, m, mlen;
    var range = [],
      rng;
    // 按已排序数组的索引数组排序待定数组
    var sortFromKey = function (data, key) {
      var tmp = [],
        i, j, len;
      for (i = 0, len = key.length; i < len; i++) {
        tmp.push(data[key[i]]);
      }
      for (j = 0; j < len; j++) {
        data[j] = tmp[j];
      }
    };
    // 多条件排序
    for (i = 0, ilen = field.length; i < ilen; i++) {
      tmp = arr[field[i]];
      if (i === 0) {
        // 第1次排序，直接对当前字段所在数组排序
        key = getIndex(tmp);
        tmp.mergeSort(key, order[i]);
        range.push([0, tmp.length - 1]);
      } else {
        // 如果有第2个及以上的条件，则均以前1个条件为参照，获取前1个已排序数组
        // 内每一组相同元素的区间，对该区间内元素赋值到临时数组并排序，并获取排序
        // 索引，最终拼接在一起这个拼接在一起的新的索引数组即是其它所有数组排序的参照，
        // 经过上述循环执行，即可完成多条件排序
        // ↓核心工作前的初始工作
        pre = arr[field[i - 1]]; // 前1个已排序数组
        val = pre[0];
        sa = [tmp[0]];
        sk = [0];
        key = [];
        rng = [];
        // 本排序核心工作即整理已排序数组的同值区间，此区间是当前待排序数组多个排序区间的唯一参照
        for (k = 0, klen = range.length; k < klen; k++) {
          for (m = range[k][0] + 1, mlen = range[k][1] + 1; m <= mlen; m++) { // 注意此处条件表达式，需要额外执行一次排序和初始化
            if (val === pre[m] && m !== mlen) { // 无论区间多小，哪怕只有1个元素，当m = mlen时必须执行排序和下一步的初始准备
              sa.push(tmp[m]);
              sk.push(m);
            } else {
              rng = rng.concat([
                [sk[0], sk[sk.length - 1]]
              ]);
              sa.mergeSort(sk, order[i]); // 主要是为了获取sk
              key = key.concat(sk);
              val = pre[m];
              sa = [tmp[m]];
              sk = [m];
            }
          }
        }
        range = rng; // 获取整理后的待排序区间
        sortFromKey(tmp, key); // 对当前数组排序
      }
      // 经过前面的过程，一个条件已经排序完成，并且获得排序后的原索引(数组)
      // 然后对除了当前字段数组外的其它所有数组按已排序索引重新排列
      for (j = 0, jlen = arr.length; j < jlen; j++) {
        if (j == field[i]) {
          continue;
        }
        sortFromKey(arr[j], key);
      }
    }
  }
}


/*获取当前页url*/
function getCurrentPageUrl() {
  var pages = getCurrentPages() //获取加载的页面
  var currentPage = pages[pages.length - 1] //获取当前页面的对象
  var url = currentPage.route //当前页面url
  return url
}

/*获取当前页带参数的url*/
function getCurrentPageUrlWithArgs() {
  var pages = getCurrentPages() //获取加载的页面
  var currentPage = pages[pages.length - 1] //获取当前页面的对象
  var url = currentPage.route //当前页面url
  var options = currentPage.options //如果要获取url中所带的参数可以查看options

  //拼接url的参数
  var urlWithArgs = url + '?'
  for (var key in options) {
    var value = options[key]
    urlWithArgs += key + '=' + value + '&'
  }
  urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1)

  return urlWithArgs
}




function contains(arr, obj) {
  var isStar = false
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id === obj.id) {
      // dolog(true, 'arr[i].id vs obj', arr[i].id, obj.id)
      isStar = true;
      break
    } else {
      isStar = false;
    }
  }

  // dolog(true, '对象在数组中', isStar)
  return isStar;
}

function isInArray(arr, value) {
  for (var i = 0; i < arr.length; i++) {
    if (value === arr[i]) {
      return true;
    }
  }
  return false;
}

function setUser(user) {
  wx.setStorage({
    key: 'user',
    data: user,
    success() {
      dolog(debug, '设置user缓存成功', user)
    },
    fail(e) {
      dolog(debug, '设置user缓存失败', e)
    }
  })
}

function print(data) {
  console.debug('---------------------------------------------------------')
  console.debug(data)
}

function get_wx_say_req(wxKey, msgType, msg, roomid, wxid) {
  let time = new Date().getTime()
  let commandInvoke = `thing/wechaty/${wxKey}/command/invoke`
  let payload = {}
  if (msgType == 'Image') {
    // 1. send Image
    payload = {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": time,
      "name": "pubMessage",
      "params": {
        wxid,
        msg,
        roomid,
        wxKey,
        msgType
      }
    }
  } else if (msgType == 'Text') {
    // 2. send Text
    payload = {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": time,
      "name": "pubMessage",
      "params": {
        wxid,
        msg,
        roomid,
        wxKey,
        msgType
      }
    }
  } else if (msgType == 'Contact') {
    // 3. send Contact
    payload = {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": time,
      "name": "pubMessage",
      "params": {
        wxid,
        msg,
        roomid,
        wxKey,
        msgType
      }
    }
  } else if (msgType == 'UrlLink') {
    // 4. send UrlLink
    // {
    //   "description": "测试卡片",
    //   "thumbnailUrl": "http://mmbiz.qpic.cn/mmbiz_jpg/mLJaHznUd7O4HCW51IPGVarcVwAAAuofgAibUYIct2DBPERYIlibbuwthASJHPBfT9jpSJX4wfhGEBnqDvFHHQww/0",
    //   "title": "欢迎使用群组大师小程序",
    //   "url": "https://mp.weixin.qq.com/s/m6qbYo6eFR8RbIj25Xm4rQ"
    // }
    payload = {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": 1610430718000,
      "name": "pubMessage",
      "params": {
        wxid,
        msg,
        roomid,
        wxKey,
        msgType
      }
    }

  } else {
    payload = {
      "reqId": "442c1da4-9d3a-4f9b-a6e9-bfe858e4ac43",
      "method": "thing.command.invoke",
      "version": "1.0",
      "timestamp": 1610430718000,
      "name": "pubMessage",
      "params": {
        code: 200,
        'msg': 'success',
        data: ''
      }
    }

  }
  console.debug([commandInvoke, JSON.stringify(payload)])
  return [commandInvoke, JSON.stringify(payload)]
}

module.exports = {
  formatTime,
  showBusy,
  showSuccess,
  showModel,
  formatDate,
  compareDes,
  compareAse,
  sortObjByTwo,
  dolog,
  get_list,
  getCurrentPageUrl,
  getCurrentPageUrlWithArgs,
  arrayIntersection,
  isInArray,
  contains,
  setUser,
  getColor,
  formatTime_md,
  add_time,
  get_time,
  print,
  get_wx_say_req,
  formatTime_md2
}