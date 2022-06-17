import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

const NS = "pgul";
const noDeclarationFiles = { compilerOptions: { declaration: false } };

export default [
  // iife ver.
  {
    input: "./src/index.ts",
    output: {
      name: NS,
      file: "dist/pgul.js",
      sourcemap: true,
      format: "iife",
    },
    plugins: [
      typescript({
        tsconfigOverride: noDeclarationFiles,
        target: "es5",
      }),
    ],
  },

  // iife-min ver.
  {
    input: "./src/index.ts",
    output: {
      name: NS,
      file: "dist/pgul.min.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfigOverride: noDeclarationFiles,
        target: "es5",
      }),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },

  // esm ver.
  {
    input: "./src/index.ts",
    output: {
      file: "dist/pgul.esm.js",
      format: "esm",
    },
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true,
      }),
    ],
  },
];
