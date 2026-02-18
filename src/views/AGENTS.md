# VIEWS KNOWLEDGE BASE

**Generated:** 2026-02-19
**Type:** Vue 3 Page Components - Domain Tool Collection
**Purpose:** Specialized tool pages for idol fan support

## OVERVIEW
Vue 3 single-page components with distinct domains: Home (tool dashboard), Download (app distribution), Clip/Transcode/Merge (FFmpeg processing), About (static content).

## STRUCTURE
```
src/views/
├── Home.vue         # Tool navigation cards grid + welcome
├── Download.vue     # APK distribution timeline + version management
├── Clip.vue         # FFmpeg WASM video processing + batch operations
├── Transcode.vue    # Batch transcoding + audio extraction
├── Merge.vue        # Media concatenation (concat demuxer) + drag-drop sort
└── About.vue        # Static content + contact modal + links
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Tool cards navigation | src/views/Home.vue | Grid layout with emoji icons + router navigation |
| APK version management | src/views/Download.vue | Timeline component + download triggers + download counting |
| FFmpeg video processing | src/views/Clip.vue, src/views/Transcode.vue, src/views/Merge.vue | WebAssembly integration + file operations |
| Contact QR modal | src/views/About.vue | Dialog with dynamic QR image switching |

## ANTI-PATTERNS (THIS PROJECT)
- No shared state between views (props/events only)
- Each page handles its own layout independently
- No global component library (Element Plus used directly)
- File uploads handled with native input elements
- No route-based data fetching patterns
