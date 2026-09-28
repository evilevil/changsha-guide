export type MatchLevel = 'high' | 'mid' | 'low';

export type AttractionRow = {
  name: string;
  addr?: string;
  match: string;
  level: MatchLevel;
  reason: string;
  advice: string;
};

export const attractionConclusion = {
  title: '先说结论：现有景点她喜不喜欢？',
  items: [
    '**真喜欢（高匹配）**：湖南博物院、滨江文化园/北辰滨江公园、长沙博物馆+市图、黄娭毑/玉楼东/甘长顺 — 对应「博物馆听讲解」「水岸疗愈」「排行榜本地吃」（**坡子街已因避雷删除**）',
    '**能接受且本次默认（中高匹配）**：橘子洲头（观光车控量）、岳麓 **书院平路**（9/30 默认文化点）、IFS/茶颜（吹空调）',
    '**条件允许 / 低匹配**：岳麓索道短体验（仅天晴）、天心阁登楼、文和友超长队、远郊梅溪湖、天门山硬塞 — 撞上「逛景点像煎熬」时优先砍',
  ],
  footnote:
    '评分依据：微博原话 + 国庆拥堵成本 + 距当日酒店远近（高德）。岳麓改为「书院默认 / 登山可砍」，不再整段删除。',
};

export const attractionRows: AttractionRow[] = [
  {
    name: '湖南博物院',
    addr: '东风路 50 号 · 近酒店',
    match: '★★★★★',
    level: 'high',
    reason: '「最开心的博物馆美术馆公园日」+ 爱听讲解典故',
    advice: '**必做主线** · 预约讲解/语音',
  },
  {
    name: '滨江文化园 / 北辰滨江公园',
    addr: '酒店步行可达',
    match: '★★★★★',
    level: 'high',
    reason: '横滨帖：比过「上海滨江 / 金鸡湖 / 维港」；公园让时间变慢',
    advice: '**每日可回血** · 首选',
  },
  {
    name: '长沙博物馆 + 长沙市图书馆',
    addr: '三馆一厅 · 酒店旁',
    match: '★★★★☆',
    level: 'high',
    reason: '伦敦大英图书馆静谧感；室内、近、可撤退',
    advice: '**下雨/累了备选**',
  },
  {
    name: '烈士公园',
    addr: '东风路 · 省博旁',
    match: '★★★★☆',
    level: 'high',
    reason: '公园疗愈 + 情侣慢走；微博攻略常接在省博后',
    advice: '**10/1 馆后可选 · 雨大砍**',
  },
  {
    name: '黄娭毑 / 玉楼东 / 甘长顺',
    addr: '非游客街本地馆',
    match: '★★★★☆',
    level: 'high',
    reason: '排行榜本地吃 + 性价比；避开游客街踩雷',
    advice: '**吃日主线**',
  },
  {
    name: '坡子街（含火宫殿/鱼嘴巴）',
    match: '☆☆☆☆☆',
    level: 'low',
    reason: '有人明确避雷；游客街踩雷风险高',
    advice: '**整条不进**',
  },
  {
    name: '谢子龙影像艺术馆 / 李自健美术馆',
    addr: '洋湖 · 驾车约 30 分钟',
    match: '★★★★☆',
    level: 'mid',
    reason: '外滩美术馆、影像展、艺术建筑 — 类型极合；国庆跨城成本高',
    advice: '体力好时 **可替换天心阁**；累了砍',
  },
  {
    name: '橘子洲头',
    addr: '免费 · 江心',
    match: '★★★☆☆',
    level: 'mid',
    reason: '水岸尚可；微博踩雷：全岛徒步会累垮',
    advice: '观光车去雕塑 · **2h 封顶**',
  },
  {
    name: '岳麓书院（仅平路）',
    match: '★★★★☆',
    level: 'mid',
    reason: '京都寺庙式文化深度；9/30 默认「有文化感」的一版',
    advice: '**默认必做感** · 登山另议可砍',
  },
  {
    name: 'IFS / 五一茶颜',
    match: '★★★☆☆',
    level: 'mid',
    reason: '逛街有记录，但非旅行主线；空调休息有用',
    advice: '省博后顺路 · 可跳过',
  },
  {
    name: '超级文和友',
    match: '★★☆☆☆',
    level: 'mid',
    reason: '美食打卡属性强，但她要「排队叫号永远靠前」',
    advice: '队 >40min **立刻换本地虾馆**',
  },
  {
    name: '天心阁',
    match: '★★☆☆☆',
    level: 'low',
    reason: '典型「来都来了」登楼景点，缺她的文化/水岸锚点',
    advice: '**默认可砍** · 换酒店发呆也行',
  },
  {
    name: '岳麓山登山 / 索道 / 云麓宫',
    match: '★★☆☆☆',
    level: 'low',
    reason: '撞「逛景点像煎熬」；雨天索道可能停运',
    advice: '**默认不硬爬**；索道仅天晴短体验',
  },
  {
    name: '梅溪湖公园 / 音乐喷泉 / 桃花岭',
    match: '★★☆☆☆',
    level: 'low',
    reason: '水岸类型尚可，但远 + 堵 = 十一高风险',
    advice: '本次 **不排**',
  },
  {
    name: '太平老街 / 杜甫江阁 / 古开福寺',
    match: '★★☆☆☆',
    level: 'low',
    reason: '类型尚可，但与坡子街游客动线重叠',
    advice: '**本次不排**',
  },
  {
    name: '咸嘉湖 / 橘子洲恐龙园 / 小火车',
    match: '★☆☆☆☆',
    level: 'low',
    reason: '亲子/二次消费打卡，语料无对应偏好',
    advice: '忽略',
  },
];

