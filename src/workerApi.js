import Worker from "./workers/WebSoket.worker.js";
const tickers = new Map();

const SharedWorker = new Worker();

SharedWorker.port.start();

SharedWorker.port.onmessage = function(e) {
  if (e.data.type === "update") {
    const handler = tickers.get(e.data.targetCoin) || [];
    handler.forEach(fn => fn(e.data.price));
  }
};

export const sendMessage = function(el) {
  SharedWorker.port.postMessage(el);
};
export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || [];
  tickers.set(ticker, [...subscribers, cb]);
  subscribeTickerWorker(ticker);
};

export const unsubscribeFromTicker = ticker => {
  tickers.delete(ticker);
  removeSubscribeWorker(ticker);
  window.ticker = tickers;
};
function subscribeTickerWorker(coinName) {
  SharedWorker.port.postMessage({
    type: "subscribe",
    targetCoin: coinName
  });
}
function removeSubscribeWorker(coinName) {
  SharedWorker.port.postMessage({
    type: "unscribe",
    targetCoin: coinName
  });
}

export const chengeValidStyle = () => {};
