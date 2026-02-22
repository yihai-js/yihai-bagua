/**
 * Astronomy module - 天文模块 (对外API)
 *
 * 来源：寿星万年历
 * 提供简化的天文计算 API
 */

export type {
  CelestialPosition,
  MoonPhaseInfo,
  MoonTimes,
  ObserverLocation,
  SunTimes,
} from './astronomy'

export {
  getMoonPhase,
  getMoonPosition,
  getMoonTimes,
  getPlanetPosition,
  getSolarTerms,
  getSunPosition,
  getSunTimes,
  MOON_PHASE_NAMES_CN,
  Planet,
  PLANET_NAMES_CN,
  SOLAR_TERM_NAMES_CN,
} from './astronomy'
