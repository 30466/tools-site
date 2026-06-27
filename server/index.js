import https from 'node:https'
import http from 'node:http'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import config from './config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
app.use(cors())
app.use(express.json())

// ─── Segment Proxy (核心：解决浏览器 TS 分片校验问题) ──────────────────────
// 浏览器 fetch() 在 Content-Length 与实际数据不匹配时会 abort。
// 这个端点用 Node.js 原生 http 模块抓取（不校验 Content-Length），
// 流式转发给浏览器（chunked encoding，不设 Content-Length 头），
// 上游断了浏览器也能收到已转发的数据。
app.get('/proxy/segment', async (req, res) => {
  const url = req.query.url
  if (!url) return res.status(400).json({ error: '缺少 url 参数' })

  const u = new URL(url)
  const client = u.protocol === 'https:' ? https : http

  // 单次抓取，前端负责重试（避免后端堆积长时间等待）
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000)
    const resp = await new Promise((resolve, reject) => {
      const opts = {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Origin': 'https://h5.48.cn',
          'Referer': 'https://h5.48.cn/',
          'Accept': '*/*'
        },
        signal: controller.signal,
        timeout: 25000
      }
      client.get(opts, resolve).on('error', reject)
    })
    clearTimeout(timeout)

    res.set({
      'Content-Type': 'video/mp2t',
      'Cache-Control': 'public, max-age=86400'
    })

    resp.on('data', chunk => res.write(chunk))
    resp.on('end', () => res.end())
    resp.on('error', (err) => {
      console.warn(`[segment] 上游错误: ${err.message}`)
      if (!res.headersSent) res.status(502).json({ error: `下载失败: ${err.message}` })
      else res.end()
    })
  } catch (err) {
    console.error(`[segment] 下载失败: ${err.message}`)
    if (!res.headersSent) res.status(502).json({ error: err.message })
  }
})

// ─── 通用代理 ──────────────────────────────────────────────────────────────
function createProxy(upstream, extraHeaders = {}) {
  return async (req, res) => {
    const targetUrl = upstream + req.url
    try {
      const u = new URL(targetUrl)
      const client = u.protocol === 'https:' ? https : http

      const opts = {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname + u.search,
        method: req.method,
        headers: {
          'Content-Type': req.headers['content-type'] || 'application/json',
          'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
          ...extraHeaders
        },
        timeout: 25000
      }

      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        const body = JSON.stringify(req.body)
        opts.headers['Content-Length'] = Buffer.byteLength(body)
        const proxyReq = client.request(opts, (proxyRes) => {
          res.status(proxyRes.statusCode)
          Object.entries(proxyRes.headers).forEach(([k, v]) => res.set(k, v))
          proxyRes.pipe(res)
        })
        proxyReq.write(body)
        proxyReq.end()
      } else {
        client.get(opts, (proxyRes) => {
          res.status(proxyRes.statusCode)
          Object.entries(proxyRes.headers).forEach(([k, v]) => res.set(k, v))
          proxyRes.pipe(res)
        }).on('error', (err) => {
          if (!res.headersSent) res.status(502).json({ error: err.message })
        })
      }
    } catch (err) {
      if (!res.headersSent) res.status(502).json({ error: err.message })
    }
  }
}

app.use('/api', createProxy(config.upstream.abm48))
app.use('/pocketapi', createProxy(config.upstream.pocket48, {
  'Origin': 'https://h5.48.cn',
  'Referer': 'https://h5.48.cn/',
  'User-Agent': 'PocketFans201807/6.0.16 (iPhone; iOS 13.5.1; Scale/2.00)'
}))
app.use('/source48', createProxy(config.upstream.source48))

// ─── APK 处理 ──────────────────────────────────────────────────────────────
const upload = multer({ dest: path.join(__dirname, 'uploads') })

