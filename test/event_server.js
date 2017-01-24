import net from 'net';
import chai from 'chai';
import spies from 'chai-spies'
import * as Clients from '../app/clients';
import EventServer from '../app/event_server';


describe('EventServer', () => {
  const EVENT_PORT = '9090';
  const ADDRESS = '127.0.0.1';

  chai.use(spies);
  const ClientsSpy = chai.spy.on(Clients, 'follow');

  let event, server;
  const eventData = "666|F|60|50\r\n";
  const eventsData = `666|F|60|50\r\n1|U|12|9542532|B\r\n43|P|32|56\r\n634|S|32`;

  // const ClientsSpy = chai.spy(Clients);

  describe('listens for event connections', () => {
    beforeEach(() => {
      server = EventServer.listen(EVENT_PORT, ADDRESS);
    });

    it('accepts a single event connection', done => {
      event = new net.Socket().connect(EVENT_PORT);
      chai.expect(event.write(eventData)).to.equal(true);
      done();
    });

    it('receives event data sent', done => {
      event = new net.Socket().connect(EVENT_PORT);

      const listener = socket => {
        socket.on('data', data => {
          chai.expect(data).to.equal(eventData);
        });
      }

      server.on("connection", listener);
      event.write(eventData);
      done();
    });

    it('handles event data received', done => {

      event = new net.Socket().connect(EVENT_PORT);
      event.write(eventData);

      chai.expect(ClientsSpy).to.have.been.called;
      done();
    });

    it('handles end event', done => {
      const spy = chai.spy(console.log);

      event = new net.Socket().connect(EVENT_PORT);
      event.emit('end');

      chai.expect(spy).to.have.been.called;
      done();
    });
  });
});
