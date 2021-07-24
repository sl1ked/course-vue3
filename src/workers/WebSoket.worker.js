const API_KEY =
  "bbef926e7c0109013f37585828c4092e1ae49d0d2333177e14eac4a0fe1e73db";
const socket_URL = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;

const socket = new WebSocket(socket_URL);
socket.addEventListener("message", el => {
  const { FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(el.data);
  if (newPrice === undefined) {
    return;
  }
  ports.forEach(port => {
    if (subscribers.get(port).includes(currency)) {
      port.postMessage({
        type: "update",
        targetCoin: currency,
        price: newPrice
      });
    }
  });
});

const subscribeToTickerOnWs = tickername => {
  const message = JSON.stringify({
    action: "SubAdd",
    subs: [`5~CCCAGG~${tickername}~USD`]
  });
  if (socket.readyState === socket.OPEN) {
    socket.send(message);
    return;
  }
  socket.addEventListener("open", () => {
    socket.send(message, { once: true });
  });
  //   socket.send();
};

const removesubscribeOnWs = tickername => {
  const message = JSON.stringify({
    action: "SubRemove",
    subs: [`5~CCCAGG~${tickername}~USD`]
  });
  if (socket.readyState === socket.OPEN) {
    socket.send(message);
    return;
  }
};

const ports = [];
const subscribers = new Map();
function allPortsSubscribe() {
  return new Set(...subscribers.values());
}
self.addEventListener(
  "connect",
  function(e) {
    let port = e.ports[0];
    ports.push(port);
    subscribers.set(port, []);

    port.addEventListener(
      "message",
      ev => {
        // let port = ev.ports[0];
        if (ev.data.type === "subscribe") {
          if (subscribers.get(port).includes(ev.data.targetCoin)) {
            return;
          }
          if (!allPortsSubscribe().has(ev.data.targetCoin)) {
            subscribeToTickerOnWs(ev.data.targetCoin);
          }
          subscribers.get(port).push(ev.data.targetCoin);
        }
        if (ev.data.type === "unscribe") {
          subscribers.set(
            port,
            subscribers.get(port).filter(el => el !== ev.data.targetCoin)
          );
          if (!allPortsSubscribe().has(ev.data.targetCoin)) {
            removesubscribeOnWs(ev.data.targetCoin);
          }
        }
      },
      false
    );
    port.start();
  },
  false
);
