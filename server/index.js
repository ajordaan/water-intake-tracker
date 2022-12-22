const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { SerialPort } = require('serialport')
const ScaleMonitor = require('./ScaleMonitor')
const serialPortPath = '/dev/tty.usbserial-14540'
const port = new SerialPort({ path: serialPortPath, baudRate: 57600 })

const TOLERANCE_GRAMS = 20
const BOTTLE_WEIGHT = { empty: 430, full: 900 }
const MAX_BOTTLE_CAPACITY = 450
const CLIENT_URL = 'http://localhost:5173'

const scaleMonitor = new ScaleMonitor(BOTTLE_WEIGHT, MAX_BOTTLE_CAPACITY, TOLERANCE_GRAMS)

const io = require("socket.io")(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');
});

port.on('readable', function () {
  const scaleData = parseInt(port.read().toString())
  const result = scaleMonitor.readScale(scaleData)

  if (result) {
    io.emit(result.event, result.payload)
    console.log({ result })
  }
})


server.listen(3000, () => {
  console.log('listening on *:3000');
});
