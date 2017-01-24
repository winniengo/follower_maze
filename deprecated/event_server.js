"use strict";

import tcp from 'net';
class EventServer {
  constructor(port, address, clients) {
    this.port = port || 9090;
    this.address = address || '127.0.0.1';
    this.clients = clients;

    this._eventHandler = this._eventHandler.bind(this);
  }

  _eventHandler(socket) {
    socket.setEncoding('utf8');

    let eventSrc = (`Event ${socket.remoteAddress}:${socket.remotePort}`); // name client
    console.log(`${eventSrc} connected.`);// display information about client

    socket.on('data', data => { // receive data from client
      const events = data
        .split('\n')
        .sort((e1, e2) => e1.split('|')[0] - e2.split('|')[0]) // sort on Sequence Number

      events.forEach(event => {
        const parsedEvent = event.split('|');

        switch(parsedEvent[1]) { // switch on Type
          case 'F':
            // add 'from' client to 'to' client's followers
            this.clients.follow(event, parsedEvent[2], parsedEvent[3]);
            break;
          case 'U':
            // remove 'from' client from 'to' client's followers
            this.clients.unfollow(event, parsedEvent[2], parsedEvent[3]);
            break;
          case 'B':
            // notify all connected clients
            this.clients.broadcast(event);
            break;
          case 'P':
            // notify 'to' client
            this.clients.privateMessage(event, parsedEvent[3]);
            break;
          case 'S':
            // notify followers of 'from' client
            this.clients.statusUpdate(event, parsedEvent[2]);
            break;
          default:
            break;
        }
      });
    });

    socket.on('end', () => { // receive end event from client
      console.log(`${eventSrc} disconnected.`);
    });

    socket.on('error', error => console.error(`Event socket error: ${error.message}`));
  }

  start() {
    this.connection = tcp.createServer(this._eventHandler).listen(this.port, this.address); // start server
    this.connection.on('listening', () => console.log(`Event server running on port ${this.port}\n`)); // trigger cb of the start method
  }
}

export default EventServer;
