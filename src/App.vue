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
      <add-ticker
        @addTicker="add"
        @tickerListLoad="showForm = false"
        :tikersList="tickers"
      />
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
              ></path>
            </svg>
            Удалить
          </button>
        </div>
      </dl>
      <template v-if="tickers.length">
        <hr class="w-full border-t border-gray-600 my-4" />
        <price-chart
          v-if="sel"
          @closeGraph="sel = null"
          :selectItemName="sel.name"
          :priceArray="graph"
          :graphColumnWidth="38"
        />
      </template>
    </div>
  </div>
</template>

<script>
// import {

//   chengeValidStyle
// } from "./webSoket.js";
import {
  subscribeToTicker,
  unsubscribeFromTicker,
  chengeValidStyle
} from "./workerApi.js";
import priceChart from "./components/priceChart.vue";
import AddTicker from "./components/AddTicker.vue";

export default {
  name: "App",
  components: {
    priceChart,
    AddTicker
  },
  data() {
    return {
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

  methods: {
    took(ent) {
      console.log(ent);
    },
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
        ticker
        // this.ticker &&
        // !this.includesInArrObjs(this.tickers, ticker, "name")
      ) {
        this.showValidMesage = false;
        const newTicker = {
          name: ticker.toUpperCase(),
          price: "-",
          valid: true
        };
        this.tickers = [...this.tickers, newTicker];
        subscribeToTicker(newTicker.name, newPrice =>
          this.updateTiker(newTicker.name, newPrice)
        );

        // this.searchList = [];
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
