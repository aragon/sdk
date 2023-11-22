const { TestEnvironment } = require("jest-environment-jsdom");

module.exports = class CustomTestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();

    if (typeof this.global.TextEncoder === "undefined") {
      const { TextEncoder, TextDecoder } = require("util");
      this.global.TextEncoder = TextEncoder;
      this.global.TextDecoder = TextDecoder;
      this.global.Uint8Array = Uint8Array;
    }
    const { FormData } = require("@web-std/form-data");
    const { File, Blob } = require("@web-std/file");
    const { fetch } = require("@web-std/fetch");
    Object.assign(this.global, { FormData, File, Blob, fetch });
  }
  getVmContext() {
    return super.getVmContext();
  }
};