export type AttractionCard = {
  title: string;
  badge: string;
  badgeTone: MatchLevel | 'brand';
  photo: string;
  lines: string[];
};

export const attractionCards: AttractionCard[] = [
  {
    title: '🏺 湖南博物院',
    badge: '她会喜欢',
    badgeTone: 'high',
    photo: 'museum',
    lines: [
      '📍 东风路 50 号 · 预约入馆',
      '**为何匹配：** 马王堆 + 讲解 = 她福州「博物馆日」同款结构',
      '**玩法：** 只看镇馆，不追求全馆刷完',
    ],
  },
  {
    title: '🌊 滨江文化园',
    badge: '她会喜欢',
    badgeTone: 'high',
    photo: 'binjiang',
    lines: [
      '📍 酒店旁 · 三馆一厅 / 景观塔',
      '**为何匹配：** 水岸公园疗愈；累了 10 分钟回房',
      '**加分：** 同片区长沙博物馆/市图可进室内',
    ],
  },
  {
    title: '🍊 橘子洲头',
    badge: '控量可去',
    badgeTone: 'mid',
    photo: 'juzizhou',
    lines: [
      '📍 橘子洲头 2 号 · 地铁橘子洲·青莲',
      '**为何半匹配：** 江景 Citywalk OK，全岛拉练不行',
      '**玩法：** 雕塑打卡就撤，不走穿',
    ],
  },
  {
    title: '📕 岳麓书院',
    badge: '默认书院',
    badgeTone: 'mid',
    photo: 'yuelu',
    lines: [
      '📍 麓山路 273 号 · 9/30 下午',
      '**为何匹配：** 文化深度像京都；本版默认平路 1–1.5h',
      '**可砍：** 登山 / 爱晚亭硬排；索道仅天晴短体验',
    ],
  },
  {
    title: '🏛️ 长沙博物馆 + 市图书馆',
    badge: '室内备选',
    badgeTone: 'mid',
    photo: 'changsha-museum',
    lines: [
      '📍 栖凤路与湘江北路交汇西南 150 米 · 洲际驾车 **0.6 km / 约 5 分钟**',
      '**为何匹配：** 三馆一厅室内文化点，下雨/太热随时撤退',
      '**高德评分：** 4.6 · 就在滨江文化园旁边',
    ],
  },
  {
    title: '📷 谢子龙 / 李自健',
    badge: '偏好合 · 远',
    badgeTone: 'mid',
    photo: 'xiezilong',
    lines: [
      '📍 潇湘南路一段 · 洲际驾车 **16.0 km / 约 29 分钟**（高德实测）',
      '**为何匹配：** 美术馆/影像馆类型她明确喜欢',
      '**开放：** 李自健 周二至周日 09:30–17:30（周一闭馆）',
      '**代价：** 国庆路程易堵；建议替换「天心阁日」而不是硬加一天',
    ],
  },
  {
    title: '🏯 天心阁',
    badge: '默认跳过',
    badgeTone: 'low',
    photo: 'tianxin',
    lines: [
      '📍 天心路 17 号',
      '**为何低匹配：** 登楼清单型景点，缺她的锚点',
      '**建议：** 返程日优先酒店慢活 / 特产，不必为打卡登楼',
    ],
  },
];
