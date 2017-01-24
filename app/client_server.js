import net from 'net';
import * as Clients from './clients';

const _clientHandler = function(socket) {

  socket.setEncoding('utf8');

  // receive data from client
  socket.on('data', data => {
    // parse data to retrieve client id
    let regex = /(\d*)[\s\S]/;
    let id = regex.exec(data)[0].trim()

    // add client to list of connected clients
    Clients.addClient(id, socket);
  });

  socket.on('error', error => console.error(`[CLIENT_ERR] ${error.message}`));
}

export default net.createServer(_clientHandler);
