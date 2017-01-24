import net from 'net';
import chai from 'chai';
import spies from 'chai-spies'
import * as Clients from '../app/clients';
import ClientServer from '../app/client_server';

describe('ClientServer', () => {
  const CLIENT_PORT = '9099';
  const ADDRESS = '127.0.0.1';

  chai.use(spies);
  const ClientsSpy = chai.spy.on(Clients, 'addClient');

  let client, server;

  describe('listens for client connections', () => {
    beforeEach(() => {
      server = ClientServer.listen(CLIENT_PORT, ADDRESS);
      Clients.reset();
    });

    afterEach(() => Clients.reset());

    it('accepts single client connection', done => {
      client = new net.Socket().connect(CLIENT_PORT);
      chai.expect(client.write(`2932\r\n`)).to.equal(true);
      done();
    });

    it('accepts multiple client connections', done => {
      for (let id = 1; id < 10; id++) {
        client = new net.Socket().connect(CLIENT_PORT);
        chai.expect(client.write(`${id}\r\n`)).to.equal(true);
      }

      done();
    });

    it('handles client data received', done => {
      for (let id = 1; id < 10; id++) {
        client = new net.Socket().connect(CLIENT_PORT);
      }

      chai.expect(ClientsSpy).to.have.been.called;
      done();
    })
  });
});
