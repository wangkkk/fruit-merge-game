/* ============================================================
 * physics.js — 固定步长物理：积分 / 碰撞分离 / 合成 / 越线判定
 * 对应原单文件 §7「物理与合成」。
 * 核心约定：在同一帧候选碰撞收集完毕后统一执行 doMerge，
 * 合成产生的新球会重新参与后续步长，本模块只负责把“物理结果”
 * 写回共享状态 S，不接触 DOM。
 * ============================================================ */
import { W, H, DRAG, G, INV, WARN_Y, MAXL, FRUITS } from '../config.js';
import { FR, skinColor } from './skins.js';
import { S } from './state.js';
import { burst } from './fx.js';
import { doGameOver } from './game.js';
import { checkAch } from '../systems/achievements.js';
import { addCoins } from '../systems/storage.js';
import { sBoom, sMerge } from '../audio/sfx.js';

/** 推进一个固定步长 */
export function phys(dt) {
  const cand = [];
  for (const b of S.balls) {
    b.px = b.x; b.py = b.y;
    b.vy = Math.min(b.vy * DRAG + G * dt, 2200);
    b.vx *= DRAG;
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.grow = Math.min(1, b.grow + dt * 4);
  }
  /* 多轮分离，避免穿透 */
  for (let k = 0; k < 6; k++) {
    for (let i = 0; i < S.balls.length; i++) {
      const a = S.balls[i];
      if (a.dead) continue;
      const ra = FR(a).r;
      for (let j = i + 1; j < S.balls.length; j++) {
        const b = S.balls[j];
        if (b.dead) continue;
        const rb = FR(b).r;
        const dx = b.x - a.x, dy = b.y - a.y, rr = ra + rb, d2 = dx * dx + dy * dy;
        if (d2 < rr * rr) {
          const d = Math.sqrt(d2) || .001, ov = (rr - d) * .8, nx = dx / d, ny = dy / d,
            ma = ra * ra, mb = rb * rb, tm = ma + mb;
          a.x -= nx * ov * (mb / tm); a.y -= ny * ov * (mb / tm);
          b.x += nx * ov * (ma / tm); b.y += ny * ov * (ma / tm);
          if (k === 0 && d2 < (rr + 2) * (rr + 2) && canMerge(a, b)) cand.push([a, b]);
        }
      }
      /* 边界约束 */
      if (a.x < ra) a.x = ra;
      if (a.x > W - ra) a.x = W - ra;
      if (a.y > H - ra) a.y = H - ra;
    }
  }
  /* 候选只保留仍存活且确实贴近的 */
  for (const p of cand) {
    if (p[0].dead || p[1].dead) continue;
    const dx = p[1].x - p[0].x, dy = p[1].y - p[0].y, rr = FR(p[0]).r + FR(p[1]).r;
    if (dx * dx + dy * dy < rr * rr * 4) doMerge(p[0], p[1]);
  }
  S.balls = S.balls.filter(function (b) { return !b.dead; });
  for (const b of S.balls) {
    b.vx = (b.x - b.px) * INV;
    b.vy = (b.y - b.py) * INV;
  }
  /* 危险判定：静止水果压在警戒线上方超时 -> 出局 */
  if (!S.gameOver) {
    let dn = false;
    for (const b of S.balls) {
      const sp = b.vx * b.vx + b.vy * b.vy;
      if (S.simT - b.born > 1.5 && (b.y - FR(b).r) < WARN_Y && sp < 3600) dn = true;
    }
    if (dn) {
      S.dangerT += dt;
      if (S.dangerT > 1.2) doGameOver();
    } else {
      S.dangerT = Math.max(0, S.dangerT - dt * 1.6);
    }
  }
}

/** 同等级可合成；彩虹球可与任意球合成（两个彩虹球合成出 0 级） */
function canMerge(a, b) {
  if (a.dead || b.dead) return false;
  return a.l === -1 || b.l === -1 || (a.l === b.l && a.l < MAXL);
}

/** 执行一对水果的合成 / 爆炸 */
function doMerge(a, b) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, mult = 1 + 0.25 * Math.min(S.combo, 10);
  let nl;
  if (a.l === -1 && b.l === -1) nl = 0;
  else if (a.l === -1) nl = b.l + 1;
  else if (b.l === -1) nl = a.l + 1;
  else nl = a.l + 1;

  if (nl > MAXL) {
    /* 两个顶级球碰撞 -> 爆裂大赏 */
    a.dead = b.dead = true;
    const gain = Math.round(500 * mult);
    S.score += gain;
    addCoins(50);
    S.combo++; S.comboTimer = 2; S.maxCombo = Math.max(S.maxCombo, S.combo);
    burst(mx, my, '#ffe66d', 36, 420);
    burst(mx, my, skinColor(MAXL), 24, 300);
    S.shake = .7;
    S.floats.push({ x: mx, y: my, t: '+' + gain, life: 1.2, size: 22, c: '#ffd32a' });
    sBoom();
    checkAch();
    return;
  }

  a.dead = b.dead = true;
  S.balls.push({ x: mx, y: my, vx: (a.vx + b.vx) * .1, vy: (a.vy + b.vy) * .1, l: nl, grow: 0, born: S.simT - 1, px: mx, py: my });
  const gain = Math.round(FRUITS[nl].s * mult);
  S.score += gain;
  addCoins(nl + 1);
  S.combo++; S.comboTimer = 2; S.maxCombo = Math.max(S.maxCombo, S.combo);
  S.mergeCount++; S.runMaxLevel = Math.max(S.runMaxLevel, nl);
  burst(mx, my, skinColor(nl), 14, 180 + nl * 16);
  S.floats.push({ x: mx, y: my, t: '+' + gain, life: 1, size: 15 + nl * 1.5, c: '#fff' });
  sMerge(nl);
  if (nl === MAXL) {
    S.shake = .5;
    burst(mx, my, skinColor(MAXL), 30, 360);
  }
  checkAch();
}
