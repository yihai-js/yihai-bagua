/**
 * 排盘 fixture 数据 — 已知日期的预期属性
 *
 * 每个 fixture 包含:
 * - datetime: 起局时间
 * - description: 场景描述
 * - expectedMeta: 预期的元数据属性（部分字段）
 */

export interface FixtureCase {
  /** 场景描述 */
  description: string
  /** 起局时间 */
  datetime: Date
  /** 预期元数据（部分校验） */
  expectedMeta: {
    type: string
    yinyang: '阴' | '阳'
    juNumberRange: [number, number]
  }
}

/**
 * 测试日期 fixture 集合
 */
export const FIXTURE_CASES: FixtureCase[] = [
  {
    description: '常规排盘 - 2026年2月22日 14:00',
    datetime: new Date(2026, 1, 22, 14, 0, 0),
    expectedMeta: {
      type: 'hour',
      yinyang: '阳', // 2月在冬至后夏至前，阳遁
      juNumberRange: [1, 9],
    },
  },
  {
    description: '夏至附近 - 2026年6月21日 12:00（阳→阴转换边界）',
    datetime: new Date(2026, 5, 21, 12, 0, 0),
    expectedMeta: {
      type: 'hour',
      yinyang: '阴', // 夏至当天或之后，阴遁
      juNumberRange: [1, 9],
    },
  },
  {
    description: '子时边界 - 2026年1月1日 00:00',
    datetime: new Date(2026, 0, 1, 0, 0, 0),
    expectedMeta: {
      type: 'hour',
      yinyang: '阳', // 1月在冬至后，阳遁
      juNumberRange: [1, 9],
    },
  },
]
