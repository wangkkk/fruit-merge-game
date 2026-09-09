/* ============================================================
 * tools.js — 道具栏：购买 / 选中 / 点击释放 / 库存与提示刷新
 * 对应原单文件 §10「道具」。
 * 顶栏按钮绑定（.tool[data-tool]）与确认弹窗「购买」按钮绑定
 * 在模块顶层执行（ES Module 天然 defer，DOM 已就绪）。
 * ============================================================ */
import { MAXL, FRUITS, TOOL_PRICE, TOOL_I18N, TOOL_DESC } from '../config.js';
import { FR, skinEmoji, skinColor } from '../core/skins.js';
import { burst } from '../core/fx.js';
import { S } from '../core/state.js';
import { save, saveAll } from '../systems/storage.js';
import { t } from '../i18n/index.js';
import { $, toast, showModal, hideModal } from './dom.js';
import { sClick, sCoin, sMerge, sBoom } from '../audio/sfx.js';
import { checkAch } from '../systems/achievements.js';

/** 顶部模式提示条：选中道具时展示用法 */
export function updateTip() {
  const e = $('modeTip');
  if (S.posTool) {
    e.style.display = 'block';
    e.textContent = t(S.posTool === 'hammer' ? 'tipHammer' : 'tipBomb');
  } else {
    e.style.display = 'none';
  }
}

/** 刷新道具库存数字与选中高亮 */
export function renderBag() {
  $('cHammer').textContent = save.bag.hammer;
  $('cBomb').textContent = save.bag.bomb;
  $('cRainbow').textContent = save.bag.rainbow;
  document.querySelectorAll('.tool[data-tool]').forEach(function (b) {
    b.classList.toggle('sel', b.dataset.tool === S.posTool);
  });
}

/** 直接购买一枚道具 */
export function buyTool(tp) {
  if (save.coins < TOOL_PRICE[tp]) { toast(t('noCoins')); return; }
  save.coins -= TOOL_PRICE[tp];
  save.bag[tp]++;
  saveAll();
  renderBag();
  sCoin();
  toast(t('buyOk'));
}

/** 购买确认弹窗回调（点「购买」真正执行） */
let cfCb = null;

export function buyConfirm(tp) {
  /* 【修复】cfCb 现在生效：点「购买」真正执行购买；彩虹球买完自动装备为下一个球 */
  cfCb = function () {
    buyTool(tp);
    if (tp === 'rainbow' && save.bag.rainbow > 0) {
      save.bag.rainbow--;
      S.current = { l: -1 };
      saveAll();
      renderBag();
      toast(t('useRainbow'));
    }
  };
  $('cfTitle').textContent = t('buyTitle', { n: t(TOOL_I18N[tp]), p: TOOL_PRICE[tp] });
  $('cfDesc').textContent = t(TOOL_DESC[tp]);
  showModal('mConfirm');
}

/* 【修复】之前缺失的关键绑定：确认弹窗的「购买」按钮 */
$('cfOk').onclick = function () {
  hideModal('mConfirm');
  var cb = cfCb;
  cfCb = null;
  if (cb) cb();
};

/* 道具栏按钮：彩虹球直接装备；锤/炸弹先选再点，库存不足走购买确认 */
document.querySelectorAll('.tool[data-tool]').forEach(function (btn) {
  btn.onclick = function () {
    const tp = btn.dataset.tool;
    sClick();
    if (tp === 'rainbow') {
      if (save.bag.rainbow > 0) {
        save.bag.rainbow--;
        S.current = { l: -1 };
        saveAll();
        renderBag();
        toast(t('useRainbow'));
      } else {
        buyConfirm(tp);
      }
      return;
    }
    if (S.posTool === tp) {
      S.posTool = null;
      updateTip();
      renderBag();
      return;
    }
    if (save.bag[tp] > 0) {
      S.posTool = tp;
      updateTip();
      renderBag();
    } else {
      buyConfirm(tp);
    }
  };
});

/** 点击场上水果释放当前道具：锤子升级水果；炸弹引爆清除 */
export function applyTool(x, y) {
  let bb = null;
  let bd = 1e18;
  for (const b of S.balls) {
    const dx = b.x - x;
    const dy = b.y - y;
    const d2 = dx * dx + dy * dy;
    const lim = Math.max(FR(b).r, 28) + 12;
    if (d2 < lim * lim && d2 < bd) { bb = b; bd = d2; }
  }
  if (!bb) return;

  if (S.posTool === 'hammer') {
    save.bag.hammer--;
    if (bb.l === MAXL) {
      /* 顶级水果不可再升：给一次性补偿分 */
      S.score += 200;
      S.floats.push({ x: bb.x, y: bb.y, t: '+200', life: 1, size: 18, c: '#ffd32a' });
      burst(bb.x, bb.y, '#ffe66d', 24, 320);
      S.shake = 0.4;
      sBoom();
    } else {
      bb.l++;
      bb.grow = 0;
      S.score += FRUITS[bb.l].s;
      S.runMaxLevel = Math.max(S.runMaxLevel, bb.l);
      S.floats.push({ x: bb.x, y: bb.y, t: skinEmoji(bb.l), life: 1, size: 20, c: '#7bed9f' });
      burst(bb.x, bb.y, skinColor(bb.l), 14, 200);
      sMerge(bb.l);
      checkAch();
    }
  } else {
    /* 炸弹 */
    save.bag.bomb--;
    burst(bb.x, bb.y, skinColor(bb.l), 28, 340);
    S.shake = 0.35;
    sBoom();
  }
  S.balls.splice(S.balls.indexOf(bb), 1);
  S.posTool = null;
  updateTip();
  renderBag();
  saveAll();
}
