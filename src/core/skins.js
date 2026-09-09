/* ============================================================
 * skins.js — 当前生效皮肤 / 水果外观查询
 * 对应原单文件 §5 中的 skinOf / skinEmoji / skinColor / FR。
 * 由全局配置 FRUITS/SKINS 与存档 save.skinActive 共同决定
 * 等级 -> 半径 / 表情 / 主色的映射。
 * ============================================================ */
import { FRUITS, RAINBOW_C, SKINS } from '../config.js';
import { save } from '../systems/storage.js';

/** 按水果实体取半径/得分数据（l=-1 为彩虹球：固定小尺寸、不计直接分） */
export function FR(b) {
  return b.l === -1 ? { r: 24, s: 0 } : FRUITS[b.l];
}

/** 当前激活的皮肤 */
export function skinOf() {
  for (const s of SKINS) if (s.id === save.skinActive) return s;
  return SKINS[0];
}

/** 等级 -> 表情（-1 为当前皮肤的彩虹特效） */
export function skinEmoji(l) {
  const s = skinOf();
  return l === -1 ? s.rain : s.items[l];
}

/** 等级 -> 主色（-1 为彩虹色） */
export function skinColor(l) {
  const s = skinOf();
  return l === -1 ? RAINBOW_C : s.colors[l];
}
