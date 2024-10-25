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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Inicializa el puerto serie
const portName = 'COM6'; // Cambia esto por el puerto correcto donde está conectado tu Arduino
const serialPort = new SerialPort({
  path: portName,
  baudRate: 9600 // Asegúrate de que este valor coincida con la configuración de tu Arduino
});

// Usar un parser para dividir los datos en líneas
const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Maneja los datos recibidos del puerto serie
parser.on('data', (data) => {
  const message = data.toString();
  console.log('Mensaje recibido del Arduino:', message);

  // Emitir el mensaje a los clientes conectados
  io.emit('rfidMessage', message); // Emitir el mensaje a los clientes a través de WebSocket
});

// Manejar errores del puerto serie
serialPort.on('error', (err) => {
  console.error('Error en el puerto serie:', err.message);
});

// Cuando un cliente se conecta
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  // Manejar la desconexión del cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar el servidor
server.listen(4000, () => {
  console.log('Servidor escuchando en el puerto 4000');
});
