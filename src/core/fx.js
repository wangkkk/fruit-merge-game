/* ============================================================
 * fx.js — 粒子特效生成
 * 从原单文件 §7 中抽出的公共特效能力：往共享状态 S.parts
 * 写入一组随机速度的圆形粒子，供 render 每帧绘制并衰减。
 * physics（合成爆炸）与 tools（道具命中）共用本模块。
 * ============================================================ */
import { S } from './state.js';

/** 在 (x, y) 产生 n 个颜色 c、初速 sp 的粒子 */
export function burst(x, y, c, n, sp) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = sp * (0.3 + Math.random() * 0.7);
    S.parts.push({
      x: x, y: y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - 60,
      life: 0.5 + Math.random() * 0.4,
      max: 0.9,
      c: c,
      r: 2 + Math.random() * 3,
    });
  }
}
