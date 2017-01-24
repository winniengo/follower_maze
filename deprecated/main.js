import net from 'net';

const CLIENT_PORT = 9099;
const EVENT_PORT = 9090;
const ADDRESS = '127.0.0.1';

const clients = {};

// send a message to a client
var _notifyClient = function(id, event) {
  const client = clients[id];
  if (client && client.socket)
    client.socket.write(`${event}\r\n`);
}

var Clients = {
    addClient: function(id, socket) {
      clients[id] = {
        socket: socket,
        followers: []
      };
    },

    follow: function(followerId, clientId, event)  {// add follower and notify 'to' client
      if (!clients[clientId]) {
        this.addClient(clientId);
      }

      clients[clientId].followers.push(followerId);
      _notifyClient(clientId, event);

    },

    unfollow: function(followerId, clientId) { // remove follower with no notification
      if (clients[clientId]) {
        const indexOf = clients[clientId].followers.indexOf(followerId);
        if (indexOf !== -1) {
          clients[clientId].followers.splice(indexOf, 1);
        }
      }
    },

    broadcast: function(event) { // notify all connected clients
      for (var key in clients) {
        _notifyClient(key, event);
      }
    },

    privateMsg: function(clientId, event) { // notify 'to' client
      _notifyClient(clientId, event);
    },

    statusUpdate: function(clientId, event) { // notify followers of 'from' client
      if (clients[clientId]) {
        clients[clientId].followers.forEach(followerId => {
          _notifyClient(followerId, event);
        });
      }
    }
};

function _clientHandler(socket) {

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


function _eventHandler(socket) {
  console.log(`Event sever running on port ${EVENT_PORT}`);

  socket.setEncoding('utf8');

  // handle data from client
  socket.on('data', data => {
    const events = data
      .split('\n') // parse data to events
      .filter(e => e) // filter empty events
      .sort((a, b) => a.split('|')[0] - b.split('|')[0]); // sort events by Sequence #

    events.forEach(event => { // handle event given table
      let parsedEvent = event.split('|');

      // switch on Type
      switch(parsedEvent[1]) {
        case "F":
          // add 'from' client to 'to' client's followers
          Clients.follow(parsedEvent[2], parsedEvent[3], event);
          break;
        case "U":
          // remove 'from' client from 'to' client's followers
          Clients.unfollow(parsedEvent[2], parsedEvent[3])
          break;
        case "B":
          // notify all connected clients
          Clients.broadcast(event);
          break;
        case "P":
          // notify 'to' client
          Clients.privateMsg(parsedEvent[3], event);
          break;
        case "S":
          // notify followers of 'from' client
          Clients.statusUpdate(parsedEvent[2], event);
          break;
        default:
          break;
      }
    });
  });

  socket.on('end', () => console.log(`Event server disconnected.`));

  socket.on('error', error => console.error(`[EVENT_ERR] ${error.message}`));
}

const EventServer = net.createServer(_eventHandler);
const ClientServer = net.createServer(_clientHandler);

EventServer.listen(EVENT_PORT, ADDRESS);
ClientServer.listen(CLIENT_PORT, ADDRESS);
