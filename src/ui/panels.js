/* ============================================================
 * panels.js — 侧边弹窗面板与顶部按钮：成就 / 每日签到 / 皮肤
 * 商城 / 分享 / 静音 / 语言入口
 * 对应原单文件 §11 每日签到、§12 皮肤商城、§13 分享裂变、
 * §14 顶部按钮（btnAch / btnMute / btnLang）。
 * 语言列表弹窗内容由 i18n/index.js 的 renderLangList() 负责。
 * ============================================================ */
import { SHARE_URL, SHARE_BONUS, DAILY, SKINS, MAXL } from '../config.js';
import { S } from '../core/state.js';
import { save, saveAll } from '../systems/storage.js';
import { t, renderLangList } from '../i18n/index.js';
import { $, toast, showModal, hideModal } from './dom.js';
import { sClick, sCoin } from '../audio/sfx.js';
import { skinOf, skinEmoji } from '../core/skins.js';
import { ACHS } from '../systems/achievements.js';
import { ratingCalc } from '../core/game.js';

/** 本地日期 yyyy-m-d（与 save.daily / shareLast 的 key 格式一致） */
function dstr(d) {
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
}

/* ============ 11. 每日签到 ============ */
let dClaimFn = null;

function renderDaily() {
  const today = dstr(new Date());
  const yest = dstr(new Date(Date.now() - 864e5));
  const ds = save.daily;
  let can, idx;
  if (ds.last === today) { can = false; idx = Math.max(0, ds.streak - 1); }
  else if (ds.last === yest) { can = true; idx = ds.streak; }
  else { can = true; idx = 0; }
  const streak = ds.last === today ? ds.streak : (ds.last === yest ? ds.streak + 1 : 1);
  const reward = DAILY[idx % 7];
  dClaimFn = can ? function () {
    save.daily = { last: today, streak: streak };
    save.coins += reward;
    saveAll();
    sCoin();
    toast(t('signOk', { n: reward }));
    renderDaily();
  } : null;
  $('dailyInfo').textContent = can ?
    (idx > 0 ? t('dReady', { d: idx, k: (idx % 7) + 1, n: reward }) : t('dFirst', { n: reward }))
    : t('dDoneI', { d: ds.streak });
  const g = $('dailyGrid');
  g.innerHTML = '';
  const pos = idx % 7;
  for (let i = 0; i < 7; i++) {
    const c = document.createElement('div');
    let cl = 'dcell';
    if (i < pos || (i === pos && !can)) cl += ' past';
    if (i === pos && can) cl += ' today';
    c.className = cl;
    c.innerHTML = t('dayN', { n: i + 1 }) + '<b>' + DAILY[i] + '</b>';
    g.appendChild(c);
  }
  const cb = $('btnClaim');
  cb.disabled = !can;
  cb.textContent = can ? t('claimBtn', { n: reward }) : t('claimed');
}

$('btnClaim').onclick = function () { if (dClaimFn) dClaimFn(); };
$('btnDaily').onclick = function () { sClick(); showModal('mDaily'); renderDaily(); };

/* ============ 12. 皮肤商城 ============ */
function refreshSkins() {
  const box = $('skinList');
  box.innerHTML = '';
  for (const sk of SKINS) {
    const owned = !!save.skinOwned[sk.id];
    const act = save.skinActive === sk.id;
    const row = document.createElement('div');
    row.className = 'skrow' + (act ? ' act' : '');
    const pv = document.createElement('div');
    pv.className = 'sprev';
    pv.textContent = sk.items[2] + sk.items[4] + sk.items[8];
    const meta = document.createElement('div');
    meta.className = 'skmeta';
    meta.innerHTML = '<div class="sn">' + t(sk.nk) + '</div><div class="sp">' + (owned ? '' : sk.price + '🪙') + '</div>';
    const btn = document.createElement('button');
    btn.className = 'btn mini';
    if (act) { btn.disabled = true; btn.textContent = t('inUse'); }
    else if (owned) btn.textContent = t('equip');
    else btn.textContent = t('buyTxt', { p: sk.price });
    btn.onclick = function () {
      if (act) return;
      if (owned) {
        save.skinActive = sk.id;
        saveAll();
        sClick();
        toast(t('skinUse', { n: t(sk.nk) }));
        refreshSkins();
        return;
      }
      if (save.coins < sk.price) { toast(t('noCoins')); return; }
      save.coins -= sk.price;
      save.skinOwned[sk.id] = 1;
      save.skinActive = sk.id;
      saveAll();
      sCoin();
      toast(t('skinNew', { n: t(sk.nk) }), 2200);
      refreshSkins();
    };
    row.appendChild(pv);
    row.appendChild(meta);
    row.appendChild(btn);
    box.appendChild(row);
  }
}

$('btnSkins').onclick = function () { sClick(); showModal('mSkins'); refreshSkins(); };

/* ============ 13. 分享裂变 ============ */
function shareTxt() {
  return t('shareText', { s: Math.floor(S.score), f: skinEmoji(Math.max(0, S.runMaxLevel)), u: SHARE_URL });
}

