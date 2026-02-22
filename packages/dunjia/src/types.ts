/**
 * 五行枚举
 */
export enum Wuxing {
  木 = 0,
  火 = 1,
  土 = 2,
  金 = 3,
  水 = 4,
}

/**
 * 阴阳类型
 */
export type YinYang = '阴' | '阳'

/**
 * 九宫格单宫数据
 */
export interface Palace {
  /** 宫位索引 0-8 */
  index: number
  /** 后天宫位数 (4,9,2,3,5,7,8,1,6) */
  position: number
  /** 宫名（巽离坤震中兑艮坎乾） */
  name: string
  /** 地盘天干 */
  groundGan: string
  /** 地盘天干（寄宫，中宫寄坤时存在） */
  groundExtraGan: string | null
  /** 天盘天干 */
  skyGan: string
  /** 天盘天干（寄宫） */
  skyExtraGan: string | null
  /** 九星 */
  star: StarInfo | null
  /** 八门 */
  door: DoorInfo | null
  /** 八神 */
  god: GodInfo | null
  /** 隐干 */
  outGan: string | null
  /** 隐干（寄宫） */
  outExtraGan: string | null
  /** 外圈神煞层 */
  outerGods: OuterGodLayer[]
}

/**
 * 九星信息
 */
export interface StarInfo {
  /** 全名（天蓬星等） */
  name: string
  /** 简称（蓬等） */
  shortName: string
  /** 五行 */
  wuxing: Wuxing
  /** 原始后天宫位数 */
  originPalace: number
}

/**
 * 八门信息
 */
export interface DoorInfo {
  /** 全名（休门等） */
  name: string
  /** 简称（休等） */
  shortName: string
  /** 五行 */
  wuxing: Wuxing
  /** 原始后天宫位数 */
  originPalace: number
}

/**
 * 八神信息
 */
export interface GodInfo {
  /** 全名（值符等） */
  name: string
  /** 简称（符等） */
  shortName: string
  /** 五行 */
  wuxing: Wuxing
}

/**
 * 盘面元数据
 */
export interface BoardMeta {
  /** 局类型 */
  type: 'hour' | 'day' | 'month' | 'year' | 'minute'
  /** 起局时间 */
  datetime: Date
  /** 阴阳遁 */
  yinyang: YinYang
  /** 局数 1-9 */
  juNumber: number
  /** 旬首名称 */
  xunHead: string
  /** 旬首六仪 */
  xunHeadGan: string
  /** 定局干支 */
  ganZhi: string
  /** 所在节气 */
  solarTerm: string
  /** 移星换斗偏移量 */
  moveStarOffset: number
}

/**
 * TimeDunjia 创建选项
 */
export interface TimeBoardOptions {
  /** 起局时间 */
  datetime: Date
  /** 局类型，默认 'hour' */
  type?: 'hour' | 'day' | 'month' | 'year' | 'minute'
}

/**
 * 外圈神煞插件接口
 */
export interface OuterGodPlugin {
  /** 神煞名称 */
  name: string
  /** 适用范围 */
  scope: ('time' | 'pos')[]
  /** 应用到盘面 */
  apply: (palaces: Palace[], meta: BoardMeta) => OuterGodLayer
}

/**
 * 外圈神煞层数据
 */
export interface OuterGodLayer {
  /** 神煞名称 */
  name: string
  /** 每宫的神煞数据，key 为宫位索引 */
  data: Record<number, OuterGodEntry>
}

/**
 * 外圈神煞单条数据
 */
export interface OuterGodEntry {
  /** 名称 */
  name: string
  /** 附加信息 */
  extra?: Record<string, unknown>
}

/**
 * 序列化后的盘面数据
 */
export interface DunjiaBoardData {
  meta: BoardMeta
  palaces: Palace[]
}
