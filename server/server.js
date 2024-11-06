const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { SerialPort, ReadlineParser } = require('serialport'); // Incluye ReadlineParser para procesar los datos

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Cambia esto si tu cliente está en otra dirección
    methods: ["GET", "POST"]
  }
});

// Configura el puerto serie
const portName = 'COM6'; // Cambia esto por el puerto donde está conectado tu Arduino
const serialPort = new SerialPort({
  path: portName,
  baudRate: 115200 // Asegúrate de que coincide con la configuración de tu Arduino
});

// Usa un parser para dividir los datos por línea
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Mensaje cuando el puerto serie está abierto
serialPort.on('open', () => {
  console.log(`Puerto serie ${portName} abierto a ${serialPort.baudRate} baudios`);
});

// Manejo de datos recibidos del puerto serie
parser.on('data', (data) => {
  const message = data.toString().trim();
  console.log('Mensaje recibido del Arduino:', message);

  // Emitir el mensaje a todos los clientes conectados
  io.emit('rfidMessage', message);
});

// Manejo de errores en el puerto serie
serialPort.on('error', (err) => {
  console.error('Error en el puerto serie:', err.message);
});

// Cuando un cliente se conecta vía Socket.io
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Escuchar por desconexión del cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Inicia el servidor HTTP
server.listen(4000, () => {
  console.log('Servidor escuchando en el puerto 4000');
});
