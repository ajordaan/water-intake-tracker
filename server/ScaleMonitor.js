const STATE = {
  EMPTY_SCALE: 'EMPTY_SCALE',
  EMPTY_BOTTLE: 'EMPTY_BOTTLE',
  PARTIALLY_FULL_BOTTLE: 'PARTIALLY_FULL_BOTTLE',
  FULL_BOTTLE: 'FULL_BOTTLE',
}
/**
 * Class representing a Digital Scale Monitor
 */
class ScaleMonitor {
  /**
   * 
   * @param {Object} weights The empty and full weight of the bottle
   * @param {number} weights.empty The empty weight in ml
   * @param {number} weights.full The full weight in ml
   * @param {number} [maxCapacity] The bottle's maximum capacity in ml. (Default is full weight - empty weight)
   * @param {number} [tolerance = 0] The margin of error for the scale
   * @param {number} [scaleOffset] The value required to 'tare' your scale if it does not output '0' when empty. (Default is the first value the scale outputs)
   * @param {boolean} [stabiliseScale = true] Require 2 equal readings before sending events. STRONGLY RECOMMENDED unless your scale is using a smoothed/average reading
   * @param {string} [currentState = EMPTY_SCALE] The current state of the scale
   * @param {boolean} [debug = false] Enable debug to print out some console logs 
   */
  constructor(weights, maxCapacity, tolerance = 0, scaleOffset = null, stabiliseScale = true, currentState = null, debug = false) {
    this.BOTTLE_WEIGHT = weights
    this.MAX_BOTTLE_CAPACITY = maxCapacity ?? (this.BOTTLE_WEIGHT.full - this.BOTTLE_WEIGHT.empty)
    this.TOLERANCE_GRAMS = tolerance
    this.scaleOffset = scaleOffset
    this.stabiliseScale = stabiliseScale
    this.currentState = currentState ?? STATE.EMPTY_SCALE
    this.prevWeight = null
    this.weight = null
    this.debug = debug
  }

  readScale(scaleData) {
    if (scaleData == null) return null;

    if (this.scaleOffset == null) {
      this.scaleOffset = scaleData
      this.log('scale offset: ' + this.scaleOffset)
    }

    this.weight = scaleData - this.scaleOffset

    if (this.stabiliseScale && !this.scaleHasStabilised()) {
      this.log('scale not stable')
      this.prevWeight = this.weight
      return null
    }

    this.log('Weight: ' + this.weight)
    this.log('Current state: ' + this.currentState)
    switch (this.currentState) {
      case STATE.EMPTY_SCALE:

        if (this.approxEqual(this.weight, this.BOTTLE_WEIGHT.full)) {
          this.log('FULL BOTTLE ON SCALE', { waterLevel: 100 })
          this.currentState = STATE.FULL_BOTTLE

          return { event: 'BOTTLE LOWERED', payload: { waterLevel: 100 } }
        }
        else if (this.approxEqual(this.weight, this.BOTTLE_WEIGHT.empty)) {
          this.currentState = STATE.EMPTY_BOTTLE
          this.log('empty bottle on scale')

          return { event: 'BOTTLE LOWERED', payload: { waterLevel: 0 } }
        }
        else if (this.weight > (this.BOTTLE_WEIGHT.empty + this.TOLERANCE_GRAMS)) {
          this.currentState = STATE.PARTIALLY_FULL_BOTTLE
          this.log('bottle on scale')

          const waterLevel = this.calculateWaterLevel()
          this.log('water level: ' + waterLevel)

          return { event: 'BOTTLE LOWERED', payload: { waterLevel: waterLevel } }
        }
        break
      case STATE.EMPTY_BOTTLE:
      case STATE.PARTIALLY_FULL_BOTTLE:
      case STATE.FULL_BOTTLE:
        if (this.approxEqual(this.weight, 0)) {
          this.log("BOTTLE REMOVED FROM SCALE")
          this.currentState = STATE.EMPTY_SCALE

          return { event: 'BOTTLE LIFTED' }
        }
    }

    return null
  }

  calculateWaterLevel() {
    const waterMl = this.weight - this.BOTTLE_WEIGHT.empty
    const levelPercent = waterMl / this.MAX_BOTTLE_CAPACITY * 100

    return levelPercent
  }

  approxEqual(v1, v2) {
    return Math.abs(v1 - v2) <= this.TOLERANCE_GRAMS
  }

  scaleHasStabilised() {
    return this.approxEqual(this.prevWeight, this.weight)
  }

  log(str) {
    if (this.debug) {
      console.log(str)
    }
  }
}

module.exports = ScaleMonitor
