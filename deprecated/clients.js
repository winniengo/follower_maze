class Clients {
  constructor() {
    this.clients = {};
  }

  _notifyClient(id, event) {
    this.clients[id].socket.write(`${event}\r\n`);
  }

  addClient(id, socket) {
    this.clients[id] = {
      socket: socket,
      followers: []
    };
  }

  follow(event, followerId, clientId) { // add follower and notify 'to' client
    if (this.clients[followerId] && this.clients[clientId]) {
      this.clients[clientId].followers.push(followerId);
      this._notifyClient(clientId, event);
    }
  }

  unfollow(event, followerId, clientId) { // remove follower with no notification
    if (this.clients[followerId] && this.clients[clientId]) {
      const indexOf = this.clients[clientId].followers.indexOf(followerId);
      this.clients[clientId].followers.splice(indexOf, 1);
    }
  }

  broadcast(event) { // notify all connected clients
    for (let id in this.clients) {
      this._notifyClient(id, event);
    }
  }

  privateMessage(event, clientId) { // notify 'to' client
    if (this.clients[clientId]) {
      this._notifyClient(clientId, event);
    }
  }

  statusUpdate(event, clientId) { // notify followers of 'from' client
    if (this.clients[clientId]) {
      this.clients[clientId].followers.forEach(followerId => (
        this._notifyClient(followerId, event)
      ));
    }
  }
}


export default Clients;
