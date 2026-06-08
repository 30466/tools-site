# tools-site (abm48 工具箱)

一个基于 Vue 3 + Vite + Element Plus 的单页工具网站，包含 APK 下载/管理上传、以及 FFmpeg WebAssembly 的浏览器端批量剪切工具。

## 功能页面

- `/` 首页 — 分类卡片展示（推荐网站 / APP 下载 / 剪辑工具 / 应援站 / 联系我），导航栏首页下拉可直达各板块
- `/download` abm48 APP 下载中心（含管理员上传）
- `/member-archive` 成员档案 APP 下载（含管理员上传）
- `/clip` 导入切片本批量剪切（FFmpeg WASM，本地处理并打包 ZIP 下载）
- `/transcode` 批量转码（支持音频提取、格式转换、极速模式）
- `/merge` 媒体合并（支持无损极速合并、拖拽排序、内存超限保护）
- `/about` 关于 / 友情链接

**首页外部链接卡片：**

- [小偶像音乐网站](https://abm48.com/) - 收录在团、退团、毕业成员的歌曲
- [成员档案](https://snh48wiki.top/) - 塞纳河成员档案查询
- [口袋48历史记录查询](https://msg48.org/) - 查询口袋48房间消息、直播电台回放、ID查成分、翻牌字数
- [河曲应援Call本查询站](https://glx48call.dpdns.org/) - 支持歌词搜索，查询河曲应援Call本
- [48tools](https://github.com/duan602728596/48tools/releases) - 口袋48 PC版，直播录源、录播下载、B站/抖音视频抓取等
- [字幕/弹幕唱歌检测](https://sd.abm48.com/) - 根据字幕或弹幕文件判断并检测唱歌时间段

**应援站：**

- [CGT48 谭思慧](https://tsh.abm48.com)
- [BEJ48 吴睿莎](https://wrs.abm48.com)

**桌面版下载：**

剪辑工具子页面（Clip / Transcode / Merge）卡片头部提供 [VideoEditingToolkit-Lite.zip](/VideoEditingToolkit-Lite.zip) 桌面版下载入口。

## 技术栈

- Vue 3 + Vue Router 4
- Vite
- Element Plus（zh-CN）
- `@ffmpeg/ffmpeg` + `@ffmpeg/core` + `@ffmpeg/util`
- JSZip（批量输出 ZIP）
- SortableJS（拖拽排序）

## 本地开发

```bash
npm install
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

## 部署注意事项（FFmpeg WASM 必看）

`/clip` 页面依赖 `SharedArrayBuffer`，需要浏览器"跨域隔离"(Cross-Origin Isolation) 生效。生产环境必须正确配置以下响应头：

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

开发环境已在 `vite.config.js` 的 `server.headers` 中配置；线上环境（Nginx/Apache/CDN）也必须配置，否则 FFmpeg 可能无法加载。

FFmpeg 核心文件从站点路径加载：

- `/ffmpeg/ffmpeg-core.js`
- `/ffmpeg/ffmpeg-core.wasm`

对应静态资源：`public/ffmpeg/`

## APK 下载/上传机制

前端会拉取版本列表：

- `public/apks/abm48/version.json`
- `public/apks/member_archive/version.json`

下载统计接口（PHP）：

- `public/apks/abm48/count.php`
- `public/apks/member_archive/count.php`
- 统计数据存储于同目录下的 `stats.json`

管理员上传接口（PHP）：

- `public/apks/abm48/upload.php`
- `public/apks/member_archive/upload.php`

### 安全说明（重要）

- `public/apks/config.php` 用于存放上传密码等敏感信息：不应提交到仓库。
- 本仓库提供 `public/apks/config.example.php` 作为模板；部署时请在服务器上创建真实的 `public/apks/config.php`。
- `public/apks/.htaccess` 示例为 Apache 环境阻止外部访问 `config.php`；如使用 Nginx，请用 Nginx 规则实现同等限制。

## 目录结构

```text
.
├── src/                 # Vue 源码
│   ├── main.js
│   ├── App.vue
│   ├── router/index.js
│   ├── components/      # 公共组件 (VideoToolsNav)
│   └── views/           # Home / Download / MemberArchive / Clip / Transcode / Merge / About
├── public/
│   ├── ffmpeg/          # ffmpeg-core.js / ffmpeg-core.wasm
│   ├── apks/            # APK 分发与上传接口
│   └── VideoEditingToolkit-Lite.zip  # 桌面版剪辑工具（不纳入版本控制）
├── vite.config.js
├── package.json
└── dist/                # build 产物（本地生成，默认忽略）
```

## 常见问题

- 打开 `/clip` 提示"跨域隔离未生效 / SharedArrayBuffer 不可用"
  - 检查线上是否设置了 COOP/COEP 响应头
  - 确保相关资源满足 `require-corp` 约束（同源或正确的 CORS/CORP 策略）
