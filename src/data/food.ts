export type FoodItem = {
  name: string;
  rating?: string;
  addr?: string;
  hours?: string;
  price?: string;
  /** 为什么算长沙 / 本地评价 */
  why?: string;
  /** 点单建议 */
  order?: string;
  photo?: string;
  tone?: 'normal' | 'good' | 'bad';
};

export type FoodGroup = {
  id: string;
  title: string;
  badge: string;
  tone: 'brand' | 'warn' | 'success';
  intro?: string;
  items: FoodItem[];
  note?: { title: string; titleTone?: 'success' | 'warn'; items: string[] };
  /** 替代推荐（坡子街避雷卡用） */
  alternatives?: string[];
};

export const foodPrinciples = {
  title: '筛选原则（她的喜好 × 微博本地）',
  items: [
    '**要**：本地人会去的馆（口味虾巷子店、粉面老字号、玉楼东/笨罗卜、茶颜、酱板鸭）',
    '**不要**：坡子/太平/五一主街游客店；费大厨等全国连锁；为网红空耗体力',
    '开口先说 **「冒辣」**（微博：微辣仍可能辣哭）；虾后可配清汤面',
    '正向提及排序（检索样本内）：茶颜、甘长顺、玉楼东、黄娭毑…；负向头名：文和友排队、坡子街',
  ],
};

