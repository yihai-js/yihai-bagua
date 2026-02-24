import type { GanZhi, Zhi } from '@yhjs/bagua'
import type { ZhiPalace } from './types'
import { gan } from '@yhjs/bagua'

/* ------------------------------------------------------------------ */
/*  常量                                                                */
/* ------------------------------------------------------------------ */

/** 十二建名称，按排布顺序 */
export const JIANCHU_NAMES = [
  '建',
  '除',
  '满',
  '平',
  '定',
  '执',
  '破',
  '危',
  '成',
  '收',
  '开',
  '闭',
] as const

/** 十二宫名称，按排布顺序 */
export const TWELVE_PALACE_NAMES = [
  '命',
  '兄弟',
  '夫妻',
  '子女',
  '财帛',
  '疾厄',
  '迁移',
  '仆役',
  '官禄',
  '田宅',
  '福德',
  '父母',
] as const

/* ------------------------------------------------------------------ */
/*  setOuterGan — 外天干排布（六壬式排天干）                              */
/* ------------------------------------------------------------------ */

/**
 * 排外天干（天盘天干）
 *
 * 算法：
 * 1. 求甲在地盘的位置：jiaPos = (keyGanZhi.zhi.index - keyGanZhi.gan.index + 12) % 12
 *    即找到日干支所在旬的甲所对应的地支
 * 2. 计算天盘偏移：offset = (jiaPos - yuejiangZhi.index + 12) % 12
 * 3. 起始位置：startIndex = (hourZhi.index + offset) % 12
 * 4. 从 startIndex 顺时针排布 甲乙丙丁戊己庚辛壬癸甲乙（i % 10）
 *
 * @param palaces      - 12 宫位（需已设置天盘）
 * @param keyGanZhi    - 日干支
 * @param yuejiangZhi  - 月将地支
 * @param hourZhi      - 时支
 * @returns 新的 12 宫位数组（outerGan 已设置）
 */
export function setOuterGan(
  palaces: readonly ZhiPalace[],
  keyGanZhi: GanZhi,
  yuejiangZhi: Zhi,
  hourZhi: Zhi,
): ZhiPalace[] {
  // 1. 甲在地盘的位置（日干支所在旬首甲的对应地支）
  const jiaPos = (keyGanZhi.zhi.index - keyGanZhi.gan.index + 12) % 12

  // 2. 天盘偏移
  const offset = (jiaPos - yuejiangZhi.index + 12) % 12

  // 3. 起始位置
  const startIndex = (hourZhi.index + offset) % 12

  // 4. 顺时针排布十天干（循环）
  const result = palaces.map((p, i) => {
    const ganIndex = ((i - startIndex) % 12 + 12) % 12
    return { ...p, outerGan: gan(ganIndex % 10) }
  })

  return result
}

/* ------------------------------------------------------------------ */
/*  setJianChu — 十二建排布                                             */
/* ------------------------------------------------------------------ */

/**
 * 排十二建：从用神地支起，顺时针排建除满平定执破危成收开闭
 *
 * @param palaces  - 12 宫位
 * @param keyZhi   - 用神地支（起点）
 * @returns 新的 12 宫位数组（jianChu 已设置）
 */
export function setJianChu(
  palaces: readonly ZhiPalace[],
  keyZhi: Zhi,
): ZhiPalace[] {
  const startIdx = keyZhi.index
  return palaces.map((p, i) => {
    const jianChuIdx = ((i - startIdx) % 12 + 12) % 12
    return { ...p, jianChu: JIANCHU_NAMES[jianChuIdx] }
  })
}

/* ------------------------------------------------------------------ */
/*  setTwelvePalaces — 十二宫排布                                       */
/* ------------------------------------------------------------------ */

/**
 * 排十二宫（命/兄弟/夫妻/...）
 *
 * 算法：
 * 1. 从用神地支逆数到卯(3)的步数：zhiOffset = (keyZhi.index - 3 + 12) % 12
 * 2. 命宫起点：startIndex = (yuejiangZhi.index + zhiOffset) % 12
 * 3. 阳(冬至~夏至)顺排，阴(夏至~冬至)逆排
 *
 * @param palaces      - 12 宫位
 * @param yuejiangZhi  - 月将地支
 * @param keyZhi       - 用神地支
 * @param isSolar      - 是否为阳（冬至到夏至）
 * @returns 新的 12 宫位数组（twelvePalace 已设置）
 */
export function setTwelvePalaces(
  palaces: readonly ZhiPalace[],
  yuejiangZhi: Zhi,
  keyZhi: Zhi,
  isSolar: boolean,
): ZhiPalace[] {
  const zhiOffset = (keyZhi.index - 3 + 12) % 12
  const startIdx = (yuejiangZhi.index + zhiOffset) % 12
  const step = isSolar ? 1 : -1

  const result = palaces.map(p => ({ ...p }))
  for (let i = 0; i < 12; i++) {
    const palaceIdx = ((startIdx + step * i) % 12 + 12) % 12
    result[palaceIdx] = { ...result[palaceIdx], twelvePalace: TWELVE_PALACE_NAMES[i] }
  }
  return result
}

/* ------------------------------------------------------------------ */
/*  setTaiyin — 太阴标记                                                */
/* ------------------------------------------------------------------ */

/**
 * 标记太阴宫位：太阴地支所在宫标记为 true
 *
 * @param palaces    - 12 宫位
 * @param taiyinZhi  - 太阴地支（由农历日查表得出）
 * @returns 新的 12 宫位数组（taiyin 已设置）
 */
export function setTaiyin(
  palaces: readonly ZhiPalace[],
  taiyinZhi: Zhi,
): ZhiPalace[] {
  return palaces.map(p => ({
    ...p,
    taiyin: p.zhi.index === taiyinZhi.index,
  }))
}
