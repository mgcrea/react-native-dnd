import "@testing-library/jest-native/extend-expect";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("react-native-reanimated/lib/commonjs/reanimated2/jestUtils").setUpTests();
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
