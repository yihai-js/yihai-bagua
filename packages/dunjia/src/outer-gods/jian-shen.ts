/**
 * 十二建神（建除满平定执破危成收开闭）外圈神煞插件
 *
 * 算法来源: chengming-mobile class/stage/liuren.js
 * 适配: 12 地支宫 → 9 宫模型映射
 */

import type { BoardMeta, OuterGodLayer, OuterGodPlugin, Palace } from '../types'

/** 十二建除名 */
const JIANCHU_NAMES = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'] as const

/** 第四户标记：除、定、破、开为地户 */
const IS_GROUND_DOOR = [false, true, false, false, true, false, true, false, false, false, true, false] as const

/** 12 地支 → 9 宫索引映射 */
const ZHI_TO_PALACE = [7, 6, 6, 3, 0, 0, 1, 2, 2, 5, 8, 8] as const

/** 12 地支名 */
const ZHI_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

/**
 * 十二建神外圈神煞插件
 *
 * 根据关键干支的地支确定起始位置，顺时针排列十二建神到九宫。
 * 由于 12 地支映射到 9 宫，存在多个地支共享同一宫的情况，
 * 通过 extra.allEntries 存储所有映射到该宫的建神名。
 */
export const jianShen: OuterGodPlugin = {
  name: '十二建神',
  scope: ['time'],

  apply(_palaces: Palace[], meta: BoardMeta): OuterGodLayer {
    const data: Record<number, {
      name: string
      extra: { allEntries: string[], isGroundDoor: boolean[] }
    }> = {}

    // 从 meta.ganZhi 提取地支作为起始点
    // ganZhi 是两字符干支，第二个字符是地支
    const zhiChar = meta.ganZhi[1]
    const startZhiIndex = ZHI_NAMES.indexOf(zhiChar as typeof ZHI_NAMES[number])

    if (startZhiIndex < 0) {
      return { name: '十二建神', data: {} }
    }

    // 从起始地支开始，顺序放置 12 个建神
    for (let i = 0; i < 12; i++) {
      const zhiIndex = (startZhiIndex + i) % 12
      const palaceIndex = ZHI_TO_PALACE[zhiIndex]
      const jianName = JIANCHU_NAMES[i]
      const isGD = IS_GROUND_DOOR[i]

      if (!data[palaceIndex]) {
        data[palaceIndex] = {
          name: jianName,
          extra: { allEntries: [jianName], isGroundDoor: [isGD] },
        }
      }
      else {
        data[palaceIndex].extra.allEntries.push(jianName)
        data[palaceIndex].extra.isGroundDoor.push(isGD)
      }
    }

    return { name: '十二建神', data }
  },
}
