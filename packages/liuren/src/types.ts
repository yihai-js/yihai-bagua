import type { Gan, GanZhi, Zhi } from '@yhjs/bagua'

/** 贵人阴阳类型 */
export type GuiGodType = 'auto' | 'yang' | 'yin'

/** 十二神将信息 */
export interface GuiGodInfo {
  readonly name: string
  readonly shortName: string
  readonly index: number
}

/** 地支十二宫（单个宫位） */
export interface ZhiPalace {
  readonly zhi: Zhi
  readonly tianpan: Zhi
  readonly guiGod: GuiGodInfo | null
  readonly outerGan: Gan | null
  readonly jianChu: string | null
  readonly twelvePalace: string | null
  readonly taiyin: boolean
}

/** 三传结果 */
export interface LegendResult {
  readonly ganLegend: readonly [Zhi, Zhi, Zhi]
  readonly zhiLegend: readonly [Zhi, Zhi, Zhi]
}

/** 时运命结果 */
export interface DestinyResult {
  readonly time: Zhi
  readonly destiny: Zhi
  readonly live: Zhi
}

/** 排盘元数据 */
export interface LiurenMeta {
  readonly datetime: Date
  readonly fourPillars: {
    readonly year: GanZhi
    readonly month: GanZhi
    readonly day: GanZhi
    readonly hour: GanZhi
  }
  readonly yuejiangZhi: Zhi
  readonly keyGanZhi: GanZhi
  readonly guiGodType: 'yang' | 'yin'
  readonly isFuyin: boolean
}

/** 输入参数 */
export interface LiurenOptions {
  readonly datetime: Date
  readonly keyGanZhi: GanZhi
  readonly shengXiao?: Zhi
  readonly guiGodType?: GuiGodType
}

/** 完整排盘结果 */
export interface LiurenBoard {
  readonly meta: LiurenMeta
  readonly palaces: readonly ZhiPalace[]
  readonly legend: LegendResult
  readonly destiny: DestinyResult
}
