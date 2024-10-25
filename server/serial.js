const { SerialPort, ReadlineParser } = require('serialport');

// Configura el puerto serial
const port = new SerialPort({
  path: 'COM6', // Cambia esto por el puerto correcto donde está conectado tu Arduino
  baudRate: 115200, // Asegúrate de que este valor coincida con la configuración de tu Arduino
});

// Usar un parser para dividir los datos por líneas
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Cuando el puerto serial se abre
port.on('open', () => {
  console.log('Puerto serial abierto');
});

// Maneja los datos recibidos del Arduino
parser.on('data', (data) => {
  const message = data.toString().trim(); // Elimina espacios en blanco o saltos de línea extra
  console.log('Mensaje recibido: ', message);

  // Aquí puedes manejar el mensaje recibido según lo que se espere de los pulsadores
  // Por ejemplo, puedes enviar este dato al servidor o ejecutar alguna lógica.
  
  if (message === '1') {
    console.log('Pulsador 1 presionado');
    // Lógica para el pulsador 1
  } else if (message === '2') {
    console.log('Pulsador 2 presionado');
    // Lógica para el pulsador 2
  } else {
    console.log('Mensaje desconocido: ', message);
  }
});

// Manejar errores en el puerto serial
port.on('error', (err) => {
  console.error('Error en el puerto serial:', err.message);
});
