const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['public/javascripts/**/*.js']
    }
  }
});
