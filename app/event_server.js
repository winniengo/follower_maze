import net from 'net';
import * as Clients from './clients';

const _eventHandler = function(socket) {
  console.log(`Event sever running on port 9090`);

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

export default net.createServer(_eventHandler);
