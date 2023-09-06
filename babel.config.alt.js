/** @type {import('@babel/core').TransformOptions} */
module.exports = {
  presets: [["module:metro-react-native-babel-preset", { enableBabelRuntime: false }]],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          src: "./src",
        },
      },
    ],
    "/Users/olivier/Projects/forks/react-native-reanimated/plugin/build/plugin.js",
  ],
};
