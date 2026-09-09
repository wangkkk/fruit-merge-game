/* ============================================================
 * loop.js — 固定步长主循环
 * 对应原单文件 §16「主循环」。
 * 弹窗 / 出局时暂停物理累积，但粒子与飘字特效每帧照常推进，
 * 避免画面冻结；由 main.js 以 requestAnimationFrame 启动。
 * ============================================================ */
import { STEP } from '../config.js';
import { S } from './state.js';
import { phys } from './physics.js';
import { render } from './render.js';

let last = performance.now();
let accum = 0;

export function frame(now) {
  const dt = Math.min((now - last) / 1000, .05);
  last = now;
  if (S.modalN === 0 && !S.gameOver) {
    accum += dt;
    while (accum >= STEP) {
      S.simT += STEP;
      S.cool -= STEP;
      if (S.comboTimer > 0) {
        S.comboTimer -= STEP;
        if (S.comboTimer <= 0) S.combo = 0;
      }
      phys(STEP);
      accum -= STEP;
    }
  } else {
    accum = 0;
  }

  /* 特效始终更新（死亡/弹窗时也继续飘） */
  for (let i = S.parts.length - 1; i >= 0; i--) {
    const p = S.parts[i];
    p.vy += 900 * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.life -= dt;
    if (p.life <= 0) S.parts.splice(i, 1);
  }
  for (let i = S.floats.length - 1; i >= 0; i--) {
    const f = S.floats[i];
    f.y -= 45 * dt;
    f.life -= dt;
    if (f.life <= 0) S.floats.splice(i, 1);
  }

  render(dt);
  requestAnimationFrame(frame);
}
