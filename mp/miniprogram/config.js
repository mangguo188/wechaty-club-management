var mCode = 0

// 云开发环境
var ENVS = {
  test: '',
  release: '',
  test_url: '',
  release_url: ''
}

// 浪潮云
const IN_CLOUD_URL = ''
const IN_CLOUD_AK = ''
const IN_CLOUD_SK = ''

// 腾讯地图
const tm_key = ''
const referer = ''

// 调试开关
var debug = true
if (mCode == 0) {
  // 测试
  debug = true
} else {
  // 生产
  debug = false
}

var env = ''
var CLOUD_URL = ''
if (debug) {
  env = ENVS.test
  CLOUD_URL = ENVS.test_url
} else {
  env = ENVS.release
  CLOUD_URL = ENVS.release_url
}



var config = {
  version: '1.1.0',
  debug,
  env,
  CLOUD_URL,
  IN_CLOUD_URL,
  IN_CLOUD_AK,
  IN_CLOUD_SK,
  tm_key,
  referer
}

module.exports = config;