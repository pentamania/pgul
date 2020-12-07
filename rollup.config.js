// nodeのpathは使えない？
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";
import { libName, namespace } from "./package.json";

/* plugin options */
const plugins = [
  typescript({
    lib: ["es5", "es6", "dom"],
    target: "es5",
  }),
];
const plugins_min = plugins.concat([
  terser({
    compress: {
      pure_getters: true,
      unsafe: true,
      unsafe_comps: true,
      warnings: false,
    },
  }),
]);

export default [
  // iife ver.
  {
    input: "./src/index.ts",
    output: {
      name: namespace,
      // file: 'dist/pgul.js',
      file: `dist/${libName}.js`,
      sourcemap: true,
      format: "iife",
    },
    plugins: plugins,
  },

  // iife-min ver.
  {
    input: "./src/index.ts",
    output: {
      name: namespace,
      // file: 'dist/pgul.min.js',
      file: `dist/${libName}.min.js`,
      format: "iife",
      sourcemap: true,
    },
    plugins: plugins_min,
  },

  // esm ver.
  {
    input: "./src/index.ts",
    output: {
      // file: 'dist/pgul.esm.js',
      file: `dist/${libName}.esm.js`,
      format: "esm",
    },
    plugins: plugins,
  },
];
