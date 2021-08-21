
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





module.exports = {
  formatTime,
  formatDate,
  formatTime_md,
  add_time,
  get_time
}