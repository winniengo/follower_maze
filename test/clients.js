import net from 'net';
import chai from 'chai';
import spies from 'chai-spies'
import * as Clients from '../app/clients';

const fakeSocket = {
  write: function(event) {
    this.notifiedEvent = event;
  }
}

describe('Clients', () => {
  let event, client, socket;

  chai.use(spies);
  const socketWriteSpy = chai.spy.on(fakeSocket, 'write');

  beforeEach(() => Clients.reset());

  afterEach(() => Clients.reset());

  describe('adds a client', () => {
    socket = new net.Socket();

    it ('adds a client to the clients object', done => {
      const prevSize = Clients.size();
      Clients.addClient('101', socket);
      chai.expect(Clients.size()).to.equal(prevSize + 1);
      done();
    });

    it('adds expected client object', done => {
      Clients.addClient('101', socket);
      client = Clients.getClient('101');
      chai.expect(client.socket).to.equal(socket);
      chai.expect(client.followers.length).to.equal(0);
      done();
    });

  });

  describe('broadcasts to all connected clients', () => {
    event = '9542532|B'
    beforeEach(() => {
      Clients.addClient('101', fakeSocket);
      Clients.addClient('102', fakeSocket);
      Clients.addClient('103', fakeSocket);

      Clients.broadcast(event);
    })
    it ('notifies all connected clients', done => {
      chai.expect(socketWriteSpy).to.have.been.called.exactly(3);
      done();
    });

    it ('sends correct event', done => {
      chai.expect(Clients.getClient('101').socket.notifiedEvent).to.equal(`${event}\r\n`);
      chai.expect(Clients.getClient('102').socket.notifiedEvent).to.equal(`${event}\r\n`);
      chai.expect(Clients.getClient('103').socket.notifiedEvent).to.equal(`${event}\r\n`);
      done();
    })

  });

  describe('allows a client to follow another', () => {

    event = '666|F|60|50'

    beforeEach(() => {
      Clients.addClient('50', fakeSocket);
      client = Clients.getClient('50')
    });

    it('adds follower\'s id to the client\'s followers', done => {
      Clients.follow('60', '50', event);

      chai.assert.include(client.followers, '60');
      done();
    });

    it('increases the client\'s followers by 1', done => {
      const prevSize = client.followers.length;
      Clients.follow('60', '50', event);

      chai.expect(client.followers.length).to.equal(prevSize + 1);
      done();
    });

    it('notifies the client of correct event', done => {
      chai.expect(client.socket.notifiedEvent).to.equal(`${event}\r\n`);
      done();
    });

    it('but does not allow a client to follow themself', done => {
      Clients.follow('50', '50', event);

      chai.assert.notInclude(client.followers, '50');
      done();
    });
  });

  describe('allows a client to unfollow another', () => {

    event = '666|U|60|50'

    beforeEach(() => {
      Clients.addClient('50', fakeSocket);
      client = Clients.getClient('50')
    });

    it('removes follower\'s id from the client\'s followers', done => {
      client.followers.push('60');
      Clients.unfollow('60', '50', event);

      chai.assert.notInclude(client.followers, '60');
      done();
    });

    it ('decreases the client\'s followers by 1', done => {
      client.followers.push('60');
      const prevSize = client.followers.length;
      Clients.unfollow('60', '50', event);

      chai.expect(client.followers.length).to.equal(prevSize - 1);
      done();
    });

    it ('does not notify the client', done => {
      client.followers.push('60');
      Clients.unfollow('60', '50', event);

      chai.expect(client.socket.notifiedEvent).to.not.equal(`${event}`);
      done();
    });

    it ('but follower can only unfollow a client they were following', done => {
      const prevSize = client.followers.length;
      Clients.unfollow('60', '50', event);

      chai.expect(client.followers.length).to.equal(prevSize);
      done();
    });
  });

    describe('allows a client to update their status', () => {
      it('notifies all of the client\'s followers', done => {
        Clients.addClient('101', fakeSocket);
        Clients.addClient('102', fakeSocket);
        Clients.addClient('103', fakeSocket);
        client = Clients.getClient('103');

        client.followers.push('101');
        client.followers.push('102');
        event = `634|S|32`;

        Clients.statusUpdate('103', event);

        chai.expect(Clients.getClient('101').socket.notifiedEvent).to.equal(`${event}\r\n`);
        chai.expect(Clients.getClient('102').socket.notifiedEvent).to.equal(`${event}\r\n`);
        done();
      });
    });

    describe('allows a client to message another', () => {
      it('notifies "to" client', done => {
        Clients.addClient('56', fakeSocket);
        event = '43|P|32|56';
        Clients.privateMsg('56', event);

        chai.expect(Clients.getClient('56').socket.notifiedEvent).to.equal(`${event}\r\n`);
        done();
      });
    });
});
