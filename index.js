const { SerialPort} = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline')
const { collection } = require('firebase-admin/app')
const { db } =  require('./config/firebase.config');


//slice data string in to 2 numbers
function sliceData(str) {
    const comaIndex = str.indexOf(',')
    let num1 = parseInt(str.slice(0, comaIndex))
    let num2 = parseInt(str.slice(-comaIndex))

    return [{sensor1:num1}, {sensor2:num2}]
}

const today = new Date()

let dd = String(today.getDate()).padStart(2, '0');
let mm = String(today.getMonth() + 1).padStart(2, '0'); 
let yyyy = today.getFullYear();

let date = yyyy+"-"+ mm +"-"+dd;
let time = `${today.getHours()}:${today.getMinutes()}`

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

const parser = port.pipe(new ReadlineParser())
parser.on('data', (data) => {
    let temp = sliceData(data)
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
