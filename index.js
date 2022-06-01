const { SerialPort} = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')
const {addDoc, collection} = require('firebase-admin/app')
const { db } =  require('./config/firebase.config');


const d = new Date()

let date = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`
let time = `${d.getHours()}:${d.getMinutes()}`

async function writeTempData(data) {
    await db.collection('temp-readings').add({
        temp: data,
        time: time,
        date: date
    });
}


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
})

port.write('main screen turn on', function(err) {
    if (err) {
      return console.log('Error on write: ', err.message)
    }
    console.log('receiving data..')
})
  
// Open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('Error: ', err.message)
})
