import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
      useESM: true
    }
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/testSetup.ts"],
  testMatch: ["<rootDir>/src/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^src/(.*)\\.js$": "<rootDir>/src/$1.ts"
  },
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"]
};

export default config;
