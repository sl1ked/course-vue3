const API_KEY =
  "bbef926e7c0109013f37585828c4092e1ae49d0d2333177e14eac4a0fe1e73db";
const socket_URL = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;
const AGGREGATE_INDEX = "5";

const tickers = new Map();

const socket = new WebSocket(socket_URL);

socket.addEventListener("message", el => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(
    el.data
  );
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  const handlers = tickers.get(currency) || [];
  handlers.forEach(fn => fn(newPrice));
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
export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || [];
  tickers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};
export const unsubscribeFromTicker = ticker => {
  tickers.delete(ticker);
  removesubscribeOnWs(ticker);
  window.ticker = tickers;
};
