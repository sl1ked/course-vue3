module.exports = {
  configureWebpack: {
    devtool: "source-map"
  },
  chainWebpack: (config) => {
    config.module.rule("js").exclude.add(/\.worker\.js$/);

    config.module
      .rule("worker-loader")
      .test(/\.worker\.js$/)
      .use("worker-loader")
      .loader("worker-loader")
      .options({ worker: "SharedWorker" });
  },
};
