# 长沙五日攻略 · 多页面版

杭州东 → 长沙南 · 2026.10.1–10.5 · 北辰洲际为全程基地。

**在线访问**：https://evilevil.github.io/changsha-guide/

> 仓库有两个版本：
> - `main` —— 旧版**单文件 HTML**（图片/样式/脚本/地图引擎全部内联，可离线双击打开）。
> - `astro` —— 本版**多页面站**，用 Astro + Tailwind 重建，内容抽成结构化数据。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | [Astro](https://astro.build/) 7（文件路由多页面 · 默认零运行时 JS） |
| 样式 | [Tailwind CSS](https://tailwindcss.com/) 4（`@theme` 设计令牌 + 组件层） |
| 图片 | `astro:assets` 自动转 WebP + 响应式 srcset |
| 地图 | 自研轻量瓦片引擎（零第三方库，高德路网/影像双底图，GCJ-02 真实坐标） |
| 部署 | GitHub Actions → GitHub Pages |

## 页面结构

```
/            首页 = Hero + 今日速览 + 五日概览 + 出发天气 + 地图 + 入口
/itinerary   五日行程（D1–D5 时间轴，含时间表 / 机位 / 微博札记）
/map         高德交互地图（按天筛选动线 / 一键唤起高德导航 / 离线降级）
/food        美食（北辰周边 · 坡子街避雷 · 口味虾 · 粉面 · 正餐）
/attractions 景点 × 匹配度对照表 + 景点卡
/weibo       微博本地手册（照做/别做表 + 原话 + 点单细化）
/spots       打卡机位图鉴
/tips        实用攻略
/gallery     相册画廊
```

## 目录约定

```
src/
├── assets/images/       原始照片（构建时由 astro:assets 优化）
├── components/          Nav / Footer / PageHero / DayCard / FoodGroup / MapPanel / Pic / MatchStars
├── data/                内容数据源（改内容只需动这里）
│   ├── site.ts          站点信息 + 导航 + base 链接工具
│   ├── itinerary.ts     五日行程 + 今日速览 + 酒店/偏好卡
│   ├── depart.ts        高铁衔接 + 天气
│   ├── food.ts          美食分组
│   ├── attractions.ts   景点匹配度
│   ├── spots.ts         打卡机位
│   ├── weibo.ts         微博手册
│   ├── gallery.ts       相册
│   ├── pois.ts          地图 POI / 每日动线 / 分类配色
│   └── images.ts        图片名 → ImageMetadata 注册表
├── layouts/BaseLayout.astro
├── lib/rich.ts          极简行内富文本（**粗体** → <strong>）
├── pages/               多页面路由
├── scripts/map.ts       地图引擎（从旧版 map_lite.js 迁移为 TS 模块）
└── styles/              global.css（设计系统）· map.css（地图样式）
```

## 本地开发

```bash
pnpm install
pnpm dev        # http://localhost:4321/changsha-guide/
pnpm build      # 产物在 dist/
pnpm preview    # 本地预览构建产物
```

## 改内容

日常改动基本只碰 `src/data/*.ts`：

- 改行程 → `itinerary.ts` 的 `days` 数组
- 加馆子 → `food.ts` 对应分组
- 加点位 → 同时改 `pois.ts` 的 `POIS` 与 `DAYS[].order`（地图动线依赖）

`data` 里的文本支持 `**粗体**` 行内标记，由 `lib/rich.ts` 渲染。

## 部署

推送到 `main` 触发 `.github/workflows/pages.yml`：安装依赖 → `pnpm build` → 发 `dist/` 到 Pages。

`astro.config.mjs` 里 `base: '/changsha-guide'` 对应项目站路径；若换到自定义域名或用户站，需要同步改掉。

## 说明

- 底图瓦片来自高德，联网时显示真实路网；离线时自动切换为示意底图。
- 驾车时长来自高德路径规划，实际以当日路况为准；国庆期间建议再乘 1.5–2 倍冗余。
- 高德导航深链在手机上会尝试唤起高德 App，需手机有网。
