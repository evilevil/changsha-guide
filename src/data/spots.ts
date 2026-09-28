export type SpotCard = {
  title: string;
  photo: string;
  height?: string;
  items: string[];
};

export const spotCards: SpotCard[] = [
  {
    title: '橘子洲 · 青年毛泽东雕塑',
    photo: 'juzizhou',
    height: '200px',
    items: [
      '**机位A**：正面偏右 45°，拍面部轮廓',
      '**机位B**：侧面 + 江面，竖构图人像',
      '**时间**：9–11 点；国庆尽量 8:30 前到位',
    ],
  },
  {
    title: '岳麓书院 · 门联 / 红墙',
    photo: 'yuelu',
    height: '200px',
    items: [
      '**机位**：「惟楚有材」门正面，等人潮空档连拍',
      '**爱晚亭**：亭檐仰拍或侧后方，避开正门拥堵',
    ],
  },
  {
    title: '滨江文化园 · 景观塔',
    photo: 'binjiang-tower',
    height: '200px',
    items: [
      '抵达日黄金机位；黄昏逆光建筑线条',
      '江边步道拍对岸夜景，三脚架友好',
    ],
  },
  {
    title: '黄娭毑口味虾',
    photo: 'huangayi',
    height: '200px',
    items: [
      '虾上桌先拍手套 + 红油，再开吃',
      '点微辣/冒辣；两人分一份即可',
    ],
  },
  {
    title: '超级文和友',
    photo: 'wenheyou',
    height: '200px',
    items: [
      '永远街霓虹、老阳台俯拍',
      '人多就拍局部招牌/餐盘，别死磕空镜',
    ],
  },
  {
    title: 'IFS / 五一',
    photo: 'ifs',
    height: '200px',
    items: [
      '中庭仰拍玻璃幕墙；外立面夜景',
      '茶颜杯子特写 + 商场灯光',
    ],
  },
];
