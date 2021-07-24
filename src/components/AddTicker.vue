<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="tickerName"
            @keydown.enter="add()"
            @input.passive="filterHalper"
            autocomplete="off"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>

        <div
          v-if="searchList.length"
          class="flex bg-white  p-1 rounded-md shadow-md flex-wrap"
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
    <add-button @click="add()" class="my-4 " />
  </section>
</template>

<script>
import AddButton from "./AddButton.vue";
export default {
  components: {
    AddButton
  },
  props: {
    tikersList: {
      type: Array,
      default: () => []
    }
  },
  emits: {
    addTicker: null,
    tickerListLoad: null
  },
  data() {
    return {
      tickerName: "",
      searchList: [],
      loadList: [],
      showValidMesage: false
    };
  },
  methods: {
    add(ticker = this.tickerName) {
      if (!this.includesInArrObjs(this.tikersList, ticker, "name")) {
        this.$emit("addTicker", ticker);
        this.tickerName = "";
      } else {
        this.showValidMesage = true;
      }
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
  mounted: function() {
    fetch("https://min-api.cryptocompare.com/data/all/coinlist?summary=true")
      .then(responce => responce.json())
      .then(
        result =>
          (this.loadList = Object.values(result.Data).sort((a, b) =>
            a.Symbol.localeCompare(b.Symbol)
          ))
      )
      .then(() => this.$emit("tickerListLoad"));
  },
  watch: {
    tickerName() {
      this.searchList = [];
      this.showValidMesage = false;
      if (this.tickerName) {
        this.searchList = this.loadList.filter(el =>
          el.FullName.toUpperCase().includes(this.tickerName.toUpperCase())
        );
        this.searchList = this.searchList.filter(
          el => !this.includesInArrObjs(this.tikersList, el.Symbol, "name")
        );
        this.searchList = this.searchList.slice(0, 4);
      }
    }
  }
};
</script>

<style></style>
