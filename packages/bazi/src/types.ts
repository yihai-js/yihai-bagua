import type { Gan, GanZhi, TenGod, Zhi } from '@yhjs/bagua'

/** 性别 */
export type Gender = '男' | '女'

/**
 * 四柱（年/月/日/时柱）
 */
export interface Pillar {
  /** 干支 */
  readonly ganZhi: GanZhi
  /** 天干十神（日柱自身为 null） */
  readonly tenGod: TenGod | null
  /** 地支藏干展开 */
  readonly hiddenGods: readonly HiddenGodEntry[]
}

/**
 * 藏干十神条目
 */
export interface HiddenGodEntry {
  /** 藏干 */
  readonly gan: Gan
  /** 藏干十神 */
  readonly tenGod: TenGod
  /** 权重 */
  readonly weight: 'main' | 'middle' | 'minor'
}

/**
 * 大运条目
 */
export interface DayunEntry {
  /** 干支 */
  readonly ganZhi: GanZhi
  /** 起运年龄 */
  readonly startAge: number
  /** 起运公历年份 */
  readonly startYear: number
  /** 天干十神（相对日主） */
  readonly tenGod: TenGod
}

/**
 * 流年条目
 */
export interface LiunianEntry {
  /** 干支 */
  readonly ganZhi: GanZhi
  /** 公历年份 */
  readonly year: number
  /** 虚岁年龄 */
  readonly age: number
  /** 天干十神（相对日主） */
  readonly tenGod: TenGod
}

/**
 * 流月条目
 */
export interface LiuyueEntry {
  /** 干支 */
  readonly ganZhi: GanZhi
  /** 月份（1=寅月, 2=卯月, ... 12=丑月） */
  readonly monthIndex: number
  /** 天干十神（相对日主） */
  readonly tenGod: TenGod
}

/**
 * 神煞结果
 */
export interface ShenshaResult {
  /** 四柱驿马（地支） */
  readonly horses: readonly (Zhi | null)[]
  /** 四柱空亡（各柱旬空两地支） */
  readonly kongWang: readonly (readonly [Zhi, Zhi])[]
  /** 四柱天乙贵人（各柱的阳贵/阴贵地支） */
  readonly guiren: readonly (readonly [Zhi, Zhi])[]
  /** 旺相休囚死（月令五行决定的五行状态） */
  readonly seasonPower: readonly string[]
}

/**
 * 八字元数据
 */
export interface BaziMeta {
  /** 起局时间 */
  readonly datetime: Date
  /** 性别 */
  readonly gender: Gender
  /** 日主天干 */
  readonly dayMaster: Gan
  /** 阴阳遁（年干阴阳） */
  readonly yinYangDun: '阳' | '阴'
  /** 起运年龄 */
  readonly startAge: number
  /** 日柱旬空 */
  readonly kongWang: readonly [Zhi, Zhi]
}

/**
 * Bazi.create() 创建选项
 */
export interface BaziOptions {
  /** 出生日期时间 */
  datetime: Date
  /** 性别 */
  gender: Gender
}

/**
 * 序列化后的八字数据
 */
export interface BaziBoardData {
  meta: Omit<BaziMeta, 'datetime' | 'dayMaster' | 'kongWang'> & {
    datetime: Date | string
    dayMaster: string
    kongWang: readonly [string, string]
  }
  pillars: {
    year: Pillar
    month: Pillar
    day: Pillar
    hour: Pillar
  }
  dayun: readonly DayunEntry[]
}
