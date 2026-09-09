/* ============================================================
 * state.js — 整局运行期的唯一可变状态对象
 * 对应原单文件 §4「状态」散落的顶层 let 变量。
 * physics / game / render / loop / tools / input / panels 等多
 * 个模块共享本对象，统一经 S.xxx 读写，避免模块各自持有副本
 * 导致状态不同步。
 * ============================================================ */
import { W } from '../config.js';

export const S = {
  balls: [],        // 场上水果实体
  score: 0,         // 本局分数
  coinsRun: 0,      // 本局获得金币（结算展示用）
  mergeCount: 0,    // 本局合成次数
  combo: 0,         // 当前连击数
  comboTimer: 0,    // 连击剩余窗口（2 秒内续连）
  maxCombo: 0,      // 本局最大连击
  runMaxLevel: 0,   // 本局合出过的最高水果等级
  current: null,    // 当前待投放水果 {l}
  next: null,       // 下一个预览水果 {l}
  aimX: W / 2,      // 瞄准线横坐标
  cool: 0,          // 投放冷却计时
  dangerT: 0,       // 越过警戒线持续时长
  gameOver: false,  // 是否已出局
  posTool: null,    // 当前选中的实体道具（hammer / bomb），null 表示未选中
  parts: [],        // 粒子特效
  floats: [],       // 飘字特效
  shake: 0,         // 震屏强度
  simT: 0,          // 固定步长仿真时钟
  modalN: 0,        // 已打开的弹窗计数（modal 打开时禁止投放/出局等）
};
