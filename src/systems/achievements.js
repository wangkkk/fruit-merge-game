/* ============================================================
 * achievements.js — 成就表与达成检测
 * 对应原单文件 §8「成就」。
 * ok() 判定基于共享运行状态 S（分数 / 连击 / 最高等级 / 合成数），
 * 达成即发币 + 播报 toast。
 * ============================================================ */
import { t } from '../i18n/index.js';
import { save, saveAll, addCoins } from './storage.js';
import { toast } from '../ui/dom.js';
import { sCoin } from '../audio/sfx.js';
import { S } from '../core/state.js';

export const ACHS = [
  { id: 'a1', nk: 'a1', dk: 'ad1', r: 10, ok: function () { return S.mergeCount >= 1; } },
  { id: 'a2', nk: 'a2', dk: 'ad2', r: 30, ok: function () { return S.runMaxLevel >= 4; } },
  { id: 'a3', nk: 'a3', dk: 'ad3', r: 60, ok: function () { return S.runMaxLevel >= 6; } },
  { id: 'a4', nk: 'a4', dk: 'ad4', r: 120, ok: function () { return S.runMaxLevel >= 8; } },
  { id: 'a5', nk: 'a5', dk: 'ad5', r: 300, ok: function () { return S.runMaxLevel >= 9; } },
  { id: 'a6', nk: 'a6', dk: 'ad6', r: 30, ok: function () { return S.maxCombo >= 5; } },
  { id: 'a7', nk: 'a7', dk: 'ad7', r: 80, ok: function () { return S.maxCombo >= 10; } },
  { id: 'a8', nk: 'a8', dk: 'ad8', r: 20, ok: function () { return S.score >= 800; } },
  { id: 'a9', nk: 'a9', dk: 'ad9', r: 60, ok: function () { return S.score >= 3000; } },
  { id: 'a10', nk: 'a10', dk: 'ad10', r: 150, ok: function () { return S.score >= 8000; } },
  { id: 'a11', nk: 'a11', dk: 'ad11', r: 60, ok: function () { return S.mergeCount >= 80; } },
];

/** 每次合成/升级后调用：检查全部未解锁成就（幂等，已达成的自动跳过） */
export function checkAch() {
  for (const a of ACHS) {
    if (!save.ach[a.id] && a.ok()) {
      save.ach[a.id] = 1;
      addCoins(a.r);
      saveAll();
      sCoin();
      toast(t('achUnlock', { n: t(a.nk), r: a.r }));
    }
  }
}
