import type { GanZhi, Zhi } from '@yhjs/bagua'
import type { ZhiPalace } from './types'
import { gan } from '@yhjs/bagua'

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
