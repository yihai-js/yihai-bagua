import type { Gan, Zhi } from '@yhjs/bagua'
import type { GuiGodInfo, ZhiPalace } from './types'

/* ------------------------------------------------------------------ */
/*  十二神将数据表                                                       */
/* ------------------------------------------------------------------ */

/** 十二神将全名，按序排列 */
export const GUI_GOD_NAMES = [
  '贵人',
  '螣蛇',
  '朱雀',
  '六合',
  '勾陈',
  '青龙',
  '天空',
  '白虎',
  '太常',
  '玄武',
  '太阴',
  '天后',
] as const

/** 十二神将简称，按序排列 */
export const GUI_GOD_SHORT_NAMES = [
  '贵',
  '螣',
  '朱',
  '六',
  '勾',
  '青',
  '空',
  '白',
  '常',
  '玄',
  '阴',
  '后',
] as const

/**
 * 天乙贵人表：ganIndex -> [阳贵地支索引, 阴贵地支索引]
 */
export const GUIREN_TABLE: readonly (readonly [number, number])[] = [
  [1, 7], // 甲 -> 丑/未
  [0, 8], // 乙 -> 子/申
  [11, 9], // 丙 -> 亥/酉
  [11, 9], // 丁 -> 亥/酉
  [1, 7], // 戊 -> 丑/未
  [0, 8], // 己 -> 子/申
  [1, 7], // 庚 -> 丑/未
  [6, 2], // 辛 -> 午/寅
  [5, 3], // 壬 -> 巳/卯
  [5, 3], // 癸 -> 巳/卯
]

/* ------------------------------------------------------------------ */
/*  resolveGuiGodType                                                  */
/* ------------------------------------------------------------------ */

/**
 * 根据时支判断阴阳贵人类型
 *
 * 时支 index 3~8 (卯~申) -> 'yang'（白天用阳贵）
 * 其余 (酉~寅, index 9~11, 0~2) -> 'yin'（夜间用阴贵）
 */
export function resolveGuiGodType(hourZhi: Zhi): 'yang' | 'yin' {
  return hourZhi.index >= 3 && hourZhi.index <= 8 ? 'yang' : 'yin'
}

/* ------------------------------------------------------------------ */
/*  setGuiGods                                                         */
/* ------------------------------------------------------------------ */

/**
 * 排十二神将
 *
 * 算法：
 * 1. 查 GUIREN_TABLE[keyGan.index] 得 [阳贵, 阴贵] 地支索引
 * 2. 根据 guiGodType 取对应贵人地支索引
 * 3. 计算天盘上的位置：
 *    - offset = (guirenZhiIndex - yuejiangZhi.index + 12) % 12
 *    - startIndex = (hourZhi.index + offset) % 12
 * 4. 排布方向：startIndex in {11,0,1,2,3,4} -> 顺排; startIndex in {5,6,7,8,9,10} -> 逆排
 * 5. 从 startIndex 按方向依次排 12 神将
 */
export function setGuiGods(
  palaces: readonly ZhiPalace[],
  keyGan: Gan,
  yuejiangZhi: Zhi,
  hourZhi: Zhi,
  guiGodType: 'yang' | 'yin',
): ZhiPalace[] {
  const result = palaces.map(p => ({ ...p }))

  // 1. 查贵人表
  const [yangZhi, yinZhi] = GUIREN_TABLE[keyGan.index]
  const guirenZhiIndex = guiGodType === 'yang' ? yangZhi : yinZhi

  // 2. 计算天盘偏移量和起始位置
  const offset = (guirenZhiIndex - yuejiangZhi.index + 12) % 12
  const startIndex = (hourZhi.index + offset) % 12

  // 3. 判断方向：{11,0,1,2,3,4} 顺排，{5,6,7,8,9,10} 逆排
  const forwardSet = new Set([11, 0, 1, 2, 3, 4])
  const direction = forwardSet.has(startIndex) ? 1 : -1

  // 4. 排布 12 神将
  for (let i = 0; i < 12; i++) {
    const palaceIdx = ((startIndex + direction * i) % 12 + 12) % 12
    const god: GuiGodInfo = {
      name: GUI_GOD_NAMES[i],
      shortName: GUI_GOD_SHORT_NAMES[i],
      index: i,
    }
    result[palaceIdx] = { ...result[palaceIdx], guiGod: god }
  }

  return result
}
