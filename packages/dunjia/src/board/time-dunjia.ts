/**
 * TimeDunjia - 时家奇门遁甲盘面类
 *
 * 封装 buildBoard() 的不可变链式 API（dayjs 风格）：
 * - create() 起新局
 * - from() 从序列化数据恢复
 * - moveStar() 移星换斗（返回新实例）
 * - applyOuterGod() 应用外圈神煞插件
 */

import type { BoardMeta, DunjiaBoardData, OuterGodPlugin, Palace, TimeBoardOptions } from '../types'
import { applyMoveStar, buildBoard } from './common'

export class TimeDunjia {
  readonly meta: BoardMeta
  readonly palaces: readonly Palace[]

  private constructor(meta: BoardMeta, palaces: Palace[]) {
    this.meta = Object.freeze({ ...meta })
    this.palaces = Object.freeze([...palaces])
  }

  /** 起新局 */
  static create(options: TimeBoardOptions): TimeDunjia {
    const { palaces, meta } = buildBoard(options)
    return new TimeDunjia(meta, palaces)
  }

  /** 从序列化数据恢复 */
  static from(data: DunjiaBoardData): TimeDunjia {
    return new TimeDunjia(
      { ...data.meta, datetime: new Date(data.meta.datetime as unknown as string) },
      data.palaces.map(p => ({ ...p })),
    )
  }

  /** 移星换斗（返回新实例） */
  moveStar(offset: number): TimeDunjia {
    const newPalaces = applyMoveStar([...this.palaces] as Palace[], offset, this.meta.moveStarOffset)
    const newMeta = { ...this.meta, moveStarOffset: offset }
    return new TimeDunjia(newMeta, newPalaces)
  }

  /** 应用外圈神煞插件（返回新实例） */
  applyOuterGod(plugin: OuterGodPlugin): TimeDunjia {
    const layer = plugin.apply([...this.palaces] as Palace[], this.meta)
    const newPalaces = (this.palaces as Palace[]).map(p => ({
      ...p,
      outerGods: [...p.outerGods, layer],
    }))
    return new TimeDunjia({ ...this.meta }, newPalaces)
  }

  /** 批量应用外圈神煞 */
  applyOuterGods(plugins: OuterGodPlugin[]): TimeDunjia {
    return plugins.reduce<TimeDunjia>((board, plugin) => board.applyOuterGod(plugin), this)
  }

  /** 单宫查询 */
  palace(index: number): Palace {
    return this.palaces[index]
  }

  /** 序列化 */
  toJSON(): DunjiaBoardData {
    return {
      meta: { ...this.meta },
      palaces: this.palaces.map(p => ({ ...p, outerGods: [...p.outerGods] })),
    }
  }
}
