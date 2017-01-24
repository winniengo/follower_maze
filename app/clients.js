const clients = {}; // object storing all connected clients by id

const _notifyClient = (id, event) => {
  const client = clients[id];
  if (client && client.socket)
    client.socket.write(`${event}\r\n`);
};

export const addClient = (id, socket) => {
  clients[id] = {
    socket: socket,
    followers: []
  };
};

export const follow = (followerId, clientId, event) => { // add follower and notify 'to' client
  if (!clients[clientId]) {
    addClient(clientId);
  }

  clients[clientId].followers.push(followerId);
  _notifyClient(clientId, event);
};

export const unfollow = (followerId, clientId) => { // remove follower with no notification
  if (clients[clientId]) {
    const indexOf = clients[clientId].followers.indexOf(followerId);
    if (indexOf !== -1) {
      clients[clientId].followers.splice(indexOf, 1);
    }
  }
};

export const broadcast = event => { // notify all connected clients
  for (var key in clients) {
    _notifyClient(key, event);
  }
};

export const privateMsg = (clientId, event) => { // notify 'to' client
  _notifyClient(clientId, event);
};

export const statusUpdate = (clientId, event) => { // notify followers of 'from' client
  if (clients[clientId]) {
    clients[clientId].followers.forEach(followerId => {
      _notifyClient(followerId, event);
    });
  }
};

//
//
// export default {
//     addClient: function(id, socket) {
//       clients[id] = {
//         socket: socket,
//         followers: []
//       };
//     },
//
//     follow: function(followerId, clientId, event)  {// add follower and notify 'to' client
//       if (!clients[clientId]) {
//         this.addClient(clientId);
//       }
//
//       clients[clientId].followers.push(followerId);
//       _notifyClient(clientId, event);
//
//     },
//
//     unfollow: function(followerId, clientId) { // remove follower with no notification
//       if (clients[clientId]) {
//         const indexOf = clients[clientId].followers.indexOf(followerId);
//         if (indexOf !== -1) {
//           clients[clientId].followers.splice(indexOf, 1);
//         }
//       }
//     },
//
//     broadcast: function(event) { // notify all connected clients
//       for (var key in clients) {
//         _notifyClient(key, event);
//       }
//     },
//
//     privateMsg: function(clientId, event) { // notify 'to' client
//       _notifyClient(clientId, event);
//     },
//
//     statusUpdate: function(clientId, event) { // notify followers of 'from' client
//       if (clients[clientId]) {
//         clients[clientId].followers.forEach(followerId => {
//           _notifyClient(followerId, event);
//         });
//       }
//     }
// };
