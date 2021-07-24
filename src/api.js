// import { entries } from "core-js/core/array";

const API_KEY =
  "bbef926e7c0109013f37585828c4092e1ae49d0d2333177e14eac4a0fe1e73db";
const url_multi = new URL(
  "https://min-api.cryptocompare.com/data/pricemulti?fsyms=tik&tsyms=USD&api_key=123"
);
url_multi.searchParams.set("tsyms", "USD");
url_multi.searchParams.set("api_key", API_KEY);

export const loadAllTikers = () => {
  if (tickers.size === 0) {
    return;
  }
  url_multi.searchParams.set("fsyms", [...tickers.keys()].join(","));
  return fetch(url_multi.toString())
    .then(result => result.json())
    .then(rawData => {
      const updatePrice = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );
      Object.entries(updatePrice).forEach(([currency, newPrice]) => {
        const handlers = tickers.get(currency) || [];
        handlers.forEach(fn => fn(newPrice));
      });
    });
};

const tickers = new Map();

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickers.get(ticker) || [];
  tickers.set(ticker, [...subscribers, cb]);
};
export const unsubscribeFromTicker = ticker => {
  tickers.delete(ticker);
  window.ticker = tickers;
};

setInterval(loadAllTikers, 5e3);

const socket_URL = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`;

const socket = new WebSocket(socket_URL);
socket.send(
  JSON.stringify({
    action: "SubAdd",
    subs: [[...tickers.keys()].join(",")]
  })
);

socket.addEventListener("message",()=>{
  
})
export const backSubscribeTickets = ticker => {
  tickers.delete(ticker);
  window.ticker = tickers;
};