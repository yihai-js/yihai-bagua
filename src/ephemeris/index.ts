/**
 * Ephemeris module - 星历计算层
 *
 * 来源：寿星万年历 eph0.js
 *
 * 包含日月行星位置计算
 * @see eph0.js:955-1300 星历计算相关代码
 */

// VSOP87 地球数据
export {
  EARTH_B,
  EARTH_INDEX,
  EARTH_L,
  EARTH_MULTIPLIER,
  EARTH_R,
} from '../data/vsop87/earth'

// 月球数据
export { MOON_B, MOON_L, MOON_R } from '../data/vsop87/moon'

// 月球位置计算
export {
  calculateMoonAngularRadius,
  calculateMoonApparentCoord,
  calculateMoonApparentLongitude,
  calculateMoonDistance,
  calculateMoonGeocentricCoord,
  calculateMoonLatitude,
  calculateMoonLatitudeAberration,
  calculateMoonLongitude,
  calculateMoonLongitudeAberration,
  calculateMoonSunLongitudeDiff,
  calculateMoonVelocity,
  calculateTimeFromMoonLongitude,
  calculateTimeFromMoonSunDiff,
  calculateTimeFromMoonSunDiffFast,
  MOON_MEAN_ANGULAR_RADIUS,
  MOON_MEAN_DISTANCE,
  MOON_PHASE_NAMES_CN,
  MOON_PHASE_NAMES_EN,
} from './moon'

// 行星位置计算
export {
  AU_TO_KM,
  calculateLightTime,
  calculatePlanetGeocentricCoord,
  calculatePlanetHeliocentricCoord,
  calculatePlanetMagnitude,
  calculatePlanetPhaseAngle,
  isPlanetDirect,
  Planet,
  PLANET_CORRECTIONS,
  PLANET_NAMES_CN,
  PLANET_NAMES_EN,
  PLANET_ORBITAL_PERIODS,
  PLANET_SYNODIC_PERIODS,
  SPEED_OF_LIGHT,
} from './planet'

// 升中天落计算
export type { RiseTransitSetResult } from './rise-transit-set'

export {
  calculateDayLength,
  calculateGST,
  calculateHourAngle,
  calculateMoonRiseTransitSet,
  calculateRefraction,
  calculateSunRiseTransitSet,
  degreesToRadians,
  eclipticToEquatorial,
  equatorialToHorizontal,
  HORIZON_CORRECTIONS,
  HorizonType,
  jdToTimeString,
  radiansToDegrees,
} from './rise-transit-set'
// 太阳位置计算
export {
  calculateEarthHeliocentricCoord,
  calculateEarthLatitude,
  calculateEarthLongitude,
  calculateEarthSunDistance,
  calculateSolarAberration,
  calculateSolarTerms,
  calculateSunApparentLongitude,
  calculateSunGeocentricCoord,
  calculateSunTrueLongitude,
  calculateSunVelocity,
  calculateTimeFromSunLongitude,
  SOLAR_TERM_NAMES_CN,
  SOLAR_TERM_NAMES_EN,
} from './sun'

// 晨昏光计算
export type { TwilightTimes } from './twilight'
export {
  calculateAstronomicalTwilight,
  calculateCivilTwilight,
  calculateNauticalTwilight,
  calculateTwilight,
  TwilightType,
} from './twilight'
