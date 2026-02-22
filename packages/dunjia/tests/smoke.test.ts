import { describe, expect, it } from 'vitest'
import { TIAN_GAN } from '@yhjs/lunar'

describe('cross-package import', () => {
  it('should import TIAN_GAN from @yhjs/lunar', () => {
    expect(TIAN_GAN).toHaveLength(10)
    expect(TIAN_GAN[0]).toBe('甲')
  })
})
