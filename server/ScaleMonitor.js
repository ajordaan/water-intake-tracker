const STATE = {
  EMPTY_SCALE: 1,
  EMPTY_BOTTLE: 2,
  FULL_BOTTLE: 3,
  PARTIALLY_FULL_BOTTLE: 4
}

class ScaleMonitor {
  constructor(weights, maxCapacity, tolerance = 0, scaleOffset = null, currentState = null, debug = false) {
    this.BOTTLE_WEIGHT = weights
    this.MAX_BOTTLE_CAPACITY = maxCapacity
    this.TOLERANCE_GRAMS = tolerance
    this.scaleOffset = scaleOffset
    this.currentState = currentState ?? STATE.EMPTY_SCALE
    this.prevWeight = null
    this.weight = null
    this.debug = debug
  }

  readScale(scaleData) {
    if (!scaleData) return null;

    if (this.scaleOffset == null) {
      this.scaleOffset = scaleData
      this.log('scale offset: ' + this.scaleOffset)
    }

     this.weight = scaleData - this.scaleOffset

    if (!this.scaleHasStabilised()) {
      this.log('scale not stable')
      this.prevWeight = this.weight
      return null
    }

    this.log('Weight: ' + this.weight)

    if (this.approxEqual(this.weight, 0) && this.currentState != STATE.EMPTY_SCALE) {
      this.log("BOTTLE REMOVED FROM SCALE")
      this.currentState = STATE.EMPTY_SCALE

      return { event: 'BOTTLE LIFTED' }
    }
    else if (this.approxEqual(this.weight, this.BOTTLE_WEIGHT.full) && this.currentState == STATE.EMPTY_SCALE) {
      this.log('FULL BOTTLE ON SCALE', { waterLevel: 100 })
      this.currentState = STATE.FULL_BOTTLE

      return { event: 'BOTTLE LOWERED', payload: { waterLevel: 100 } }
    }
    else if (this.approxEqual(this.weight, this.BOTTLE_WEIGHT.empty) && this.currentState == STATE.EMPTY_SCALE) {
      this.currentState = STATE.EMPTY_BOTTLE
      this.log('empty bottle on scale')

      return { event: 'BOTTLE LOWERED', payload: { waterLevel: 0 } }
    }
    else if (this.weight > (this.BOTTLE_WEIGHT.empty + this.TOLERANCE_GRAMS) && this.currentState == STATE.EMPTY_SCALE) {
      this.currentState = STATE.PARTIALLY_FULL_BOTTLE
      this.log('bottle on scale')

      const waterMl = this.weight - this.BOTTLE_WEIGHT.empty
      const level = waterMl / this.MAX_BOTTLE_CAPACITY * 100
      this.log('water level: ' + level)

      return { event: 'BOTTLE LOWERED', payload: { waterLevel: level } }
    }
    return null
  }

  approxEqual(v1, v2) {
    return Math.abs(v1 - v2) < this.TOLERANCE_GRAMS
  }

  scaleHasStabilised() {
    return this.approxEqual(this.prevWeight, this.weight)
  }

  log(str) {
    if(this.debug) {
      console.log(str)
    }
  }
}

module.exports = ScaleMonitor
