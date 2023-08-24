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
    // "react-native-reanimated/plugin",
  ],
};