// ABM48 APK 上传
app.post('/apks/abm48/upload', upload.single('file'), (req, res) => {
  const password = req.body.password || ''
  if (password !== config.abm48_password) {
    return res.status(403).json({ error: '密码错误' })
  }
  if (!req.file) {
    return res.status(400).json({ error: '文件上传失败' })
  }

  const versionName = req.body.version || 'unknown'
  const notes = req.body.notes || ''
  const uploadDir = path.join(__dirname, 'public/apks/abm48')
  const fileName = req.file.originalname
  const targetFile = path.join(uploadDir, fileName)

  fs.mkdirSync(uploadDir, { recursive: true })
  fs.renameSync(req.file.path, targetFile)

  // 更新 version.json
  const jsonFile = path.join(uploadDir, 'version.json')
  let currentData = []
  if (fs.existsSync(jsonFile)) {
    try { currentData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8')) } catch {}
  }

  const newEntry = {
    name: versionName,
    filename: fileName,
    url: '/apks/abm48/' + fileName,
    date: new Date().toISOString().slice(0, 10),
    notes: notes.split(/[;；]/).map(s => s.trim()).filter(Boolean)
  }
  currentData.unshift(newEntry)
  fs.writeFileSync(jsonFile, JSON.stringify(currentData, null, 2))

  res.json({ success: true, message: '上传成功' })
})

// ABM48 下载计数
app.get('/apks/abm48/count', (req, res) => {
  const statsFile = path.join(__dirname, 'public/apks/abm48', 'stats.json')
  let stats = { total_downloads: 0 }
  if (fs.existsSync(statsFile)) {
    try { stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8')) } catch {}
  }
  stats.total_downloads++
  fs.mkdirSync(path.dirname(statsFile), { recursive: true })
  fs.writeFileSync(statsFile, JSON.stringify(stats))
  res.json({ success: true, total_downloads: stats.total_downloads })
})

// Member Archive APK 上传
app.post('/apks/member_archive/upload', upload.single('file'), (req, res) => {
  const password = req.body.password || ''
  if (password !== config.member_archive_password) {
    return res.status(403).json({ error: '密码错误' })
  }
  if (!req.file) {
    return res.status(400).json({ error: '文件上传失败' })
  }

  const versionName = req.body.version || 'unknown'
  const notes = req.body.notes || ''
  const uploadDir = path.join(__dirname, 'public/apks/member_archive')
  const fileName = req.file.originalname
  const targetFile = path.join(uploadDir, fileName)

  fs.mkdirSync(uploadDir, { recursive: true })
  fs.renameSync(req.file.path, targetFile)

  const jsonFile = path.join(uploadDir, 'version.json')
  let currentData = []
  if (fs.existsSync(jsonFile)) {
    try { currentData = JSON.parse(fs.readFileSync(jsonFile, 'utf-8')) } catch {}
  }

  const newEntry = {
    name: versionName,
    filename: fileName,
    url: '/apks/member_archive/' + fileName,
    date: new Date().toISOString().slice(0, 10),
    notes: notes.split(/[;；]/).map(s => s.trim()).filter(Boolean)
  }
  currentData.unshift(newEntry)
  fs.writeFileSync(jsonFile, JSON.stringify(currentData, null, 2))

  res.json({ success: true, message: '上传成功' })
})

// Member Archive 下载计数
app.get('/apks/member_archive/count', (req, res) => {
  const statsFile = path.join(__dirname, 'public/apks/member_archive', 'stats.json')
  let stats = { total_downloads: 0 }
  if (fs.existsSync(statsFile)) {
    try { stats = JSON.parse(fs.readFileSync(statsFile, 'utf-8')) } catch {}
  }
  stats.total_downloads++
  fs.mkdirSync(path.dirname(statsFile), { recursive: true })
  fs.writeFileSync(statsFile, JSON.stringify(stats))
  res.json({ success: true, total_downloads: stats.total_downloads })
})

// ─── 静态文件 ──────────────────────────────────────────────────────────────
// FFmpeg 核心文件
app.use('/ffmpeg', express.static(path.join(__dirname, 'public/ffmpeg')))

// APK 文件
app.use('/apks', express.static(path.join(__dirname, 'public/apks')))

// 生产环境：前端构建文件
const staticDir = path.resolve(__dirname, config.staticDir)
if (fs.existsSync(staticDir)) {
  app.use(express.static(staticDir))
  // SPA fallback
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/proxy/') && !req.path.startsWith('/api/') && !req.path.startsWith('/apks/')) {
      res.sendFile(path.join(staticDir, 'index.html'))
    }
  })
}

// ─── 启动 ──────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`Tools-site server running at http://localhost:${config.port}`)
  console.log(`  Segment proxy: /proxy/segment?url=<encoded_url>`)
  console.log(`  API proxy: /api/*, /pocketapi/*, /source48/*`)
  console.log(`  APK: /apks/abm48/*, /apks/member_archive/*`)
})
