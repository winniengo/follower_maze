import chai from 'chai';
import spies from 'chai-spies'
import * as Clients from '../app/clients';

const fakeSocket = {
  write: function(event) {
    this.notificedEvent = event;
  }
}

describe('Clients', () => {
  let client, socket;

  chai.use(spies);
  const socketsSpy = chai.spy.on(fakeSocket, 'write');

  describe('adds a client', () => {
    it ('add a client obejct to the clients object', done => {
      const prevSize = Clients.size();
      Clients.addClient('101', fakeSocket);
      chai.expect(Clients.size()).to.equal(prevSize + 1);
      done();
    });

  });

  it('broadcasts notificiation to all clients', done => {
    Clients.addClient('102', fakeSocket);
    Clients.addClient('103', fakeSocket);

    Clients.broadcast('9542532|B');
    chai.expect(socketsSpy).to.have.been.called;
    done();
  });
});
