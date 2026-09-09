/* ============================================================
 * storage.js — localStorage 存档与金币钱包
 * 对应原单文件 §3「存档」。
 * save 为对象引用导出：各模块可读可改其属性，但整体赋值只
 * 在本模块初始化阶段完成一次，之后统一经 saveAll() 持久化。
 * ============================================================ */
import { KEY } from '../config.js';
import { S } from '../core/state.js';

let save;
try {
  save = JSON.parse(localStorage.getItem(KEY) || 'null') || {};
} catch (e) {
  save = {};
}

/* 字段兜底，保证老版本存档或空存档可安全使用 */
save.best = save.best || 0;
save.coins = (typeof save.coins === 'number') ? save.coins : 60;
save.ach = save.ach || {};
save.bag = save.bag || { hammer: 0, bomb: 0, rainbow: 0 };
save.daily = save.daily || { last: '', streak: 0 };
save.shareLast = save.shareLast || '';
save.mute = !!save.mute;
save.seen = !!save.seen;
save.lang = save.lang || '';
save.skinOwned = save.skinOwned || { fruit: 1 };
save.skinActive = save.skinActive || 'fruit';

export { save };

/** 将当前 save 对象整体写回 localStorage */
export function saveAll() {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { /* 隐私模式等写入失败时静默 */ }
}

/** 增加金币：计入钱包余额，同时累计本局金币（用于结算文案） */
export function addCoins(n) {
  save.coins += n;
  S.coinsRun += n;
}
