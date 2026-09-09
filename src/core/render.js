/* ============================================================
 * render.js — canvas 绘制与 HUD 刷新
 * 对应原单文件 §5 的 canvas 初始化 / shade 与 §15「渲染」。
 * 模块顶层完成画布尺寸与 DPR 缩放；每帧由 loop.js 调用 render(dt)。
 * ============================================================ */
import { W, H, DROP_Y, WARN_Y } from '../config.js';
import { FR, skinEmoji, skinColor } from './skins.js';
import { S } from './state.js';
import { save } from '../systems/storage.js';
import { $ } from '../ui/dom.js';

/* canvas 初始化（原 §5 的 cv/ctx/dpr） */
export const cv = $('cv');
export const ctx = cv.getContext('2d');
const dpr = Math.min(window.devicePixelRatio || 1, 2);
cv.width = W * dpr;
cv.height = H * dpr;
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

/** 十六进制颜色按 ±p 调整亮度（rgb 串） */
function shade(hex, p) {
  const n = parseInt(hex.slice(1), 16);
  const f = function (x) { return Math.max(0, Math.min(255, x + p)); };
  return 'rgb(' + f(n >> 16) + ',' + f((n >> 8) & 255) + ',' + f(n & 255) + ')';
}

/** 画一颗球（alpha 用于预览球半透明） */
function drawBall(b, alpha) {
  const r = FR(b).r * (b.grow < 1 ? 0.4 + 0.6 * b.grow : 1), col = skinColor(b.l), em = skinEmoji(b.l);
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(b.x - r * .35, b.y - r * .4, r * .15, b.x, b.y, r);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(.25, col);
  g.addColorStop(1, shade(col, -25));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(b.x, b.y, r, 0, 7);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = (r * 1.1) + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(em, b.x, b.y + r * .06);
  ctx.restore();
}

/** 整帧绘制 + HUD 数值刷新 */
export function render(dt) {
  S.shake = Math.max(0, S.shake - dt * 1.4);
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#262a5e');
  bg.addColorStop(1, '#191b3c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  if (S.shake > 0) ctx.translate((Math.random() - .5) * S.shake * 14, (Math.random() - .5) * S.shake * 14);

  /* 警戒线（越危险越红越粗） */
  const dn = Math.min(1, S.dangerT / 1.2);
  ctx.setLineDash([7, 7]);
  ctx.lineWidth = 2 + dn * 2;
  ctx.strokeStyle = 'rgba(255,' + Math.round(107 * (1 - dn)) + ',' + Math.round(107 * (1 - dn)) + ',' + (0.45 + 0.5 * dn) + ')';
  ctx.beginPath();
  ctx.moveTo(0, WARN_Y);
  ctx.lineTo(W, WARN_Y);
  ctx.stroke();
  ctx.setLineDash([]);

  /* 预览球 + 瞄准虚线 */
  if (!S.gameOver && S.modalN === 0 && S.current) {
    ctx.setLineDash([4, 9]);
    ctx.strokeStyle = 'rgba(255,255,255,.15)';
    ctx.beginPath();
    ctx.moveTo(S.aimX, DROP_Y + 30);
    ctx.lineTo(S.aimX, H - 4);
    ctx.stroke();
    ctx.setLineDash([]);
    drawBall({ x: S.aimX, y: DROP_Y, l: S.current.l, grow: 1 }, S.cool > 0 ? .35 : .9);
  }

  for (const b of S.balls) drawBall(b, 1);

  /* 粒子 */
  for (const p of S.parts) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 7);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* 飘字 */
  for (const f of S.floats) {
    ctx.globalAlpha = Math.max(0, f.life);
    ctx.font = '900 ' + f.size + 'px system-ui';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(0,0,0,.4)';
    ctx.lineWidth = 3;
    ctx.strokeText(f.t, f.x, f.y);
    ctx.fillStyle = f.c;
    ctx.fillText(f.t, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  /* 连击角标 */
  if (S.comboTimer > 0 && S.combo >= 2) {
    ctx.globalAlpha = Math.min(1, S.comboTimer);
    ctx.font = 'italic 900 24px system-ui';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffd32a';
    ctx.strokeStyle = 'rgba(0,0,0,.5)';
    ctx.lineWidth = 4;
    ctx.strokeText('COMBO x' + S.combo, 14, 36);
    ctx.fillText('COMBO x' + S.combo, 14, 36);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  /* 危险红晕 */
  if (dn > 0) {
    const v = ctx.createLinearGradient(0, WARN_Y, 0, WARN_Y + 120);
    v.addColorStop(0, 'rgba(255,71,87,' + (dn * .3) + ')');
    v.addColorStop(1, 'rgba(255,71,87,0)');
    ctx.fillStyle = v;
    ctx.fillRect(0, WARN_Y, W, H - WARN_Y);
  }

  /* HUD */
  $('uiScore').textContent = Math.floor(S.score);
  $('uiBest').textContent = save.best;
  $('uiCoins').textContent = save.coins;
  if (S.next) $('nextFruit').textContent = skinEmoji(S.next.l);
}
