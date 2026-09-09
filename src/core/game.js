/* ============================================================
 * game.js — 单局生命周期：重置 / 投放 / 结算 / 复活 / 重开
 * 对应原单文件 §9「游戏流程」。
 * 注：越线出局判定在 physics.js（simT 驱动），本模块只负责
 * 状态翻转与 UI 结算展示。
 * ============================================================ */
import { W, DROP_Y, WARN_Y, DROP_W } from '../config.js';
import { FR } from './skins.js';
import { S } from './state.js';
import { save, saveAll } from '../systems/storage.js';
import { t } from '../i18n/index.js';
import { $, toast, showModal, hideModal } from '../ui/dom.js';
import { sfx, sClick, sOver } from '../audio/sfx.js';
import { updateTip } from '../ui/tools.js';

/** 复活在本局内只能使用一次 */
let reviveUsed = false;

/** 按掉落权重随机下一个水果等级 */
function randL() {
  let tot = 0;
  for (const w of DROP_W) tot += w;
  let r = Math.random() * tot;
  for (let i = 0; i < DROP_W.length; i++) {
    r -= DROP_W[i];
    if (r < 0) return i;
  }
  return 0;
}

/** 按本局分数评级（S+ / S / A / B / C / D） */
export function ratingCalc() {
  return S.score >= 8000 ? 'S+' : S.score >= 5000 ? 'S' : S.score >= 3000 ? 'A' : S.score >= 1500 ? 'B' : S.score >= 600 ? 'C' : 'D';
}

/** 开始 / 重置一局：清空运行状态并生成当前与下一颗水果 */
export function resetRun() {
  S.balls = [];
  S.score = 0;
  S.coinsRun = 0;
  S.mergeCount = 0;
  S.combo = 0;
  S.comboTimer = 0;
  S.maxCombo = 0;
  S.runMaxLevel = 0;
  S.dangerT = 0;
  S.gameOver = false;
  reviveUsed = false;
  S.posTool = null;
  updateTip();
  S.current = { l: randL() };
  S.next = { l: randL() };
}

/** 在瞄准位置投放当前水果（冷却 / 弹窗 / 出局时不投） */
export function tryDrop() {
  if (S.gameOver || S.cool > 0 || S.modalN > 0 || !S.current) return;
  S.balls.push({
    x: Math.max(FR(S.current).r, Math.min(W - FR(S.current).r, S.aimX)),
    y: DROP_Y,
    vx: 0, vy: 80,
    l: S.current.l,
    grow: 0,
    born: S.simT,
    px: 0, py: 0,
  });
  sfx(500, 300, 0.08, 'sine', 0.12);
  S.current = S.next;
  S.next = { l: randL() };
  S.cool = 0.55;
}

/** 游戏结束：更新最高分并填充结算弹窗 */
export function doGameOver() {
  S.gameOver = true;
  S.dangerT = 1.2;
  sOver();
  const rec = S.score > save.best;
  if (rec) save.best = Math.floor(S.score);
  saveAll();
  $('overScore').textContent = Math.floor(S.score);
  $('overStats').textContent = t('overStats', { m: S.mergeCount, c: S.coinsRun, x: S.maxCombo });
  $('overRank').innerHTML =
    (rec ? '<span class="rec">' + t('newRec') + '</span><br>' : t('bestIs', { n: save.best }) + '<br>') +
    t('rating') + ' <b style="font-size:20px">' + ratingCalc() + '</b>';
  $('btnRevive').disabled = reviveUsed || save.coins < 100;
  showModal('mOver');
}

/** 花 100 金币复活：清空警戒线上方区域（一次性） */
export function reviveRun() {
  if (reviveUsed || save.coins < 100 || !S.gameOver) return;
  sClick();
  save.coins -= 100;
  reviveUsed = true;
  const cut = WARN_Y + 140;
  S.balls = S.balls.filter(function (b) { return (b.y - FR(b).r) > cut; });
  for (const b of S.balls) b.born = S.simT;
  S.dangerT = 0;
  S.combo = 0;
  S.comboTimer = 0;
  S.gameOver = false;
  saveAll();
  hideModal('mOver');
  toast(t('reviveOk'));
}

/** 再来一局 */
export function restartRun() {
  sClick();
  hideModal('mOver');
  resetRun();
}
