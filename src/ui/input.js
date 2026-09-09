/* ============================================================
 * input.js — 指针 + 键盘输入（多指安全版）
 * 对应原单文件 §17「输入」。
 * 只认第一根指针（activePtr），其余触点忽略；右键与长按菜单
 * 屏蔽；手势被打断（pointercancel）复位不误投；空格防连发。
 * ============================================================ */
import { W, H } from '../config.js';
import { $ } from './dom.js';
import { S } from '../core/state.js';
import { ac } from '../audio/sfx.js';
import { tryDrop } from '../core/game.js';
import { applyTool } from './tools.js';

const cv = $('cv');

let activePtr = null;   // 当前追踪的指针 id
let press = false;      // 是否处于按下状态

/** 事件坐标 -> 画布逻辑坐标 */
function toXY(e) {
  const r = cv.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) / r.width * W,
    y: (e.clientY - r.top) / r.height * H,
  };
}

cv.addEventListener('pointerdown', function (e) {
  if (e.button !== undefined && e.button !== 0) return; // 忽略右键
  if (activePtr !== null) return;                       // 多指只认第一根
  activePtr = e.pointerId;
  ac();
  press = true;
  S.aimX = toXY(e).x;
});

cv.addEventListener('pointermove', function (e) {
  if (activePtr !== null && e.pointerId !== activePtr) return;
  S.aimX = toXY(e).x;
});

function releasePtr(e) {
  if (activePtr !== null && e.pointerId !== activePtr) return;
  activePtr = null;
  if (!press) return;
  press = false;
  const p = toXY(e);
  S.aimX = p.x;
  if (S.modalN > 0 || S.gameOver) return;
  if (S.posTool) applyTool(p.x, p.y);
  else tryDrop();
}

window.addEventListener('pointerup', releasePtr);
window.addEventListener('pointercancel', function (e) {  // 手势被打断 -> 复位，不误投
  if (e.pointerId === activePtr || press) { activePtr = null; press = false; }
});

cv.addEventListener('contextmenu', function (e) { e.preventDefault(); }); // 屏蔽长按菜单

window.addEventListener('keydown', function (e) {
  if (e.code === 'Space' && !e.repeat) {
    e.preventDefault();
    ac();
    tryDrop();
  }
});
