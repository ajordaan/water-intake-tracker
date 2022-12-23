const ScaleMonitor = require('../ScaleMonitor')

const BOTTLE_WEIGHT = { empty: 430, full: 900 }

describe('Scale Monitor', () => {
  test('Scale Offset is set correctly', () => {
    const scale = new ScaleMonitor(BOTTLE_WEIGHT)

    expect(scale.scaleOffset).toBeNull()

    scale.readScale(80)
    expect(scale.scaleOffset).toBe(80)

    scale.readScale(50)
    expect(scale.scaleOffset).toBe(80)

    const scaleWithExistingOffset = new ScaleMonitor(BOTTLE_WEIGHT, 0, 0, 50)
    scaleWithExistingOffset.readScale(20)
    expect(scaleWithExistingOffset.scaleOffset).toBe(50)
  })

  test('Weight correctly set', () => {

    const scale = new ScaleMonitor(BOTTLE_WEIGHT, 0, 0, 50)

    scale.readScale(50)

    expect(scale.weight).toBe(0)

    scale.readScale(100)

    expect(scale.weight).toBe(50)
  })

  test('Scale has stabilised', () => {
    const scale = new ScaleMonitor(BOTTLE_WEIGHT, 0, 0, 0)
    const stabilisedSpy = jest.spyOn(scale, 'scaleHasStabilised')

    scale.readScale(20)
    scale.readScale(25)
    expect(stabilisedSpy).toHaveLastReturnedWith(false)

    scale.readScale(25)
    expect(stabilisedSpy).toHaveLastReturnedWith(true)
    scale.readScale(25)
    expect(stabilisedSpy).toHaveLastReturnedWith(true)

    scale.readScale(24)
    expect(stabilisedSpy).toHaveLastReturnedWith(false)
  })

  test('Scale has stabilised - with tolerance', () => {
    const tolerance = 5
    const scale = new ScaleMonitor(BOTTLE_WEIGHT, 0, tolerance, 0)
    const stabilisedSpy = jest.spyOn(scale, 'scaleHasStabilised')

    scale.readScale(20)
    scale.readScale(80)
    expect(stabilisedSpy).toHaveLastReturnedWith(false)
    scale.readScale(120)
    expect(stabilisedSpy).toHaveLastReturnedWith(false)
    scale.readScale(150)
    expect(stabilisedSpy).toHaveLastReturnedWith(false)

    scale.readScale(153)
    expect(stabilisedSpy).toHaveLastReturnedWith(true)
    scale.readScale(154)
    expect(stabilisedSpy).toHaveLastReturnedWith(true)
    scale.readScale(151)
    expect(stabilisedSpy).toHaveLastReturnedWith(true)

    scale.readScale(120)
    expect(stabilisedSpy).toHaveLastReturnedWith(false)
    scale.readScale(100)
    expect(stabilisedSpy).toHaveLastReturnedWith(false)
    scale.readScale(80)
    expect(stabilisedSpy).toHaveLastReturnedWith(false)
    scale.readScale(78)
    expect(stabilisedSpy).toHaveLastReturnedWith(true)
    scale.readScale(76)
    expect(stabilisedSpy).toHaveLastReturnedWith(true)
  })

  test('Tolerance', () => {
    const tolerance = 10
    const scale = new ScaleMonitor(BOTTLE_WEIGHT, 0, tolerance)

    expect(scale.approxEqual(20, 25)).toBe(true)
    expect(scale.approxEqual(20, 30)).toBe(true)
    expect(scale.approxEqual(20, 31)).toBe(false)

    expect(scale.approxEqual(7, 0)).toBe(true)
    expect(scale.approxEqual(0, 0)).toBe(true)
    expect(scale.approxEqual(0, 11)).toBe(false)
    expect(scale.approxEqual(150, 142)).toBe(true)


    const perfectScale = new ScaleMonitor(BOTTLE_WEIGHT, 0)

    expect(perfectScale.approxEqual(1, 1)).toBe(true)
    expect(perfectScale.approxEqual(0, 1)).toBe(false)

  })

  test('States', () => {
    const BOTTLE_WEIGHT = { empty: 430, full: 900 }

    const scale = new ScaleMonitor(BOTTLE_WEIGHT, null, 0, 0)
    scale.stabiliseScale = false

    expect(scale.currentState).toBe('EMPTY_SCALE')

    scale.readScale(BOTTLE_WEIGHT.empty)
    expect(scale.currentState).toBe('EMPTY_BOTTLE')

    scale.readScale(0)
    expect(scale.currentState).toBe('EMPTY_SCALE')

    scale.readScale(BOTTLE_WEIGHT.empty + 1)
    expect(scale.currentState).toBe('PARTIALLY_FULL_BOTTLE')

    scale.readScale(0)

    expect(scale.currentState).toBe('EMPTY_SCALE')

    scale.readScale(BOTTLE_WEIGHT.full)
    scale.readScale(BOTTLE_WEIGHT.full)

    expect(scale.currentState).toBe('FULL_BOTTLE')

    scale.readScale(0)
    expect(scale.currentState).toBe('EMPTY_SCALE')
  })

  test('returning events', () => {
    const BOTTLE_WEIGHT = { empty: 10, full: 20 }

    const scale = new ScaleMonitor(BOTTLE_WEIGHT, null, 0, 0)
    scale.stabiliseScale = false

    scale.readScale(0)
    expect(scale.readScale(BOTTLE_WEIGHT.empty)).toStrictEqual({ event: 'BOTTLE LOWERED', payload: { waterLevel: 0 } })
    expect(scale.readScale(0)).toStrictEqual({ event: 'BOTTLE LIFTED' })
    expect(scale.readScale(BOTTLE_WEIGHT.empty + 5)).toStrictEqual({ event: 'BOTTLE LOWERED', payload: { waterLevel: 50 } })
    expect(scale.readScale(0)).toStrictEqual({ event: 'BOTTLE LIFTED' })
    expect(scale.readScale(BOTTLE_WEIGHT.empty + 8)).toStrictEqual({ event: 'BOTTLE LOWERED', payload: { waterLevel: 80 } })
    expect(scale.readScale(0)).toStrictEqual({ event: 'BOTTLE LIFTED' })
    expect(scale.readScale(BOTTLE_WEIGHT.full)).toStrictEqual({ event: 'BOTTLE LOWERED', payload: { waterLevel: 100 } })
  })

  test('returning events - with stabilisation', () => {
    const BOTTLE_WEIGHT = { empty: 10, full: 20 }

    const scale = new ScaleMonitor(BOTTLE_WEIGHT, null, 0, 0)

    scale.readScale(0)

    expect(scale.readScale(BOTTLE_WEIGHT.empty)).toBeNull()
    expect(scale.readScale(BOTTLE_WEIGHT.empty)).toStrictEqual({ event: 'BOTTLE LOWERED', payload: { waterLevel: 0 } })
    expect(scale.readScale(0)).toBeNull()
    expect(scale.readScale(0)).toStrictEqual({ event: 'BOTTLE LIFTED' })
  })
})