export const foodGroups: FoodGroup[] = [
  {
    id: 'base',
    title: '🏨 北辰洲际附近（走路/打车 5–10 分钟）',
    badge: '换宿后首选',
    tone: 'brand',
    items: [
      {
        name: '八一桥原味粉馆（北辰店）',
        rating: '4.6',
        addr: '北辰三角洲奥城 D2 区车库层 G072',
        hours: '约 06:00–22:00',
        price: '人均约 ¥16',
        why: '本地米粉馆，不是全国粉连锁。',
        order: '原味牛肉粉 / 肉丝粉；汤清、粉滑，适合刚下车垫肚子。',
        photo: 'bayi-fen',
        tone: 'good',
      },
      {
        name: '鸭想卤·酱板鸭（北辰旗舰）',
        rating: '4.5',
        addr: '奥城 E4 区 4 栋',
        hours: '24h',
        price: '人均约 ¥33',
        why: '长沙特产：酱板鸭真空可带走；当零食/配啤酒都合适。南站也有黑色经典，但想「本地卤味」优先酱板鸭。',
        photo: 'jiangbanya',
      },
      {
        name: '茶颜悦色（北辰荟）',
        addr: '北辰荟 4F（酒店楼下商场）',
        why: '长沙土著奶茶（外地有店也不如长沙密）。',
        order: '新手：幽兰拿铁；怕甜减糖。酒店累了也可下楼北辰荟解决，不必专程五一。',
        photo: 'chayan',
      },
    ],
  },
  {
    id: 'pozi',
    title: '🚫 坡子街 · 整条避雷',
    badge: '不进',
    tone: 'warn',
    items: [],
    note: {
      title: '为什么砍掉',
      titleTone: 'warn',
      items: [
        '有人明确避雷：游客密度高、踩雷店多、性价比不稳定。火宫殿总店 / 鱼嘴巴 / 黑色经典等 **都在这条线上，一并跳过**。',
      ],
    },
    alternatives: [
      '**黄娭毑** 高正街 — 口味虾',
      '**玉楼东** 北正街 — 正餐湘菜',
      '**甘长顺 / 杨裕兴** — 粉面',
      '**文和友** — 仅短队时',
      '想带臭豆腐：南站超市真空装，别专程去游客街',
    ],
  },
  {
    id: 'shrimp',
    title: '🦞 口味虾 · 本地馆（非全国连锁）',
    badge: '夜宵',
    tone: 'brand',
    items: [
      {
        name: '超级文和友（海信广场）',
        rating: '4.8',
        addr: '湘江中路 36 号',
        hours: '约 11:00–次日 02:00',
        price: '人均约 ¥88+',
        why: '长沙地标：口味虾 + 老长沙街区；排队超 1.5h 就改下一家本地虾馆。',
        photo: 'wenheyou',
        tone: 'normal',
      },
      {
        name: '黄娭毑口味小龙虾',
        rating: '4.6',
        addr: '高正街 54 号',
        hours: '约 12:00–04:00',
        price: '人均约 ¥81',
        why: '本地人口味虾馆；比全国连锁「小龙虾店」更有长沙味。',
        photo: 'huangayi',
        tone: 'good',
      },
      {
        name: '不推荐：太平街 / 坡子街虾馆',
        addr: '与坡子街游客动线重叠',
        why: '本次一律跳过；虾馆只保留 **黄娭毑（高正街）**。',
        tone: 'bad',
      },
    ],
  },
  {
    id: 'noodles',
    title: '🥣 粉面锅饺 · 长沙早餐文化',
    badge: '老字号',
    tone: 'brand',
    items: [
      {
        name: '甘长顺（总店）',
        rating: '4.4',
        addr: '解放西路 136 号',
        hours: '约 06:00–02:00',
        price: '人均约 ¥20',
        why: '长沙人自己吃的粉面；牛肉粉/肉丝粉。',
        photo: 'ganchangshun',
        tone: 'good',
      },
      {
        name: '杨裕兴（中山路店）',
        rating: '4.4',
        addr: '中山路 347 号',
        hours: '约 06:00–02:00',
        price: '人均约 ¥24',
        why: '百年长沙粉面老字号；与甘长顺可二选一，别浪费胃容量。',
        photo: 'yangyuxing',
      },
      {
        name: '向群锅饺',
        addr: '南门口店 / 登高路店（近岳麓）',
        why: '长沙早餐代表：锅饺 + 扁豆面/拌粉；岳麓那天可顺路。',
        photo: 'xiangqun',
      },
      {
        name: '百年德园',
        rating: '4.6',
        addr: '芙蓉中路三段 98 号（候家塘）',
        hours: '约 06:00–22:00',
        price: '人均约 ¥10',
        why: '长沙大包子；路过可买，不当正餐主线。',
        photo: 'deyuan',
      },
    ],
  },
  {
    id: 'dinner',
    title: '🍽️ 正餐湘菜（长沙老字号）',
    badge: '坐下来吃',
    tone: 'success',
    items: [
      {
        name: '玉楼东（北正街旗舰）',
        addr: '北正街 32–40 号',
        price: '人均约 ¥41',
        why: '长沙老字号湘菜，少网红滤镜；适合想吃「正经一顿」时。',
        photo: 'yuloudong',
        tone: 'good',
      },
      {
        name: '笨罗卜浏阳菜馆（育英街）',
        addr: '育英街 14 号（黄兴铜像附近）',
        price: '人均约 ¥40',
        why: '微博本地帖常推：醋蒸鸡、酸菜炒粉皮；平价烟火。**勿去太平街店**（游客线）。',
        tone: 'good',
      },
    ],
    note: {
      title: '点单速查（长沙特有组合）',
      titleTone: 'success',
      items: [
        '口味虾（黄娭毑）+ 冰粉/酸梅汤',
        '玉楼东正经一顿湘菜',
        '酱板鸭真空装',
        '茶颜 · 幽兰拿铁',
        '粉面：甘长顺 / 杨裕兴 / 八一桥',
      ],
    },
  },
];

/** 坡子街避雷卡的替代推荐 */
export const poziAlternatives: string[] = [
  '**黄娭毑** 高正街 — 口味虾',
  '**玉楼东** 北正街 — 正餐湘菜',
  '**甘长顺 / 杨裕兴** — 粉面',
  '**文和友** — 仅短队时',
  '想带臭豆腐：南站超市真空装，别专程去游客街',
];
