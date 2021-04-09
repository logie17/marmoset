const SimplePeer = require('simple-peer');

window.addEventListener('DOMContentLoaded', async e => {
  const gameId = window.location.pathname.split('/').pop();
  const socket = new WebSocket(`ws://localhost:3008/?gameId=${gameId}`);

  socket.addEventListener('open', event => {
  });

  let peer;
  socket.addEventListener('message', async message => {
    const { action, data } = JSON.parse(message.data);
    console.log("action", action);
    console.log("data", data);
    if (action === 'initialize') {
      peer = setupPeerConnection(data.isInitiator, data.signalData);
    } else if (action === 'signal') {
      console.log("Got final signal");
      peer.signal(data);
    }
  });

  function setupPeerConnection(isInitiator, signalData) {
    console.log("setting up peer connection", isInitiator);
    const p = new SimplePeer({
      initiator: isInitiator,
      trickle: false
    });

    if (signalData) {
      p.signal(signalData);
    }

    p.on('signal', data => {
      console.log("recieved signal");
      socket.send(JSON.stringify({
        action: 'signal_bounce',
        data,
      }));
    });

    p.on('connect', () => {
      console.log("Connected!");
      p.send('connected!');
    });

    p.on('data', data => {
      console.log("Received peered data!", data);
    });

    p.on('error', (err) => {
      console.log("peer error", err);
    })
    return p;
  }

  // p.on('error', err => console.log('error', err));


  // document.querySelector('form').addEventListener('submit', ev => {
  //   ev.preventDefault();
  //   p.signal(JSON.parse(document.querySelector('#incoming').value));
  // });

  // p.on('connect', () => {
  //   console.log('CONNECT');
  //   p.send('whatever' + Math.random());
  // });

  // p.on('data', data => {
  //   console.log('data: ' + data);
  // });

});
