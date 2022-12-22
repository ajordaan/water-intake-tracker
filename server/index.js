const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { SerialPort } = require('serialport')
const serialPortname = '/dev/tty.usbserial-14540'
const port = new SerialPort({ path: serialPortname, baudRate: 57600 })
let scaleOffset = null

const STATE = {
  EMPTY_SCALE: 1,
  EMPTY_BOTTLE: 2,
  FULL_BOTTLE: 3,
  PARTIALLY_FULL_BOTTLE: 4
}

let currentState = STATE.EMPTY_SCALE

const TOLERANCE_GRAMS = 20
const BOTTLE_WEIGHT = { empty: 430, full: 900 }
const MAX_BOTTLE_CAPACITY = 450
let prevWeight = 0

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

port.on('readable', function () {
  const scaleData = parseInt(port.read().toString())
  if(!scaleData) return;

  if(scaleOffset == null) {
    scaleOffset = scaleData
    console.log('scale offset: ' + scaleOffset)
  }

  const weight = scaleData - scaleOffset
  
  if(! approxEqual(prevWeight, weight)) {
    console.log('scale not stable')
    prevWeight = weight
    return
  }

  console.log('Weight: ' + weight)

  if(approxEqual(weight, 0)) {

    if(currentState != STATE.EMPTY_SCALE) {
      console.log("BOTTLE REMOVED FROM SCALE")
      currentState = STATE.EMPTY_SCALE
      io.emit('BOTTLE LIFTED')
    }
  }

  // if(approxEqual(weight, BOTTLE_WEIGHT.empty)) {

  //   if(currentState == STATE.EMPTY_SCALE) {
  //     currentState = STATE.EMPTY_BOTTLE
  //   console.log('EMPTY BOTTLE PLACED ON SCALE')

  //   io.emit('BOTTLE LOWERED', {waterLevel: 0})
  //   }
  // }


  if(weight > (BOTTLE_WEIGHT.empty + TOLERANCE_GRAMS) && currentState == STATE.EMPTY_SCALE) {
    currentState = STATE.EMPTY_BOTTLE
    console.log('bottle on scale')

    const waterMl = weight - BOTTLE_WEIGHT.empty
    const level = waterMl / MAX_BOTTLE_CAPACITY * 100
    console.log('water level: ' + level)

    io.emit('BOTTLE LOWERED', { waterLevel: level })
  }
  else if(approxEqual(weight, BOTTLE_WEIGHT.empty) && currentState == STATE.EMPTY_SCALE) {
    currentState = STATE.EMPTY_BOTTLE
    console.log('empty bottle on scale')
    io.emit('BOTTLE LOWERED', { waterLevel: 0 })

  }

  if(approxEqual(weight, BOTTLE_WEIGHT.full)) {
    console.log('FULL BOTTLE ON SCALE', {waterLevel: 100})
  }
})


server.listen(3000, () => {
  console.log('listening on *:3000');
});

function approxEqual(v1, v2) {
  return Math.abs(v1 - v2) < TOLERANCE_GRAMS
}
