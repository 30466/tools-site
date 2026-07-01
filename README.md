# tools-site (abm48 工具箱)

一个基于 Vue 3 + Vite + Element Plus 的单页工具网站，包含 APK 下载/管理上传、口袋48直播录播、以及 FFmpeg WebAssembly 的浏览器端批量剪辑工具。

## 功能页面

- `/` 首页 — 分类卡片展示（推荐网站 / APP 下载 / 剪辑工具 / Skills / 应援站 / 联系我），导航栏首页下拉可直达各板块
- `/download` abm48 APP 下载中心（含管理员上传）
- `/member-archive` 成员档案 APP 下载（含管理员上传）
- `/pocket48-replay` 口袋48录播回放在线播放、查询、批量剪切、弹幕互动（独立子页）
- `/clip` 导入切片本批量剪切（FFmpeg WASM，滑动窗口并发下载 TS 分片，重试容错，切完即下）
- `/transcode` 批量转码（支持音频提取、格式转换、极速模式）
- `/merge` 媒体合并（支持无损极速合并、拖拽排序、内存超限保护）

**首页外部链接卡片：**

- [小偶像音乐网站](https://abm48.com/) - 收录在团、退团、毕业成员的歌曲
- [口袋48录播回放在线播放 查询 剪切](/pocket48-replay) - 在线播放、查询、批量剪切口袋48成员直播回放（内置子页）
- [成员档案](https://snh48wiki.top/) - 塞纳河成员档案查询
- [口袋48历史记录查询](https://msg48.org/) - 查询口袋48房间消息、直播电台回放、ID查成分、翻牌字数
- [河曲应援Call本查询站](https://glx48call.dpdns.org/) - 支持歌词搜索，查询河曲应援Call本
- [48tools](https://github.com/duan602728596/48tools/releases) - 口袋48 PC版，直播录源、录播下载、B站/抖音视频抓取等

**应援站：**

- [CGT48 谭思慧](https://tsh.abm48.com)
- [BEJ48 吴睿莎](https://wrs.abm48.com)
- [CGT48 徐郑子滢](https://xzzy.abm48.com)

## Skills

终端 AI Agent skill（如 OpenCode/
Claude Code/Codex 等），纯语言交互，无需打开网页即可完成以下操作：

- [口袋48录播下载](https://gitee.com/albert-chen04/pocket48-replays-skills) — 口袋48录播回放相关下载与查询
- [批量剪切](https://gitee.com/albert-chen04/media-batch-clip-skills) — 批量剪切（包括口袋48录播批量剪切，无需下载录播文件）
- [弹幕唱歌检测](https://gitee.com/albert-chen04/pocket48-danmaku-analysis-skills) — 口袋48弹幕文件检测唱歌片段（脚本筛选固定词与纯大语言模型交叉检验）
- [弹幕唱歌检测](https://gitee.com/albert-chen04/pocket48-danmaku-analysis-skills) — 口袋48弹幕文件检测唱歌片段（脚本筛选固定词与纯大语言模型交叉检验）
- [音乐批量上传](https://gitee.com/albert-chen04/albert-music-upload-skills) — 批量上传音频到[小偶像音乐网站](https://abm48.com)
- [切片本上传](https://gitee.com/albert-chen04/clip-record-upload-skills) — 批量上传唱歌切片本到[切片本网站(应援站)等](https://tsh.abm48.com)

## 技术栈

- Vue 3 + Vue Router 4
- Vite（^7.x）
- Element Plus（zh-CN）
- `@ffmpeg/ffmpeg` + `@ffmpeg/core` + `@ffmpeg/util`
- ArtPlayer + HLS.js + artplayer-plugin-danmuku（口袋48录播播放器）
- JSZip（打包下载）
- SortableJS（拖拽排序）
- Sass（样式预处理）
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

### Node.js 后端（可选，剪辑工具 TS 分片代理可选可不选，建议不选）

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

### TS 分片代理（其实没啥用，三路竞速时直连胜率高达 90% 以上，即可以只需要一条路即可）

```
GET /proxy/segment?url=<encoded_url>
```

浏览器 fetch 在 `Content-Length` 与实际数据不匹配时会 abort。Node 端使用原生 `http` 模块抓取（不校验 `Content-Length`），流式转发（chunked encoding），即使上游截断浏览器也能收到已转发数据。

### TS 分片下载策略

剪辑工具对口袋48直播录播的 TS 分片下载采用**多级容错**策略：

#### 路由层（三路降级）

```
第1次尝试：只直连（避免三路并发拥塞）
第2次尝试：只直连（瞬时拥塞已解除，通常秒成功）
第3次尝试：CDN代理 + 后端代理 + 直连 三路竞速
第4次尝试：三路竞速（超时 8s）
第5次尝试：三路竞速（超时 10s）
```

- **直连**：浏览器直接 fetch idol-vod.48.cn，占 95%+ 成功量
- **CDN 代理**：经 nginx `/cdn/` → idol-vod，绕过部分网络限制
- **后端代理**：经 Node `/proxy/segment` → idol-vod，Node 端不校验 Content-Length，截断也能返回

前端 `Promise.any` 竞速，最快返回即采用。前两次只走直连能减少 67% 无效请求，降低自我拥塞。

#### 并发层（滑动窗口）

分片下载采用**滑动窗口并发池**（非批次模式），始终保持 N 个分片同时下载，完成一个立即补充下一个，避免批次等待慢分片拖累整体进度。

并发数可通过面板 UI 调节（10-30，步长 5，默认 15）。

#### 输出层（切完即下）

每个片段剪切完成后立即触发浏览器下载，不再累积到内存中统一打包。内存峰值仅占单个片段大小（~100MB），不受总片段数限制。

### API 代理

| 路径 | 上游 | 用途 |
|------|------|------|
| `/api/*` | `https://abm48.com` | abm48 数据接口 |
| `/pocketapi/*` | `https://pocketapi.48.cn` | 口袋48 API |
| `/source48/*` | `https://source.48.cn` | 48 视频源 |

### 口袋48 直播录播

独立子页 `/pocket48-replay`，提供完整的口袋48录播回放体验：

- 动态成员搜索（el-autocomplete，从 48 API 实时获取成员映射）
- 日历浏览：按年月归档，默认跳到最新录播月份，支持最早/最新快捷导航
- ArtPlayer + HLS.js 播放器，支持弹幕播放（artplayer-plugin-danmuku）
- 3 路竞速批量剪切（CDN 代理 / 后端代理 / 直连），复用剪辑工具的滑动窗口并发池
- 弹幕时间线与录播信息面板

相关组件位于 `src/components/P48*.vue`，数据层封装在 `src/composables/useP48ReplayData.js`。

API 封装位于 `src/api/pocket48.js`。

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
│   ├── components/          # VideoToolsNav, P48ReplayCalendar, P48ReplayPlayer, P48ReplayInfo, P48DanmakuTimeline, P48ClipPanel
│   ├── composables/         # useFFmpeg.js, useP48ReplayData.js
│   └── views/               # Home / Download / MemberArchive / Clip / Transcode / Merge / Pocket48Replay
├── public/
│   ├── ffmpeg/              # 部署时复制到根目录
│   └── apks/                # 部署时复制到根目录
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


