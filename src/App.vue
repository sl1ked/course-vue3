<template>
  <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
    <div
      v-if="showForm"
      class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
    >
      <svg
        class="animate-spin -ml-1 mr-3 h-12 w-12 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
    <div class="container">
      <div class="w-full my-4"></div>
      <section>
        <div class="flex">
          <div class="max-w-xs">
            <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
            >
            <div class="mt-1 relative rounded-md shadow-md">
              <input
                v-model="ticker"
                @keydown.enter="add()"
                @input.passive="filterHalper"
                type="text"
                name="wallet"
                id="wallet"
                class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                placeholder="Например DOGE"
              />
            </div>

            <div
              v-if="searchList.length"
              class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap"
            >
              <span
                @click="add(item.Symbol)"
                v-for="item in searchList"
                :key="item.Symbol"
                class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
              >
                {{ item.Symbol }}
              </span>
            </div>
            <div v-show="showValidMesage" styleclass="text-sm text-red-600">
              Такой тикер уже добавлен
            </div>
          </div>
        </div>
        <button
          @click="add()"
          type="button"
          class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <!-- Heroicon name: solid/mail -->
          <svg
            class="-ml-0.5 mr-2 h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="#ffffff"
          >
            <path
              d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            ></path>
          </svg>
          Добавить
        </button>
      </section>

      <hr class="w-full border-t border-gray-600 my-4" />
      <div>
        Фильтр <input v-model="filterTickers" />

        <button
          v-if="page > 1"
          @click="page = page - 1"
          class="my-4 mx-3 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          назад
        </button>
        <button
          v-if="endPage"
          @click="page = page + 1"
          class="my-4 mx-3 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          вперед
        </button>
      </div>
      <hr class="w-full border-t border-gray-600 my-4" />
      <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div
          v-for="tick of filteredTickers"
          :key="tick.name"
          @click="select(tick)"
          :class="{
            'border-4': sel === tick,
            'bg-red-100': !tick.valid,
            'bg-red-byte': tick.valid
          }"
          class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
        >
          <div class="px-4 py-5 sm:p-6 text-center">
            <dt class="text-sm font-medium text-gray-500 truncate">
              {{ tick.name }}-USD
            </dt>
            <dd class="mt-1 text-3xl font-semibold text-gray-900">
              {{ tick.price }}
            </dd>
          </div>
          <div class="w-full border-t border-gray-200"></div>
          <button
            @click.stop="handleDelete(tick)"
            class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
          >
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="#718096"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path></svg
            >Удалить
          </button>
        </div>
      </dl>
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <price-chart
          v-if="sel"
          @closeGraph="sel = null"
          :selectItemName ="sel.name"
          :priceArray="graph"
          :graphColumnWidth="38"
        />
      </template>
    </div>
  </div>
</template>

<script>
import {
  unsubscribeFromTicker,
  subscribeToTicker,
  chengeValidStyle
} from "./webSoket.js";
import priceChart from "./components/priceChart.vue";

export default {
  name: "App",
  components: {
    priceChart
  },
  data() {
    return {
      ticker: "",
      tickers: [],
      sel: null,
      graph: [],
      searchList: [],
      loadList: [],
      showValidMesage: false,
      showForm: true,
      page: 1,
      filterTickers: ""
    };
  },
  created: function() {
    chengeValidStyle(this.chengeValidStyle);
    const windowData = Object.fromEntries(
      new URL(window.location).searchParams.entries()
    );
    if (windowData.filter) this.filterTickers = windowData.filter;
    if (windowData.page) this.page = windowData.page;

    const data = localStorage.getItem("crypto-list");
    if (data?.length) {
      this.tickers = JSON.parse(data);
      this.tickers.forEach(ticker => {
        subscribeToTicker(ticker.name.toUpperCase(), newPrice =>
          this.updateTiker(ticker.name.toUpperCase(), newPrice)
        );
      });
    }
  },
  computed: {
    filteredTickers() {
      const countTickers = 6;
      return this.filteredItems.slice(
        countTickers * (this.page - 1),
        countTickers * this.page
      );
    },
    filteredItems() {
      return this.tickers.filter(el =>
        el.name.includes(this.filterTickers.toUpperCase())
      );
    },
    countTickers() {
      return 6;
    },
    endPage() {
      return this.filteredItems.length > this.countTickers * this.page;
    }
  },

  mounted: function() {
    fetch("https://min-api.cryptocompare.com/data/all/coinlist?summary=true")
      .then(responce => responce.json())
      .then(
        result =>
          (this.loadList = Object.values(result.Data).sort((a, b) =>
            a.Symbol.localeCompare(b.Symbol)
          ))
      )
      .then(() => (this.showForm = false));
  },
  methods: {
    chengeValidStyle(elementName) {
      this.tickers
        .filter(t => t.name === elementName)
        .forEach(t => (t.valid = false));
    },
    validPrice(price) {
      return price > 1 ? price.toFixed(2) : price.toPrecision(4);
    },
    updateTiker(tickerName, price) {
      this.tickers
        .filter(t => t.name == tickerName)
        .forEach(t => {
          t.price = price;
          if (t === this.sel) {
            this.graph.push(price);
            if (this.graph.length > this.graphWidth) {
              this.graph = this.graph.slice(
                this.graph.length - this.graphWidth + 1
              );
            }
          }
        });
    },
    add(ticker = this.ticker) {
      if (
        this.ticker &&
        !this.includesInArrObjs(this.tickers, ticker, "name")
      ) {
        this.showValidMesage = false;
        const newTicker = {
          name: ticker.toUpperCase(),
          price: "-",
          valid: true
        };
        this.tickers = [...this.tickers, newTicker];
        this.ticker = "";
        subscribeToTicker(newTicker.name, newPrice =>
          this.updateTiker(newTicker.name, newPrice)
        );

        this.searchList = [];
      } else {
        this.showValidMesage = true;
      }
    },
    handleDelete(tickerToRemove) {
      this.tickers = this.tickers.filter(t => t !== tickerToRemove);
      unsubscribeFromTicker(tickerToRemove.name);
    },
    select(ticker) {
      this.sel = ticker;
      this.graph = [];
      // this.$nextTick().then(this.chengeGrapheSize);
    },
    includesInArrObjs(arr, el, tag) {
      let res = false;
      if (arr?.length) {
        arr.forEach(element => {
          if (element[tag].toLowerCase() == el.toLowerCase()) {
            res = !res;
          }
        });
      }
      return res;
    }
  },
  watch: {
    filterTickers() {
      this.page = 1;
    },
    page() {
      window.history.pushState(
        null,
        `Page`,
        `${window.location.pathname}?filter=${this.filterTickers}&page=${this.page}`
      );
    },
    ticker() {
      this.searchList = [];
      this.showValidMesage = false;
      if (this.ticker) {
        this.searchList = this.loadList.filter(el =>
          el.FullName.toUpperCase().includes(this.ticker.toUpperCase())
        );
        this.searchList = this.searchList.filter(
          el => !this.includesInArrObjs(this.tickers, el.Symbol, "name")
        );
        this.searchList = this.searchList.slice(0, 4);
      }
    },
    tickers() {
      localStorage.setItem("crypto-list", JSON.stringify(this.tickers));
      this.sel = null;
    }
  }
};
</script>
<style src="./app.css"></style>
