/** @type {import('jest').Config} */
module.exports = {
  preset: "react-native",
  setupFiles: ["./node_modules/react-native-gesture-handler/jestSetup.js"],
  setupFilesAfterEnv: ["./test/setup.ts"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["node_modules/(?!(.pnpm/)?(@?react-native.*|react-native-.*|)/)"],
  testPathIgnorePatterns: ["/.idea/", "/node_modules/", "/example/"],
};
