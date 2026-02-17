# SRC KNOWLEDGE BASE

**Generated:** 2026-02-04
**Type:** Vue 3 + Element Plus Frontend Source
**Purpose:** 偶像应援工具网站前端源码

## OVERVIEW
Vue 3 single-page application source with Composition API, Element Plus UI, and Chinese localization.

## STRUCTURE
```
src/
├── main.js              # Vue app initialization + Element Plus setup
├── App.vue              # Root layout with navigation + background image
├── router/              # Vue Router 4 configuration
├── views/               # Page components (Home, Clip, Download, About)
├── assets/              # Static assets (images, icons)
└── style.css            # Global styles
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Vue app setup | src/main.js | Element Plus + icons registration |
| Navigation & layout | src/App.vue | Dropdown menu + router-view + transitions |
| Route definitions | src/router/index.js | Lazy-loaded components + title guards |
| Video processing | src/views/Clip.vue | FFmpeg integration + file handling |
| Tool cards grid | src/views/Home.vue | Navigation cards for each tool |

## CONVENTIONS
- **Component style**: Vue 3 Composition API with `<script setup>`
- **UI framework**: Element Plus with Chinese locale (zh-CN)
- **Routing**: Vue Router 4 with lazy loading and meta titles
- **Icons**: Global registration of all Element Plus icons
- **Styling**: Scoped CSS in components + global styles in App.vue
- **Asset management**: Direct imports for images + dynamic favicon setting
- **Navigation**: External links open in new tabs, internal use router-link

## ANTI-PATTERNS (THIS PROJECT)
- No TypeScript configuration (pure JavaScript)
- No build tool CSS preprocessing (plain CSS only)
- Element Plus components used without custom theme
- Background image handled as import instead of public folder
- No state management library (props/events only)
