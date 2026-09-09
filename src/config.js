/* ============================================================
 * config.js — 调参常量与游戏数据配置
 * 对应原单文件 §1「基础配置」：全部常量集中在最前，杜绝 TDZ。
 * ============================================================ */

export const SHARE_URL = 'https://localhost/fruit-merge'; // ← 部署后替换
export const SHARE_BONUS = 40;

/** localStorage 存档键名 */
export const KEY = 'fruitMergeSaveV3';

/* 画布 / 物理常量 */
export const W = 420, H = 620, DROP_Y = 64, WARN_Y = 130;
export const G = 1500;            // 重力加速度
export const STEP = 1 / 120;      // 固定仿真步长
export const INV = 1 / STEP;      // 步长倒数（用于速度反算）
export const DRAG = 0.999;        // 水平阻尼

/** 水果半径与单次合成得分 */
export const FRUITS = [
  { r: 16, s: 2 }, { r: 22, s: 4 }, { r: 28, s: 8 }, { r: 34, s: 14 }, { r: 41, s: 22 },
  { r: 49, s: 32 }, { r: 57, s: 44 }, { r: 66, s: 58 }, { r: 76, s: 74 }, { r: 88, s: 100 },
];
export const MAXL = FRUITS.length - 1;

/** 随机掉落水果等级权重（越高级越稀有） */
export const DROP_W = [30, 25, 20, 15, 10];

/** 道具价格 */
export const TOOL_PRICE = { hammer: 80, bomb: 60, rainbow: 120 };
export const TOOL_I18N = { hammer: 'tHammer', bomb: 'tBomb', rainbow: 'tRainbow' };
export const TOOL_DESC = { hammer: 'dHammer', bomb: 'dBomb', rainbow: 'dRainbow' };

/** 彩虹球颜色 */
export const RAINBOW_C = '#e056fd';

/** 每日签到 7 天奖励 */
export const DAILY = [20, 30, 40, 50, 60, 80, 150];

/** 皮肤数据（含表情与配色） */
export const SKINS = [
  { id: 'fruit', nk: 'skFruit', price: 0, rain: '🌈',
    items: ['🍒', '🍓', '🍇', '🍊', '🍎', '🍐', '🍍', '🥝', '🍑', '🍉'],
    colors: ['#ff6b81', '#ff7f50', '#af7ac5', '#ffa502', '#ff4757', '#7bed9f', '#f9ca24', '#a3cb38', '#ffb3ba', '#2ed573'] },
  { id: 'pet', nk: 'skPet', price: 400, rain: '🦄',
    items: ['🐣', '🐰', '🐹', '🦊', '🐻', '🐷', '🐨', '🐵', '🐼', '🦁'],
    colors: ['#ffd6a5', '#bde0fe', '#cdb4db', '#ffafcc', '#b8e0d4', '#fde2e4', '#c3f0ca', '#ffe5b4', '#d0bfff', '#a2d2ff'] },
  { id: 'space', nk: 'skSpace', price: 900, rain: '✨',
    items: ['☄️', '🌍', '🌕', '🛸', '🔥', '💎', '⚡', '🪐', '🌙', '🌞'],
    colors: ['#48dbfb', '#00d2d3', '#feca57', '#54a0ff', '#ff9ff3', '#5f27cd', '#00b894', '#f368e0', '#c8d6e5', '#ffa502'] },
  { id: 'sweet', nk: 'skSweet', price: 2000, rain: '🎁',
    items: ['🍬', '🍭', '🍩', '🍪', '🧁', '🍫', '🍮', '🍰', '🍓', '🎂'],
    colors: ['#fd79a8', '#ff9ff3', '#ffeaa7', '#fab1a0', '#e17055', '#81ecec', '#fdcb6e', '#e84393', '#a29bfe', '#00b894'] },
];
