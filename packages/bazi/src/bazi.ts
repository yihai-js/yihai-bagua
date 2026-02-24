import type { Gan } from '@yhjs/bagua'
import { computeFourPillars, dateToJd } from './pillar'
import type { BuiltPillars } from './analysis'
import { buildAllPillars } from './analysis'
import { computeDayun } from './dayun'
import { computeLiunian, computeLiuyue, computePreDayunLiunian } from './liunian'
import { computeShensha } from './shensha'
import type {
  BaziMeta,
  BaziOptions,
  BaziBoardData,
  DayunEntry,
  LiunianEntry,
  LiuyueEntry,
  Pillar,
  ShenshaResult,
} from './types'

export class Bazi {
  private readonly _meta: BaziMeta
  private readonly _pillars: BuiltPillars
  private readonly _dayun: readonly DayunEntry[]

  private constructor(
    meta: BaziMeta,
    pillars: BuiltPillars,
    dayun: readonly DayunEntry[],
  ) {
    this._meta = meta
    this._pillars = pillars
    this._dayun = dayun
  }

  static create(options: BaziOptions): Bazi {
    const { datetime, gender } = options
    const jd = dateToJd(datetime)
    const birthYear = datetime.getFullYear()

    const fourPillars = computeFourPillars(jd)
    const pillars = buildAllPillars(fourPillars)
    const dayMaster = fourPillars.day.gan
    const dayun = computeDayun(
      fourPillars.month,
      dayMaster,
      fourPillars.year.gan,
      gender,
      jd,
      birthYear,
    )

    const meta: BaziMeta = {
      datetime,
      gender,
      dayMaster,
      yinYangDun: fourPillars.year.gan.yinyang === '阳' ? '阳' : '阴',
      startAge: dayun[0].startAge,
      kongWang: fourPillars.day.kongWang,
    }

    return new Bazi(meta, pillars, dayun)
  }

  get year(): Pillar { return this._pillars.year }
  get month(): Pillar { return this._pillars.month }
  get day(): Pillar { return this._pillars.day }
  get hour(): Pillar { return this._pillars.hour }
  get dayMaster(): Gan { return this._meta.dayMaster }
  get meta(): BaziMeta { return this._meta }
  get dayun(): readonly DayunEntry[] { return this._dayun }

  getLiunian(dayunIndex: number): readonly LiunianEntry[] {
    if (dayunIndex < 0 || dayunIndex >= this._dayun.length) {
      throw new RangeError(`大运索引超出范围: ${dayunIndex}`)
    }
    const nextStartAge = dayunIndex + 1 < this._dayun.length
      ? this._dayun[dayunIndex + 1].startAge
      : this._dayun[dayunIndex].startAge + 10

    return computeLiunian(
      this._dayun[dayunIndex],
      this._pillars.year.ganZhi,
      this._meta.dayMaster,
      this._meta.datetime.getFullYear(),
      nextStartAge,
    )
  }

  getPreDayunLiunian(): readonly LiunianEntry[] {
    return computePreDayunLiunian(
      this._pillars.year.ganZhi,
      this._meta.dayMaster,
      this._meta.datetime.getFullYear(),
      this._meta.startAge,
    )
  }

  getLiuyue(yearGan: Gan): readonly LiuyueEntry[] {
    return computeLiuyue(yearGan, this._meta.dayMaster)
  }

  getShensha(): ShenshaResult {
    return computeShensha(
      this._pillars.year.ganZhi,
      this._pillars.month.ganZhi,
      this._pillars.day.ganZhi,
      this._pillars.hour.ganZhi,
    )
  }

  toJSON(): BaziBoardData {
    return {
      meta: {
        datetime: this._meta.datetime,
        gender: this._meta.gender,
        dayMaster: this._meta.dayMaster.name,
        yinYangDun: this._meta.yinYangDun,
        startAge: this._meta.startAge,
        kongWang: [this._meta.kongWang[0].name, this._meta.kongWang[1].name],
      },
      pillars: {
        year: this._pillars.year,
        month: this._pillars.month,
        day: this._pillars.day,
        hour: this._pillars.hour,
      },
      dayun: this._dayun,
    }
  }
}
