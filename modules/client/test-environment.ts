const TestEnvironment = require('jest-environment-hardhat/jsdom');

module.exports = class CustomTestEnvironment extends TestEnvironment.default {
  async setup() {
    await super.setup();

    // disable hardhat node logging
    await this.global.hardhat.provider.send('hardhat_setLoggingEnabled', [
      false,
    ]);

    if (typeof this.global.TextEncoder === 'undefined') {
      const {TextEncoder, TextDecoder} = require('util');
      this.global.TextEncoder = TextEncoder;
      this.global.TextDecoder = TextDecoder;
    }
    const {FormData} = require('@web-std/form-data');
    const {File, Blob} = require('@web-std/file');
    const {fetch} = require('@web-std/fetch');
    Object.assign(this.global, {FormData, File, Blob, fetch});
  }
  getVmContext() {
    return super.getVmContext();
  }
};
