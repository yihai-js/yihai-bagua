/**
 * PosDunjia - 山向奇门遁甲盘面类
 *
 * 基于罗盘方位（角度）和时间，结合二十四山向数据排盘。
 * 支持正盘、归一、合十、反转四种变盘方式。
 *
 * 封装不可变链式 API（dayjs 风格）：
 * - create() 起新局
 * - moveStar() 移星换斗（返回新实例）
 * - applyOuterGod() 应用外圈神煞插件
 */

import type { MountainInfo, NumData } from '../mountain'
import type { BoardMeta, DunjiaBoardData, OuterGodPlugin, Palace } from '../types'
import {
  getMountainDetailFromAngle,
  getMountainIndexFromAngle,
  getMountainInfo,
  getNumData,
  getOppositeAngle,
  getOppositeMountain,
} from '../mountain'
import { applyMoveStar, buildBoardFromMeta, resolveMeta } from './common'

/* ------------------------------------------------------------------ */
/*  类型定义                                                            */
/* ------------------------------------------------------------------ */

/** 变盘类型 */
export type PosDunjiaTrans = '正盘' | '归一' | '合十' | '反转'

/** 山向奇门局类型 */
export type PosDunjiaType = 'year' | 'month' | 'day' | 'dragon'

/** PosDunjia 创建选项 */
export interface PosBoardOptions {
  /** 起局时间 */
  datetime: Date
  /** 罗盘角度（度） */
  angle: number
  /** 局类型，默认 'year' */
  posType?: PosDunjiaType
  /** 变盘方式，默认 '正盘' */
  trans?: PosDunjiaTrans
}

/* ------------------------------------------------------------------ */
/*  PosDunjia 类                                                        */
/* ------------------------------------------------------------------ */

export class PosDunjia {
  readonly meta: BoardMeta
  readonly palaces: readonly Palace[]
  readonly mountain: MountainInfo
  readonly direction: MountainInfo
  readonly trans: PosDunjiaTrans
  readonly numData: NumData

  private constructor(
    meta: BoardMeta,
    palaces: Palace[],
    mountain: MountainInfo,
    direction: MountainInfo,
    trans: PosDunjiaTrans,
    numData: NumData,
  ) {
    this.meta = Object.freeze({ ...meta })
    this.palaces = Object.freeze([...palaces])
    this.mountain = Object.freeze({ ...mountain })
    this.direction = Object.freeze({ ...direction })
    this.trans = trans
    this.numData = Object.freeze({ ...numData })
  }

  /** 起新局 */
  static create(options: PosBoardOptions): PosDunjia {
    // 1. 角度 -> 向（direction）和山（mountain = 对面）
    const dirIndex = getMountainIndexFromAngle(options.angle)
    const direction = getMountainInfo(dirIndex)
    const mtnIndex = getOppositeMountain(dirIndex)
    const mountain = getMountainInfo(mtnIndex)

    // 2. 从山的人盘获取三元局数
    const oppositeAngle = getOppositeAngle(options.angle)
    const humanMtn = getMountainDetailFromAngle(oppositeAngle, 'human')
    const numData = getNumData(oppositeAngle, humanMtn)

    // 3. 根据变盘方式确定阴阳和局数
    const trans = options.trans ?? '正盘'
    let isSolar = numData.isSolar
    let juNumber = numData.num

    if (trans !== '正盘') {
      isSolar = !isSolar // 归一、合十、反转均翻转阴阳
    }
    if (trans === '归一') {
      juNumber = 9 - juNumber <= 0 ? 9 : 9 - juNumber
    }
    else if (trans === '合十') {
      juNumber = 10 - juNumber
    }
    // 反转：仅翻转阴阳，局数不变

    // 4. 从时间解析基础元数据（四柱干支、旬首等）
    const boardType = options.posType === 'dragon' ? 'year' : (options.posType ?? 'year')
    const baseMeta = resolveMeta({ datetime: options.datetime, type: boardType })

    // 5. 用山向推导的阴阳和局数覆盖
    const posMeta: BoardMeta = {
      ...baseMeta,
      yinyang: isSolar ? '阳' : '阴',
      juNumber,
    }

    // 6. 用修正后的元数据运行排盘管道
    const { palaces, meta } = buildBoardFromMeta(posMeta)

    return new PosDunjia(meta, palaces, mountain, direction, trans, numData)
  }

  /** 从序列化数据恢复 */
  static from(
    data: DunjiaBoardData & {
      mountain: MountainInfo
      direction: MountainInfo
      trans: PosDunjiaTrans
      numData: NumData
    },
  ): PosDunjia {
    return new PosDunjia(
      { ...data.meta, datetime: new Date(data.meta.datetime) },
      data.palaces.map(p => ({ ...p })),
      data.mountain,
      data.direction,
      data.trans,
      data.numData,
    )
  }

  /** 移星换斗（返回新实例） */
  moveStar(offset: number): PosDunjia {
    const newPalaces = applyMoveStar([...this.palaces] as Palace[], offset, this.meta.moveStarOffset)
    const newMeta = { ...this.meta, moveStarOffset: offset }
    return new PosDunjia(newMeta, newPalaces, { ...this.mountain }, { ...this.direction }, this.trans, { ...this.numData })
  }

  /** 应用外圈神煞插件（返回新实例） */
  applyOuterGod(plugin: OuterGodPlugin): PosDunjia {
    const layer = plugin.apply([...this.palaces] as Palace[], this.meta)
    const newPalaces = (this.palaces as Palace[]).map(p => ({
      ...p,
      outerGods: [...p.outerGods, layer],
    }))
    return new PosDunjia(
      { ...this.meta },
      newPalaces,
      { ...this.mountain },
      { ...this.direction },
      this.trans,
      { ...this.numData },
    )
  }

  /** 批量应用外圈神煞 */
  applyOuterGods(plugins: OuterGodPlugin[]): PosDunjia {
    return plugins.reduce<PosDunjia>((board, plugin) => board.applyOuterGod(plugin), this)
  }

  /** 单宫查询 */
  palace(index: number): Palace {
    return this.palaces[index]
  }

  /** 序列化 */
  toJSON(): DunjiaBoardData & {
    mountain: MountainInfo
    direction: MountainInfo
    trans: PosDunjiaTrans
    numData: NumData
  } {
    return {
      meta: { ...this.meta },
      palaces: this.palaces.map(p => ({ ...p, outerGods: [...p.outerGods] })),
      mountain: { ...this.mountain },
      direction: { ...this.direction },
      trans: this.trans,
      numData: { ...this.numData },
    }
  }
}
