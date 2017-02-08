# Back-end Developer Challenge: Follower Maze Solution


This repo contains an implementation of a socket server that reads events from one event source and forwards the stream of events to corresponding user clients in the correct order. This system is implemented in Node.js with tests implemented using the JS testing framework [Mocha](http://mochajs.org/) and assertion library [Chai](http://chaijs.com/). Babel is used to transpile code into ES6.

Read more about the specific protocol [here](./instructions.md##the-protocol).

## To Run
- Clone repo and navigate to the repo's root.
- Run `npm install` to install these packages specified in the `package.json`:

  ```
  babel-cli v.6.22.2,
  babel-preset-es2015: v.6.22.0
  chai v.3.5.0
  chai-spies v0.7.1
  mocha v.2.0
  ```

- Run `npm start` to start server!

Additional Options:
- Run `npm test` from root to run automated tests.
- In another terminal window, run `./followermaze.sh` to run given test-suite.

## Understanding the Repo

```
- app
  - client_server.js
  - event_server.js
  - clients.js
  - index.js
- test
  - client_server.js
  - event_server.js
  - clients.js
```

### Server

The logic of the socket server is implemented across `app`'s four files.

#### `app/client_server.js`
Exports a `ClientServer` that listens on port `9099` for the id's of multiple connecting clients. It adds new clients to a global `clients` object using `addClient` from `./clients`.

#### `app/event_server.js`
Exports a `EventServer` that listens on port `9090` for events sent by a single event source. It parses the data it receives and handles the five possible event types accordingly (ie. sending each event to the relevant connected client).

For example, the server receives data that might look like this:
```
9027|S|90
9032|S|443
9031|U|143|87
9026|S|877
9030|S|70
9034|S|265
9029|U|800|986
9033|S|357
9028|S|194
9035|F|10|265
9036|S|527
```

To process the raw data into tangible events, the server converts the string into an array where each line is an element. It then filters out empty strings and lastly, sorts the event by their Sequence # to ensure order. Like so:

```
const events = data
  .split('\n')
  .filter(e => e)
  .sort((a, b) => a.split('|')[0] - b.split('|')[0]);
```

It handles the ordered events using a `switch case` statement on their Type. It parses and sends each event accordingly to relevant clients exactly like read. Learn more about the possible events [here](./instructions.md#the-events).

#### `app/client.js`
Defines a global `clients` object that stores objects representing all the clients that are connected to the server and/or are referenced in events. It also exports functions to modify this object.

The `clients` object references each client by their `id` and might look something like this:
```js
{
  /.../,
  '481': { socket: undefined, followers: [] },
  '506': {
    socket: Socket {/.../},
    followers: []
  },
  '507': { socket: undefined, followers: [ '473' ] },
  '510': { socket: undefined, followers: [] },
  '517': { socket: undefined, followers: [ '512' ] },
  '518': {
    socket: Socket {/.../},
    followers: ['1', '101']
  },
  /.../
}
```

The functions used by the `EventServer` and `ClientServer` to modify this object are:

  + `function addClient(id, socket)` - adds a new key-value pair representing a client to the `clients` object such that:

    ```js
    clients[id] = {
        socket: socket,
        followers: []
      }
    ```

    Client objects are initialized with an empty array of followers.
  + `function follow(followerId, clientId, event)` - adds a new follower to the client's array of followers and notifies them of the event.
  + `function unfollow(followerId, clientId)` - removes a follower from the client's array of followers but does not notify them.
  + `function broadcast(event)` - notifies all connected clients of the event.
  + `function privateMsg(clientId, event)` - notifies the client of the event.
  + `function statusUpdate(clientId, event)` - notifies all the followers of the client of the event.

**NB**: Events can reference clients that are *not* connected (ie. `clients[id].socket` is `undefined` ). These clients are added to the `clients` object but **do not receive any notifications** (ie. `clients[id].write` is not called). Any notifications for them are silently ignored. However, they can still be followed and unfollowed.

#### `app/index.js`

Defines the default configuration:

```
const CLIENT_PORT = 9099;
const EVENT_PORT = 9090;
const ADDRESS = '127.0.0.1';
```

Starts the `ClientServer` and `EventServer`. Server is ready to receiving clients and events!

### Tests

Automated test are implemented using:
+ the JS testing framework [Mocha](http://mochajs.org/)
+ and assertion library [Chai](http://chaijs.com/).

Unit and integration tests are written across `test`'s three files.

**NB**: They are run in not pre-determined order.

#### `test/client_server.js`
#### `test/event_server.js`
#### `test/clients.js`

## Future Work
+ More in-depth automated testing
+ Relies on events sent out of order but within a range per stream
