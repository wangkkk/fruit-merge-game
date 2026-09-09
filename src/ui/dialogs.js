/* ============================================================
 * dialogs.js — 帮助 / 结算弹窗的按钮接线与通用关闭
 * 对应原单文件 §9 的 btnRevive/btnRestart 与 §14 的 btnHelp/
 * btnHelpOk/[data-close] 通用关闭按钮。
 * 玩法逻辑本体在 core/game.js，本文件只做按钮 -> 动作的映射。
 * ============================================================ */
import { $, hideModal, showModal } from './dom.js';
import { sClick } from '../audio/sfx.js';
import { reviveRun, restartRun } from '../core/game.js';

/* 结算弹窗：复活（需金币 / 每局一次） */
$('btnRevive').onclick = function () { reviveRun(); };

/* 结算弹窗：重新开始 */
$('btnRestart').onclick = function () { restartRun(); };

/* 帮助弹窗 */
$('btnHelp').onclick = function () { sClick(); showModal('mHelp'); };
$('btnHelpOk').onclick = function () { sClick(); hideModal('mHelp'); };

/* 【修复】统一走带防护的 hideModal，避免计数错乱 */
document.querySelectorAll('[data-close]').forEach(function (b) {
  b.onclick = function () { hideModal(b.closest('.mask').id); };
});
