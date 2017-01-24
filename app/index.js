import EventServer from './event_server';
import ClientServer from './client_server';

const CLIENT_PORT = 9099;
const EVENT_PORT = 9090;
const ADDRESS = '127.0.0.1';

EventServer.listen(EVENT_PORT, ADDRESS);
ClientServer.listen(CLIENT_PORT, ADDRESS);
