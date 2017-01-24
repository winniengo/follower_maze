"use strict";

import tcp from 'net';

class ClientServer {
  constructor(port, address, clients) {
    this.port = port || 9099;
    this.address = address || '127.0.0.1';
    this.clients = clients;

    this._clientHandler = this._clientHandler.bind(this);
  }

  _clientHandler(socket) {
    socket.setEncoding('utf8');

    socket.on('data', data => {
      const id = data.replace(/[\n\r]*$/, '');
      if (id) {
        this.clients.addClient(id, socket);
      }
    });

    socket.on('error', error => console.error(`Client socket error: ${error.message}`));
  }

  start() {
    this.connection = tcp.createServer(this._clientHandler).listen(this.port, this.address); // start server
    this.connection.on('listening', () => console.log(`Client server running on port ${this.port}`));
  }
}

export default ClientServer;
