module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.parallelism = 1;
      webpackConfig.cache = false;

      webpackConfig.optimization.minimizer.forEach((plugin) => {
        const name = plugin.constructor.name;
        if (name === "TerserPlugin" || name === "CssMinimizerPlugin") {
          plugin.options.parallel = false;
        }
      });

      webpackConfig.module.rules.forEach((rule) => {
        if (!rule.oneOf) return;

        rule.oneOf.forEach((one) => {
          if (!one.use) return;

          one.use = one.use.filter((loader) => {
            const loaderPath =
              typeof loader === "string" ? loader : loader.loader || "";
            return !loaderPath.includes("thread-loader");
          });
        });
      });

      return webpackConfig;
    },
  },
};