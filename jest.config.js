module.exports = {
  moduleNameMapper: {
    '^meteor/(.*)': '<rootDir>/.meteorMocks/index.js',
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js"
  },
  "verbose": true,
  "transform": {
    "^.+\\.jsx?$": "babel-jest",
  }
};
