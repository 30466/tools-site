// 服务器配置文件
// 部署时修改这里的密码
export default {
  port: process.env.PORT || 3099,

  // APK 上传密码
  abm48_password: process.env.ABM48_PASSWORD || 'cbj',
  member_archive_password: process.env.MEMBER_ARCHIVE_PASSWORD || 'lkk',

  // 静态文件目录（生产环境为 ../dist）
  staticDir: process.env.STATIC_DIR || '../dist',

  // 上游代理目标
  upstream: {
    abm48: 'https://abm48.com',
    pocket48: 'https://pocketapi.48.cn',
    source48: 'https://source.48.cn',
    idolVod: 'https://idol-vod.48.cn',
  }
}
