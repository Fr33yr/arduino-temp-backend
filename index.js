import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import http from 'http'
import express from 'express';
import { Server } from 'socket.io'

import { addDoc, collection } from 'firebase/firestore'
import { db } from './firebase.config.js';


const d = new Date()
const app = express()
const server = http.createServer(app)
const io = new Server(server)


let date = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
let time = `${d.getHours()}:${d.getMinutes()}`

function writeTempData(data) {
  addDoc(collection(db, 'temp-readings'), {temp: data, time: time, date: date})
}

server.listen(3000, ()=> {
    console.log('server up');
})


// SERIAL COMMS
const port = new SerialPort({
    path: 'COM3',
    baudRate: 9600
})

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }))
parser.on('data', (data) => {
    let temp = parseInt(data)
    writeTempData(temp)
    console.log(temp)
    io.emit('temp', data)
})

port.write('main screen turn on', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('message written')
})
  
// Open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message)
})
