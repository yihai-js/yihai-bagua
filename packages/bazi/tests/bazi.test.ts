import { describe, expect, it } from 'vitest'
import { Bazi } from '../src/bazi'

describe('Bazi', () => {
  describe('Bazi.create', () => {
    it('should create bazi for 1990-10-08 08:00 male', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })

      // 四柱应该有值
      expect(bazi.year.ganZhi.name).toBeTruthy()
      expect(bazi.month.ganZhi.name).toBeTruthy()
      expect(bazi.day.ganZhi.name).toBeTruthy()
      expect(bazi.hour.ganZhi.name).toBeTruthy()

      // 日主
      expect(bazi.dayMaster.name).toBeTruthy()

      // 十神
      expect(bazi.year.tenGod).not.toBeNull()
      expect(bazi.month.tenGod).not.toBeNull()
      expect(bazi.day.tenGod).toBeNull() // 日柱自身
      expect(bazi.hour.tenGod).not.toBeNull()

      // 藏干
      expect(bazi.year.hiddenGods.length).toBeGreaterThan(0)

      // 元数据
      expect(bazi.meta.gender).toBe('男')
      expect(bazi.meta.dayMaster).toBeDefined()
      expect(bazi.meta.yinYangDun).toBe('阳') // 庚=阳
    })

    it('should create bazi for 1985-03-15 14:00 female', () => {
      const bazi = Bazi.create({
        datetime: new Date(1985, 2, 15, 14, 0, 0),
        gender: '女',
      })

      expect(bazi.year.ganZhi.name).toBeTruthy()
      expect(bazi.dayMaster.name).toBeTruthy()
      expect(bazi.meta.yinYangDun).toBe('阴') // 乙=阴
    })
  })

  describe('dayun', () => {
    it('should have 9 steps', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      expect(bazi.dayun).toHaveLength(9)
    })

    it('dayun startAge should increase by 10', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      for (let i = 1; i < bazi.dayun.length; i++) {
        expect(bazi.dayun[i].startAge - bazi.dayun[i - 1].startAge).toBe(10)
      }
    })

    it('dayun ganZhi should be consecutive for forward (yang-male)', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      for (let i = 1; i < bazi.dayun.length; i++) {
        const prev = bazi.dayun[i - 1].ganZhi.index as number
        const cur = bazi.dayun[i].ganZhi.index as number
        expect((cur - prev + 60) % 60).toBe(1)
      }
    })
  })

  describe('liunian', () => {
    it('should return 10 liunian entries per dayun step', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      const liunian = bazi.getLiunian(0)
      expect(liunian).toHaveLength(10)
    })

    it('should have continuous ganZhi', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      const liunian = bazi.getLiunian(0)
      for (let i = 1; i < liunian.length; i++) {
        const prev = liunian[i - 1].ganZhi.index as number
        const cur = liunian[i].ganZhi.index as number
        expect((cur - prev + 60) % 60).toBe(1)
      }
    })

    it('should throw for invalid index', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      expect(() => bazi.getLiunian(-1)).toThrow()
      expect(() => bazi.getLiunian(9)).toThrow()
    })
  })

  describe('liuyue', () => {
    it('should return 12 months', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      const liunian = bazi.getLiunian(0)
      const liuyue = bazi.getLiuyue(liunian[0].ganZhi.gan)
      expect(liuyue).toHaveLength(12)
      expect(liuyue[0].ganZhi.zhi.name).toBe('寅')
      expect(liuyue[0].monthIndex).toBe(1)
    })
  })

  describe('shensha', () => {
    it('should compute shensha', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      const shensha = bazi.getShensha()
      expect(shensha.horses).toHaveLength(4)
      expect(shensha.kongWang).toHaveLength(4)
      expect(shensha.guiren).toHaveLength(4)
      expect(shensha.seasonPower).toHaveLength(5)
    })
  })

  describe('toJSON', () => {
    it('should serialize to BaziBoardData', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      const data = bazi.toJSON()
      expect(data.meta.gender).toBe('男')
      expect(data.meta.dayMaster).toBeTruthy()
      expect(data.pillars.year.ganZhi.name).toBeTruthy()
      expect(data.dayun).toHaveLength(9)
    })
  })

  describe('pre-dayun liunian', () => {
    it('should return liunian from birth to startAge', () => {
      const bazi = Bazi.create({
        datetime: new Date(1990, 9, 8, 8, 0, 0),
        gender: '男',
      })
      const preLiunian = bazi.getPreDayunLiunian()
      expect(preLiunian.length).toBe(bazi.meta.startAge)
      if (preLiunian.length > 0) {
        expect(preLiunian[0].age).toBe(0)
        expect(preLiunian[0].year).toBe(1990)
      }
    })
  })
})
