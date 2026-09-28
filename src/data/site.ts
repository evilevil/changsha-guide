const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** 拼上 Astro base 前缀的内部链接。url('/food') → '/changsha-guide/food' */
export function url(path = '/'): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}`;
}

export const site = {
  title: '长沙星城游',
  fullTitle: '杭州出发 · 长沙两晚 + 武陵源 · 2026.9.29–10.4',
  description:
    '杭州夜抵长沙 · 保利橘洲诺雅一晚 + 北辰洲际一晚 · 省博后赴张家界武陵源 · 10/4 晚机飞上海。含交通衔接、体力友好岳麓、国庆避峰与交互地图。',
  dates: '2026.9.29 — 10.4',
  hotel: '保利橘洲诺雅 → 北辰洲际 → 武陵源军地坪',
  hotelAddr: '长沙两晚换宿 · 张家界住景区口',
  repo: 'https://github.com/evilevil/changsha-guide',
  online: 'https://evilevil.github.io/changsha-guide/',
  hero: {
    badge: '杭州夜抵 · 长沙两晚换宿 · 武陵源收官飞上海',
    title: '星城 · 武陵源',
    dates: '2026.9.29 — 10.4',
    sub: 'D0 保利橘洲诺雅 · D1 橘洲+岳麓转洲际 · D2 省博后赴张',
    sub2: '慢节奏可撤退 · 岳麓书院默认 · 国庆节日模式 +30 分钟 · 10/4 赶机',
    chips: ['22:30 夜抵', '两晚换宿', '省博主线', '武陵源 3 夜', '10/4 飞沪'],
  },
  footerNote:
    '旅行提示：长沙湘菜较辣，开口说「冒辣」。橘子洲坐观光车；岳麓优先书院，不硬爬山。武陵源国庆排队长，早进东门、环保车优先；10/4 18:15 前上车赶机。',
  sourceNote:
    '坐标 / 评分 / 营业时间来自高德开放平台（2026-09-28 复核）；驾车时长来自高德路径规划，实际以当日路况为准。航班/高铁时刻请以航司、12306 为准。',
};

export type NavItem = { href: string; label: string; icon: string };

export const nav: NavItem[] = [
  { href: '/', label: '首页', icon: '🍊' },
  { href: '/itinerary', label: '行程', icon: '🗺️' },
  { href: '/zhangjiajie', label: '张家界', icon: '⛰️' },
  { href: '/map', label: '地图', icon: '📍' },
  { href: '/food', label: '美食', icon: '🌶️' },
  { href: '/attractions', label: '景点', icon: '🧭' },
  { href: '/weibo', label: '微博手册', icon: '📡' },
  { href: '/spots', label: '机位', icon: '📷' },
  { href: '/tips', label: '攻略', icon: '💡' },
  { href: '/gallery', label: '相册', icon: '📸' },
];