/** 用离屏 canvas 绘制分享图，返回 dataURL */
function makeShareCard() {
  const s = document.createElement('canvas');
  s.width = 600; s.height = 800;
  const c = s.getContext('2d');
  const g = c.createLinearGradient(0, 0, 600, 800);
  g.addColorStop(0, '#3a1c71'); g.addColorStop(1, '#12124a');
  c.fillStyle = g; c.fillRect(0, 0, 600, 800);
  c.globalAlpha = 0.1; c.fillStyle = '#fff';
  for (let i = 0; i < 26; i++) {
    c.beginPath();
    c.arc(Math.random() * 600, Math.random() * 800, Math.random() * 42 + 8, 0, 7);
    c.fill();
  }
  c.globalAlpha = 1;
  const sk = skinOf();
  const lv = Math.min(Math.max(S.runMaxLevel, 0), MAXL);
  c.fillStyle = sk.colors[3];
  c.fillRect(0, 0, 600, 14);
  c.fillRect(0, 786, 600, 14);
  c.textAlign = 'center';
  c.font = '900 40px system-ui'; c.fillStyle = '#ffd32a'; c.fillText(t('title'), 300, 100);
  c.font = '150px serif'; c.fillText(skinEmoji(lv), 300, 290);
  if (S.score >= save.best && S.score > 0) {
    c.font = '900 26px system-ui'; c.fillStyle = '#7bed9f'; c.fillText(t('newRec'), 300, 360);
  }
  c.font = '700 24px system-ui'; c.fillStyle = '#aab'; c.fillText(t('score'), 300, 428);
  c.font = '900 92px system-ui'; c.fillStyle = '#fff'; c.fillText(String(Math.floor(S.score)), 300, 516);
  c.font = '600 21px system-ui'; c.fillStyle = '#bcc';
  c.fillText(t('bestIs', { n: save.best }) + '   ' + t('rating') + ': ' + ratingCalc(), 300, 568);
  c.fillStyle = '#99a';
  c.fillText(t('overStats', { m: S.mergeCount, c: S.coinsRun, x: S.maxCombo }), 300, 610);
  c.fillStyle = '#7bed9f'; c.font = '800 30px system-ui'; c.fillText(t('shareFooter'), 300, 706);
  c.fillStyle = '#ffd32a'; c.font = '500 18px system-ui'; c.fillText(SHARE_URL, 300, 746);
  return s.toDataURL('image/png');
}

let cardUrl = null;

function openShare() {
  cardUrl = makeShareCard();
  $('shareImg').src = cardUrl;
  updateShareBonus();
  showModal('mShare');
}

function updateShareBonus() {
  $('shareBonus').textContent = save.shareLast === dstr(new Date()) ? t('shareGot') : t('shareReady');
}

function onShared() {
  const today = dstr(new Date());
  if (save.shareLast !== today) {
    save.shareLast = today;
    save.coins += SHARE_BONUS;
    saveAll();
    sCoin();
    toast(t('shareOk', { n: SHARE_BONUS }), 2200);
  }
  updateShareBonus();
}

/** 复制文本：优先 async Clipboard，失败回退 execCommand */
function copyText(str) {
  const fb = function () {
    const ta = document.createElement('textarea');
    ta.value = str;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast(t('copyOk')); onShared(); }
    catch (e) { toast(t('copyFail')); }
    ta.remove();
  };
  if (navigator.clipboard && navigator.clipboard.writeText)
    navigator.clipboard.writeText(str).then(function () { toast(t('copyOk')); onShared(); }, fb);
  else fb();
}

$('btnShareTop').onclick = function () { sClick(); openShare(); };
$('btnShare2').onclick = function () { sClick(); openShare(); };
$('btnSaveImg').onclick = function () {
  if (!cardUrl) return;
  const a = document.createElement('a');
  a.href = cardUrl;
  a.download = 'fruit-merge-score.png';
  a.click();
  onShared();
};
$('btnCopyLink').onclick = function () { copyText(shareTxt()); };
$('btnNativeShare').onclick = function () {
  if (!navigator.share) { toast(t('noShare')); copyText(shareTxt()); return; }
  navigator.share({ title: t('title'), text: shareTxt(), url: SHARE_URL })
    .then(function () { onShared(); })
    .catch(function () { });
};

/* ============ 14. 顶部按钮（成就 / 静音 / 语言入口） ============ */
$('btnAch').onclick = function () {
  sClick();
  const l = $('achList');
  l.innerHTML = '';
  for (const a of ACHS) {
    const done = !!save.ach[a.id];
    const d = document.createElement('div');
    d.className = 'arow' + (done ? ' done' : '');
    d.innerHTML = '<span class="ai">' + (done ? '✅' : '🔒') + '</span><span><div class="an">' + t(a.nk) +
      '</div><div class="ad">' + t(a.dk) + '</div></span><span class="ar">+' + a.r + '🪙</span>';
    l.appendChild(d);
  }
  showModal('mAch');
};

$('btnMute').onclick = function () {
  save.mute = !save.mute;
  saveAll();
  $('btnMute').textContent = save.mute ? '🔇' : '🔊';
  if (!save.mute) sClick();
};

/* 初始图标由 main.js boot() 统一同步（原 boot 逻辑） */
$('btnLang').onclick = function () { sClick(); renderLangList(); showModal('mLang'); };
