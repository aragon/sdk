// rollup.config.js
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import terser from "@rollup/plugin-terser";
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
  input: "src/index.ts",
  external: [/node_modules/],
  output: [{
    dir: "dist",
    format: "cjs",
    sourcemap: true,
  }, {
    file: "dist/sdk-ipfs.cjs.production.min.js",
    format: "cjs",
    sourcemap: true,
  }, {
    file: "dist/sdk-ipfs.esm.js",
    format: "esm",
    sourcemap: true,
  }],
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
    json(),
    terser({
      ecma: 2020,
    }),
  ],
};
