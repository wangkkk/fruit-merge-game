/* ============================================================
 * sfx.js — WebAudio 合成音效
 * 对应原单文件 §6「音效」：不使用外部音频资源，全部即时合成。
 * ============================================================ */
import { save } from '../systems/storage.js';

let audio = null;

/** 获取 / 恢复 AudioContext（首次用户手势后解锁） */
export function ac() {
  if (!audio) {
    const A = window.AudioContext || window.webkitAudioContext;
    if (A) audio = new A();
  }
  if (audio && audio.state === 'suspended') audio.resume();
  return audio;
}

/** 通用合成音：频率滑落 + 指数衰减包络 */
export function sfx(f1, f2, dur, type, vol) {
  if (save.mute) return;
  try {
    const a = ac();
    if (!a) return;
    const tm = a.currentTime;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, tm);
    o.frequency.exponentialRampToValueAtTime(Math.max(f2, 1), tm + dur);
    g.gain.setValueAtTime(vol, tm);
    g.gain.exponentialRampToValueAtTime(0.001, tm + dur);
    o.connect(g);
    g.connect(a.destination);
    o.start(tm);
    o.stop(tm + dur + 0.03);
  } catch (e) { /* 音频不可用时静默降级 */ }
}

export function sClick() { sfx(800, 500, 0.06, 'square', 0.1); }
export function sMerge(l) { sfx(280 + l * 45, 640 + l * 45, 0.13, 'triangle', 0.22); }
export function sBoom() { sfx(180, 40, 0.5, 'sawtooth', 0.35); sfx(90, 30, 0.7, 'sine', 0.3); }
export function sOver() { sfx(400, 70, 1.1, 'sine', 0.28); }
export function sCoin() {
  sfx(880, 880, 0.07, 'sine', 0.18);
  setTimeout(function () { sfx(1320, 1320, 0.1, 'sine', 0.18); }, 80);
}
