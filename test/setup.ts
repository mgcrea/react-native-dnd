/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import "@testing-library/jest-native/extend-expect";
import "@testing-library/react-native/extend-expect";

require("react-native-reanimated").setUpTests();

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
