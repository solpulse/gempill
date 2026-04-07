const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  transformIgnorePatterns: [
    "node_modules/(?!(expo-localization|expo-modules-core|@expo|react-native|@react-native|react-native-reanimated)/)"
  ],
  moduleNameMapper: {
    "^expo-localization$": "<rootDir>/src/utils/__tests__/__mocks__/expo-localization.ts"
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__mocks__/"
  ]
};