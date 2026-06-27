# tools-site (abm48 工具箱)

一个基于 Vue 3 + Vite + Element Plus 的单页工具网站，包含 APK 下载/管理上传、口袋48直播录播、以及 FFmpeg WebAssembly 的浏览器端批量剪辑工具。

## 功能页面

- `/` 首页 — 分类卡片展示（推荐网站 / APP 下载 / 剪辑工具 / 应援站 / 联系我），导航栏首页下拉可直达各板块
- `/download` abm48 APP 下载中心（含管理员上传）
- `/member-archive` 成员档案 APP 下载（含管理员上传）
- `/clip` 导入切片本批量剪切（FFmpeg WASM，三路并行竞速下载 TS 分片，失败自动跳过，打包 ZIP 下载）
- `/transcode` 批量转码（支持音频提取、格式转换、极速模式）
- `/merge` 媒体合并（支持无损极速合并、拖拽排序、内存超限保护）

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
- [GNZ48 徐郑子滢](https://xzzy.abm48.com)

**桌面版下载：**

剪辑工具子页面（Clip / Transcode / Merge）卡片头部提供 [VideoEditingToolkit-Lite.zip](/VideoEditingToolkit-Lite.zip) 桌面版下载入口。

## 技术栈

- Vue 3 + Vue Router 4
- Vite
- Element Plus（zh-CN）
- `@ffmpeg/ffmpeg` + `@ffmpeg/core` + `@ffmpeg/util`
- JSZip（批量输出 ZIP）
- SortableJS（拖拽排序）
- **Node.js 后端**：Express + CORS + Multer（APK 上传、API 代理、TS 分片代理）

## 本地开发

### 前端

```bash
npm install
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

### Node.js 后端（可选，剪辑工具 TS 分片代理需要）

```bash
cd server
npm install
npm run dev    # 默认端口 3099
```

Vite 开发服务器已配置 `/proxy` 反向代理到后端，前端开发时同时启动两个服务即可。

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 后端端口 | `3099` |
| `ABM48_PASSWORD` | abm48 APK 上传密码 | `cbj` |
| `MEMBER_ARCHIVE_PASSWORD` | 成员档案 APK 上传密码 | `lkk` |
| `STATIC_DIR` | 生产环境静态文件目录 | `../dist` |

## 部署注意事项（FFmpeg WASM 必看）

`/clip` 页面依赖 `SharedArrayBuffer`，需要浏览器"跨域隔离"(Cross-Origin Isolation) 生效。生产环境必须正确配置以下响应头：

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: credentialless`

开发环境已在 `vite.config.js` 的 `server.headers` 中配置；线上环境（Nginx/Apache/CDN）也必须配置，否则 FFmpeg 可能无法加载。

> 注意：`COEP: credentialless` 比 `require-corp` 兼容性更好，无需为所有跨域资源设置 CORS/CORP 头。

FFmpeg 核心文件从站点路径加载：

- `/ffmpeg/ffmpeg-core.js`
- `/ffmpeg/ffmpeg-core.wasm`

对应静态资源：`public/ffmpeg/`

FFmpeg 加载顺序（三级 CDN 降级，由 `src/composables/useFFmpeg.js` 的 `FFmpegManager` 实现）：

1. npmmirror（淘宝镜像）
2. jsdelivr
3. 自有服务器 `/ffmpeg/`

## Node.js 后端代理

### TS 分片代理

```
GET /proxy/segment?url=<encoded_url>
```

浏览器 fetch 在 `Content-Length` 与实际数据不匹配时会 abort。Node 端使用原生 `http` 模块抓取（不校验 `Content-Length`），流式转发（chunked encoding），即使上游截断浏览器也能收到已转发数据。

### API 代理

| 路径 | 上游 | 用途 |
|------|------|------|
| `/api/*` | `https://abm48.com` | abm48 数据接口 |
| `/pocketapi/*` | `https://pocketapi.48.cn` | 口袋48 API |
| `/source48/*` | `https://source.48.cn` | 48 视频源 |

### 口袋48 直播录播

`/` 首页及剪辑工具页面内嵌半透明直播面板，支持：

- 按分组浏览成员直播/录播列表
- 解析 M3U8 获取 TS 分片地址
- 通过后端代理下载 TS 分片进行剪辑

API 封装位于 `src/api/pocket48.js`，面板组件位于 `src/components/Pocket48Panel.vue`。

## APK 下载/上传机制

前端会拉取版本列表：

- `public/apks/abm48/version.json`
- `public/apks/member_archive/version.json`

下载统计接口：

- `GET /apks/abm48/count` / `GET /apks/member_archive/count`
- 统计数据存储于同目录下的 `stats.json`

管理员上传接口：

- `POST /apks/abm48/upload`
- `POST /apks/member_archive/upload`

> 上传和计数已从 PHP 迁移到 Node.js 后端。原有 PHP 文件保留，但推荐使用 Node 服务。

### 安全说明（重要）

- `server/config.js` 用于存放上传密码等敏感信息：不应提交到仓库。
- `public/apks/config.example.php` 作为遗留 PHP 配置模板；如使用 Node 后端请在 `server/config.js` 中配置密码。

## 目录结构

### 开发仓库（源码）

```text
.
├── src/                     # Vue 源代码（仅用于开发，不上线）
│   ├── main.js
│   ├── App.vue
│   ├── style.css
│   ├── router/index.js
│   ├── api/pocket48.js
│   ├── components/          # VideoToolsNav, Pocket48Panel
│   ├── composables/         # useFFmpeg.js
│   └── views/               # Home / Download / MemberArchive / Clip / Transcode / Merge
├── public/
│   ├── ffmpeg/              # 部署时复制到根目录
│   ├── apks/                # 部署时复制到根目录
│   └── VideoEditingToolkit-Lite.zip
├── server/                  # Node 后端（部署时复制到根目录）
│   ├── index.js
│   ├── config.js
│   ├── package.json
│   └── uploads/
├── vite.config.js
├── package.json
├── AGENTS.md
└── dist/                    # build 产物，部署到服务器根目录
```

### 生产部署（`tools.abm48.com` 根目录）

```text
.
├── assets/                  # Vite 构建产物（JS/CSS）
├── server/                  # Node.js 后端
│   ├── index.js
│   ├── config.js
│   ├── package.json
│   └── uploads/
├── apks/
│   ├── abm48/
│   ├── member_archive/
│   └── .htaccess
├── ffmpeg/
│   ├── ffmpeg-core.js
│   └── ffmpeg-core.wasm
├── index.html
└── VideoEditingToolkit-Lite.zip
```

## 常见问题

- 打开 `/clip` 提示"跨域隔离未生效 / SharedArrayBuffer 不可用"
  - 检查线上是否设置了 COOP/COEP 响应头
  - 确保 COEP 使用 `credentialless` 而非 `require-corp`（新版兼容性更好）
- TS 分片下载失败
  - 检查 Node 后端是否运行，`/proxy/segment` 是否可达
  - 浏览器控制台查看是否有网络错误
- FFmpeg 加载失败
  - 检查三个 CDN 源是否可访问
  - 自有服务器的 `/ffmpeg/ffmpeg-core.js` 和 `.wasm` 文件需正确部署
