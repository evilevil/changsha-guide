import type { ImageMetadata } from 'astro';

// 显式导入「实际用到」的图片：避免 import.meta.glob 把未使用/原图一并打进产物。
// 新增图片时在这里登记一行，然后即可用 <Pic name="文件名（不含扩展名）" /> 引用。
import bayiFen from '../assets/images/bayi-fen.jpg';
import binjiang from '../assets/images/binjiang.jpg';
import binjiangTower from '../assets/images/binjiang-tower.jpg';
import changshaMuseum from '../assets/images/changsha-museum.jpg';
import chayan from '../assets/images/chayan.jpg';
import deyuan from '../assets/images/deyuan.jpg';
import ganchangshun from '../assets/images/ganchangshun.jpg';
import hotel from '../assets/images/hotel.jpg';
import huangayi from '../assets/images/huangayi.jpg';
import ifs from '../assets/images/ifs.jpg';
import jiangbanya from '../assets/images/jiangbanya.jpg';
import juzizhou from '../assets/images/juzizhou.jpg';
import museum from '../assets/images/museum.jpg';
import tianxin from '../assets/images/tianxin.jpg';
import wenheyou from '../assets/images/wenheyou.jpg';
import xiangqun from '../assets/images/xiangqun.jpg';
import xiezilong from '../assets/images/xiezilong.jpg';
import yangyuxing from '../assets/images/yangyuxing.jpg';
import yuelu from '../assets/images/yuelu.jpg';
import yuloudong from '../assets/images/yuloudong.jpg';

/** 文件名（去扩展名）→ Astro 图片元数据 */
export const images: Record<string, ImageMetadata> = {
  'bayi-fen': bayiFen,
  binjiang,
  'binjiang-tower': binjiangTower,
  'changsha-museum': changshaMuseum,
  chayan,
  deyuan,
  ganchangshun,
  hotel,
  huangayi,
  ifs,
  jiangbanya,
  juzizhou,
  museum,
  tianxin,
  wenheyou,
  xiangqun,
  xiezilong,
  yangyuxing,
  yuelu,
  yuloudong,
};

export function img(name: string): ImageMetadata {
  const found = images[name];
  if (!found) throw new Error(`未知图片: ${name}`);
  return found;
}

export const imageNames = Object.keys(images).sort();
